"""
User admin configuration
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _
from .models import Role, Module, Permission

User = get_user_model()


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'code']
    ordering = ['name']


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'order', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'code']
    ordering = ['order', 'name']


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ['role', 'module', 'level', 'created_at']
    list_filter = ['level', 'module', 'role']
    search_fields = ['role__name', 'module__name']
    ordering = ['role', 'module']


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom user admin"""
    
    list_display = ['avatar_preview', 'email', 'full_name', 'tenant_badge', 'status_badge', 'is_staff', 'date_joined']
    list_filter = ['is_staff', 'is_superuser', 'is_active', 'default_tenant', 'date_joined', 'roles']
    search_fields = ['email', 'username', 'first_name', 'last_name', 'phone']
    ordering = ['-date_joined']
    list_per_page = 25
    date_hierarchy = 'date_joined'
    
    fieldsets = (
        (_('🔐 Credentials'), {
            'fields': ('email', 'username', 'password')
        }),
        (_('👤 Personal Information'), {
            'fields': ('first_name', 'last_name', 'phone', 'avatar'),
            'classes': ('wide',)
        }),
        (_('🏢 Tenant'), {
            'fields': ('default_tenant',),
            'description': _('Default company/organization of the user')
        }),
        (_('👥 Roles & Permissions'), {
            'fields': ('roles', 'assigned_warehouse', 'discount_limit_percent'),
            'description': _('User roles and seller-specific settings')
        }),
        (_('🔑 System Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
        (_('📅 Important Dates'), {
            'fields': ('last_login', 'date_joined'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        (_('Create New User'), {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'first_name', 'last_name', 'default_tenant'),
        }),
    )
    
    readonly_fields = ['last_login', 'date_joined']
    filter_horizontal = ['roles', 'groups', 'user_permissions']
    
    def avatar_preview(self, obj):
        if obj.avatar:
            return format_html('<img src="{}" width="32" height="32" style="border-radius: 50%;" />', obj.avatar.url)
        return format_html('<div style="width:32px;height:32px;border-radius:50%;background:#007bff;color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;">{}</div>', 
                         obj.first_name[0].upper() if obj.first_name else obj.email[0].upper())
    avatar_preview.short_description = ''
    
    def full_name(self, obj):
        return obj.get_full_name() or obj.username
    full_name.short_description = _('Full Name')
    full_name.admin_order_field = 'first_name'
    
    def tenant_badge(self, obj):
        if obj.default_tenant:
            return format_html('<span style="background:#17a2b8;color:white;padding:3px 10px;border-radius:12px;font-size:11px;">{}</span>', 
                           obj.default_tenant.name)
        return format_html('<span style="background:#6c757d;color:white;padding:3px 10px;border-radius:12px;font-size:11px;">{}</span>', 
                          _('No Tenant'))
    tenant_badge.short_description = _('Tenant')
    tenant_badge.admin_order_field = 'default_tenant'
    
    def status_badge(self, obj):
        if obj.is_active:
            return format_html('<span style="background:#28a745;color:white;padding:3px 10px;border-radius:12px;font-size:11px;">✓ {}</span>', 
                              _('Active'))
        return format_html('<span style="background:#dc3545;color:white;padding:3px 10px;border-radius:12px;font-size:11px;">✗ {}</span>', 
                          _('Inactive'))
    status_badge.short_description = _('Status')
    status_badge.admin_order_field = 'is_active'
