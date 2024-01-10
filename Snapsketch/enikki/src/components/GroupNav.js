import React, { useState, useEffect } from 'react';
import GroupCreatePopup from './GroupCreatePopup'; 

const GroupNav = (props) => {
    const [groupList, setGroupList] = useState([]);
    const [currentGroup,setCurrentGroup] = useState('');
    const [showComponent, setShowComponent] = useState(false);
    
    useEffect(() => {
        fetchGroupList(); // 初回のグループリストのデータ取得
      }, []);

    // グループ追加 
    const handleAddGroup = (data) => {
        setGroupList(prevGroupList => [...prevGroupList,...data])
    }
    
    const handleGroupClick = (groupname) => {
        props.onGroupClick(groupname); // グループがクリックされたときにonGroupClickを呼び出す
    };

    //ポップアップ表示
    const showPopup = () => {
        setShowComponent(true);
    }

    const unShowPopup = () => {
        setShowComponent(false);
    }

    // グループリスト取得
    const fetchGroupList = async () => {
        const url = '/enikki/grouptest/';
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            }
        }

        try{
            // fetch APIを使ってデータを取得
            const res = await fetch(url,options);

            // レスポンスをJSON形式に変換
            const responseData = await res.json();
            
            const parseGroupList = responseData.group_list;
            

            // postsにセット
            setGroupList(parseGroupList);
            
            // 現在のグループをセット
            setCurrentGroup(parseGroupList[0]['group__groupname'])
        } catch(e){
            console.log('エラーが発生しました')
        }
    }

    return (
        <div id='group-nav'>
            {groupList.map((group) => (
                <div key={group.group__group_id} data-group={group.group__groupname} className='group-icon' onClick={() => handleGroupClick(group.group__groupname)}>
                    {currentGroup == group.groupname ? (
                        <img 
                            className='group-image' 
                            src={`/media/${group.group__group_icon_path}`} 
                        />
                    ):(
                        <img 
                            className='group-image' 
                            src={`/media/${group.group__group_icon_path}`} 
                            style={{border: "solid 5px #000000"}} 
                        />
                    )}
                    
                </div>
            ))}
            {showComponent && <GroupCreatePopup unShowPopup={unShowPopup} handleAddGroup={handleAddGroup} />}
            <i className="fa-solid fa-plus" onClick={showPopup}  />
        </div>
    );
};
export default GroupNav;

//グループ作成機能
//グループ選択時、フォーカス機能