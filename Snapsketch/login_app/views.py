from django.http import Http404
from django.shortcuts import get_object_or_404, render, redirect
from .forms import SignupForm, LoginForm
from django.contrib.auth import login,logout
from django.views.decorators.csrf import ensure_csrf_cookie
from enikki.models import UserGroupTable


#アカウント登録の関数
@ensure_csrf_cookie
def signup_view(request):
    if request.method == 'POST':

        form = SignupForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('login')
    else:
        form = SignupForm()

    param = {
        'form':form
    }

    return render(request,'signup.html',param)

#ログインの関数
@ensure_csrf_cookie
def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request, data=request.POST)

        if form.is_valid():
            user = form.get_user()

            if user:
                login(request, user)
                try:
                    # ユーザーの所属するグループ取得
                    groups = list(
                        UserGroupTable.objects.filter(user__username=request.user.username)
                        .select_related("group")
                        .values_list('group__groupname', flat=True)
                        .order_by('-group__created_at')
                    )
                    
                    if groups:
                        # セッションに保存
                        request.session['currentGroup'] = groups[0]
                        request.session['groupList'] = groups
                        print(f'currentGroup:{groups[0]},groupList:{groups}')
                    else:
                        raise Http404
                except Http404:
                    print('グループに所属していません')
                return redirect('enikki:timeline')

    else:
        form = LoginForm()

    param = {
        'title':'ログイン',
        'form': form,
    }

    return render(request, 'login.html', param)


#ログアウトの関数
def logout_view(request):
    logout(request)

    return render(request, 'logout.html')

#ログインユーザーの情報表示の関数
def user_view(request):
    pass

#他のユーザーの情報の表示
def other_view(request):
    pass
    