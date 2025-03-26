from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework import generics
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

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
