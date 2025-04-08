from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Departments, Instructors, StudentCourseDetail, StudentModuleCompleted, Students, Courses, ModuleCreator, Modules, Teaches

class CustomUserAdmin(UserAdmin):
    # Add type_of_user to the list_display
    list_display = ('id',) +  UserAdmin.list_display + ('type_of_user', )
    # Add type_of_user to the fieldsets
    fieldsets = UserAdmin.fieldsets + (
        ('User Type', {'fields': ('type_of_user',)}),
    )
    # Add type_of_user to the add_fieldsets
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('User Type', {'fields': ('type_of_user',)}),
    )

    ordering = ('id', )


admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Instructors)
admin.site.register(Students)
admin.site.register(Departments)
admin.site.register(Courses)
admin.site.register(ModuleCreator)
admin.site.register(Modules)
admin.site.register(StudentCourseDetail)
admin.site.register(StudentModuleCompleted)
admin.site.register(Teaches)
