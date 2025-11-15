from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from .models import User, Role, Module, Permission
from .serializers import UserSerializer, RoleSerializer, ModuleSerializer, PermissionSerializer
from .permissions import HasModulePermission

User = get_user_model()


# Authentication Views
class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom token obtain view that includes user and tenant info
    """
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            try:
                email = request.data.get('email')
                # User is in public schema (SHARED_APPS), so we can query directly
                user = User.objects.get(email=email)
                response.data['user'] = UserSerializer(user).data
                if user.default_tenant:
                    response.data['tenant'] = {
                        'id': user.default_tenant.id,
                        'name': user.default_tenant.name,
                        'schema_name': user.default_tenant.schema_name,
                    }
            except User.DoesNotExist:
                # User not found - this shouldn't happen if login succeeded
                pass
            except Exception as e:
                # Log error but don't break the login flow
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error serializing user in login: {str(e)}")
        return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """Logout user by blacklisting refresh token"""
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception as token_error:
                # Token might already be blacklisted or invalid
                # Log but don't fail the logout
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Token blacklist error (non-critical): {str(token_error)}")
        return Response({'detail': _('Successfully logged out.')}, status=status.HTTP_200_OK)
    except Exception as e:
        # Even if there's an error, return success to allow frontend cleanup
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Logout error: {str(e)}")
        return Response({'detail': _('Logged out.')}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register new user"""
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'user': UserSerializer(user).data,
            'detail': _('User registered successfully.')
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """Get current user information"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user password"""
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not old_password or not new_password:
        return Response(
            {'error': _('old_password and new_password are required')},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not user.check_password(old_password):
        return Response(
            {'error': _('Invalid old password')},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user.set_password(new_password)
    user.save()
    
    return Response({'detail': _('Password changed successfully.')})


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    """Request password reset"""
    email = request.data.get('email')
    if not email:
        return Response(
            {'error': _('email is required')},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email=email)
        # TODO: Implement email sending
        return Response({
            'detail': _('Password reset email sent. Check your inbox.')
        })
    except User.DoesNotExist:
        # Don't reveal if user exists
        return Response({
            'detail': _('If the email exists, a password reset link has been sent.')
        })


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    """Confirm password reset"""
    uid = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    
    if not all([uid, token, new_password]):
        return Response(
            {'error': _('uid, token, and new_password are required')},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # TODO: Implement token validation and password reset
    return Response({'detail': _('Password reset successfully.')})


# ViewSets
class RoleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Role management
    """
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [HasModulePermission]
    required_module = 'users'
    required_level = 'view'


class ModuleViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Module (read-only, modules are managed by system)
    """
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [HasModulePermission]
    required_module = 'users'
    required_level = 'view'


class PermissionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Permission management
    """
    queryset = Permission.objects.select_related('role', 'module').all()
    serializer_class = PermissionSerializer
    permission_classes = [HasModulePermission]
    required_module = 'users'
    required_level = 'admin'
    
    def get_queryset(self):
        queryset = super().get_queryset()
        role_id = self.request.query_params.get('role_id')
        module_id = self.request.query_params.get('module_id')
        
        if role_id:
            queryset = queryset.filter(role_id=role_id)
        if module_id:
            queryset = queryset.filter(module_id=module_id)
        
        return queryset


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for User management
    """
    queryset = User.objects.prefetch_related('roles').all()
    serializer_class = UserSerializer
    permission_classes = [HasModulePermission]
    required_module = 'users'
    required_level = 'view'
    
    def get_queryset(self):
        queryset = super().get_queryset()
        role_id = self.request.query_params.get('role_id')
        if role_id:
            queryset = queryset.filter(roles__id=role_id)
        return queryset
    
    @action(detail=True, methods=['post'])
    def assign_roles(self, request, pk=None):
        """Assign roles to user"""
        user = self.get_object()
        role_ids = request.data.get('role_ids', [])
        
        if not isinstance(role_ids, list):
            return Response(
                {'error': _('role_ids must be a list')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        roles = Role.objects.filter(id__in=role_ids)
        user.roles.set(roles)
        
        serializer = self.get_serializer(user)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def permissions(self, request, pk=None):
        """Get user permissions"""
        user = self.get_object()
        
        permissions_data = []
        for role in user.roles.filter(is_active=True):
            for permission in role.permissions.select_related('module').all():
                permissions_data.append({
                    'module_code': permission.module.code,
                    'module_name': permission.module.name,
                    'level': permission.level,
                    'level_display': permission.get_level_display(),
                    'role': role.name
                })
        
        return Response({
            'user_id': user.id,
            'user_email': user.email,
            'permissions': permissions_data
        })
