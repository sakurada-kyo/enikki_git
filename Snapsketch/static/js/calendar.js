//----------------------カレンダー生成----------------------
var currentYear, currentMonth;
function generateCalendar(year, month) {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    console.log("月" + daysInMonth, "日" + firstDayOfMonth);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const header = document.createElement("div");
    header.classList.add("calendar-header");
    header.innerHTML = `<span class="current-month">${monthNames[month]} ${year}</span>`;
    calendar.appendChild(header);

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const daysContainer = document.createElement("div");
    daysContainer.classList.add("calendar-days");

    daysOfWeek.forEach(day => {
        const dayElement = document.createElement("div");
        var num = 1;
        dayElement.classList.add("dayOfWeek");
        dayElement.textContent = day;
        daysContainer.appendChild(dayElement);
    });

    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyDay = document.createElement("div");
        emptyDay.classList.add("day");
        daysContainer.appendChild(emptyDay);
    }

    const datePartial = `${currentYear}-${currentMonth + 1}-`;

    for (let i = 1; i <= daysInMonth; i++) {
        const dayElement = document.createElement("div");
        dayElement.classList.add("day");
        dayElement.textContent = i;
        // iが1桁の場合、前に0を付けて2桁の文字列にする
        const padI = padZero(i);
        const date = `${datePartial}${padI}`
        // datesに含まれているか確認
        if (datesFromDjango.includes(date)) {
          dayElement.style.backgroundColor = 'red';
          dayElement.setAttribute("data-post","true");
        }
        dayElement.setAttribute("data-date", date);
        daysContainer.appendChild(dayElement);
    }

    calendar.appendChild(daysContainer);

    var dayTags = document.querySelectorAll("[data-post]");
    dayTags.forEach((element) => {
      element.addEventListener('click', () => {
        console.log('data-post:click');
        $('#popup-wrapper').fadeIn();
        ajax_open(element);
      });
    });
    $('#close , #popup-wrapper').click(function(){
      $('#popup-wrapper').fadeOut();
      // 特定のIDを持つ要素内の全ての子要素を削除
      $('#popup-inside').empty();
    });
}

function showPreviousMonth() {
  if (currentMonth === 0) {
      currentYear--;
      currentMonth = 11;
  } else {
      currentMonth--;
  }
  generateCalendar(currentYear, currentMonth);
}

function showNextMonth() {
  if (currentMonth === 11) {
      currentYear++;
      currentMonth = 0;
  } else {
      currentMonth++;
  }
  generateCalendar(currentYear, currentMonth);
}

var currentDate = new Date();
currentYear = currentDate.getFullYear();
currentMonth = currentDate.getMonth();
generateCalendar(currentYear, currentMonth);
//----------------------カレンダー生成----------------------

//-----------------------1桁→2桁の処理関数-----------------------
function padZero(num) {
  // 与えられた数値を2桁の文字列に変換して返す関数
  return num.toString().padStart(2, '0');
}
//-----------------------1桁→2桁の処理関数-----------------------

//----------------------ポップアップ表示フェード----------------------

//----------------------ポップアップ表示フェード----------------------

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
function ajax_open(element) {
  date = $(element).attr('data-date');
  var formData = new FormData($('#calendar-form').get(0));
  formData.append('date',date);
  $.ajax({
      url: '/enikki/calendar/ajax_calendar/',
      type: 'POST',
      data:formData,
      processData: false,
      contentType: false,
      dataType: 'json',
      headers: { 'X-CSRFToken': csrftoken }
  })
      .done(function (data) {
        
      if ('error' in data) {
          console.log(data.error);
      } else {
          var postsArray = JSON.parse(data.posts);//JSONText→JSONObject
          var fragment = showPosts(postsArray);
          $('#popup-inside').append(fragment);
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

//-----------------------ポップアップ投稿表示-----------------------
function showPosts(posts){
    var fragment = document.createDocumentFragment();
    posts.forEach(function(post){
        const postSketchPath = `/media/${post.post__sketch_path}`; // 絵パス情報を取得
        const postDiary = post.post__diary; // 日記情報を取得
        const postUserName = post.post__user__username; // ユーザー名情報を取得
        const postLikeCount = post.post__like_count; // いいね数情報を取得
        const postCommentCount = post.post__comment_count; // コメント数情報を取得
        const postPage = post.page; //ページ番号取得
        const isLiked = post.is_liked; // いいね情報を取得
        const postUserIcon = `/media/${post.post__user__user_icon_path}`; // ユーザーアイコン


        var content = createAndAppendElement('article', 'content', '');

        var contentHeader = createAndAppendElement('div', 'content_header', '');
        content.appendChild(contentHeader);

        var userIcon = createAndAppendElement('img', 'user_icon');
        userIcon.setAttribute('src', postUserIcon);//ユーザーアイコン
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

        content.setAttribute('data-page', postPage);

        fragment.appendChild(content); // fragmentの追加する
        
    });

    return fragment;
}
//-----------------------ポップアップ投稿表示-----------------------

 //------------------------タグ生成------------------------
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
  //------------------------タグ生成------------------------

  //-----------------------いいね機能-----------------------
  var likeBtn = document.querySelector('.ajax-like');
  if (likeBtn) {
    likeBtn.addEventListener('click', e => {
      var parent = e.currentTarget;
      var parentContent = parent.closest(".content");
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

//-----------------------YYYMMDDの形式に変換-----------------------
function formatDate(dateString) {
  var dateObj = new Date(dateString);
  var year = dateObj.getFullYear();
  var month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  var day = dateObj.getDate().toString().padStart(2, '0');
  return year + month + day;
}
//-----------------------YYYMMDDの形式に変換-----------------------

