# models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class CustomUser(AbstractUser):
    MALE = 'M'
    FEMALE = 'F'
    OTHER = 'O'

    GENDER_CHOICES = [
        (MALE, 'Male'),
        (FEMALE, 'Female'),
        (OTHER, 'Other'),
    ]

    user_id = models.UUIDField(default=uuid.uuid4, editable=False)
    user_icon_path = models.ImageField(upload_to='user_icons/')
    tel = models.CharField(max_length=11,null=True,blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    birthday = models.DateField(null=True,blank=True)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True,null=True)
    
    first_name = None  # First nameを削除
    last_name = None  # Last nameを削除
    date_joined = None  # Date joinedを削除


    def __str__(self):
        return self.username
