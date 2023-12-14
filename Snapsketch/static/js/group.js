
    var add = document.getElementById('add');
    var popupWrapper = document.getElementById('members-popup');
    
    console.log("add" + add);
    // ボタンをクリックしたときにポップアップを表示させる
    add.addEventListener('click', () => {
      popupWrapper.style.display = "block";      
      console.log("add:" + add);
      var closeBtn = document.getElementById('close-button');
      
    });

    closeBtn.addEventListener('click',fadeout());

    function fadeout(){
      var popupWrapper = document.getElementById('members-popup');
      popupWrapper.style.display = "none";
    }
    // ポップアップの外側又は「x」のマークをクリックしたときポップアップを閉じる
    // popupWrapper.addEventListener('click', e => {
    //   if (e.target.id === popupWrapper.id || e.target.id === close.id) {
    //     popupWrapper.style.display = 'none';
    //   }
    // });

    // $('#group-form').on('submit', function (e) {
    //   e.preventDefault();
    //   console.log('送信');

    //   var formData = new FormData($('#group-form').get(0));

    //   if (formData != null) {
    //     console.log("form-data");
    //   }

    //   $.ajax({
    //     url: $(this).prop('action'),
    //     type: $(this).prop('method'),
    //     data: formData,
    //     dataType: 'json',
    //     processData: false,
    //     contentType: false,
    //   })
    //     .done(function (response) {
    //       console.log(response);
    //       if (response.errors) {
    //         // エラーメッセージを取得して表示する例
    //         const errorMessages = JSON.parse(response.errors);
    //         for (const field in errorMessages) {
    //           if (errorMessages.hasOwnProperty(field)) {
    //             const errorMessage = errorMessages[field][0]; // 1つ目のエラーメッセージを取得
    //             alert(`エラー: ${field} - ${errorMessage}`);
    //           }
    //         }
    //       } else {
    //         const fragment = addGroup(response);
    //         $('.fa-plus').before(fragment);
    //         popupWrapper.style.display = 'none';
    //         focus();
    //       }
    //     })
    //     // Ajax通信が失敗したら発動
    //     .fail((jqXHR, textStatus, errorThrown) => {
    //       console.log("jqXHR: " + jqXHR.status); // HTTPステータスを表示
    //       console.log("textStatus: " + textStatus);    // タイムアウト、パースエラーなどのエラー情報を表示
    //       console.log("errorThrown: " + errorThrown.message); // 例外情報を表示
    //     });
//     });

