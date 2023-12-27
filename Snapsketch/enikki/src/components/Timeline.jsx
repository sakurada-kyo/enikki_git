import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import GroupNav from './GroupNav';
import Post from './Post';

// 他の必要なコンポーネントやライブラリのインポート

const Timeline = () => {
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchPosts(); // 初回の投稿データ取得
  }, []);

  const fetchPosts = async () => {
    // データを取得する処理を記述する
    // setPostsやsetHasMoreを使用して状態を更新する
    const url = "/enikki/react_timeline/";
    try {
      // fetch APIを使ってデータを取得
      const res = await fetch(url);

      // レスポンスをJSON形式に変換
      const responseDataes = await res.json();

    } catch (e) {
      console.log("エラーが発生しました", e);
    }

  };

  const loadMore = () => {
    // 新しい投稿を読み込む処理を記述する
  };

  return (
    <>
      <GroupNav />
      <div id="scroll">
        {/* 他のコンポーネントや要素をここに追加できます */}
        <InfiniteScroll
          pageStart={0}
          loadMore={loadMore}
          hasMore={hasMore}
          loader={<div key={0}>読み込み中...</div>}
        >
          {posts.map((post) => {
            <Post {...post} />
          })}
          
        </InfiniteScroll>
      </div>
    </>
  );
};

export default Timeline;
