from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.html import MAX_URL_LENGTH

class CustomUser(AbstractUser):
    USER_TYPES = (
        ('admin', 'Admin'),
        ('student', 'Student'),
        ('instructor', 'Instructor'),
    )
    type_of_user = models.CharField(max_length=11, choices=USER_TYPES, default='admin')


class Departments(models.Model):
    department_id = models.CharField(max_length=20, primary_key=True)
    department_name = models.CharField(max_length=20)
    department_desc = models.CharField(max_length=100)
    number_of_courses = models.IntegerField(default=0)
    number_of_students = models.IntegerField(default=0)
    number_of_instructors = models.IntegerField(default=0)


class Courses(models.Model):
    course_id = models.CharField(max_length=10, primary_key=True)
    course_name = models.CharField(max_length=10, unique=True)
    course_image = models.CharField(max_length=MAX_URL_LENGTH, default="")
    department = models.ForeignKey(Departments, on_delete=models.CASCADE, related_name="courses")
    course_desc = models.CharField(max_length=100)
    start_date_time = models.DateTimeField()
    end_date_time = models.DateTimeField()


class Modules(models.Model):
    module_id = models.CharField(max_length=20, primary_key=True)
    course = models.ForeignKey(Courses, on_delete=models.CASCADE)
    name = models.CharField(max_length=20)
    path_of_module=models.CharField(max_length=100)


class Instructors(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    instructor_id = models.CharField(max_length=20, primary_key=True, unique=True)
    department = models.ForeignKey(Departments, on_delete=models.CASCADE, related_name="instructors")


class ModuleCreator(models.Model):
    module = models.ForeignKey(Modules, on_delete=models.CASCADE, related_name="get_creators")
    instructor = models.ForeignKey(Instructors, on_delete=models.CASCADE)

class Students(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    student_id = models.CharField(max_length=20, primary_key=True, unique=True)
    department = models.ForeignKey(Departments, on_delete=models.CASCADE, related_name="students")

class StudentCourseDetail(models.Model):
    student = models.ForeignKey(Students, on_delete=models.CASCADE)
    course = models.ForeignKey(Courses, on_delete=models.CASCADE, related_name="get_students")
    modules_completed = models.IntegerField(default=0)
    quizes_completed = models.IntegerField(default=0)

    class Meta:
        unique_together = ('student', 'course')

class StudentModuleCompleted(models.Model):
    student = models.ForeignKey(Students, on_delete=models.CASCADE)
    course = models.ForeignKey(Courses, on_delete=models.CASCADE)
    module = models.OneToOneField(Modules, on_delete=models.CASCADE)

class Teaches(models.Model):
    instructor = models.ForeignKey(Instructors, on_delete=models.CASCADE)
    course = models.ForeignKey(Courses, on_delete=models.CASCADE, related_name="get_teachers")

class Quiz(models.Model):
    quiz_id = models.CharField(max_length=20, primary_key=True, unique=True)
    course = models.ForeignKey(Courses, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.CharField(max_length=500)
    instructor = models.ForeignKey(Instructors, on_delete=models.CASCADE)
    no_of_questions = models.IntegerField(default=0)
    path_of_quiz = models.CharField(max_length=20)

class QuizSubmission(models.Model):
    student = models.ForeignKey(Students, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    answers = models.CharField(max_length=1000)
