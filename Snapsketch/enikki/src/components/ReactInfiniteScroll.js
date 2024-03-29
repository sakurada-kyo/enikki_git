import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

const ReactInfiniteScroll = (props) => {
  const [posts,setPosts] = useState([]);
  const [page,setPage] = useState(1);
  const [hasMore,setHasMore] = useState(true);
  const selectedGroup = props.selectedGroup;
  // let handleClickedPage = '';
  // let [clickedPage, setClickedPage] = useState(null);

  // 最初に投稿取得
  useEffect(() => {
    fetchPosts()
  }, []);

  // グループ変更時に投稿取得
  useEffect(() => {
    if (selectedGroup) {
      fetchPosts(selectedGroup); // グループリストが変更されたときの処理
    }
  }, [selectedGroup]);

 

  //いいね機能
  const fetchLike = async(event) => {
    const articleElem = event.target.closest('.content');
    const clickedPage = articleElem.getAttribute('data-page');
    const formData = new FormData();
    formData.append('page', clickedPage);

    const url = '/enikki/timeline/fetch_like/';
    const options = {
      method: "POST",
      headers: {
        'X-CSRFToken': csrftoken
      },
      body: formData
    }

    try{
        // fetch APIを使ってデータを取得
        const res = await fetch(url,options);

        // レスポンスをJSON形式に変換
        const responseData = await res.json();

        // レスポンスデータからpostsを取得
        const parsePostList = responseData.posts;

        // postsにセット
        setPosts(parsePostList);

        // pageセット
        setPage(parsePostList.length);

    } catch(e){
        console.log(e);
    }
  }

  const fetchPosts = async(groupname) => {
    const url = '/enikki/timeline/fetch_posts/';
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'X-CSRFToken': csrftoken
      }
    }

    if(groupname){
      options.body = JSON.stringify({
        'group':groupname
      })
    }

    try{
        // fetch APIを使ってデータを取得
        const res = await fetch(url,options);

        // レスポンスをJSON形式に変換
        const responseData = await res.json();

        // const parsePostList = JSON.parse(responseData.posts);
        const parsePostList = responseData.posts;

        // postsにセット
        setPosts(parsePostList);

        // pageセット
        setPage(parsePostList.length);

    } catch(e){
        console.log(e);
    }
  }

  const loadMore = async() => {
    const url = '/enikki/fetch_loadmore/';
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'X-CSRFToken': csrftoken
      },
      body: JSON.stringify({
        group: 'group1',
        page: page
      })
    }

      try{

        // fetch APIを使ってデータを取得
        const res = await fetch(url,options);

        // レスポンスをJSON形式に変換
        const responseData = await res.json();

        const loadDatas = responseData.posts;

        // postsに追加
        setPosts(prevPosts => [...prevPosts, ...loadDatas]);

        // page更新
        setPage(posts.length);

        // もし新しいデータがなければhasMoreをfalseに設定
        if (loadDatas) {
          setHasMore(false);
        }

    } catch(e){
        console.log('エラーが発生しました')
    }
  }

    return(
      <div id='scroll'>
        <InfiniteScroll
          pageStart={1}
          loadMore={loadMore}
          hasMore={hasMore}
        >
          {posts.map((post) => (
            <article key={post.post__post_id} className="content" data-page={ post.page }>
              <div className="content_header">
                  <img className="user-icon" src={`/media/${post.post__user__user_icon_path}`} alt="ユーザーアイコン" />
                  <p className="user-name">{ post.post__user__username }</p>
                  <div className="like">
                    <button type="button" className="ajax-like" onClick={fetchLike}>
                      {post.is_liked ? (
                        // すでにいいねしている時
                        <i className="fas fa-heart text-danger"></i>
                      ):(
                        // いいねしていないときはfarクラス
                        <i className="far fa-heart text-danger"></i>
                      )}
                    </button>
                    <span className="like-count">{ post.post__like_count }</span>
                  </div>
                  <div className="comment">
                    <a href={`/enikki/comment/?page=${ post.page }`}>
                      <i className="fa-regular fa-comment"  />
                    </a>
                     <span className="comment-count">{ post.post__comment_count }</span>
                  </div>
              </div>
              <section className="draw_diary">
                  <img className="draw" src={`/media/${ post.post__sketch_path }`} alt="絵日記の絵" />
                  <p className="diary">{ post.post__diary }</p>
              </section>
            </article>
          ))}
        </InfiniteScroll>
      </div>
    )
}
export default ReactInfiniteScroll;