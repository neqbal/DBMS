from rest_framework import serializers
from .models import Courses, CustomUser, ModuleCreator, Modules, StudentCourseDetail, Students, Instructor, Departments

class UserSerializer(serializers.ModelSerializer):
    year = serializers.CharField(write_only=True,  required=False)
    department_id = serializers.CharField(write_only=True,  required=False)

    class Meta:
        model = CustomUser
        fields = ["first_name", "last_name", "username", "password", "type_of_user", "department_id", "year"]
        extra_kwargs = {"password": {"write_only": True}}
    
    def create(self, validated_data):

        type_of_user = validated_data.get('type_of_user')
        print(type_of_user)

        year = validated_data.pop('year')
        print(type(year))
        department_id = validated_data.pop('department_id')

        user = CustomUser.objects.create_user(**validated_data)
        dep = Departments.objects.get(pk=department_id)
        try:
            if type_of_user == 'student':
                if department_id is None or year is None:
                    raise serializers.ValidationError("Student type must include major and year.")
                student_id = f"{validated_data.get("username")}@student.lms"
                Students.objects.create(
                    user_id=user,
                    student_id=student_id,
                    department_id=dep,
                    year=year
                )

                all_course = Courses.objects.filter(department_id=dep)

                for course in all_course:
                    StudentCourseDetail.objects.create(
                        student_id=Students.objects.get(student_id=student_id),
                        course_id=course
                    )

            elif type_of_user == 'instructor':
                if department_id is None:
                    raise serializers.ValidationError("Teacher type must include department.")
                Instructor.objects.create(
                    user_id=user,
                    instructor_id=f"{validated_data.get("username")}@instructor.lms",
                    department_id=dep
                )
            else:
                raise serializers.ValidationError("Invalid type_of_user.")
        except Exception:
            CustomUser.objects.get(user).delete()
            
        return user

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Courses
        fields = '__all__'


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Departments
        fields = '__all__'


class InstructorSerializer(serializers.ModelSerializer):
    user = UserSerializer(source="user_id")
    class Meta:
        model = Instructor
        fields = '__all__'


class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Modules
        fields = '__all__'

class ModuleCreatorSerialzer(serializers.ModelSerializer):
    class Meta:
        model = ModuleCreator
        fields = '__all__'
