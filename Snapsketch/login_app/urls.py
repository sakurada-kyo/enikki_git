# urls.py
from django.urls import path
from . import views

urlpatterns = [
    # 他のURLパターンとマージする場合は適切に調整する
    path('signin/', views.signin, name='signin'),
    path('signup/', views.signup, name='signup'),
    path('complete/', views.complete, name='complete'),
    path('password_reset/', views.PasswordReset.as_view(), name='password_reset'), #追加
    path('password_reset/done/', views.PasswordResetDone.as_view(), name='password_reset_done'), #追加
    path('reset/<uidb64>/<token>/', views.PasswordResetConfirm.as_view(), name='password_reset_confirm'), #追加
    path('reset/done/', views.PasswordResetComplete.as_view(), name='password_reset_complete'),
]