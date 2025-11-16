"""
Helper functions for loading HR fixtures
Can be used by management commands or signals
Uses hardcoded data from constants.py
"""
from django.db import transaction
from django_tenants.utils import schema_context
from apps.hr.models import Department, JobPosition, Benefit
from apps.hr.constants import (
    get_departments,
    get_job_positions,
    get_benefits,
)
import logging

logger = logging.getLogger(__name__)


def load_hr_fixtures_for_country(country_code='BR', clear=False, output_callback=None):
    """
    Load HR fixtures for a specific country
    
    Args:
        country_code: Country code (BR, US, ES, MX, AR, CO)
        clear: If True, clear existing data before loading
        output_callback: Optional callback function for output (receives message, style)
    """
    def log(message, style='INFO'):
        if output_callback:
            output_callback(message, style)
        else:
            if style == 'SUCCESS':
                logger.info(f'✓ {message}')
            elif style == 'WARNING':
                logger.warning(f'⚠ {message}')
            elif style == 'ERROR':
                logger.error(f'✗ {message}')
            else:
                logger.info(message)
    
    # Get language from country code
    lang_map = {
        'BR': 'pt',
        'US': 'en',
        'ES': 'es',
        'MX': 'es',
        'AR': 'es',
        'CO': 'es',
    }
    lang = lang_map.get(country_code, 'pt')
    
    with transaction.atomic():
        if clear:
            log('Clearing existing HR data...', 'WARNING')
            JobPosition.objects.all().delete()
            Department.objects.all().delete()
            Benefit.objects.all().delete()
            log('Existing data cleared.', 'SUCCESS')
        
        # 1. DEPARTMENTS - Use hardcoded data from constants
        log('Creating departments...', 'SUCCESS')
        departments_data = get_departments(lang)
        departments = {}
        
        for dept_data in departments_data:
            dept, created = Department.objects.get_or_create(
                code=dept_data['code'],
                defaults={
                    'name': dept_data['name'],
                    'description': dept_data['description'],
                    'is_active': True,
                }
            )
            departments[dept_data['code']] = dept
            if created:
                log(f'Created department: {dept.name}', 'SUCCESS')
        
        # 2. JOB POSITIONS - Use hardcoded data from constants
        log('Creating job positions...', 'SUCCESS')
        job_positions_data = get_job_positions(lang)
        
        for job_data in job_positions_data:
            dept = departments.get(job_data['department'])
            if not dept:
                log(f'Department {job_data["department"]} not found, skipping {job_data["code"]}', 'WARNING')
                continue
            
            job, created = JobPosition.objects.get_or_create(
                code=job_data['code'],
                defaults={
                    'name': job_data['name'],
                    'department': dept,
                    'level': job_data['level'],
                    'is_active': True,
                }
            )
            if created:
                log(f'Created job position: {job.name} ({dept.name})', 'SUCCESS')
        
        # 3. BENEFITS - Use hardcoded data from constants
        log('Creating benefits...', 'SUCCESS')
        benefits_data = get_benefits(lang, country_code)
        
        for benefit_data in benefits_data:
            benefit, created = Benefit.objects.get_or_create(
                name=benefit_data['name'],
                defaults={
                    'benefit_type': benefit_data['benefit_type'],
                    'description': benefit_data['description'],
                    'value': benefit_data.get('value'),
                    'limit': benefit_data.get('limit'),
                    'is_active': True,
                }
            )
            if created:
                log(f'Created benefit: {benefit.name}', 'SUCCESS')
        
        log(f'HR fixtures loaded successfully!', 'SUCCESS')
        log(f'  - {Department.objects.count()} departments', 'INFO')
        log(f'  - {JobPosition.objects.count()} job positions', 'INFO')
        log(f'  - {Benefit.objects.count()} benefits', 'INFO')

