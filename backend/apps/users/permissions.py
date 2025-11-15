"""
Custom permissions for DRF
"""
from rest_framework import permissions
from django.utils.translation import gettext_lazy as _


class HasModulePermission(permissions.BasePermission):
    """
    Permission class that checks if user has access to a module
    
    Usage:
        permission_classes = [HasModulePermission]
        
        # In view, set:
        required_module = 'sales'
        required_level = 'view'  # or 'create', 'edit', 'delete', 'admin'
    """
    
    message = _('You do not have permission to perform this action.')
    
    def has_permission(self, request, view):
        # Allow superuser
        if request.user and request.user.is_superuser:
            return True
        
        # Require authentication
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Get required module and level from view
        required_module = getattr(view, 'required_module', None)
        required_level = getattr(view, 'required_level', 'view')
        
        if not required_module:
            # If no module specified, allow authenticated users
            return True
        
        # Check if user has permission
        return request.user.has_module_permission(required_module, required_level)

