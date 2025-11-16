"""
Signals for tenant management
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django_tenants.utils import schema_context
from .models import Tenant
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Tenant)
def load_hr_fixtures_for_new_tenant(sender, instance, created, **kwargs):
    """
    Automatically load HR fixtures when a new tenant is created
    Uses a delayed approach to wait for django-tenants to finish migrations
    """
    if not created:
        return  # Only run for new tenants
    
    # Skip public schema
    if instance.schema_name == 'public':
        return
    
    # Use a background task or delayed execution to wait for migrations
    # django-tenants applies migrations automatically, but we need to wait
    import threading
    import time
    
    def load_fixtures_delayed():
        """Load fixtures after a delay to allow migrations to complete"""
        # Wait for django-tenants to finish creating schema and applying migrations
        time.sleep(2)  # Give django-tenants time to apply migrations
        
        try:
            logger.info(f'Loading HR fixtures for new tenant: {instance.name} (schema: {instance.schema_name})')
            
            from apps.hr.fixtures import load_hr_fixtures_for_country
            
            # Try to load fixtures with retries
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    with schema_context(instance.schema_name):
                        # Check if tables exist
                        from apps.hr.models import Department
                        Department.objects.count()  # Test query
                        
                        # Tables exist, load fixtures
                        def output_callback(message, style='INFO'):
                            if style == 'SUCCESS':
                                logger.info(f'✓ {message}')
                            elif style == 'WARNING':
                                logger.warning(f'⚠ {message}')
                            elif style == 'ERROR':
                                logger.error(f'✗ {message}')
                            else:
                                logger.info(message)
                        
                        load_hr_fixtures_for_country(
                            country_code='BR',
                            clear=False,
                            output_callback=output_callback
                        )
                        
                        logger.info(f'✓ HR fixtures loaded successfully for tenant: {instance.name}')
                        return  # Success!
                        
                except Exception as e:
                    if attempt < max_retries - 1:
                        logger.info(f'Retrying fixtures load for {instance.schema_name} (attempt {attempt + 1}/{max_retries})...')
                        time.sleep(1)  # Wait before retry
                    else:
                        raise
            
        except Exception as e:
            # Log error but don't fail tenant creation
            logger.error(f'Error loading HR fixtures for tenant {instance.name}: {str(e)}', exc_info=True)
            logger.info(f'You can load fixtures manually: python manage.py load_hr_fixtures --schema {instance.schema_name}')
    
    # Start background thread to load fixtures
    thread = threading.Thread(target=load_fixtures_delayed, daemon=True)
    thread.start()

