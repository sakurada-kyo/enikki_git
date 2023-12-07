# views.py
from django.shortcuts import render, redirect
from django.contrib.auth.views import LoginView
from django.views.generic.edit import CreateView
from .forms import CustomUserCreationForm
from .models import CustomUser
from django.urls import reverse_lazy

class CustomLoginView(LoginView):
    template_name = 'login.htmlあ'  # ログインフォームが表示されるテンプレートの指定
    success_url = reverse_lazy('enikki:timeline')  # ログイン成功時のリダイレクト先

class CustomUserCreateView(CreateView):
    model = CustomUser
    form_class = CustomUserCreationForm
    template_name = 'signup.html'  # ユーザー作成フォームが表示されるテンプレートの指定
    success_url = reverse_lazy('login')  # 登録後にログインページにリダイレクト
