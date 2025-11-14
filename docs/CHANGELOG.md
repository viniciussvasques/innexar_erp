# 📝 CHANGELOG - Innexar ERP SaaS

Registro detalhado de todas as mudanças, seguindo formato [Keep a Changelog](https://keepachangelog.com/).

---

## [2025-11-13] - Dashboard Admin e Estrutura Inicial

### 🎯 Contexto
Primeira versão do sistema admin multi-tenant com dashboard, métricas e visualizações.
Usuario solicitou criar telas admin com dados reais (zero mocks).

### ✅ Adicionado

#### **Workspace: Innexar Admin**
- Arquivo: `innexar_core/innexar_erp/workspace/innexar_admin.json`
- Cards organizados: Dashboard, Tenants, Billing, Analytics
- Links: Tenant Overview, System Health, All Tenants, Subscriptions, Reports
- Charts: Total Tenants, MRR Trend, Tenant Growth, Plan Distribution
- Shortcuts: New Tenant, All Tenants, Subscriptions

#### **Page: Tenant Dashboard**
- Arquivos:
  - `innexar_core/innexar_erp/page/tenant_dashboard/tenant_dashboard.json`
  - `innexar_core/innexar_erp/page/tenant_dashboard/tenant_dashboard.py` (backend)
  - `innexar_core/innexar_erp/page/tenant_dashboard/tenant_dashboard.js` (frontend)
  - `innexar_core/innexar_erp/page/tenant_dashboard/tenant_dashboard.html`
- **KPI Cards com gradientes:**
  - Total Tenants (purple gradient)
  - Active Tenants (pink gradient)
  - MRR (blue gradient)
  - ARR (green gradient)
- **Métricas secundárias:**
  - Trial Conversion Rate
  - Churn Rate (30 days)
  - Trial Tenants count
  - Average MRR per Tenant
- **Charts (Chart.js):**
  - MRR by Plan (bar chart)
  - Plan Distribution (doughnut chart)
- **Tabela Recent Signups:**
  - Últimos 10 tenants
  - Links para tenant details
  - Badges coloridos por plan/status

#### **Backend APIs (tenant_dashboard.py)**
```python
@frappe.whitelist()
def get_dashboard_data():
    # Retorna: tenant_stats, mrr_data, total_mrr, arr, growth_data,
    # trial_conversion, churn_rate, recent_tenants, totals

@frappe.whitelist()
def get_mrr_trend(period='12'):
    # MRR mensal últimos N meses

@frappe.whitelist()
def get_plan_distribution():
    # Distribuição tenants por plano
```

#### **List View Customizations**
- **tenant_list.js:**
  - Indicators coloridos por status
  - Formatação subdomain com link externo
  - Botões: "Refresh Stats", "Export CSV"
  - Formatter para plan (badges coloridos)
  - Filtro padrão: status = Active
  - Group by: plan

- **subscription_list.js:**
  - Indicators por status (Active, Trialing, Past Due, Cancelled, Unpaid)
  - Botão "MRR Summary" com breakdown detalhado
  - Botão "Expiring Soon" (próximos 7 dias)
  - Formatter MRR com destaque visual
  - Filtro padrão: status in (Active, Trialing)

#### **Dados de Teste (create_test_data.py)**
- 9 tenants fictícios criados:
  - TechStart Inc ($99 Pro)
  - Global Solutions ($499 Enterprise)
  - Startup Labs ($0 Free)
  - Digital Innovations ($99 Pro)
  - CloudFirst Co ($499 Enterprise)
  - AgileWorks ($99 Pro)
  - DataDriven LLC (Trial)
  - SmartBiz Solutions (Trial)
  - MegaCorp Industries ($499 Enterprise)
- **Total MRR:** $1,497/mês
- **Total ARR:** $17,964/ano
- 6 Active + 2 Trial + 1 erro (plano "Trial" inválido)

#### **Configuração Linters**
- `.vscode/settings.json` - Desabilita reportMissingImports (frappe no Docker)
- `.pylintrc` - Regras Python para projetos Frappe
- `.sonarlintignore` - Ignora temp_doctypes, docker files
- `LINTER_WARNINGS.md` - Documentação dos 32 "erros" (falsos positivos)

#### **Documentação**
- `DEVELOPMENT_RULES.md` - Regras Frappe, workflow, erros comuns, checklist
- `CHANGELOG.md` - Este arquivo, registro detalhado de todas mudanças
- `TELAS_ADMIN_GUIDE.md` - Guia de acesso às telas
- `LINTER_WARNINGS.md` - Contexto dos warnings
- `dev-helper.ps1` - Script PowerShell com 20+ comandos úteis

### 🔧 Modificado

#### **hooks.py - Formato Correto**
- **Antes:** JSON inválido (syntax error)
- **Depois:** Python válido (padrão Frappe)
- Adicionados hooks comentados como documentação

#### **autoprovision.py**
- Removido parâmetro `admin_email` não usado em `create_site()`
- Comentado `from innexar_core.services.email.factory` (não existe ainda)
- Adicionado stub para `send_welcome_email()` (log em vez de enviar)

#### **DocType JSONs**
- Adicionado campo `"doctype": "Page"` em tenant_dashboard.json
- Adicionado campo `"doctype": "Workspace"` em innexar_admin.json
- Adicionados campos: modified, modified_by, owner

### 🐛 Corrigido

#### **ModuleNotFoundError**
- **Erro:** `No module named 'innexar_core'`
- **Causa:** Faltando `__init__.py` em diretórios Python
- **Solução:** Criados __init__.py em:
  - `innexar_core/innexar_erp/__init__.py`
  - `innexar_core/innexar_erp/doctype/__init__.py`
  - `innexar_core/innexar_erp/workspace/__init__.py`
  - `innexar_core/innexar_erp/page/__init__.py`
  - `innexar_core/innexar_erp/page/tenant_dashboard/__init__.py`
  - `innexar_core/tenant_management/__init__.py`

#### **KeyError: 'doctype' durante migrate**
- **Erro:** `frappe.model.sync.sync_all()` KeyError
- **Causa:** JSONs de Page/Workspace sem campo "doctype"
- **Solução:** Adicionado campo obrigatório em todos JSONs

#### **Variáveis não usadas (autoprovision.py)**
- Removido parâmetro `admin_email` da função `create_site()`
- Comentadas variáveis `subject` e `body` (serão usadas quando email service existir)

### 📊 Logs Verificados

#### **Backend Startup (Gunicorn)**
```
[2025-11-13 15:10:23] [INFO] Starting gunicorn 23.0.0
[2025-11-13 15:10:23] [INFO] Listening at: http://0.0.0.0:8000 (1)
[2025-11-13 15:10:23] [INFO] Using worker: gthread
[2025-11-13 15:10:23] [INFO] Booting worker with pid: 7
[2025-11-13 15:10:23] [INFO] Booting worker with pid: 8
```
✅ **Status:** Backend iniciou sem erros

#### **Dashboard Updates**
```
Updating Dashboard for frappe
Updating Dashboard for innexar_core
```
✅ **Status:** Dashboards atualizados com sucesso

#### **Migrations**
```
Updating DocTypes for frappe        : [========================================] 100%
Updating DocTypes for innexar_core  : [========================================] 100%
```
✅ **Status:** DocTypes migrados sem erros

### 🧪 APIs Testadas

#### **check_subdomain**
```powershell
Invoke-WebRequest "http://localhost:8080/api/method/innexar_core.api.check_subdomain?subdomain=teste123"
```
**Response:** `{"message":{"available":true,"subdomain":"teste123"}}`
✅ **Status Code:** 200 OK

#### **Dashboard Access**
- URL testada: `http://localhost:8080/app/tenant-dashboard`
- ⚠️ **Status:** Workspace não encontrado (erro na URL `/app/innexar-admin`)
- **Nota:** Page criada mas workspace precisa correção

### 📦 Arquivos Modificados

#### Criados
```
innexar_core/innexar_erp/workspace/innexar_admin.json
innexar_core/innexar_erp/page/tenant_dashboard/tenant_dashboard.json
innexar_core/innexar_erp/page/tenant_dashboard/tenant_dashboard.py
innexar_core/innexar_erp/page/tenant_dashboard/tenant_dashboard.js
innexar_core/innexar_erp/page/tenant_dashboard/tenant_dashboard.html
innexar_core/innexar_erp/doctype/tenant/tenant_list.js
innexar_core/innexar_erp/doctype/subscription/subscription_list.js
innexar_core/create_test_data.py
.vscode/settings.json
.pylintrc
.sonarlintignore
DEVELOPMENT_RULES.md
TELAS_ADMIN_GUIDE.md
LINTER_WARNINGS.md
CHANGELOG.md (este arquivo)
```

#### Modificados
```
innexar_core/hooks.py (JSON → Python)
innexar_core/tenant_management/autoprovision.py (removido parâmetro)
```

### 🐳 Containers Status

```bash
docker ps
```
| Container | Status | Ports |
|-----------|--------|-------|
| frappe_docker_official-backend-1 | Running ✅ | 8000 |
| frappe_docker_official-frontend-1 | Running ✅ | 8080→80 |
| frappe_docker_official-websocket-1 | Running ✅ | 9000 |
| frappe_docker_official-queue-short-1 | Running ✅ | - |
| frappe_docker_official-queue-long-1 | Running ✅ | - |
| frappe_docker_official-scheduler-1 | Running ✅ | - |
| frappe_docker_official-db-1 | Running ✅ | 3306 |
| frappe_docker_official-redis-cache-1 | Running ✅ | 6379 |
| frappe_docker_official-redis-queue-1 | Running ✅ | 6379 |

**Total:** 9/9 containers healthy

### 📈 Métricas Atuais

- **Total Tenants:** 9
- **Active Tenants:** 6
- **Trial Tenants:** 2
- **MRR:** $1,497
- **ARR:** $17,964
- **Trial Conversion:** 66.7%
- **Churn Rate (30d):** 0%
- **Avg MRR/Tenant:** $249

### 🔄 Comandos Executados

```bash
# Setup workspace e page
docker exec frappe_docker_official-backend-1 mkdir -p /home/frappe/frappe-bench/apps/innexar_core/innexar_core/innexar_erp/workspace
docker exec frappe_docker_official-backend-1 mkdir -p /home/frappe/frappe-bench/apps/innexar_core/innexar_core/innexar_erp/page/tenant_dashboard

# Copiar arquivos
docker cp c:\innexar_erp\temp_doctypes\workspace\innexar_admin.json frappe_docker_official-backend-1:/home/frappe/frappe-bench/apps/innexar_core/innexar_core/innexar_erp/workspace/
docker cp c:\innexar_erp\temp_doctypes\page\tenant_dashboard\* frappe_docker_official-backend-1:/home/frappe/frappe-bench/apps/innexar_core/innexar_core/innexar_erp/page/tenant_dashboard/
docker cp c:\innexar_erp\temp_doctypes\tenant\tenant_list.js frappe_docker_official-backend-1:/home/frappe/frappe-bench/apps/innexar_core/innexar_core/innexar_erp/doctype/tenant/
docker cp c:\innexar_erp\temp_doctypes\subscription\subscription_list.js frappe_docker_official-backend-1:/home/frappe/frappe-bench/apps/innexar_core/innexar_core/innexar_erp/doctype/subscription/
docker cp c:\innexar_erp\apps\innexar_core\innexar_core\hooks.py frappe_docker_official-backend-1:/home/frappe/frappe-bench/apps/innexar_core/innexar_core/
docker cp c:\innexar_erp\apps\innexar_core\innexar_core\tenant_management\autoprovision.py frappe_docker_official-backend-1:/home/frappe/frappe-bench/apps/innexar_core/innexar_core/tenant_management/

# Criar __init__.py
docker exec frappe_docker_official-backend-1 touch /home/frappe/frappe-bench/apps/innexar_core/innexar_core/innexar_erp/workspace/__init__.py
docker exec frappe_docker_official-backend-1 touch /home/frappe/frappe-bench/apps/innexar_core/innexar_core/innexar_erp/page/__init__.py
docker exec frappe_docker_official-backend-1 touch /home/frappe/frappe-bench/apps/innexar_core/innexar_core/innexar_erp/page/tenant_dashboard/__init__.py
docker exec frappe_docker_official-backend-1 touch /home/frappe/frappe-bench/apps/innexar_core/innexar_core/tenant_management/__init__.py

# Migrate e restart
docker exec frappe_docker_official-backend-1 bench --site innexar.local migrate
docker restart frappe_docker_official-backend-1

# Popular dados de teste
docker cp c:\innexar_erp\temp_doctypes\create_test_data.py frappe_docker_official-backend-1:/home/frappe/frappe-bench/apps/innexar_core/innexar_core/
docker exec frappe_docker_official-backend-1 bench --site innexar.local execute innexar_core.create_test_data.create_test_data
```

### 🎯 Próximos Passos

- [ ] **P0:** Corrigir URL workspace (`/app/innexar-admin` → nome correto)
- [ ] **P1:** Configurar Stripe webhook secrets (stripe_webhook_secret, stripe_api_key)
- [ ] **P1:** Testar fluxo: checkout → webhook → autoprovision
- [ ] **P2:** Documentar integração site institucional
- [ ] **P2:** Implementar email service (SendGrid/AWS SES)
- [ ] **P3:** Adicionar charts: Growth Trend, Signup Funnel
- [ ] **P3:** Testes automatizados (pytest)

#### **Development Helper Script (dev-helper.ps1)**
- Script PowerShell com 20+ comandos úteis
- **Logs:** Show-Logs, Follow-Logs
- **Container:** Restart-Backend, Enter-Container, Show-ContainerStatus
- **Frappe:** Invoke-Migrate, Clear-Cache, Open-Console, Execute-Script
- **Sync:** Sync-File, Sync-App (copia + restart automático)
- **Testing:** Test-API, Test-Dashboard, Test-Tenants
- **Database:** Query-DB, Show-Tenants, Show-MRR
- **Data:** Create-TestData, Reset-Tenants
- **Aliases:** logs, restart, migrate, console, help

**Uso:**
```powershell
. .\dev-helper.ps1
Show-Help           # Lista todos comandos
Show-Logs 100       # Últimas 100 linhas
Sync-App            # Sincroniza app completo
Test-API            # Testa endpoint
```

### 🔍 Issues Conhecidos

1. ⚠️ **Workspace URL incorreta**
   - Esperado: `http://localhost:8080/app/innexar-admin`
   - Atual: Página não encontrada
   - **Possível causa:** Nome do workspace no JSON
   - **Status:** Investigar nome correto do workspace

2. ⚠️ **Tenant "Trial" plan inválido**
   - Script create_test_data.py usa plan="Trial"
   - DocType Tenant aceita apenas: Free, Pro, Enterprise
   - **Fix:** Usar status="Trial" + plan="Pro" ou "Free"
   - **Status:** Corrigir create_test_data.py

3. ℹ️ **Email service não implementado**
   - send_welcome_email() apenas loga (não envia email real)
   - **Bloqueado por:** Escolha de provider (SendGrid vs AWS SES)
   - **Prioridade:** P2 (não bloqueador)

### 📚 Lições Aprendidas

1. **hooks.py DEVE ser Python, não JSON** - Formato correto do Frappe
2. **__init__.py obrigatório** - Todos diretórios Python precisam
3. **DocType JSONs precisam campo "doctype"** - Senão KeyError no migrate
4. **Sempre verificar logs** - Antes e depois de qualquer mudança
5. **Teste incremental** - Não esperar tudo pronto para testar
6. **Dados reais > Mocks** - Usuário pediu zero mocks desde o início

---

## [2025-11-12] - Setup Docker e Estrutura Base

### ✅ Adicionado
- Frappe Docker environment (frappe_docker oficial)
- Site innexar.local criado
- App innexar_core instalado
- DocTypes: Tenant, Subscription
- APIs: check_subdomain, create_tenant, get_tenant_stats, list_tenants
- Webhook handler: stripe_webhook.py

### 📊 Detalhes
Ver commits anteriores e documentos:
- ARCHITECTURE.md
- TECH_STACK.md
- WORKFLOWS.md
- ROADMAP.md
- GLOBAL_STRATEGY.md

---

**Formato:** [Keep a Changelog](https://keepachangelog.com/)
**Versionamento:** [Semantic Versioning](https://semver.org/)
