"""
User models and authentication
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model
    Extends Django's AbstractUser with tenant-specific fields
    """
    # Override email to be unique and required
    email = models.EmailField(unique=True)
    
    # Additional fields
    phone = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    
    # Tenant association (for users in public schema)
    # Note: In tenant schemas, users are isolated by schema
    default_tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users'
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  # username still required for createsuperuser
    
    class Meta:
        db_table = 'users_user'
    
    def __str__(self):
        return self.email
