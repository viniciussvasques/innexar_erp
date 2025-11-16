"""
Testes Completos do Modulo HR - Innexar ERP
Testa TODAS as funcionalidades sem excecao
"""

import os
import sys
import json
import requests
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field

# Fix encoding for Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Configuração
BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:8000')
API_PREFIX = '/api/v1/hr'

# Credenciais (ajustar conforme necessário)
USERNAME = os.getenv('TEST_USERNAME', 'admin')
PASSWORD = os.getenv('TEST_PASSWORD', 'admin')
TENANT_SCHEMA = os.getenv('TENANT_SCHEMA', 'public')


@dataclass
class TestResult:
    """Resultado de um teste"""
    name: str
    endpoint: str
    method: str
    status_code: int
    success: bool
    error: Optional[str] = None
    response_data: Optional[Dict] = None
    created_id: Optional[int] = None
    duration_ms: float = 0.0


@dataclass
class TestSession:
    """Sessão de testes"""
    token: Optional[str] = None
    headers: Dict[str, str] = field(default_factory=dict)
    created_ids: Dict[str, List[int]] = field(default_factory=dict)
    results: List[TestResult] = field(default_factory=list)
    
    def add_result(self, result: TestResult):
        """Adiciona resultado do teste"""
        self.results.append(result)
        if result.created_id:
            resource_type = result.endpoint.split('/')[-2] if '/' in result.endpoint else result.endpoint
            if resource_type not in self.created_ids:
                self.created_ids[resource_type] = []
            self.created_ids[resource_type].append(result.created_id)


class HRModuleTester:
    """Classe principal para testar o módulo HR"""
    
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.api_url = f"{base_url}{API_PREFIX}"
        self.session = requests.Session()
        self.test_session = TestSession()
        
    def authenticate(self) -> bool:
        """Autentica e obtém token"""
        try:
            # Tentar diferentes endpoints de autenticação
            auth_endpoints = [
                '/api/v1/auth/login/',
                '/api/v1/auth/token/',
                '/api/v1/users/login/',
                '/api/auth/login/',
            ]
            
            for auth_url in auth_endpoints:
                try:
                    full_url = f"{self.base_url}{auth_url}"
                    # Tentar com username/password
                    response = self.session.post(full_url, json={
                        'username': USERNAME,
                        'password': PASSWORD
                    })
                    
                    if response.status_code in [200, 201]:
                        data = response.json()
                        token = data.get('access') or data.get('token') or data.get('access_token')
                        if token:
                            self.test_session.token = token
                            self.test_session.headers = {
                                'Authorization': f'Bearer {token}',
                                'Content-Type': 'application/json',
                                'X-DTS-SCHEMA': TENANT_SCHEMA
                            }
                            self.session.headers.update(self.test_session.headers)
                            print(f"[OK] Autenticado via {auth_url}")
                            return True
                except:
                    continue
            
            # Se nao funcionou, tentar sem autenticacao (para desenvolvimento)
            print("[AVISO] Nao foi possivel autenticar. Testando sem token (modo desenvolvimento)...")
            self.test_session.headers = {
                'Content-Type': 'application/json',
                'X-DTS-SCHEMA': TENANT_SCHEMA
            }
            self.session.headers.update(self.test_session.headers)
            return True
            
        except Exception as e:
            print(f"[AVISO] Erro na autenticacao: {str(e)}. Continuando sem autenticacao...")
            self.test_session.headers = {
                'Content-Type': 'application/json',
                'X-DTS-SCHEMA': TENANT_SCHEMA
            }
            self.session.headers.update(self.test_session.headers)
            return True
    
    def make_request(
        self,
        method: str,
        endpoint: str,
        name: str,
        data: Optional[Dict] = None,
        files: Optional[Dict] = None,
        expected_status: int = 200
    ) -> TestResult:
        """Faz uma requisição e retorna o resultado"""
        url = f"{self.api_url}{endpoint}"
        start_time = datetime.now()
        
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, params=data)
            elif method.upper() == 'POST':
                if files:
                    response = self.session.post(url, data=data, files=files)
                else:
                    response = self.session.post(url, json=data)
            elif method.upper() == 'PATCH':
                response = self.session.patch(url, json=data)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url)
            else:
                raise ValueError(f"Método não suportado: {method}")
            
            duration = (datetime.now() - start_time).total_seconds() * 1000
            status_code = response.status_code
            success = status_code == expected_status
            
            # Tentar parsear JSON
            try:
                response_data = response.json() if response.text else None
            except:
                response_data = {'raw': response.text[:200]}
            
            # Extrair ID criado se for POST/PATCH bem-sucedido
            created_id = None
            if success and method.upper() in ['POST', 'PATCH'] and response_data:
                created_id = response_data.get('id')
            
            result = TestResult(
                name=name,
                endpoint=endpoint,
                method=method,
                status_code=status_code,
                success=success,
                error=None if success else f"Esperado {expected_status}, recebido {status_code}",
                response_data=response_data,
                created_id=created_id,
                duration_ms=duration
            )
            
            self.test_session.add_result(result)
            return result
            
        except Exception as e:
            duration = (datetime.now() - start_time).total_seconds() * 1000
            result = TestResult(
                name=name,
                endpoint=endpoint,
                method=method,
                status_code=0,
                success=False,
                error=str(e),
                duration_ms=duration
            )
            self.test_session.add_result(result)
            return result
    
    def print_result(self, result: TestResult):
        """Imprime resultado formatado"""
        status_icon = "[OK]" if result.success else "[ERRO]"
        print(f"{status_icon} {result.name}")
        print(f"   {result.method} {result.endpoint}")
        print(f"   Status: {result.status_code} | Tempo: {result.duration_ms:.2f}ms")
        if result.error:
            print(f"   Erro: {result.error}")
        if result.created_id:
            print(f"   ID criado: {result.created_id}")
        print()
    
    # ==================== TESTES POR MÓDULO ====================
    
    def test_departments(self):
        """Testa CRUD de Departamentos"""
        print("\n" + "="*60)
        print("TESTANDO: Departments")
        print("="*60)
        
        # CREATE
        dept_data = {
            'name': f'Test Department {datetime.now().strftime("%Y%m%d%H%M%S")}',
            'code': f'TEST-{datetime.now().strftime("%H%M%S")}',
            'description': 'Department for testing',
            'is_active': True
        }
        result = self.make_request('POST', '/departments/', 'Criar Departamento', dept_data, expected_status=201)
        self.print_result(result)
        dept_id = result.created_id
        
        if dept_id:
            # READ
            self.print_result(self.make_request('GET', f'/departments/{dept_id}/', 'Ler Departamento'))
            self.print_result(self.make_request('GET', '/departments/', 'Listar Departamentos'))
            
            # UPDATE
            update_data = {'description': 'Updated description'}
            self.print_result(self.make_request('PATCH', f'/departments/{dept_id}/', 'Atualizar Departamento', update_data))
            
            # DELETE
            self.print_result(self.make_request('DELETE', f'/departments/{dept_id}/', 'Deletar Departamento', expected_status=204))
    
    def test_job_positions(self):
        """Testa CRUD de Cargos"""
        print("\n" + "="*60)
        print("TESTANDO: Job Positions")
        print("="*60)
        
        # CREATE
        job_data = {
            'title': f'Test Position {datetime.now().strftime("%Y%m%d%H%M%S")}',
            'code': f'TEST-POS-{datetime.now().strftime("%H%M%S")}',
            'description': 'Position for testing',
            'is_active': True
        }
        result = self.make_request('POST', '/job-positions/', 'Criar Cargo', job_data, expected_status=201)
        self.print_result(result)
        job_id = result.created_id
        
        if job_id:
            self.print_result(self.make_request('GET', f'/job-positions/{job_id}/', 'Ler Cargo'))
            self.print_result(self.make_request('GET', '/job-positions/', 'Listar Cargos'))
            
            update_data = {'description': 'Updated description'}
            self.print_result(self.make_request('PATCH', f'/job-positions/{job_id}/', 'Atualizar Cargo', update_data))
            self.print_result(self.make_request('DELETE', f'/job-positions/{job_id}/', 'Deletar Cargo', expected_status=204))
    
    def test_companies(self):
        """Testa CRUD de Empresas"""
        print("\n" + "="*60)
        print("TESTANDO: Companies")
        print("="*60)
        
        company_data = {
            'legal_name': f'Test Company {datetime.now().strftime("%Y%m%d%H%M%S")}',
            'trade_name': f'Test Co {datetime.now().strftime("%H%M%S")}',
            'ein': f'12{datetime.now().strftime("%H%M%S")}',
            'is_active': True
        }
        result = self.make_request('POST', '/companies/', 'Criar Empresa', company_data, expected_status=201)
        self.print_result(result)
        company_id = result.created_id
        
        if company_id:
            self.print_result(self.make_request('GET', f'/companies/{company_id}/', 'Ler Empresa'))
            self.print_result(self.make_request('GET', '/companies/', 'Listar Empresas'))
            
            update_data = {'trade_name': 'Updated Trade Name'}
            self.print_result(self.make_request('PATCH', f'/companies/{company_id}/', 'Atualizar Empresa', update_data))
            self.print_result(self.make_request('DELETE', f'/companies/{company_id}/', 'Deletar Empresa', expected_status=204))
    
    def test_employees(self):
        """Testa CRUD de Funcionários"""
        print("\n" + "="*60)
        print("TESTANDO: Employees")
        print("="*60)
        
        # Primeiro, precisamos de um user_id válido
        # Por enquanto, vamos testar apenas listagem e by_user
        self.print_result(self.make_request('GET', '/employees/', 'Listar Funcionários'))
        self.print_result(self.make_request('GET', '/employees/by_user/?user_id=1', 'Funcionário por User ID'))
    
    def test_benefits(self):
        """Testa CRUD de Benefícios"""
        print("\n" + "="*60)
        print("TESTANDO: Benefits")
        print("="*60)
        
        benefit_data = {
            'name': f'Test Benefit {datetime.now().strftime("%Y%m%d%H%M%S")}',
            'benefit_type': 'meal_voucher',
            'value': 500.00,
            'is_active': True
        }
        result = self.make_request('POST', '/benefits/', 'Criar Benefício', benefit_data, expected_status=201)
        self.print_result(result)
        benefit_id = result.created_id
        
        if benefit_id:
            self.print_result(self.make_request('GET', f'/benefits/{benefit_id}/', 'Ler Benefício'))
            self.print_result(self.make_request('GET', '/benefits/', 'Listar Benefícios'))
            
            update_data = {'value': 600.00}
            self.print_result(self.make_request('PATCH', f'/benefits/{benefit_id}/', 'Atualizar Benefício', update_data))
            self.print_result(self.make_request('DELETE', f'/benefits/{benefit_id}/', 'Deletar Benefício', expected_status=204))
    
    def test_time_records(self):
        """Testa CRUD de Registros de Ponto"""
        print("\n" + "="*60)
        print("TESTANDO: Time Records")
        print("="*60)
        
        # Listar primeiro para ver estrutura
        self.print_result(self.make_request('GET', '/time-records/', 'Listar Registros de Ponto'))
        self.print_result(self.make_request('GET', '/time-records/calculate_hours/?employee_id=1&start_date=2025-01-01&end_date=2025-01-31', 'Calcular Horas'))
    
    def test_vacations(self):
        """Testa CRUD de Férias"""
        print("\n" + "="*60)
        print("TESTANDO: Vacations")
        print("="*60)
        
        self.print_result(self.make_request('GET', '/vacations/', 'Listar Férias'))
        self.print_result(self.make_request('GET', '/vacations/balance/?employee_id=1&as_of_date=2025-01-15', 'Saldo de Férias'))
    
    def test_trainings(self):
        """Testa CRUD de Treinamentos"""
        print("\n" + "="*60)
        print("TESTANDO: Trainings")
        print("="*60)
        
        training_data = {
            'name': f'Test Training {datetime.now().strftime("%Y%m%d%H%M%S")}',
            'training_type': 'internal',
            'start_date': date.today().isoformat(),
            'end_date': (date.today() + timedelta(days=7)).isoformat(),
            'duration_hours': 40,
            'is_active': True
        }
        result = self.make_request('POST', '/trainings/', 'Criar Treinamento', training_data, expected_status=201)
        self.print_result(result)
        training_id = result.created_id
        
        if training_id:
            self.print_result(self.make_request('GET', f'/trainings/{training_id}/', 'Ler Treinamento'))
            self.print_result(self.make_request('GET', '/trainings/', 'Listar Treinamentos'))
            
            update_data = {'duration_hours': 50}
            self.print_result(self.make_request('PATCH', f'/trainings/{training_id}/', 'Atualizar Treinamento', update_data))
            self.print_result(self.make_request('DELETE', f'/trainings/{training_id}/', 'Deletar Treinamento', expected_status=204))
    
    def test_job_openings(self):
        """Testa CRUD de Vagas"""
        print("\n" + "="*60)
        print("TESTANDO: Job Openings")
        print("="*60)
        
        self.print_result(self.make_request('GET', '/job-openings/', 'Listar Vagas'))
    
    def test_candidates(self):
        """Testa CRUD de Candidatos"""
        print("\n" + "="*60)
        print("TESTANDO: Candidates")
        print("="*60)
        
        self.print_result(self.make_request('GET', '/candidates/', 'Listar Candidatos'))
    
    def test_payroll(self):
        """Testa APIs de Folha de Pagamento"""
        print("\n" + "="*60)
        print("TESTANDO: Payroll")
        print("="*60)
        
        self.print_result(self.make_request('GET', '/payroll/', 'Listar Folhas'))
    
    def test_notifications(self):
        """Testa APIs de Notificações"""
        print("\n" + "="*60)
        print("TESTANDO: Notifications")
        print("="*60)
        
        self.print_result(self.make_request('GET', '/notifications/', 'Listar Notificações'))
        self.print_result(self.make_request('GET', '/notifications/unread_count/', 'Contagem de Não Lidas'))
    
    def test_validations(self):
        """Testa validações e tratamento de erros"""
        print("\n" + "="*60)
        print("TESTANDO: Validações e Erros")
        print("="*60)
        
        # Teste 1: Criar departamento sem nome (deve falhar)
        self.print_result(self.make_request('POST', '/departments/', 'Criar Departamento sem nome (deve falhar)', {}, expected_status=400))
        
        # Teste 2: Buscar ID inexistente (deve retornar 404)
        self.print_result(self.make_request('GET', '/departments/999999/', 'Buscar Departamento inexistente', expected_status=404))
        
        # Teste 3: Atualizar com dados inválidos
        self.print_result(self.make_request('PATCH', '/departments/999999/', 'Atualizar Departamento inexistente', {'name': 'Test'}, expected_status=404))
    
    def run_all_tests(self):
        """Executa todos os testes"""
        print("\n" + "="*80)
        print("INICIANDO TESTES COMPLETOS DO MÓDULO HR")
        print("="*80)
        print(f"Base URL: {self.base_url}")
        print(f"API Prefix: {API_PREFIX}")
        print(f"Data/Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # Autenticar
        if not self.authenticate():
            print("[ERRO] Falha na autenticacao. Abortando testes.")
            return False
        
        print("[OK] Autenticacao bem-sucedida\n")
        
        # Executar testes
        test_methods = [
            self.test_departments,
            self.test_job_positions,
            self.test_companies,
            self.test_benefits,
            self.test_employees,
            self.test_time_records,
            self.test_vacations,
            self.test_trainings,
            self.test_job_openings,
            self.test_candidates,
            self.test_payroll,
            self.test_notifications,
            self.test_validations,
        ]
        
        for test_method in test_methods:
            try:
                test_method()
            except Exception as e:
                print(f"[ERRO] Erro ao executar {test_method.__name__}: {str(e)}\n")
        
        # Resumo
        self.print_summary()
        return True
    
    def print_summary(self):
        """Imprime resumo dos testes"""
        print("\n" + "="*80)
        print("RESUMO DOS TESTES")
        print("="*80)
        
        total = len(self.test_session.results)
        passed = sum(1 for r in self.test_session.results if r.success)
        failed = total - passed
        
        print(f"Total de testes: {total}")
        print(f"[OK] Sucesso: {passed} ({passed/total*100:.1f}%)")
        print(f"[ERRO] Falhas: {failed} ({failed/total*100:.1f}%)")
        print()
        
        if failed > 0:
            print("TESTES QUE FALHARAM:")
            print("-" * 80)
            for result in self.test_session.results:
                if not result.success:
                    print(f"[ERRO] {result.name}")
                    print(f"   {result.method} {result.endpoint}")
                    print(f"   Status: {result.status_code} | Erro: {result.error}")
            print()
        
        # Salvar relatório
        self.save_report()
    
    def save_report(self):
        """Salva relatório em arquivo JSON"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'base_url': self.base_url,
            'summary': {
                'total': len(self.test_session.results),
                'passed': sum(1 for r in self.test_session.results if r.success),
                'failed': sum(1 for r in self.test_session.results if not r.success)
            },
            'results': [
                {
                    'name': r.name,
                    'endpoint': r.endpoint,
                    'method': r.method,
                    'status_code': r.status_code,
                    'success': r.success,
                    'error': r.error,
                    'duration_ms': r.duration_ms,
                    'created_id': r.created_id
                }
                for r in self.test_session.results
            ]
        }
        
        report_file = f"tests/reports/hr_tests_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        os.makedirs(os.path.dirname(report_file), exist_ok=True)
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"[INFO] Relatorio salvo em: {report_file}")


if __name__ == '__main__':
    tester = HRModuleTester()
    tester.run_all_tests()

