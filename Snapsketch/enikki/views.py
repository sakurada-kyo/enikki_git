import json
from django.http import HttpResponse,JsonResponse
from django.shortcuts import render
from .models import EnikkiModel,Friend,MyPage,Comment

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

    #友人一覧
def view_friend(request):
    # friend = Friend.objects.all().filter(userId=request.userId)
    friend = Friend.objects.all()
    context = {
        'friends':friend
    }
    return render(request,'friend.html',context)

    #マイページ
def view_mypage(request):
    mypage = MyPage.objects.get(user_id='20010101')
    print(mypage)
    context = {
        'mypage':mypage
    }
    return render(request,'myPage.html',context)

    #コメント
def view_comment(request):
    comment = Comment.objects.all()
    userName = str(request.POST.get('user_name'))
    context = {
        'comment':comment
    }
    return render(request,'comment.html',context)