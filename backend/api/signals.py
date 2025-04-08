from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Departments, Courses, Students, Instructors

def update_department_counts(department):
    """Update department counts for courses, students, and instructors."""
    print("Department updated", department.courses.count())
    department.number_of_courses = department.courses.count()
    department.number_of_students = department.students.count()
    department.number_of_instructors = department.instructors.count()
    department.save()

@receiver(post_save, sender=Courses)
@receiver(post_delete, sender=Courses)
def update_course_count(sender, instance, **kwargs):
    update_department_counts(instance.department_id)

@receiver(post_save, sender=Students)
@receiver(post_delete, sender=Students)
def update_student_count(sender, instance, **kwargs):
    update_department_counts(instance.department_id)

@receiver(post_save, sender=Instructors)
@receiver(post_delete, sender=Instructors)
def update_instructor_count(sender, instance, **kwargs):
    update_department_counts(instance.department_id)
