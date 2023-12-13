
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

//アイコン編集
$(function () {
    $('#iconInput').click(); // ファイル選択ダイアログを開く

    // ファイルが選択された時の処理
    $('#iconInput').on('change', function () {
        var formData = new FormData();
        formData.append('user_icon', this.files[0]);

        // Ajaxリクエストを送信してファイルをアップロード
        $.ajax({
            url: '/enikki/ajax_mypage_icon/', // 適切なURLに変更
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

//メールアドレス、名前編集のajax
function mypage_detail_ajax(data,flg,button,editField){
    $.ajax({
        url: '/enikki/ajax_mypage_detail/', // 適切なURLに変更
        type: 'POST',
        data:{
            'data':data,
            'flg':flg
        },
        headers: { 'X-CSRFToken': csrftoken },
        success: function (data) {
            if (data.error) {
                var error = data.error
                console.log(`${error}`);
            } else {
                var msg = data.msg;
                if(flg){
                    // ユーザー名更新
                    var usernameField = $(button).closest('tr').find('.e1');
                    usernameField.val(data);
                    usernameField.prop('disabled', true);
                }else{
                    var emailField = $(button).closest('tr').find('.e2');
                    emailField.val(data);
                    emailField.prop('disabled', true);
                }

                $(button).text('編集');
                $(editField).prop('disabled', true);

                alert(`${msg}`);
            }
        },
        error: function () {
            alert('通信エラーが発生しました。');
        }
    });
}

$(function () {
    // 編集ボタンがクリックされた時の処理
    $('.editButton').on('click', function() {
        var button = $(this);
        var buttonValue = button.val(); // 対応する入力フィールドを取得
        var editField;
        if (buttonValue === '1') {
            editField = document.querySelector('.e1');
        } else if (buttonValue === '2') {
            editField = document.querySelector('.e2');
        }

        // 編集モードと保存モードを切り替える
        if (editField.prop('disabled')) {
            editField.prop('disabled', false);
            button.text('保存');
        } else {
            editField.prop('disabled', true);
            button.text('編集');

            var flg;
            var data;

            if ($(editField).hasClass('e1')) {
                // ユーザー名
                console.log('e1クラスを持っています');
                data = $(editField).val();
                flg = true;
            } else {
                // メールアドレス
                console.log('e1クラスを持っていません');
                data = $(editField).val();
                flg = false;
            }

            mypage_detail_ajax(data,flg,button,editField);
        }
    });
});


function move() {
    location.href = '/enikki/friend/';
}
