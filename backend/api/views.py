from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework import generics
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserSerializer, CourseSerializer, DepartmentSerializer, InstructorSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Instructor, Students, Courses, Departments


# Create your views here.
User = get_user_model()
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class CustomeTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        username = request.data.get("username")

        if username:
            try:
                user = User.objects.get(username=username)
 
                type_of_user = user.type_of_user
                response['type_of_user'] = type_of_user
                response['Access-Control-Expose-Headers'] = 'type_of_user'
            except Exception :
                pass

        return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    res = {}
    user = User.objects.get(username=request.user)
    type_of_user = user.type_of_user
    res['id'] = user.id 
    res['username'] = user.username
    res['first_name'] = user.first_name
    res['last_name'] = user.last_name
    res['type_of_user'] = type_of_user

    if type_of_user in "instructor":
        ins_info = Instructor.objects.get(user_id = user)
        res['department_id'] = ins_info.department_id.department_id
        res['lms_id'] = ins_info.instructor_id
    elif type_of_user == "student":
        std_info = Students.object.get(user_id = user)
        res['lms_id'] = std_info.student_id
        res['department_id'] = std_info.department_id.department_id
        res['year'] = std_info.year

    return Response(res)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_dept_courses(request):
    department_id = request.GET.get("department_id")

    course = None
    user_info = None

    user = User.objects.get(username=request.user)
    type_of_user = user.type_of_user

    if type_of_user in "instructor":
        user_info = Instructor.objects.get(user_id = user)
    else :
        user_info = Students.objects.get(user_id = user)

    if department_id:
        course = Courses.objects.filter(department_id=department_id)
    else:
        course = Courses.objects.filter(department_id=user_info.department_id.department_id)

    serialized = CourseSerializer(course, many=True)
    return Response(serialized.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_departments(request):
    
    dep = Departments.objects.all()

    serialized = DepartmentSerializer(dep, many=True)
    return Response(serialized.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def course_info(request):
    user = request.user
    type_of_user = user.type_of_user
    course_id = request.GET.get("course_id")

    course = None
    user_info = None

    if type_of_user in "instructor":
        user_info = Instructor.objects.get(user_id = user)
    else :
        user_info = Students.objects.get(user_id = user)

    course = Courses.objects.get(department_id=user_info.department_id.department_id, course_id=course_id)
    instructor_in_dept = Instructor.objects.filter(department_id = user_info.department_id.department_id) 

    course_serialized = CourseSerializer(course) 
    instructor_serialized = InstructorSerializer(instructor_in_dept, many=True)
    return Response([course_serialized.data, instructor_serialized.data])
