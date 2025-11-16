from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import User, Role, Module, Permission
from apps.tenants.serializers import TenantSerializer


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'code', 'description', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ['id', 'code', 'name', 'description', 'icon', 'order', 'is_active', 'created_at']
        read_only_fields = ['created_at']


class PermissionSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.name', read_only=True)
    module_name = serializers.CharField(source='module.name', read_only=True)
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    
    class Meta:
        model = Permission
        fields = ['id', 'role', 'role_name', 'module', 'module_name', 'level', 'level_display', 'created_at']
        read_only_fields = ['created_at']


class UserSerializer(serializers.ModelSerializer):
    roles = RoleSerializer(many=True, read_only=True)
    role_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Role.objects.all(),
        source='roles',
        write_only=True,
        required=False
    )
    full_name = serializers.SerializerMethodField()
    default_tenant_name = serializers.CharField(source='default_tenant.name', read_only=True)
    default_tenant_schema = serializers.CharField(source='default_tenant.schema_name', read_only=True)
    # Add default_tenant as nested object for read operations
    default_tenant = TenantSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'avatar', 'is_active', 'is_staff', 'is_superuser',
            'roles', 'role_ids',
            'discount_limit_percent',
            'default_tenant', 'default_tenant_name', 'default_tenant_schema',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'is_superuser']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.email
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
