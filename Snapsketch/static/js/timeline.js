// --------------------無限スクロール----------------------
//intersection observer api
// 交差を監視する要素を準備
// const targets = document.querySelectorAll('.jscroll');
// const staticURL = location.href + '?page=';
// var num = 0;
// var changeURL = '';

// // 範囲の設定
// const options = {
//   root: null,
//   rootMargin: '-50px 0px',
//   threshold: 0.5
// };

// // Intersection Observerを使えるようにする
// const observer = new IntersectionObserver(intersect, options);

// // 対象の要素をそれぞれ監視する
// targets.forEach(target => {
//   observer.observe(target);
// });

// // 交差したときに実行する関数
// function intersect(entries) {
//   entries.forEach(entry => {
//     if (entry.isIntersecting) { // 監視中の要素が交差した状態ならtrue
//       // 監視中の要素が交差したときの処理
// 	  	num++;
// 		changeURL = staticURL + num;
// 		history.replaceState(null,null,changeURL);
//     } else { // 監視中の要素が交差してない状態ならfalse
//       // 監視中の要素が交差していないときの処理
// 	  return;
//     }
//   });
// }
// --------------------無限スクロール----------------------

//------------------ajax------------------
// 送信データ：ページ番号、最大ページ数

// var loading_flg = false;
// // 現在読み込んでいる記事のインデックス
// var page = 1;
// // 一度に読み込む記事数
// var max_page = 10;

// //イベント発生位置
// // pageBottom = [bodyの高さ] - [windowの高さ]
// var pageBottom = document.body.clientHeight - window.innerHeight;
// // スクロール量を取得
// var currentPos = window.scrollY;

// //ajaxセットアップ
// function getCookie(name) {
//     var cookieValue = null;
//     if (document.cookie && document.cookie !== '') {
//         var cookies = document.cookie.split(';');
//         for (var i = 0; i < cookies.length; i++) {
//             var cookie = jQuery.trim(cookies[i]);
//             // Does this cookie string begin with the name we want?
//             if (cookie.substring(0, name.length + 1) === (name + '=')) {
//                 cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//                 break;
//             }
//         }
//     }
//     return cookieValue;
// }

// var csrftoken = getCookie('csrftoken');

// function csrfSafeMethod(method) {
//     // these HTTP methods do not require CSRF protection
//     return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
// }

// $.ajaxSetup({
//     beforeSend: function (xhr, settings) {
//         if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
//             xhr.setRequestHeader("X-CSRFToken", csrftoken);
//         }
//     }
// });

// // スクロール量が最下部の位置を過ぎたか判定
// if (pageBottom-400 <= currentPos) {// 最下部から400px手前で反応する
//     // ページ下部に到達している！
//     loading_flg = true;

//     // スクロールが画面末端に到達している時
//     addPosts();
// }

// //ajax処理
// function addPosts() {
//     $.ajax({
//         type: "POST",
//         url: "{% url 'enikki:ajax_timeline' %}",
//         data: {
//             "page":page,
//         },
//         dataType : "json",
//         // headers:{
//         //     'X-CSRFToken': '{{ csrf_token }}',
//         // }
//     })
//     // Ajaxリクエストが成功した場合
//     .done(function(data) {
//         //読み込み処理
        
//         // 読込が終わったので、インデックスを進める
//         page += 1;

//         // 読込中フラグをオフに戻す
//         loading_flg = false;
//     })
//     // Ajaxリクエストが失敗した場合
//     .fail(function(XMLHttpRequest, textStatus, errorThrown) {
//         alert(errorThrown);
//     });
// }
//------------------ajax------------------