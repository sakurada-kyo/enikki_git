from django.contrib import admin
from .models import *

# # Register your models here.
admin.site.register(GroupPostTable)
admin.site.register(CommentMaster)
admin.site.register(LikeTable)
admin.site.register(Follower)
admin.site.register(UserGroupTable)
admin.site.register(PostMaster)
admin.site.register(GroupMaster)

