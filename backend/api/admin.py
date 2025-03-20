from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    # Add type_of_user to the list_display
    list_display = UserAdmin.list_display + ('type_of_user',)
    # Add type_of_user to the fieldsets
    fieldsets = UserAdmin.fieldsets + (
        ('User Type', {'fields': ('type_of_user',)}),
    )
    # Add type_of_user to the add_fieldsets
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('User Type', {'fields': ('type_of_user',)}),
    )

admin.site.register(CustomUser, CustomUserAdmin)
