$(function(){
    $('#search-form').on('submit', function(e) {
        e.preventDefault(); // フォームの通常の送信を防ぐ
    
        // フォームのテキストの値を取得
        var searchId = $(this).find('input[name="search"]').val();
    
        // Ajaxリクエストを作成
        $.ajax({
            type: 'POST', // POSTリクエスト
            url: $(this).attr('action'), // フォームのアクションURLを取得
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

function showUser(data) {
    const userId = data.context.user_id;
    const username = data.context.username;
    const icon = data.context.user_icon_path;

    const iconElem = createElem("img","","","");
    const idElem = createElem("p","","user-id",userId);
    const nameElem = createElem("p","","username",username);
    const btnElem = createElem("input","","btn","");
    const formElem = createElem("form","follow-form","","");
    const userElem = createElem("div","","user-info","")

    const fragment = document.createDocumentFragment();

    iconElem.setAttribute("src",icon);

    btnElem.setAttribute("type","submit");
    btnElem.setAttribute("value","フォロー");

    userElem.appendChild(idElem);
    userElem.appendChild(nameElem);

    formElem.setAttribute("id","follow-form");
    formElem.setAttribute("action","");
    formElem.setAttribute("method","post");
    formElem.appendChild(iconElem);
    formElem.appendChild(userElem);
    formElem.appendChild(btnElem);
    
    fragment.appendChild(formElem);
    
    return fragment;
}

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

  $(function(){
    $('#follow-form').on('submit', function(e) {
        e.preventDefault(); // フォームの通常の送信を防ぐ

        const btnElement = e.target;
        var followId = $('#user-id').html();

        // Ajaxリクエストを作成
        $.ajax({
            type: 'POST', // POSTリクエスト
            url: '',
            data: {
                'followId': followId, // 検索テキストの値をデータとして送信
            },
            headers:{
                'X-CSRF-Token':csrftoken
            },
            success: function(response) {
                showFollow(btnElement);
            },
            error: function(error) {
                // エラー時の処理
                console.error('Ajaxリクエストエラー:', error);
            }
        });
    });
});

function showFollow(element){
    // 要素を削除
    element.remove();

    // フォロー
    const followedElem = createElem("p","","followed","フォローしました");
    const followFormElem = document.getElementById('follow-form');
    followFormElem.appendChild(followedElem);
}
