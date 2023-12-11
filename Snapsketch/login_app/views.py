# views.py
from django.shortcuts import render, redirect
from django.contrib.auth.views import LoginView
from django.views.generic.edit import CreateView
from .forms import CustomUserCreationForm
from .models import CustomUser
from enikki.models import *
from django.urls import reverse_lazy

class CustomLoginView(LoginView):
    template_name = 'login.html'  # ログインフォームが表示されるテンプレートの指定
    success_url = reverse_lazy('enikki:timeline')  # ログイン成功時のリダイレクト先

    def form_valid(self, form):
        # 親クラスの form_valid メソッドを実行してログインを完了させる
        response = super().form_valid(form)

        # ログインが成功したユーザー情報を取得する
        user = self.request.user

        # ユーザーに紐づくグループ取得
        groups = (
                    UserGroupTable.objects.filter(user__username=user.username)
                    .select_related("group")
                    .values_list('group__groupname', flat=True)
                    .order_by('group__created_at')
                    )
        if groups:
            groups_list = list(groups)
            self.request.session['groupList'] = groups_list
            self.request.session['currentGroup'] = groups_list[0]

        return response
    
class CustomUserCreateView(CreateView):
    model = CustomUser
    form_class = CustomUserCreationForm
    template_name = 'signup.html'  # ユーザー作成フォームが表示されるテンプレートの指定
    success_url = reverse_lazy('login')  # 登録後にログインページにリダイレクト
