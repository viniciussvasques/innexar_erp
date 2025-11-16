"""
Helper functions for HR module
Combines hardcoded data with database data
"""
from typing import List, Dict, Any, Optional
from django.http import HttpRequest
from apps.hr.models import Department, JobPosition, Benefit
from apps.hr.constants import (
    get_departments,
    get_job_positions,
    get_benefits,
    DEPARTMENTS_PT,
    JOB_POSITIONS_STRUCTURE,
    JOB_NAMES_PT,
)


def get_language_from_request(request: HttpRequest) -> str:
    """Get language from request (Accept-Language header or default)"""
    lang = request.META.get('HTTP_ACCEPT_LANGUAGE', 'pt').lower()
    if 'en' in lang:
        return 'en'
    elif 'es' in lang:
        return 'es'
    return 'pt'


def get_departments_with_fallback(lang: str = 'pt', active_only: bool = True) -> List[Dict[str, Any]]:
    """
    Get departments from database, fallback to hardcoded if empty
    Returns list of dicts with id, code, name, description, is_active
    """
    # Try to get from database first
    try:
        queryset = Department.objects.all()
        if active_only:
            queryset = queryset.filter(is_active=True)
        
        db_departments = list(queryset.values('id', 'code', 'name', 'description', 'is_active'))
        
        if db_departments:
            return db_departments
    except Exception:
        # Database not ready or tables don't exist
        pass
    
    # Fallback to hardcoded data
    hardcoded = get_departments(lang)
    return [
        {
            'id': None,  # No ID for hardcoded data
            'code': dept['code'],
            'name': dept['name'],
            'description': dept['description'],
            'is_active': True,
        }
        for dept in hardcoded
    ]


def get_job_positions_with_fallback(
    lang: str = 'pt',
    department_id: Optional[int] = None,
    active_only: bool = True
) -> List[Dict[str, Any]]:
    """
    Get job positions from database, fallback to hardcoded if empty
    Returns list of dicts with id, code, name, department, level, is_active
    """
    # Try to get from database first
    try:
        queryset = JobPosition.objects.select_related('department').all()
        if active_only:
            queryset = queryset.filter(is_active=True)
        if department_id:
            queryset = queryset.filter(department_id=department_id)
        
        db_positions = []
        for pos in queryset:
            db_positions.append({
                'id': pos.id,
                'code': pos.code,
                'name': pos.name,
                'department': pos.department.code if pos.department else None,
                'department_id': pos.department_id,
                'level': pos.level,
                'is_active': pos.is_active,
            })
        
        if db_positions:
            return db_positions
    except Exception:
        # Database not ready or tables don't exist
        pass
    
    # Fallback to hardcoded data
    hardcoded = get_job_positions(lang)
    
    # Filter by department if specified
    if department_id:
        # Need to get department code from database
        try:
            dept = Department.objects.get(id=department_id)
            dept_code = dept.code
        except Exception:
            return []
        
        hardcoded = [jp for jp in hardcoded if jp['department'] == dept_code]
    
    return [
        {
            'id': None,  # No ID for hardcoded data
            'code': job['code'],
            'name': job['name'],
            'department': job['department'],
            'department_id': None,  # Would need to lookup
            'level': job['level'],
            'is_active': True,
        }
        for job in hardcoded
    ]


def get_tenant_settings(request: HttpRequest) -> Optional[Dict[str, Any]]:
    """Get tenant settings if available"""
    try:
        if hasattr(request, 'tenant'):
            from django_tenants.utils import schema_context
            from apps.tenants.models import TenantSettings
            
            tenant = request.tenant
            with schema_context(tenant.schema_name):
                settings = TenantSettings.objects.first()
                if settings:
                    return {
                        'country': settings.country,
                        'currency': settings.currency,
                        'timezone': settings.timezone,
                        'language': settings.language,
                    }
    except Exception:
        pass
    return None


def get_benefits_with_fallback(lang: str = 'pt', country: str = 'BR', active_only: bool = True) -> List[Dict[str, Any]]:
    """
    Get benefits from database, fallback to hardcoded if empty
    Returns list of dicts with id, name, benefit_type, description, value, limit, is_active
    """
    # Try to get from database first
    try:
        queryset = Benefit.objects.all()
        if active_only:
            queryset = queryset.filter(is_active=True)
        
        db_benefits = list(queryset.values('id', 'name', 'benefit_type', 'description', 'value', 'limit', 'is_active'))
        
        if db_benefits:
            return db_benefits
    except Exception:
        # Database not ready or tables don't exist
        pass
    
    # Fallback to hardcoded data
    hardcoded = get_benefits(lang, country)
    return [
        {
            'id': None,  # No ID for hardcoded data
            'name': benefit['name'],
            'benefit_type': benefit['benefit_type'],
            'description': benefit['description'],
            'value': benefit.get('value'),
            'limit': benefit.get('limit'),
            'is_active': True,
        }
        for benefit in hardcoded
    ]

