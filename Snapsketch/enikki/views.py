from audioop import reverse
from django.conf import settings
from django.views.generic import TemplateView
import json
import os
import base64
import tempfile
import datetime
from django.http import Http404, HttpResponse, HttpResponseServerError, JsonResponse
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

# # タイムライン画面表示
class TimelineView(TemplateView):
    template_name = "timeline.html"
    print(f'TimelineView')

    def get(self, request, *args, **kwargs):
        print("GET")
        context = {}
        # ページ番号
        page = request.GET.get('page', 1)

        # セッションから全グループ取得
        if 'groupList' in request.session:
            groupList = request.session['groupList']
            try:
                if groupList:
                    groups = GroupMaster.objects.filter(groupname__in=groupList).values(
                        'groupname', 'group_icon_path').order_by('created_at')
                    context['groupList'] = groups
                else:
                    raise Http404
            except Http404:
                print('グループを取得できませんでした')
        else:
            print('groupListがない')

        if 'currentGroup' in request.session:
            # セッションからグループ名取得
            currentGroup = request.session['currentGroup']
            print(f'currentGroupTimelineView:{currentGroup}')
            try:
                user = request.user
                
                # グループ内の投稿記事持ってくる
                if currentGroup:
                    
                    # グループ名を使って関連する投稿を取得
                    group_posts = GroupPostTable.objects.filter(
                        group__groupname=currentGroup)
                    post_ids = group_posts.values_list(
                        'post__post_id', flat=True)

                    posts = PostMaster.objects.filter(post_id__in=post_ids).values(
                        "post_id",
                        "sketch_path",
                        "diary",
                        "user__username",
                        "user__user_icon_path",
                        "like_count",
                        "comment_count",
                    ).order_by("updated_at")
                    
                    # いいね情報を取得
                    likes = LikeTable.objects.filter(
                        user=user, post__in=post_ids).values_list('post_id', flat=True)

                    # ポストにいいね情報を追加
                    for post in posts:
                        post_id = post['post_id']
                        # ユーザーがその投稿にいいねしているかどうかを確認し、いいねの状態を追加
                        post['is_liked'] = post_id in likes

                    # GroupPostTable内のpage情報をpostsに追加
                    for post, group_post in zip(posts, group_posts):
                        post['page'] = group_post.page
                    print(f'TimelineView:posts:{posts}')
                    context["posts"] = posts
                else:
                    raise Http404
            except Http404:
                print('グループ内で投稿がありません')
        else:
            print('currentGroupがない')
        return render(request, self.template_name, context)

# ajaxタイムライン
def ajax_timeline(request):
    if request.method == 'POST':
        return getPost(request)
    else:
        return JsonResponse({'error': 'POSTメソッドを使用してください'})


# 投稿取得関数
def getPost(request):
    try:
        group_name = request.session.get('currentGroup')  # グループ名
        page_number = int(request.POST.get('page', 1))  # 現在のページ番号
        print(f'page_number:{page_number},currentGroup:{group_name}')
        page_size = 10  # 1ページあたりの要素数

        if group_name and page_number:
            # グループ名を使って関連する投稿を取得
            group_posts = GroupPostTable.objects.filter(
                group__groupname=group_name, page__gt=page_number)

            if group_posts.exists():
                post_ids = group_posts.values_list('post__post_id', flat=True)

                posts = (PostMaster.objects.filter(post_id__in=post_ids)
                    .values(
                        "sketch_path",
                        "diary",
                        "user__username",
                        "user__user_icon_path",
                        "like_count",
                        "commentCount",
                    )
                    .order_by("updated_at")
                    .distinct())

                # GroupPostTable内のpage情報をpostsに追加
                for post, group_post in zip(posts, group_posts):
                    post['page'] = group_post.page
            else:
                raise Http404
            
            if posts:
                # ログイン中のユーザーが各投稿に対していいねしているかどうかを取得するサブクエリ
                liked_posts = LikeTable.objects.filter(
                    user=request.user, post__in=posts).values_list('post', flat=True)

                # Paginatorを使用してページ分割
                paginator = Paginator(posts, page_size, orphans=1)

                all_pages_data = []
                for page_num in paginator.page_range:
                    page_data = paginator.page(page_num)

                    # 投稿データのシリアライズ
                    serialized_data = serializers.serialize(
                        'json', page_data, ensure_ascii=False)

                    # ユーザーがいいねしているかどうかを投稿データに追加
                    for entry in serialized_data:
                        post_id = entry['pk']
                        entry['fields']['is_liked'] = post_id in liked_posts

                    all_pages_data.append({
                        'data': serialized_data,
                        'has_next': page_data.has_next(),
                        'has_previous': page_data.has_previous(),
                        'number': page_data.number,  # ページ番号
                        'group': group_name
                    })

                return JsonResponse({
                    'all_pages_data': all_pages_data,
                    'total_pages': paginator.num_pages,
                })
            else:
                raise Http404
        else:
            return JsonResponse({'error': 'groupかpageがありません'})

    except Http404:
        print('読み込みデータがありません')
        return JsonResponse({'error': '読み込みデータがありません'})

# いいね機能
def ajax_like(request):
    print("ajax_like")
    likeCount = request.POST.get('likeCount')
    group = request.POST.get('currentGroup')
    page = request.POST.get('page')
    userId = request.user.user_id

    # GroupPostTableから投稿を特定
    postId = GroupPostTable.objects.filter(
        group=group, page=page).values_list('post', flat=True)

    if likeCount.isdigit():
        likeCount = int(likeCount)
    else:
        print("likeCount"+likeCount)

    data = {}

    # likeテーブルから対象記事IDとユーザーIDが同じ行を持ってくる
    like = LikeTable.objects.filter(user_id=userId, post=postId)

    # likeテーブルに対象記事に対してユーザーIDがあるか(すでにいいねしてるかどうか)
    if like.exists():
        like.delete()
        data['method'] = 'delete'
        likeCount -= 1
    else:
        like.create(user_id=userId, post=postId)
        data['method'] = 'create'
        likeCount += 1

    # 対応するPostMasterのlike_countを更新する
    PostMaster.objects.filter(post_id__in=postId).update(
        like_count=F('like_count') + 1)
    data['like_count'] = likeCount

    return JsonResponse(data)

# グループ切り替え処理
def ajax_changeGroup(request):
    print('ajax_changeGroup')
    if request.method == 'POST':
        try:
            groupname = request.POST.get('groupname', '')  # グループ名
            if groupname:
                group_posts = (
                    GroupPostTable.objects
                    .filter(group__groupname=groupname)
                    .select_related('group', 'post')
                    .values(
                        'post__post_id',
                        'post__user__username',
                        'post__user__user_icon_path',
                        'post__sketch_path',
                        'post__diary',
                        'post__like_count',
                        'post__comment_count',
                        'page'
                    )
                )

                if group_posts.exists():
                    # 投稿に対するいいねの情報を取得
                    liked_posts = LikeTable.objects.filter(
                        user=request.user, post__in=group_posts.values_list('post__post_id', flat=True)
                    ).values_list('post', flat=True)

                    # ユーザーがいいねしているかどうかを投稿データに追加
                    for entry in group_posts:
                        post_id = entry['post__post_id']
                        entry['is_liked'] = post_id in liked_posts

                    return JsonResponse({'data': list(group_posts)})
                else:
                    raise Http404('読み込みデータがありません')
            else:
                return JsonResponse({'error': 'グループ名がありません'})

        except Http404 as e:
            print(str(e))  # デバッグ用のエラーメッセージ
            return JsonResponse({'error': '読み込みデータがありません'})

    else:
        return JsonResponse({'error': 'POSTメソッドを使用してください'})


# # コメントページ表示
class CommentView(TemplateView):
    def get(self, request, *args, **kwargs):
        context = {}
        
        user = request.user
        
        # セッションからグループ名取得
        groupName = request.session['currentGroup']
        if not groupName:
            print('グループに所属していません')
            redirect('timeline')
        
        # ページ番号取得
        page = int(request.GET.get("page"))
        
        # グループ名を使って関連する投稿を取得
        group_post = (
            GroupPostTable.objects.filter(
            group__groupname=groupName, page=page)
            .select_related('post')
            .values(
                'post__post_id',
                'post__sketch_path',
                'post__diary',
                'post__like_count',
                'post__comment_count',
                'post__user__username',
                'post__user__user_icon_path'
                'page'
                )
            )

        # いいね情報を取得
        likes = (
            LikeTable.objects.filter(
                user=user, post=group_post).values_list('post_id', flat=True)
        )

        # いいねされているかどうか
        if likes:
            group_post['is_liked'] = True
        else:
            group_post['is_liked'] = False

        # post_idセッションの有無
        if 'post_id' in request.session:
            del request.session['post_id']

        post_id = group_post['post__post_id']

        # post_idセッション設定
        request.session['post_id'] = group_post['post__post_id']

        # 投稿に紐づくコメントを取得
        comments = (
            CommentMaster.objects.filter(post=post_id)
            .select_related('user')
            .values(
                "user__username",
                "user__icon_path",
                "comment",
            )
        )
        
        if not comments:
            context['error'] = 'コメントがありません'
            
        context['comments'] = comments
        context['post'] = group_post

        return render(request, "comment.html", context)
        
    
def ajax_comment(request):
    if request.method == 'POST':
        user = request.user
        comment = request.POST.get("comment")
        if comment:
            if 'post_id' in request.session:
                post_id = request.session['post_id']
                post = PostMaster.objects.get(pk=post_id)
                # 新しいコメントを作成する例
                new_comment = CommentMaster(
                    user=user,  # ユーザーは適切な方法で取得する必要があります
                    post=post,  # セッションから取得したpost_idに紐づくPostMasterインスタンスを指定
                    comment=comment  # コメントの内容を適切なものに置き換える
                    # 他のフィールドも適宜設定する
                )
                new_comment.save()  # 新しいコメントを保存する
                
                return JsonResponse({'new_comment':new_comment})
            else:
                return JsonResponse({'error':'post_idがありません'})
            
        else:
            return JsonResponse({'error':'コメントがありません'})

# グループ追加
def ajax_group(request):
    if request.method == 'POST':
        user = request.user
        form = UpLoadProfileImgForm(request.POST, request.FILES)
        if form.is_valid():
            print('バリデーション成功')
            groupName = form.cleaned_data['groupname']
            imageFile = form.cleaned_data['avator']
            imageFileName = f'/media/group/{groupName}/{imageFile.name}'

            group = GroupMaster.objects.create(
                groupname=groupName, group_icon_path=imageFile)
            UserGroupTable.objects.create(user=user, group=group)
            
            if 'groupList' not in request.session:
                groupListSession = list()  # 空のリストを作成
                groupListSession.append(groupName)
                request.session['groupList'] = groupListSession
                print(f'grouplist追加{groupListSession}')
            
            if 'currentGroup' not in request.session:
                request.session['currentGroup'] = groupListSession[0]
            
            context = {
                'groupName': groupName,
                'imageFileName': imageFileName,
                'msg': 'グループ作成完了'
            }
            return JsonResponse(context)
        else:
            print('バリデーションエラー')
            # バリデーションエラーの場合、エラーメッセージをJSONとして返す
            errors = form.errors.as_json()
            return JsonResponse({'errors': errors})

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
        destination = '/path/to/destination/directory/filename.jpg'  # 実際のパスに置き換えてください
        os.rename(temp_file.name, destination)  # ファイルを移動

        return destination  # ファイルの保存先パスを返す
    finally:
        temp_file.close()  # 一時ファイルをクローズする

# キャンバス画面
class CanvasView(TemplateView):
    template_name = "canvas.html"

    def get(self, request, *args, **kwargs):
        print("GET")
        return render(request, self.template_name)

    def post(self, request, *args, **kwargs):
        print("POST")

        self.template_name = "create.html"

        # 画像ファイルの取得とバリデーション
        if 'img' in request.FILES:
            reqFile = request.FILES["img"]
            print(reqFile)
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
                image_content = ContentFile(
                    image_io.getvalue(), name=imgFileName)

                user = request.user

                date = timezone.now().date()

                print(f'user:{user},date:{date}')

                try:
                    # 指定した日付とログインユーザーに基づいてレコードを抽出
                    post = PostMaster.objects.filter(
                        user=user, created_at__year=date.year, created_at__month=date.month, created_at__day=date.day).first()
                    if post:
                        print(f'更新:{user}')
                        post.sketch_path = image_content  # 日記を更新する場合
                        post.save()  # 変更を保存
                    else:
                        print(f'作成:{user}')
                        post = PostMaster.objects.create(
                            sketch_path=image_content,
                            user=user
                        )
                except Exception as e:
                    print(str(e))  # エラーを表示するなど適切な処理を行う

                # sketch/username/filename
                context = {"canvasFile": f"{post.sketch_path.url}"}

                return render(request, self.template_name, context)

            except IOError:
                # 画像が正しく読み込めない場合のエラーハンドリング
                print("IOエラーが発生しました。")

        # もし画像ファイルがリクエストに含まれていない場合のエラーハンドリング
        print("画像ファイルがありません。")

# 絵日記作成画面
class CreateView(TemplateView):
    template_name = 'create.html'

    @method_decorator(login_required)  # ここでログインが必要なことを示します
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get(self, request, *args, **kwargs):
        print("GET")
        return render(request, self.template_name)

    def post(self, request, *args, **kwargs):
        print("CreateView:POST")

        # ユーザー取得
        user = request.user
        # 日記取得
        diary = request.POST.get('sentence', '')
        # 日付取得（時刻ではなく日付のみ）
        date = timezone.now().date()

        try:
            print(f'CreateView:POST:try')
            # ユーザーの投稿を取得または作成
            post, created = PostMaster.objects.get_or_create(
                user=user,
                created_at__year=date.year,
                created_at__month=date.month,
                created_at__day=date.day,
                defaults={'diary': diary}
            )

            if not created:
                print(f'not created')
                post.diary = diary  # 日記を更新
                post.save()

            print(f'groupList前')
            grouplist = request.session['groupList']
            print(f'grouplist:{grouplist}')
            if 'groupList' in request.session:
                print(f'groupList後')
                group_names = request.session['groupList']
                groups = GroupMaster.objects.filter(groupname__in=group_names)
                print(f'groups:{groups}')
                max_pages = (
                    GroupPostTable.objects
                    .filter(group__in=groups)
                    .values('group')
                    .annotate(max_page=Max('page'))
                    .values('max_page')
                )
                print(f'max_pages{max_pages}')
                
                new_group_posts = []
                
                if not max_pages:  # max_pagesが空の場合
                    for group in groups:
                        new_group_posts.append(GroupPostTable(
                            group=group, post=post, page=1))  # pageを1に設定
                        print(f'GroupPostTable:group:{group},post:{post}')
                else:
                    for group in groups:
                       
                        max_page = max_pages.filter(group=group.group_id).order_by('-group__created_at').first()
                        page_value = 1 if max_page is None else max_page['max_page'] + 1
                        new_group_posts.append(GroupPostTable(
                            group=group, post=post, page=page_value))
                        print(f'GroupPostTable:group:{group},post:{post},page:{page_value}')
                        print(f'new_group_posts:{new_group_posts}')


                GroupPostTable.objects.bulk_create(new_group_posts)

        except Exception as e:
            print(str(e))  # エラーを表示するなど適切な処理を行う


        return redirect('enikki:timeline')

# カレンダー画面
class CalenderView(TemplateView):

    template_name = 'calendar.html'

    def get(self, request, *args, **kwargs):
        print('GET')
        return render(request, self.template_name)

    def post(self, request, *args, **kwargs):
        print('POST')

        # POSTリクエスト(日付)取得
        date = request.POST['date']

        # ユーザー取得
        user = self.request.user

        # グループ取得
        groupName = request.session['group']

        if groupName:
            # ユーザーと日付で該当する投稿の post_id を取得
            page = GroupPostTable.objects.filter(
                post__user=user,
                post__created_at__date=date,
                group__groupname=groupName,
            ).values_list('page', flat=True).first()

            # 最初に該当する投稿の page を取得する
            if page is not None:
                url = reverse('timeline') + f'?page={page}'
                return redirect(url)
            else:
                return None  # 該当する投稿が見つからなかった場合の処理


def ajax_calendar(request):
    if request.method == 'POST':
        user = request.user
        currentGroup = request.session['currentGroup']
        date = request.POST.get('date')

        groupposts = (
            GroupPostTable.objects.filter(group=currentGroup,post__created_at=date)
            .select_related('post')
            .values(
                    'post_id',
                    'sketch_path',
                    'diary',
                    'user__username',
                    'user__user_icon_path',
                    'like_count',
                    'comment_count'
            )
        )
        
        # いいね情報を取得
        likes = LikeTable.objects.filter(
            user=user, post__in=groupposts).values_list('post_id', flat=True)
        
        # ポストにいいね情報を追加
        for post in groupposts:
            post_id = post['post_id']
            # ユーザーがその投稿にいいねしているかどうかを確認し、いいねの状態を追加
            post['is_liked'] = post_id in likes

    # リクエストが POST でない場合のデフォルトのレスポンス
    return JsonResponse({'posts':groupposts,'currentGroup':currentGroup})

class FriendView(TemplateView):
    template_name = 'friend.html'

    def get(self, request, *args, **kwargs):
        user = request.user
        friends = self.get_mutual_friends(user)

        context = {'friends': friends}
        return render(request, self.template_name, context)

    def get_mutual_friends(self, user):
        try:
            follower_ids = Follower.objects.filter(followee=user).values_list('follower', flat=True)
            friends = Follower.objects.filter(follower=user, followee__in=follower_ids)
            return friends
        except Follower.DoesNotExist:
            raise Http404("You have no friends.")


def view_accountConfView(request):
    # print('view_accountConf')
    # template_name = 'login.html'

    context = {}

    return render(request, 'accountConf.html', context)


class GroupMembersListView(View):
    print('GroupMembersList')
    # def get(self, request, *args, **kwargs):
    #     group_name = request.GET.get('group')
    #     members = self.get_group_members(group_name)

    #     # メンバー一覧をJSON形式でレスポンス
    #     members_data = [{'username': member.followee.username} for member in members]
    #     return JsonResponse(members_data, safe=False)

    # def get_group_members(self, group_name):
    #     try:
    #         # グループごとのメンバー一覧を取得するロジック
    #         # 例: members = Follower.objects.filter(group=group_name)
    #         # モデルとフィールド名は実際のデータモデルに合わせて変更してください
    #         return JsonResponse({'error':'error'})
    #     except Follower.DoesNotExist:
    #         raise Http404("Group members not found.")

# class group_members_list(View):
    template_name = 'Group.html'

    def get(self, request, *args, **kwargs):
        user = request.user
        friends = self.get_mutual_members(user)
        print(f'friend{friends}')

        context = {'friends': friends}
        return render(request, self.template_name, context)

    def get_mutual_members(self, user):
        try:
            follower_ids = Follower.objects.filter(followee=user).values_list('follower', flat=True)
            friends = Follower.objects.filter(follower=user, followee__in=follower_ids)
            return friends
        except Follower.DoesNotExist:
            raise Http404("You have no friends.")
#ユーザー検索機能
# class SearchView(TemplateView):


#     template_name = 'search.html'

    # def post(self, request, *args, **kwargs):
    #     #検索されたuserIdを取得する
    #     if request.method == 'POST':
    #         query = request.POST.get('placeholder', '')
    #         #検索機能：検索して表示して申請ボタンをつける　リクエストを送信する機能　受け取って表示する機能
    #         try:
    #             # 指定した日付とログインユーザーに基づいてレコードを抽出
    #             post = get_object_or_404(PostMaster, user_id=userId, created_at=date)
    #             #データが存在するか調べる
    #             results = user.objects.filter(user_id__exact=query)
    #             return render(request, 'usersearch.html', {'query': query, 'results': results})

    #         except Http404:
    #                 PostMaster.objects.create(diary=diary,user=userId)
    #                 return


#リクエスト機能
# class RequestView(TemplateView):

#     template_name = 'request.html'

#     def friend_request(request):
#         if request.method =='POST':
#             form = FrequestTable(request.POST)
#             if form.is_valid():
#                 form.save()
#                 return redirect('success page') #👈保存成功時に遷移するページのURLに変更
#         else:
#             form = FrequestTable()

#         return render(request,'usersearch.html',{'form':form})


# マイページ機能
class MypageView(TemplateView):
    template_name = 'myPage.html'

    def get(self, request, *args, **kwargs):
        print("GET")
        context = {}
        if self.request.user.is_authenticated:
            print("ログイン成功")
            try:
                User = get_user_model()
                user = get_object_or_404(
                    User, username=self.request.user.username)
                context['username'] = user.username
                context['email'] = user.email
                context['password'] = user.password
                context['user_icon'] = user.user_icon_path.url
                # context['introduction'] = user.introduction
                # context['icon_path'] = user.icon_path
            except Http404:
                context['error'] = 'ユーザーが見つかりません'
            return render(request, self.template_name, context)
        else:
            redirect('login_app:login')
            
def mypage_icon(request):
    print('icon')
   # ユーザーアイコンの変更処理
    if request.method == 'POST':
        user = request.user

        # ユーザーがアップロードしたファイルを取得
        uploaded_file = request.FILES.get('user_icon')

        # ファイルが選択されているか確認
        print(f'uploaded file{uploaded_file}')
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
                image_content = ContentFile(
                    image_io.getvalue(), name=imgFileName)

                # ファイルをユーザーオブジェクトにセットして保存
                user.user_icon_path = image_content
                user.save()
                print(f'user.user_icon_path.url{user.user_icon_path.url}')
                # 成功時のレスポンスを返す
                return JsonResponse({'success': True, 'icon_url': user.user_icon_path.url})
            except IOError:
                # 画像が正しく読み込めない場合のエラーハンドリング
                print("IOエラーが発生しました。")

        else:
            return JsonResponse({'success': False, 'error_message': 'ファイルが選択されていません。'})
    
def ajax_mypage_detail(request):
        print(f'ajax_mypage_detail')
        if request.method == 'POST':
            user = request.user

            # 新しいユーザ名とメールアドレスを取得
            data = request.POST.get('data')
            flg = request.POST.get('flg')
            
            print(f'data:{data},flg:{flg}')
            
            # ユーザー名とメールアドレス更新
            if flg ==  'true':
                user.username = data
                msg = 'ユーザー名が変更されました'
                print('username変更')
            else:
                user.email = data
                msg = 'メールアドレスが変更されました'
                print('email変更')
            
            # データベースを更新
            user.save()

            return JsonResponse({'success': True,'msg':msg})
        else:
            return JsonResponse({'error': 'エラーが発生しました'})
    
class GroupView(TemplateView):
    template_name = 'Group.html'
    def get_mutual_members(self, user):
        try:
            follower_ids = Follower.objects.filter(followee=user).values_list('follower', flat=True)
            friends = Follower.objects.filter(follower=user, followee__in=follower_ids)
            return friends
        except Follower.DoesNotExist:
            raise Http404("You have no friends.")

    def get(self, request, *args, **kwargs):
        user = request.user
        try:
            friends = self.get_mutual_members(user)
            print(f'friend{friends}')
            # 現在のユーザーが所属しているグループの一覧を取得
            groups = UserGroupTable.objects.filter(user=user).select_related('group')
            context = {'groups': groups,
                       'friends': friends}
        except UserGroupTable.DoesNotExist:
            context = {'error': '所属しているグループはありません'}
        return render(request, self.template_name, context)

def ajax_inviteGroup(request):
    print(f'ajax_inviteGroup')
    if request.method == 'POST':
        return