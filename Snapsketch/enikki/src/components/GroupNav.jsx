import React, { useState, useEffect } from 'react';
import Group from './Group'

const GroupNav = (props) => {
    const [groupList, setGroupList] = useState([]);
    const [currentGroup, setCurrentGroup] = useState([]);

    const fetchGroupList = async () => {
        const url = "/enikki/fetch_posts/";
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                page: 0 //最後のページ番号を渡す
            })
        }
    }
    return (
        <>
            {groupList.map((group) => {
                <Group currentGroup={currentGroup} {...group} />
            })}
        </>
    );
};

export default GroupNav;

// グループリストを取得
// 現在のグループを取得