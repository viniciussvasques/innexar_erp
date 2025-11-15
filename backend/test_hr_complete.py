#!/usr/bin/env python
"""
Script completo de teste para validar todos os modelos e endpoints do módulo HR
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django_tenants.utils import schema_context
from apps.tenants.models import Tenant
from apps.users.models import User, Role, Module, Permission
from apps.hr.models import (
    Department, Company, Employee, Benefit, EmployeeBenefit,
    TimeRecord, Vacation, PerformanceReview, Training, EmployeeTraining,
    JobOpening, Candidate, Payroll
)
from datetime import date, datetime, timedelta
from decimal import Decimal

print("=" * 80)
print("TESTES COMPLETOS DO MÓDULO HR")
print("=" * 80)

# 1. Verificar tenant
try:
    tenant = Tenant.objects.get(schema_name='testcompany')
    print(f"\n✅ Tenant encontrado: {tenant.name} (schema: {tenant.schema_name})")
except Tenant.DoesNotExist:
    print("\n❌ Tenant 'testcompany' não encontrado!")
    print("   Execute: python create_test_data.py")
    exit(1)

# 2. Verificar/criar usuário
with schema_context('public'):
    try:
        user = User.objects.get(email='test@example.com')
        print(f"✅ Usuário encontrado: {user.email}")
    except User.DoesNotExist:
        print("⚠️  Usuário de teste não encontrado, usando qualquer usuário...")
        user = User.objects.first()
        if not user:
            print("❌ Nenhum usuário encontrado!")
            exit(1)

# 3. Testar todos os modelos
print("\n" + "=" * 80)
print("TESTANDO MODELOS")
print("=" * 80)

with schema_context(tenant.schema_name):
    results = {
        'created': [],
        'errors': []
    }
    
    # Teste 1: Department
    print("\n📋 1. Department")
    try:
        dept, created = Department.objects.get_or_create(
            name='IT',
            defaults={'code': 'IT', 'description': 'IT Department', 'is_active': True}
        )
        if created:
            results['created'].append('Department')
            print(f"   ✅ Criado: {dept.name}")
        else:
            print(f"   ✅ Existente: {dept.name}")
    except Exception as e:
        results['errors'].append(f'Department: {str(e)}')
        print(f"   ❌ Erro: {str(e)}")
    
    # Teste 2: Employee
    print("\n👤 2. Employee")
    try:
        emp, created = Employee.objects.get_or_create(
            user=user,
            defaults={
                'employee_number': 'EMP-000001',
                'job_title': 'Developer',
                'department': dept,
                'hire_date': date.today() - timedelta(days=365),
                'base_salary': Decimal('5000.00'),
                'status': 'active'
            }
        )
        if created:
            results['created'].append('Employee')
            print(f"   ✅ Criado: {emp.employee_number}")
        else:
            print(f"   ✅ Existente: {emp.employee_number}")
    except Exception as e:
        results['errors'].append(f'Employee: {str(e)}')
        print(f"   ❌ Erro: {str(e)}")
    
    # Teste 3: Company
    print("\n🏢 3. Company")
    try:
        company, created = Company.objects.get_or_create(
            ein='12-3456789',
            defaults={
                'legal_name': 'Test Company LLC',
                'trade_name': 'TestCo',
                'company_type': 'llc',
                'address': '123 Main St',
                'city': 'New York',
                'state': 'NY',
                'zip_code': '10001',
                'country': 'USA',
                'owner': emp,
                'is_active': True
            }
        )
        if created:
            results['created'].append('Company')
            print(f"   ✅ Criado: {company.legal_name}")
        else:
            print(f"   ✅ Existente: {company.legal_name}")
    except Exception as e:
        results['errors'].append(f'Company: {str(e)}')
        print(f"   ❌ Erro: {str(e)}")
    
    # Teste 4: Benefit
    print("\n💼 4. Benefit")
    try:
        benefit, created = Benefit.objects.get_or_create(
            name='Vale Refeição',
            defaults={
                'benefit_type': 'meal_voucher',
                'description': 'Vale refeição mensal',
                'value': Decimal('500.00'),
                'limit': Decimal('600.00'),
                'is_active': True
            }
        )
        if created:
            results['created'].append('Benefit')
            print(f"   ✅ Criado: {benefit.name}")
        else:
            print(f"   ✅ Existente: {benefit.name}")
    except Exception as e:
        results['errors'].append(f'Benefit: {str(e)}')
        print(f"   ❌ Erro: {str(e)}")
    
    # Teste 5: EmployeeBenefit
    print("\n👔 5. EmployeeBenefit")
    try:
        emp_benefit, created = EmployeeBenefit.objects.get_or_create(
            employee=emp,
            benefit=benefit,
            start_date=date.today(),
            defaults={
                'value': Decimal('500.00'),
                'is_active': True
            }
        )
        if created:
            results['created'].append('EmployeeBenefit')
            print(f"   ✅ Criado")
        else:
            print(f"   ✅ Existente")
    except Exception as e:
        results['errors'].append(f'EmployeeBenefit: {str(e)}')
        print(f"   ❌ Erro: {str(e)}")
    
    # Teste 6: TimeRecord
    print("\n⏰ 6. TimeRecord")
    try:
        time_record = TimeRecord.objects.create(
            employee=emp,
            record_type='check_in',
            record_date=date.today(),
            record_time=datetime.now().time(),
            is_approved=False
        )
        results['created'].append('TimeRecord')
        print(f"   ✅ Criado: {time_record.record_type}")
    except Exception as e:
        results['errors'].append(f'TimeRecord: {str(e)}')
        print(f"   ❌ Erro: {str(e)}")
    
    # Teste 7: Vacation
    print("\n🏖️  7. Vacation")
    try:
        vacation = Vacation.objects.create(
            employee=emp,
            status='requested',
            start_date=date.today() + timedelta(days=30),
            end_date=date.today() + timedelta(days=44),
            days=15,
            acquisition_period_start=date.today() - timedelta(days=365),
            acquisition_period_end=date.today() - timedelta(days=1),
            sell_days=0,
            cash_allowance=False
        )
        results['created'].append('Vacation')
        print(f"   ✅ Criado: {vacation.status}")
    except Exception as e:
        results['errors'].append(f'Vacation: {str(e)}')
        print(f"   ❌ Erro: {str(e)}")
    
    # Teste 8: PerformanceReview
    print("\n📊 8. PerformanceReview")
    try:
        review = PerformanceReview.objects.create(
            employee=emp,
            reviewer=emp,
            review_period_start=date.today() - timedelta(days=90),
            review_period_end=date.today(),
            review_date=date.today(),
            status='draft',
            criteria_scores={'quality': 8.5, 'productivity': 9.0},
            overall_score=Decimal('8.75'),
            strengths='Excelente trabalho',
            areas_for_improvement='Comunicação'
        )
        results['created'].append('PerformanceReview')
        print(f"   ✅ Criado: Score {review.overall_score}")
    except Exception as e:
        results['errors'].append(f'PerformanceReview: {str(e)}')
        print(f"   ❌ Erro: {str(e)}")
    
    # Teste 9: Training
    print("\n📚 9. Training")
    try:
        training, created = Training.objects.get_or_create(
            name='Curso de Vendas',
            defaults={
                'description': 'Treinamento em técnicas de vendas',
                'training_type': 'Internal',
                'start_date': date.today() + timedelta(days=7),
                'end_date': date.today() + timedelta(days=14),
                'duration_hours': 40,
                'location': 'Sala de Treinamento',
                'instructor': 'João Silva',
                'provides_certificate': True,
                'certificate_validity_months': 12,
                'is_active': True
            }
        )
        if created:
            results['created'].append('Training')
            print(f"   ✅ Criado: {training.name}")
        else:
            print(f"   ✅ Existente: {training.name}")
    except Exception as e:
        results['errors'].append(f'Training: {str(e)}')
        print(f"   ❌ Erro: {str(e)}")
    
    # Teste 10: EmployeeTraining
    print("\n🎓 10. EmployeeTraining")
    try:
        emp_training, created = EmployeeTraining.objects.get_or_create(
            employee=emp,
            training=training,
            defaults={
                'status': 'enrolled',
                'enrollment_date': date.today()
            }
        )
        if created:
            results['created'].append('EmployeeTraining')
            print(f"   ✅ Criado: {emp_training.status}")
        else:
            print(f"   ✅ Existente: {emp_training.status}")
    except Exception as e:
        results['errors'].append(f'EmployeeTraining: {str(e)}')
        print(f"   ❌ Erro: {str(e)}")
    
    # Teste 11: JobOpening
    print("\n💼 11. JobOpening")
    try:
        job, created = JobOpening.objects.get_or_create(
            title='Desenvolvedor Python',
            defaults={
                'department': dept,
                'description': 'Vaga para desenvolvedor Python sênior',
                'requirements': 'Python, Django, REST API',
                'salary_min': Decimal('8000.00'),
                'salary_max': Decimal('12000.00'),
                'status': 'open'
            }
        )
        if created:
            results['created'].append('JobOpening')
            print(f"   ✅ Criado: {job.title}")
        else:
            print(f"   ✅ Existente: {job.title}")
    except Exception as e:
        results['errors'].append(f'JobOpening: {str(e)}')
        print(f"   ❌ Erro: {str(e)}")
    
    # Teste 12: Candidate
    print("\n👥 12. Candidate")
    try:
        candidate = Candidate.objects.create(
            first_name='João',
            last_name='Silva',
            email='joao@example.com',
            phone='11999999999',
            job_opening=job,
            status='applied',
            notes='Candidato interessado'
        )
        results['created'].append('Candidate')
        print(f"   ✅ Criado: {candidate.first_name} {candidate.last_name}")
    except Exception as e:
        results['errors'].append(f'Candidate: {str(e)}')
        print(f"   ❌ Erro: {str(e)}")
    
    # Teste 13: Payroll
    print("\n💰 13. Payroll")
    try:
        from django.utils import timezone
        payroll, created = Payroll.objects.get_or_create(
            employee=emp,
            month=11,
            year=2024,
            defaults={
                'base_salary': Decimal('5000.00'),
                'commissions': Decimal('500.00'),
                'overtime': Decimal('200.00'),
                'bonuses': Decimal('300.00'),
                'benefits_value': Decimal('500.00'),
                'inss': Decimal('500.00'),
                'irrf': Decimal('300.00'),
                'fgts': Decimal('400.00'),
                'transportation': Decimal('200.00'),
                'meal_voucher': Decimal('100.00'),
                'is_processed': True,
                'processed_at': timezone.now()
            }
        )
        if created:
            results['created'].append('Payroll')
            print(f"   ✅ Criado: {payroll.payroll_number}")
            print(f"      Salário líquido: R$ {payroll.net_salary}")
        else:
            print(f"   ✅ Existente: {payroll.payroll_number}")
            print(f"      Salário líquido: R$ {payroll.net_salary}")
    except Exception as e:
        results['errors'].append(f'Payroll: {str(e)}')
        print(f"   ❌ Erro: {str(e)}")
    
    # Resumo
    print("\n" + "=" * 80)
    print("RESUMO DOS TESTES")
    print("=" * 80)
    
    print(f"\n✅ Modelos criados/verificados: {len(results['created'])}")
    for item in results['created']:
        print(f"   - {item}")
    
    if results['errors']:
        print(f"\n❌ Erros encontrados: {len(results['errors'])}")
        for error in results['errors']:
            print(f"   - {error}")
    
    # Contagem final
    print("\n📊 CONTAGEM FINAL:")
    print(f"   Departments: {Department.objects.count()}")
    print(f"   Companies: {Company.objects.count()}")
    print(f"   Employees: {Employee.objects.count()}")
    print(f"   Benefits: {Benefit.objects.count()}")
    print(f"   Employee Benefits: {EmployeeBenefit.objects.count()}")
    print(f"   Time Records: {TimeRecord.objects.count()}")
    print(f"   Vacations: {Vacation.objects.count()}")
    print(f"   Performance Reviews: {PerformanceReview.objects.count()}")
    print(f"   Trainings: {Training.objects.count()}")
    print(f"   Employee Trainings: {EmployeeTraining.objects.count()}")
    print(f"   Job Openings: {JobOpening.objects.count()}")
    print(f"   Candidates: {Candidate.objects.count()}")
    print(f"   Payroll: {Payroll.objects.count()}")

# 4. Verificar ViewSets e URLs
print("\n" + "=" * 80)
print("VERIFICANDO VIEWSETS E URLS")
print("=" * 80)

try:
    from apps.hr.views import (
        DepartmentViewSet, CompanyViewSet, EmployeeViewSet,
        BenefitViewSet, EmployeeBenefitViewSet, TimeRecordViewSet,
        VacationViewSet, PerformanceReviewViewSet, TrainingViewSet,
        EmployeeTrainingViewSet, JobOpeningViewSet, CandidateViewSet,
        PayrollViewSet
    )
    
    viewsets = [
        ('DepartmentViewSet', DepartmentViewSet),
        ('CompanyViewSet', CompanyViewSet),
        ('EmployeeViewSet', EmployeeViewSet),
        ('BenefitViewSet', BenefitViewSet),
        ('EmployeeBenefitViewSet', EmployeeBenefitViewSet),
        ('TimeRecordViewSet', TimeRecordViewSet),
        ('VacationViewSet', VacationViewSet),
        ('PerformanceReviewViewSet', PerformanceReviewViewSet),
        ('TrainingViewSet', TrainingViewSet),
        ('EmployeeTrainingViewSet', EmployeeTrainingViewSet),
        ('JobOpeningViewSet', JobOpeningViewSet),
        ('CandidateViewSet', CandidateViewSet),
        ('PayrollViewSet', PayrollViewSet),
    ]
    
    print("\n✅ ViewSets encontrados:")
    for name, viewset in viewsets:
        print(f"   - {name}")
        # Verificar ações customizadas
        if hasattr(viewset, 'get_extra_actions'):
            actions = viewset.get_extra_actions()
            if actions:
                for action in actions:
                    methods = getattr(action, 'methods', ['GET'])
                    if isinstance(methods, list):
                        methods_str = ', '.join(methods)
                    else:
                        methods_str = str(methods)
                    print(f"     Ação: {action.url_path} ({methods_str})")
    
    print(f"\n✅ Total de ViewSets: {len(viewsets)}")
    
except Exception as e:
    print(f"❌ Erro ao verificar ViewSets: {str(e)}")
    import traceback
    traceback.print_exc()

# 5. Verificar Serializers
print("\n" + "=" * 80)
print("VERIFICANDO SERIALIZERS")
print("=" * 80)

try:
    from apps.hr.serializers import (
        DepartmentSerializer, CompanySerializer, EmployeeSerializer,
        BenefitSerializer, EmployeeBenefitSerializer, TimeRecordSerializer,
        VacationSerializer, PerformanceReviewSerializer, TrainingSerializer,
        EmployeeTrainingSerializer, JobOpeningSerializer, CandidateSerializer,
        PayrollSerializer
    )
    
    serializers = [
        'DepartmentSerializer', 'CompanySerializer', 'EmployeeSerializer',
        'BenefitSerializer', 'EmployeeBenefitSerializer', 'TimeRecordSerializer',
        'VacationSerializer', 'PerformanceReviewSerializer', 'TrainingSerializer',
        'EmployeeTrainingSerializer', 'JobOpeningSerializer', 'CandidateSerializer',
        'PayrollSerializer'
    ]
    
    print(f"\n✅ Serializers encontrados: {len(serializers)}")
    for s in serializers:
        print(f"   - {s}")
    
except Exception as e:
    print(f"❌ Erro ao verificar Serializers: {str(e)}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 80)
if len(results.get('errors', [])) == 0:
    print("✅ TODOS OS TESTES PASSARAM!")
else:
    print(f"⚠️  {len(results['errors'])} ERROS ENCONTRADOS")
print("=" * 80)

print("\n📝 Próximos passos:")
print("   1. Testar endpoints via Swagger: http://localhost:8000/api/docs/")
print("   2. Verificar logs do servidor")
print("   3. Testar integração com frontend")

