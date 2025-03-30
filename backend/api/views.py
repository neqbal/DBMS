from django.conf.global_settings import MEDIA_ROOT
from django.http import HttpResponseForbidden, FileResponse, HttpResponseNotFound
from django.shortcuts import render
import json
from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import ModuleCreatorSerialzer, ModuleSerializer, UserSerializer, CourseSerializer, DepartmentSerializer, InstructorSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Instructor, Students, Courses, Departments, Modules, ModuleCreator
import os
from django.conf import settings

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

    course = Courses.objects.get(course_id=course_id)
    instructor_in_dept = Instructor.objects.filter(department_id = course.department_id.department_id) 
    module = Modules.objects.filter(course_id=course)
    module_ids = [m.module_id for m in module]
    print(module_ids)
    module_creators = ModuleCreator.objects.filter(module_id__in=module_ids)

    module_creators_serialzier = ModuleCreatorSerialzer(module_creators, many=True)
    module_serialized = ModuleSerializer(module, many=True)
    course_serialized = CourseSerializer(course) 
    instructor_serialized = InstructorSerializer(instructor_in_dept, many=True)
    return Response([course_serialized.data, instructor_serialized.data, module_serialized.data, module_creators_serialzier.data])

class FileUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        # Get the file from form data
        file_obj = request.data.get('file', None)
        if not file_obj:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
        # Retrieve course_id from header
        course_id = request.data.get('course_id', None)
        if not course_id:
            return Response({"error": "course_id header is missing"}, status=status.HTTP_400_BAD_REQUEST)
        # Retrieve module_creators from header (list of instructor ids)
        module_creators_header = request.data.get('module_creators', '[]')
        print(f"creater info: {module_creators_header}")
        try:
            module_creators = json.loads(module_creators_header)
        except json.JSONDecodeError:
            module_creators = []
        
        # Validate course exists
        try:
            course = Courses.objects.get(course_id=course_id)
        except Courses.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        # Generate a new module_id.
        # Count existing modules for this course. If you intend to support multiple modules per course,
        # the relationship in Modules should be a ForeignKey.
        existing_modules = Modules.objects.filter(course_id=course_id)
        print("Existing modules: ", existing_modules)
        next_number = existing_modules.count() + 1
        print("Exisiting module count: ", next_number)
        new_module_id = f"{course_id}-{next_number}"

        # Save the file to disk (adjust the path as needed)
        # For example, files will be saved under MEDIA_ROOT/modules/
        module_dir = os.path.join(settings.MEDIA_ROOT, 'modules')
        os.makedirs(module_dir, exist_ok=True)
        # Create a filename that includes the module id
        file_name = f"{new_module_id}_{file_obj.name}"
        file_path = os.path.join(module_dir, file_name)

        with open(file_path, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)

        # Create a new Modules instance.
        # (If needed, update the Modules model to use a ForeignKey if more than one module is allowed per course.)
        new_module = Modules.objects.create(
            module_id=new_module_id,
            course_id=course,         # If using a ForeignKey this is fine.
            name=file_obj.name,       # Or assign a name from another field if desired.
            path_of_module=file_path  # You might want to store a relative URL instead.
        )

        # Process the module_creators list: create ModuleCreator entries.
        for instructor_id in module_creators:
            try:
                print(instructor_id)
                instructor = Instructor.objects.get(instructor_id=instructor_id['label'])
                ModuleCreator.objects.create(
                    module_id=new_module,
                    instructor_id=instructor
                )
            except Instructor.DoesNotExist:
                print("Instructor does not exist")
                continue

        return Response({
            "message": "File uploaded successfully",
            "module_id": new_module_id,
            "module_creators": module_creators,
            "file_path": file_path
        }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_module(request, module_id):
    user = User.objects.get(username = request.user)
    type_of_user = user.type_of_user
    try:
        module = Modules.objects.get(module_id = module_id)
        course = module.course_id
        user_department = Departments
        if type_of_user in "student":
            std_info = Students.objects.get(user_id = user)
            user_department = std_info.department_id
        elif type_of_user in "instructor":
            ins_info = Instructor.objects.get(user_id = user)
            user_department = ins_info.department_id
        print(user_department.department_id)
        print(course.department_id.department_id)
        if user_department.department_id != course.department_id.department_id:
            return HttpResponseForbidden("You do not have permission")

        module_dir = os.path.join(settings.MEDIA_ROOT, 'modules')
        file_name = f"{module_id}.pdf"
        file_path = Modules.objects.get(module_id = module_id).path_of_module
        print(file_path)
        if os.path.exists(file_path):
            return FileResponse(open(file_path, "rb"), as_attachment=True, filename=f"{module_id}.pdf")
    except Modules.DoesNotExist:
        return HttpResponseNotFound("Module not found")
