import React, { useState, useEffect } from 'react';

const GroupCreatePopup = (props) => {
    const [groupIcon, setGroupIcon] = useState(null);
    const [groupname, setGroupName] = useState('');

    //ポップアップ非表示
    const handleClickPopupWrapper = () => {
        props.unShowPopup();
    }

    // 画像セット
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setGroupIcon(file);
    };

    // テキストセット
    const handleTextChange = (e) => {
        const text = e.target.value;
        setGroupName(text);
    };

    //親のグループリスト追加関数
    const handleAddGroup = (data) => {
        props.handleAddGroup(data)
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

            const addGroup = responseData.data;

            // groupListに追加
            handleAddGroup(addGroup);

        } catch (e) {
            console.log('エラーが発生しました')
        }
    }

    return (
        <div id="popup-wrapper">
            <div id="popup-inside">
                <div id="close" onClick={handleClickPopupWrapper}>x</div>
                <div id="group-wrapper">
                    <h1>グループ作成</h1>
                    <div id='groupname'>
                        <p>グループ名:</p>
                        <input type="text" onChange={handleTextChange} />
                    </div>
                    <div id='group-image'>
                        <p>アイコン:</p>
                        <input type="file" onChange={handleFileChange} />
                    </div>
                    <button className='createBtn' onClick={fetchGroupCreate}>作成</button>
                </div>
            </div>
        </div>
    );
};

export default GroupCreatePopup;