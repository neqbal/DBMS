# Generated by Django 5.1.7 on 2025-03-26 05:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_alter_customuser_type_of_user'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='type_of_user',
            field=models.CharField(choices=[('admin', 'Admin'), ('student', 'Student'), ('instructor', 'Instructor')], default='admin', max_length=10),
        ),
    ]
