from django.urls import path
from . import views

app_name = 'enikki'

urlpatterns = [
    path('calendar/', views.view_calendar, name='calendar'),
    path('usersearch/', views.view_usersearch, name='usersearch'),
]