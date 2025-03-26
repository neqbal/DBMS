from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    USER_TYPES = (
        ('admin', 'Admin'),
        ('student', 'Student'),
        ('instructor', 'Instructor'),
    )
    type_of_user = models.CharField(max_length=10, choices=USER_TYPES, default='admin')

class Departments(models.Model):
    department_id = models.CharField(max_length=20, primary_key=True)
    department_name = models.CharField(max_length=20)
    department_desc = models.CharField(max_length=100)


class Students(models.Model):
    user_id = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    student_id = models.CharField(max_length=20, primary_key=True, unique=True)
    department_id = models.ForeignKey(Departments, on_delete=models.CASCADE)
    year = models.IntegerField()


class Instructor(models.Model):
    user_id = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    instructor_id = models.CharField(max_length=20, primary_key=True, unique=True)
    department_id = models.ForeignKey(Departments, on_delete=models.CASCADE)
