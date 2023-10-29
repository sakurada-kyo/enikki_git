window.addEventListener('load', initPaginator());
function initPaginator() {
    $(window).scroll(function() {
      // handle scroll events to update content
      var scroll_pos = $(window).scrollTop();
      var last_scroll = 0;
      if (scroll_pos >= 0.9*($(document).height() - $(window).height())) {
        console.log("if (is_loading==0) loadFollowing()");
      }
      if (scroll_pos <= 0.9*$("#header").height()) {
        console.log("if (is_loading==0) loadPrevious()");
      }
      // Adjust the URL based on the top item shown
      // for reasonable amounts of items
      if (Math.abs(scroll_pos - last_scroll)>$(window).height()*0.1) {
        last_scroll = scroll_pos;
        $(".content").each(function(index) {
          if (mostlyVisible(this)) {

            history.replaceState(null, null,$(this).attr('data-url'))
            // $("#pagination").html($(this).attr("data-pagination"));
            return(false);
          }
        });
      }
    })
}

function mostlyVisible(element) {
    // if ca 25% of element is visible
    var scroll_pos = $(window).scrollTop();
    var window_height = $(window).height();
    var el_top = $(element).offset().top;
    var el_height = $(element).height();
    var el_bottom = el_top + el_height;
    return ((el_bottom - el_height*0.25 > scroll_pos) &&
            (el_top < (scroll_pos+0.5*window_height)));
  }
// -----------------------擬似URL生成-----------------------

// -----------------------画面内スクロール-----------------------
window.addEventListener('load', loadScroll());
function loadScroll(){
    let url = new URL(window.location.href);
    let pathname = location.pathname;
    // console.log(pathname);
    let params = url.searchParams;
    // console.log(params);
    let param1 = params.get('groupName');
    let param2 = params.get('page');
    console.log(groupName + ":" + page);
    if(param1 != null && param2 != null){
        var dataURL = pathname + "?groupName=" + param1 + "&page=" + param2;
        var element = document.querySelector('[data-url="'+ dataURL +'"]');
        console.log("element:"+element);
        if(!element) return;
        console.log("nullじゃない");
        var rect = element.getBoundingClientRect();
        var elemtop = rect.top + window.scrollY;
        document.documentElement.scrollTop = elemtop;
    }
}
// -----------------------画面内スクロール-----------------------

//-----------------------intersection observer api-----------------------


window.addEventListener('load',updates_sign());
function updates_sign(){
  const options = {
    root: null,
    rootMargin: "0px 0px 250px 0px", // 上 右 下 左
    threshold: 0.1
  }

  const callback = (entries) => {
    entries.forEach( (entry) => {
      //監視対象の要素が領域内に入った場合の処理
      if (entry.isIntersecting) {
        alert("監視中");
        //ajax
        ajax_open(entry);
      } else { //監視対象の要素が領域外になった場合の処理
        console.log("監視してない");
      }
    });
  }

  const observer = new IntersectionObserver(callback,options);
  const parent = document.getElementById('scroll');
  var target = parent.lastElementChild;
  observer.observe(target);
}
//-----------------------intersection observer api-----------------------

//-----------------------CSRFトークン-----------------------
function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
          var cookie = jQuery.trim(cookies[i]);
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}

var csrftoken = getCookie('csrftoken');

function csrfSafeMethod(method) {
  // these HTTP methods do not require CSRF protection
  return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$.ajaxSetup({
  beforeSend: function (xhr, settings) {
      if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
          xhr.setRequestHeader("X-CSRFToken", csrftoken);
      }
  }
});
//-----------------------CSRFトークン-----------------------

//-----------------------ajax処理-----------------------
function ajax_open(lastElement){
  $.ajax({
    'url': '{% url "enikki:ajax_timeline" %}',
    'type': 'POST',
    'data': {
        'groupName': lastElement.getAttribute('data-group'),
        'page': lastElement.getAttribute('data-page'),
    },
    'dataType': 'json',
    'headers': {'X-CSRFToken': csrftoken}
  })
  .done(function(response){
    //データがあれば追記
    if(response != null){
      $.each(response, function(index, val) {
        $('#scroll').append(
          
        );
      });
    }else{
      //最新記事なし
      console.log("no_more");
    }
  });
}
//-----------------------ajax処理-----------------------