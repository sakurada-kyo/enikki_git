from audioop import reverse
import calendar
from typing import Any
from uuid import UUID
from django.conf import settings
from django.forms import ValidationError
from django.http.response import HttpResponse as HttpResponse
from django.views.generic import TemplateView
import json
import os
from django.db.models import Q
import tempfile
from datetime import datetime
from django.http import Http404, HttpRequest, HttpResponse, HttpResponseServerError, JsonResponse
from django.shortcuts import get_list_or_404, get_object_or_404, redirect, render
from .models import PostMaster
from django.utils.crypto import get_random_string
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile
from .models import *
from django.core.paginator import Paginator
from django.core import serializers
from django.db.models import F, Max, Subquery, OuterRef
from .forms import UpLoadProfileImgForm
from django.db import transaction
from django.utils import timezone
from django.contrib.sessions.models import Session
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin

# グループ作成画面表示
def create_group(request):
    print('create_group')
    if request.method == 'GET':
        return render(request,template_name='groupCreate.html')

    if request.method == 'POST':

        # ログインユーザー取得
        user = request.user

        # リクエストデータ取得
        groupname = request.POST['groupname']
        group_icon = request.FILES['group-icon']

        # DBへ保存
        group = GroupMaster.objects.create(groupname=groupname,group_icon_path=group_icon)
        UserGroupTable.objects.create(user=user,group=group)

        # セッションへ保存
        group_list = [groupname]
        request.session['groupList'] = group_list
        request.session['currentGroup'] = groupname

        return render(request,template_name='timeline.html')

# # タイムライン画面表示
class TimelineView(LoginRequiredMixin,TemplateView):
    template_name = "timeline.html"

    def get(self, request, *args, **kwargs):
        print("GET")
        return render(request, self.template_name)

# ajaxタイムライン
def ajax_timeline(request):
    if request.method == "POST":
        return getPost(request)
    else:
        return JsonResponse({"error": "POSTメソッドを使用してください"})

# 投稿取得関数
def getPost(request):
    try:
        group_name = request.session.get("currentGroup")  # グループ名
        page_number = int(request.POST.get("page", 1))  # 現在のページ番号
        print(f"page_number:{page_number},currentGroup:{group_name}")
        page_size = 10  # 1ページあたりの要素数

        if group_name and page_number:
            # グループ名を使って関連する投稿を取得
            group_posts = GroupPostTable.objects.filter(
                group__groupname=group_name, page__gt=page_number
            )

            if group_posts.exists():
                post_ids = group_posts.values_list("post__post_id", flat=True)

                posts = (
                    PostMaster.objects.filter(post_id__in=post_ids)
                    .values(
                        "sketch_path",
                        "diary",
                        "user__username",
                        "user__user_icon_path",
                        "like_count",
                        "commentCount",
                    )
                    .order_by("updated_at")
                    .distinct()
                )

                # GroupPostTable内のpage情報をpostsに追加
                for post, group_post in zip(posts, group_posts):
                    post["page"] = group_post.page
            else:
                raise Http404

            if posts:
                # ログイン中のユーザーが各投稿に対していいねしているかどうかを取得するサブクエリ
                liked_posts = LikeTable.objects.filter(
                    user=request.user, post__in=posts
                ).values_list("post", flat=True)

                # Paginatorを使用してページ分割
                paginator = Paginator(posts, page_size, orphans=1)

                all_pages_data = []
                for page_num in paginator.page_range:
                    page_data = paginator.page(page_num)

                    # 投稿データのシリアライズ
                    serialized_data = serializers.serialize(
                        "json", page_data, ensure_ascii=False
                    )

                    # ユーザーがいいねしているかどうかを投稿データに追加
                    for entry in serialized_data:
                        post_id = entry["pk"]
                        entry["fields"]["is_liked"] = post_id in liked_posts

                    all_pages_data.append(
                        {
                            "data": serialized_data,
                            "has_next": page_data.has_next(),
                            "has_previous": page_data.has_previous(),
                            "number": page_data.number,  # ページ番号
                            "group": group_name,
                        }
                    )

                return JsonResponse(
                    {
                        "all_pages_data": all_pages_data,
                        "total_pages": paginator.num_pages,
                    }
                )
            else:
                raise Http404
        else:
            return JsonResponse({"error": "groupかpageがありません"})

    except Http404:
        print("読み込みデータがありません")
        return JsonResponse({"error": "読み込みデータがありません"})

# グループ切り替え処理
def ajax_changeGroup(request):
    print("ajax_changeGroup")
    if request.method == "POST":
        try:
            groupname = request.POST.get("groupname", "")  # グループ名
            if groupname:
                # セッションからグループ名取得
                currentGroup = request.session["currentGroup"]

                if currentGroup == groupname:
                    print(f"currentGroup:{currentGroup},requestGroupname:{groupname}")
                    print("グループ名一致のため、グループ切り替え処理しない")
                    JsonResponse({"response": None})

                request.session["currentGroup"] = groupname

                group_posts = (
                    GroupPostTable.objects.filter(group__groupname=groupname)
                    .select_related("group", "post")
                    .values(
                        "post__post_id",
                        "post__user__username",
                        "post__user__user_icon_path",
                        "post__sketch_path",
                        "post__diary",
                        "post__like_count",
                        "post__comment_count",
                        "page",
                    )
                    .order_by("post__updated_at")
                )

                if group_posts.exists():
                    # 投稿に対するいいねの情報を取得
                    liked_posts = LikeTable.objects.filter(
                        user=request.user,
                        post__in=group_posts.values_list("post__post_id", flat=True),
                    ).values_list("post", flat=True)

                    # ユーザーがいいねしているかどうかを投稿データに追加
                    for entry in group_posts:
                        post_id = entry["post__post_id"]
                        entry["is_liked"] = post_id in liked_posts
                        del entry["post__post_id"]

                    grouppostsList = list(group_posts)

                    return JsonResponse({"data": json.dumps(grouppostsList)})
                else:
                    raise Http404("読み込みデータがありません")
            else:
                return JsonResponse({"error": "グループ名がありません"})
        except Http404 as e:
            print(str(e))  # デバッグ用のエラーメッセージ
            return JsonResponse({"error": "読み込みデータがありません"})
    else:
        return JsonResponse({"error": "POSTメソッドを使用してください"})


# コメントページ表示
class CommentView(LoginRequiredMixin,TemplateView):
    def get(self, request, *args, **kwargs):
        context = {}
        
        user = request.user

        # セッションからグループ名取得
        groupName = request.session["currentGroup"]
        if not groupName:
            print("グループに所属していません")
            redirect("timeline")

        # ページ番号取得
        page = int(request.GET.get("page"))

        # グループ名を使って関連する投稿を取得
        group_post = (
            GroupPostTable.objects.filter(group__groupname=groupName, page=page)
            .select_related("post")
            .values(
                "post__post_id",
                "post__sketch_path",
                "post__diary",
                "post__like_count",
                "post__comment_count",
                "post__user__username",
                "post__user__user_icon_path",
                "page",
            )
        )

        group_post_list = list(group_post)  # QuerySet をリストに変換

        # 投稿 ID を取得
        post_id = str(group_post_list[0]["post__post_id"])

        for post in group_post_list:
            post_likes = LikeTable.objects.filter(
                user=user, post__post_id=post_id
            ).exists()
            post["is_liked"] = post_likes
            post.pop("post__post_id", None)  # 'post__post_id' を削除

        # post_idセッションの有無
        if "post_id" in request.session:
            del request.session["post_id"]

        # post_idセッション設定
        request.session["post_id"] = post_id

        # 投稿に紐づくコメントを取得
        comments = (
            CommentMaster.objects.filter(post=post_id)
            .select_related("user")
            .values(
                "user__username",
                "user__user_icon_path",
                "comment",
            )
        )

        if not comments:
            context["error"] = "コメントがありません"

        context["comments"] = comments
        context["post"] = group_post_list[0]

        return render(request, "comment.html", context)

# ajaxコメント
def ajax_comment(request):
    print(f"ajax_comment")
    if request.method == "POST":
        user = request.user
        comment = request.POST.get("comment")
        if comment:
            if "post_id" in request.session:
                post_id = request.session["post_id"]
                print(f"post_id:{post_id}")
                post = PostMaster.objects.get(pk=post_id)
                # 新しいコメントを作成する例
                new_comment = CommentMaster(
                    user=user,  # ユーザーは適切な方法で取得する必要があります
                    post=post,  # セッションから取得したpost_idに紐づくPostMasterインスタンスを指定
                    comment=comment,  # コメントの内容を適切なものに置き換える
                )
                new_comment.save()  # 新しいコメントを保存する

                comment_data = {
                    "username": new_comment.user.username,
                    "usericon": new_comment.user.user_icon_path.url,
                    "comment": new_comment.comment,
                }

                return JsonResponse({"comment_data": comment_data})
            else:
                return JsonResponse({"error": "post_idがありません"})
        else:
            return JsonResponse({"error": "コメントがありません"})

def delete_comment(request):
    comment_id = request.POST.get("comment_id")
    print(comment_id)
    if comment_id:
        comment_uuid = [uuid.UUID(str(comment_id))]  # UUIDを文字列に変換

        comment = CommentMaster.objects.get(pk=comment_uuid)
        comment.delete()
        return JsonResponse({"success": True})
    else:
        return JsonResponse({"error": "指定されたコメントが見つかりません"})



# 一時ファイル保存
def save_uploaded_file(file):
    try:
        # 一時ディレクトリに一時ファイルを作成
        temp_dir = tempfile.gettempdir()
        temp_file = tempfile.NamedTemporaryFile(delete=False, dir=temp_dir)

        # 受け取ったファイルのデータを一時ファイルに書き込む
        for chunk in file.chunks():
            temp_file.write(chunk)

        # ファイルを一時ファイルから指定したディレクトリに移動
        destination = "/path/to/destination/directory/filename.jpg"  # 実際のパスに置き換えてください
        os.rename(temp_file.name, destination)  # ファイルを移動

        return destination  # ファイルの保存先パスを返す
    finally:
        temp_file.close()  # 一時ファイルをクローズする

# キャンバス画面
class CanvasView(LoginRequiredMixin,TemplateView):
    template_name = "canvas.html"

    def get(self, request, *args, **kwargs):
        print("GET")
        return render(request, self.template_name)

    def post(self, request, *args, **kwargs):
        print("POST")

        self.template_name = "create.html"

        # 画像ファイルの取得とバリデーション
        if "img" in request.FILES:
            reqFile = request.FILES["img"]
            reqFileName = reqFile.name
            reqFileBinary = reqFile.read()

            try:
                # バイナリデータをPIL Imageに変換する
                image = Image.open(BytesIO(reqFileBinary))

                # JPEG形式に変換（もしJPEGでない場合は変換が必要です）
                if image.format != "JPEG":
                    image = image.convert("RGB")

                # 保存する画像のファイル名
                rand = get_random_string(3)
                imgFileName = f"u{rand}_{reqFileName}.jpg"

                # 画像を一時的にBytesIOに保存してから、ContentFileを使用してファイルフィールドに保存
                image_io = BytesIO()
                image.save(image_io, format="JPEG")
                image_content = ContentFile(image_io.getvalue(), name=imgFileName)

                user = request.user

                date = timezone.now().date()

                try:
                    # 指定した日付とログインユーザーに基づいてレコードを抽出
                    post = PostMaster.objects.filter(
                        user=user,
                        created_at__year=date.year,
                        created_at__month=date.month,
                        created_at__day=date.day,
                    ).first()
                    
                    if post:
                        post.sketch_path = image_content  # 日記を更新する場合
                        post.save()  # 変更を保存
                    else:
                        post = PostMaster.objects.create(
                            sketch_path=image_content, user=user
                        )
                except Exception as e:
                    print(str(e))  # エラーを表示するなど適切な処理を行う

                # sketch/username/filename
                context = {"canvasFile": f"{post.sketch_path.url}"}

                return render(request, self.template_name, context)

            except IOError:
                # 画像が正しく読み込めない場合のエラーハンドリング
                print("IOエラーが発生しました。")


# 絵日記作成画面
class CreateView(LoginRequiredMixin,TemplateView):
    template_name = 'create.html'

    def get(self, request, *args, **kwargs):
        print("GET")
        return render(request, self.template_name)

    def post(self, request, *args, **kwargs):
        print("CreateView:POST")

        # ユーザー取得
        user = request.user
        # 日記取得
        diary = request.POST.get("sentence", "")
        # 日付取得（時刻ではなく日付のみ）
        date = timezone.now().date()

        try:
            # ユーザーの投稿を取得または作成
            post, created = PostMaster.objects.get_or_create(
                user=user,
                created_at__year=date.year,
                created_at__month=date.month,
                created_at__day=date.day,
                defaults={"diary": diary},
            )

            if not created:
                print(f"not created")
                post.diary = diary  # 日記を更新
                post.save()

            if "groupList" in request.session:
                group_names = request.session["groupList"]
                groups = GroupMaster.objects.filter(groupname__in=group_names)
                max_pages = (
                    GroupPostTable.objects.filter(group__in=groups)
                    .values("group")
                    .annotate(max_page=Max("page"))
                    .values("max_page")
                )

                new_group_posts = []

                if not max_pages:  # max_pagesが空の場合
                    for group in groups:
                        new_group_posts.append(
                            GroupPostTable(group=group, post=post, page=1)
                        )  # pageを1に設定
                else:
                    for group in groups:
                        max_page = (
                            max_pages.filter(group=group.group_id)
                            .order_by("-group__created_at")
                            .first()
                        )
                        page_value = 1 if max_page is None else max_page["max_page"] + 1
                        new_group_posts.append(
                            GroupPostTable(group=group, post=post, page=page_value)
                        )

                GroupPostTable.objects.bulk_create(new_group_posts)

        except Exception as e:
            print(str(e))  # エラーを表示するなど適切な処理を行う

        return redirect("enikki:timeline")


# カレンダー画面
class CalendarView(LoginRequiredMixin,TemplateView):

    template_name = 'calendar.html'

    def get(self, request, *args, **kwargs):
        print("GET:CalendarView")
        context = {}
        # セッションから現在のグループ取得
        currentGroup = request.session["currentGroup"]
        # ログインユーザー取得
        user = self.request.user
        # DBから投稿した日付を取得
        dates = (
            GroupPostTable.objects.filter(
                post__user=user, group__groupname=currentGroup
            )
            .select_related("post", "group")
            .values_list("post__created_at", flat=True)
            .distinct()
        )

        # 日付を文字列に変換
        formatted_dates = [date.strftime("%Y-%m-%d") for date in dates]

        context["dates"] = json.dumps(formatted_dates)

        return render(request, self.template_name, context)


def ajax_calendar(request):
    if request.method == "POST":
        print("ajax_calendar")
        user = request.user  # ログインユーザー
        currentGroup = request.session["currentGroup"]  # 現在グループ取得
        dateStr = request.POST.get("date")  # 日付取得

        # 日付文字列を適切な型に変換（例：YYYY-MM-DDの文字列をdatetimeオブジェクトに変換）
        date = datetime.strptime(dateStr, "%Y-%m-%d").date()

        # 日付からグループ内の投稿取得
        groupposts = (
            GroupPostTable.objects.filter(group__groupname=currentGroup)
            .filter(post__created_at=date)
            .select_related("post", "group")
            .values(
                "post__post_id",
                "post__sketch_path",
                "post__diary",
                "post__user__username",
                "post__user__user_icon_path",
                "post__like_count",
                "post__comment_count",
                "page",
            )
            .distinct()
        )

        # いいね情報を取得
        post_ids = [post["post__post_id"] for post in groupposts]
        likes = LikeTable.objects.filter(
            user=user, post__post_id__in=post_ids
        ).values_list("post__post_id", flat=True)

        # ポストにいいね情報を追加
        for post in groupposts:
            post_id = post["post__post_id"]
            # ユーザーがその投稿にいいねしているかどうかを確認し、いいねの状態を追加
            post["is_liked"] = post_id in likes
            del post["post__post_id"]

        print(f"groupposts:{groupposts}")

        groupposts_list = list(groupposts)

        # リクエストが POST でない場合のデフォルトのレスポンス
        return JsonResponse(
            {"posts": json.dumps(groupposts_list), "currentGroup": currentGroup}
        )


class FriendView(LoginRequiredMixin,TemplateView):
    template_name = 'friend.html'

    def get(self, request, *args, **kwargs):
        user = request.user
        friends = self.get_mutual_friends(user)

        context = {"friends": friends}
        return render(request, self.template_name, context)

    def get_mutual_friends(self, user):
        try:
            follower_ids = Follower.objects.filter(followee=user).values_list(
                "follower", flat=True
            )
            friends = Follower.objects.filter(follower=user, followee__in=follower_ids)
            return friends
        except Follower.DoesNotExist:
            raise Http404("You have no friends.")
    def post(self, request, *args, **kwargs):
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            username = request.POST.get('username')

            friend = get_object_or_404(Follower, follower=request.user, followee__username=username)
            friend.delete()

            return JsonResponse({'success': True})

        return JsonResponse({'error': 'Invalid Request'}, status=400)


def view_accountConfView(request):
    # print('view_accountConf')
    # template_name = 'login.html'
    context = {}

    return render(request, 'accountConf.html', context)

# ユーザー検索機能
class SearchView(TemplateView):
    template_name = "usersearch.html"

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name)

# ユーザー検索ajax
def ajax_search(request):
    print('ajax_search')
    if request.method == "POST":
        # 検索対象のユーザーID取得
        search_id = request.POST.get('searchId')
        
        # ログインユーザーのID
        user = request.user
        
        # 検索対象のユーザーIDがなかった場合
        if not search_id:
            return JsonResponse({'error':'IDを入力してください'})
        
        # ユーザーモデル定義
        user_model = get_user_model()
        
        try:
            # 検索対象のユーザーインスタンス
            searched_user = user_model.objects.get(user_id=search_id)
            
            # フォロー済みかどうか
            is_followed = Follower.objects.filter(follower=searched_user,followee=user).exists()
        except (ValidationError,user_model.DoesNotExist) as e:
            print(e)
            return JsonResponse({'error':'検索されたユーザー存在しません'})
        
        # レスポンスデータ
        context = {
            'user_id':searched_user.user_id,
            'username':searched_user.username,
            'user_icon_path':searched_user.user_icon_path.url,
            'is_followed':is_followed
        }
        
        return JsonResponse({'context':context})

def ajax_follow(request):
    if request.method == "POST":
        # フォロー対象のユーザーID
        followed_id = request.POST.get('followId') 
        
        # ログイン中のユーザー
        user = request.user
        
        # ユーザーモデル取得
        user_model = get_user_model()
        
        # フォロー対象のユーザーインスタンス
        followed_user = user_model.objects.get(user_id=followed_id)
        
        # DBへ保存
        Follower.objects.create(follower=followed_user, followee=user)
        
        return JsonResponse({'msg':'フォロー成功'})

#友達申請処理
# def request_view(request):
#     if request.method == 'GET':
#         user_id = request.user.user_id

#         followers = (
#             Follower.objects
#             .filter(follower__user_id=user_id)
#             .exclude(followee__user_id=user_id)
#             .select_related('followee')
#             .values(
#                 'followee__user_id',
#                 'followee__username',
#                 'followee__user_icon_path'
#             )
#         )

#         context = {
#             'followers':followers
#         }

#         return render(request,template_name='request.html',context)

#友達申請処理
class RequestView(TemplateView):
    template_name = "request.html"

    def get(self, request, *args, **kwargs):
        user_id = request.user.user_id

        followers = (
            Follower.objects
            .filter(follower__user_id=user_id)
            .exclude(followee__user_id=user_id)
            .select_related('followee')
            .values(
                'followee__user_id',
                'followee__username',
                'followee__user_icon_path'
            )
        )

        context = {
            'followers':followers
        }

        return render(request,self.template_name,context)

# フォローリクエスト許可機能
def allow(request):
    print('allow')
    if request.method == 'POST':
        followed_id = request.POST.get('followerID')
        user_id = request.user.user_id
        Follower.objects.create(follower=followed_id, followee=user_id)
        return JsonResponse({'msg':'承認しました'})

# マイページ機能
class MypageView(LoginRequiredMixin,TemplateView):
    template_name = 'myPage.html'

    def get(self, request, *args, **kwargs):
        print("GET")
        context = {}
        if self.request.user.is_authenticated:
            print("ログイン成功")
            try:
                User = get_user_model()
                user = get_object_or_404(User, username=self.request.user.username)
                context["username"] = user.username
                context["email"] = user.email
                context["password"] = user.password
                context["user_icon"] = user.user_icon_path.url
                # context['introduction'] = user.introduction
                # context['icon_path'] = user.icon_path
            except Http404:
                context["error"] = "ユーザーが見つかりません"
            return render(request, self.template_name, context)
        else:
            redirect("login_app:login")


def mypage_icon(request):
    print("icon")
    # ユーザーアイコンの変更処理
    if request.method == "POST":
        user = request.user

        # ユーザーがアップロードしたファイルを取得
        uploaded_file = request.FILES.get("user_icon")

        # ファイルが選択されているか確認
        print(f"uploaded file{uploaded_file}")
        if uploaded_file:
            reqFileName = uploaded_file.name
            reqFileBinary = uploaded_file.read()

            try:
                # バイナリデータをPIL Imageに変換する
                image = Image.open(BytesIO(reqFileBinary))

                # JPEG形式に変換（もしJPEGでない場合は変換が必要です）
                if image.format != "JPEG":
                    image = image.convert("RGB")

                # 保存する画像のファイル名
                rand = get_random_string(3)
                imgFileName = f"u{rand}_{reqFileName}.jpg"

                # 画像を一時的にBytesIOに保存してから、ContentFileを使用してファイルフィールドに保存
                image_io = BytesIO()
                image.save(image_io, format="JPEG")
                image_content = ContentFile(image_io.getvalue(), name=imgFileName)

                # ファイルをユーザーオブジェクトにセットして保存
                user.user_icon_path = image_content
                user.save()
                print(f"user.user_icon_path.url{user.user_icon_path.url}")
                # 成功時のレスポンスを返す
                return JsonResponse(
                    {"success": True, "icon_url": user.user_icon_path.url}
                )
            except IOError:
                # 画像が正しく読み込めない場合のエラーハンドリング
                print("IOエラーが発生しました。")

        else:
            return JsonResponse({"success": False, "error_message": "ファイルが選択されていません。"})


def ajax_mypage_detail(request):
    print(f"ajax_mypage_detail")
    if request.method == "POST":
        user = request.user

        # 新しいユーザ名とメールアドレスを取得
        data = request.POST.get("data")
        flg = request.POST.get("flg")

        print(f"data:{data},flg:{flg}")

        # ユーザー名とメールアドレス更新
        if flg == "true":
            user.username = data
            msg = "ユーザー名が変更されました"
            print("username変更")
        else:
            user.email = data
            msg = "メールアドレスが変更されました"
            print("email変更")

        # データベースを更新
        user.save()

        return JsonResponse({'success': True,'msg':msg})
    else:
        return JsonResponse({'error': 'エラーが発生しました'})
    
class GroupView(LoginRequiredMixin,TemplateView):
    template_name = 'Group.html'
    def get_mutual_members(self, user):
        try:
            follower_ids = Follower.objects.filter(followee=user).values_list(
                "follower", flat=True
            )
            friends = Follower.objects.filter(follower=user, followee__in=follower_ids)
            return friends
        except Follower.DoesNotExist:
            raise Http404("You have no friends.")
        
    def get_mutual_group(self, user):
        
        try:
            # UserGroupTableのuserを取得
            user_group_users = UserGroupTable.objects.filter(user=user).values_list(
                "user", flat=True
            )
            # ユーザを含むUserGroupTableのインスタンスを取得
            users = UserGroupTable.objects.filter(user=user, user__in=user_group_users).exclude(user=user)
            # ユーザーネームだけを取得してリストに格納
            user_names = [user.user.username for user in users]
            return user_names
        except UserGroupTable.DoesNotExist:
            raise Http404("You have no groupuser.")
        
        # return render(request, self.template_name, context)

    def get(self, request, *args, **kwargs):
        user = request.user
        try:
            friends = self.get_mutual_members(user)
            print(f"friend{friends}")
            # users = self.get_mutual_group(user)
            # print(f"user{users}")
        
            # 現在のユーザーが所属しているグループの一覧を取得
            groups = UserGroupTable.objects.filter(user=user).select_related("group")
            context = {"groups": groups, "friends": friends, "users": user}
        except UserGroupTable.DoesNotExist:
            context = {"error": "所属しているグループはありません"}
        return render(request, self.template_name, context)

def ajax_inviteGroup(request):
    print(f"ajax_inviteGroup")
    if request.method == "POST":
        return

def ajax_groupmembers_list(request):
   if request.method == "POST":
        selected_users = request.POST.getlist("selected_users[]")
        group_name = request.POST.get("group_name")

        print("Selected Users:", selected_users)
        print("Group Name:", group_name)

        if selected_users and group_name:
            print("Received POST request")

            try:
                # グループを識別するために GroupMaster モデルに 'name' フィールドがあると仮定
                group = GroupMaster.objects.get(groupname=group_name)

                # 選択されたユーザーを反復処理してグループに追加
                for username in selected_users:
                    print("user_id"+username)
                    try:
                        usermodel=get_user_model()
                        user = usermodel.objects.get(username=username)
                        user_group, created = UserGroupTable.objects.get_or_create(user=user, group=group)
                        # 必要に応じて user_group の追加処理
                        # user_group = UserGroupTable.objects.get(user=user, group=group)
                        # user_group.delete()

                    except UserGroupTable.DoesNotExist:
                        response_data = {"error": f"ユーザーが見つかりません: {username}"}
                        return JsonResponse(response_data, status=404)

            except GroupMaster.DoesNotExist:
                response_data = {"error": f"グループが見つかりません: {group_name}"}
                return JsonResponse(response_data, status=404)

            # 成功応答を返す
            response_data = {"success": True}
            return JsonResponse(response_data)

        # selected_users または group_name が不足している場合
        response_data = {"error": "無効なリクエスト"}
        return JsonResponse(response_data, status=400)
   
def ajax_deletemembers_list(request):
   if request.method == "POST":
        selected_users = request.POST.getlist("selected_users[]")
        group_name = request.POST.get("group_name")

        if selected_users and group_name:
            try:
                # グループを識別するために GroupMaster モデルに 'name' フィールドがあると仮定
                group = GroupMaster.objects.get(groupname=group_name)

                # 選択されたユーザーを反復処理してグループに追加
                for username in selected_users:
                    print("user_id"+username)
                    try:
                        usermodel=get_user_model() # ユーザーモデル取得
                        user = usermodel.objects.get(username=username) 
                        
                        # 必要に応じて user_group の追加処理
                        user_group = UserGroupTable.objects.get(user=user, group=group)
                        user_group.delete()

                    except UserGroupTable.DoesNotExist:
                        response_data = {"error": f"ユーザーが見つかりません: {username}"}
                        return JsonResponse(response_data, status=404)

            except GroupMaster.DoesNotExist:
                response_data = {"error": f"グループが見つかりません: {group_name}"}
                return JsonResponse(response_data, status=404)

            # 成功応答を返す
            response_data = {"success": True}
            return JsonResponse(response_data)

        # selected_users または group_name が不足している場合
        response_data = {"error": "無効なリクエスト"}
        return JsonResponse(response_data, status=400)   
#     group = GroupMaster.objects.get(groupname=group_name)

def index(request, *args, **kwargs):
    return render(request, "index.html")

# React投稿取得
def fetch_posts(request):
    print('fetch_posts')
    if request.method == 'POST':

        if request.body:
            # JSONデータをPythonの辞書に変換
            data = json.loads(request.body)

            # 'group'キーを使ってgroupnameを取得
            groupname = data.get('group')

            if groupname:
                request.session['currentGroup'] = groupname
        
        if 'currentGroup' in request.session:
            print('currentあり')
        else:
            print('currentなし')
        
        # セッションから現在グループ名を取得
        groupname = request.session['currentGroup']

        

        # ログインユーザー取得
        user_id = request.user.user_id

        # 投稿取得
        posts = (
            GroupPostTable.objects
            .filter(group__groupname = groupname)
            .select_related('post')
            .values(
                'post__post_id',
                'post__sketch_path',
                'post__diary',
                'post__user__username',
                'post__user__user_icon_path',
                'post__like_count',
                'post__comment_count',
                'page'
            )
            .order_by('post__updated_at')
        )

        # いいね情報取得用のpost_id
        post_ids = posts.values_list("post__post_id", flat=True)

        # いいね情報を取得
        likes = LikeTable.objects.filter(
            user__user_id=user_id, post__post_id__in=post_ids
        ).values_list("post__post_id", flat=True)

        # ポストにいいね情報を追加
        for post in posts:
            post_id = post["post__post_id"]
            # ユーザーがその投稿にいいねしているかどうかを確認し、いいねの状態を追加
            post["is_liked"] = post_id in likes

        # postsをJSONレスポンスに変換
        posts_data = list(posts)  # QuerySetをリストに変換
        for post in posts_data:
            for key, value in post.items():
                post[key] = convert_uuid_to_str(value)  # UUIDを文字列に変換

        print(f'posts_data:{posts_data}')

        # JSONレスポンスの作成
        return JsonResponse({'posts':posts_data})

# Reactタイムライン投稿追加
def fetch_loadmore(request):
    print('fetch_loadmore')
    if request.method == 'POST':

        # JSONデータをPythonの辞書に変換
        data = json.loads(request.body)

        # 'group'キーを使ってgroupnameを取得
        groupname = data.get('group')
        page = data.get('page')
        page_num = int(page)

        # ログインユーザー取得
        user_id = request.user.user_id

        # 追加の投稿取得
        posts = (
            GroupPostTable.objects
                .filter(group__groupname=groupname,page__gt=page_num)
                .select_related('post')
                .values(
                    'post__post_id',
                    'post__sketch_path',
                    'post__diary',
                    'post__user__username',
                    'post__user__user_icon_path',
                    'post__like_count',
                    'post__comment_count',
                    'page'
                )
        )

        # いいね情報取得用のpost_id
        post_ids = posts.values_list("post__post_id", flat=True)

        # いいね情報を取得
        likes = LikeTable.objects.filter(
            user__user_id=user_id, post__post_id__in=post_ids
        ).values_list("post__post_id", flat=True)

        # ポストにいいね情報を追加
        for post in posts:
            post_id = post["post__post_id"]
            # ユーザーがその投稿にいいねしているかどうかを確認し、いいねの状態を追加
            post["is_liked"] = post_id in likes

        # postsをJSONレスポンスに変換
        posts_data = list(posts)  # QuerySetをリストに変換
        for post in posts_data:
            for key, value in post.items():
                post[key] = convert_uuid_to_str(value)  # UUIDを文字列に変換

        # JSONレスポンスの作成
        return JsonResponse({'posts':posts_data})

# Reactグループリスト取得
def fetch_grouplist(request):

    # ログインユーザー
    user_id = request.user.user_id

    # 所属するグループ取得
    groups = (
        UserGroupTable.objects
            .filter(user__user_id = user_id)
            .select_related('group')
            .values(
                'group__group_id',
                'group__groupname',
                'group__group_icon_path',
            )
            .order_by('group__created_at')
    )

    # postsをJSONレスポンスに変換
    groups_data = list(groups)  # QuerySetをリストに変換
    for group in groups_data:
        for key, value in group.items():
            group[key] = convert_uuid_to_str(value)  # UUIDを文字列に変換

    return JsonResponse({'group_list':groups_data})

# グループ追加
def fetch_group_create(request):
    print('fetch_group_create')
    if request.method == "POST":
        user = request.user
        req_groupname = request.POST.get('groupname')
        req_group_icon = request.FILES.get('groupIcon')

        if req_groupname and req_group_icon:

            # DBへ保存
            group = GroupMaster.objects.create(
                groupname=req_groupname, group_icon_path=req_group_icon
            )
            UserGroupTable.objects.create(user=user, group=group)

            # 追加グループ取得
            ##################同じグループ名の時の処理##################
            group = GroupMaster.objects.filter(groupname=req_groupname)
            ##################同じグループ名の時の処理##################
            group_list = [convert_group_to_dict(g) for g in group]

            # グループリストセッション
            if "groupList" not in request.session:
                groupListSession = list()
                groupListSession.append(req_groupname)
                request.session["groupList"] = groupListSession

            # 現在グループセッション
            if "currentGroup" not in request.session:
                request.session["currentGroup"] = groupListSession[0]

            return JsonResponse({'data':group_list})

# いいね機能
def fetch_like(request):
    print("fetch_like")
    if request.method == "POST":
        group = request.session["currentGroup"]
        page_str = request.POST.get("page")
        user = request.user
        user_id = user.user_id

        print(f'page_str:{page_str}')

        if page_str:
            page = int(page_str)

            if page:
                # GroupPostTableから投稿を特定
                query_post_id = (
                    GroupPostTable.objects
                    .filter(group__groupname=group, page=page)
                    .select_related('post')
                    .values_list(
                        "post__post_id", flat=True
                    )
                )

                print(f'query_post_id[0]:{query_post_id[0]}')

                # いいね対象の投稿ID
                post_id = query_post_id[0]

                # postインスタンス
                post = PostMaster.objects.get(post_id=post_id)

                # likeテーブルから対象記事IDとユーザーIDが同じ行を持ってくる
                like = LikeTable.objects.filter(user__user_id=user_id, post__post_id=post_id)

                # likeテーブルに対象記事に対してユーザーIDがあるか(すでにいいねしてるかどうか
                if like.exists():
                    like.delete()
                    # 対応するPostMasterのlike_countを更新する
                    PostMaster.objects.filter(post_id=post_id).update(like_count=F("like_count") - 1)
                else:
                    like.create(user=user, post=post)

                    # 対応するPostMasterのlike_countを更新する
                    PostMaster.objects.filter(post_id=post_id).update(like_count=F("like_count") + 1)

                # 投稿取得
                posts = (
                    GroupPostTable.objects
                    .filter(group__groupname = group)
                    .select_related('post')
                    .values(
                        'post__post_id',
                        'post__sketch_path',
                        'post__diary',
                        'post__user__username',
                        'post__user__user_icon_path',
                        'post__like_count',
                        'post__comment_count',
                        'page'
                    )
                    .order_by('post__updated_at')
                )

                # いいね情報取得用のpost_id
                post_ids = posts.values_list("post__post_id", flat=True)

                # いいね情報を取得
                likes = LikeTable.objects.filter(
                    user__user_id=user_id, post__post_id__in=post_ids
                ).values_list("post__post_id", flat=True)

                # ポストにいいね情報を追加
                for post in posts:
                    post_id = post["post__post_id"]
                    # ユーザーがその投稿にいいねしているかどうかを確認し、いいねの状態を追加
                    post["is_liked"] = post_id in likes

                # postsをJSONレスポンスに変換
                posts_data = list(posts)  # QuerySetをリストに変換
                for post in posts_data:
                    for key, value in post.items():
                        post[key] = convert_uuid_to_str(value)  # UUIDを文字列に変換

                print(f'posts_data:{posts_data}')

                return JsonResponse({'posts':posts_data})
    else:
        return JsonResponse(status=500)

def ajax_getmembers_list(request):
    if request.method == 'POST':
        user_id = request.user.user_id
        group_name = request.POST.get('group_name')

        try:
            # グループ特定
            groups = UserGroupTable.objects.filter(user__user_id=user_id,group__groupname=group_name).select_related("group")
            members = {}
            for entry in groups:
                if entry.user.user_id != user_id:
                    members = [{'user_id':entry.user.user_id,'username': entry.user.username}]

            return JsonResponse({'members': members})
        except GroupMaster.DoesNotExist:
            return JsonResponse({'error': 'グループが見つかりません'})


    return JsonResponse({'error': '無効なリクエスト'})

# UUID型を文字列に変換する関数
def convert_uuid_to_str(obj):
    if isinstance(obj, UUID):
        return str(obj)
    return obj

# GroupMaster オブジェクトから必要な情報を抽出し辞書に格納する関数
def convert_group_to_dict(group):
    return {
        'group__group_id':group.group_id,
        'group__groupname': group.groupname,
        'group__group_icon_path': str(group.group_icon_path),  # 必要に応じて適切な形式に変換する
        # 他の属性も同様に追加する
    }