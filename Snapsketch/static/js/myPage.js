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

//マイページajax処理
$(function () {
    $('.detaiChange1').on('click', function () {
        $.ajax({
            url: 'ajax_myPage/',
            type: 'POST',
            data: {
                'mypage': $('mypage').val(),
                // 'mypage_icon': $('.user_icon').attr('src')
            },
            headers: { 'X-CSRFToken': csrftoken }
        })
            .done((data) => {
                add_comment(data);
            })
            // Ajax通信が失敗したら発動
            .fail((jqXHR, textStatus, errorThrown) => {
                alert('Ajax通信に失敗しました。');
                console.log("jqXHR          : " + jqXHR.status); // HTTPステータスを表示
                console.log("textStatus     : " + textStatus);    // タイムアウト、パースエラーなどのエラー情報を表示
                console.log("errorThrown    : " + errorThrown.message); // 例外情報を表示
            });
    })
});


function add_mypage() {
    var fragment = document.createDocumentFragment();

    for (var cnt = 0; cnt < 2; cnt++) {
        var mypageContent = document.createElement('td');
        var mypageP = document.createElment('p');
        var mypageBtn = document.createElement('button');

        mypageContent.setAttribute("td", "td");
        mypageContent.appendChild(mypageP);
        mypageContent.appendChild(mypageBtn);

    }
    return fragment;
}

$(function () {
    // アイコン変更ボタンがクリックされた時の処理
    $('.avatarChange .change').on('click', function () {
        $('#iconInput').click(); // ファイル選択ダイアログを開く
    });

    // ファイルが選択された時の処理
    $('#iconInput').on('change', function () {
        var formData = new FormData();
        formData.append('user_icon', this.files[0]);

        // Ajaxリクエストを送信してファイルをアップロード
        $.ajax({
            url: '/upload_icon/', // 適切なURLに変更
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            headers: { 'X-CSRFToken': csrftoken },
            success: function (data) {
                // アップロードが成功した場合の処理
                if (data.success) {
                    $('.user_icon').attr('src', data.icon_url);
                    alert('アイコンが変更されました！');
                } else {
                    alert('アップロードに失敗しました。');
                }
            },
            error: function () {
                alert('通信エラーが発生しました。');
            }
        });
    });

    
});

document.addEventListener('DOMContentLoaded', function () {
    // ボタンのクリックイベントを設定
    var editButtons = document.querySelectorAll('.editButton');
    var editField = document.querySelector('.editField');

    // var editButtons1 = document.querySelectorAll('.editButton1');
    // var editField1 = document.querySelector('.editField1');

    console.log(editField);
    // console.log(editField1);

    editButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            // ボタンがクリックされたときの処理
            var buttonValue = button.value; // ボタンのvalue属性を取得

            // 対応する入力フィールドを取得
            var editField;
            if (buttonValue === '1') {
                editField = document.querySelector('.e1');
            } else if (buttonValue === '2') {
                editField = document.querySelector('.e2');
            } else if (buttonValue === '3') {
                editField = document.querySelector('.e3');
            } 

            // 入力フィールドのdisabled属性をトル
            editField.disabled = !editField.disabled;

            // ボタンのテキストを変更
            if (editField.disabled) {
                button.innerText = '編集';
            } else {
                button.innerText = '保存';
            }
        });
    });
    // テキストエリア
    // editButtons1.forEach(function (button){
    //     button.addEventListener('click',function(){
    //         var buttonValue = button.value;

    //         var editField1;
    //         if (buttonValue === '4'){
    //             editField1 = document.querySelector('.e4');
    //         }

    //         editField1.disabled = !editField1.disabled;
            
    //         if (editField1.disabled) {
    //             button.innerText = '編集';
    //         } else {
    //             button.innerText = '保存';
    //         }
    //     })
    // })

});
function move() {
    location.href = '/enikki/friend/';
}