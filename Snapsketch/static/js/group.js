document.addEventListener('DOMContentLoaded', function() {
  var addButtons = document.querySelectorAll('.add');
  var inviteButton = document.getElementById('invite');
  var closeButton = document.getElementById('close');

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
        alert('Ajax通信に失敗しました。');
        console.log("jqXHR          : " + jqXHR.status);
        console.log("textStatus     : " + textStatus);
        console.log("errorThrown    : " + errorThrown.message);
      },
    });
  });
});
