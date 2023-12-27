// friend.js

document.addEventListener('DOMContentLoaded', function () {
    var deleteButtons = document.querySelectorAll('.delete');
    deleteButtons.forEach(function (button) {
        if(button){
            console.log('ボタンあり')
        }
        
      button.addEventListener('click', function () {
        console.log('削除')
        var username = button.closest('.account-form').querySelector('h4').textContent;
        deleteFriend(username);
        var parentElement = button.closest('.account-form');
        if (parentElement) {
            parentElement.parentNode.removeChild(parentElement);
        }
      });
    });
  
    function deleteFriend(username) {
      $.ajax({
        url: '/enikki/friend/',
        type: 'POST',
        data: {
          'username': username,
        },
        dataType: 'json',
        headers: { 'X-CSRFToken': csrftoken }
      })
      .done(function (data) {
        // 削除が成功した場合の処理
        console.log('友達を削除しました。');
        // 画面のリロードなどの追加の処理が必要であればここに追加
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        // エラーが発生した場合の処理
        alert('友達の削除に失敗しました。');
        console.log("jqXHR          : " + jqXHR.status);
        console.log("textStatus     : " + textStatus);
        console.log("errorThrown    : " + errorThrown.message);
      });
    }
  });
  