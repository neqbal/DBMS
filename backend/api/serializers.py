from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["first_name", "last_name", "username", "password", "type_of_user"]
        extra_kwargs = {"password": {"write_only": True}}
    
    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user
