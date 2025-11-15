"""
Custom middleware to support header-based tenant identification
This allows the frontend to specify the tenant schema via X-DTS-SCHEMA header
"""
from django_tenants.middleware import TenantMainMiddleware
from django_tenants.utils import get_tenant_model, get_public_schema_name
from django.db import connection


class CustomTenantMiddleware(TenantMainMiddleware):
    """
    Extends TenantMainMiddleware to support X-DTS-SCHEMA header
    for development and API access
    """
    
    def process_request(self, request):
        """
        Override process_request to check for X-DTS-SCHEMA header first
        """
        import logging
        logger = logging.getLogger(__name__)
        
        # Check for X-DTS-SCHEMA header first (for API requests)
        schema_name = request.META.get('HTTP_X_DTS_SCHEMA')
        
        if schema_name:
            logger.info(f"CustomTenantMiddleware: Found X-DTS-SCHEMA header: {schema_name}")
            # Validate schema name
            TenantModel = get_tenant_model()
            try:
                tenant = TenantModel.objects.get(schema_name=schema_name)
                logger.info(f"CustomTenantMiddleware: Tenant found: {tenant.name} (schema: {tenant.schema_name})")
                # Set tenant on connection
                connection.set_tenant(tenant)
                request.tenant = tenant
                # Don't call super() - we've handled it
                return None
            except TenantModel.DoesNotExist:
                logger.warning(f"CustomTenantMiddleware: Tenant with schema '{schema_name}' not found")
                # Schema not found, fall through to default behavior
                pass
        else:
            logger.debug(f"CustomTenantMiddleware: No X-DTS-SCHEMA header found, using default routing")
        
        # Fall back to default subdomain-based routing
        return super().process_request(request)

