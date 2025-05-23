from rest_framework import serializers
from django.contrib.auth import get_user_model
from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from djoser.serializers import UserSerializer as BaseUserSerializer

User = get_user_model()

class UserCreateSerializer(BaseUserCreateSerializer):
    """Serializer for creating users."""
    class Meta(BaseUserCreateSerializer.Meta):
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'password')
        extra_kwargs = {'password': {'write_only': True}}

class UserSerializer(BaseUserSerializer):
    """Serializer for users."""
    class Meta(BaseUserSerializer.Meta):
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'is_active', 'is_staff')
        read_only_fields = ('is_active', 'is_staff')
