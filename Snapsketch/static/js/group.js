
var adds = document.querySelectorAll('.add');
var invite = document.getElementById('invite');
var close = document.getElementById('close');

// 登録している友達を表示
adds.forEach(add => {
  add.addEventListener('click',() => {
    var popUp = document.getElementById('members-popup');
    popUp.style.display = 'block';
  });
});

// ポップアップを閉じる
document.getElementById('close').addEventListener('click', function() {
  document.getElementById('members-popup').style.display = 'none';
});

document.getElementById('invite').addEventListener('click', function(){
  document.getElmentById('members-popup').style.display = 'none';
})

//-----------------------ajax処理-----------------------
  function ajax_open(lastElement) {
    console.log("page:" + $(lastElement).attr('data-page'));
    $.ajax({
      url: 'ajax_timeline/',
      type: 'POST',
      data: {
        'page': $(lastElement).attr('data-page'),
      },
      dataType: 'json',
      headers: { 'X-CSRFToken': csrftoken }
    })
      .done(function (data) {
        // const allPagesData = data.all_pages_data;
        if ('error' in data) {
          console.log(data.error);
        } else {
          // データがnullでない場合の処理
          var fragment = add_article(data, true);
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



  // ユーザを招待する
invite.addEventListener('click', function() {
  var checkboxes = document.querySelectorAll('input[name="scales"]:checked');
  var selectedUsers = [];
  
  checkboxes.forEach(checkbox => {
    selectedUsers.push(checkbox.nextElementSibling.textContent);
  });
  
  // Ajaxリクエストを送信
  $.ajax({
    url: '/enikki/group/ajax_groupmembers_list/', 
    type: 'POST',
    data: {
      'selected_users': selectedUsers,
    },
    // processData: false,
    // contentType: false,
    dataType: 'json',
    headers: { 'X-CSRFToken': csrftoken }
  })
    .done(function(data) {
      // 成功時の処理
      console.log('招待が成功しました。');
      // 追加の処理を追加する場合はここに追加
    })
    .fail((jqXHR, textStatus, errorThrown) => {
      alert('Ajax通信に失敗しました。');
      console.log("jqXHR          : " + jqXHR.status); // HTTPステータスを表示
      console.log("textStatus     : " + textStatus);    // タイムアウト、パースエラーなどのエラー情報を表示
      console.log("errorThrown    : " + errorThrown.message); // 例外情報を表示
    });
});