from django.db import models
from django.contrib.auth import get_user_model
import uuid

userInstance = get_user_model()

# アイコンパスを定義
def directory_path(instance, filename):
    # User用
    if isinstance(instance, userInstance):
        # return 'icon/{0}/{1}'.format(instance.user_id, filename)
        return 'icon/{0}'.format(filename)
    # PostMaster用
    if isinstance(instance, PostMaster):
        return 'sketch/{0}/{1}'.format(instance.user.username,filename)
    
    # GroupMaster用
    if isinstance(instance,GroupMaster):
        return 'group/{0}/{1}'.format(instance.groupname,filename)

# グループマスタ
class GroupMaster(models.Model):
    group_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    groupname = models.CharField(max_length=255,null=False)
    group_icon_path = models.ImageField(upload_to=directory_path)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True,null=True)
    
     
# # 投稿マスタ
class PostMaster(models.Model):
    post_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sketch_path = models.ImageField(upload_to=directory_path,blank=True,null=True)
    diary = models.CharField(blank=True,null=True,max_length=255)
    user = models.ForeignKey(userInstance,on_delete=models.CASCADE)
    like_count = models.IntegerField(default=0,null=True)
    comment_count = models.IntegerField(default=0,null=True)
    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True,null=True)

# # ユーザーグループテーブル
class UserGroupTable(models.Model):
    user = models.ForeignKey(userInstance, on_delete=models.CASCADE,related_name='usergroup_user')
    group = models.ForeignKey(GroupMaster, on_delete=models.CASCADE,related_name='usergroup_group')

# # フォロワーテーブル
class Follower(models.Model):
    follower  = models.ForeignKey(userInstance, on_delete=models.CASCADE, related_name='follower_user')
    followee  = models.ForeignKey(userInstance,  on_delete=models.CASCADE, related_name='followee_user')

    def __str__(self):
        return "{0} : {1}".format(self.follower.username, self.followee.username)

# # いいねテーブル
class LikeTable(models.Model):
    user = models.ForeignKey(userInstance, on_delete=models.CASCADE,related_name='like_user')
    post = models.ForeignKey(PostMaster, on_delete=models.CASCADE,related_name='like_post')

# # コメントマスタ
class CommentMaster(models.Model):
    comment_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(userInstance, on_delete=models.CASCADE,related_name='comment_user')
    post = models.ForeignKey(PostMaster, on_delete=models.CASCADE,related_name='comment_post')
    comment = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True,null=True)

# #グループ投稿テーブル
class GroupPostTable(models.Model):
    group = models.ForeignKey(GroupMaster, on_delete=models.CASCADE,related_name='grouppost_group')
    post = models.ForeignKey(PostMaster, on_delete=models.CASCADE,related_name='grouppost_post')
    page = models.IntegerField(default=1)

    class Meta:
        constraints = [
           # group_idとpost_idでユニーク制約
           models.UniqueConstraint(fields=['group_id', 'post_id'], name='unique_GroupPost')
        ]

# # #友達申請テーブル
# class RequestTable(models.Model):
#     request_user_id = models.ForeignKey(userInstance,  on_delete=models.CASCADE, related_name='request_user_id')
#     user_id = models.ForeignKey(userInstance,  on_delete=models.CASCADE, related_name='user_id')