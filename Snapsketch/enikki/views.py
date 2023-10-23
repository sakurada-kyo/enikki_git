from django.http import HttpResponse
from django.shortcuts import render

#タイムライン画面表示
def view_timeline(request):
    # context = {
    #     # グループアイコン
    #     # グループ内のユーザーアイコン
    #     # グループ内のユーザー名
    #     # グループ内のユーザーの絵日記
    #     # いいね有無(数字)
    # }
    return render(request,'timeline.html')

#タイムラインのajax
def ajax_timeline(request):
    return