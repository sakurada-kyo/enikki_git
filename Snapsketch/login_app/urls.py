# urls.py
from django.urls import path
from .views import CustomLoginView, CustomUserCreateView, SignUpConfirmationView
from . import views

urlpatterns = [
    # 他のURLパターンとマージする場合は適切に調整する
    path('login/', CustomLoginView.as_view(), name='login'),
    path('signup/', CustomUserCreateView.as_view(), name='signup'),
    path('accountConf/', SignUpConfirmationView.as_view(), name='accountConf'),
    path('', views.index.as_view(), name='index'),
    path('password_change/', views.PasswordChange.as_view(), name='password_change'), #追加
    path('password_change/done/', views.PasswordChangeDone.as_view(), name='password_change_done'), #追加
    path('password_reset/', views.PasswordReset.as_view(), name='password_reset'), #追加
    path('password_reset/done/', views.PasswordResetDone.as_view(), name='password_reset_done'), #追加
    path('reset/<uidb64>/<token>/', views.PasswordResetConfirm.as_view(), name='password_reset_confirm'), #追加
    path('reset/done/', views.PasswordResetComplete.as_view(), name='password_reset_complete'),
]
