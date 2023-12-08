<<<<<<< HEAD

=======
>>>>>>> 39fc44f557dae6883c8080a6c78e9a999f09c082

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('enikki', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='usergrouptable',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='usergroup_user', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='postmaster',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='liketable',
            name='post',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='like_post', to='enikki.postmaster'),
        ),
        migrations.AddField(
            model_name='liketable',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='like_user', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='groupposttable',
            name='group',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='grouppost_group', to='enikki.groupmaster'),
        ),
        migrations.AddField(
            model_name='groupposttable',
            name='post',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='grouppost_post', to='enikki.postmaster'),
        ),
        migrations.AddField(
            model_name='follower',
            name='followee',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='followee_user', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='follower',
            name='follower',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='follower_user', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='commentmaster',
            name='post',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comment_post', to='enikki.postmaster'),
        ),
        migrations.AddField(
            model_name='commentmaster',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comment_user', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddConstraint(
            model_name='groupposttable',
            constraint=models.UniqueConstraint(fields=('group_id', 'post_id'), name='unique_GroupPost'),
        ),
    ]
