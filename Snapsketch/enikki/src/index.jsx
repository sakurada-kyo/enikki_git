import React from 'react';
import ReactDOM from 'react-dom';
import Timeline from './Timeline'; // Timeline コンポーネントのインポート
import InfiniteScroll from 'react-infinite-scroller';

// Timeline コンポーネントを id="box" の要素にマウントする
ReactDOM.render(<Timeline />, document.getElementById('box'));
