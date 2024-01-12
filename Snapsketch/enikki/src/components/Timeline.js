import React, { useState, useEffect } from 'react';
import GroupNav from './GroupNav';
import ReactInfiniteScroll from './ReactInfiniteScroll';

const Timeline = () => {
  const [selectedGroup, setSelectedGroup] = useState('');
  const [newFlg,setNewFlg] = useState(true);

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

//いいね機能
//グループ追加機能
//新規登録時、ポップアップ