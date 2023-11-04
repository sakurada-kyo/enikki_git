import json
from django.http import HttpResponse,JsonResponse
from django.shortcuts import get_object_or_404, render
from .models import EnikkiModel,Like

# タイムライン画面表示
def view_timeline(request):
    # 結合して下記のデータ持ってくる
    model = EnikkiModel.objects.all()
    context = {
        "EnikkiModel":model,
        "currentPath":request.path,
        "isUserLiked":"",#ユーザーがいいねしているかどうか
        "likeCount":"",#いいね数
    }
    return render(request,'timeline.html',context)

# タイムラインのajax
def ajax_timeline(request):
    groupName = str(request.POST.get('groupName')) # グループ名
    page = str(request.POST.get('page')) # 現在のページ番号

    pageNum = int(page) + 1 # 次回、始まりのページ番号

    # グループ名+page番号より上の行を持ってくる（更新データのみ）
    data = {
        # ユーザー名
        # ユーザーアイコン
        # 絵
        # 日記
        # いいね数
        "isUserLiked":"",# いいねの有無
        "page":pageNum, # 次付与するページ番号
    }
    return JsonResponse(data)

# #いいね機能
def ajax_like(request):
    print("ajax_like")
    enikkiId = request.POST.get('enikkiId')
    userId = request.POST.get('userId')

    print("enikkiId:"+enikkiId)
    print("userId:"+userId)

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
    else:
        like.create(user_id=userId,enikki_id=enikki)
        data['method'] = 'create'

    data['like_count'] = 0

    return JsonResponse(data)