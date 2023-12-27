import React, { useState, useEffect } from 'react';
import Group from './Group'

const GroupNav = (props) => {
    const [groupList, setGroupList] = useState([]);
    
    useEffect(() => {
        fetchGroupList(); // 初回のグループリストのデータ取得
      }, []);

    // グループリスト取得
    const fetchGroupList = async () => {
        const url = '/enikki/fetch_grouplists/';
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        }

        try{
            // fetch APIを使ってデータを取得
            const res = await fetch(url,options);

            // レスポンスをJSON形式に変換
            const responseData = await res.json();

            // postsにセット
            setGroupList(responseData.group_list);
        } catch(e){
            console.log('エラーが発生しました')
        }
    }

    // グループがクリックされたときのハンドラー
    const handleGroupClick = (groupname) => {
        
    };

    return (
        <>
            {groupList.map((group) => {
                <Group 
                    currentGroup={currentGroup} 
                    group={group} 
                    onClick={handleGroupClick}
                />
            })}
        </>
    );
};

export default GroupNav;

//グループ変更時、タイムラインを切り替える
//→親のsetPosts使う