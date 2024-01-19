import React, { useState, useEffect } from 'react';
import GroupNav from './GroupNav';
import ReactInfiniteScroll from './ReactInfiniteScroll';
import GroupCreatePopup from './GroupCreatePopup';

const Timeline = () => {
  const [selectedGroup, setSelectedGroup] = useState('');
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
      <GroupCreatePopup showGroupNavAndInfiniteScroll={handleShowGroupNavAndInfiniteScroll} />
      {showGroupNavAndInfiniteScroll && (
        <div>
          <GroupNav onGroupClick={handleGroupClick} />
          <ReactInfiniteScroll selectedGroup={selectedGroup} />
        </div>
      )}
    </>
  );
};

export default Timeline;