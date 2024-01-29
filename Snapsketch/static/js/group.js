document.addEventListener('DOMContentLoaded', function() {
  var addButtons = document.querySelectorAll('.add');
  var inviteButton = document.getElementById('invite');
  var closeButton = document.getElementById('close');
  var close1Button = document.getElementById('close1');
  var deleteButton = document.getElementById('delete');
  var delButtons = document.querySelectorAll('.del'); // 複数の要素を選択するためにquerySelectorAllを使用

  addButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      var popUp = document.getElementById('members-popup');
      popUp.style.display = 'block';
    });
  });

  delButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      var delpopUp = document.getElementById('delete-popup-content');
      delpopUp.style.display = 'block';
      // ボタンに関連するグループ名を取得
      var groupName = button.getAttribute('data-group-name');

      // メンバーを取得して表示
      fetchMembers(groupName);

    });
  });
  
  function fetchMembers(groupName) {
    var delpopUp = document.getElementById('delete-popup-content');
    delpopUp.style.display = 'block';

    $.ajax({
        url: '/enikki/group/ajax_getmembers_list/',
        type: 'POST',
        data: {
            'group_name': groupName,
        },
        dataType: 'json',
        headers: { 'X-CSRFToken': csrftoken },
        success: function (data) {
            console.log('メンバーの取得に成功しました。');

            console.log(`member:${JSON.stringify(data.members)}`)

            // 以前のメンバーリストをクリア
            var membersList = document.getElementById('members-list');
            membersList.innerHTML = '';

            // メンバーをリストに追加
            data.members.forEach(function (member) {
                var listItem = document.createElement('li');
                var check = document.createElement('input');

                listItem.textContent = member.username; 
                membersList.appendChild(listItem);

                check.setAttribute('type','checkbox');
                check.setAttribute('name','delCheck');
                membersList.appendChild(check);
                
            }); 
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert('メンバーの取得に失敗しました');
            console.log("jqXHR          : " + jqXHR.status);
            console.log("textStatus     : " + textStatus);
            console.log("errorThrown    : " + errorThrown.message);
        },
    });
}
 

  //ポップアップを閉じる
  closeButton.addEventListener('click', function() {
    var popUp = document.getElementById('members-popup');
    popUp.style.display = 'none';
  });
  close1Button.addEventListener('click',function() {
    var delpopUp = document.getElementById('delete-popup-content');
    delpopUp.style.display = 'none';
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
    console.log('Delete button clicked');
    var checkboxes = document.querySelectorAll('input[name="delCheck"]:checked');
    var selectedUsers = [];

    checkboxes.forEach(function(checkbox) {
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
        'selected_users': selectedUsers,
        'group_name': groupName,
      },
      dataType: 'json',
      headers: { 'X-CSRFToken': csrftoken },
      success: function(data) {
        console.log('削除しました。');
        var popUp = document.getElementById('delete-popup-content');
        popUp.style.display = 'none';
      },
      error: function(jqXHR, textStatus, errorThrown) {
        alert('すでに削除されています');
        console.log("jqXHR          : " + jqXHR.status);
        console.log("textStatus     : " + textStatus);
        console.log("errorThrown    : " + errorThrown.message);
      },
    });    
  });
});