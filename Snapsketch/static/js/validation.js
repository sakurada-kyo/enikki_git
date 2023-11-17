$(function(){
    //フォーム指定
    $('#mid').validate({

      //検証ルール設定
      rules: {
        //ここに検証ルールを設定
      },

      //エラーメッセージ設定
      messages: {
        //ここにエラーメッセージを設定
      },

      //エラーメッセージ出力箇所設定
      errorPlacement: function(error, element){
        //ここにエラーメッセージの出力箇所を設定
      }

    });
  });