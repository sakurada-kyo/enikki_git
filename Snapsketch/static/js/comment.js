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
                closePopup();
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

$(document).on('click', '.delete-comment', function() {
    var commentId = $(this).data('comment-id');

    $.ajax({
        url: '/enikki/comment/delete_comment/',
        type: 'POST',
        data: {
            'comment_id': commentId
        },
        headers: { 'X-CSRFToken': csrftoken }
    })
    .done((data) => {
        if (data.success) {
            // コメント削除成功時の処理（例: コメントを画面から削除）
            $(this).closest('.comment-content').remove();
        } else {
            alert('コメントの削除に失敗しました。');
        }
    })
    .fail((jqXHR, textStatus, errorThrown) => {
        alert('Ajax通信に失敗しました。');
        console.log("jqXHR          : " + jqXHR.status);
        console.log("textStatus     : " + textStatus);
        console.log("errorThrown    : " + errorThrown.message);
    });
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

    // 削除ボタンを追加
    var deleteButton = document.createElement('button');
    deleteButton.setAttribute('class', 'delete-comment');
    deleteButton.setAttribute('data-comment-id', data.comment_data.id);
    deleteButton.innerHTML = '削除';

    commentContent.appendChild(deleteButton);

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
