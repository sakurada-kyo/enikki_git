// --------------------無限スクロール----------------------
//タグの再利用
var jscrollOption = {
    loadingHtml: '読み込み中', // 記事読み込み中の表示、画像等をHTML要素で指定することも可能
    autoTrigger: true, // 次の表示コンテンツの読み込みを自動( true )か、ボタンクリック( false )にする
    padding: 20, // autoTriggerがtrueの場合、指定したコンテンツの下から何pxで読み込むか指定
    nextSelector: 'a.jscroll-next', // 次に読み込むコンテンツのURLのあるa要素を指定
    contentSelector: '.jscroll' // 読み込む範囲を指定、指定がなければページごと丸っと読み込む
}
$('.jscroll').jscroll(jscrollOption);

//urlパラメータ
// var posi_top,wih_half,current_view,set_url,set_url_old;
// var now_url = location.pathname;

// $(window).load(function(){
// 	var wih = window.innerHeight;
// 	var wih_half = wih/2;
// 	current_view = wih_half;
// 	set_posi();
// });

// $(window).scroll(function(){
// 	var wih = window.innerHeight;
// 	var wih_half = wih/2;
// 	current_view = $(this).scrollTop() + wih_half;
// 	set_posi();
// });


// function set_posi(){

// 	$('.demo_url_replacer').each(function() {
// 		var posi = $(this).offset();
// 		posi_top = posi.top;
// 		posi_bottom = posi_top+$(this).height();

// 		//画面真ん中が要素の上部の位置を超過かつ、要素の下部未満の場合URL変更。
// 		if(current_view > posi_top && current_view < posi_bottom){
// 			set_url_old = set_url;
// 			if($(this).attr("data-url")){
// 				set_url = $(this).attr("data-url");
// 			}else{
// 				set_url = now_url;
// 			}
// 			if(set_url!==set_url_old){
// 				//ただ書き換える処理
// 				//history.replaceState('','',set_url);
// 				//履歴に書き込む処理
// 				history.pushState('','',set_url);
// 			}
// 		}
// 	});
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