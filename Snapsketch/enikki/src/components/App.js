import React, { Component } from 'react';
import $ from 'jquery';

class Timeline extends Component {
    constructor(props) {
        super(props);
        this.state = {
          posts: [] // 受け取ったpostデータを保持するためのstate
        };
      }

  handleGroupClick = (groupData) => {
    $.ajax({
      url: `/your-django-api-endpoint/${groupData.groupname}`,
      method: 'GET',
      success: (data) => {
        console.log('Data from Ajax request:', data);
        // データの取得に成功したら必要な処理をここに記述する
        // 例えば、取得したデータをstateにセットするなど
      },
      error: (xhr, status, error) => {
        console.error('There was a problem with the Ajax request:', error);
      }
    });
  }

  render() {
    return (
      <div>
        {/* ここにAjaxで取得したデータを反映する処理を追加 */}
        {this.props.groupList && (
          <div id="popup-wrapper">
            <div id="popup-inside">
              <div id="close">x</div>
              <form method="post" id="group-form" action="{% url 'enikki:ajax_group' %}" enctype="multipart/form-data">
                {/* CSRFトークンの追加 */}
                <input type="hidden" name="csrfmiddlewaretoken" value="{% csrf_token %}" />
                <h1>グループ作成</h1>
                <table>
                  <tbody>
                    <tr>
                      <th>グループ名:</th>
                      <td><input type="text" id="text" name="groupname" value="" /></td>
                    </tr>
                    <tr>
                      <th>アイコン:</th>
                      <td><input type="file" name="avator" /></td>
                    </tr>
                    <tr>
                      <th>概要:</th>
                      <td><input type="text" className="text2" value="" /></td>
                    </tr>
                  </tbody>
                </table>
                <input type="submit" id="createBtn" value="作成する" />
              </form>
            </div>
          </div>
        )}

        <div id="group-nav">
          {this.props.groupList &&
            this.props.groupList.map((group, index) => (
              <img
                key={index}
                className="group-icon"
                src={`/media/${group.group_icon_path}`}
                alt="グループアイコン"
                data-group={group.groupname}
                onClick={() => this.handleGroupClick(group)}
              />
            ))}
          <i className="fa-solid fa-plus"></i>
        </div>

        <div id="scroll">
          {this.props.posts &&
            this.props.posts.map((post, index) => (
              <article key={index} className="content" data-group="" data-page={post.page}>
                <div className="content_header">
                  <img className="user_icon" src="{% static 'images/test_icon.jpeg' %}" alt="ユーザーアイコン" />
                  <p className="user_name">{post.user__username}</p>
                  <div className="like">
                    {post.is_liked ? (
                      <button type="button" className="ajax-like">
                        <i className="fas fa-heart text-danger"></i>
                      </button>
                    ) : (
                      <button type="button" className="ajax-like">
                        <i className="far fa-heart text-danger"></i>
                      </button>
                    )}
                    <span className="like-count">{post.like_count}</span>
                  </div>
                  <div className="comment">
                    <a className="fa-regular fa-comment" href="{% url 'enikki:comment' %}?page={post.page}"></a>
                    <span className="comment-count">{post.comment_count}</span>
                  </div>
                </div>
                <section className="draw_diary">
                  <img className="draw" src={`/media/${post.sketch_path}`} alt="絵日記の絵" />
                  <p className="diary">{post.diary}</p>
                </section>
              </article>
            ))}
        </div>
      </div>
    );
  }
}

export default Timeline;
