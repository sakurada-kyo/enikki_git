$("#signup-form").validate({
    rules:{
        username: {
            required: true,
        },
        password:{
            required: true,
            minlength:8,
            
        }
    },
    messages: {
        name: {
            required: "お名前を入力してください。",
            maxlength: "お名前は50文字以内で入力してください。"
        },
     }
})