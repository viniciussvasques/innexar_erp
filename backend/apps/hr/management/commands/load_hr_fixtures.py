"""
Management command to load initial HR data (departments, job positions, benefits, etc.)
with support for multiple languages (PT, EN, ES) and countries (Brazil, USA, etc.)
Usage: python manage.py load_hr_fixtures [--clear] [--country=BR|US|ES|MX]
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.hr.models import Department, JobPosition, Benefit
from django.utils.translation import activate, get_language
from django_tenants.utils import schema_context
from apps.tenants.models import Tenant


class Command(BaseCommand):
    help = 'Load initial HR data (departments, job positions, benefits) with multi-language support'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before loading',
        )
        parser.add_argument(
            '--country',
            type=str,
            default='BR',
            choices=['BR', 'US', 'ES', 'MX', 'AR', 'CO', 'ALL'],
            help='Country code: BR (Brazil), US (USA), ES (Spain), MX (Mexico), AR (Argentina), CO (Colombia), ALL (all countries)',
        )
        parser.add_argument(
            '--schema',
            type=str,
            default=None,
            help='Schema name (tenant). If not provided, will load for all tenants',
        )

    def handle(self, *args, **options):
        clear = options['clear']
        country = options['country']
        schema_name = options['schema']
        
        # Get tenants to process
        if schema_name:
            try:
                tenants = [Tenant.objects.get(schema_name=schema_name)]
            except Tenant.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Tenant with schema "{schema_name}" not found!'))
                return
        else:
            # Load for all tenants
            tenants = Tenant.objects.exclude(schema_name='public').all()
            if not tenants.exists():
                self.stdout.write(self.style.WARNING('No tenants found! Please create a tenant first.'))
                self.stdout.write(self.style.INFO('You can create a tenant using: python manage.py shell'))
                return
        
        # Process each tenant
        for tenant in tenants:
            self.stdout.write(self.style.SUCCESS(f'\n{"="*60}'))
            self.stdout.write(self.style.SUCCESS(f'Processing tenant: {tenant.name} (schema: {tenant.schema_name})'))
            self.stdout.write(self.style.SUCCESS(f'{"="*60}'))
            
            with schema_context(tenant.schema_name):
                with transaction.atomic():
                    if clear:
                        self.stdout.write(self.style.WARNING('Clearing existing HR data...'))
                        JobPosition.objects.all().delete()
                        Department.objects.all().delete()
                        Benefit.objects.all().delete()
                        self.stdout.write(self.style.SUCCESS('Existing data cleared.'))

                    # Load data based on country using helper function
                    from apps.hr.fixtures import load_hr_fixtures_for_country
                    
                    def output_callback(message, style='INFO'):
                        if style == 'SUCCESS':
                            self.stdout.write(self.style.SUCCESS(message))
                        elif style == 'WARNING':
                            self.stdout.write(self.style.WARNING(message))
                        elif style == 'ERROR':
                            self.stdout.write(self.style.ERROR(message))
                        else:
                            self.stdout.write(message)
                    
                    if country == 'ALL':
                        load_hr_fixtures_for_country('BR', clear=False, output_callback=output_callback)
                        load_hr_fixtures_for_country('US', clear=False, output_callback=output_callback)
                        load_hr_fixtures_for_country('ES', clear=False, output_callback=output_callback)
                    else:
                        load_hr_fixtures_for_country(country, clear=False, output_callback=output_callback)

                self.stdout.write(self.style.SUCCESS(f'\n✓ HR fixtures loaded successfully for {tenant.name}!'))
                self.stdout.write(f'  - {Department.objects.count()} departments')
                self.stdout.write(f'  - {JobPosition.objects.count()} job positions')
                self.stdout.write(f'  - {Benefit.objects.count()} benefits')
