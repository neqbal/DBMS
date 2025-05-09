# Generated by Django 5.1.7 on 2025-03-31 07:48

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_studentcoursedetail'),
    ]

    operations = [
        migrations.CreateModel(
            name='StudentModuelCompleted',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('course_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.courses')),
                ('module_id', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='api.modules')),
                ('student_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.students')),
            ],
        ),
    ]
