// 許可　→　フォロワーテーブルへ追加
$('.allow').on('click', function (e) {
    console.log('allow')

    // クリックされた要素の親要素から user-id を取得
    const followerId = $(this).closest('.request-form').find('.user-id').text()
    const approveElem = $(this).closest('.request-form').find('.approve')

    // Ajaxリクエストを作成
    $.ajax({
        type: 'POST', // POSTリクエスト
        url: '/enikki/request/allow/', // フォームのアクションURLを取得
        data: {
            'followerId': followerId, // 検索テキストの値をデータとして送信
        },
        success: function (response) {
            $(approveElem).html('')
            const pElem = $('<p>').text('承認しました')
            $(approveElem).append(pElem)
        },
        error: function (error) {
            // エラー時の処理
            console.error('Ajaxリクエストエラー:', error);
        }
    });
});

// リクエスト拒否
$('.delete').on('click', function (e) {
    console.log('deny')

    const followerId = $(this).closest('.request-form').find('.user-id').text()
    const approveElem = $(this).closest('.request-form').find('.approve')
    const pElem = $('<p>').text('拒否しました')

    // Ajaxリクエストを作成
    $.ajax({
        type: 'POST', // POSTリクエスト
        url: '/enikki/request/deny/', // フォームのアクションURLを取得
        data: {
            'followerId': followerId, // 検索テキストの値をデータとして送信
        },
        headers:{
            'X-CSRF-Token':csrftoken
        },
        success: function (response) {
            $(approveElem).html('')
            $(approveElem).append(pElem)
        },
        error: function (error) {
            // エラー時の処理
            console.error('Ajaxリクエストエラー:', error);
        }
    });
});

// タグ生成
function createElem(tagName, id = '', className = '', textContent = '') {
    var element = document.createElement(tagName);
    if (className) {
        element.setAttribute('class', className);
    }

    if (id) {
        element.setAttribute('id', id)
    }

    if (textContent) {
        element.innerHTML = textContent;
    }
    return element;
};