import React, { useState, useEffect } from 'react';

const Group = (props) => {
    const groupId = props.group.group_id;
    const groupname = props.group.groupname;
    const groupIcon = props.group.group_icon_path;
    const [currentGroup,setCurrentGroup] = useState();

    // グループがクリックされたときのハンドラー
    const handleClick = () => {
        if (props.onClick) {
            props.onClick(groupname); // グループ名を引数として渡す
        }
    };

    return (
        <img 
            key={groupId} 
            src={groupIcon} 
            className='group-icon' 
            data-group={groupname} 
            onClick={handleClick}
        />
    );
};

export default Group;
// currentGroupはborderつける