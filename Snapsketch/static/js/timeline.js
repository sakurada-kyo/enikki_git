// window.addEventListener('load', initPaginator());
function initPaginator() {
  let pathname = location.pathname;
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
        $(".content").each(function(i) {
          if (mostlyVisible(this)) {
            var params = "?groupName=" + $(this).attr("data-group") + "&page=" + $(this).attr("data-page");
            history.replaceState(null, null,pathname+params);
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
    console.log(url);
    let pathname = location.pathname;
    // console.log(pathname);
    let params = url.searchParams;
    // console.log(params);
    let param1 = params.get('groupName');
    let param2 = params.get('page');
    console.log("画面スクロール：" +param1 + ":" + param2);
    if(param1 != null && param2 != null){
        var element = document.querySelector('[data-group="' + param1 + '"][data-page="' + param2 + '"]');
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
    rootMargin: "0px 0px 200px 0px", // 上 右 下 左
    threshold: 0.5
  }

  const callback = (entries) => {
      console.log(entries[0]);
      //監視対象の要素が領域内に入った場合の処理
      if (entries[0].isIntersecting) {
        console.log("監視中");
        //ajax
        ajax_open(entries[0].target);
      } else { //監視対象の要素が領域外になった場合の処理
        console.log("監視してない");
      }
  }

  const observer = new IntersectionObserver(callback,options);
  const parent = document.getElementById("scroll");
  if(!parent) return;
  var target = parent.lastElementChild;
  console.log("target:"+target);
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

//-----------------------タイムラインajax処理-----------------------
function ajax_open(lastElement){
  console.log("page:"+$(lastElement).attr('data-page'));
  $.ajax({
    url: 'ajax_timeline/',
    type: 'POST',
    data: {
        'groupName': $(lastElement).attr('data-group'),
        'page': String($(lastElement).attr('data-page')),
    },
    dataType: 'json',
    headers: {'X-CSRFToken': csrftoken}
  })
  .done(function(response){
    var fragment = add_article(response);
    $('#scroll').append(fragment);
    updates_sign();
    //データがあれば追記
  })
  .fail( (jqXHR, textStatus, errorThrown) => {
    alert('Ajax通信に失敗しました。');
    console.log("jqXHR          : " + jqXHR.status); // HTTPステータスを表示
    console.log("textStatus     : " + textStatus);    // タイムアウト、パースエラーなどのエラー情報を表示
    console.log("errorThrown    : " + errorThrown.message); // 例外情報を表示
  });
}
//-----------------------ajax処理-----------------------

//-----------------------templateタグ複製-----------------------
function add_article(data){
  var page = data.page;
  var isUserLiked = data.isUserLiked;
  var fragment = document.createDocumentFragment();

  console.log("isUserLiked:"+isUserLiked);

  for(var cnt=0;cnt<10;cnt++){
    var content = document.createElement('article');
    var contentHeader = document.createElement('div');
    var userIcon = document.createElement('img');
    var userName = document.createElement('p');
    var like = document.createElement('div');
    var likeBtn = document.createElement('button');
    var likeIcon = document.createElement('i');
    var likeCount = document.createElement('span');
    var comment = document.createElement('div');
    var commentIcon = document.createElement('i');
    var commentCount = document.createElement('span');
    var drawDiary = document.createElement('section');
    var draw = document.createElement('img');
    var diary = document.createElement('p');

    userIcon.setAttribute("class","user_icon");
    userIcon.setAttribute("src","/static/images/test_icon.jpeg");

    userName.setAttribute("class","user_name");
    userName.innerHTML = "a";

    //すでにいいねしているか
    if(isUserLiked){
      likeIcon.setAttribute("class","fas fa-heart text-danger");
    }else{
      likeIcon.setAttribute("class","far fa-heart text-danger");
    }

    likeBtn.setAttribute("class","ajax-like");
    likeBtn.appendChild(likeIcon);

    likeCount.setAttribute("class","like-count");
    likeCount.innerHTML = "0";

    like.setAttribute("class","like");
    like.appendChild(likeBtn);
    like.appendChild(likeCount);

    commentIcon.setAttribute("class","fa-regular fa-comment");

    commentCount.setAttribute("class","comment-count");
    commentCount.innerHTML = "0";

    comment.setAttribute("class","comment");
    comment.appendChild(commentIcon);
    comment.appendChild(commentCount);

    contentHeader.setAttribute("class","content_header");
    contentHeader.appendChild(userIcon);
    contentHeader.appendChild(userName);
    contentHeader.appendChild(like);
    contentHeader.appendChild(comment);

    draw.setAttribute("class","draw");
    draw.setAttribute("src","/static/images/test_icon.jpeg");

    diary.setAttribute("class","diary");
    diary.innerHTML = "a";

    drawDiary.setAttribute("class","draw_diary");
    drawDiary.appendChild(draw);
    drawDiary.appendChild(diary);

    content.setAttribute("class","content");
    content.setAttribute("data-group","group");
    content.setAttribute("data-page",page);
    content.appendChild(contentHeader);
    content.appendChild(drawDiary);

    fragment.appendChild(content); // fragmentの追加する

    page++;
  }

  // 最後に追加！
  return fragment;
}
//-----------------------templateタグ複製-----------------------

//-----------------------いいね機能-----------------------
document.querySelector('.ajax-like').addEventListener('click', e => {
  alert("click¥n要素:"+e.target);
  console.log()
  e.preventDefault();

  $.ajax({
    url: 'ajax_like/',
    type: 'POST',
    data: {
      'enikkiId':'xxxxx',
      'userId':'uuuuu',
    },
    dataType: 'json',
    headers: {'X-CSRFToken': csrftoken}
  })
  .done(function(response){
    // いいね数を書き換える
    // いいねした時はハートを塗る
    if (response.method == 'create') {
      e.target.classList.remove('far')
      e.target.classList.add('fas')
    } else {
      e.target.classList.remove('fas')
      e.target.classList.add('far')
    }})
    // Ajax通信が失敗したら発動
    .fail( (jqXHR, textStatus, errorThrown) => {
      alert('Ajax通信に失敗しました。');
      console.log("jqXHR          : " + jqXHR.status); // HTTPステータスを表示
      console.log("textStatus     : " + textStatus);    // タイムアウト、パースエラーなどのエラー情報を表示
      console.log("errorThrown    : " + errorThrown.message); // 例外情報を表示
    });
  });
//-----------------------いいね機能-----------------------

//-----------------------コメント機能-----------------------

//-----------------------コメント機能-----------------------

//-----------------------グループ追加機能-----------------------
window.addEventListener('load',showPopup());
function showPopup(){
  const plusBtn = document.querySelector('.fa-plus');
  const popupWrapper = document.getElementById('popup-wrapper');
  const close = document.getElementById('close');

  // ボタンをクリックしたときにポップアップを表示させる
  plusBtn.addEventListener('click', () => {
    popupWrapper.style.display = "block";
  });

  // ポップアップの外側又は「x」のマークをクリックしたときポップアップを閉じる
  popupWrapper.addEventListener('click', e => {
    if (e.target.id === popupWrapper.id || e.target.id === close.id) {
      popupWrapper.style.display = 'none';
    }
  });

  $('#group-form').on('submit', function(e) {
    e.preventDefault();
    console.log('送信');

    var formData = new FormData($('#group-form').get(0));
    if(!formData){
      console.log("this:"+$(this))
      console.log(formData)
    }
    $.ajax({
        'url': $(this).prop('action'),
        'type': $(this).prop('method'),
        'data': formData,
        'dataType': 'json',
        'processData': false,
        'contentType': false,
    })
    .done(function(response) {
      console.log(response)
        const fragment = addGroup(response);
        // $('#group-nav:nth-last-child(2)').append(fragment);
        $('#group-nav .group-icon:last').after(fragment);
    })
    // Ajax通信が失敗したら発動
    .fail( (jqXHR, textStatus, errorThrown) => {
      alert('Ajax通信に失敗しました。');
      console.log("jqXHR          : " + jqXHR.status); // HTTPステータスを表示
      console.log("textStatus     : " + textStatus);    // タイムアウト、パースエラーなどのエラー情報を表示
      console.log("errorThrown    : " + errorThrown.message); // 例外情報を表示
    });
});
}

function addGroup(data) {
  console.log("addGroup");
  const groupNav = document.getElementById("group-nav");
  const groupIcon = document.createElement("img");
  const fragment = document.createDocumentFragment();
  const groupIconPath = data.filePath;

  console.log(groupIconPath);

  groupIcon.setAttribute("class","group-icon");
  groupIcon.setAttribute("src",groupIconPath);

  fragment.appendChild(groupIcon);

  return fragment;

}
//-----------------------グループ追加機能-----------------------