# Generated by Django 4.2.19 on 2025-02-18 21:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('issues', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='issue',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
