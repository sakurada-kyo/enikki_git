$(function () {
    $('#toukou').on('click', function () {
        $.ajax({
            url: '/enikki/comment/ajax_comment/',
            type: 'POST',
            data: {
                'comment': $('#comment').val()
            },
            headers: { 'X-CSRFToken': csrftoken }
        })
            .done((data) => {
                const fragment = add_comment(data);
                $('.comment-area').append(fragment);
            })
            // Ajax通信が失敗したら発動
            .fail((jqXHR, textStatus, errorThrown) => {
                alert('Ajax通信に失敗しました。');
                console.log("jqXHR          : " + jqXHR.status); // HTTPステータスを表示
                console.log("textStatus     : " + textStatus);    // タイムアウト、パースエラーなどのエラー情報を表示
                console.log("errorThrown    : " + errorThrown.message); // 例外情報を表示
        });
    });
});

// CSRFトークン
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

function add_comment(data) {
    console.log(`username:${data.comment_data.username}`);
    var fragment = document.createDocumentFragment();

    var commentContent = document.createElement('div');
    var commentIcon = document.createElement('img');
    var commentName = document.createElement('span');
    var commentSentence = document.createElement('span');
    var br = document.createElement('br');

    const username = data.comment_data.username;
    const usericon = data.comment_data.usericon;
    const comment = data.comment_data.comment;

    commentIcon.setAttribute("class", "user-icon");
    commentIcon.setAttribute("src", `${usericon}`);

    commentName.setAttribute("class", "comment-name");
    commentName.innerHTML = username;

    commentSentence.setAttribute("class", "comment-sentence");
    commentSentence.innerHTML = comment;

    commentContent.setAttribute("class", "comment-content");
    commentContent.appendChild(commentIcon);
    commentContent.appendChild(commentName);
    commentContent.appendChild(br);
    commentContent.appendChild(commentSentence);

    fragment.appendChild(commentContent);

    return fragment;
}

$(function () {
    $('.reply').click(function () {
        var fragment = add_comment();
        $('.comment_area').append(fragment);
        closePopup();
    })
})

function closePopup() {
    document.getElementById('open').checked = false;
}
