import React, { useState, useEffect } from 'react';

const Post = (props) => {
    const page = props.post.page;
    const username = props.post.user__username;
    const userIcon = props.post.user_icon_path;
    const isLiked = props.post.is_liked;
    const likeCount = props.post.like_count;
    const commentCount = props.post.page;
    const sketch = props.post.sketch_path;
    const diary = props.post.diary;
    
    return (
        <>
            <div key={index} className="content" data-page={page}> {/*key値はpost_id使う*/}
                <div className="content_header">
                    <img className="user_icon" src={userIcon} alt="ユーザーアイコン" />
                    <p className="user_name">{username}</p>
                    <div className="like">
                        {isLiked ? (
                            <button type="button" className="ajax-like">
                                <i className="fas fa-heart text-danger"></i>
                            </button>
                        ) : (
                            <button type="button" className="ajax-like">
                                <i className="far fa-heart text-danger"></i>
                            </button>
                        )}
                        <span className="like-count">{likeCount}</span>
                    </div>
                    <div className="comment">
                        <a className="fa-regular fa-comment" href={`?page=${page}`}></a>
                        <span className="comment-count">{commentCount}</span>
                    </div>
                </div>
                <div className="draw_diary">
                    <img className="draw" src={`/media/${sketch}`} alt="絵日記の絵" />
                    <p className="diary">{diary}</p>
                </div>
            </div>
        </>
    )
}

export default Post;

// いいね機能
// コメント機能
// 投稿ページ遷移