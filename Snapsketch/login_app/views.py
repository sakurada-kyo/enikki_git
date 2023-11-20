from django.shortcuts import render, redirect
from .forms import SignupForm, LoginForm
from django.contrib.auth import login
from django.contrib.auth import login,logout
from enikki.views import view_timeline


#アカウント登録の関数
def signup_view(request):
    if request.method == 'POST':

        form = SignupForm(request.POST)
        if form.is_valid():
            form.save()

    else:
        form = SignupForm()

    param = {
        'form':form
    }

    return render(request,'signup.html',param)

# #ログイン画面表示用関数
# def login_view(request):
#     if request.method == 'POST':
#         form = LoginForm(request, data=request.POST)
    
#     return render(request, 'login.html')


#ログインの関数
def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request, data=request.POST)

        if form.is_valid():
            user = form.get_user()

            if user:
                login(request, user)
                return redirect('timeline')

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
    