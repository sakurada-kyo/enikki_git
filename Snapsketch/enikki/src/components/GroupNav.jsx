import React, { useState, useEffect } from 'react';
import Group from './Group'

const GroupNav = () => {
    const [groupList, setGroupList] = useState([]);
    const [currentGroup, setCurrentGroup] = useState('');

    return (
        <>
            {groupList.map((group) => {
                <Group currentGroup={currentGroup} {...group}/>
            })}
        </>
    );
};

export default GroupNav;

// グループリストを取得
// 現在のグループを取得