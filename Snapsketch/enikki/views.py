from audioop import reverse
from django.views.generic import TemplateView
import json, base64,datetime
from django.http import Http404, HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from .models import PostMaster
from django.utils.crypto import get_random_string
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile
from .models import *
from django.core.paginator import Paginator
from django.core import serializers
from django.db.models import F, Max, Subquery, OuterRef



# # タイムライン画面表示
class TimelineView(TemplateView):
    template_name = "canvas.html"

    def get(self, request, *args, **kwargs):
        print("GET")
        # ページ番号
        page = request.GET.get('page', 1)
        if 'group' in request.session:
            # セッションからグループ名取得
            session_group = request.session["group"]
        
            
            # グループ内の投稿記事持ってくる
            if session_group:
                # グループ名を使って関連する投稿を取得
                group_posts = GroupPostTable.objects.filter(group__groupname=session_group)
                post_ids = group_posts.values_list('post__post_id', flat=True)
                
                posts = PostMaster.objects.filter(post_id__in=post_ids).values(
                    "sketch_path",
                    "diary",
                    "user__username",
                    "user__group_icon_path",
                    "like_count",
                    "comment_count",
                ).order_by("updated_at")

                # 関連する投稿の内容を出力する例いいね機能
                # for post in posts:
                #     print(f"Sketch Path: {post['sketch_path']}")
                #     print(f"Diary: {post['diary']}")
                #     print(f"Username: {post['user__username']}")
                #     print(f"User Icon Path: {post['user__icon_path']}")
                #     print(f"Like Count: {post['likeCount']}")
                #     print(f"Comment Count: {post['commentCount']}")
                    
                # GroupPostTable内のpage情報をpostsに追加
                for post, group_post in zip(posts, group_posts):
                    post['page'] = group_post.page
        else:
            # グループに関係なく投稿記事を持ってくる
            print("セッションからグループ名が取得できませんでした")
            posts = PostMaster.objects.filter(post_id__in=post_ids).values(
                    "sketch_path",
                    "diary",
                    "user__username",
                    "user__group_icon_path",
                    "like_count",
                    "comment_count",
                ).order_by("updated_at")

        context = {
            "posts": posts,
            "group":session_group,
            "page":page
        }
        return render(request, self.template_name, context)


# タイムラインのajax
def ajax_timeline(request):
    if request.method == 'POST':
        group_name = request.POST['group']  # グループ名
        page_number = int(request.POST.get('page', 1))  # 現在のページ番号
        page_size = 10  # 1ページあたりの要素数

        if group_name and page_number:
            
            # グループ名を使って関連する投稿を取得
            group_posts = GroupPostTable.objects.filter(group__groupname=group_name,page__gt=page_number)
            post_ids = group_posts.values_list('post__post_id', flat=True)
            
            posts = (PostMaster.objects.filter(post_id__in=post_ids)
                    .values(
                        "sketch_path",
                        "diary",
                        "user__username",
                        "user__group_icon_path",
                        "like_count",
                        "commentCount",
                    )
                    .order_by("updated_at")
                    .distinct())

            # 関連する投稿の内容を出力する例
            # for post in posts:
            #     print(f"Sketch Path: {post['sketch_path']}")
            #     print(f"Diary: {post['diary']}")
            #     print(f"Username: {post['user__username']}")
            #     print(f"User Icon Path: {post['user__icon_path']}")
            #     print(f"Like Count: {post['likeCount']}")
            #     print(f"Comment Count: {post['commentCount']}")
                
             # GroupPostTable内のpage情報をpostsに追加
            for post, group_post in zip(posts, group_posts):
                post['page'] = group_post.page

            if posts:
                # ログイン中のユーザーが各投稿に対していいねしているかどうかを取得するサブクエリ
                liked_posts = LikeTable.objects.filter(user=request.user, post__in=posts).values_list('post', flat=True)

                # Paginatorを使用してページ分割
                paginator = Paginator(posts, page_size,orphans=1)

                all_pages_data = []
                for page_num in paginator.page_range:
                    page_data = paginator.page(page_num)
                    
                    # 投稿データのシリアライズ
                    serialized_data = serializers.serialize('json', page_data, ensure_ascii=False)
                    
                    # ユーザーがいいねしているかどうかを投稿データに追加
                    for entry in serialized_data:
                        post_id = entry['pk']
                        entry['fields']['is_liked'] = post_id in liked_posts
                    
                    all_pages_data.append({
                        'data': serialized_data,
                        'has_next': page_data.has_next(),
                        'has_previous': page_data.has_previous(),
                        'number': page_data.number,# ページ番号
                        'group':group_name
                    })
                    
                return JsonResponse({
                    'all_pages_data': all_pages_data,
                    'total_pages': paginator.num_pages,
                })
            else:
                return JsonResponse({'all_pages_data': None, 'total_pages': 0}, status=404)
        else:
            # groupかpageのいずれかが空または存在しない場合のエラー処理など
            return
        

# いいね機能
def ajax_like(request):
    print("ajax_like")
    likeCount = request.POST.get('likeCount')
    group = request.POST.get('group')
    page = request.POST.get('page')
    userId = request.user.user_id
    
    # GroupPostTableから投稿を特定
    postId = GroupPostTable.objects.filter(group=group,page=page).values_list('post', flat=True)

    if likeCount.isdigit():
        likeCount = int(likeCount)
    else :
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
    PostMaster.objects.filter(post_id__in=postId).update(like_count=F('like_count') + 1)
    data['like_count'] = likeCount

    return JsonResponse(data)

# グループ切り替え処理


# # コメントページ表示
class CommentView(TemplateView):
    def post(self, request, *args, **kwargs):
        groupName = request.session['group']
        page = request.POST["page"]
        if page.isdigit():
            page = int(page)
        else :
            print("likeCount"+page)
            
        context = {}
        
         # グループ名を使って関連する投稿を取得
        group_post = GroupPostTable.objects.filter(group__groupname=groupName,page__gt=page)
        
        if group_post:
            # グループ名を使って関連する投稿を取得
            post = (
                PostMaster.objects.filter(
                    group_post__group__groupname=groupName,
                    group_post__page=page,
                )
                .select_related("user")
                .values(
                    "post_id",
                    "sketch_path",
                    "diary",
                    "user__username",
                    "user__icon_path",
                    "like_count",
                    "commentCount",
                )
                .first()
            )

            if post:
                # 投稿IDを取得
                post_id = post.post_id

                # 投稿に紐づくコメントを取得
                comments = (
                    CommentMaster.objects.filter(post_id=post_id)
                    .select_related('user')
                    .values(
                        "user__username",
                        "user__icon_path",
                        "comment",
                    )
                )

                context['post'] = post

                if comments:
                    context['comments'] = comments

        return render(request, "comment.html", context)


# # グループ新規作成
def ajax_group(request):
    if request.method == 'POST':
        print("ajax_group")
        groupName = request.POST.get('groupName')
        reqFile = request.FILES['imageFile']
        reqFileName = '/media/group/'+groupName+reqFile.name
        
        # JPEG形式かどうかをチェックする
        if is_jpeg(reqFile):
            print("JPEG形式です")
            GroupMaster.objects.create(group_id='',groupname=groupName,group_icon_path=reqFile)
            
            # セッション内のリストを取得します。もしリストがなければ新しいリストを作成します。
            sessionGroupList = request.session.get('group', [])
            sessionGroupList.append(groupName)
            request.session['group'] = sessionGroupList
            request.session.modified = True
            
            addGroupIndex = sessionGroupList.index(groupName)
            
            context = {
                'filePath': reqFileName,
                'message':'グループ作成完了',
                'addGroupIndex':addGroupIndex
            }
        else:
            print("JPEG形式ではありません")
            context = {
                'message': 'jpeg形式でお願いします'
            }

        return JsonResponse(context)

def is_jpeg(file):
    try:
        # JPEGのシグネチャはバイト文字列として表現されます
        jpeg_signature = b'\xFF\xD8\xFF\xE0\x00\x10JFIF'

        # ファイルの最初の数バイトを読み込みます
        file_signature = file.read(6)

        # ファイルの先頭がJPEGのシグネチャと一致するかを確認します
        return file_signature == jpeg_signature
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        return False

# キャンバス画面
class CanvasView(TemplateView):
    template_name = "canvas.html"

    def get(self, request, *args, **kwargs):
        print("GET")
        return redirect('canvas')
    
    def post(self, request, *args, **kwargs):
        print("POST")
        print(vars(request))

        reqFile = request.FILES["img"]
        reqFileName = reqFile.name
        reqFileBinary = reqFile.read()

        # バイナリデータをPIL Imageに変換する
        image = Image.open(BytesIO(reqFileBinary))

        # JPEG形式に変換（もしJPEGでない場合は変換が必要です）
        if image.format != "JPEG":
            image = image.convert("RGB")

        # ランダムファイル名
        rand = get_random_string(3)

        # Djangoモデルに保存
        image_io = BytesIO()
        image.save(image_io, format="JPEG")  # JPEGとして保存
        # Djangoモデルに保存
        imgFileName = f"u{rand}_{reqFileName}.jpg"
        model_instance = PostMaster(post_id=f"u{rand}|{reqFileName}")  # 要検討
        model_instance.sketch_path.save(
            imgFileName, ContentFile(image_io.getvalue()), save=True
        )

        context = {"canvasFile": f"sketch/{imgFileName}"}  # sketch/username/filename

        return render(request, self.template_name, context)

# 絵日記作成画面
class CreateView(TemplateView):

    def get(self, request, *args, **kwargs):
        print("GET")
        return redirect('create')
    
    def post(self, request, *args, **kwargs):
        print("POST")
        
        # ユーザー取得
        userId = self.request.user.user_id
        # 日記取得
        diary = request.POST.get('sentence', '')
        # 日付取得
        dateTime = datetime.datetime.today()
        date = dateTime.date()#yyyy-mm-dd
        
        try:
            # 指定した日付とログインユーザーに基づいてレコードを抽出
            post = get_object_or_404(PostMaster, user_id=userId, created_at=date)
            post.diary = diary  # 日記を更新する場合
            post.user = userId
            post.save()  # 変更を保存
        except Http404:
            PostMaster.objects.create(diary=diary,user=userId)
            return 
        
        
        #存在判定
        if 'group' in request.session:
            group = request.session['group']

            # グループ名に対応するGroupMasterのサブクエリを作成
            group_ids = GroupMaster.objects.filter(name__in=group).values('id')

            # グループごとに最大のpage値を取得するサブクエリを作成
            max_pages = (
                GroupPostTable.objects.filter(group_id=OuterRef('group_id'))
                .values('group_id')
                .annotate(max_page=Max('page'))
                .values('max_page')
            )

            # 新しいレコードを作成し、一度にGroupPostTableに追加
            GroupPostTable.objects.bulk_create(
                GroupPostTable(group_id=group_id['id'], page=F('max_page') + 1)
                for group_id in group_ids.annotate(max_page=Subquery(max_pages))
            )
        
        return redirect('timeline')

    


# カレンダー画面
class CalenderView(TemplateView):

    template_name = 'calendar.html'

    def get(self, request, *args, **kwargs):
        print('GET')
        return render(request,self.template_name)

    def post(self, request, *args, **kwargs):
        print('POST')
        print(vars(request))

        # POSTリクエスト(日付)取得
        date = request.POST['date']
        # ユーザー取得
        userId = self.request.user.user_id
        # グループ取得
        groupName = request.session['group']

        # user_id,date
        # ユーザーと日付で該当する投稿の post_id を取得
        page = GroupPostTable.objects.filter(
            post__user_id=userId,
            post__created_at__date=date,
            group__groupname=groupName,
        ).values_list('page', flat=True).first()

        # 最初に該当する投稿の page を取得する
        if page is not None:
            url = reverse('timeline') + f'?page={page}'
            return redirect(url)
        else:
            return None  # 該当する投稿が見つからなかった場合の処理

