from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser

class UserManager(BaseUserManager):

    def create_user(self, email, phone, gender, nickname, birthday, password=None):#ユーザーのフィールドを作成
        if not email:
            raise ValueError('Users must have an email address')

        user = self.model(
            email=self.normalize_email(email),
            nickname=nickname,
            birthday=birthday,
            phone = phone,
            gender = gender,
            
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, nickname, birthday, password=None):#管理ユーザーのフィールドを作成
        user = self.create_user(
            email,
            password=password,
            nickname=nickname,
            birthday=birthday,
        )
        user.is_admin = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    user_id = models.CharField(primary_key=True,max_length=255)
    username = models.CharField(max_length=255)
    username_kana = models.CharField(max_length=255)
    email = models.EmailField(
        verbose_name='email address',
        max_length=255,
        unique=True,
    )
    nickname = models.CharField(max_length=255)
    gender = models.CharField(max_length=1)
    birthday = models.DateField()
    icon_id = models.CharField(max_length=255)
    password = models.CharField(unique=True,max_length=255)

    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nickname', 'birthday']

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):#Trueを返して、権限があることを知らせる
        return True

    def has_module_perms(self, app_label):#Trueを返して、アプリ（App）のモデル（Model）へ接続できるようにする
        return True

    @property
    def is_staff(self):#Trueの場合、Django管理サイトにログインできる
        return self.is_admin

class IconMaster(models.Model):
    icon_id = models.CharField(primary_key=True,max_length=255)
    icon_path = models.CharField(unique=True,null=False,max_length=255)

class GroupMaster(models.Model):
    group_id = models.CharField(primary_key=True,max_length=255)
    groupname = models.CharField(max_length=255,null=False)
    icon_id = models.ForeignKey(IconMaster,on_delete=models.CASCADE)

class PostMaster(models.Model):
    post_id = models.CharField(primary_key=True,max_length=255)
    sketch_path = models.CharField(max_length=255)
    diary = models.CharField(blank=True,null=True,max_length=255)
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    likeCount = models.IntegerField(default=0,null=True)
    commentCount = models.IntegerField(default=0,null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True,null=True)

class FriendTable(models.Model):
    user_id = models.CharField(null=True,max_length=255)
    friend_id = models.CharField(null=True,max_length=255)

    class Meta:
       constraints = [
           # user_idとfriend_idでユニーク制約
           models.UniqueConstraint(fields=['user_id', 'friend_id'], name='unique_stock')
       ]

class UserGroupTable(models.Model):
    user_id = models.CharField(max_length=255)
    group_id = models.CharField(max_length=255)
    
    class Meta:
       constraints = [
           # user_idとgroup_idでユニーク制約
           models.UniqueConstraint(fields=['user_id', 'group_id'], name='unique_UserGroup')
       ]

class FollowersTable(models.Model):
    user_id = models.CharField(max_length=255)
    friend_id = models.CharField(max_length=255)
    
    class Meta:
       constraints = [
           # group_idとimage_idでユニーク制約
           models.UniqueConstraint(fields=['group_id', 'image_id'], name='unique_Fllowers')
       ]

class LikeTable(models.Model):
    user_id = models.CharField(max_length=255)
    post_id = models.CharField(max_length=255)
    
    class Meta:
       constraints = [
           # user_idとpost_idでユニーク制約
           models.UniqueConstraint(fields=['user_id', 'post_id'], name='unique_Like')
       ]

class CommentMaster(models.Model):
    comment_id = models.CharField(primary_key=True,max_length=255)
    user_id = models.CharField(max_length=255)
    post_id = models.CharField(max_length=255)
    comment = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True,null=True)

class GroupPostTable(models.Model):
    group_id = models.CharField(max_length=255)
    post_id = models.CharField(max_length=255)
    page = models.IntegerField(max_length=255,default=1)

    class Meta:
       constraints = [
           # group_idとpost_idでユニーク制約
           models.UniqueConstraint(fields=['group_id', 'post_id'], name='unique_GroupPost')
       ]