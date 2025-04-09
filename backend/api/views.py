from django.conf.global_settings import MEDIA_ROOT
from django.http import HttpResponseForbidden, FileResponse, HttpResponseNotFound, JsonResponse
from django.shortcuts import render
import json
from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import ModuleCreatorSerialzer, ModuleSerializer, QuizSerializer, StudentCourseDetailSerializer, StudentsSerializer, TeachesSerializer, UserSerializer, CourseSerializer, DepartmentSerializer, InstructorsSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Instructors, StudentModuleCompleted, Students, Courses, Departments, Modules, ModuleCreator, StudentCourseDetail, Teaches, Quiz
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
        ins_info = Instructors.objects.get(user_id = user)
        res['department_id'] = ins_info.department_id.department_id
        res['lms_id'] = ins_info.instructor_id
    elif type_of_user == "student":
        std_info = Students.objects.get(user_id = user)
        res['lms_id'] = std_info.student_id
        res['department_id'] = std_info.department_id.department_id

    return Response(res)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_courses(request):
    department_id = request.GET.get("department_id")
    user = User.objects.get(username=request.user)    

    course = Courses.objects.filter(department_id=department_id)
    dep = Departments.objects.get(department_id=department_id)
    student_course_detail = StudentCourseDetail.objects.filter(course_id__in=course)
    faculty_memembers = Instructors.objects.filter(department_id=department_id)
    students = Students.objects.filter(department_id=department_id)
    serialized = CourseSerializer(course, many=True)
    

    res = {}
    res["department_name"] = dep.department_name
    res["department_desc"] = dep.department_desc
    res["courses"] = serialized.data
    res["faculty_members"] = InstructorsSerializer(faculty_memembers, many=True).data
    res["students"] = StudentsSerializer(students, many=True).data
    res["type"] = user.type_of_user

    if user.type_of_user == "instructor":
        res["user_details"] =  InstructorsSerializer(Instructors.objects.get(user_id = user)).data
    else :
        res["user_details"] =StudentsSerializer(Students.objects.get(user_id = user)).data

    return Response(res)


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
        user_info = Instructors.objects.get(user_id = user)
    else :
        user_info = Students.objects.get(user_id = user)

    course = Courses.objects.get(course_id=course_id)
    instructor_in_dept = Instructors.objects.filter(department_id = course.department_id.department_id) 
    module = Modules.objects.filter(course_id=course)
    module_ids = [m.module_id for m in module]
    print(module_ids)
    module_creators = ModuleCreator.objects.filter(module_id__in=module_ids)

    module_creators_serialzier = ModuleCreatorSerialzer(module_creators, many=True)
    module_serialized = ModuleSerializer(module, many=True)
    course_serialized = CourseSerializer(course) 
    instructor_serialized = InstructorsSerializer(instructor_in_dept, many=True)
    res = {}
    res.update(course_serialized.data)  # This is a dictionary
    res["instructors"] = instructor_serialized.data  # Store list separately
    res["modules"] = module_serialized.data  # Store list separately
    res["module_creators"] = module_creators_serialzier.data  # Store list separately
    
    if course.department_id.department_id in user_info.department_id.department_id:
        print("Download available")
        res.update({"download_available": "yes"})

    return Response(res)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def enroll(request):
    course_id = request.GET.get("course_id")
    user = request.user
    print(user)
    course = Courses.objects.get(course_id = course_id)

    if user.type_of_user == 'instructor':
        instructor = Instructors.objects.get(user_id = user)
        Teaches.objects.create (
            instructor_id=instructor,
            course_id=course
        )
    else :
        student = Students.objects.get(user_id = user)
        StudentCourseDetail.objects.create(
            student_id=student,
            course_id=course,
            modules_completed=0,
            quizes_completed=0
        )
    return JsonResponse({"message": "Enrolled successfully."}, status=200)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def deenroll(request):
    course_id = request.GET.get("course_id")
    user = request.user
    print(user)
    course = Courses.objects.get(course_id = course_id)

    if user.type_of_user == 'instructor':
        instructor = Instructors.objects.get(user_id = user)
        Teaches.objects.get (
            instructor_id=instructor,
            course_id=course
        ).delete()
    else :
        student = Students.objects.get(user_id = user)
        StudentCourseDetail.objects.get(
            student_id=student,
            course_id=course,
        ).delete()
    return JsonResponse({"message": "DeEnrolled successfully."}, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def enrolled_courses(request):
    user = User.objects.get(username = request.user)
    res = {}
    if user.type_of_user == 'student':
        std = Students.objects.get(user_id = user)
        deets = StudentCourseDetail.objects.filter(student_id=std)
        res["details"] = StudentCourseDetailSerializer(deets, many=True).data
    else :
        ins = Instructors.objects.get(user_id = user)
        deets = Teaches.objects.filter(instructor_id  = ins)
        res["details"] = TeachesSerializer(deets, many=True).data

    for i in res["details"]:
        i["course_details"] = CourseSerializer(Courses.objects.get(course_id=i["course_id"])).data
    
    if user.type_of_user == "instructor":
        res["canUpload"] = True
    else: res["canUpload"] = False
    return Response(res)


class FileUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file_obj = request.data.get('file', None)
        if not file_obj:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
        course_id = request.data.get('course_id', None)
        if not course_id:
            return Response({"error": "course_id header is missing"}, status=status.HTTP_400_BAD_REQUEST)
        module_creators = request.data.get('module_creators', '[]').split(",")
        print(f"creater info: {module_creators}")
        #try:
        #    module_creators = json.loads(module_creators_header)
        #    print(module_creators)
        #except json.JSONDecodeError:
        #    module_creators = []

        try:
            course = Courses.objects.get(course_id=course_id)
        except Courses.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        existing_modules = Modules.objects.filter(course_id=course_id)
        print("Existing modules: ", existing_modules)
        next_number = existing_modules.count() + 1
        print("Exisiting module count: ", next_number)
        new_module_id = f"{course_id}-{next_number}"

        module_dir = os.path.join(settings.MEDIA_ROOT, 'modules')
        os.makedirs(module_dir, exist_ok=True)
        file_name = f"{new_module_id}_{file_obj.name}"
        file_path = os.path.join(module_dir, file_name)

        with open(file_path, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)

        new_module = Modules.objects.create(
            module_id=new_module_id,
            course_id=course,         # If using a ForeignKey this is fine.
            name=file_obj.name,       # Or assign a name from another field if desired.
            path_of_module=file_path  # You might want to store a relative URL instead.
        )

        for instructor_id in module_creators:
            try:
                print(instructor_id)
                instructor = Instructors.objects.get(instructor_id=instructor_id)
                ModuleCreator.objects.create(
                    module_id=new_module,
                    instructor_id=instructor
                )
            except Instructors.DoesNotExist:
                print("Instructors does not exist")
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
        std_info = None
        if type_of_user in "student":
            std_info = Students.objects.get(user_id = user)
            user_department = std_info.department_id

        elif type_of_user in "instructor":
            ins_info = Instructors.objects.get(user_id = user)
            user_department = ins_info.department_id

        if user_department.department_id != course.department_id.department_id:
            return HttpResponseForbidden("You do not have permission")

        if type_of_user in "student":
            print("I am student")
            try:
                #check if student has already downloaded
                check = StudentModuleCompleted.objects.get(
                    student_id=std_info,
                    course_id=course,
                    module_id=module
                )
            except StudentModuleCompleted.DoesNotExist:
                print("Does not exist")
                try:
                    student_course_detail = StudentCourseDetail.objects.get(
                        student_id=std_info, 
                        course_id=course
                    )

                    student_course_detail.modules_completed += 1
                    student_course_detail.save()
                except StudentModuleCompleted.DoesNotExist:
                    pass

                StudentModuleCompleted.objects.create(
                    student_id=std_info,
                    course_id=course,
                    module_id=module
                )


        file_path = Modules.objects.get(module_id = module_id).path_of_module
        print(file_path)
        if os.path.exists(file_path):
            return FileResponse(open(file_path, "rb"), as_attachment=True, filename=f"{module_id}.pdf")
    except Modules.DoesNotExist:
        return HttpResponseNotFound("Module not found")

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def QuizUpload(request):
    print(request.data)
    
    quiz_data = request.data
    
    course_id_value = quiz_data.get("course_id")
    if not course_id_value:
        return Response({"error": "course_id is required in quiz data"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        course = Courses.objects.get(course_id=course_id_value)
    except Courses.DoesNotExist:
        return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
    
    existing_quizzes = Quiz.objects.filter(course_id=course)
    next_number = existing_quizzes.count() + 1
    quiz_id = f"{course_id_value}-Q{next_number}"
    
    quiz_dir = os.path.join(settings.MEDIA_ROOT, 'quizzes')
    os.makedirs(quiz_dir, exist_ok=True)
    file_name = f"{quiz_id}.json"
    file_path = os.path.join(quiz_dir, file_name)
    
    try:
        with open(file_path, 'w', encoding='utf-8') as quiz_file:
            json.dump(quiz_data, quiz_file, ensure_ascii=False, indent=4)
    except Exception as e:
        return Response({"error": f"Failed to write quiz file: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    try:
        user = User.objects.get(username=request.user)
        instructor = Instructors.objects.get(user_id = user)
    except Instructors.DoesNotExist:
        return Response({"error": "Instructor not found for the current user"}, status=status.HTTP_404_NOT_FOUND)
    
    new_quiz = Quiz.objects.create(
        quiz_id=quiz_id,
        course_id=course,   # ForeignKey: passing the course instance
        instructor=instructor,
        path_of_quiz=file_path,
        title=quiz_data.get("title"),
        description=quiz_data.get("description"),
        no_of_questions = len(quiz_data.get("questions"))
    )
    
    return Response({
        "message": "Quiz uploaded successfully",
        "quiz_id": quiz_id,
        "file_path": file_path,
    }, status=status.HTTP_201_CREATED)
        
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def quizSummary(request):
    user = User.objects.get(username=request.user)
    instructor = Instructors.objects.get(user_id = user)

    quizes = Quiz.objects.filter(instructor = instructor)
    quizJson = QuizSerializer(quizes, many=True).data
    for i in quizJson:
        course = Courses.objects.get(course_id=i["course_id"]).__getattribute__("course_name")
        i["course_name"] = course
        i["path_of_quiz"] = ""
    return Response(quizJson)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def quizInfo(request):
    print(request.GET.get("quiz_id"))
    quiz_id = request.GET.get("quiz_id")
    quiz_dir = os.path.join(settings.MEDIA_ROOT, 'quizzes')
    os.makedirs(quiz_dir, exist_ok=True)
    file_name = f"{quiz_id}.json"
    file_path = os.path.join(quiz_dir, file_name)
    quiz_data = {}
    
    with open(file_path) as f:
        quiz_data = f.read()

    print(quiz_data)
    return Response(json.loads(quiz_data))
