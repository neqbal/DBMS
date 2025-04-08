import time

from django.test import TestCase
from django.utils.html import strip_spaces_between_tags
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from rest_framework.authtoken.models import Token

from .models import (
    CustomUser, Departments, Courses, Instructors,
    Modules, ModuleCreator, Students,
    StudentCourseDetail, StudentModuleCompleted
)

users = [
    {
        "first_name": "James",
        "last_name": "Bond",
        "username": "jb",
        "password": "123",
        "type_of_user": "instructor",
        "department_id": "CSE",
        "year": 0
    },
    {
        "first_name": "Jonah",
        "last_name": "Hill",
        "username": "jh",
        "password": "567",
        "type_of_user": "student",
        "department_id": "CSE",
        "year": 1
    }
]

class UserRegistrationTestCase(APITestCase):
    fixtures=["departments.json", "courses.json"]    
    
    def setUp(self):
        register_url = "/api/user/register/"
        login_url="/api/token/"
        
        login_creds = [
            {
                "username": "jb",
                "password": "123"
            },
            {
                "username": "jh",
                "password": "567"
            }
        ]
        for user in users:
            response = self.client.post(register_url, user, format='json')

        response = self.client.post(login_url, login_creds[0], format='json')

        self.token = response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        
    
    def test_user_info(self):
        url = "/api/user/info/"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.type_of_user = response.data["type_of_user"]

    def test_alldepartments(self):
        url="/api/alldepartments/"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_all_courses(self):
        url="/api/department/course/"
        response = self.client.get(url, {"department_id": "EEE"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)


    def test_course_info(self):
        url = "/api/department/course/info/"
        response = self.client.get(url, {"course_id": "EEE101"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
