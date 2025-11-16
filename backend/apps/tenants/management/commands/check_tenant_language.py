"""
Django management command to check tenant language settings
Usage: python manage.py check_tenant_language --schema acme
"""
from django.core.management.base import BaseCommand
from django_tenants.utils import schema_context
from apps.tenants.models import Tenant, TenantSettings


class Command(BaseCommand):
    help = 'Check tenant language settings'

    def add_arguments(self, parser):
        parser.add_argument(
            '--schema',
            type=str,
            required=True,
            help='Tenant schema name (e.g., acme)'
        )

    def handle(self, *args, **options):
        schema_name = options['schema']

        # Check if tenant exists
        try:
            tenant = Tenant.objects.get(schema_name=schema_name)
            self.stdout.write(
                self.style.SUCCESS(f'✓ Tenant found: {tenant.name} (schema: {schema_name})')
            )
            self.stdout.write(f'   Onboarding completed: {tenant.onboarding_completed}')
        except Tenant.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'✗ Tenant with schema "{schema_name}" not found')
            )
            return

        # Check settings in tenant schema
        with schema_context(schema_name):
            settings = TenantSettings.objects.first()
            
            if settings:
                self.stdout.write(self.style.SUCCESS('✓ TenantSettings found:'))
                self.stdout.write(f'   Company Name: {settings.company_name}')
                self.stdout.write(f'   Language: {settings.language}')
                self.stdout.write(f'   Country: {settings.country}')
                self.stdout.write(f'   Currency: {settings.currency}')
                self.stdout.write(f'   Timezone: {settings.timezone}')
            else:
                self.stdout.write(
                    self.style.WARNING('⚠️  No TenantSettings found')
                )

