from rest_framework import serializers
from .models import Courses, CustomUser, ModuleCreator, Modules, Quiz, StudentCourseDetail, Students, Instructors, Departments, Teaches

class UserSerializer(serializers.ModelSerializer):
    department_id = serializers.CharField(write_only=True,  required=False)

    class Meta:
        model = CustomUser
        fields = ["first_name", "last_name", "username", "password", "type_of_user", "department_id"]
        extra_kwargs = {"password": {"write_only": True}}
    
    def create(self, validated_data):

        type_of_user = validated_data.get('type_of_user')

        department_id = validated_data.pop('department_id')

        dep = Departments.objects.get(pk=department_id)
        user = CustomUser.objects.create_user(**validated_data)
        try:
            if type_of_user == 'student':
                if department_id is None:
                    raise serializers.ValidationError("Student type must include major and year.")
                student_id = f"{validated_data.get("username")}@student.lms"
                Students.objects.create(
                    user=user,
                    student_id=student_id,
                    department=dep,
                )

                #all_course = Courses.objects.filter(department_id=dep)

                #for course in all_course:
                #    StudentCourseDetail.objects.create(
                #        student_id=Students.objects.get(student_id=student_id),
                #        course_id=course,
                #        modules_completed=0,
                #        quizes_completed=0
                #    )

            elif type_of_user == 'instructor':
                if department_id is None:
                    raise serializers.ValidationError("Teacher type must include department.")
                Instructors.objects.create(
                    user=user,
                    instructor_id=f"{validated_data.get("username")}@instructor.lms",
                    department=dep
                )
            else:
                raise serializers.ValidationError("Invalid type_of_user.")
        except Exception:
            #CustomUser.objects.get(user).delete()
            pass
            
        return user

class StudentsSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = Students
        fields='__all__'


class StudentCourseDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model=StudentCourseDetail
        fields='__all__'

class ModuleCreatorSerialzer(serializers.ModelSerializer):
    class Meta:
        model = ModuleCreator
        fields = '__all__'

class ModuleSerializer(serializers.ModelSerializer):
    creators = ModuleCreatorSerialzer(many=True, read_only=True, source="get_creators")
    class Meta:
        model = Modules
        fields = '__all__'

class TeachesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teaches
        fields = '__all__'

class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True, source='modules_set')
    teaches = TeachesSerializer(many=True, read_only=True, source='get_teachers')
    quizes = QuizSerializer(many=True, read_only=True, source='get_quizes')
    student_course_detail = StudentCourseDetailSerializer(many=True, read_only=True, source="get_students")
    class Meta:
        model = Courses
        fields = '__all__'


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Departments
        fields = '__all__'


class InstructorsSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = Instructors
        fields = '__all__'

