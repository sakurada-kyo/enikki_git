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
from django.views.decorators.csrf import csrf_exempt

# セッションにグループ保存（ログイン時に使用）
def set_session_group(request):
    user = request.user
    groupnames = (
        UserGroupTable.objects
        .filter(user=user)
        .values_list('group__groupname',flat=True)
        .order_by('group__created_at')
    )
    group_list = [group for group in groupnames]
    request.session['groupList'] = group_list
    request.session['currentGroup'] = group_list[0]

# ログイン
@csrf_exempt
def signin(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request,user)
                print(f'user_id:{request.user.user_id}')
                set_session_group(request)
                return redirect('enikki:timeline')
    else:
        form = AuthenticationForm()

    return render(request, 'login.html', {'form': form})

# 新規登録
@csrf_exempt
def signup(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST, request.FILES)
        if form.is_valid():
            # フォームがバリデーションを通過したら確認画面を表示
            user = form.save()
            login(request, user)
            return render(request, 'complete.html', {'form': form})
    else:
        form = CustomUserCreationForm()

    return render(request, 'signup.html', {'form': form})

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
