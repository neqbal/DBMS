# Generated by Django 5.1.7 on 2025-03-29 09:00

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_modules'),
    ]

    operations = [
        migrations.CreateModel(
            name='ModuleCreator',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('instructor_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.instructor')),
                ('module_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.modules')),
            ],
        ),
    ]
