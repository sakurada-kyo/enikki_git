# views.py
from django.http import HttpResponseRedirect
from django.shortcuts import render, redirect
from django.contrib.auth.views import LoginView
from django.contrib.auth.forms import AuthenticationForm
from django.views.generic.edit import CreateView
from .forms import CustomUserCreationForm, CustomUserCreationForm
from .models import CustomUser
from enikki.models import *
from django.urls import reverse_lazy
from django.views import View
from django.contrib.auth import authenticate, login,logout
from django.contrib.auth.views import PasswordResetView, PasswordResetDoneView, PasswordResetConfirmView, PasswordResetCompleteView

# ログイン
def signin(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('enikki:timeline')
    else:
        form = AuthenticationForm()

    return render(request, 'login.html', {'form': form})

# 新規登録
def signup(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST, request.FILES)
        if form.is_valid():
            # フォームがバリデーションを通過したら確認画面を表示
            form.save()
            return render(request, 'complete.html', {'form': form})
    else:
        form = CustomUserCreationForm()

    return render(request, 'signup.html', {'form': form})

# アカウント確認
def confirm_signup(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST, request.FILES)
        if form.is_valid():
            # ユーザーが確認画面で「完了」ボタンを押したらデータをDBに保存
            user = form.save()
            # ユーザーをログインさせる
            login(request, user)
            return render('complete.html')  # 登録完了ページにリダイレクト
    else:
        return redirect('register')
    
# 登録完了
def complete(request):
    return render(request,template_name='groupCreate.html')

# ログアウト
def signout(request):
    logout(request)
    return render(request,template_name='logout.html')

#######################################################################
class PasswordReset(PasswordResetView):
    # """パスワード変更用URLの送付ページ"""
    subject_template_name = 'mail/subject.txt'
    email_template_name = 'mail/message.txt'
    template_name = 'password_reset_form.html'
    success_url = reverse_lazy('password_reset_done')

class PasswordResetDone(PasswordResetDoneView):
    # """パスワード変更用URLを送りましたページ"""
    template_name = 'password_reset_done.html'

class PasswordResetConfirm(PasswordResetConfirmView):
    # """新パスワード入力ページ"""
    success_url = reverse_lazy('password_reset_complete')
    template_name = 'password_reset_confirm.html'

class PasswordResetComplete(PasswordResetCompleteView):
    # """新パスワード設定しましたページ"""
    template_name = 'password_reset_complete.html'
