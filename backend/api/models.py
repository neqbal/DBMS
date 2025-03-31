from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.html import MAX_URL_LENGTH

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


class Courses(models.Model):
    course_id = models.CharField(max_length=10, primary_key=True)
    course_name = models.CharField(max_length=10, unique=True)
    course_image = models.CharField(max_length=MAX_URL_LENGTH, default="")
    department_id = models.ForeignKey(Departments, on_delete=models.CASCADE)
    course_desc = models.CharField(max_length=100)
    start_date_time = models.DateTimeField()
    end_date_time = models.DateTimeField()


class Modules(models.Model):
    module_id = models.CharField(max_length=20, primary_key=True)
    course_id = models.ForeignKey(Courses, on_delete=models.CASCADE)
    name = models.CharField(max_length=20)
    path_of_module=models.CharField(max_length=100)


class Instructor(models.Model):
    user_id = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    instructor_id = models.CharField(max_length=20, primary_key=True, unique=True)
    department_id = models.ForeignKey(Departments, on_delete=models.CASCADE)


class ModuleCreator(models.Model):
    module_id = models.ForeignKey(Modules, on_delete=models.CASCADE)
    instructor_id = models.ForeignKey(Instructor, on_delete=models.CASCADE)

class Students(models.Model):
    user_id = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    student_id = models.CharField(max_length=20, primary_key=True, unique=True)
    department_id = models.ForeignKey(Departments, on_delete=models.CASCADE)
    year = models.IntegerField()

class StudentCourseDetail(models.Model):
    student_id = models.ForeignKey(Students, on_delete=models.CASCADE)
    course_id = models.OneToOneField(Courses, on_delete=models.CASCADE)
    modules_completed = models.IntegerField()
    quizes_completed = models.IntegerField()

class StudentModuelCompleted(models.Model):
    student_id = models.ForeignKey(Students, on_delete=models.CASCADE)
    course_id = models.ForeignKey(Courses, on_delete=models.CASCADE)
    module_id = models.OneToOneField(Modules, on_delete=models.CASCADE)
