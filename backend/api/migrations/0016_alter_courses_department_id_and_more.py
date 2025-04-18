# Generated by Django 5.1.7 on 2025-04-02 09:53

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0015_departments_number_of_courses_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='courses',
            name='department_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='courses', to='api.departments'),
        ),
        migrations.AlterField(
            model_name='instructors',
            name='department_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='instructors', to='api.departments'),
        ),
        migrations.AlterField(
            model_name='students',
            name='department_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='students', to='api.departments'),
        ),
    ]
