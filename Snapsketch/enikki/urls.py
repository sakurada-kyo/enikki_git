from django.urls import path
from . import views

app_name = "enikki"

urlpatterns = [
    path("timeline/", views.TimelineView.as_view(), name="timeline"),
    path('timeline/ajax_timeline/', views.ajax_timeline, name='ajax_timeline'),
    path('timeline/fetch_like/', views.fetch_like, name='fetch_like'),
    path('timeline/creategroup/', views.fetch_group_create, name='fetch_group_create'),
    path("comment/", views.CommentView.as_view(), name="comment"),
    path('canvas/', views.CanvasView.as_view(), name='canvas'),
    path('create/', views.CreateView.as_view(), name='create'),
    path('mypage/',views.MypageView.as_view(), name='mypage'),
    path('ajax_mypage_detail/', views.ajax_mypage_detail, name='ajax_mypage_detail'),
    path('ajax_mypage_icon/', views.mypage_icon, name='mypage_icon'),
    path("calendar/", views.CalendarView.as_view(), name="calendar"),
    path("calendar/ajax_calendar/", views.ajax_calendar, name="ajax_calendar"),
    path('comment/ajax_comment/',views.ajax_comment, name='ajax_comment'),
    path('comment/delete_comment/',views.delete_comment,name='delete_comment'),
    path('friend/', views.FriendView.as_view(), name='friend'),
    path('group/',views.GroupView.as_view(), name='group'),
    path('group/ajax_groupmembers_list/',views.ajax_groupmembers_list, name='ajax_groupmembers_list'),
    path('group/ajax_deletemembers_list/',views.ajax_deletemembers_list, name='ajax_deletemembers_list'),
    path('group/ajax_getmembers_list/',views.ajax_getmembers_list,name='ajax_getmembers_list'),
    path('ajax_changeGroup/',views.ajax_changeGroup, name='changeGroup'),
    path('grouptest/', views.fetch_grouplist,name='grouptest'),
    path('timeline/fetch_posts/', views.fetch_posts,name='fetch_posts'),
    path('fetch_loadmore/', views.fetch_loadmore,name='fetch_loadmore'),
    path('usersearch/', views.SearchView.as_view(),name='usersearch'),
    path('usersearch/ajax_search/', views.ajax_search,name='ajax_search'),
    path('usersearch/ajax_follow/', views.ajax_follow,name='ajax_follow'),
    path('create_group/', views.create_group,name='create_group'),
    path('request/', views.request_view,name='request'),

]
