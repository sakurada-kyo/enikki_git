import json
from django.http import HttpResponse,JsonResponse
from django.shortcuts import render
from .models import EnikkiModel

#タイムライン画面表示
def view_timeline(request):
    model = EnikkiModel.objects.all()
    # page = request.GET.get("page")
    print(model)
    context = {
        "enikki_list":model,
        "current_path":request.path
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
    return 