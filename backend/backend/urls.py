"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from api.views import CreateUserView, CustomeTokenObtainPairView, download_module, user_info, user_dept_courses, all_departments, course_info, FileUploadView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/token/", CustomeTokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/", include("rest_framework.urls")),
    path("api/user/info/", user_info, name="user_info"),
    path("api/user/departments/", all_departments, name="all_departments"),
    path("api/user/department/course/", user_dept_courses, name="user_department_course"),
    path("api/user/involvedCourses/", user_dept_courses, name="user_department_course"),
    path("api/user/course/", course_info, name="course_info"),
    path("api/upload/module/", FileUploadView.as_view(), name="upload"),
    path("api/download/module/<str:module_id>/", download_module, name="download_module")
]
