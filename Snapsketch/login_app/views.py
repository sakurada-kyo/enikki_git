from django.shortcuts import render
from .forms import SignupForm

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

#ログインの関数
def login_view(request):
    pass

#ログアウトの関数
def logout_view(request):
    pass

#ログインユーザーの情報表示の関数
def user_view(request):
    pass

#他のユーザーの情報の表示
def other_view(request):
    pass
    