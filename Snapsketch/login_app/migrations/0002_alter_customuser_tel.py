# Generated by Django 4.2.7 on 2024-02-08 08:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('login_app', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='tel',
            field=models.CharField(blank=True, max_length=11, null=True),
        ),
    ]