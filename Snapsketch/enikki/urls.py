from django.urls import path
from . import views

app_name = "enikki"

urlpatterns = [
    path("timeline/", views.TimelineView.as_view(), name="timeline"),
    path('timeline/ajax_timeline/', views.ajax_timeline, name='ajax_timeline'),
    path('timeline/ajax_like/', views.ajax_like, name='ajax_like'),
    path('timeline/creategroup/', views.ajax_group, name='ajax_group'),
    path("timeline/comment/", views.CommentView.as_view(), name="comment"),
    path('canvas/', views.CanvasView.as_view(), name='canvas'),
    path('create/', views.CreateView.as_view(), name='create'),
    # path('mypage/',, name='mypage'),
     path('account/', views.view_accountView, name='account'),
     path("calendar/", views.CalenderView.as_view(), name="calendar"),
     path('comment/ajax_comment/',views.comment_group, name='ajax_comment'),
     path('friend/', views.view_friendView, name='friend'),
]
