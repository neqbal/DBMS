# Generated by Django 5.1.7 on 2025-04-09 16:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0020_alter_modulecreator_module_id_quiz'),
    ]

    operations = [
        migrations.AddField(
            model_name='quiz',
            name='description',
            field=models.CharField(default=None, max_length=500),
        ),
        migrations.AddField(
            model_name='quiz',
            name='title',
            field=models.CharField(default=None, max_length=200),
        ),
    ]
