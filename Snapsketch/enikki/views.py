import json
from django.http import HttpResponse,JsonResponse
from django.shortcuts import get_object_or_404, render
from .models import EnikkiModel,Like
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import login, authenticate
from django.views.generic import CreateView
from . forms import UserCreateForm

# タイムライン画面表示
def view_timeline(request):
    # 結合して下記のデータ持ってくる
    model = EnikkiModel.objects.all()
    context = {
        "EnikkiModel":model,
        "currentPath":request.path,
        "isUserLiked":"false",#ユーザーがいいねしているかどうか
        # "likeCount":"1",#いいね数
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
        "isUserLiked":False,# いいねの有無
        "page":pageNum, # 次付与するページ番号
    }
    return JsonResponse(data)

# いいね機能
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

# コメントページ表示
def view_comment(request):
       
    groupName = request.GET["group"]
    page = str(request.GET["page"])
    
    
    
    context = {}
    # DBからの情報
    # ユーザー名
    # アイコン
    # コメント数
    # いいね数
    # 絵日記
    # コメントユーザー名
    # コメントユーザーアイコン
    # コメント
    
    return render(request,'comment.html',context);

# グループ新規作成
def ajax_group(request):
    groupName = request.POST.get('groupName')
    data = {}
    return JsonResponse(data)

#アカウント作成
class Create_account(CreateView):
    def post(self, request, *args, **kwargs):
        form = UserCreateForm(data=request.POST)
        if form.is_valid():
            form.save()
            #フォームから'username'を読み取る
            username = form.cleaned_data.get('username')
            #フォームから'password1'を読み取る
            password = form.cleaned_data.get('password1')
            birthday = form.cleaned_data.get('birthday')
            maleaddress = form.cleaned_data.get('maleaddress')
            gender = form.cleaned_data.get('gender')

            user = authenticate(username=username, password=password, birthday=birthday, maleaddress=maleaddress, gender=gender)
            login(request, user)
            return redirect('/')
        return render(request, 'create.html', {'form': form,})

    def get(self, request, *args, **kwargs):
        form = UserCreateForm(request.POST)
        return  render(request, 'create.html', {'form': form,})

create_account = Create_account.as_view()

#ログイン機能
class Account_login(View):
    def post(self, request, *arg, **kwargs):
        form = LoginForm(data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            user = User.objects.get(username=username)
            login(request, user)
            return redirect('/')
        return render(request, 'login.html', {'form': form,})

    def get(self, request, *args, **kwargs):
        form = LoginForm(request.POST)
        return render(request, 'login.html', {'form': form,})

account_login = Account_login.as_view()