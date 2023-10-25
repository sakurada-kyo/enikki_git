from django.http import HttpResponse,JsonResponse
from django.shortcuts import render
from .models import EnikkiModel

#タイムライン画面表示
def view_timeline(request):
    model = EnikkiModel.objects.all()
    context = {
        "enikki_list":model
        # グループアイコン
        # グループ内のユーザーアイコン
        # グループ内のユーザー名
        # グループ内のユーザーの絵日記
        # いいね有無(数字)
    }
    return render(request,'timeline.html',context)

#タイムラインのajax
def ajax_timeline(request):
    data = {
        "user_icon_path":{},
        "user_name":{},
        "draw_path":{},
        "diary":{},
    }
    return JsonResponse(data)