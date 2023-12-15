# urls.py
from django.urls import path
from .views import CustomLoginView, CustomUserCreateView, SignUpConfirmationView

urlpatterns = [
    # 他のURLパターンとマージする場合は適切に調整する
    path('login/', CustomLoginView.as_view(), name='login'),
    path('signup/', CustomUserCreateView.as_view(), name='signup'),
    path('accountConf/', SignUpConfirmationView.as_view(), name='accountConf'),
]
