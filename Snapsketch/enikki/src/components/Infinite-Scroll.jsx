import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

const InfiniteScroll = (props) => {
  const posts = props.posts;
    return(
      <div id='scroll'>
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
    )
}
export default InfiniteScroll;