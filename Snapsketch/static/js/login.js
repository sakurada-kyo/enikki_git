$(document).ready(function () {
    $(".button").click(function () {
        var address = $("#address").val();
        var password = $("#password").val();

        // ダミーのアドレスとパスワード (実際にはデータベースなどで検証)
        var dummyAddress = "address";
        var dummyPassword = "pass";

        if (address === dummyAddress && password === dummyPassword) {
            alert("ログイン成功！");
            // ログイン成功時の処理をここに追加
            window.location.href="mypage.html";
        } else if (address === dummyAddress && password !== dummyPassword){
            alert("パスワードが正しくありません。");
        } else if (address !== dummyAddress && password === dummyPassword){
            alert("アドレスが正しくありません。");
        } else {
            alert("アドレスとパスワードを入力してください。");
        }
    });
});


// $(function(){
//     $('#mid').on('submit',function(){
//     $('#mid').validate({
//         rules:{
//             text:{
//                 required: true,
//             },
//             text2:{
//                 required: true,
//             },
//         },

//         messages:{
//             text:{
//                 required:"入力必須項目",
//             },
//             text2:{
//                 required:"入力必須項目",
//             },
//         },

//     })        
//          $(this).find('#mid').eaach(function(){
//             if($(this).val() === ""){
//                 console = true;
//                 $(this).after('<span class="error">未入力です</span>')
//             }
//          });

//          if(error){
//             return false;
//          }
//     })
// })




          
    
       
