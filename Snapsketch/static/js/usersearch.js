$('#search-button').on('click', function(e) {
    e.preventDefault();
    // フォームのテキストの値を取得
    const searchElem = document.getElementById('search');
    const searchId = searchElem.value;

    // Ajaxリクエストを作成
    $.ajax({
        type: 'POST', // POSTリクエスト
        url: '/enikki/usersearch/ajax_search/', // フォームのアクションURLを取得
        data: {
            'searchId': searchId, // 検索テキストの値をデータとして送信
        },
        success: function(response) {

            // 何かしらのエラーがある場合
            if(response.error){
                const errorMsg = response.error
                alert(errorMsg)
                return
            }

            const fragment = showUser(response)
            $('#box').append(fragment)
            handleFollowBtn()
        },
        error: function(error) {
            // エラー時の処理
            console.error('Ajaxリクエストエラー:', error);
        }
    });
});

// ユーザー検索結果表示
function showUser(data) {
    const userId = data.context.user_id;
    const username = data.context.username;
    const icon = data.context.user_icon_path;
    const isFollowed = data.context.is_followed

    console.log(`isFollowed:${isFollowed}`)

    const iconElem = createElem("img","","","");
    const idElem = createElem("p","user-id","",userId);
    const nameElem = createElem("p","username","",username);
    const btnElem = createElem("input","follow-button","","");
    const formElem = createElem("form","follow-form","","");
    const userElem = createElem("div","user-info","","")

    const fragment = document.createDocumentFragment();

    iconElem.setAttribute("src",icon);

    btnElem.setAttribute("type","button");
    btnElem.setAttribute("value","フォロー");
    btnElem.setAttribute("disabled","");

    // フォロー済みか否か
    if (isFollowed) {
        btnElem.disabled = "disabled"
    } else {
        btnElem.disabled = null
    }

    userElem.appendChild(idElem);
    userElem.appendChild(nameElem);

    formElem.appendChild(iconElem);
    formElem.appendChild(userElem);
    formElem.appendChild(btnElem);

    fragment.appendChild(formElem);

    return fragment;
}

// フォローボタンクリック時
function handleFollowBtn() {
    $('#follow-button').on('click', function(e) {
        e.preventDefault(); // フォームの通常の送信を防ぐ

        var followId = $('#user-id').text();

        // Ajaxリクエストを作成
        $.ajax({
            type: 'POST', // POSTリクエスト
            url: '/enikki/usersearch/ajax_follow/',
            data: {
                'followId': followId, // 検索テキストの値をデータとして送信
            },
            headers:{
                'X-CSRF-Token':csrftoken
            },
            success: function(response) {
                const btnElement = $('#follow-button');
                showFollow(btnElement);
            },
            error: function(error) {
                // エラー時の処理
                console.error('Ajaxリクエストエラー:', error);
            }
        });
    });
}

// フォロー結果表示
function showFollow(element){
    // 要素を削除
    element.remove();

    // フォロー
    const followedElem = createElem("p","","followed-msg","フォローしました");
    const followFormElem = document.getElementById('follow-form');
    followFormElem.appendChild(followedElem);
}

// タグ生成
function createElem(tagName, id = '', className = '', textContent = '') {
    var element = document.createElement(tagName);

    if (className) {
        element.setAttribute('class', className);
    }

    if(id){
        element.setAttribute('id',id)
    }

    if (textContent) {
        element.innerHTML = textContent;
    }

    return element;
  };