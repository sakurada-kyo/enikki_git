import React, { useState, useEffect } from 'react';
import { List } from 'react-virtualized';
import Modal from 'react-modal';

const CalendarPopup = (props) => {
    const [posts, setPosts] = useState([])
    const [date,setDate] = useState(props.date)
    const [modalIsOpen, setModalIsOpen] = useState(true);

    const modalStyle = {
        overlay: {
          position: "fixed",
          top: 0,
          left: 0,
          backgroundColor: "rgba(0,0,0,0.85)"
        },
        content: {
          position: "absolute",
          top: "5rem",
          left: "5rem",
          right: "5rem",
          bottom: "5rem",
          backgroundColor: "paleturquoise",
          borderRadius: "1rem",
          padding: "1.5rem"
        }
      };

    // 最初に投稿取得
    useEffect(() => {
        fetchPosts(date)
    }, [])

    // モーダルを開く
    const openModal = () => {
        setModalIsOpen(true);
    };

    // モーダルを閉じる
    const closeModal = () => {
        setModalIsOpen(false);
    };

    //いいね機能
    const fetchLike = async (event) => {
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

        try {
            // fetch APIを使ってデータを取得
            const res = await fetch(url, options);

            // レスポンスをJSON形式に変換
            const responseData = await res.json();

            // レスポンスデータからpostsを取得
            const parsePostList = responseData.posts;

            // postsにセット
            setPosts(parsePostList);

            // pageセット
            setPage(parsePostList.length);

        } catch (e) {
            console.log(e);
        }
    }

    // クリックした投稿取得
    const fetchPosts = async (date) => {
        console.log(`date:${date}`)
        const formData = new FormData()
        formData.append('date', date)
        const url = '/enikki/fetch_calendar_posts/';
        const options = {
            method: "POST",
            headers: {
                'X-CSRFToken': csrftoken
            },
            body: formData
        }

        try {
            // fetch APIを使ってデータを取得
            const res = await fetch(url, options);

            // レスポンスをJSON形式に変換
            const responseData = await res.json();

            // const parsePostList = JSON.parse(responseData.posts);
            const parsePostList = responseData.posts;

            // postsにセット
            setPosts(parsePostList);

        } catch (e) {
            console.log(e);
        }
    }

    // 投稿レンダリング
    const ContentsRenderer = () => {

        return (
            <>
                {posts.map((post) => (
                    <article key={post.post__post_id} className="content" data-page={post.page}>
                        <div className="content_header">
                            <img className="user_icon" src={`/media/${post.post__user__user_icon_path}`} alt="ユーザーアイコン" />
                            <p className="user_name">{post.post__user__username}</p>
                            <div className="like">
                                <button type="button" className="ajax-like" onClick={fetchLike}>
                                    {post.is_liked ? (
                                        // すでにいいねしている時
                                        <i className="fas fa-heart text-danger"></i>
                                    ) : (
                                        // いいねしていないときはfarクラス
                                        <i className="far fa-heart text-danger"></i>
                                    )}
                                </button>
                                <span className="like-count">{post.post__like_count}</span>
                            </div>
                            <div className="comment">
                                <a className="fa-regular fa-comment" href={`/enikki/comment/?page=${post.page}`} />
                                <span className="comment-count">{post.post__comment_count}</span>
                            </div>
                        </div>
                        <section className="draw_diary">
                            <img className="draw" src={`/media/${post.post__sketch_path}`} alt="絵日記の絵" />
                            <p className="diary">{post.post__diary}</p>
                        </section>
                    </article>
                ))
                }
            </>
        )
    }

    return (
        <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Calendar Popup"
            style={modalStyle}
        >
            <List
                width={940}
                height={710}
                rowCount={posts.length}
                rowHeight={709}
                rowRenderer={ContentsRenderer}
            />
        </Modal>
    )
}

export default CalendarPopup