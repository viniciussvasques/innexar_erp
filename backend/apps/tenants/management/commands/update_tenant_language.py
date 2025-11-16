"""
Django management command to update tenant language
Usage: python manage.py update_tenant_language --schema acme --language pt
"""
from django.core.management.base import BaseCommand
from django_tenants.utils import schema_context
from apps.tenants.models import Tenant, TenantSettings


class Command(BaseCommand):
    help = 'Update tenant language settings'

    def add_arguments(self, parser):
        parser.add_argument(
            '--schema',
            type=str,
            required=True,
            help='Tenant schema name (e.g., acme)'
        )
        parser.add_argument(
            '--language',
            type=str,
            required=True,
            choices=['pt', 'en', 'es'],
            help='Language code (pt, en, es)'
        )

    def handle(self, *args, **options):
        schema_name = options['schema']
        language = options['language']

        # Check if tenant exists
        try:
            tenant = Tenant.objects.get(schema_name=schema_name)
            self.stdout.write(
                self.style.SUCCESS(f'✓ Tenant found: {tenant.name} (schema: {schema_name})')
            )
        except Tenant.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'✗ Tenant with schema "{schema_name}" not found')
            )
            return

        # Update settings in tenant schema
        with schema_context(schema_name):
            settings = TenantSettings.objects.first()
            
            if settings:
                old_language = settings.language
                settings.language = language
                settings.save()
                
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Language updated successfully!')
                )
                self.stdout.write(f'   Old language: {old_language}')
                self.stdout.write(f'   New language: {language}')
            else:
                self.stdout.write(
                    self.style.ERROR('✗ No TenantSettings found. Please complete onboarding first.')
                )

