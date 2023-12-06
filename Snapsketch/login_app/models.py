from django.db import models

from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    nickname = models.CharField(max_length=100)


    REQUIRED_FIELDS = ["nickname"]

    last_name = None
    is_staff = None
    is_active = None
    first_name = None
    is_superuser = None
    id = None  