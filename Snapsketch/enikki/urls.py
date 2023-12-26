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
    path('mypage/',views.MypageView.as_view(), name='mypage'),
# <<<<<<< Updated upstream
    path('ajax_mypage_detail/', views.ajax_mypage_detail, name='ajax_mypage_detail'),
    path('ajax_mypage_icon/', views.mypage_icon, name='mypage_icon'),
#     # path('account/', views.view_accountView, name='account'),
    path("calendar/", views.CalendarView.as_view(), name="calendar"),
    path("calendar/ajax_calendar/", views.ajax_calendar, name="ajax_calendar"),
#     # path('comment/ajax_comment/',views.comment_group, name='ajax_comment'),
    path('friend/', views.FriendView.as_view(), name='friend'),
    path('group/',views.GroupView.as_view(), name='group'),
#     # path('group/members/list/', views.group_members_list.as_view(), name='group_members_list'),
    path('group/members/list/', views.GroupMembersListView.as_view(), name='group_members_list'),
# =======
#     path('ajax_myPageup/', views.update_user_details, name='update_user_details'),
#     # path('ajax_myPagemail/', views.update_mail_details, name='update_mail_details'),
#     path('ajax_myPage/', views.mypage_icon, name='mypage_icon'),
#     path('account/', views.view_accountView, name='account'),
#     path("calendar/", views.CalenderView.as_view(), name="calendar"),
#     # path('comment/ajax_comment/',views.comment_group, name='ajax_comment'),
#     path('friend/', views.view_friendView, name='friend'),
#     path('group/',views.ajax_group, name='group'),
# >>>>>>> Stashed changes
    path('ajax_changeGroup/',views.ajax_changeGroup, name='changeGroup'),

   
    # path('frequest/',views.RequestView,name='friend_request') #view関数はまだわからないから適当
]
