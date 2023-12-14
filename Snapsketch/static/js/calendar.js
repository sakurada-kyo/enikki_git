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

    for (let i = 1; i <= daysInMonth; i++) {
        const dayElement = document.createElement("div");
        dayElement.classList.add("day");
        dayElement.textContent = i;
        dayElement.setAttribute("data-date", `${currentYear}${currentMonth + 1}${i}`);
        daysContainer.appendChild(dayElement);
    }

    calendar.appendChild(daysContainer);
}

function showPreviousMonth() {
    updateCalendar();
}


function showNextMonth() {
    updateCalendar();
}

function updateCalendar() {
    
}

var dayTags = document.querySelectorAll(".day");
console.log(dayTags);
dayTags.forEach(element => {
    element.addEventListener("click", () => {
        ajax_open(element);
    });
});


var currentDate = new Date();
currentYear = currentDate.getFullYear();
currentMonth = currentDate.getMonth();
generateCalendar(currentYear, currentMonth);
generateCalendar(currentDate.getFullYear(), currentDate.getMonth());

var form = document.getElementById("form");

var dayTags = document.querySelectorAll(".day");
console.log(dayTags);
dayTags.forEach(element => {
    element.addEventListener("click", () => {
        date = element.getAttribute("data-date");
        const fd = new FormData(form);
        fd.append('date', date);
        for (let d of fd) {
            console.log(`${d[0]}: ${d[1]}`);
        }
        form.submit()
    });
});

//----------------------ポップアップ表示フェード----------------------
$(function () {
    $('.day').click(function(){
        $('#popup').fadeIn();
    });
    $('#close , #popBg').click(function(){
      $('#popup').fadeOut();
    });
  });
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

//-----------------------タイムラインajax処理-----------------------
function ajax_open(element) {
console.log("page:" + $(element).attr('data-date'));
date = $(element).attr('data-date');
$.ajax({
    url: '/enikki/ajax_calendar/',
    type: 'POST',
    data: {
    'date': date,
    },
    dataType: 'json',
    headers: { 'X-CSRFToken': csrftoken }
})
    .done(function (data) {
    if ('error' in data) {
        console.log(data.error);
    } else {
        var fragment = showPosts(data);
    }
    })
    .fail((jqXHR, textStatus, errorThrown) => {
    alert('Ajax通信に失敗しました。');
    console.log("jqXHR          : " + jqXHR.status); // HTTPステータスを表示
    console.log("textStatus     : " + textStatus);    // タイムアウト、パースエラーなどのエラー情報を表示
    console.log("errorThrown    : " + errorThrown.message); // 例外情報を表示
    });
}
//-----------------------タイムラインajax処理-----------------------

//-----------------------ポップアップ投稿表示-----------------------
function showPosts(posts){
    var fragment = document.createDocumentFragment();
    posts.forEach(post => {
        const postSketchPath = post.sketch_path; // 絵パス情報を取得
        const postDiary = post.diary; // 日記情報を取得
        const postUserName = post.user__username; // ユーザー名情報を取得
        const postLikeCount = post.likeCount; // いいね数情報を取得
        const postCommentCount = post.commentCount; // コメント数情報を取得
        const postPage = post.page; //ページ番号取得
        const isLiked = post.is_liked; // いいね情報を取得
        const postUserIcon = post.user__user_icon_path; // ユーザーアイコン


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