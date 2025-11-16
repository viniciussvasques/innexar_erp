#!/usr/bin/env python
"""
Teste completo de todas as APIs do módulo HR
Execute: python manage.py shell < test_hr_all_apis.py
OU: python -m django shell < test_hr_all_apis.py
"""
import os
import sys
import django
import requests
import json
from datetime import date, timedelta
from typing import Dict, List, Optional

# Configurar Django
if __name__ == "__main__":
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    django.setup()

from django_tenants.utils import schema_context
from apps.tenants.models import Tenant

# Configurações
BASE_URL = "http://localhost:8000"
EMAIL = "john@acme.com"
PASSWORD = "Test@123"

# Cores para output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

class HRAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.token = None
        self.headers = {}
        self.tenant_domain = None
        self.test_data = {}
        self.results = {
            'passed': 0,
            'failed': 0,
            'errors': []
        }
    
    def print_header(self, text):
        print(f"\n{Colors.BLUE}{'='*80}{Colors.RESET}")
        print(f"{Colors.BLUE}{text}{Colors.RESET}")
        print(f"{Colors.BLUE}{'='*80}{Colors.RESET}")
    
    def print_success(self, text):
        print(f"{Colors.GREEN}✅ {text}{Colors.RESET}")
        self.results['passed'] += 1
    
    def print_error(self, text):
        print(f"{Colors.RED}❌ {text}{Colors.RESET}")
        self.results['failed'] += 1
        self.results['errors'].append(text)
    
    def print_info(self, text):
        print(f"{Colors.YELLOW}ℹ️  {text}{Colors.RESET}")
    
    def test_request(self, method, url, data=None, expected_status=200, description=""):
        """Faz uma requisição e verifica o resultado"""
        try:
            if method.upper() == 'GET':
                response = requests.get(url, headers=self.headers)
            elif method.upper() == 'POST':
                response = requests.post(url, json=data, headers=self.headers)
            elif method.upper() == 'PUT':
                response = requests.put(url, json=data, headers=self.headers)
            elif method.upper() == 'PATCH':
                response = requests.patch(url, json=data, headers=self.headers)
            elif method.upper() == 'DELETE':
                response = requests.delete(url, headers=self.headers)
            else:
                raise ValueError(f"Método {method} não suportado")
            
            if response.status_code == expected_status:
                self.print_success(f"{description} - Status: {response.status_code}")
                try:
                    return response.json()
                except:
                    return response.text
            else:
                error_msg = f"{description} - Esperado {expected_status}, recebido {response.status_code}"
                if response.text:
                    try:
                        error_data = response.json()
                        error_msg += f" - {error_data}"
                    except:
                        error_msg += f" - {response.text[:200]}"
                self.print_error(error_msg)
                return None
        except Exception as e:
            self.print_error(f"{description} - Erro: {str(e)}")
            return None
    
    def login(self):
        """Faz login e obtém token"""
        self.print_header("🔐 AUTENTICAÇÃO")
        
        # Tentar descobrir o tenant
        with schema_context('public'):
            try:
                # Buscar tenant pelo email do usuário
                user_tenant = None
                for tenant in Tenant.objects.all():
                    with schema_context(tenant.schema_name):
                        from apps.users.models import User
                        try:
                            user = User.objects.get(email=EMAIL)
                            user_tenant = tenant
                            break
                        except:
                            continue
                
                if not user_tenant:
                    self.print_error("Tenant não encontrado para o usuário")
                    return False
                
                self.tenant_domain = user_tenant.domain_url or f"{user_tenant.schema_name}.localhost"
                self.print_info(f"Tenant encontrado: {self.tenant_domain}")
            except Exception as e:
                self.print_error(f"Erro ao buscar tenant: {str(e)}")
                return False
        
        # Login
        login_url = f"{self.base_url}/api/v1/public/auth/login/"
        login_data = {"email": EMAIL, "password": PASSWORD}
        
        response = requests.post(login_url, json=login_data)
        
        if response.status_code == 200:
            data = response.json()
            self.token = data.get('access') or data.get('token')
            if self.token:
                self.headers = {
                    'Authorization': f'Bearer {self.token}',
                    'Content-Type': 'application/json'
                }
                self.print_success("Login realizado com sucesso")
                return True
            else:
                self.print_error("Token não encontrado na resposta")
                return False
        else:
            self.print_error(f"Falha no login: {response.status_code} - {response.text}")
            return False
    
    def test_departments(self):
        """Testa CRUD de Departamentos"""
        self.print_header("📁 DEPARTAMENTOS")
        api_base = f"{self.base_url}/api/v1/hr/departments"
        
        # CREATE
        data = {
            "name": "Test Department",
            "code": "TEST-DEPT",
            "description": "Department for testing",
            "is_active": True
        }
        result = self.test_request('POST', api_base, data, 201, "Criar departamento")
        if result:
            dept_id = result.get('id')
            self.test_data['department_id'] = dept_id
            
            # READ
            self.test_request('GET', f"{api_base}/{dept_id}", expected_status=200, description="Ler departamento")
            self.test_request('GET', api_base, expected_status=200, description="Listar departamentos")
            
            # UPDATE
            update_data = {"name": "Updated Test Department"}
            self.test_request('PATCH', f"{api_base}/{dept_id}", update_data, 200, "Atualizar departamento")
            
            # DELETE
            self.test_request('DELETE', f"{api_base}/{dept_id}", expected_status=204, description="Deletar departamento")
    
    def test_job_positions(self):
        """Testa CRUD de Cargos"""
        self.print_header("💼 CARGOS")
        api_base = f"{self.base_url}/api/v1/hr/job-positions"
        
        # Criar departamento primeiro se necessário
        if 'department_id' not in self.test_data:
            dept_data = {"name": "Test Dept", "code": "TEST", "is_active": True}
            dept = self.test_request('POST', f"{self.base_url}/api/v1/hr/departments", dept_data, 201, "Criar departamento para cargo")
            if dept:
                self.test_data['department_id'] = dept.get('id')
        
        # CREATE
        data = {
            "code": "TEST-POS",
            "name": "Test Position",
            "department_id": self.test_data.get('department_id'),
            "level": "junior",
            "salary_min": "3000.00",
            "salary_max": "5000.00",
            "is_active": True
        }
        result = self.test_request('POST', api_base, data, 201, "Criar cargo")
        if result:
            pos_id = result.get('id')
            self.test_data['job_position_id'] = pos_id
            
            # READ
            self.test_request('GET', f"{api_base}/{pos_id}", expected_status=200, description="Ler cargo")
            self.test_request('GET', api_base, expected_status=200, description="Listar cargos")
            
            # UPDATE
            update_data = {"name": "Updated Test Position"}
            self.test_request('PATCH', f"{api_base}/{pos_id}", update_data, 200, "Atualizar cargo")
    
    def test_companies(self):
        """Testa CRUD de Empresas"""
        self.print_header("🏢 EMPRESAS")
        api_base = f"{self.base_url}/api/v1/hr/companies"
        
        # CREATE
        data = {
            "legal_name": "Test Company",
            "trade_name": "Test Co",
            "tax_id": "12345678901234",
            "is_active": True
        }
        result = self.test_request('POST', api_base, data, 201, "Criar empresa")
        if result:
            company_id = result.get('id')
            self.test_data['company_id'] = company_id
            
            # READ
            self.test_request('GET', f"{api_base}/{company_id}", expected_status=200, description="Ler empresa")
            self.test_request('GET', api_base, expected_status=200, description="Listar empresas")
            
            # UPDATE
            update_data = {"trade_name": "Updated Test Co"}
            self.test_request('PATCH', f"{api_base}/{company_id}", update_data, 200, "Atualizar empresa")
    
    def test_employees(self):
        """Testa CRUD de Funcionários"""
        self.print_header("👤 FUNCIONÁRIOS")
        api_base = f"{self.base_url}/api/v1/hr/employees"
        
        # Garantir que temos dados necessários
        if 'department_id' not in self.test_data:
            dept_data = {"name": "Test Dept", "code": "TEST", "is_active": True}
            dept = self.test_request('POST', f"{self.base_url}/api/v1/hr/departments", dept_data, 201, "Criar departamento")
            if dept:
                self.test_data['department_id'] = dept.get('id')
        
        if 'job_position_id' not in self.test_data:
            pos_data = {
                "code": "TEST-POS",
                "name": "Test Position",
                "department_id": self.test_data.get('department_id'),
                "level": "junior",
                "is_active": True
            }
            pos = self.test_request('POST', f"{self.base_url}/api/v1/hr/job-positions", pos_data, 201, "Criar cargo")
            if pos:
                self.test_data['job_position_id'] = pos.get('id')
        
        # CREATE
        data = {
            "user_id": None,  # Será criado automaticamente ou usar user existente
            "department_id": self.test_data.get('department_id'),
            "job_position_id": self.test_data.get('job_position_id'),
            "contract_type": "w2_employee",
            "hire_type": "individual",
            "hire_date": str(date.today()),
            "status": "active",
            "base_salary": "5000.00"
        }
        result = self.test_request('POST', api_base, data, 201, "Criar funcionário")
        if result:
            emp_id = result.get('id')
            self.test_data['employee_id'] = emp_id
            
            # READ
            self.test_request('GET', f"{api_base}/{emp_id}", expected_status=200, description="Ler funcionário")
            self.test_request('GET', api_base, expected_status=200, description="Listar funcionários")
            
            # Ação customizada: by_user
            if result.get('user_id'):
                self.test_request('GET', f"{api_base}/by_user/?user_id={result.get('user_id')}", expected_status=200, description="Buscar funcionário por user_id")
            
            # UPDATE
            update_data = {"base_salary": "5500.00"}
            self.test_request('PATCH', f"{api_base}/{emp_id}", update_data, 200, "Atualizar funcionário")
    
    def test_bank_accounts(self):
        """Testa CRUD de Contas Bancárias"""
        self.print_header("🏦 CONTAS BANCÁRIAS")
        api_base = f"{self.base_url}/api/v1/hr/bank-accounts"
        
        if 'employee_id' not in self.test_data:
            self.print_info("Pulando teste - funcionário não criado")
            return
        
        # CREATE
        data = {
            "employee_id": self.test_data['employee_id'],
            "bank_name": "Test Bank",
            "account_type": "checking",
            "account_number": "12345-6",
            "agency": "0001",
            "is_active": True
        }
        result = self.test_request('POST', api_base, data, 201, "Criar conta bancária")
        if result:
            account_id = result.get('id')
            
            # READ
            self.test_request('GET', f"{api_base}/{account_id}", expected_status=200, description="Ler conta bancária")
            self.test_request('GET', api_base, expected_status=200, description="Listar contas bancárias")
            
            # UPDATE
            update_data = {"bank_name": "Updated Bank"}
            self.test_request('PATCH', f"{api_base}/{account_id}", update_data, 200, "Atualizar conta bancária")
    
    def test_dependents(self):
        """Testa CRUD de Dependentes"""
        self.print_header("👨‍👩‍👧 DEPENDENTES")
        api_base = f"{self.base_url}/api/v1/hr/dependents"
        
        if 'employee_id' not in self.test_data:
            self.print_info("Pulando teste - funcionário não criado")
            return
        
        # CREATE
        data = {
            "employee_id": self.test_data['employee_id'],
            "name": "Test Dependent",
            "date_of_birth": str(date.today() - timedelta(days=365*10)),
            "relationship": "son",
            "is_tax_dependent": True,
            "is_active": True
        }
        result = self.test_request('POST', api_base, data, 201, "Criar dependente")
        if result:
            dep_id = result.get('id')
            
            # READ
            self.test_request('GET', f"{api_base}/{dep_id}", expected_status=200, description="Ler dependente")
            self.test_request('GET', api_base, expected_status=200, description="Listar dependentes")
            
            # UPDATE
            update_data = {"name": "Updated Dependent"}
            self.test_request('PATCH', f"{api_base}/{dep_id}", update_data, 200, "Atualizar dependente")
    
    def test_educations(self):
        """Testa CRUD de Educação"""
        self.print_header("🎓 EDUCAÇÃO")
        api_base = f"{self.base_url}/api/v1/hr/educations"
        
        if 'employee_id' not in self.test_data:
            self.print_info("Pulando teste - funcionário não criado")
            return
        
        # CREATE
        data = {
            "employee_id": self.test_data['employee_id'],
            "education_level": "bachelor",
            "institution": "Test University",
            "field_of_study": "Computer Science",
            "start_date": str(date.today() - timedelta(days=365*5)),
            "end_date": str(date.today() - timedelta(days=365*2)),
            "is_completed": True
        }
        result = self.test_request('POST', api_base, data, 201, "Criar educação")
        if result:
            edu_id = result.get('id')
            
            # READ
            self.test_request('GET', f"{api_base}/{edu_id}", expected_status=200, description="Ler educação")
            self.test_request('GET', api_base, expected_status=200, description="Listar educações")
    
    def test_work_experiences(self):
        """Testa CRUD de Experiência Profissional"""
        self.print_header("💼 EXPERIÊNCIA PROFISSIONAL")
        api_base = f"{self.base_url}/api/v1/hr/work-experiences"
        
        if 'employee_id' not in self.test_data:
            self.print_info("Pulando teste - funcionário não criado")
            return
        
        # CREATE
        data = {
            "employee_id": self.test_data['employee_id'],
            "company_name": "Previous Company",
            "job_title": "Developer",
            "start_date": str(date.today() - timedelta(days=365*3)),
            "end_date": str(date.today() - timedelta(days=365)),
            "is_current": False
        }
        result = self.test_request('POST', api_base, data, 201, "Criar experiência")
        if result:
            exp_id = result.get('id')
            
            # READ
            self.test_request('GET', f"{api_base}/{exp_id}", expected_status=200, description="Ler experiência")
            self.test_request('GET', api_base, expected_status=200, description="Listar experiências")
    
    def test_benefits(self):
        """Testa CRUD de Benefícios"""
        self.print_header("🎁 BENEFÍCIOS")
        api_base = f"{self.base_url}/api/v1/hr/benefits"
        
        # CREATE
        data = {
            "name": "Test Benefit",
            "benefit_type": "health_insurance",
            "value": "500.00",
            "is_active": True
        }
        result = self.test_request('POST', api_base, data, 201, "Criar benefício")
        if result:
            benefit_id = result.get('id')
            self.test_data['benefit_id'] = benefit_id
            
            # READ
            self.test_request('GET', f"{api_base}/{benefit_id}", expected_status=200, description="Ler benefício")
            self.test_request('GET', api_base, expected_status=200, description="Listar benefícios")
            
            # UPDATE
            update_data = {"name": "Updated Benefit"}
            self.test_request('PATCH', f"{api_base}/{benefit_id}", update_data, 200, "Atualizar benefício")
    
    def test_employee_benefits(self):
        """Testa CRUD de Benefícios de Funcionário"""
        self.print_header("👤🎁 BENEFÍCIOS DE FUNCIONÁRIO")
        api_base = f"{self.base_url}/api/v1/hr/employee-benefits"
        
        if 'employee_id' not in self.test_data or 'benefit_id' not in self.test_data:
            self.print_info("Pulando teste - dados necessários não criados")
            return
        
        # CREATE
        data = {
            "employee_id": self.test_data['employee_id'],
            "benefit_id": self.test_data['benefit_id'],
            "start_date": str(date.today()),
            "is_active": True
        }
        result = self.test_request('POST', api_base, data, 201, "Criar benefício de funcionário")
        if result:
            eb_id = result.get('id')
            
            # READ
            self.test_request('GET', f"{api_base}/{eb_id}", expected_status=200, description="Ler benefício de funcionário")
            self.test_request('GET', api_base, expected_status=200, description="Listar benefícios de funcionários")
    
    def test_time_records(self):
        """Testa CRUD de Registros de Ponto"""
        self.print_header("⏰ REGISTROS DE PONTO")
        api_base = f"{self.base_url}/api/v1/hr/time-records"
        
        if 'employee_id' not in self.test_data:
            self.print_info("Pulando teste - funcionário não criado")
            return
        
        # CREATE
        data = {
            "employee_id": self.test_data['employee_id'],
            "record_type": "check_in",
            "record_date": str(date.today()),
            "record_time": "09:00:00"
        }
        result = self.test_request('POST', api_base, data, 201, "Criar registro de ponto")
        if result:
            record_id = result.get('id')
            
            # READ
            self.test_request('GET', f"{api_base}/{record_id}", expected_status=200, description="Ler registro")
            self.test_request('GET', api_base, expected_status=200, description="Listar registros")
            
            # Ação customizada: approve
            self.test_request('POST', f"{api_base}/{record_id}/approve/", expected_status=200, description="Aprovar registro")
            
            # Ação customizada: calculate_hours
            self.test_request('GET', f"{api_base}/calculate_hours/?employee_id={self.test_data['employee_id']}&start_date={date.today()}&end_date={date.today()}", expected_status=200, description="Calcular horas")
    
    def test_vacations(self):
        """Testa CRUD de Férias"""
        self.print_header("🏖️ FÉRIAS")
        api_base = f"{self.base_url}/api/v1/hr/vacations"
        
        if 'employee_id' not in self.test_data:
            self.print_info("Pulando teste - funcionário não criado")
            return
        
        # CREATE
        data = {
            "employee_id": self.test_data['employee_id'],
            "start_date": str(date.today() + timedelta(days=30)),
            "end_date": str(date.today() + timedelta(days=37)),
            "vacation_type": "annual",
            "status": "requested"
        }
        result = self.test_request('POST', api_base, data, 201, "Criar férias")
        if result:
            vac_id = result.get('id')
            
            # READ
            self.test_request('GET', f"{api_base}/{vac_id}", expected_status=200, description="Ler férias")
            self.test_request('GET', api_base, expected_status=200, description="Listar férias")
            
            # Ações customizadas: approve, reject
            self.test_request('POST', f"{api_base}/{vac_id}/approve/", expected_status=200, description="Aprovar férias")
            # Rejeitar requer um novo registro
            data2 = {
                "employee_id": self.test_data['employee_id'],
                "start_date": str(date.today() + timedelta(days=60)),
                "end_date": str(date.today() + timedelta(days=67)),
                "vacation_type": "annual",
                "status": "requested"
            }
            result2 = self.test_request('POST', api_base, data2, 201, "Criar segunda férias")
            if result2:
                self.test_request('POST', f"{api_base}/{result2.get('id')}/reject/", expected_status=200, description="Rejeitar férias")
    
    def test_performance_reviews(self):
        """Testa CRUD de Avaliações de Desempenho"""
        self.print_header("⭐ AVALIAÇÕES DE DESEMPENHO")
        api_base = f"{self.base_url}/api/v1/hr/performance-reviews"
        
        if 'employee_id' not in self.test_data:
            self.print_info("Pulando teste - funcionário não criado")
            return
        
        # CREATE
        data = {
            "employee_id": self.test_data['employee_id'],
            "review_date": str(date.today()),
            "review_period_start": str(date.today() - timedelta(days=365)),
            "review_period_end": str(date.today()),
            "overall_rating": 4.5,
            "status": "completed"
        }
        result = self.test_request('POST', api_base, data, 201, "Criar avaliação")
        if result:
            review_id = result.get('id')
            
            # READ
            self.test_request('GET', f"{api_base}/{review_id}", expected_status=200, description="Ler avaliação")
            self.test_request('GET', api_base, expected_status=200, description="Listar avaliações")
    
    def test_trainings(self):
        """Testa CRUD de Treinamentos"""
        self.print_header("📚 TREINAMENTOS")
        api_base = f"{self.base_url}/api/v1/hr/trainings"
        
        # CREATE
        data = {
            "name": "Test Training",
            "description": "Training for testing",
            "training_type": "internal",
            "duration_hours": 8,
            "is_active": True
        }
        result = self.test_request('POST', api_base, data, 201, "Criar treinamento")
        if result:
            training_id = result.get('id')
            self.test_data['training_id'] = training_id
            
            # READ
            self.test_request('GET', f"{api_base}/{training_id}", expected_status=200, description="Ler treinamento")
            self.test_request('GET', api_base, expected_status=200, description="Listar treinamentos")
    
    def test_employee_trainings(self):
        """Testa CRUD de Treinamentos de Funcionário"""
        self.print_header("👤📚 TREINAMENTOS DE FUNCIONÁRIO")
        api_base = f"{self.base_url}/api/v1/hr/employee-trainings"
        
        if 'employee_id' not in self.test_data or 'training_id' not in self.test_data:
            self.print_info("Pulando teste - dados necessários não criados")
            return
        
        # CREATE
        data = {
            "employee_id": self.test_data['employee_id'],
            "training_id": self.test_data['training_id'],
            "enrollment_date": str(date.today()),
            "status": "enrolled"
        }
        result = self.test_request('POST', api_base, data, 201, "Criar treinamento de funcionário")
        if result:
            et_id = result.get('id')
            
            # READ
            self.test_request('GET', f"{api_base}/{et_id}", expected_status=200, description="Ler treinamento de funcionário")
            self.test_request('GET', api_base, expected_status=200, description="Listar treinamentos de funcionários")
            
            # Ação customizada: enroll
            enroll_data = {
                "employee_id": self.test_data['employee_id'],
                "training_id": self.test_data['training_id']
            }
            self.test_request('POST', f"{api_base}/enroll/", enroll_data, 200, "Inscrever funcionário em treinamento")
    
    def test_job_openings(self):
        """Testa CRUD de Vagas"""
        self.print_header("💼 VAGAS")
        api_base = f"{self.base_url}/api/v1/hr/job-openings"
        
        if 'department_id' not in self.test_data:
            self.print_info("Pulando teste - departamento não criado")
            return
        
        # CREATE
        data = {
            "title": "Test Job Opening",
            "description": "Job opening for testing",
            "department_id": self.test_data['department_id'],
            "posted_date": str(date.today()),
            "status": "open"
        }
        result = self.test_request('POST', api_base, data, 201, "Criar vaga")
        if result:
            job_id = result.get('id')
            self.test_data['job_opening_id'] = job_id
            
            # READ
            self.test_request('GET', f"{api_base}/{job_id}", expected_status=200, description="Ler vaga")
            self.test_request('GET', api_base, expected_status=200, description="Listar vagas")
    
    def test_candidates(self):
        """Testa CRUD de Candidatos"""
        self.print_header("👔 CANDIDATOS")
        api_base = f"{self.base_url}/api/v1/hr/candidates"
        
        if 'job_opening_id' not in self.test_data:
            self.print_info("Pulando teste - vaga não criada")
            return
        
        # CREATE
        data = {
            "first_name": "Test",
            "last_name": "Candidate",
            "email": "candidate@test.com",
            "job_opening_id": self.test_data['job_opening_id'],
            "status": "applied"
        }
        result = self.test_request('POST', api_base, data, 201, "Criar candidato")
        if result:
            cand_id = result.get('id')
            
            # READ
            self.test_request('GET', f"{api_base}/{cand_id}", expected_status=200, description="Ler candidato")
            self.test_request('GET', api_base, expected_status=200, description="Listar candidatos")
    
    def test_payroll(self):
        """Testa CRUD de Folha de Pagamento"""
        self.print_header("💰 FOLHA DE PAGAMENTO")
        api_base = f"{self.base_url}/api/v1/hr/payroll"
        
        if 'employee_id' not in self.test_data:
            self.print_info("Pulando teste - funcionário não criado")
            return
        
        # CREATE
        data = {
            "employee_id": self.test_data['employee_id'],
            "month": date.today().month,
            "year": date.today().year,
            "base_salary": "5000.00",
            "commissions": "0.00",
            "overtime": "0.00",
            "bonuses": "0.00"
        }
        result = self.test_request('POST', api_base, data, 201, "Criar folha de pagamento")
        if result:
            payroll_id = result.get('id')
            
            # READ
            self.test_request('GET', f"{api_base}/{payroll_id}", expected_status=200, description="Ler folha")
            self.test_request('GET', api_base, expected_status=200, description="Listar folhas")
            
            # Ação customizada: recalculate
            self.test_request('POST', f"{api_base}/{payroll_id}/recalculate/", expected_status=200, description="Recalcular folha")
            
            # Ação customizada: process
            self.test_request('POST', f"{api_base}/{payroll_id}/process/", expected_status=200, description="Processar folha")
    
    def test_notifications(self):
        """Testa Notificações HR"""
        self.print_header("🔔 NOTIFICAÇÕES")
        api_base = f"{self.base_url}/api/v1/hr/notifications"
        
        # READ
        self.test_request('GET', api_base, expected_status=200, description="Listar notificações")
        
        # Ação customizada: unread_count
        self.test_request('GET', f"{api_base}/unread_count/", expected_status=200, description="Contar não lidas")
        
        # Ação customizada: mark_all_read
        self.test_request('POST', f"{api_base}/mark_all_read/", expected_status=200, description="Marcar todas como lidas")
    
    def test_contracts(self):
        """Testa CRUD de Contratos"""
        self.print_header("📄 CONTRATOS")
        api_base = f"{self.base_url}/api/v1/hr/contracts"
        
        if 'employee_id' not in self.test_data:
            self.print_info("Pulando teste - funcionário não criado")
            return
        
        # CREATE
        data = {
            "employee_id": self.test_data['employee_id'],
            "contract_type": "w2_employee",
            "start_date": str(date.today())
        }
        result = self.test_request('POST', api_base, data, 201, "Criar contrato")
        if result:
            contract_id = result.get('id')
            
            # READ
            self.test_request('GET', f"{api_base}/{contract_id}", expected_status=200, description="Ler contrato")
            self.test_request('GET', api_base, expected_status=200, description="Listar contratos")
    
    def test_employee_documents(self):
        """Testa CRUD de Documentos de Funcionário"""
        self.print_header("📎 DOCUMENTOS")
        api_base = f"{self.base_url}/api/v1/hr/employee-documents"
        
        if 'employee_id' not in self.test_data:
            self.print_info("Pulando teste - funcionário não criado")
            return
        
        # CREATE (sem arquivo real, apenas estrutura)
        data = {
            "employee_id": self.test_data['employee_id'],
            "document_type": "id",
            "expiry_date": str(date.today() + timedelta(days=365))
        }
        result = self.test_request('POST', api_base, data, 201, "Criar documento")
        if result:
            doc_id = result.get('id')
            
            # READ
            self.test_request('GET', f"{api_base}/{doc_id}", expected_status=200, description="Ler documento")
            self.test_request('GET', api_base, expected_status=200, description="Listar documentos")
    
    def run_all_tests(self):
        """Executa todos os testes"""
        print(f"\n{Colors.BLUE}{'='*80}{Colors.RESET}")
        print(f"{Colors.BLUE}🧪 TESTE COMPLETO DE TODAS AS APIs DO MÓDULO HR{Colors.RESET}")
        print(f"{Colors.BLUE}{'='*80}{Colors.RESET}")
        
        if not self.login():
            print(f"\n{Colors.RED}❌ Falha na autenticação. Abortando testes.{Colors.RESET}")
            return
        
        # Executar todos os testes
        self.test_departments()
        self.test_job_positions()
        self.test_companies()
        self.test_employees()
        self.test_bank_accounts()
        self.test_dependents()
        self.test_educations()
        self.test_work_experiences()
        self.test_benefits()
        self.test_employee_benefits()
        self.test_time_records()
        self.test_vacations()
        self.test_performance_reviews()
        self.test_trainings()
        self.test_employee_trainings()
        self.test_job_openings()
        self.test_candidates()
        self.test_payroll()
        self.test_notifications()
        self.test_contracts()
        self.test_employee_documents()
        
        # Resumo final
        self.print_header("📊 RESUMO DOS TESTES")
        print(f"{Colors.GREEN}✅ Testes passados: {self.results['passed']}{Colors.RESET}")
        print(f"{Colors.RED}❌ Testes falhados: {self.results['failed']}{Colors.RESET}")
        total = self.results['passed'] + self.results['failed']
        if total > 0:
            success_rate = (self.results['passed'] / total) * 100
            print(f"{Colors.BLUE}📈 Taxa de sucesso: {success_rate:.1f}%{Colors.RESET}")
        
        if self.results['errors']:
            print(f"\n{Colors.RED}Erros encontrados:{Colors.RESET}")
            for error in self.results['errors'][:10]:  # Mostrar apenas os 10 primeiros
                print(f"  - {error}")

if __name__ == "__main__":
    tester = HRAPITester()
    tester.run_all_tests()

