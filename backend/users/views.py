from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserSerializer, UserCreateSerializer

class UserCreateView(generics.CreateAPIView):
    """View for creating a new user."""
    serializer_class = UserCreateSerializer
    permission_classes = [permissions.AllowAny]

class UserDetailView(generics.RetrieveUpdateAPIView):
    """View for retrieving and updating user details."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class CurrentUserView(APIView):
    """View for retrieving the current authenticated user."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
