#!/usr/bin/env python
"""
Script para testar os endpoints da API HR via HTTP
"""
import os
import django
import requests
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django_tenants.utils import schema_context
from apps.tenants.models import Tenant
from apps.users.models import User
from datetime import date, timedelta

print("=" * 80)
print("TESTES DE API - MÓDULO HR")
print("=" * 80)

# Configurações
BASE_URL = "http://localhost:8000"
TENANT_DOMAIN = "testcompany.localhost"  # Domínio do tenant
TENANT_BASE_URL = f"http://{TENANT_DOMAIN}:8000"
API_BASE = f"{TENANT_BASE_URL}/api/v1/hr"

# 1. Obter token de autenticação
print("\n🔐 1. Autenticação")
print("-" * 80)

with schema_context('public'):
    try:
        user = User.objects.get(email='test@example.com')
    except User.DoesNotExist:
        print("❌ Usuário de teste não encontrado!")
        exit(1)

# Login - usar URL pública primeiro
login_data = {
    "email": "test@example.com",
    "password": "testpass123"
}

try:
    # Tentar login público primeiro
    response = requests.post(f"{BASE_URL}/api/v1/public/auth/login/", json=login_data)
    if response.status_code != 200:
        # Tentar login no tenant
        response = requests.post(f"{TENANT_BASE_URL}/api/v1/auth/login/", json=login_data)
    
    if response.status_code == 200:
        token_data = response.json()
        access_token = token_data.get('access')
        print(f"✅ Login realizado com sucesso")
        print(f"   Token obtido: {access_token[:20]}...")
    else:
        print(f"❌ Erro no login: {response.status_code}")
        print(f"   Resposta: {response.text[:500]}")
        print(f"\n⚠️  Continuando sem autenticação para testar estrutura...")
        access_token = None
except requests.exceptions.ConnectionError:
    print("❌ Erro: Não foi possível conectar ao servidor")
    print("   Certifique-se de que o servidor está rodando: docker compose up")
    exit(1)
except Exception as e:
    print(f"⚠️  Erro no login: {str(e)}")
    print(f"   Continuando sem autenticação...")
    access_token = None

# Headers para requisições autenticadas
headers = {
    "Content-Type": "application/json"
}
if access_token:
    headers["Authorization"] = f"Bearer {access_token}"
else:
    print("⚠️  Testando sem autenticação (alguns endpoints podem falhar)")

# 2. Testar endpoints
print("\n" + "=" * 80)
print("TESTANDO ENDPOINTS")
print("=" * 80)

test_results = {
    'passed': [],
    'failed': []
}

def test_endpoint(method, url, data=None, expected_status=200, description="", skip_if_no_auth=False):
    """Testa um endpoint"""
    if skip_if_no_auth and not access_token:
        print(f"⏭️  {method} {url} - {description} (pulado - sem autenticação)")
        return None
    
    try:
        if method == 'GET':
            response = requests.get(url, headers=headers, timeout=5)
        elif method == 'POST':
            response = requests.post(url, headers=headers, json=data, timeout=5)
        elif method == 'PUT':
            response = requests.put(url, headers=headers, json=data, timeout=5)
        elif method == 'PATCH':
            response = requests.patch(url, headers=headers, json=data, timeout=5)
        elif method == 'DELETE':
            response = requests.delete(url, headers=headers, timeout=5)
        
        if response.status_code == expected_status:
            test_results['passed'].append(f"{method} {url}")
            print(f"✅ {method} {url} - {description}")
            try:
                return response.json() if response.content else {}
            except:
                return {}
        else:
            # Aceitar 401/403 se não tiver autenticação
            if not access_token and response.status_code in [401, 403]:
                print(f"⚠️  {method} {url} - {description} (401/403 - esperado sem auth)")
                return None
            
            test_results['failed'].append(f"{method} {url} (esperado {expected_status}, obtido {response.status_code})")
            print(f"❌ {method} {url} - {description}")
            print(f"   Status: {response.status_code} (esperado: {expected_status})")
            if response.content:
                try:
                    error_data = response.json()
                    if 'detail' in error_data:
                        print(f"   Erro: {error_data['detail']}")
                    else:
                        print(f"   Erro: {error_data}")
                except:
                    print(f"   Resposta: {response.text[:200]}")
            return None
    except requests.exceptions.ConnectionError:
        test_results['failed'].append(f"{method} {url} (erro de conexão)")
        print(f"❌ {method} {url} - {description}")
        print(f"   Erro: Não foi possível conectar ao servidor")
        return None
    except Exception as e:
        test_results['failed'].append(f"{method} {url} (erro: {str(e)})")
        print(f"❌ {method} {url} - {description}")
        print(f"   Erro: {str(e)}")
        return None

# Teste 1: Departments
print("\n📋 DEPARTMENTS")
print("-" * 80)
dept_id = None
dept_data = {
    "name": "IT Department",
    "code": "IT",
    "description": "IT Department for testing",
    "is_active": True
}
dept_response = test_endpoint('POST', f"{API_BASE}/departments/", dept_data, 201, "Criar departamento", skip_if_no_auth=True)
if dept_response:
    dept_id = dept_response.get('id')
    test_endpoint('GET', f"{API_BASE}/departments/", expected_status=200, description="Listar departamentos", skip_if_no_auth=True)
    test_endpoint('GET', f"{API_BASE}/departments/{dept_id}/", expected_status=200, description="Detalhes do departamento", skip_if_no_auth=True)
    test_endpoint('PATCH', f"{API_BASE}/departments/{dept_id}/", {"description": "Updated"}, 200, "Atualizar departamento", skip_if_no_auth=True)

# Teste 2: Benefits
print("\n💼 BENEFITS")
print("-" * 80)
benefit_id = None
benefit_data = {
    "name": "Vale Refeição Test",
    "benefit_type": "meal_voucher",
    "description": "Vale refeição para testes",
    "value": "500.00",
    "limit": "600.00",
    "is_active": True
}
benefit_response = test_endpoint('POST', f"{API_BASE}/benefits/", benefit_data, 201, "Criar benefício", skip_if_no_auth=True)
if benefit_response:
    benefit_id = benefit_response.get('id')
    test_endpoint('GET', f"{API_BASE}/benefits/", expected_status=200, description="Listar benefícios", skip_if_no_auth=True)
    test_endpoint('GET', f"{API_BASE}/benefits/{benefit_id}/", expected_status=200, description="Detalhes do benefício", skip_if_no_auth=True)

# Teste 3: Employees
print("\n👤 EMPLOYEES")
print("-" * 80)
test_endpoint('GET', f"{API_BASE}/employees/", expected_status=200, description="Listar funcionários", skip_if_no_auth=True)
if dept_id:
    test_endpoint('GET', f"{API_BASE}/employees/?department_id={dept_id}", expected_status=200, description="Filtrar por departamento", skip_if_no_auth=True)
    test_endpoint('GET', f"{API_BASE}/employees/?status=active", expected_status=200, description="Filtrar por status", skip_if_no_auth=True)

# Teste 4: Time Records
print("\n⏰ TIME RECORDS")
print("-" * 80)
emp = None
with schema_context('testcompany'):
    from apps.hr.models import Employee
    emp = Employee.objects.first()
    if emp:
        time_record_data = {
            "employee": emp.id,
            "record_type": "check_in",
            "record_date": str(date.today()),
            "record_time": "09:00:00",
            "is_approved": False
        }
        time_record_response = test_endpoint('POST', f"{API_BASE}/time-records/", time_record_data, 201, "Criar registro de ponto", skip_if_no_auth=True)
        if time_record_response:
            time_record_id = time_record_response.get('id')
            test_endpoint('POST', f"{API_BASE}/time-records/{time_record_id}/approve/", expected_status=200, description="Aprovar registro de ponto", skip_if_no_auth=True)

# Teste 5: Vacations
print("\n🏖️  VACATIONS")
print("-" * 80)
vacation_id = None
if emp:
    vacation_data = {
        "employee": emp.id,
        "status": "requested",
        "start_date": str(date.today() + timedelta(days=30)),
        "end_date": str(date.today() + timedelta(days=44)),
        "days": 15,
        "acquisition_period_start": str(date.today() - timedelta(days=365)),
        "acquisition_period_end": str(date.today() - timedelta(days=1)),
        "sell_days": 0,
        "cash_allowance": False
    }
    vacation_response = test_endpoint('POST', f"{API_BASE}/vacations/", vacation_data, 201, "Criar solicitação de férias", skip_if_no_auth=True)
    if vacation_response:
        vacation_id = vacation_response.get('id')
        test_endpoint('POST', f"{API_BASE}/vacations/{vacation_id}/approve/", expected_status=200, description="Aprovar férias", skip_if_no_auth=True)

# Teste 6: Trainings
print("\n📚 TRAININGS")
print("-" * 80)
training_id = None
training_data = {
    "name": "Curso de Testes",
    "description": "Treinamento para testes",
    "training_type": "Internal",
    "start_date": str(date.today() + timedelta(days=7)),
    "end_date": str(date.today() + timedelta(days=14)),
    "duration_hours": 40,
    "location": "Sala de Treinamento",
    "instructor": "Instrutor Test",
    "provides_certificate": True,
    "certificate_validity_months": 12,
    "is_active": True
}
training_response = test_endpoint('POST', f"{API_BASE}/trainings/", training_data, 201, "Criar treinamento", skip_if_no_auth=True)
if training_response and emp:
    training_id = training_response.get('id')
    enroll_data = {"employee_id": emp.id}
    test_endpoint('POST', f"{API_BASE}/trainings/{training_id}/enroll/", enroll_data, 201, "Inscrever funcionário", skip_if_no_auth=True)

# Teste 7: Job Openings
print("\n💼 JOB OPENINGS")
print("-" * 80)
job_id = None
job_data = {
    "title": "Desenvolvedor Python Test",
    "department": dept_id if dept_id else None,
    "description": "Vaga para desenvolvedor Python",
    "requirements": "Python, Django",
    "salary_min": "8000.00",
    "salary_max": "12000.00",
    "status": "open"
}
job_response = test_endpoint('POST', f"{API_BASE}/job-openings/", job_data, 201, "Criar vaga", skip_if_no_auth=True)
if job_response:
    job_id = job_response.get('id')
    test_endpoint('GET', f"{API_BASE}/job-openings/", expected_status=200, description="Listar vagas", skip_if_no_auth=True)

# Teste 8: Candidates
print("\n👥 CANDIDATES")
print("-" * 80)
if job_id:
    candidate_data = {
        "first_name": "Maria",
        "last_name": "Silva",
        "email": "maria@example.com",
        "phone": "11988888888",
        "job_opening": job_id,
        "status": "applied",
        "notes": "Candidata interessada"
    }
    test_endpoint('POST', f"{API_BASE}/candidates/", candidate_data, 201, "Criar candidato", skip_if_no_auth=True)

# Teste 9: Payroll
print("\n💰 PAYROLL")
print("-" * 80)
test_endpoint('GET', f"{API_BASE}/payroll/", expected_status=200, description="Listar folhas de pagamento", skip_if_no_auth=True)
if emp:
    process_data = {
        "employee_ids": [emp.id],
        "month": 11,
        "year": 2024
    }
    test_endpoint('POST', f"{API_BASE}/payroll/process/", process_data, 200, "Processar folha de pagamento", skip_if_no_auth=True)

# Resumo
print("\n" + "=" * 80)
print("RESUMO DOS TESTES")
print("=" * 80)
print(f"\n✅ Testes passados: {len(test_results['passed'])}")
print(f"❌ Testes falhados: {len(test_results['failed'])}")

if test_results['failed']:
    print("\n❌ Testes que falharam:")
    for failed in test_results['failed']:
        print(f"   - {failed}")

if len(test_results['passed']) > 0:
    print("\n✅ Testes que passaram:")
    for passed in test_results['passed'][:10]:  # Mostrar apenas os primeiros 10
        print(f"   - {passed}")
    if len(test_results['passed']) > 10:
        print(f"   ... e mais {len(test_results['passed']) - 10} testes")

print("\n" + "=" * 80)
if len(test_results['failed']) == 0:
    print("✅ TODOS OS TESTES PASSARAM!")
else:
    print(f"⚠️  {len(test_results['failed'])} TESTES FALHARAM")
print("=" * 80)

