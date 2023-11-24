let userBirthdayYear = document.querySelector('.birthday-year');
let userBirthdayMonth = document.querySelector('.birthday-month');
let userBirthdayDay = document.querySelector('.birthday-day');

/**
 * selectのoptionタグを生成するための関数
 * @param {Element} elem 変更したいselectの要素
 * @param {Number} val 表示される文字と値の数値
 */
function createOptionForElements(elem, val) {
  let option = document.createElement('option');
  option.text = val;
  option.value = val;
  elem.appendChild(option);
}

//年の生成
for(let i = 1920; i <= 2020; i++) {
  createOptionForElements(userBirthdayYear, i);
}
//月の生成
for(let i = 1; i <= 12; i++) {
  createOptionForElements(userBirthdayMonth, i);
}
//日の生成
for(let i = 1; i <= 31; i++) {
  createOptionForElements(userBirthdayDay, i);
}

/**
 * 日付を変更する関数
 */
function changeTheDay() {
  //日付の要素を削除
  userBirthdayDay.innerHTML = '';

  //選択された年月の最終日を計算
  let lastDayOfTheMonth = new Date(userBirthdayYear.value, userBirthdayMonth.value, 0).getDate();

  //選択された年月の日付を生成
  for(let i = 1; i <= lastDayOfTheMonth; i++) {
    createOptionForElements(userBirthdayDay, i);
  }
}

userBirthdayYear.addEventListener('change', function() {
  changeTheDay();
});

userBirthdayMonth.addEventListener('change', function() {
  changeTheDay();
});