// window.addEventListener('load', initPaginator());
function initPaginator() {
  let pathname = location.pathname;
  $(window).scroll(function () {
    // handle scroll events to update content
    var scroll_pos = $(window).scrollTop();
    var last_scroll = 0;
    if (scroll_pos >= 0.9 * ($(document).height() - $(window).height())) {
      console.log("if (is_loading==0) loadFollowing()");
    }
    if (scroll_pos <= 0.9 * $("#header").height()) {
      console.log("if (is_loading==0) loadPrevious()");
    }
    // Adjust the URL based on the top item shown
    // for reasonable amounts of items
    if (Math.abs(scroll_pos - last_scroll) > $(window).height() * 0.1) {
      last_scroll = scroll_pos;
      $(".content").each(function (i) {
        if (mostlyVisible(this)) {
          var params = "?groupName=" + $(this).attr("data-group") + "&page=" + $(this).attr("data-page");
          history.replaceState(null, null, pathname + params);
          return (false);
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
  return ((el_bottom - el_height * 0.25 > scroll_pos) &&
    (el_top < (scroll_pos + 0.5 * window_height)));
}
// -----------------------擬似URL生成-----------------------

// -----------------------画面内スクロール-----------------------
window.addEventListener('load', loadScroll());
function loadScroll() {
  let url = new URL(window.location.href);
  console.log(url);
  let pathname = location.pathname;
  let params = url.searchParams;
  let param1 = params.get('groupName');
  let param2 = params.get('page');
  if (param1 != null && param2 != null) {
    var element = document.querySelector('[data-group="' + param1 + '"][data-page="' + param2 + '"]');
    console.log("element:" + element);
    if (!element) return;
    console.log("nullじゃない");
    var rect = element.getBoundingClientRect();
    var elemtop = rect.top + window.scrollY;
    document.documentElement.scrollTop = elemtop;
  }
}
// -----------------------画面内スクロール-----------------------

//-----------------------intersection observer api-----------------------


window.addEventListener('scroll', updates_sign());
function updates_sign() {
  const parent = document.getElementById("scroll");
  var target = parent.lastElementChild;
  if(!target) return;
  console.log("target:" + target);
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

  const observer = new IntersectionObserver(callback, options);
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
function ajax_open(lastElement) {
  console.log("page:" + $(lastElement).attr('data-page'));
  $.ajax({
    url: 'ajax_timeline/',
    type: 'POST',
    data: {
      'group': $(lastElement).attr('data-group'),
      'page': String($(lastElement).attr('data-page')),
    },
    dataType: 'json',
    headers: { 'X-CSRFToken': csrftoken }
  })
    .done(function (data) {
      const allPagesData = data.all_pages_data;
      if (allPagesData !== null) {
        // データがnullでない場合の処理
        var fragment = add_article(allPagesData);
        $('#scroll').append(fragment);
        updates_sign();
      }
    })
    .fail((jqXHR, textStatus, errorThrown) => {
      alert('Ajax通信に失敗しました。');
      console.log("jqXHR          : " + jqXHR.status); // HTTPステータスを表示
      console.log("textStatus     : " + textStatus);    // タイムアウト、パースエラーなどのエラー情報を表示
      console.log("errorThrown    : " + errorThrown.message); // 例外情報を表示
    });
}
//-----------------------ajax処理-----------------------

//-----------------------templateタグ複製-----------------------
function add_article(allPagesData) {
  var fragment = document.createDocumentFragment();

  if (Array.isArray(allPagesData)) {
    for (const pageData of allPagesData) {
      const posts = JSON.parse(pageData.data);// 'data' をJavaScriptオブジェクトに変換
      const group = pageData.group;

      // このページの投稿データを処理
      posts.forEach(post => {
        const postSketchPath = post.fields.sketch_path; // 絵パス情報を取得
        const postDiary = post.fields.diary; // 日記情報を取得
        const postUserName = post.fields.user.username; // ユーザー名情報を取得
        const postLikeCount = post.fields.likeCount; // いいね数情報を取得
        const postCommentCount = post.fields.commentCount; // コメント数情報を取得
        const page = post.fields.page
        const isLiked = post.fields.is_liked; // いいね情報を取得

        var content = createAndAppendElement('article', 'content', '');

        var contentHeader = createAndAppendElement('div', 'content_header', '');
        content.appendChild(contentHeader);

        var userIcon = createAndAppendElement('img', 'user_icon');
        userIcon.setAttribute('src', '');//ユーザーアイコン
        contentHeader.appendChild(userIcon);

        var userName = createAndAppendElement('p', 'user_name', postUserName);
        contentHeader.appendChild(userName);

        var like = createAndAppendElement('div', 'like', '');
        contentHeader.appendChild(like);

        var likeBtn = createAndAppendElement('button', 'ajax-like', '');
        like.appendChild(likeBtn);

        var likeIcon = createAndAppendElement('i', isLiked ? 'fas fa-heart text-danger' : 'far fa-heart text-danger', '');
        likeBtn.appendChild(likeIcon);

        var likeCount = createAndAppendElement('span', 'like-count', postLikeCount);
        like.appendChild(likeCount);

        var comment = createAndAppendElement('div', 'comment', '');
        contentHeader.appendChild(comment);

        var commentIcon = createAndAppendElement('i', 'fa-regular fa-comment', '');
        comment.appendChild(commentIcon);

        var commentCount = createAndAppendElement('span', 'comment-count', postCommentCount);
        comment.appendChild(commentCount);

        var drawDiary = createAndAppendElement('section', 'draw_diary', '');
        content.appendChild(drawDiary);

        var draw = createAndAppendElement('img', 'draw');
        draw.setAttribute('src', postSketchPath);
        drawDiary.appendChild(draw);

        var diary = createAndAppendElement('p', 'diary', postDiary);
        drawDiary.appendChild(diary);

        content.setAttribute('data-group', group);
        content.setAttribute('data-page', page);

        fragment.appendChild(content); // fragmentの追加する


      });
      if (!pageData.has_next) break;
    };
  }

  // 最後に追加！
  return fragment;
}

//タグ生成
function createAndAppendElement(tagName, className = '', textContent = '') {
  var element = document.createElement(tagName);
  if (className) {
    element.setAttribute('class', className);
  }
  if (textContent) {
    element.innerHTML = textContent;
  }
  return element;
};
//-----------------------templateタグ複製-----------------------

//-----------------------いいね機能-----------------------
var likeBtn = document.querySelector('.ajax-like');
if (likeBtn) {
  likeBtn.addEventListener('click', e => {
    var parent = e.currentTarget;
    var parentContent = parent.closest(".content");
    console.log(parent);
    var likeCount = parent.nextElementSibling.innerHTML;
    e.preventDefault();

    $.ajax({
      url: 'ajax_like/',
      type: 'POST',
      data: {
        'page': $(parentContent).attr('data-page'),
        'group': $(parentContent).attr('data-group'),
        'likeCount': likeCount,
      },
      dataType: 'json',
      headers: { 'X-CSRFToken': csrftoken }
    })
      .done(function (response) {
        // いいね数を書き換える
        // いいねした時はハートを塗る
        if (response.method == 'create') {
          e.target.classList.remove('far')
          e.target.classList.add('fas')
        } else {
          e.target.classList.remove('fas')
          e.target.classList.add('far')
        }
      })
      // Ajax通信が失敗したら発動
      .fail((jqXHR, textStatus, errorThrown) => {
        alert('Ajax通信に失敗しました。');
        console.log("jqXHR          : " + jqXHR.status); // HTTPステータスを表示
        console.log("textStatus     : " + textStatus);    // タイムアウト、パースエラーなどのエラー情報を表示
        console.log("errorThrown    : " + errorThrown.message); // 例外情報を表示
      });
  });
}

//-----------------------いいね機能-----------------------

//-----------------------コメント機能-----------------------

//-----------------------コメント機能-----------------------

//-----------------------グループ追加機能-----------------------
window.addEventListener('load', showPopup());
function showPopup() {
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

  $('#group-form').on('submit', function (e) {
    e.preventDefault();
    console.log('送信');

    var formData = new FormData($('#group-form').get(0));

    if (formData != null) {
      console.log("form-data");
    }

    $.ajax({
      'url': $(this).prop('action'),
      'type': $(this).prop('method'),
      'data': formData,
      'dataType': 'json',
      'processData': false,
      'contentType': false,
    })
      .done(function (response) {
        console.log(response)
        if(response){
          const fragment = addGroup(response);
          // $('#group-nav:nth-last-child(2)').append(fragment);
          $('#group-nav .group-icon:last').after(fragment);
        }
      })
      // Ajax通信が失敗したら発動
      .fail((jqXHR, textStatus, errorThrown) => {
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
  const groupIndex = data.addGroupIndex;

  console.log(groupIconPath);

  groupIcon.setAttribute("class", "group-icon");
  groupIcon.setAttribute("src", groupIconPath);

  fragment.appendChild(groupIcon);

  return fragment;

}
//-----------------------グループ追加機能-----------------------
//-----------------------グループ切り替え機能-----------------------
//-----------------------グループ切り替え機能-----------------------