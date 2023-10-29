from django.urls import path
from . import views

app_name = 'enikki'

urlpatterns = [
    path('timeline/', views.view_timeline, name='timeline'),
    path('ajax_timeline/', views.ajax_timeline, name='ajax_timeline'),
    
]