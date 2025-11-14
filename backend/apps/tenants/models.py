"""
Multi-tenant models using django-tenants
Each tenant gets its own PostgreSQL schema
"""
from django.db import models
from django_tenants.models import TenantMixin, DomainMixin


class Tenant(TenantMixin):
    """
    Tenant model - represents a customer company
    Each tenant has isolated database schema
    """
    name = models.CharField(max_length=100)
    created_on = models.DateTimeField(auto_now_add=True)
    
    # Stripe integration
    stripe_customer_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_subscription_id = models.CharField(max_length=255, blank=True, null=True)
    
    # Plan details
    plan = models.CharField(
        max_length=50,
        choices=[
            ('free', 'Free'),
            ('starter', 'Starter'),
            ('professional', 'Professional'),
            ('enterprise', 'Enterprise'),
        ],
        default='free'
    )
    
    # Limits
    max_users = models.IntegerField(default=5)
    max_storage_mb = models.IntegerField(default=1000)  # 1GB
    
    # Status
    is_active = models.BooleanField(default=True)
    trial_ends_on = models.DateField(null=True, blank=True)
    
    # Auto-created schema name
    auto_create_schema = True
    auto_drop_schema = False
    
    class Meta:
        db_table = 'tenants_tenant'
    
    def __str__(self):
        return self.name


class Domain(DomainMixin):
    """
    Domain model - maps subdomain to tenant
    Example: acme.innexar.com -> Tenant(name='ACME Corp')
    """
    class Meta:
        db_table = 'tenants_domain'
