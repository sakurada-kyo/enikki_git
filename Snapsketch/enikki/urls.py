from django.urls import path
from . import views

app_name = "enikki"

urlpatterns = [
    path("timeline/", views.TimelineView.as_view(), name="timeline"),
    path('timeline/ajax_timeline/', views.ajax_timeline, name='ajax_timeline'),
    path('timeline/ajax_like/', views.ajax_like, name='ajax_like'),
    path('timeline/creategroup/', views.ajax_group, name='ajax_group'),
    path("comment/", views.CommentView.as_view(), name="comment"),
    path('canvas/', views.CanvasView.as_view(), name='canvas'),
    path('create/', views.CreateView.as_view(), name='create'),
    path('mypage/',views.MypageView.as_view(), name='mypage'),
    path('ajax_mypage_detail/', views.ajax_mypage_detail, name='ajax_mypage_detail'),
    path('ajax_mypage_icon/', views.mypage_icon, name='mypage_icon'),
    path("calendar/", views.CalendarView.as_view(), name="calendar"),
    path("calendar/ajax_calendar/", views.ajax_calendar, name="ajax_calendar"),
    path('comment/ajax_comment/',views.ajax_comment, name='ajax_comment'),
    path('friend/', views.FriendView.as_view(), name='friend'),
    path('group/',views.GroupView.as_view(), name='group'),
    path('group/members/list/', views.GroupMembersListView.as_view(), name='group_members_list'),
    path('ajax_changeGroup/',views.ajax_changeGroup, name='changeGroup'),

   
    # path('frequest/',views.RequestView,name='friend_request') #view関数はまだわからないから適当
]
