import React, { useState, useEffect } from 'react';

const GroupCreatePopup = (props) => {
    const [groupIcon, setGroupIcon] = useState(null);
    const [groupname, setGroupName] = useState('');

    //ポップアップ非表示
    const unShowPopupWrapper = () => {
        props.unShowPopup();
    }

    // 画像セット
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const filenameElem = document.getElementById('filename')
        filenameElem.innerHTML = file.name
        setGroupIcon(file);
    };

    // テキストセット
    const handleTextChange = (e) => {
        const text = e.target.value;
        setGroupName(text);
    };

    // 親のグループ追加関数
    const parentAddGroup = (data) => {
        props.parentAddGroup(data);
    }

    // グループ作成
    const fetchGroupCreate = async () => {
        const formData = new FormData();
        formData.append('groupIcon', groupIcon);
        formData.append('groupname', groupname);

        const url = '/enikki/timeline/creategroup/';
        const options = {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken
            },
            body: formData,
        }

        try {
            // fetch APIを使ってデータを取得
            const res = await fetch(url, options);

            // レスポンスをJSON形式に変換
            const responseData = await res.json();

            // メッセージ取得
            const addGroup = responseData.data;

            parentAddGroup(addGroup);

            // ポップアップ閉じる
            unShowPopupWrapper();

        } catch (e) {
            console.log('エラーが発生しました')
        }
    }

    return (
        <div id="popup-wrapper">
            <div id="popup-inside">
                <div id="close" onClick={unShowPopupWrapper}>x</div>
                <div id="group-wrapper">
                    <h1>グループ作成</h1>
                    <hr/>
                    <div id='groupname'>
                        <input 
                            className='groupname-text' 
                            type="text" 
                            onChange={handleTextChange}
                            placeholder='グループ名'
                         />
                    </div>
                    <div id='group-image'>
                        <label htmlFor='groupImg'>
                            <span id='selectFile'>ファイル選択</span>
                            <input id='groupImg' type="file" onChange={handleFileChange} />
                            <p id='filename'></p>
                        </label>
                        
                    </div>
                    <button id='createBtn' onClick={fetchGroupCreate}>作成</button>
                </div>
            </div>
        </div>
    );
};

export default GroupCreatePopup;

// 実行順序（ポップアップ　→　タイムライン）
// xボタンクリック時の処理