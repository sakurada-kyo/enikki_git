from django.urls import path
from . import views

app_name = 'enikki'

urlpatterns = [
    path('timeline/', views.view_timeline, name='timeline'),
    path('timeline/ajax_timeline/', views.ajax_timeline, name='ajax_timeline'),
    path('timeline/ajax_like/', views.ajax_like, name='ajax_like'),
    path('timeline/creategroup/', views.ajax_group, name='ajax_group'),
    path('timeline/comment/', views.view_comment, name='comment'),
    
]