import React, { useState, useEffect } from 'react';

const GroupCreatePopup = (props) => {
    const [groupIcon,setGroupIcon] = useState(null);
    const [groupname,setGroupName] = useState('');

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

    //グループリスト追加関数
    const handleGroupList = () => {
        props.setGroupList()
    };

    // グループ作成
    const fetchGroupCreate = async () => {
        const formData = new FormData();
        formData.append('groupIcon', groupIcon);
        formData.append('groupname', groupname);
        const url = '/enikki/fetch_group_create/';
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body:formData
        }

        try{
            // fetch APIを使ってデータを取得
            const res = await fetch(url,options);

            // レスポンスをJSON形式に変換
            const responseData = await res.json();
            
            const addGroup = responseData.add_group;
            
            // groupListに追加

        } catch(e){
            console.log('エラーが発生しました')
        }
    }

    return (
        <div id="popup-wrapper">
            <div id="popup-inside">
                <div id="close">x</div>
                <div id="group-form">
                    <h1>グループ作成</h1>
                    <table>
                        <tr>
                            <th>グループ名:</th>
                            <td><input type="text" value={text} onChange={handleTextChange} /></td>
                        </tr>
                        <tr>
                            <th>アイコン:</th>
                            <td><input type="file" onChange={handleFileChange} /></td>
                        </tr>
                    </table>
                    <button className='createBtn' onClick={fetchGroupCreate}>作成</button>
                </div>
            </div>
        </div>
    );
};

export default GroupCreatePopup;