# Generated by Django 5.1.7 on 2025-04-14 20:22

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0036_rename_instructor_id_modulecreator_instructor_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='studentmodulecompleted',
            name='module',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.modules'),
        ),
    ]
