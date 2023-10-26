from django.urls import path
from . import views

app_name = 'enikki'

urlpatterns = [
    path('timeline/', views.view_timeline, name='timeline'),
    path('timeline2/',views.view_timeline2,name='timeline2'),
]