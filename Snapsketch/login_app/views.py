# views.py
from django.shortcuts import render, redirect
from django.contrib.auth.views import LoginView
from django.views.generic.edit import CreateView
from .forms import CustomUserCreationForm, CustomUserCreationForm
from .models import CustomUser
from enikki.models import *
from django.urls import reverse_lazy
from django.views import View
from django.contrib.auth import login
from django.contrib.auth.views import PasswordChangeView, PasswordChangeDoneView, PasswordResetView, PasswordResetDoneView, PasswordResetConfirmView, PasswordResetCompleteView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import generic

class CustomLoginView(LoginView):
    template_name = 'login.html'  # ログインフォームが表示されるテンプレートの指定
    success_url = reverse_lazy('enikki:timeline')  # ログイン成功時のリダイレクト先

    def form_valid(self, form):
        # 親クラスの form_valid メソッドを実行してログインを完了させる
        response = super().form_valid(form)

        # ログインが成功したユーザー情報を取得する
        user = self.request.user
        print(user.user_id)

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
    success_url = reverse_lazy('accountConf')  # 登録後にログインページにリダイレクト


class SignUpConfirmationView(View):
    template_name = 'accountConf.html'

    def post(self, request, *args, **kwargs):
        form = CustomUserCreationForm(request.POST, request.FILES)
        if form.is_valid():
            user = form.save()
            login(request, user)
            # フォームがバリデーションを通過した場合、確認画面にデータを渡して表示
            return render(request, self.template_name, {'form': form})
        else:
            print(form.errors)
            # フォームが無効な場合、新規登録画面に戻る
            return redirect('signup')

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
