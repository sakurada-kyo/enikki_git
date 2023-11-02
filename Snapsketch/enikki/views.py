import json
from django.http import HttpResponse,JsonResponse
from django.shortcuts import get_object_or_404, render
from .models import EnikkiModel,Like

#タイムライン画面表示
def view_timeline(request):
    model = EnikkiModel.objects.all()
    # page = request.GET.get("page")
    context = {
        "enikki_list":model,
        "current_path":request.path,
        #ユーザーがいいねしているかどうか
        "is_user_liked":"''",
        #いいね数
        "like_count":"",
    }
    return render(request,'timeline.html',context)

#タイムラインのajax
def ajax_timeline(request):
    groupName = str(request.POST.get('groupName'))# グループ名
    page = str(request.POST.get('page'))#現在のページ番号

    pageNum = int(page) + 1#次回、始まりのページ番号

    # グループ名+page番号より上の行を持ってくる（更新データのみ）
    data = {
        # ユーザー名
        # ユーザーアイコン
        # 絵
        # 日記
        # いいね数
        # いいねの有無
        "page":pageNum#次付与するページ番号
    }
    return JsonResponse(data)

#いいね機能
def ajax_like(request):
    articleId = request.POST.get('articleId')
    userId = request.POST.get('userId')
    context = {
        'user_id': userId,
    }
    article = get_object_or_404(EnikkiModel, pk=articleId)
    #likeテーブルから対象記事IDとユーザーIDが同じ行を持ってくる
    like = Like.objects.filter(target=article, user_id=userId)
    #likeテーブルに対象記事に対してユーザーIDがあるか(すでにいいねしてるかどうか)
    if like.exists():
        like.delete()
        context['method'] = 'delete'
    else:
        like.create(target=article, user_id=request.user)
        context['method'] = 'create'

    context['like_count'] = article.like_set.count()

    return JsonResponse(context)