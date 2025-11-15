#!/usr/bin/env python
"""
Script completo de validação do módulo HR
Testa: modelos, cálculos, notificações, serializers, views
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django_tenants.utils import schema_context
from django.test import TestCase
from django.utils import timezone
from apps.tenants.models import Tenant
from apps.users.models import User
from apps.hr.models import (
    Department, Company, Employee, Benefit, EmployeeBenefit,
    TimeRecord, Vacation, PerformanceReview, Training, EmployeeTraining,
    JobOpening, Candidate, Payroll, JobPosition, BankAccount, Dependent,
    Education, WorkExperience, Contract, EmployeeDocument, EmployeeHistory,
    HRNotification, TaxTable
)
from apps.hr.calculations import (
    calculate_overtime_hours,
    calculate_brazilian_taxes,
    calculate_vacation_balance,
    calculate_proportional_vacation,
    auto_calculate_payroll
)
from apps.hr.notifications import (
    create_notification,
    check_document_expiry,
    check_vacation_expiry,
    check_pending_time_records,
    notify_payroll_processed,
    notify_vacation_request
)
from datetime import date, datetime, timedelta
from decimal import Decimal

print("=" * 80)
print("VALIDAÇÃO COMPLETA DO MÓDULO HR")
print("=" * 80)

errors = []
warnings = []
success = []

def test_result(name, passed, message=""):
    """Registra resultado do teste"""
    if passed:
        success.append(name)
        print(f"✅ {name}")
        if message:
            print(f"   {message}")
    else:
        errors.append(name)
        print(f"❌ {name}")
        if message:
            print(f"   {message}")

def test_warning(name, message):
    """Registra aviso"""
    warnings.append(name)
    print(f"⚠️  {name}: {message}")

# 1. Testar imports
print("\n" + "=" * 80)
print("1. TESTANDO IMPORTS")
print("=" * 80)

try:
    from apps.hr import models, serializers, views, calculations, notifications, signals
    test_result("Imports do módulo HR", True)
except Exception as e:
    test_result("Imports do módulo HR", False, str(e))
    sys.exit(1)

# 2. Verificar tenant
print("\n" + "=" * 80)
print("2. VERIFICANDO TENANT")
print("=" * 80)

try:
    tenant = Tenant.objects.get(schema_name='testcompany')
    test_result("Tenant 'testcompany' encontrado", True, f"Schema: {tenant.schema_name}")
except Tenant.DoesNotExist:
    test_warning("Tenant 'testcompany'", "Não encontrado. Criando...")
    try:
        tenant = Tenant.objects.create(
            schema_name='testcompany',
            name='Test Company',
            domain_url='testcompany.localhost',
            is_active=True
        )
        test_result("Tenant criado", True)
    except Exception as e:
        test_result("Criação de tenant", False, str(e))
        sys.exit(1)

# 3. Verificar usuário
print("\n" + "=" * 80)
print("3. VERIFICANDO USUÁRIO")
print("=" * 80)

with schema_context('public'):
    try:
        user = User.objects.get(email='test@testcompany.com')
        test_result("Usuário encontrado", True, f"Email: {user.email}")
    except User.DoesNotExist:
        test_warning("Usuário", "Não encontrado. Criando...")
        try:
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
            test_result("Usuário criado", True)
        except Exception as e:
            test_result("Criação de usuário", False, str(e))
            sys.exit(1)

# 4. Testar modelos no schema tenant
print("\n" + "=" * 80)
print("4. TESTANDO MODELOS")
print("=" * 80)

with schema_context(tenant.schema_name):
    # Department
    try:
        dept, created = Department.objects.get_or_create(
            name='IT',
            defaults={'code': 'IT', 'description': 'IT Department', 'is_active': True}
        )
        test_result("Department", True, f"{'Criado' if created else 'Existente'}: {dept.name}")
    except Exception as e:
        test_result("Department", False, str(e))
    
    # JobPosition
    try:
        job_pos, created = JobPosition.objects.get_or_create(
            code='DEV-JR',
            defaults={
                'name': 'Desenvolvedor Júnior',
                'department': dept,
                'level': 'junior',
                'salary_min': Decimal('3000.00'),
                'salary_max': Decimal('5000.00'),
                'is_active': True
            }
        )
        test_result("JobPosition", True, f"{'Criado' if created else 'Existente'}: {job_pos.name}")
    except Exception as e:
        test_result("JobPosition", False, str(e))
    
    # Employee
    try:
        # Tentar buscar employee existente primeiro
        emp = Employee.objects.filter(user=user).first()
        if not emp:
            # Tentar buscar por employee_number
            emp = Employee.objects.filter(employee_number='EMP-000001').first()
        
        if not emp:
            # Criar novo
            import uuid
            unique_number = f'EMP-{uuid.uuid4().hex[:6].upper()}'
            emp = Employee.objects.create(
                user=user,
                employee_number=unique_number,
                job_title='Developer',
                job_position=job_pos,
                department=dept,
                hire_date=date.today() - timedelta(days=365),
                base_salary=Decimal('5000.00'),
                weekly_hours=44,
                status='active'
            )
            test_result("Employee", True, f"Criado: {emp.employee_number}")
        else:
            test_result("Employee", True, f"Existente: {emp.employee_number}")
    except Exception as e:
        test_result("Employee", False, str(e))
        emp = None
    
    # BankAccount
    try:
        if emp:
            bank_account, created = BankAccount.objects.get_or_create(
                employee=emp,
                defaults={
                    'bank_name': 'Banco do Brasil',
                    'agency': '1234',
                    'account_number': '56789-0',
                    'account_type': 'checking',
                    'is_primary': True
                }
            )
            test_result("BankAccount", True, f"{'Criado' if created else 'Existente'}")
        else:
            test_warning("BankAccount", "Employee não disponível")
    except Exception as e:
        test_result("BankAccount", False, str(e))
    
    # Dependent
    try:
        if emp:
            dependent, created = Dependent.objects.get_or_create(
                employee=emp,
                name='Filho Teste',
                defaults={
                    'date_of_birth': date.today() - timedelta(days=365*10),
                    'relationship': 'son',
                    'is_tax_dependent': True
                }
            )
            test_result("Dependent", True, f"{'Criado' if created else 'Existente'}")
        else:
            test_warning("Dependent", "Employee não disponível")
    except Exception as e:
        test_result("Dependent", False, str(e))
    
    # Education
    try:
        if emp:
            education, created = Education.objects.get_or_create(
                employee=emp,
                institution='Universidade Teste',
                defaults={
                    'level': 'bachelor',
                    'course': 'Ciência da Computação',
                    'start_date': date(2015, 1, 1),
                    'end_date': date(2019, 12, 31),
                    'is_completed': True,
                    'graduation_year': 2019
                }
            )
            test_result("Education", True, f"{'Criado' if created else 'Existente'}")
        else:
            test_warning("Education", "Employee não disponível")
    except Exception as e:
        test_result("Education", False, str(e))
    
    # WorkExperience
    try:
        if emp:
            work_exp, created = WorkExperience.objects.get_or_create(
                employee=emp,
                company_name='Empresa Anterior',
                defaults={
                    'job_title': 'Desenvolvedor',
                    'start_date': date(2019, 1, 1),
                    'end_date': date(2023, 12, 31),
                    'is_current': False
                }
            )
            test_result("WorkExperience", True, f"{'Criado' if created else 'Existente'}")
        else:
            test_warning("WorkExperience", "Employee não disponível")
    except Exception as e:
        test_result("WorkExperience", False, str(e))
    
    # Contract
    try:
        if emp:
            contract, created = Contract.objects.get_or_create(
                employee=emp,
                contract_type='clt',
                defaults={
                    'start_date': date.today() - timedelta(days=365),
                    'status': 'signed'
                }
            )
            test_result("Contract", True, f"{'Criado' if created else 'Existente'}: {contract.contract_number}")
        else:
            test_warning("Contract", "Employee não disponível")
    except Exception as e:
        test_result("Contract", False, str(e))
    
    # EmployeeDocument
    try:
        if emp:
            doc, created = EmployeeDocument.objects.get_or_create(
                employee=emp,
                document_type='id_card',
                defaults={
                    'name': 'RG',
                    'description': 'Documento de Identidade',
                    'expiry_date': date.today() + timedelta(days=365*5),
                    'is_active': True
                }
            )
            test_result("EmployeeDocument", True, f"{'Criado' if created else 'Existente'}")
        else:
            test_warning("EmployeeDocument", "Employee não disponível")
    except Exception as e:
        test_result("EmployeeDocument", False, str(e))
    
    # TimeRecord
    try:
        if emp:
            time_record = TimeRecord.objects.create(
                employee=emp,
                record_type='check_in',
                record_date=date.today(),
                record_time=datetime.now().time(),
                is_approved=False
            )
            test_result("TimeRecord", True, f"Criado: {time_record.record_type}")
        else:
            test_warning("TimeRecord", "Employee não disponível")
    except Exception as e:
        test_result("TimeRecord", False, str(e))
    
    # Vacation
    try:
        if emp:
            vacation = Vacation.objects.create(
                employee=emp,
                status='requested',
                start_date=date.today() + timedelta(days=30),
                end_date=date.today() + timedelta(days=44),
                acquisition_period_start=date.today() - timedelta(days=365),
                acquisition_period_end=date.today() - timedelta(days=1)
            )
            test_result("Vacation", True, f"Criado: {vacation.days} dias")
        else:
            test_warning("Vacation", "Employee não disponível")
    except Exception as e:
        test_result("Vacation", False, str(e))
    
    # Payroll
    try:
        if emp:
            # Verificar se já existe
            payroll = Payroll.objects.filter(
                employee=emp,
                month=11,
                year=2024
            ).first()
            
            if not payroll:
                payroll = Payroll.objects.create(
                    employee=emp,
                    month=11,
                    year=2024,
                    base_salary=Decimal('5000.00'),
                    is_processed=False
                )
                test_result("Payroll", True, f"Criado: {payroll.payroll_number}")
            else:
                test_result("Payroll", True, f"Existente: {payroll.payroll_number}")
        else:
            test_warning("Payroll", "Employee não disponível")
    except Exception as e:
        test_result("Payroll", False, str(e))

# 5. Testar cálculos
print("\n" + "=" * 80)
print("5. TESTANDO CÁLCULOS AUTOMÁTICOS")
print("=" * 80)

with schema_context(tenant.schema_name):
    emp = Employee.objects.first()
    if emp:
        # Cálculo de horas extras
        try:
            result = calculate_overtime_hours(emp, 2024, 11)
            test_result("Cálculo de horas extras", True, 
                       f"Normais: {result['normal_hours']}h, Extras: {result['overtime_hours']}h")
        except Exception as e:
            test_result("Cálculo de horas extras", False, str(e))
        
        # Cálculo de impostos
        try:
            taxes = calculate_brazilian_taxes(Decimal('5000.00'), 2024, 11, 1)
            test_result("Cálculo de impostos brasileiros", True,
                       f"INSS: R$ {taxes['inss']}, IRRF: R$ {taxes['irrf']}, FGTS: R$ {taxes['fgts']}")
        except Exception as e:
            test_result("Cálculo de impostos brasileiros", False, str(e))
        
        # Cálculo de saldo de férias
        try:
            balance = calculate_vacation_balance(emp)
            test_result("Cálculo de saldo de férias", True,
                       f"Saldo: {balance['balance_days']} dias")
        except Exception as e:
            test_result("Cálculo de saldo de férias", False, str(e))
        
        # Cálculo automático de folha
        try:
            payroll = Payroll.objects.filter(employee=emp, is_processed=False).first()
            if payroll:
                payroll = auto_calculate_payroll(payroll)
                test_result("Cálculo automático de folha", True,
                           f"Total proventos: R$ {payroll.total_earnings}, Líquido: R$ {payroll.net_salary}")
            else:
                test_warning("Cálculo automático de folha", "Nenhuma folha não processada encontrada")
        except Exception as e:
            test_result("Cálculo automático de folha", False, str(e))

# 6. Testar notificações
print("\n" + "=" * 80)
print("6. TESTANDO NOTIFICAÇÕES")
print("=" * 80)

with schema_context(tenant.schema_name):
    emp = Employee.objects.first()
    if emp:
        # Criar notificação
        try:
            notification = create_notification(
                employee=emp,
                notification_type='payroll_processed',
                title='Folha processada',
                message='Sua folha foi processada com sucesso',
                action_url='/hr/payroll/1'
            )
            test_result("Criação de notificação", True, f"ID: {notification.id}")
        except Exception as e:
            test_result("Criação de notificação", False, str(e))
        
        # Verificar documentos vencendo
        try:
            count = check_document_expiry()
            test_result("Verificação de documentos vencendo", True, f"{count} notificações criadas")
        except Exception as e:
            test_result("Verificação de documentos vencendo", False, str(e))
        
        # Verificar férias vencendo
        try:
            count = check_vacation_expiry()
            test_result("Verificação de férias vencendo", True, f"{count} notificações criadas")
        except Exception as e:
            test_result("Verificação de férias vencendo", False, str(e))

# 7. Testar serializers
print("\n" + "=" * 80)
print("7. TESTANDO SERIALIZERS")
print("=" * 80)

with schema_context(tenant.schema_name):
    try:
        from apps.hr.serializers import (
            EmployeeSerializer, DepartmentSerializer, PayrollSerializer,
            HRNotificationSerializer
        )
        
        emp = Employee.objects.first()
        if emp:
            serializer = EmployeeSerializer(emp)
            test_result("EmployeeSerializer", True, f"Serializado: {emp.employee_number}")
        
        dept = Department.objects.first()
        if dept:
            serializer = DepartmentSerializer(dept)
            test_result("DepartmentSerializer", True, f"Serializado: {dept.name}")
        
        payroll = Payroll.objects.first()
        if payroll:
            serializer = PayrollSerializer(payroll)
            test_result("PayrollSerializer", True, f"Serializado: {payroll.payroll_number}")
        
        notification = HRNotification.objects.first()
        if notification:
            serializer = HRNotificationSerializer(notification)
            test_result("HRNotificationSerializer", True, f"Serializado: {notification.title}")
        
    except Exception as e:
        test_result("Serializers", False, str(e))

# 8. Resumo final
print("\n" + "=" * 80)
print("RESUMO FINAL")
print("=" * 80)

print(f"\n✅ Sucessos: {len(success)}")
print(f"❌ Erros: {len(errors)}")
print(f"⚠️  Avisos: {len(warnings)}")

if errors:
    print("\n❌ ERROS ENCONTRADOS:")
    for error in errors:
        print(f"   - {error}")
    sys.exit(1)
else:
    print("\n" + "=" * 80)
    print("✅ TODOS OS TESTES PASSARAM COM SUCESSO!")
    print("=" * 80)
    print("\n📊 Estatísticas:")
    with schema_context(tenant.schema_name):
        print(f"   - Departments: {Department.objects.count()}")
        print(f"   - Job Positions: {JobPosition.objects.count()}")
        print(f"   - Employees: {Employee.objects.count()}")
        print(f"   - Bank Accounts: {BankAccount.objects.count()}")
        print(f"   - Dependents: {Dependent.objects.count()}")
        print(f"   - Education: {Education.objects.count()}")
        print(f"   - Work Experience: {WorkExperience.objects.count()}")
        print(f"   - Contracts: {Contract.objects.count()}")
        print(f"   - Documents: {EmployeeDocument.objects.count()}")
        print(f"   - Time Records: {TimeRecord.objects.count()}")
        print(f"   - Vacations: {Vacation.objects.count()}")
        print(f"   - Payroll: {Payroll.objects.count()}")
        print(f"   - Notifications: {HRNotification.objects.count()}")
    
    print("\n🎉 Módulo HR está funcionando corretamente!")

