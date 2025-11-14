"""
User serializers
"""
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from apps.tenants.models import Tenant, Domain

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Basic user serializer"""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'phone', 'is_active', 'is_staff', 'is_superuser']
        read_only_fields = ['id', 'is_staff', 'is_superuser']


class RegisterSerializer(serializers.ModelSerializer):
    """User registration serializer"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm Password")
    
    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'password2', 'first_name', 'last_name', 'phone']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """Change password serializer"""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True, write_only=True, label="Confirm New Password")
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    """Request password reset serializer"""
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        try:
            User.objects.get(email=value)
        except User.DoesNotExist:
            # Don't reveal if email exists or not (security)
            pass
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Confirm password reset serializer"""
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True, write_only=True, label="Confirm Password")
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT serializer that:
    1. Accepts email instead of username
    2. Finds tenant by user's email domain or association
    3. Returns tenant info along with tokens
    """
    username_field = 'email'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Replace username field with email
        self.fields['email'] = serializers.EmailField()
        self.fields.pop('username', None)
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['email'] = user.email
        token['name'] = user.get_full_name() or user.username
        
        return token
    
    def validate(self, attrs):
        # Get email and password
        email = attrs.get('email')
        password = attrs.get('password')
        
        # Find user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({
                'email': 'No user found with this email address.'
            })
        
        # Check password
        if not user.check_password(password):
            raise serializers.ValidationError({
                'password': 'Incorrect password.'
            })
        
        # Check if user is active
        if not user.is_active:
            raise serializers.ValidationError({
                'email': 'User account is disabled.'
            })
        
        # Find tenant for this user
        tenant = self._find_tenant_for_user(user, email)
        
        if not tenant:
            raise serializers.ValidationError({
                'email': 'No tenant found for this user.'
            })
        
        # Get tokens
        refresh = self.get_token(user)
        
        # Build response data
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'name': user.get_full_name() or user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
            },
            'tenant': {
                'id': tenant.id,
                'name': tenant.name,
                'schema_name': tenant.schema_name,
                'plan': tenant.plan,
                'domain': self._get_primary_domain(tenant),
            }
        }
        
        return data
    
    def _find_tenant_for_user(self, user, email):
        """
        Find tenant for user by:
        1. User's default_tenant (if set)
        2. Email domain matching
        3. First active tenant
        """
        # Check default tenant
        if hasattr(user, 'default_tenant') and user.default_tenant:
            return user.default_tenant
        
        # Try to find by email domain
        email_domain = email.split('@')[1] if '@' in email else None
        if email_domain:
            # Try exact domain match
            domain = Domain.objects.filter(domain__icontains=email_domain).first()
            if domain:
                return domain.tenant
        
        # Return first active tenant
        return Tenant.objects.filter(is_active=True).exclude(schema_name='public').first()
    
    def _get_primary_domain(self, tenant):
        """Get primary domain for tenant"""
        domain = Domain.objects.filter(tenant=tenant, is_primary=True).first()
        return domain.domain if domain else None


class TenantInfoSerializer(serializers.Serializer):
    """Serializer for tenant information"""
    id = serializers.IntegerField()
    name = serializers.CharField()
    schema_name = serializers.CharField()
    plan = serializers.CharField()
    domain = serializers.CharField()


class LoginResponseSerializer(serializers.Serializer):
    """Serializer for login response (for documentation)"""
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()
    tenant = TenantInfoSerializer()
