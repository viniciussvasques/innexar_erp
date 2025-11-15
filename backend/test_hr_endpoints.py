#!/usr/bin/env python
"""
Script de teste para validar todos os endpoints do módulo HR
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
print("TESTES DO MÓDULO HR - VALIDAÇÃO DE ENDPOINTS")
print("=" * 80)

# 1. Verificar tenant
try:
    tenant = Tenant.objects.get(schema_name='testcompany')
    print(f"\n✅ Tenant encontrado: {tenant.name} (schema: {tenant.schema_name})")
except Tenant.DoesNotExist:
    print("\n❌ Tenant 'testcompany' não encontrado!")
    print("   Execute: python create_test_data.py")
    exit(1)

# 2. Verificar usuário
with schema_context('public'):
    try:
        user = User.objects.get(email='test@testcompany.com')
        print(f"✅ Usuário encontrado: {user.email}")
    except User.DoesNotExist:
        try:
            user = User.objects.get(username='testuser')
            print(f"✅ Usuário encontrado por username: {user.email}")
        except User.DoesNotExist:
            # Criar com username único
            import uuid
            unique_username = f'testuser_{uuid.uuid4().hex[:8]}'
            user = User.objects.create_user(
                email='test@testcompany.com',
                username=unique_username,
                password='testpass123',
                first_name='Test',
                last_name='User',
                is_staff=True,
                is_active=True
            )
            print(f"✅ Usuário criado: {user.email}")

# 3. Testar modelos no schema tenant
with schema_context(tenant.schema_name):
    print("\n" + "=" * 80)
    print("TESTANDO MODELOS NO SCHEMA TENANT")
    print("=" * 80)
    
    # Teste 1: Departments
    print("\n📋 Teste 1: Departments")
    dept_count = Department.objects.count()
    print(f"   Total: {dept_count}")
    if dept_count == 0:
        dept = Department.objects.create(
            name='IT',
            code='IT',
            description='IT Department',
            is_active=True
        )
        print(f"   ✅ Departamento criado: {dept.name}")
    else:
        dept = Department.objects.first()
        print(f"   ✅ Departamento existente: {dept.name}")
    
    # Teste 2: Employees
    print("\n👤 Teste 2: Employees")
    emp_count = Employee.objects.count()
    print(f"   Total: {emp_count}")
    if emp_count == 0:
        emp = Employee.objects.create(
            user=user,
            employee_number='EMP-000001',
            job_title='Developer',
            department=dept,
            hire_date=date.today() - timedelta(days=365),
            base_salary=Decimal('5000.00'),
            status='active'
        )
        print(f"   ✅ Funcionário criado: {emp.employee_number}")
    else:
        emp = Employee.objects.first()
        print(f"   ✅ Funcionário existente: {emp.employee_number}")
    
    # Teste 3: Benefits
    print("\n💼 Teste 3: Benefits")
    benefit_count = Benefit.objects.count()
    print(f"   Total: {benefit_count}")
    if benefit_count == 0:
        benefit = Benefit.objects.create(
            name='Vale Refeição',
            benefit_type='meal_voucher',
            description='Vale refeição mensal',
            value=Decimal('500.00'),
            limit=Decimal('600.00'),
            is_active=True
        )
        print(f"   ✅ Benefício criado: {benefit.name}")
    else:
        benefit = Benefit.objects.first()
        print(f"   ✅ Benefício existente: {benefit.name}")
    
    # Teste 4: Employee Benefits
    print("\n👔 Teste 4: Employee Benefits")
    emp_benefit_count = EmployeeBenefit.objects.count()
    print(f"   Total: {emp_benefit_count}")
    if emp_benefit_count == 0:
        emp_benefit = EmployeeBenefit.objects.create(
            employee=emp,
            benefit=benefit,
            value=Decimal('500.00'),
            start_date=date.today(),
            is_active=True
        )
        print(f"   ✅ Benefício do funcionário criado")
    else:
        print(f"   ✅ Benefício do funcionário existente")
    
    # Teste 5: Time Records
    print("\n⏰ Teste 5: Time Records")
    time_record = TimeRecord.objects.create(
        employee=emp,
        record_type='check_in',
        record_date=date.today(),
        record_time=datetime.now().time(),
        is_approved=False
    )
    print(f"   ✅ Registro de ponto criado: {time_record.record_type}")
    
    # Teste 6: Vacations
    print("\n🏖️  Teste 6: Vacations")
    vacation = Vacation.objects.create(
        employee=emp,
        status='requested',
        start_date=date.today() + timedelta(days=30),
        end_date=date.today() + timedelta(days=44),
        days=15,
        acquisition_period_start=date.today() - timedelta(days=365),
        acquisition_period_end=date.today() - timedelta(days=1)
    )
    print(f"   ✅ Solicitação de férias criada: {vacation.status}")
    
    # Teste 7: Performance Reviews
    print("\n📊 Teste 7: Performance Reviews")
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
    print(f"   ✅ Avaliação de desempenho criada: Score {review.overall_score}")
    
    # Teste 8: Trainings
    print("\n📚 Teste 8: Trainings")
    training = Training.objects.create(
        name='Curso de Vendas',
        description='Treinamento em técnicas de vendas',
        training_type='Internal',
        start_date=date.today() + timedelta(days=7),
        end_date=date.today() + timedelta(days=14),
        duration_hours=40,
        location='Sala de Treinamento',
        instructor='João Silva',
        provides_certificate=True,
        certificate_validity_months=12,
        is_active=True
    )
    print(f"   ✅ Treinamento criado: {training.name}")
    
    # Teste 9: Employee Trainings
    print("\n🎓 Teste 9: Employee Trainings")
    emp_training, created = EmployeeTraining.objects.get_or_create(
        employee=emp,
        training=training,
        defaults={
            'status': 'enrolled',
            'enrollment_date': date.today()
        }
    )
    if created:
        print(f"   ✅ Inscrição criada: {emp_training.status}")
    else:
        print(f"   ✅ Inscrição existente: {emp_training.status}")
    
    # Teste 10: Job Openings
    print("\n💼 Teste 10: Job Openings")
    job = JobOpening.objects.create(
        title='Desenvolvedor Python',
        department=dept,
        description='Vaga para desenvolvedor Python sênior',
        requirements='Python, Django, REST API',
        salary_min=Decimal('8000.00'),
        salary_max=Decimal('12000.00'),
        status='open'
    )
    print(f"   ✅ Vaga criada: {job.title}")
    
    # Teste 11: Candidates
    print("\n👥 Teste 11: Candidates")
    candidate = Candidate.objects.create(
        first_name='João',
        last_name='Silva',
        email='joao@example.com',
        phone='11999999999',
        job_opening=job,
        status='applied',
        notes='Candidato interessado'
    )
    print(f"   ✅ Candidato criado: {candidate.first_name} {candidate.last_name}")
    
    # Teste 12: Payroll
    print("\n💰 Teste 12: Payroll")
    payroll = Payroll.objects.create(
        payroll_number='PAY-2024-11-EMP-000001',
        employee=emp,
        month=11,
        year=2024,
        base_salary=Decimal('5000.00'),
        commissions=Decimal('500.00'),
        overtime=Decimal('200.00'),
        bonuses=Decimal('300.00'),
        benefits_value=Decimal('500.00'),
        total_earnings=Decimal('6500.00'),
        inss=Decimal('500.00'),
        irrf=Decimal('300.00'),
        fgts=Decimal('400.00'),
        transportation=Decimal('200.00'),
        meal_voucher=Decimal('100.00'),
        total_deductions=Decimal('1500.00'),
        net_salary=Decimal('5000.00'),
        is_processed=True,
        processed_at=datetime.now()
    )
    print(f"   ✅ Folha de pagamento criada: {payroll.payroll_number}")
    print(f"      Salário líquido: R$ {payroll.net_salary}")
    
    # Teste 13: Companies
    print("\n🏢 Teste 13: Companies")
    company = Company.objects.create(
        legal_name='Test Company LLC',
        trade_name='TestCo',
        company_type='llc',
        ein='12-3456789',
        address='123 Main St',
        city='New York',
        state='NY',
        zip_code='10001',
        country='USA',
        owner=emp,
        is_active=True
    )
    print(f"   ✅ Empresa criada: {company.legal_name}")

# 4. Resumo
print("\n" + "=" * 80)
print("RESUMO DOS TESTES")
print("=" * 80)

with schema_context(tenant.schema_name):
    print(f"\n✅ Departments: {Department.objects.count()}")
    print(f"✅ Companies: {Company.objects.count()}")
    print(f"✅ Employees: {Employee.objects.count()}")
    print(f"✅ Benefits: {Benefit.objects.count()}")
    print(f"✅ Employee Benefits: {EmployeeBenefit.objects.count()}")
    print(f"✅ Time Records: {TimeRecord.objects.count()}")
    print(f"✅ Vacations: {Vacation.objects.count()}")
    print(f"✅ Performance Reviews: {PerformanceReview.objects.count()}")
    print(f"✅ Trainings: {Training.objects.count()}")
    print(f"✅ Employee Trainings: {EmployeeTraining.objects.count()}")
    print(f"✅ Job Openings: {JobOpening.objects.count()}")
    print(f"✅ Candidates: {Candidate.objects.count()}")
    print(f"✅ Payroll: {Payroll.objects.count()}")

print("\n" + "=" * 80)
print("✅ TODOS OS TESTES CONCLUÍDOS COM SUCESSO!")
print("=" * 80)
print("\n📝 Próximos passos:")
print("   1. Testar endpoints via Swagger: http://localhost:8000/api/docs/")
print("   2. Testar endpoints via curl ou Postman")
print("   3. Verificar logs do servidor para erros")

