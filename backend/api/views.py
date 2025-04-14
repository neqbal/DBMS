from django.db import connection
from re import sub
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
from .models import Instructors, QuizSubmission, StudentModuleCompleted, Students, Courses, Departments, Modules, ModuleCreator, StudentCourseDetail, Teaches, Quiz
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
    # Extract the username from the request. We assume `request.user.username` is available.
    username = request.user.username

    with connection.cursor() as cursor:
        # Retrieve basic user information from the Users table
        cursor.execute(
            """
            SELECT id, username, first_name, last_name, type_of_user
            FROM api_customuser
            WHERE username = %s
            """,
            [username]
        )
        user_row = cursor.fetchone()
        if not user_row:
            # If no user is found, you can return a 404 error response
            return Response({'error': 'User not found'}, status=404)

        # Build the initial response data using the user record
        data = {
            'id': user_row[0],
            'username': user_row[1],
            'first_name': user_row[2],
            'last_name': user_row[3],
            'type_of_user': user_row[4],
        }

        # Based on the user type, retrieve additional data using a join with the departments table
        if user_row[4] == "instructor":
            cursor.execute(
                """
                SELECT i.instructor_id, d.department_id
                FROM api_instructors AS i
                JOIN api_departments AS d ON i.department_id = d.department_id
                WHERE i.user_id = %s
                """,
                [user_row[0]]
            )
            ins_row = cursor.fetchone()
            if ins_row:
                data['lms_id'] = ins_row[0]
                data['department_id'] = ins_row[1]
            else:
                # Handle the error if no matching instructor record is found
                data['lms_id'] = None
                data['department_id'] = None

        elif user_row[4] == "student":
            cursor.execute(
                """
                SELECT s.student_id, d.department_id
                FROM api_students AS s
                JOIN api_departments AS d ON s.department_id = d.department_id
                WHERE s.user_id = %s
                """,
                [user_row[0]]
            )
            std_row = cursor.fetchone()
            if std_row:
                data['lms_id'] = std_row[0]
                data['department_id'] = std_row[1]
            else:
                # Handle the error if no matching student record is found
                data['lms_id'] = None
                data['department_id'] = None

        else:
            # If the user type is not recognized, set defaults or handle as needed.
            data['lms_id'] = None
            data['department_id'] = None

    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_courses(request):
    department_id = request.GET.get("department_id")
    user = User.objects.get(username=request.user)    

    course = Courses.objects.filter(department_id=department_id)
    dep = Departments.objects.get(department_id=department_id)
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
        res["user_details"] =  InstructorsSerializer(Instructors.objects.get(user = user)).data
    else :
        res["user_details"] =StudentsSerializer(Students.objects.get(user = user)).data

    return Response(res)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_departments(request):
    with connection.cursor() as cursor:
        # Execute the SQL query to fetch all department rows.
        cursor.execute("SELECT * FROM api_departments")
        
        # Fetch the column names from the cursor description.
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()

    # Manually serialize each row as a dictionary.
    departments = [dict(zip(columns, row)) for row in rows]
    
    return Response(departments)

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
            instructor=instructor,
            course=course
        )
    else :
        student = Students.objects.get(user_id = user)
        StudentCourseDetail.objects.create(
            student=student,
            course=course,
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
        instructor = Instructors.objects.get(user = user)
        Teaches.objects.get (
            instructor=instructor,
            course=course
        ).delete()
    else :
        student = Students.objects.get(user_id = user)
        StudentCourseDetail.objects.get(
            student=student,
            course=course,
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
        i["course_details"] = CourseSerializer(Courses.objects.get(course_id=i["course"])).data
    
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
            course=course,         # If using a ForeignKey this is fine.
            name=file_obj.name,       # Or assign a name from another field if desired.
            path_of_module=file_path  # You might want to store a relative URL instead.
        )

        for instructor_id in module_creators:
            try:
                print(instructor_id)
                instructor = Instructors.objects.get(instructor_id=instructor_id)
                ModuleCreator.objects.create(
                    module=new_module,
                    instructor=instructor
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
    username = request.user.username

    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT id, type_of_user
            FROM api_customuser
            WHERE username = %s
        """, [username])
        user_row = cursor.fetchone()
        if not user_row:
            return HttpResponseNotFound("User not found")
        user_id, type_of_user = user_row
        cursor.execute("""
            SELECT module_id, course_id, path_of_module
            FROM api_modules
            WHERE module_id = %s
        """, [module_id])
        module_row = cursor.fetchone()
        if not module_row:
            return HttpResponseNotFound("Module not found")

        module_course_id = module_row[1]
        file_path = module_row[2]


        cursor.execute("""
            SELECT course_id, department_id
            FROM api_courses
            WHERE course_id = %s
        """, [module_course_id])
        course_row = cursor.fetchone()
        if not course_row:
            return HttpResponseNotFound("Course not found")
        course_id, course_department_id = course_row


        std_id = None
        if type_of_user == "student":
            cursor.execute("""
                SELECT student_id, department_id
                FROM api_students
                WHERE user_id = %s
            """, [user_id])
            std_row = cursor.fetchone()
            if not std_row:
                return HttpResponseNotFound("Student record not found")
            std_id, user_department_id = std_row
        elif type_of_user == "instructor":
            cursor.execute("""
                SELECT instructor_id, department_id
                FROM api_instructors
                WHERE user_id = %s
            """, [user_id])
            ins_row = cursor.fetchone()
            if not ins_row:
                return HttpResponseNotFound("Instructor record not found")

            _, user_department_id = ins_row
        else:
            return HttpResponseForbidden("Invalid user type")

        if user_department_id != course_department_id:
            return HttpResponseForbidden("You do not have permission")

        if type_of_user == "student":
            cursor.execute("""
                    SELECT id, modules_completed
                    FROM api_studentcoursedetail
                    WHERE student_id = %s AND course_id = %s
                """, [std_id, course_id])
            scd_row = cursor.fetchone()
            if not scd_row:
                scd_id, modules_completed = scd_row
                new_modules_completed = modules_completed + 1
                cursor.execute("""
                        UPDATE api_studentcoursedetail
                        SET modules_completed = %s
                        WHERE id = %s
                    """, [new_modules_completed, scd_id])

    if os.path.exists(file_path):
        return FileResponse(open(file_path, "rb"), as_attachment=True, filename=f"{module_id}.pdf")
    else:
        return HttpResponseNotFound("File not found")

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def QuizUpload(request):
    quiz_data = request.data
    username = request.user.username
    quiz_dir = os.path.join(settings.MEDIA_ROOT, 'quizzes')
    os.makedirs(quiz_dir, exist_ok=True)

    if quiz_data.get("quiz_id"):  # EDITING EXISTING QUIZ
        print("Editing quiz")
        quiz_id = quiz_data.pop("quiz_id")

        file_name = f"{quiz_id}.json"
        file_path = os.path.join(quiz_dir, file_name)

        # Save updated JSON content
        with open(file_path, 'w', encoding='utf-8') as quiz_file:
            json.dump(quiz_data, quiz_file, ensure_ascii=False, indent=4)

        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE api_quiz
                SET title = %s,
                    description = %s,
                    no_of_questions = %s
                WHERE quiz_id = %s
            """, [
                quiz_data.get("title"),
                quiz_data.get("description"),
                len(quiz_data.get("questions")),
                quiz_id
            ])

        return Response({"message": "Quiz updated successfully"}, status=200)

    course_id_value = quiz_data.get("course_id")
    if not course_id_value:
        return Response({"error": "course_id is required in quiz data"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT course_id FROM api_courses WHERE course_id = %s", [course_id_value])
            course_row = cursor.fetchone()
            if not course_row:
                return Response({"error": "Course not found"}, status=404)
            cursor.execute("""
                SELECT i.instructor_id
                FROM api_customuser u
                JOIN api_instructors i ON u.id = i.user_id
                WHERE u.username = %s
            """, [username])
            row = cursor.fetchone()
            if not row:
                return Response({"error": "Instructor not found"}, status=404)
            instructor_id = row[0]
            cursor.execute("""
                SELECT COUNT(*) FROM api_quiz WHERE course_id = %s
            """, [course_id_value])
            count = cursor.fetchone()[0]
            next_number = count + 1
            quiz_id = f"{course_id_value}-Q{next_number}"

            file_name = f"{quiz_id}.json"
            file_path = os.path.join(quiz_dir, file_name)
            with open(file_path, 'w', encoding='utf-8') as quiz_file:
                json.dump(quiz_data, quiz_file, ensure_ascii=False, indent=4)
            cursor.execute("""
                INSERT INTO api_quiz (quiz_id, course_id, instructor_id, path_of_quiz, title, description, no_of_questions)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, [
                quiz_id,
                course_id_value,
                instructor_id,
                file_path,
                quiz_data.get("title"),
                quiz_data.get("description"),
                len(quiz_data.get("questions"))
            ])

        return Response({
            "message": "Quiz uploaded successfully",
            "quiz_id": quiz_id,
            "file_path": file_path,
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=500)
        

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def quizSummary(request):
    username = request.user.username

    with connection.cursor() as cursor:
        # 1. Retrieve the user record.
        cursor.execute("""
            SELECT id, type_of_user
            FROM api_customuser
            WHERE username = %s
        """, [username])
        user_row = cursor.fetchone()
        if not user_row:
            return Response({"error": "User not found"}, status=404)
        user_id, type_of_user = user_row

        if type_of_user == "instructor":
            cursor.execute("""
                SELECT q.*, 
                       (SELECT course_name FROM api_courses c WHERE c.course_id = q.course_id) AS course_name,
                       '' AS path_of_quiz
                FROM api_quiz q
                WHERE q.instructor_id = (
                    SELECT instructor_id FROM api_instructors WHERE user_id = %s
                )
            """, [user_id])
            quiz_columns = [col[0] for col in cursor.description]
            quizzes = [dict(zip(quiz_columns, row)) for row in cursor.fetchall()]
            submitted_json = None

        else:
            cursor.execute("""
                SELECT student_id
                FROM api_students
                WHERE user_id = %s
            """, [user_id])
            student_row = cursor.fetchone()
            if not student_row:
                return Response({"error": "Student record not found"}, status=404)
            student_id = student_row[0]

            cursor.execute("""
                SELECT q.*, 
                       (SELECT course_name FROM api_courses c WHERE c.course_id = q.course_id) AS course_name,
                       '' AS path_of_quiz
                FROM api_quiz q
                WHERE q.course_id IN (
                    SELECT course_id FROM api_studentcoursedetail WHERE student_id = %s
                )
                AND q.quiz_id NOT IN (
                    SELECT quiz_id FROM api_quizsubmission WHERE student_id = %s
                )
            """, [student_id, student_id])
            quiz_columns = [col[0] for col in cursor.description]
            quizzes = [dict(zip(quiz_columns, row)) for row in cursor.fetchall()]

            cursor.execute("""
                SELECT q.*, 
                       (SELECT course_name FROM api_courses c WHERE c.course_id = q.course_id) AS course_name,
                       '' AS path_of_quiz
                FROM api_quiz q
                WHERE q.quiz_id IN (
                    SELECT quiz_id FROM api_quizsubmission WHERE student_id = %s
                )
            """, [student_id])
            quiz_columns = [col[0] for col in cursor.description]
            submitted_json = [dict(zip(quiz_columns, row)) for row in cursor.fetchall()]

    return Response({"all": quizzes, "submitted": submitted_json})

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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def quizQuestions(request):
    print(request.GET.get("quiz_id"))
    quiz_id = request.GET.get("quiz_id")
    quiz_dir = os.path.join(settings.MEDIA_ROOT, 'quizzes')
    os.makedirs(quiz_dir, exist_ok=True)
    file_name = f"{quiz_id}.json"
    file_path = os.path.join(quiz_dir, file_name)
    quiz_data = {}
    
    with open(file_path) as f:
        quiz_data = json.loads(f.read())

    questions = quiz_data.get("questions", [])
    for question in questions:
        answers = question.get("answers", [])
        isMultiple=0
        for answer in answers:
            if answer.pop("isCorrect", None): 
                isMultiple = isMultiple + 1
             
        if isMultiple > 1:
            question["isMultiple"] = True
        else:
            question["isMultiple"] = False

    print("Modified quiz data:", quiz_data)
    
    return Response(quiz_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submitQuiz(request):
    sub_data = request.data
    username = request.user.username
    quiz_id = sub_data.get("quiz_id")
    answers = sub_data.get("answers")
    answers_json = json.dumps(answers)
    if not quiz_id or not answers:
        return Response({"error": "quiz_id and answers are required."}, status=status.HTTP_400_BAD_REQUEST)

    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT s.student_id AS student_id, q.course_id
            FROM api_customuser u
            JOIN api_students s ON s.user_id = u.id
            JOIN api_quiz q ON q.quiz_id = %s
            WHERE u.username = %s
        """, [quiz_id, username])
        row = cursor.fetchone()

        if not row:
            return Response({"error": "Student or quiz not found."}, status=status.HTTP_404_NOT_FOUND)

        student_id, course_id = row

        cursor.execute("""
            INSERT INTO api_quizsubmission (student_id, quiz_id, answers)
            VALUES (%s, %s, %s)
        """, [student_id, quiz_id, answers_json])

        cursor.execute("""
            INSERT INTO api_studentcourseDetail (student_id, course_id, modules_completed, quizes_completed)
            VALUES (%s, %s, 0, 1)
            ON CONFLICT (student_id, course_id)
            DO UPDATE SET quizes_completed = api_studentcoursedetail.quizes_completed + 1
        """, [student_id, course_id])

    return Response({"message": "Quiz submitted successfully."})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def result(request):
    quiz_id = request.GET.get("quiz_id")
    username = request.user.username

    if not quiz_id:
        return Response({"error": "quiz_id is required"}, status=status.HTTP_400_BAD_REQUEST)

    quiz_dir = os.path.join(settings.MEDIA_ROOT, 'quizzes')
    file_name = f"{quiz_id}.json"
    file_path = os.path.join(quiz_dir, file_name)

    if not os.path.exists(file_path):
        return Response({"error": "Quiz file not found"}, status=status.HTTP_404_NOT_FOUND)

    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT s.student_id, qs.answers
            FROM api_customuser u
            JOIN api_students s ON s.user_id = u.id
            JOIN api_quizsubmission qs ON qs.student_id = s.student_id AND qs.quiz_id = %s
            WHERE u.username = %s
        """, [quiz_id, username])
        row = cursor.fetchone()

        if not row:
            return Response({"error": "Submission not found"}, status=status.HTTP_404_NOT_FOUND)

        student_id, answers_raw = row

    with open(file_path, 'r', encoding='utf-8') as f:
        quiz_data = json.load(f)

    try:
        answers_json = json.loads(answers_raw.replace("'", '"')) if isinstance(answers_raw, str) else answers_raw
    except json.JSONDecodeError:
        return Response({"error": "Invalid format in saved answers"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({
        "answers": answers_json,
        "quiz": quiz_data
    })
