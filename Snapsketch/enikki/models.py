from django.db import models

class EnikkiModel(models.Model):
    enikki_id = models.CharField(primary_key=True,max_length=100)
    user_name = models.CharField(max_length=100)
    user_icon = models.ImageField(upload_to="icons/")
    draw = models.ImageField(upload_to="draws/")
    diary = models.CharField(max_length=100)
    like_count = models.IntegerField(default=0)
    group_name = models.CharField(max_length=100,default='group')
    page_num = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

class Like(models.Model):
    user_id = models.CharField(null=False,max_length=100)
    enikki_id = models.CharField(null=False,max_length=100)

    class Meta:
        constraints = [
             #複合ユニーク制約
            models.UniqueConstraint(fields=['user_id', 'enikki_id'], name='unique_like')
        ]

    @classmethod
    def check_duplicate(cls, userId: str, enikkiId: str) -> bool:
        return cls.objects.filter(user_id=userId, enikki_id=enikkiId).exists()

class Img(models.Model):
    img_id = models.CharField(primary_key=True,null=False,max_length=100)
    img = models.ImageField(upload_to='img')

    @classmethod
    def check_duplicate(cls, imgId: str) -> bool:
        return cls.objects.filter(img_id=imgId).exists()