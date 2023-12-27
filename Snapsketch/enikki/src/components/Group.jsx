import React,{ useState, useEffect } from 'react';

const Group = (props) => {
    const groupId = props.group.group_id;
    const groupname = props.group.groupname;
    const groupIcon = props.group.group_icon_path;
    
    return (
            <img key={groupId} src={groupIcon} className='group-icon' data-group={groupname}/>
    );
};

export default Group;

// currentGroupはborderつける