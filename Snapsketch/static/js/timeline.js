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

//-----------------------ajax処理-----------------------
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
    var fragment = demo_article(response.page);
    $('#scroll').append(fragment);
    updates_sign();
    //データがあれば追記
  });
}
//-----------------------ajax処理-----------------------

//-----------------------templateタグ複製-----------------------
function add_article(data){
  const article = document.getElementById("article");
  var article_content;
  data.forEach(element => {
    //複製する
    var article_partial = article.content.cloneNode(true);

    //複製した要素にデータ挿入
    article_partial.querySelector(".content").setAttribute('data-group', element.groupName);
    article_partial.querySelector(".content").setAttribute('data-page', element.page);
    article_partial.querySelector(".user_icon").setAttribute('src', element.userIconPath);
    article_partial.querySelector(".user_name").innerHTML = element.userName;
    article_partial.querySelector(".draw").setAttribute('src', element.drawPath);
    article_partial.querySelector(".diary").innerHTML = element.diary;

    article_content += article_partial;
  });
  return article_content;
}

function demo_article(data){
  console.log("demo_article");

  var scroll = document.querySelector("#scroll");
  var fragment = document.createDocumentFragment();

  for(var cnt=0;cnt<10;cnt++){
    var content = document.createElement('article');
    var contentHeader = document.createElement('div');
    var userIcon = document.createElement('img');
    var userName = document.createElement('p');
    var like = document.createElement('div');
    var likeBtn = document.createElement('button');
    var likeIcon = document.createElement('i');
    var comment = document.createElement('img');
    var drawDiary = document.createElement('section');
    var draw = document.createElement('img');
    var diary = document.createElement('p');

    userIcon.setAttribute("class","user_icon");
    userIcon.setAttribute("src","/static/images/test_icon.jpeg");

    userName.setAttribute("class","user_name");
    userName.innerHTML = "a";

    likeBtn.setAttribute("id","ajax-like");

    likeIcon.setAttribute("class","like");

    like.setAttribute("class","like");

    comment.setAttribute("class","comment");
    comment.setAttribute("src","/static/images/test_icon.jpeg");

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
    content.setAttribute("data-page",data);
    content.appendChild(contentHeader);
    content.appendChild(drawDiary);

    fragment.appendChild(content); // fragmentの追加する

    data++;
  }

  // 最後に追加！
  return fragment;
}
//-----------------------templateタグ複製-----------------------

//-----------------------いいね機能-----------------------
document.querySelector('.like').addEventListener('click', e => {
  console.log("click");
  e.preventDefault();

  $.ajax({
    url: 'ajax_like/',
    type: 'POST',
    data: {
      'articleId':'',
      'userId':'',
    },
    dataType: 'json',
    headers: {'X-CSRFToken': csrftoken}
  })
  .done(function(response){
    // いいね数を書き換える
    const counter = document.getElementById('like-count')
    counter.textContent = response.like_count
    const icon = document.getElementById('like-icon')
    // いいねした時はハートを塗る
    if (response.method == 'create') {
      icon.classList.remove('far')
      icon.classList.add('fas')
      icon.id = 'like-icon'
    } else {
      icon.classList.remove('fas')
      icon.classList.add('far')
      icon.id = 'like-icon'
    }})
    // Ajax通信が失敗したら発動
    .fail( (jqXHR, textStatus, errorThrown) => {
      alert('Ajax通信に失敗しました。');
      console.log("jqXHR          : " + jqXHR.status); // HTTPステータスを表示
      console.log("textStatus     : " + textStatus);    // タイムアウト、パースエラーなどのエラー情報を表示
      console.log("errorThrown    : " + errorThrown.message); // 例外情報を表示
    });
  });
//   fetch(url, {
//     method: 'POST',
//     body: `article_pk={{ article.pk }}`,
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
//       'X-CSRFToken': '{{ csrf_token }}',
//     },
//   }).then(response => {
//     return response.json();
//   }).then(response => {
//     // いいね数を書き換える
//     const counter = document.getElementById('like-count')
//     counter.textContent = response.like_count
//     const icon = document.getElementById('like-icon')
//     // いいねした時はハートを塗る
//     if (response.method == 'create') {
//       icon.classList.remove('far')
//       icon.classList.add('fas')
//       icon.id = 'like-icon'
//     } else {
//       icon.classList.remove('fas')
//       icon.classList.add('far')
//       icon.id = 'like-icon'
//     }
//   }).catch(error => {
//     console.log(error);
//   });
//-----------------------いいね機能-----------------------