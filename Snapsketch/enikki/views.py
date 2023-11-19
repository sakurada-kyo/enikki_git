from django.views.generic import TemplateView
import json,base64
from django.http import HttpResponse,JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from .models import PostMaster
from django.utils.crypto import get_random_string
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile
from .models import *

# # タイムライン画面表示
def view_timeline(request):
    # セッションからユーザーに紐づくグループ取得
    # 抽出したグループの投稿を持ってくる　下記にセット

    # ログインしているユーザーが所属するグループのgroup_idをセッションから取得
    groupName = request.session.get('groupName')  # ここで'session_key'は実際のキーに置き換えてください

    # グループが存在するか確認(オブジェクト取得)
    user_group = get_object_or_404(GroupMaster, groupname=groupName)

    # グループに関連する投稿を取得し、条件に基づいてソート
    group_posts = GroupPostTable.objects.filter(group_id=user_group).select_related('post_id__user')  # 適切な関連データを取得

    # "PostMaster" モデルを使用して必要な情報を取得し、"updated_at" の昇順でソート
    posts = PostMaster.objects.filter(id__in=group_posts.values_list('post_id', flat=True)).order_by('updated_at')

    # 取得した投稿情報を利用する（例: テンプレートに渡す）
    for post in posts:
        sketch_path = post.sketch_path
        diary = post.diary
        like_count = post.likeCount
        comment_count = post.commentCount
        # 他の情報も必要に応じて利用できます




    # context = {
    #     "EnikkiModel":model,
    #     "currentPath":request.path,
    #     "isUserLiked":"false",#ユーザーがいいねしているかどうか
    #     # "likeCount":"1",#いいね数
    # }
    # return render(request,'timeline.html',context)

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

# # コメントページ表示
# def view_comment(request):

#     groupName = request.GET["group"]
#     page = str(request.GET["page"])

#     context = {}
#     # DBからの情報
#     # ユーザー名
#     # アイコン
#     # コメント数
#     # いいね数
#     # 絵日記
#     # コメントユーザー名
#     # コメントユーザーアイコン
#     # コメント

#     return render(request,'comment.html',context)

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

    template_name = 'canvas.html'

    def get(self, request, *args, **kwargs):
        print('GET')

        return render(request,self.template_name)
    
class EnikkiPostView(TemplateView):

    template_name = 'timeline.html'
    
    def post(self, request, *args, **kwargs):
        print('POST')

        diary = request.POST.get('sentence')

        # request.user+日付から投稿抽出
        # 日記と作成日を保存

        return redirect('timeline')

# 絵日記作成画面
class CreateView(TemplateView):

    template_name = 'create.html'

    def get(self, request, *args, **kwargs):
        print('GET')
        return render(request,self.template_name)

    def post(self, request, *args, **kwargs):
        print('POST')
        print(vars(request))
        
        # if reqFile:
        #     reqFileName = 'img/'+reqFile.name
        # else :
        #     reqFileName = None

        # context = {
        #         'canvasFilePath':reqFileName
        #     }
        # form = CanvasForm(request.POST,request.FILES)
        reqFile = request.FILES['img']
        reqFileName = reqFile.name
        reqFileBinary = reqFile.read()
        
        # バイナリデータをPIL Imageに変換する
        image = Image.open(BytesIO(reqFileBinary))
        
        # JPEG形式に変換（もしJPEGでない場合は変換が必要です）
        if image.format != 'JPEG':
            image = image.convert('RGB')
        
        # ランダムファイル名
        rand = get_random_string(3)
        
        # Djangoモデルに保存
        # model = PostMaster()
        image_io = BytesIO()
        image.save(image_io, format='JPEG')  # JPEGとして保存
        # Djangoモデルに保存
        postId = f'u{rand}_{reqFileName}'
        imgFileName = f'{postId}.jpg'
        model_instance = PostMaster(post_id=postId,user=self.request.user.user_id)
        model_instance.sketch_path.save(imgFileName, ContentFile(image_io.getvalue()), save=True)
        

        context = {
            'canvasFilePath':f'{imgFileName}'# username/sketch/filename
        }
            

        return render(request,self.template_name,context)
