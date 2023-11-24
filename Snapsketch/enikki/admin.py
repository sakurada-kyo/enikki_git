from django.contrib import admin
from .models import *

# # Register your models here.
admin.site.register(GroupMaster)
admin.site.register(PostMaster)
admin.site.register(GroupPostTable)
admin.site.register(UserGroupTable)
admin.site.register(LikeTable)
admin.site.register(CommentMaster)

