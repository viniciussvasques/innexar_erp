"""
Testes para o módulo HR (Recursos Humanos)
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django_tenants.utils import schema_context
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, datetime, timedelta
from decimal import Decimal

from apps.tenants.models import Tenant
from apps.users.models import Role, Module, Permission
from .models import (
    Department, Company, Employee, Benefit, EmployeeBenefit,
    TimeRecord, Vacation, PerformanceReview, Training, EmployeeTraining,
    JobOpening, Candidate, Payroll
)

User = get_user_model()


class HRTestCase(TestCase):
    """Base test case para testes HR"""
    
    def setUp(self):
        """Setup inicial para todos os testes"""
        # Criar tenant de teste
        self.tenant = Tenant.objects.create(
            name='Test Company',
            schema_name='testcompany',
            is_active=True
        )
        
        # Criar usuário admin
        with schema_context('public'):
            self.admin_user = User.objects.create_user(
                email='admin@test.com',
                username='admin',
                password='testpass123',
                is_staff=True,
                is_superuser=True
            )
            
            # Criar role e permissões
            self.hr_role = Role.objects.create(
                name='HR Manager',
                code='hr_manager',
                is_active=True
            )
            
            hr_module = Module.objects.get_or_create(
                code='hr',
                defaults={
                    'name': 'Human Resources',
                    'description': 'HR Module',
                    'is_active': True
                }
            )[0]
            
            Permission.objects.create(
                role=self.hr_role,
                module=hr_module,
                level='admin'
            )
            
            self.admin_user.roles.add(self.hr_role)
        
        # Criar dados no tenant
        with schema_context(self.tenant.schema_name):
            # Criar departamento
            self.department = Department.objects.create(
                name='Sales',
                code='SALES',
                description='Sales Department',
                is_active=True
            )
            
            # Criar funcionário
            self.employee = Employee.objects.create(
                user=self.admin_user,
                employee_number='EMP-000001',
                job_title='Sales Manager',
                department=self.department,
                hire_date=date.today() - timedelta(days=365),
                base_salary=Decimal('5000.00'),
                status='active'
            )
        
        # Criar cliente API
        self.client = APIClient()
        self.client.force_authenticate(user=self.admin_user)
        # Configurar formato JSON para todas as requisições
        self.client.force_authenticate(user=self.admin_user)


class DepartmentTestCase(HRTestCase):
    """Testes para Department"""
    
    def test_create_department(self):
        """Testar criação de departamento"""
        with schema_context(self.tenant.schema_name):
            data = {
                'name': 'IT',
                'code': 'IT',
                'description': 'IT Department',
                'is_active': True
            }
            response = self.client.post('/api/v1/hr/departments/', data)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(Department.objects.count(), 2)
    
    def test_list_departments(self):
        """Testar listagem de departamentos"""
        with schema_context(self.tenant.schema_name):
            response = self.client.get('/api/v1/hr/departments/')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertGreaterEqual(len(response.data['results']), 1)
    
    def test_filter_active_only(self):
        """Testar filtro active_only"""
        with schema_context(self.tenant.schema_name):
            Department.objects.create(
                name='Inactive',
                code='INACTIVE',
                is_active=False
            )
            response = self.client.get('/api/v1/hr/departments/?active_only=true')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            for dept in response.data['results']:
                self.assertTrue(dept['is_active'])


class BenefitTestCase(HRTestCase):
    """Testes para Benefit"""
    
    def test_create_benefit(self):
        """Testar criação de benefício"""
        with schema_context(self.tenant.schema_name):
            data = {
                'name': 'Vale Refeição',
                'benefit_type': 'meal_voucher',
                'description': 'Vale refeição mensal',
                'value': Decimal('500.00'),
                'limit': Decimal('600.00'),
                'is_active': True
            }
            response = self.client.post('/api/v1/hr/benefits/', data)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(Benefit.objects.count(), 1)
    
    def test_list_benefits(self):
        """Testar listagem de benefícios"""
        with schema_context(self.tenant.schema_name):
            Benefit.objects.create(
                name='Plano de Saúde',
                benefit_type='health_insurance',
                is_active=True
            )
            response = self.client.get('/api/v1/hr/benefits/')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertGreaterEqual(len(response.data['results']), 1)


class EmployeeBenefitTestCase(HRTestCase):
    """Testes para EmployeeBenefit"""
    
    def setUp(self):
        super().setUp()
        with schema_context(self.tenant.schema_name):
            self.benefit = Benefit.objects.create(
                name='Vale Refeição',
                benefit_type='meal_voucher',
                value=Decimal('500.00'),
                is_active=True
            )
    
    def test_create_employee_benefit(self):
        """Testar criação de benefício do funcionário"""
        with schema_context(self.tenant.schema_name):
            data = {
                'employee': self.employee.id,
                'benefit': self.benefit.id,
                'value': Decimal('500.00'),
                'start_date': date.today(),
                'is_active': True
            }
            response = self.client.post('/api/v1/hr/employee-benefits/', data)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(EmployeeBenefit.objects.count(), 1)


class TimeRecordTestCase(HRTestCase):
    """Testes para TimeRecord"""
    
    def test_create_time_record(self):
        """Testar criação de registro de ponto"""
        with schema_context(self.tenant.schema_name):
            data = {
                'employee': self.employee.id,
                'record_type': 'check_in',
                'record_date': date.today(),
                'record_time': datetime.now().time(),
                'is_approved': False
            }
            response = self.client.post('/api/v1/hr/time-records/', data)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(TimeRecord.objects.count(), 1)
    
    def test_approve_time_record(self):
        """Testar aprovação de registro de ponto"""
        with schema_context(self.tenant.schema_name):
            time_record = TimeRecord.objects.create(
                employee=self.employee,
                record_type='check_in',
                record_date=date.today(),
                record_time=datetime.now().time(),
                is_approved=False
            )
            response = self.client.post(f'/api/v1/hr/time-records/{time_record.id}/approve/')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            time_record.refresh_from_db()
            self.assertTrue(time_record.is_approved)
            self.assertEqual(time_record.approved_by, self.admin_user)


class VacationTestCase(HRTestCase):
    """Testes para Vacation"""
    
    def test_create_vacation(self):
        """Testar criação de solicitação de férias"""
        with schema_context(self.tenant.schema_name):
            data = {
                'employee': self.employee.id,
                'status': 'requested',
                'start_date': date.today() + timedelta(days=30),
                'end_date': date.today() + timedelta(days=44),
                'days': 15,
                'acquisition_period_start': date.today() - timedelta(days=365),
                'acquisition_period_end': date.today() - timedelta(days=1),
                'sell_days': 0,
                'cash_allowance': False
            }
            response = self.client.post('/api/v1/hr/vacations/', data)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(Vacation.objects.count(), 1)
    
    def test_approve_vacation(self):
        """Testar aprovação de férias"""
        with schema_context(self.tenant.schema_name):
            vacation = Vacation.objects.create(
                employee=self.employee,
                status='requested',
                start_date=date.today() + timedelta(days=30),
                end_date=date.today() + timedelta(days=44),
                days=15,
                acquisition_period_start=date.today() - timedelta(days=365),
                acquisition_period_end=date.today() - timedelta(days=1)
            )
            response = self.client.post(f'/api/v1/hr/vacations/{vacation.id}/approve/')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            vacation.refresh_from_db()
            self.assertEqual(vacation.status, 'approved')
            self.assertEqual(vacation.approved_by, self.admin_user)
    
    def test_reject_vacation(self):
        """Testar rejeição de férias"""
        with schema_context(self.tenant.schema_name):
            vacation = Vacation.objects.create(
                employee=self.employee,
                status='requested',
                start_date=date.today() + timedelta(days=30),
                end_date=date.today() + timedelta(days=44),
                days=15,
                acquisition_period_start=date.today() - timedelta(days=365),
                acquisition_period_end=date.today() - timedelta(days=1)
            )
            data = {'rejection_reason': 'Período indisponível'}
            response = self.client.post(f'/api/v1/hr/vacations/{vacation.id}/reject/', data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            vacation.refresh_from_db()
            self.assertEqual(vacation.status, 'rejected')
            self.assertEqual(vacation.rejection_reason, 'Período indisponível')


class PerformanceReviewTestCase(HRTestCase):
    """Testes para PerformanceReview"""
    
    def test_create_performance_review(self):
        """Testar criação de avaliação de desempenho"""
        with schema_context(self.tenant.schema_name):
            data = {
                'employee': self.employee.id,
                'reviewer': self.employee.id,
                'review_period_start': date.today() - timedelta(days=90),
                'review_period_end': date.today(),
                'review_date': date.today(),
                'status': 'draft',
                'criteria_scores': {'quality': 8.5, 'productivity': 9.0},
                'overall_score': Decimal('8.75'),
                'strengths': 'Excelente trabalho',
                'areas_for_improvement': 'Comunicação',
                'goals': 'Melhorar comunicação',
                'development_plan': 'Curso de comunicação'
            }
            response = self.client.post('/api/v1/hr/performance-reviews/', data)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(PerformanceReview.objects.count(), 1)


class TrainingTestCase(HRTestCase):
    """Testes para Training"""
    
    def test_create_training(self):
        """Testar criação de treinamento"""
        with schema_context(self.tenant.schema_name):
            data = {
                'name': 'Curso de Vendas',
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
            response = self.client.post('/api/v1/hr/trainings/', data)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(Training.objects.count(), 1)
    
    def test_enroll_employee(self):
        """Testar inscrição de funcionário em treinamento"""
        with schema_context(self.tenant.schema_name):
            training = Training.objects.create(
                name='Curso de Vendas',
                training_type='Internal',
                is_active=True
            )
            data = {'employee_id': self.employee.id}
            response = self.client.post(f'/api/v1/hr/trainings/{training.id}/enroll/', data)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(EmployeeTraining.objects.count(), 1)


class JobOpeningTestCase(HRTestCase):
    """Testes para JobOpening"""
    
    def test_create_job_opening(self):
        """Testar criação de vaga"""
        with schema_context(self.tenant.schema_name):
            data = {
                'title': 'Desenvolvedor Python',
                'department': self.department.id,
                'description': 'Vaga para desenvolvedor Python sênior',
                'requirements': 'Python, Django, REST API',
                'salary_min': Decimal('8000.00'),
                'salary_max': Decimal('12000.00'),
                'status': 'open'
            }
            response = self.client.post('/api/v1/hr/job-openings/', data)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(JobOpening.objects.count(), 1)


class CandidateTestCase(HRTestCase):
    """Testes para Candidate"""
    
    def setUp(self):
        super().setUp()
        with schema_context(self.tenant.schema_name):
            self.job_opening = JobOpening.objects.create(
                title='Desenvolvedor Python',
                department=self.department,
                description='Vaga para desenvolvedor',
                status='open'
            )
    
    def test_create_candidate(self):
        """Testar criação de candidato"""
        with schema_context(self.tenant.schema_name):
            data = {
                'first_name': 'João',
                'last_name': 'Silva',
                'email': 'joao@example.com',
                'phone': '11999999999',
                'job_opening': self.job_opening.id,
                'status': 'applied',
                'notes': 'Candidato interessado'
            }
            response = self.client.post('/api/v1/hr/candidates/', data)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(Candidate.objects.count(), 1)


class PayrollTestCase(HRTestCase):
    """Testes para Payroll"""
    
    def test_list_payroll(self):
        """Testar listagem de folhas de pagamento"""
        with schema_context(self.tenant.schema_name):
            Payroll.objects.create(
                payroll_number='PAY-2024-11-EMP-000001',
                employee=self.employee,
                month=11,
                year=2024,
                base_salary=Decimal('5000.00'),
                total_earnings=Decimal('5000.00'),
                total_deductions=Decimal('1000.00'),
                net_salary=Decimal('4000.00'),
                is_processed=True
            )
            response = self.client.get('/api/v1/hr/payroll/')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertGreaterEqual(len(response.data['results']), 1)
    
    def test_process_payroll(self):
        """Testar processamento de folha"""
        with schema_context(self.tenant.schema_name):
            data = {
                'employee_ids': [self.employee.id],
                'month': 11,
                'year': 2024
            }
            response = self.client.post('/api/v1/hr/payroll/process/', data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertIn('processed', response.data)
            self.assertEqual(Payroll.objects.count(), 1)
            
            payroll = Payroll.objects.first()
            self.assertTrue(payroll.is_processed)
            self.assertEqual(payroll.employee, self.employee)
            self.assertEqual(payroll.month, 11)
            self.assertEqual(payroll.year, 2024)


class EmployeeTestCase(HRTestCase):
    """Testes para Employee"""
    
    def test_list_employees(self):
        """Testar listagem de funcionários"""
        with schema_context(self.tenant.schema_name):
            response = self.client.get('/api/v1/hr/employees/')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertGreaterEqual(len(response.data['results']), 1)
    
    def test_get_employee_by_user(self):
        """Testar obtenção de funcionário por user_id"""
        with schema_context(self.tenant.schema_name):
            response = self.client.get(f'/api/v1/hr/employees/by_user/?user_id={self.admin_user.id}')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data['employee_number'], 'EMP-000001')
    
    def test_filter_by_department(self):
        """Testar filtro por departamento"""
        with schema_context(self.tenant.schema_name):
            response = self.client.get(f'/api/v1/hr/employees/?department_id={self.department.id}')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            for emp in response.data['results']:
                self.assertEqual(emp['department'], self.department.id)
    
    def test_filter_by_status(self):
        """Testar filtro por status"""
        with schema_context(self.tenant.schema_name):
            response = self.client.get('/api/v1/hr/employees/?status=active')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            for emp in response.data['results']:
                self.assertEqual(emp['status'], 'active')


class CompanyTestCase(HRTestCase):
    """Testes para Company"""
    
    def setUp(self):
        super().setUp()
        with schema_context(self.tenant.schema_name):
            # Criar empresa
            self.company = Company.objects.create(
                legal_name='Test Company LLC',
                trade_name='TestCo',
                company_type='llc',
                ein='12-3456789',
                address='123 Main St',
                city='New York',
                state='NY',
                zip_code='10001',
                country='USA',
                owner=self.employee,
                is_active=True
            )
    
    def test_create_company(self):
        """Testar criação de empresa"""
        with schema_context(self.tenant.schema_name):
            data = {
                'legal_name': 'Another Company LLC',
                'trade_name': 'AnotherCo',
                'company_type': 's_corp',
                'ein': '98-7654321',
                'address': '456 Oak Ave',
                'city': 'Los Angeles',
                'state': 'CA',
                'zip_code': '90001',
                'country': 'USA',
                'owner': self.employee.id,
                'is_active': True
            }
            response = self.client.post('/api/v1/hr/companies/', data)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(Company.objects.count(), 2)
    
    def test_list_companies(self):
        """Testar listagem de empresas"""
        with schema_context(self.tenant.schema_name):
            response = self.client.get('/api/v1/hr/companies/')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertGreaterEqual(len(response.data['results']), 1)
    
    def test_filter_by_owner(self):
        """Testar filtro por proprietário"""
        with schema_context(self.tenant.schema_name):
            response = self.client.get(f'/api/v1/hr/companies/?owner_id={self.employee.id}')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            for company in response.data['results']:
                self.assertEqual(company['owner'], self.employee.id)

