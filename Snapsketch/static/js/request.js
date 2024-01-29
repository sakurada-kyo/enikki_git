// 許可　→　フォロワーテーブルへ追加
$('.allow').on('click', function (e) {
    e.preventDefault(); // フォームの通常の送信を防ぐ

    // クリックされた要素の親要素から user-id を取得
    const followerId = $(this).closest('.request-form').find('.user-id').text();
    const removeElement = $(this).closest('.request-form').find('.delete');

    console.log(`followedId:${followerId}`)

    // Ajaxリクエストを作成
    $.ajax({
        type: 'POST', // POSTリクエスト
        url: '/enikki/request/allow', // フォームのアクションURLを取得
        data: {
            'followerId': followerId, // 検索テキストの値をデータとして送信
        },
        success: function (response) {
            $(this).remove();
            removeElement.remove();
            const pElem = createElem('p', '', '', '承認しました');
            const approveElem = $(this).closest('.request-form').find('.approve');
            $(approveElem).append($(pElem));
        },
        error: function (error) {
            // エラー時の処理
            console.error('Ajaxリクエストエラー:', error);
        }
    });
});

// リクエスト拒否　→　表示のみ
$('.deny').on('click', function (e) {
    e.preventDefault(); // フォームの通常の送信を防ぐ
    const removeElement = $(this).closest('.request-form').find('.allow');
    $(this).remove();
    removeElement.remove();
    const pElem = createElem('p', '', '', '拒否しました');
    const approveElem = $(this).closest('.request-form').find('.approve');
    $(approveElem).append($(pElem));
});

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