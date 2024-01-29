import React, { useState, useEffect } from 'react';
import GroupNav from './GroupNav';
import ReactInfiniteScroll from './ReactInfiniteScroll';

const Timeline = () => {
  const [selectedGroup, setSelectedGroup] = useState('');

  // 新規会員ならグループ作成ポップアップ
  const handleGroupClick = (groupname) => {
    setSelectedGroup(groupname); // グループがクリックされたときの処理
  };

  return (
    <>
      <GroupNav onGroupClick={handleGroupClick} />
      <ReactInfiniteScroll selectedGroup={selectedGroup} />
    </>
  );
};

export default Timeline;