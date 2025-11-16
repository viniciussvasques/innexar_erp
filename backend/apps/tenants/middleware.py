"""
Custom middleware to support header-based tenant identification
This allows the frontend to specify the tenant schema via X-DTS-SCHEMA header
"""
from django_tenants.middleware import TenantMainMiddleware
from django_tenants.utils import get_tenant_model, get_public_schema_name
from django.db import connection
from django.conf import settings


class CustomTenantMiddleware(TenantMainMiddleware):
    """
    Extends TenantMainMiddleware to support X-DTS-SCHEMA header
    for development and API access
    """
    
    def get_tenant(self, request, *args, **kwargs):
        """
        Override get_tenant to check for X-DTS-SCHEMA header first
        """
        import logging
        logger = logging.getLogger(__name__)
        
        # Force public schema for /api/v1/public/ endpoints
        if request.path.startswith('/api/v1/public/'):
            logger.debug(f"CustomTenantMiddleware: Public API endpoint detected, returning None (public schema)")
            return None
        
        # Check for X-DTS-SCHEMA header first (for API requests)
        schema_name = request.META.get('HTTP_X_DTS_SCHEMA')
        
        if schema_name:
            logger.info(f"CustomTenantMiddleware: Found X-DTS-SCHEMA header: {schema_name}")
            # Validate schema name
            TenantModel = get_tenant_model()
            try:
                tenant = TenantModel.objects.get(schema_name=schema_name)
                logger.info(f"CustomTenantMiddleware: Tenant found: {tenant.name} (schema: {tenant.schema_name})")
                return tenant
            except TenantModel.DoesNotExist:
                logger.warning(f"CustomTenantMiddleware: Tenant with schema '{schema_name}' not found")
                # Schema not found, fall through to default behavior
                pass
        
        # Fall back to default subdomain-based routing
        return super().get_tenant(request, *args, **kwargs)

