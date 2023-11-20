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


# # タイムライン画面表示
class TimelineView(TemplateView):
    template_name = "canvas.html"

    def get(self, request, *args, **kwargs):
        print("GET")
        # セッションからグループ名取得
        session_group = request.session["group"]
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
        }
        return render(request, self.template_name, context)


# # タイムラインのajax
# def ajax_timeline(request):
#     groupName = str(request.POST.get('groupName')) # グループ名
#     page = str(request.POST.get('page')) # 現在のページ番号

#     pageNum = int(page) + 1 # 次回、始まりのページ番号

#     # グループ名+page番号より上の行を持ってくる（更新データのみ）
#     data = {
#         # ユーザー名
#         # ユーザーアイコン
#         # 絵
#         # 日記
#         # いいね数
#         "isUserLiked":False,# いいねの有無
#         "page":pageNum, # 次付与するページ番号
#     }
#     return JsonResponse(data)

# # いいね機能
# def ajax_like(request):
#     print("ajax_like")
#     enikkiId = request.POST.get('enikkiId')
#     userId = request.POST.get('userId')
#     likeCount = request.POST.get('likeCount')

#     if likeCount.isdigit():
#         likeCount = int(likeCount)
#     else :
#         print("likeCount"+likeCount)

#     data = {}

#     # 対象の絵日記IDがあるか、なければ404エラー
#     enikki = get_object_or_404(EnikkiModel, pk=enikkiId)
#     print("enikki:"+enikkiId)
#     # likeテーブルから対象記事IDとユーザーIDが同じ行を持ってくる
#     like = Like.objects.filter(user_id=userId, enikki_id=enikki)
#     isLike = Like.check_duplicate(userId,enikki)
#     print(like)
#     # likeテーブルに対象記事に対してユーザーIDがあるか(すでにいいねしてるかどうか)
#     if isLike:
#         like.delete()
#         data['method'] = 'delete'
#         likeCount -= 1
#     else:
#         like.create(user_id=userId,enikki_id=enikki)
#         data['method'] = 'create'
#         likeCount += 1

#     EnikkiModel.objects.create(like_count=likeCount)
#     data['like_count'] = likeCount

#     return JsonResponse(data)

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
# def ajax_group(request):
#     print("ajax_group")
#     groupName = request.POST.get('groupName')
#     reqFile = request.FILES['imageFile']
#     reqFileName = '/media/img/'+reqFile.name
#     print(reqFile.name)
#     chkFlg = Img.check_duplicate('f')
#     print(chkFlg)
#     if not chkFlg:
#         Img.objects.create(img_id='f',img=reqFile)

#     data = {
#         'filePath':reqFileName
#     }

#     return JsonResponse(data)


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
# class CalenderView(TemplateView):

#     template_name = 'calendar.html'

#     def get(self, request, *args, **kwargs):
#         print('GET')
#         return render(request,self.template_name)

#     def post(self, request, *args, **kwargs):
#         print('POST')
#         print(vars(request))

#         # パラメータを含むURLにリダイレクト
#         url = reverse('timeline') + f'?groupName=1&page=1'
#         return redirect(url)
