import React, { useState, useEffect } from 'react';
import GroupNav from './GroupNav';
import ReactInfiniteScroll from './ReactInfiniteScroll';
import GroupCreatePopup from './GroupCreatePopup';

const Timeline = () => {
  const [selectedGroup, setSelectedGroup] = useState('');
  const [newFlg,setNewFlg] = useState(true);
  const [showGroupNavAndInfiniteScroll, setShowGroupNavAndInfiniteScroll] = useState(false);

  // 新規会員ならグループ作成ポップアップ
  const handleGroupClick = (groupname) => {
    setSelectedGroup(groupname); // グループがクリックされたときの処理
  };

  

  // GroupNavとReactInfiniteScrollを表示する処理
  const handleShowGroupNavAndInfiniteScroll = () => {
    setShowGroupNavAndInfiniteScroll(true);
  };

  return (
    <>
      <GroupCreatePopup handleAddGroup={handleGroupClick} showGroupNavAndInfiniteScroll={handleShowGroupNavAndInfiniteScroll} />
      {showGroupNavAndInfiniteScroll && (
        <div>
          <GroupNav />
          <ReactInfiniteScroll />
        </div>
      )}
    </>
  );
};
export default Timeline;
