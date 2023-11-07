from django.urls import path
from . import views

app_name = 'enikki'

urlpatterns = [
    path('timeline/', views.view_timeline, name='timeline'),
    path('timeline/ajax_timeline/', views.ajax_timeline, name='ajax_timeline'),
    path('timeline/ajax_like/', views.ajax_like, name='ajax_like'),
    path('timeline/creategroup/', views.ajax_group, name='ajax_group'),
    path('comment/', views.view_comment, name='comment'),
    path('login/', views.view_index, name='login'),
    path('account/', views.view_account, name='account'),
    path('complete/', views.view_complete, name='complete'),
]