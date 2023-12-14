
var adds = document.querySelectorAll('.add');
var invite = document.getElementById('invite');
var close = document.getElementById('close');

// 登録している友達を表示
adds.forEach(add => {
  add.addEventListener('click',() => {
    var popUp = document.getElementById('members-popup');
    popUp.style.display = 'block';
  });
  
})
// ポップアップを閉じる
document.getElementById('close').addEventListener('click', function() {
  document.getElementById('members-popup').style.display = 'none';
});
