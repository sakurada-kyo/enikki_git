//----------------------カレンダー生成----------------------
var currentYear, currentMonth;
var currentDate = new Date();
currentYear = currentDate.getFullYear();
currentMonth = currentDate.getMonth();
generateCalendar(currentYear, currentMonth);
handlePostDay()


function generateCalendar(year, month) {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const header = document.createElement("div"); // calendar-headerのタグ
    header.classList.add("calendar-header");
    header.innerHTML = `<span class="current-month">${monthNames[month]} ${year}</span>`;
    calendar.appendChild(header);


    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const daysContainer = document.createElement("div");
    daysContainer.classList.add("calendar-days");

    daysOfWeek.forEach(day => {
        const dayElement = document.createElement("div");
        if(day == "Sat"){
          dayElement.classList.add("Sat")
        }
        if(day == "Sun"){
          dayElement.classList.add("Sun")
        }
        var num = 1;
        dayElement.classList.add("dayOfWeek1");
        dayElement.textContent = day;
        daysContainer.appendChild(dayElement);
    });

    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyDay = document.createElement("div");
        emptyDay.classList.add("day");
        daysContainer.appendChild(emptyDay);
    }
    
    const padCurrentMonth = padZero(currentMonth + 1);
    const datePartial = `${currentYear}-${padCurrentMonth}-`;

    for (let i = 1; i <= daysInMonth; i++) {
        const dayElement = document.createElement("div");
        dayElement.classList.add("day");
        dayElement.textContent = i;
        // iが1桁の場合、前に0を付けて2桁の文字列にする
        const padI = padZero(i);
        const date = `${datePartial}${padI}`
        // datesに含まれているか確認
        if (datesFromDjango.includes(date)) {
          // dayElement.style.backgroundColor = '#ff0000';
          dayElement.setAttribute("data-post","true");
          dayElement.classList.add("new");
        }
        dayElement.setAttribute("data-date", date);
        daysContainer.appendChild(dayElement);
    }

    calendar.appendChild(daysContainer);
}

function handlePostDay() {
  var dayTags = document.querySelectorAll("[data-post]");
  dayTags.forEach((element) => {
    element.addEventListener('click', (event) => {
      ajax_open(event.target)
    })
  })
}

function deletePopup() {
  const popupWrapElem = document.getElementById('popup-wrapper')
  const closeElem = document.getElementById('close')

  popupWrapElem.addEventListener('click',() => {
    popupWrapElem.remove()
  })
  
  closeElem.addEventListener('click',() => {
    closeElem.remove()
  })
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

//----------------------カレンダー生成----------------------

//-----------------------1桁→2桁の処理関数-----------------------
function padZero(num) {
  // 与えられた数値を2桁の文字列に変換して返す関数
  return num.toString().padStart(2, '0');
}
//-----------------------1桁→2桁の処理関数-----------------------



//-----------------------ajax処理-----------------------
function ajax_open(element) {
  const date = $(element).attr('data-date');
  var formData = new FormData($('#calendar-form').get(0))
  formData.append('date',date)
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
          var postsArray = JSON.parse(data.posts); // JSONText→JSONObject
          const fragment = showPosts(postsArray)
          $('#box').append(fragment)
          deletePopup()
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
    const closeElem = document.createElement('div')
    const popupWrapElem = document.createElement('div')
    const popupInsideElem = document.createElement('div')
    const scrollElem = document.createElement('div')

    closeElem.setAttribute('id','close')
    closeElem.innerHTML = '×'

    scrollElem.setAttribute('id','scroll')

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

        scrollElem.appendChild(content); // fragmentの追加する

    });

    popupInsideElem.setAttribute('id','popup-inside')
    popupInsideElem.appendChild(closeElem)
    popupInsideElem.appendChild(scrollElem)

    popupWrapElem.setAttribute('id','popup-wrapper')
    popupWrapElem.setAttribute('style','display: block;')
    popupWrapElem.appendChild(popupInsideElem)

    return popupWrapElem;
}
//-----------------------ポップアップ投稿表示-----------------------

//------------------------タグ生成------------------------
function createAndAppendElement(tagName, className = '', textContent = '') {
  var element = document.createElement(tagName);
  if (className) {
    element.setAttribute('class', className);
  }
  
  element.innerHTML = textContent;
  
  return element;
};
//------------------------タグ生成------------------------

//-----------------------YYYMMDDの形式に変換-----------------------
function formatDate(dateString) {
  var dateObj = new Date(dateString);
  var year = dateObj.getFullYear();
  var month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  var day = dateObj.getDate().toString().padStart(2, '0');
  return year + month + day;
}
//-----------------------YYYMMDDの形式に変換-----------------------

