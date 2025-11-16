"""
Custom middleware to support header-based tenant identification
This allows the frontend to specify the tenant schema via X-DTS-SCHEMA header
"""
import threading
from django_tenants.middleware import TenantMainMiddleware
from django_tenants.utils import get_tenant_model, get_public_schema_name
from django.db import connection
from django.conf import settings

# Thread-local storage for request
_thread_locals = threading.local()


class CustomTenantMiddleware(TenantMainMiddleware):
    """
    Extends TenantMainMiddleware to support X-DTS-SCHEMA header
    for development and API access
    """
    
    def process_request(self, request):
        """Store request in thread-local and process normally"""
        _thread_locals.request = request
        try:
            # Handle public endpoints before calling super()
            # This prevents the parent middleware from trying to access tenant.domain_url when tenant is None
            if request.path.startswith('/api/v1/public/'):
                # For public endpoints, set schema to public and use public URL conf
                from django_tenants.utils import get_public_schema_name
                connection.set_schema_to_public()
                # Configure ROOT_URLCONF to use public schema URLs
                settings.ROOT_URLCONF = settings.PUBLIC_SCHEMA_URLCONF
                # Don't call super() for public endpoints to avoid tenant processing
                return None
            
            # Check if we have a tenant via header before calling super()
            # This allows us to manually set the schema if needed
            schema_name = request.META.get('HTTP_X_DTS_SCHEMA')
            tenant_from_header = None
            if schema_name:
                TenantModel = get_tenant_model()
                try:
                    tenant_from_header = TenantModel.objects.get(schema_name=schema_name)
                except TenantModel.DoesNotExist:
                    pass
            
            # For all other requests, use normal tenant processing
            result = super().process_request(request)
            
            # If tenant was found via header, ensure schema, ROOT_URLCONF, and request.tenant are set correctly
            # This is critical when tenant is found via header but hostname doesn't match any domain
            if tenant_from_header and hasattr(connection, 'schema_name'):
                current_schema = getattr(connection, 'schema_name', None)
                current_urlconf = getattr(settings, 'ROOT_URLCONF', None)
                
                # Ensure request.tenant is set (django-tenants may not set it when tenant found via header)
                if not hasattr(request, 'tenant') or request.tenant != tenant_from_header:
                    request.tenant = tenant_from_header
                
                # Always ensure ROOT_URLCONF is correct for tenant requests
                # Even if schema is set, ROOT_URLCONF might be wrong
                if current_schema == tenant_from_header.schema_name:
                    # Schema is correct, but ROOT_URLCONF might be wrong
                    if current_urlconf == settings.PUBLIC_SCHEMA_URLCONF:
                        settings.ROOT_URLCONF = 'config.urls'
                        import logging
                        logger = logging.getLogger(__name__)
                        logger.info(f"CustomTenantMiddleware: Fixed ROOT_URLCONF from {current_urlconf} to config.urls for schema {current_schema}")
                elif current_schema != tenant_from_header.schema_name:
                    # Schema wasn't set correctly, set it manually
                    # django-tenants uses set_tenant method on the connection
                    try:
                        connection.set_tenant(tenant_from_header)
                    except AttributeError:
                        # Fallback: set schema name directly if set_tenant doesn't exist
                        connection.schema_name = tenant_from_header.schema_name
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.info(f"CustomTenantMiddleware: Manually set schema to {tenant_from_header.schema_name}")
                    # Ensure ROOT_URLCONF is set correctly
                    settings.ROOT_URLCONF = 'config.urls'
            
            # After processing, log the state for debugging
            import logging
            logger = logging.getLogger(__name__)
            if schema_name:
                current_schema = getattr(connection, 'schema_name', None)
                current_urlconf = getattr(settings, 'ROOT_URLCONF', None)
                logger.info(f"CustomTenantMiddleware: After process_request - Schema: {current_schema}, ROOT_URLCONF: {current_urlconf}")
            
            return result
        finally:
            # Clean up thread-local
            if hasattr(_thread_locals, 'request'):
                delattr(_thread_locals, 'request')
    
    def get_tenant(self, domain_model, hostname):
        """
        Override get_tenant to check for X-DTS-SCHEMA header first
        """
        import logging
        logger = logging.getLogger(__name__)
        
        # Get request from thread-local storage
        request = getattr(_thread_locals, 'request', None)
        
        # If we have request, check for X-DTS-SCHEMA header
        if request:
            # Check for X-DTS-SCHEMA header first (for API requests)
            schema_name = request.META.get('HTTP_X_DTS_SCHEMA')
            
            # Debug: log all headers for troubleshooting (use INFO level for visibility)
            # Log for tenant-specific endpoints
            is_tenant_endpoint = (
                request.path.startswith('/api/v1/hr/') or 
                request.path.startswith('/api/v1/tenants/') or
                request.path.startswith('/api/v1/analytics/')
            )
            
            if is_tenant_endpoint:
                all_headers = {k: v for k, v in request.META.items() if k.startswith('HTTP_')}
                logger.info(f"CustomTenantMiddleware: Request path: {request.path}")
                logger.info(f"CustomTenantMiddleware: X-DTS-SCHEMA header: {schema_name}")
                logger.info(f"CustomTenantMiddleware: Hostname: {hostname}")
                logger.info(f"CustomTenantMiddleware: All HTTP headers: {list(all_headers.keys())}")
            
            if schema_name:
                logger.info(f"CustomTenantMiddleware: Found X-DTS-SCHEMA header: {schema_name}")
                # Validate schema name
                TenantModel = get_tenant_model()
                try:
                    tenant = TenantModel.objects.get(schema_name=schema_name)
                    logger.info(f"CustomTenantMiddleware: Tenant found: {tenant.name} (schema: {tenant.schema_name})")
                    return tenant
                except TenantModel.DoesNotExist:
                    logger.error(f"CustomTenantMiddleware: Tenant with schema '{schema_name}' not found in database")
                    logger.error(f"CustomTenantMiddleware: Available tenants: {list(TenantModel.objects.values_list('schema_name', flat=True))}")
                    # Schema not found, fall through to default behavior
                    pass
            else:
                # Log when header is missing for tenant-specific endpoints
                if is_tenant_endpoint:
                    logger.warning(f"CustomTenantMiddleware: No X-DTS-SCHEMA header found for {request.path}")
        
        # Fall back to default subdomain-based routing
        return super().get_tenant(domain_model, hostname)

