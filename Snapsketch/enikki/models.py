from django.db import models
from django.conf import settings
import uuid
from django.contrib.auth.models import AbstractUser

userInstance = settings.AUTH_USER_MODEL
# アイコンパスを定義
def directory_path(instance, filename):
    
    
    # User用
    if isinstance(instance,userInstance):
        return 'icon&draw/{0}/{1}'.format(instance.user_id, filename)
    
    # PostMaster用
    if isinstance(instance, PostMaster):
        return 'sketch/{0}/{1}'.format(instance.user.user_id,filename)
    
    # GroupMaster用
    if isinstance(instance, GroupMaster):
        return 'group/{0}/{1}'.format(instance.groupname,filename)


class User(AbstractUser):    
    # 不要なフィールドはNoneにすることができる
    first_name = None
    last_name = None
    date_joined = None
    groups = None
    last_login = None

    user_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(
        max_length=255,
        unique=True
    )
    email = models.EmailField(max_length=254, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    REQUIRED_FIELDS = ["email"]

    class Meta:
        db_table = "User"

    def __str__(self):
        return self.username


# グループマスタ
class GroupMaster(models.Model):
    group_id = models.CharField(primary_key=True,max_length=255)
    groupname = models.CharField(max_length=255,null=False)
    group_icon_path = models.ImageField(upload_to=directory_path)
    
# # 投稿マスタ
class PostMaster(models.Model):
    post_id = models.CharField(primary_key=True,max_length=255)
    sketch_path = models.ImageField(upload_to=directory_path)
    diary = models.CharField(blank=True,null=True,max_length=255)
    user = models.ForeignKey(userInstance,on_delete=models.CASCADE)
    likeCount = models.IntegerField(default=0,null=True)
    commentCount = models.IntegerField(default=0,null=True)
    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True,null=True)

# # ユーザーグループテーブル
class UserGroupTable(models.Model):
    user = models.ForeignKey(userInstance, on_delete=models.CASCADE,related_name='user')
    group = models.ForeignKey(GroupMaster, on_delete=models.CASCADE,related_name='group')
    created_at = models.DateTimeField(auto_now_add=True)

# # フォロワーテーブル
# class Follower(models.Model):
#     follower  = models.ForeignKey(User, on_delete=models.CASCADE, related_name='follower_user')
#     followee  = models.ForeignKey(User,  on_delete=models.CASCADE, related_name='followee_user')

#     def __str__(self):
#         return "{} : {}".format(self.follower.username, self.followee.username)

# # いいねテーブル
# class LikeTable(models.Model):
#     user_id = models.ForeignKey(User, on_delete=models.CASCADE,related_name='user')
#     post_id = models.ForeignKey(PostMaster, on_delete=models.CASCADE,related_name='post')

# # コメントマスタ
# class CommentMaster(models.Model):
#     comment_id = models.CharField(primary_key=True,max_length=255)
#     user_id = models.ForeignKey(User, on_delete=models.CASCADE,related_name='user')
#     post_id = models.ForeignKey(PostMaster, on_delete=models.CASCADE,related_name='post')
#     comment = models.CharField(max_length=255)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     deleted_at = models.DateTimeField(blank=True,null=True)

#グループ投稿テーブル
class GroupPostTable(models.Model):
    group_id = models.ForeignKey(GroupMaster, on_delete=models.CASCADE,related_name='group')
    post_id = models.ForeignKey(PostMaster, on_delete=models.CASCADE,related_name='post')
    page = models.IntegerField(max_length=255,default=1)

#     class Meta:
#         constraints = [
#            # group_idとpost_idでユニーク制約
#            models.UniqueConstraint(fields=['group_id', 'post_id'], name='unique_GroupPost')
#         ]