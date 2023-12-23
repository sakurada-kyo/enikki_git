import React, { Component } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import GroupNav from './GroupNav';

class Timeline extends Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      hasMore: true
      // 他の必要なstateや関数をここに追加する可能性があります
    };
  }

  componentDidMount() {
    this.fetchPosts(); // 初回の投稿データ取得
  }

  // 仮の投稿データを取得する関数（APIからの取得を想定）
  fetchPosts = async () => {
    // 実際のデータを取得する処理を記述
    // 例：fetchやaxiosを使ってデータを取得する
    // 取得したデータを新しい配列に追加し、this.setStateでstateを更新する
  };

  // スクロール時に新しい投稿を読み込む関数
  loadMore = () => {
    // ロード時の処理を記述
    // 例：fetchPostsを使って新しいデータを取得し、既存の投稿データに追加する
    // 必要に応じてhasMoreを更新する
  };

  render() {
    const { posts, hasMore } = this.state;


    return (
      <>
        <GroupNav />
        <div id="scroll">
          {/* 他のコンポーネントや要素をここに追加する可能性があります */}
          <InfiniteScroll
            pageStart={0}
            loadMore={this.loadMore}
            hasMore={hasMore}
            loader={<div key={0}>Loading...</div>}
          >
            {posts.map((post, index) => (
              <article key={index} className="content" data-page={post.page}>
                <div className="content_header">
                  <img className="user_icon" src="" alt="ユーザーアイコン" />
                  <p class="user_name">{post.user__username}</p>
                  <div class="like">
                    {/* <!-- すでにいいねしている時はfasクラス --> */}
                    {post.is_liked ? (
                      <button type="button" className="ajax-like">
                        <i className="fas fa-heart text-danger"></i>
                      </button>
                    ) : (
                      <button type="button" className="ajax-like">
                        <i className="far fa-heart text-danger"></i>
                      </button>
                    )}
                    {/* <!-- いいねの数 --> */}
                    <span class="like-count">{post.like_count}</span>
                  </div>
                  <div class="comment">
                    {/* <!--グループ名とページ番号送信--> */}
                    <a class="fa-regular fa-comment" href="?page={{ post.page }}"></a>
                    <span class="comment-count">{post.comment_count}</span>
                  </div>
                </div>
                <div class="draw_diary">
                  <img class="draw" src="/media/{{ post.sketch_path }}" alt="絵日記の絵" />
                  <p class="diary">{post.diary}</p>
                </div>
              </article>
            ))}
          </InfiniteScroll>
        </div>
      </>
    );
  }
}

export default Timeline;
