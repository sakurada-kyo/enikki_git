

// リクエスト許可



$(function(){
    $('.request-form').on('submit', function(e) {
        e.preventDefault(); // フォームの通常の送信を防ぐ
    
        // フォームのテキストの値を取得
        var searchId = $(this).find('input[name="search"]').val();
    
        // Ajaxリクエストを作成
        $.ajax({
            type: 'POST', // POSTリクエスト
            url: '/enikki/request/allow', // フォームのアクションURLを取得
            data: {
                'searchId': searchId, // 検索テキストの値をデータとして送信
            },
            success: function(response) {
                const parseRes = JSON.parse(response);
                const fragment = showUser(parseRes);
                $('#box').append(fragment);
            },
            error: function(error) {
                // エラー時の処理
                console.error('Ajaxリクエストエラー:', error);
            }
        });
    });
});

$(function(){
    $('#search-form').on('submit', function(e) {
        e.preventDefault(); // フォームの通常の送信を防ぐ
    
        // フォームのテキストの値を取得
        var searchId = $(this).find('input[name="search"]').val();
    
        // Ajaxリクエストを作成
        $.ajax({
            type: 'POST', // POSTリクエスト
            url: '/enikki/request/deny', // フォームのアクションURLを取得
            data: {
                'searchId': searchId, // 検索テキストの値をデータとして送信
            },
            success: function(response) {
                const parseRes = JSON.parse(response);
                const fragment = showUser(parseRes);
                $('#box').append(fragment);
            },
            error: function(error) {
                // エラー時の処理
                console.error('Ajaxリクエストエラー:', error);
            }
        });
    });
});