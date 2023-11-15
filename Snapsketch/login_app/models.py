from django.db import models

# Create your models here.
import uuid,re
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.core.validators import validate_email,RegexValidator

# アイコンパスを定義
def directory_path(instance, filename):
    cls_name = instance.__class__.__name__

    if cls_name == 'User':
        return 'icon&draw/{0}/{1}'.format(instance.user_id, filename)
    elif cls_name == 'PostMaster':
        return 'icon&draw/{0}/{1}'.format(instance.user.user_id, filename)
    else:
        return 'group/{0}/{1}'.format(instance.groupname,filename)

# 電話番号チェック
def validator_tel(val):

    pattern = r'[(]?\d{2,4}[-)]?\d{2,4}-\d{3,4}'
    res = re.findall(pattern,val)

    return res

# 電話番号チェック
def validator_birthday(val):

   pattern = r'\d{4}/\d{1,2}/\d{1,2}'
   res = re.findall(pattern,val)

   return res

# ユーザーマスタ
class User(AbstractUser):

    # 不要なフィールドはNoneにすることができる
    first_name = None
    last_name = None
    date_joined = None
    groups = None

    user_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(
        max_length=255,
        unique=True
    )
    email = models.CharField(
        max_length=254,
        unique=True,
        # validators=validate_email
        )
    tel = models.CharField(
            max_length=15,
            unique=True,
            # validators=validator_tel
    )
    gender = models.CharField(max_length=1)
    birthday = models.CharField(
        max_length=11,
        # validators=validator_birthday
        )
    icon_path = models.ImageField(upload_to=directory_path)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True, null=True)

    # USERNAME_FIELD = "username"

    def __str__(self):
        return self.username