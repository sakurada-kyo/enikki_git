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
function mypage_nameEmail_ajax(data,flg,button){
    $.ajax({
        url: '/enikki/ajax_myPage_NameEmail/', // 適切なURLに変更
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
                if(flg){
                    // ユーザー名更新
                    console.log('ユーザー名が更新されました');
                    var usernameField = button.closest('tr').find('.e1');
                    usernameField.val(newUsername);
                    usernameField.prop('disabled', true);
                }else{
                    var emailField = button.closest('tr').find('.e2');
                    emailField.val(newEmail);
                    emailField.prop('disabled', true);
                }

                button.text('編集');
                editField.prop('disabled', true);
            }
        },
        error: function () {
            alert('通信エラーが発生しました。');
        }
    });
}

var editButtons = document.querySelectorAll('.editButton');
editButtons.forEach(function(button){
    button.addEventListener('click',function(){

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
        
        // テキストボックス編集可能
        editField.disabled = !editField.disabled;

        // ボタンのテキストを変更
        if (editField.disabled) {
            button.innerText = '編集';
            $(function () {
                $('.editButton').on('click', function () {
                    var button = $(this);
                    var editField = button.closest('tr').find('.editField');
            
                    if (editField.prop('disabled')) {
                        // 編集モードに切り替える
                        button.text('保存');
                        editField.prop('disabled', false);
                    } else {
                        // 保存クリック時
                        console.log("保存");
                        var flg;
                        var data;

                        if (closestRow.find('.e1').length > 0) {
                            // ユーザー名
                            console.log('e1クラスを持っています');
                            data = button.closest('tr').find('.e1').val();
                            flg = true;
                        } else {
                            // メールアドレス
                            console.log('e1クラスを持っていません');
                            data = button.closest('tr').find('.e2').val();
                            flg = false;
                        }
                        
                        mypage_nameEmail_ajax(data,flg,button);

                    }
                });
            });
        }
    });
});

function move() {
    location.href = '/enikki/friend/';
}