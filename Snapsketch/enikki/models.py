from django.db import models

class EnikkiModel(models.Model):
    user_id = models.CharField(primary_key=True,max_length=100)
    user_name = models.CharField(max_length=100)
    user_icon = models.ImageField(upload_to="icons/")
    draw = models.ImageField(upload_to="draws/")
    diary = models.CharField(max_length=100)
    group_name = models.CharField(max_length=100,default='group')
    page_num = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
class Like(models.Model):
        alt_id = models.CharField(primary_key=True,max_length=100)
        user_id = models.CharField(null=False,max_length=100)
        enikki_id = models.CharField(null=False,max_length=100)
        
        class Meta:
            constraints = [
                #複合主キー
                models.UniqueConstraint(fields=['user_id', 'enikki_id'], name='unique_customer')
            ]