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

    groupName = str(request.POST.get('groupName'))
    page = int(request.POST.get('page'))

    # グループ名+page番号より上の行を持ってくる
    data = {
        "userIconPath":{},
        "userName":{},
        "drawPath":{},
        "diary":{},
        "groupName":{},
        "page":{}
    }
    return JsonResponse(data)