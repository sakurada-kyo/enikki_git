from django.contrib import admin
from .models import *
from import_export import resources  #追加
from import_export.admin import ImportExportModelAdmin  #追加

# # Register your models here.
# admin.site.register(GroupPostTable)
# admin.site.register(CommentMaster)
# admin.site.register(LikeTable)
# admin.site.register(Follower)
# admin.site.register(UserGroupTable)
# admin.site.register(PostMaster)
# admin.site.register(GroupMaster)
# admin.site.register(FrequestTable)

class GroupPostTableResource(resources.ModelResource):
    class Meta:
        model = GroupPostTable

class CommentMasterResource(resources.ModelResource):
    class Meta:
        model = CommentMaster

class LikeTableResource(resources.ModelResource):
    class Meta:
        model = LikeTable
        
class UserGroupTableResource(resources.ModelResource):
    class Meta:
        model = UserGroupTable
        
class PostMasterResource(resources.ModelResource):
    class Meta:
        model = PostMaster

class GroupMasterResource(resources.ModelResource):
    class Meta:
        model = GroupMaster
        
class FrequestTableResource(resources.ModelResource):
    class Meta:
        model = FrequestTable



@admin.register(GroupPostTable)
# ImportExportModelAdminを継承したadminクラスを作成
class GroupPostTableAdmin(ImportExportModelAdmin):
    list_display=('group', 'post','page')

    # resource_classにModelResourceを継承したクラスを設定
    resource_class = GroupPostTableResource


@admin.register(CommentMaster)
# ImportExportModelAdminを継承したadminクラスを作成
class CommentMasterAdmin(ImportExportModelAdmin):
    ordering = ['created_at']
    list_display=('user', 'post', 'comment')

    # resource_classにModelResourceを継承したクラスを設定
    resource_class = CommentMasterResource

@admin.register(LikeTable)
# ImportExportModelAdminを継承したadminクラスを作成
class LikeTableAdmin(ImportExportModelAdmin):
    list_display=('user','post')

    # resource_classにModelResourceを継承したクラスを設定
    resource_class = LikeTableResource

@admin.register(UserGroupTable)
# ImportExportModelAdminを継承したadminクラスを作成
class UserGroupTableAdmin(ImportExportModelAdmin):
    list_display=('user','group')

    # resource_classにModelResourceを継承したクラスを設定
    resource_class = UserGroupTableResource
    
@admin.register(PostMaster)
# ImportExportModelAdminを継承したadminクラスを作成
class PostMasterAdmin(ImportExportModelAdmin):
    ordering = ['created_at']
    list_display=('post_id','sketch_path','diary','user','like_count','like_count','comment_count')

    # resource_classにModelResourceを継承したクラスを設定
    resource_class = PostMasterResource
    
@admin.register(GroupMaster)
# ImportExportModelAdminを継承したadminクラスを作成
class GroupMasterAdmin(ImportExportModelAdmin):
    ordering = ['created_at']
    list_display=('group_id','groupname','group_icon_path')

    # resource_classにModelResourceを継承したクラスを設定
    resource_class = GroupMasterResource

@admin.register(FrequestTable)
# ImportExportModelAdminを継承したadminクラスを作成
class FrequestTableAdmin(ImportExportModelAdmin):
    list_display=('request_user_id','user_id')

    # resource_classにModelResourceを継承したクラスを設定
    resource_class = FrequestTableResource