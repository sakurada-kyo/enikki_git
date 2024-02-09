$(function () {
    //独自ルールを追加
    $.validator.addMethod(
      'password',
      function (value, element) {
        // 検証対象の要素にこのルールが設定されているか
        if (this.optional(element)) {
          return true
        }
        return this.optional(element) || /^[a-zA-Z0-9!-/:-@¥[-`{-~]*$/.test(value)
      },
      '半角英数記号で入力してください。'
    )

$("#signup-form").validate({
    rules:{
        username: {
            required: true,
        },
        password1:{
            required: true,
            minlength:8,
            password:true,
            
        },
        password2:{
            equalTo: "#password1",
        },
        email:{
            required: true,
            email: true,
        },
        tel:{
            required:true,
            digits: true,
            rangelength: [10, 11]
        }
    },
    messages: {
        name: {
            required: "お名前を入力してください。",
            maxlength: "お名前は50文字以内で入力してください。"
        },
     }
})
})


//　パスワード：英数字
// 電話番号：数字のみ、9桁
// メールアドレス