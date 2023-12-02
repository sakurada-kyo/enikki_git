from django.http import Http404
from django.shortcuts import get_object_or_404, render, redirect
from .forms import SignupForm, LoginForm
from django.contrib.auth import login,logout
from django.views.decorators.csrf import ensure_csrf_cookie
from enikki.models import UserGroupTable,GroupMaster



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
                groups = (
                            UserGroupTable.objects.filter(user__username=request.user.username)
                        .select_related("group")
                        .values_list('group__groupname', flat=True)
                    )
                if groups:
                    request.session['group'] = groups
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
    