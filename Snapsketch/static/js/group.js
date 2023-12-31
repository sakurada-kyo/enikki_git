document.addEventListener('DOMContentLoaded', function() {
  var addButtons = document.querySelectorAll('.add');
  var inviteButton = document.getElementById('invite');
  var closeButton = document.getElementById('close');
  var deleteButton = document.getElementById('delete');

  addButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      var popUp = document.getElementById('members-popup');
      popUp.style.display = 'block';
    });
  });

  closeButton.addEventListener('click', function() {
    var popUp = document.getElementById('members-popup');
    popUp.style.display = 'none';
  });


  //　追加ボタンにクリックイベントリスナーを追加
  inviteButton.addEventListener('click', function() {
    var checkboxes = document.querySelectorAll('input[name="scales"]:checked');
    var selectedUsers = [];

    checkboxes.forEach(function(checkbox) {
      selectedUsers.push(checkbox.nextElementSibling.textContent.trim());
    });

    var groupNameElement = document.querySelector('.group-name');
    var groupName = groupNameElement.textContent.trim();
    
    console.log('Group Name:', groupName);
    console.log('Selected Users:', selectedUsers);

    $.ajax({
      url: '/enikki/group/ajax_groupmembers_list/',
      type: 'POST',
      data: {
        'selected_users': selectedUsers,
        'group_name': groupName,
      },
      dataType: 'json',
      headers: { 'X-CSRFToken': csrftoken },
      success: function(data) {
        console.log('招待が成功しました。');
        var popUp = document.getElementById('members-popup');
        popUp.style.display = 'none';
      },
      error: function(jqXHR, textStatus, errorThrown) {
        alert('すでに追加されています');
        console.log("jqXHR          : " + jqXHR.status);
        console.log("textStatus     : " + textStatus);
        console.log("errorThrown    : " + errorThrown.message);
      },
    });
  });

  // 削除ボタンにクリックイベントリスナーを追加
  deleteButton.addEventListener('click', function() {
    var checkboxes = document.querySelectorAll('input[name="scales"]:checked');
    var selectedUsers = [];
  
    checkboxes.forEach(function (checkbox) {
      selectedUsers.push(checkbox.nextElementSibling.textContent.trim());
    });
  
    var groupNameElement = document.querySelector('.group-name');
    var groupName = groupNameElement.textContent.trim();
  
    console.log('Group Name:', groupName);
    console.log('Selected Users for Deletion:', selectedUsers);
  
    $.ajax({
      url: '/enikki/group/ajax_deletemembers_list/',
      type: 'POST',
      data: {
        // 'action': 'delete',  // 'action' パラメータを追加
        'selected_users': selectedUsers,
        'group_name': groupName,
      },
      dataType: 'json',
      headers: { 'X-CSRFToken': csrftoken }
    })
    .done(function (data) {
      // 削除が成功した場合の処理
      console.log('友達を削除しました。');
      var popUp = document.getElementById('members-popup');
      popUp.style.display = 'none';
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      // エラーが発生した場合の処理
      alert('友達の削除に失敗しました。');
      console.log("jqXHR          : " + jqXHR.status);
      console.log("textStatus     : " + textStatus);
      console.log("errorThrown    : " + errorThrown.message);
    });
  });
})

