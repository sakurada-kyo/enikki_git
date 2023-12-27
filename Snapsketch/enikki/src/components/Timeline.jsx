import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import GroupNav from './GroupNav';
import Post from './Post';
import InfiniteScroll from './Infinite-Scroll';

// 他の必要なコンポーネントやライブラリのインポート

const Timeline = () => {
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchPosts(); // 初回の投稿データ取得
  }, []);

  useEffect(() => {
    loadMore(); // 追加の投稿データ取得
  }, [posts]);

  useEffect(() => {
    changeGroup(); // グループ切り替え取得
  }, [posts]);

  //投稿を取得
  const fetchPosts = async () => {
    // データを取得する処理を記述する
    // setPostsやsetHasMoreを使用して状態を更新する
    const url = "/enikki/react_timeline/";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page: 0 //最後のページ番号を渡す
      })
    }

    try {
      // fetch APIを使ってデータを取得
      const res = await fetch(url,options);

      // レスポンスをJSON形式に変換
      const responseData = await res.json();

      // postsにセット
      setPosts(responseData.posts);

    } catch (e) {
      console.log("エラーが発生しました", e);
    }
  };

  const loadMore = () => {
    // 新しい投稿を読み込む処理を記述する

  };

  const changeGroup = () => {
    // 切り替えたグループの投稿を取得する処理

  };

  return (
    <>
      <GroupNav />
      <InfiniteScroll posts={posts}/>
    </>
  );
};

export default Timeline;
