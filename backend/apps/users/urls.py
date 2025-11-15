from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    me,
    register,
    change_password,
    password_reset_request,
    password_reset_confirm,
    logout,
    RoleViewSet,
    ModuleViewSet,
    PermissionViewSet,
    UserViewSet,
)

router = DefaultRouter()
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'modules', ModuleViewSet, basename='module')
router.register(r'permissions', PermissionViewSet, basename='permission')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    # Authentication
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('logout/', logout, name='logout'),
    path('register/', register, name='register'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User management
    path('me/', me, name='me'),
    path('change-password/', change_password, name='change_password'),
    
    # Password reset
    path('password-reset/', password_reset_request, name='password_reset_request'),
    path('password-reset/confirm/', password_reset_confirm, name='password_reset_confirm'),
    
    # Roles, Modules, Permissions
    path('', include(router.urls)),
]
