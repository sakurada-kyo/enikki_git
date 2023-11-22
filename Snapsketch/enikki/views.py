from audioop import reverse
from django.views.generic import TemplateView
import json, base64,datetime
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from .models import PostMaster
from django.utils.crypto import get_random_string
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile
from .models import *
from django.core.paginator import Paginator


# # タイムライン画面表示
class TimelineView(TemplateView):
    template_name = "canvas.html"

    def get(self, request, *args, **kwargs):
        print("GET")
        # セッションからグループ名取得
        session_group = request.session["group"]
        # ページ番号
        page = self.request.GET.get('page')
        if "page" in request.GET:
            # pageが指定されている場合の処理
            page = request.GET.get("page")
        else:
            page = 1
            
        # グループ内の投稿記事持ってくる
        if session_group:
            # グループ名を使って関連する投稿を取得
            posts = (
                PostMaster.objects.filter(
                    groupposttable__group_id__groupname=session_group
                )
                .select_related("user")
                .values(
                    "sketch_path",
                    "diary",
                    "user__username",
                    "user__icon_path",
                    "likeCount",
                    "commentCount",
                )
                .distinct()
                .order_by("updated_at")
            )

            # 関連する投稿の内容を出力する例
            for post in posts:
                print(f"Sketch Path: {post['sketch_path']}")
                print(f"Diary: {post['diary']}")
                print(f"Username: {post['user__username']}")
                print(f"User Icon Path: {post['user__icon_path']}")
                print(f"Like Count: {post['likeCount']}")
                print(f"Comment Count: {post['commentCount']}")
        else:
            print("セッションからグループ名が取得できませんでした")

        context = {
            "posts": posts,
            "group":session_group,
            "page":page
        }
        return render(request, self.template_name, context)


# タイムラインのajax
def ajax_timeline(request):
    if request.method == 'POST':
        group = str(request.POST['group']) # グループ名
        page = str(request.POST.get('page',1)) # 現在のページ番号
        page_size = 10  # 1ページあたりの要素数
        start_post_id = page * page_size # ページ番号に応じた投稿IDの閾値を計算
        
        if group and page:
            # 指定したグループ名とページ番号より大きいpost_idを持つPostMasterを取得
            posts_greater_than_page = PostMaster.objects.filter(
                group__group=group,
                post_id__gt=start_post_id
            ).order_by('post_id')[:page_size]  # 10件取得

            paginator = Paginator(posts_greater_than_page, page_size)
            # 指定ページのPostMasterオブジェクトを取得
            posts_for_requested_page = paginator.get_page(page)

            # ページに含まれるオブジェクト数が指定サイズ未満の場合、追加で残りのオブジェクトを取得
            if posts_for_requested_page.has_next() and len(posts_for_requested_page) < page_size:
                remaining_posts_count = page_size - len(posts_for_requested_page)
                remaining_posts = PostMaster.objects.filter(
                    group__group=group,
                    post_id__gt=posts_for_requested_page[-1].post_id
                ).order_by('post_id')[:remaining_posts_count]

                for post in remaining_posts:
                    posts_for_requested_page.append(post)

            return posts_for_requested_page  # ページ番号に応じたPostMasterオブジェクトを返す
        else:
            # groupかpageのいずれかが空または存在しない場合のエラー処理など
            return
        
        

        # グループ名+page番号より上の行を持ってくる（更新データのみ）
        data = {
            # ユーザー名
            # ユーザーアイコン
            # 絵
            # 日記
            # いいね数
            "isUserLiked":False,# いいねの有無
            "page":pageNum, # 次付与するページ番号
        }
        
        return JsonResponse(data)

# いいね機能
def ajax_like(request):
    print("ajax_like")
    enikkiId = request.POST.get('enikkiId')
    userId = request.POST.get('userId')
    likeCount = request.POST.get('likeCount')

    if likeCount.isdigit():
        likeCount = int(likeCount)
    else :
        print("likeCount"+likeCount)

    data = {}

    # 対象の絵日記IDがあるか、なければ404エラー
    enikki = get_object_or_404(EnikkiModel, pk=enikkiId)
    print("enikki:"+enikkiId)
    # likeテーブルから対象記事IDとユーザーIDが同じ行を持ってくる
    like = Like.objects.filter(user_id=userId, enikki_id=enikki)
    isLike = Like.check_duplicate(userId,enikki)
    print(like)
    # likeテーブルに対象記事に対してユーザーIDがあるか(すでにいいねしてるかどうか)
    if isLike:
        like.delete()
        data['method'] = 'delete'
        likeCount -= 1
    else:
        like.create(user_id=userId,enikki_id=enikki)
        data['method'] = 'create'
        likeCount += 1

    EnikkiModel.objects.create(like_count=likeCount)
    data['like_count'] = likeCount

    return JsonResponse(data)

# グループ変更処理


# # コメントページ表示
class CommentView(TemplateView):
    def post(self, request, *args, **kwargs):
        groupName = request.POST["group"]
        page = str(request.POST["page"])
        context = {}
        if groupName:
            # グループ名を使って関連する投稿を取得
            post = (
                PostMaster.objects.filter(
                    groupposttable__group_id__groupname=groupName,
                    groupposttable__page=page,
                )
                .select_related("user")
                .values(
                    "post_id",
                    "sketch_path",
                    "diary",
                    "user__username",
                    "user__icon_path",
                    "likeCount",
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
        print("ajax_group")
        groupName = request.POST.get('groupName')
        reqFile = request.FILES['imageFile']
        reqFileName = '/media/img/'+reqFile.name
        print(reqFile.name)
        chkFlg = Img.check_duplicate('f')
        print(chkFlg)
        if not chkFlg:
            Img.objects.create(img_id='f',img=reqFile)

        data = {
            'filePath':reqFileName
        }

        return JsonResponse(data)


# キャンバス画面
class CanvasView(TemplateView):
    template_name = "canvas.html"

    def get(self, request, *args, **kwargs):
        print("GET")

        return render(request, self.template_name)


class EnikkiPostView(TemplateView):
    template_name = "timeline.html"

    def post(self, request, *args, **kwargs):
        print("POST")
        
        # ユーザー取得
        userId = self.request.user.user_id
        # 日記取得
        diary = request.POST['sentence']
        # 日付取得
        dateTime = datetime.datetime.today()
        date = dateTime.date()#yyyy-mm-dd
        
        # PostMasterへ追加(条件:userId,date)
        # GroupPostTableへ追加
        return render(request, self.template_name)


# 絵日記作成画面
class CreateView(TemplateView):
    template_name = "create.html"

    def get(self, request, *args, **kwargs):
        print("GET")
        return render(request, self.template_name)

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
        posts = GroupPostTable.objects.filter(
            post__user_id=userId,
            post__created_at__date=date,
            group__groupname=groupName,
        ).values('post_id','group_id')

        # 最初に該当する投稿の page を取得する
        if posts.exists():
        # ユーザーと日付、グループ名に該当する最初の投稿の post_id と group_id を取得
            post_id = posts.first().post_id
            group_id = posts.first().group_id
            # 該当する post_id と group_id の page を取得
            page_number = GroupPostTable.objects.filter(post_id=post_id, group_id=group_id).values_list('page', flat=True).first()
            # パラメータを含むURLにリダイレクト
            url = reverse('timeline') + f'?page={page_number[1]}'
            return redirect(url)
        else:
            return None  # 該当する投稿が見つからなかった場合の処理

