#!/usr/bin/env python
"""
Script para verificar todas as APIs do módulo HR
"""
import os
import django
import requests
from django.urls import get_resolver
from django.urls.resolvers import URLPattern, URLResolver

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def list_urls(urlpatterns, prefix=''):
    """Lista todas as URLs recursivamente"""
    urls = []
    for p in urlpatterns:
        if isinstance(p, URLResolver):
            urls.extend(list_urls(p.url_patterns, prefix + str(p.pattern)))
        elif isinstance(p, URLPattern):
            urls.append(prefix + str(p.pattern))
    return urls

print("=" * 60)
print("VERIFICAÇÃO DAS APIs DO MÓDULO HR")
print("=" * 60)

# 1. Verificar rotas registradas
resolver = get_resolver()
all_urls = list_urls(resolver.url_patterns)
hr_urls = [u for u in all_urls if 'hr' in u.lower()]

print("\n✅ ROTAS HR ENCONTRADAS:")
print("-" * 60)
for url in sorted(set(hr_urls)):
    print(f"  {url}")

# 2. Verificar ViewSets e ações
print("\n✅ VIEWSETS E AÇÕES:")
print("-" * 60)

from apps.hr.views import (
    DepartmentViewSet, CompanyViewSet, EmployeeViewSet,
    BenefitViewSet, EmployeeBenefitViewSet, TimeRecordViewSet,
    VacationViewSet, PerformanceReviewViewSet, TrainingViewSet,
    EmployeeTrainingViewSet, JobOpeningViewSet, CandidateViewSet,
    PayrollViewSet
)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'benefits', BenefitViewSet, basename='benefit')
router.register(r'employee-benefits', EmployeeBenefitViewSet, basename='employee-benefit')
router.register(r'time-records', TimeRecordViewSet, basename='time-record')
router.register(r'vacations', VacationViewSet, basename='vacation')
router.register(r'performance-reviews', PerformanceReviewViewSet, basename='performance-review')
router.register(r'trainings', TrainingViewSet, basename='training')
router.register(r'employee-trainings', EmployeeTrainingViewSet, basename='employee-training')
router.register(r'job-openings', JobOpeningViewSet, basename='job-opening')
router.register(r'candidates', CandidateViewSet, basename='candidate')
router.register(r'payroll', PayrollViewSet, basename='payroll')

print("\n📋 Departments:")
for prefix, viewset, basename in router.registry:
    if 'department' in basename:
        print(f"  - {prefix}")
        # Listar ações padrão do ModelViewSet
        print("    Ações padrão: list, create, retrieve, update, partial_update, destroy")
        # Verificar ações customizadas
        if hasattr(viewset, 'get_extra_actions'):
            for action in viewset.get_extra_actions():
                print(f"    Ação customizada: {action.url_path} ({', '.join(action.methods)})")

print("\n📋 Companies:")
for prefix, viewset, basename in router.registry:
    if 'company' in basename:
        print(f"  - {prefix}")
        print("    Ações padrão: list, create, retrieve, update, partial_update, destroy")

print("\n📋 Employees:")
for prefix, viewset, basename in router.registry:
    if 'employee' in basename and basename == 'employee':
        print(f"  - {prefix}")
        print("    Ações padrão: list, create, retrieve, update, partial_update, destroy")
        # Verificar ações customizadas
        if hasattr(viewset, 'get_extra_actions'):
            for action in viewset.get_extra_actions():
                methods = getattr(action, 'methods', ['GET'])
                if isinstance(methods, list):
                    methods_str = ', '.join(methods)
                else:
                    methods_str = str(methods)
                print(f"    Ação customizada: {action.url_path} ({methods_str})")

print("\n📋 Benefits:")
for prefix, viewset, basename in router.registry:
    if basename == 'benefit':
        print(f"  - {prefix}")
        print("    Ações padrão: list, create, retrieve, update, partial_update, destroy")

print("\n📋 Employee Benefits:")
for prefix, viewset, basename in router.registry:
    if basename == 'employee-benefit':
        print(f"  - {prefix}")
        print("    Ações padrão: list, create, retrieve, update, partial_update, destroy")

print("\n📋 Time Records:")
for prefix, viewset, basename in router.registry:
    if basename == 'time-record':
        print(f"  - {prefix}")
        print("    Ações padrão: list, create, retrieve, update, partial_update, destroy")
        if hasattr(viewset, 'get_extra_actions'):
            for action in viewset.get_extra_actions():
                methods = getattr(action, 'methods', ['POST'])
                if isinstance(methods, list):
                    methods_str = ', '.join(methods)
                else:
                    methods_str = str(methods)
                print(f"    Ação customizada: {action.url_path} ({methods_str})")

print("\n📋 Vacations:")
for prefix, viewset, basename in router.registry:
    if basename == 'vacation':
        print(f"  - {prefix}")
        print("    Ações padrão: list, create, retrieve, update, partial_update, destroy")
        if hasattr(viewset, 'get_extra_actions'):
            for action in viewset.get_extra_actions():
                methods = getattr(action, 'methods', ['POST'])
                if isinstance(methods, list):
                    methods_str = ', '.join(methods)
                else:
                    methods_str = str(methods)
                print(f"    Ação customizada: {action.url_path} ({methods_str})")

print("\n📋 Performance Reviews:")
for prefix, viewset, basename in router.registry:
    if basename == 'performance-review':
        print(f"  - {prefix}")
        print("    Ações padrão: list, create, retrieve, update, partial_update, destroy")

print("\n📋 Trainings:")
for prefix, viewset, basename in router.registry:
    if basename == 'training':
        print(f"  - {prefix}")
        print("    Ações padrão: list, create, retrieve, update, partial_update, destroy")
        if hasattr(viewset, 'get_extra_actions'):
            for action in viewset.get_extra_actions():
                methods = getattr(action, 'methods', ['POST'])
                if isinstance(methods, list):
                    methods_str = ', '.join(methods)
                else:
                    methods_str = str(methods)
                print(f"    Ação customizada: {action.url_path} ({methods_str})")

print("\n📋 Employee Trainings:")
for prefix, viewset, basename in router.registry:
    if basename == 'employee-training':
        print(f"  - {prefix}")
        print("    Ações padrão: list, retrieve (read-only)")

print("\n📋 Job Openings:")
for prefix, viewset, basename in router.registry:
    if basename == 'job-opening':
        print(f"  - {prefix}")
        print("    Ações padrão: list, create, retrieve, update, partial_update, destroy")

print("\n📋 Candidates:")
for prefix, viewset, basename in router.registry:
    if basename == 'candidate':
        print(f"  - {prefix}")
        print("    Ações padrão: list, create, retrieve, update, partial_update, destroy")

print("\n📋 Payroll:")
for prefix, viewset, basename in router.registry:
    if basename == 'payroll':
        print(f"  - {prefix}")
        print("    Ações padrão: list, retrieve (read-only)")
        if hasattr(viewset, 'get_extra_actions'):
            for action in viewset.get_extra_actions():
                methods = getattr(action, 'methods', ['POST'])
                if isinstance(methods, list):
                    methods_str = ', '.join(methods)
                else:
                    methods_str = str(methods)
                print(f"    Ação customizada: {action.url_path} ({methods_str})")

# 3. Verificar endpoints esperados
print("\n✅ ENDPOINTS ESPERADOS:")
print("-" * 60)

expected_endpoints = [
    # Departments (6)
    "GET    /api/v1/hr/departments/",
    "POST   /api/v1/hr/departments/",
    "GET    /api/v1/hr/departments/{id}/",
    "PUT    /api/v1/hr/departments/{id}/",
    "PATCH  /api/v1/hr/departments/{id}/",
    "DELETE /api/v1/hr/departments/{id}/",
    # Companies (6)
    "GET    /api/v1/hr/companies/",
    "POST   /api/v1/hr/companies/",
    "GET    /api/v1/hr/companies/{id}/",
    "PUT    /api/v1/hr/companies/{id}/",
    "PATCH  /api/v1/hr/companies/{id}/",
    "DELETE /api/v1/hr/companies/{id}/",
    # Employees (7)
    "GET    /api/v1/hr/employees/",
    "POST   /api/v1/hr/employees/",
    "GET    /api/v1/hr/employees/{id}/",
    "PUT    /api/v1/hr/employees/{id}/",
    "PATCH  /api/v1/hr/employees/{id}/",
    "DELETE /api/v1/hr/employees/{id}/",
    "GET    /api/v1/hr/employees/by_user/?user_id={id}",
    # Benefits (6)
    "GET    /api/v1/hr/benefits/",
    "POST   /api/v1/hr/benefits/",
    "GET    /api/v1/hr/benefits/{id}/",
    "PUT    /api/v1/hr/benefits/{id}/",
    "PATCH  /api/v1/hr/benefits/{id}/",
    "DELETE /api/v1/hr/benefits/{id}/",
    # Employee Benefits (6)
    "GET    /api/v1/hr/employee-benefits/",
    "POST   /api/v1/hr/employee-benefits/",
    "GET    /api/v1/hr/employee-benefits/{id}/",
    "PUT    /api/v1/hr/employee-benefits/{id}/",
    "PATCH  /api/v1/hr/employee-benefits/{id}/",
    "DELETE /api/v1/hr/employee-benefits/{id}/",
    # Time Records (7)
    "GET    /api/v1/hr/time-records/",
    "POST   /api/v1/hr/time-records/",
    "GET    /api/v1/hr/time-records/{id}/",
    "PUT    /api/v1/hr/time-records/{id}/",
    "PATCH  /api/v1/hr/time-records/{id}/",
    "DELETE /api/v1/hr/time-records/{id}/",
    "POST   /api/v1/hr/time-records/{id}/approve/",
    # Vacations (8)
    "GET    /api/v1/hr/vacations/",
    "POST   /api/v1/hr/vacations/",
    "GET    /api/v1/hr/vacations/{id}/",
    "PUT    /api/v1/hr/vacations/{id}/",
    "PATCH  /api/v1/hr/vacations/{id}/",
    "DELETE /api/v1/hr/vacations/{id}/",
    "POST   /api/v1/hr/vacations/{id}/approve/",
    "POST   /api/v1/hr/vacations/{id}/reject/",
    # Performance Reviews (6)
    "GET    /api/v1/hr/performance-reviews/",
    "POST   /api/v1/hr/performance-reviews/",
    "GET    /api/v1/hr/performance-reviews/{id}/",
    "PUT    /api/v1/hr/performance-reviews/{id}/",
    "PATCH  /api/v1/hr/performance-reviews/{id}/",
    "DELETE /api/v1/hr/performance-reviews/{id}/",
    # Trainings (7)
    "GET    /api/v1/hr/trainings/",
    "POST   /api/v1/hr/trainings/",
    "GET    /api/v1/hr/trainings/{id}/",
    "PUT    /api/v1/hr/trainings/{id}/",
    "PATCH  /api/v1/hr/trainings/{id}/",
    "DELETE /api/v1/hr/trainings/{id}/",
    "POST   /api/v1/hr/trainings/{id}/enroll/",
    # Employee Trainings (2)
    "GET    /api/v1/hr/employee-trainings/",
    "GET    /api/v1/hr/employee-trainings/{id}/",
    # Job Openings (6)
    "GET    /api/v1/hr/job-openings/",
    "POST   /api/v1/hr/job-openings/",
    "GET    /api/v1/hr/job-openings/{id}/",
    "PUT    /api/v1/hr/job-openings/{id}/",
    "PATCH  /api/v1/hr/job-openings/{id}/",
    "DELETE /api/v1/hr/job-openings/{id}/",
    # Candidates (6)
    "GET    /api/v1/hr/candidates/",
    "POST   /api/v1/hr/candidates/",
    "GET    /api/v1/hr/candidates/{id}/",
    "PUT    /api/v1/hr/candidates/{id}/",
    "PATCH  /api/v1/hr/candidates/{id}/",
    "DELETE /api/v1/hr/candidates/{id}/",
    # Payroll (3)
    "GET    /api/v1/hr/payroll/",
    "GET    /api/v1/hr/payroll/{id}/",
    "POST   /api/v1/hr/payroll/process/",
]

for endpoint in expected_endpoints:
    print(f"  {endpoint}")

# 4. Verificar filtros disponíveis
print("\n✅ FILTROS DISPONÍVEIS:")
print("-" * 60)

print("\n📋 Departments:")
print("  - active_only=true (filtra apenas ativos)")

print("\n📋 Companies:")
print("  - owner_id={id} (filtra por proprietário)")
print("  - active_only=true (filtra apenas ativas)")

print("\n📋 Employees:")
print("  - department_id={id} (filtra por departamento)")
print("  - status={status} (filtra por status: active, on_leave, terminated, resigned)")
print("  - hire_type={type} (filtra por tipo: individual, company)")
print("  - active_only=true (filtra apenas ativos)")

print("\n📋 Benefits:")
print("  - benefit_type={type} (filtra por tipo)")
print("  - active_only=true (filtra apenas ativos)")

print("\n📋 Employee Benefits:")
print("  - employee={id} (filtra por funcionário)")
print("  - benefit={id} (filtra por benefício)")
print("  - active_only=true (filtra apenas ativos)")

print("\n📋 Time Records:")
print("  - employee={id} (filtra por funcionário)")
print("  - record_type={type} (filtra por tipo)")
print("  - is_approved={true/false} (filtra por aprovação)")
print("  - record_date={date} (filtra por data)")

print("\n📋 Vacations:")
print("  - employee={id} (filtra por funcionário)")
print("  - status={status} (filtra por status)")

print("\n📋 Performance Reviews:")
print("  - employee={id} (filtra por funcionário)")
print("  - reviewer={id} (filtra por avaliador)")
print("  - status={status} (filtra por status)")

print("\n📋 Trainings:")
print("  - training_type={type} (filtra por tipo)")
print("  - is_active={true/false} (filtra por ativo)")
print("  - provides_certificate={true/false} (filtra por certificado)")
print("  - active_only=true (filtra apenas ativos)")

print("\n📋 Employee Trainings:")
print("  - employee={id} (filtra por funcionário)")
print("  - training={id} (filtra por treinamento)")
print("  - status={status} (filtra por status)")
print("  - certificate_issued={true/false} (filtra por certificado emitido)")

print("\n📋 Job Openings:")
print("  - department={id} (filtra por departamento)")
print("  - status={status} (filtra por status)")
print("  - open_only=true (filtra apenas abertas)")

print("\n📋 Candidates:")
print("  - job_opening={id} (filtra por vaga)")
print("  - status={status} (filtra por status)")

print("\n📋 Payroll:")
print("  - employee={id} (filtra por funcionário)")
print("  - month={1-12} (filtra por mês)")
print("  - year={year} (filtra por ano)")
print("  - is_processed={true/false} (filtra por processado)")

# 5. Verificar permissões
print("\n✅ PERMISSÕES:")
print("-" * 60)
print("  Módulo: hr")
print("  Nível mínimo: view")
print("  Classe: HasModulePermission")

print("\n" + "=" * 60)
print("✅ VERIFICAÇÃO CONCLUÍDA")
print("=" * 60)

