from django.urls import path
from . import views

app_name = 'enikki'

urlpatterns = [
    path('timeline/', views.view_timeline, name='timeline'),
    path('timeline/ajax_timeline/', views.ajax_timeline, name='ajax_timeline'),
    path('friend/', views.view_friend,name='friend'),
    path('mypage/', views.view_mypage,name='mypage'),
    path('comment/', views.view_comment,name='comment'),
]