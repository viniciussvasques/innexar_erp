# 🚀 Innexar ERP - Multi-Tenant SaaS Platform

**World-class ERP platform built with Frappe Framework**

[![Frappe](https://img.shields.io/badge/Frappe-v15-blue)](https://frappeframework.com)
[![Python](https://img.shields.io/badge/Python-3.11-green)](https://python.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Features](#-features)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Começando](#-começando)
- [Desenvolvimento](#-desenvolvimento)
- [Documentação](#-documentação)
- [Status](#-status)

---

## 🎯 Visão Geral

Sistema ERP SaaS multi-tenant completo, focado em competir com líderes globais do mercado (NetSuite, SAP Business One, Microsoft Dynamics).

**Arquitetura:** Site-based multi-tenancy (1 database por tenant)
**Deploy:** Docker containers orchestrated via docker-compose
**Market:** USA (Phase 1) → Brazil → LATAM

### Por que Frappe?

- ✅ Framework maduro (usado por ERPNext, líder open-source)
- ✅ Multi-tenancy nativo
- ✅ UI completa (Desk, forms, reports, dashboards)
- ✅ REST API automática para todos DocTypes
- ✅ Background jobs (Celery + Redis)
- ✅ Real-time via WebSockets
- ✅ Extensível (hooks, custom apps)

---

## ✨ Features

### Implementadas ✅

- **Dashboard Admin** - KPIs, charts, métricas em tempo real
- **Tenant Management** - CRUD, list views customizados
- **Subscription Billing** - Plans (Free/Pro/Enterprise), MRR tracking
- **Public APIs** - check_subdomain, create_tenant
- **Webhook Handlers** - Stripe integration ready
- **Data Visualization** - Chart.js integration
- **Multi-language** - EN, PT-BR, ES

### Em Desenvolvimento 🚧

- Stripe autoprovision (webhook → create tenant)
- Email service (welcome emails, notifications)
- System health monitoring
- Signup funnel analytics
- Revenue forecasting

### Roadmap 📅

- **Q1 2026:** Accounting module (GL, AP, AR)
- **Q2 2026:** Inventory & Warehouse management
- **Q3 2026:** Manufacturing (BOM, Work Orders)
- **Q4 2026:** CRM & Sales pipeline

---

## 🛠 Tecnologias

### Backend
- **Python 3.11** - Core language
- **Frappe Framework v15** - ERP foundation
- **MariaDB 11.8** - Relational database
- **Redis 6.2** - Cache + queue
- **Gunicorn** - WSGI server

### Frontend
- **Frappe Desk** - Admin UI
- **Chart.js** - Data visualization
- **Bootstrap 5** - UI framework
- **Vanilla JS** - Custom interactions

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **Nginx** - Reverse proxy
- **Certbot** - SSL certificates (production)

### Integrations
- **Stripe** - Payment processing
- **Avalara** - Tax compliance (USA)
- **Plaid** - Banking integration (planned)
- **SendGrid/AWS SES** - Email delivery (planned)

---

## 📁 Estrutura do Projeto

```
innexar_erp/
├── apps/
│   └── innexar_core/              # Custom Frappe app
│       └── innexar_core/
│           ├── hooks.py           # App configuration
│           ├── api.py             # Public APIs
│           ├── stripe_webhook.py  # Webhook handlers
│           └── innexar_erp/       # Module
│               ├── doctype/       # DocTypes (Tenant, Subscription)
│               ├── page/          # Custom pages (Dashboard)
│               └── workspace/     # Workspaces (Admin)
├── docker/                        # Docker configs
├── temp_doctypes/                 # Development files
├── ARCHITECTURE.md                # System architecture
├── TECH_STACK.md                  # Technology details
├── WORKFLOWS.md                   # Business processes
├── ROADMAP.md                     # 12-month plan
├── DEVELOPMENT_RULES.md           # Frappe development guidelines ⭐
├── CHANGELOG.md                   # Detailed change log ⭐
├── TELAS_ADMIN_GUIDE.md           # UI access guide
├── dev-helper.ps1                 # Development helper script ⭐
└── README.md                      # This file
```

**⭐ Arquivos importantes para desenvolvimento**

---

## 🚀 Começando

### Pré-requisitos

- Windows 10/11
- Docker Desktop instalado
- PowerShell 5.1+
- 8GB RAM mínimo (16GB recomendado)

### Instalação Rápida

```powershell
# 1. Clone o repositório
git clone https://github.com/viniciussvasques/innexar-erp.git
cd innexar_erp

# 2. Inicie os containers (da pasta frappe_docker_official)
cd ..\frappe_docker_official
docker-compose up -d

# 3. Aguarde containers iniciarem (2-3 minutos)
docker ps  # Deve mostrar 9 containers running

# 4. Acesse o sistema
# URL: http://localhost:8080
# User: Administrator
# Pass: admin123
```

### URLs Importantes

- **Login:** http://localhost:8080
- **Dashboard Admin:** http://localhost:8080/app/tenant-dashboard
- **Tenants List:** http://localhost:8080/app/tenant
- **Subscriptions:** http://localhost:8080/app/subscription

---

## 💻 Desenvolvimento

### Setup Ambiente de Desenvolvimento

```powershell
# Carregar helper script
. .\dev-helper.ps1

# Ver comandos disponíveis
Show-Help

# Comandos mais usados:
Show-Logs 100       # Ver logs
Restart-Backend     # Reiniciar após mudanças
Sync-App            # Sincronizar código + restart
Test-API            # Testar endpoints
```

### Workflow de Desenvolvimento

#### 1. **Fazer mudanças localmente** (Windows)
```powershell
# Editar arquivos em:
c:\innexar_erp\apps\innexar_core\innexar_core\...
```

#### 2. **Copiar para container**
```powershell
Sync-File 'c:\innexar_erp\apps\innexar_core\innexar_core\api.py' '/home/frappe/frappe-bench/apps/innexar_core/innexar_core/api.py'
```

#### 3. **Aplicar mudanças**
```powershell
# Se mudou DocTypes, Pages, Workspaces:
Invoke-Migrate

# Se mudou Python (hooks.py, controllers):
Restart-Backend

# Se mudou apenas JS/CSS:
Clear-Cache
```

#### 4. **Verificar logs**
```powershell
Show-Logs 50
# Ou seguir em tempo real:
Follow-Logs
```

#### 5. **Testar**
```powershell
# APIs
Test-API 'innexar_core.api.check_subdomain'

# UI
Test-Dashboard
Test-Tenants

# Database
Show-Tenants
Show-MRR
```

### Comandos Úteis

```powershell
# Database queries
Query-DB "SELECT * FROM tabTenant LIMIT 10"

# Executar script Python
Execute-Script "innexar_core.create_test_data.create_test_data"

# Console Python interativo
Open-Console

# Status containers
Show-ContainerStatus

# Entrar no container (bash)
Enter-Container
```

### Criar Dados de Teste

```powershell
Create-TestData
# Cria 9 tenants com MRR de $1,497/mês
```

---

## 📚 Documentação

### Documentos Principais

- **[DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md)** - Regras Frappe, estrutura, erros comuns ⭐
- **[CHANGELOG.md](CHANGELOG.md)** - Histórico detalhado de todas mudanças ⭐
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Arquitetura do sistema
- **[TECH_STACK.md](TECH_STACK.md)** - Detalhes técnicos
- **[WORKFLOWS.md](WORKFLOWS.md)** - Processos de negócio
- **[ROADMAP.md](ROADMAP.md)** - Planejamento 12 meses
- **[TELAS_ADMIN_GUIDE.md](TELAS_ADMIN_GUIDE.md)** - Guia de acesso UI

### Documentação Externa

- **Frappe Framework:** https://frappeframework.com/docs
- **ERPNext (referência):** https://docs.erpnext.com
- **Docker Setup:** README_DOCKER.md

---

## 📊 Status

### Ambiente

```
✅ Docker Desktop: Running
✅ Containers: 9/9 healthy
✅ Backend: http://localhost:8080
✅ Database: MariaDB 11.8
✅ Cache: Redis 6.2
```

### Métricas Atuais (Dados de Teste)

```
Total Tenants: 9
Active Tenants: 6
MRR: $1,497
ARR: $17,964
Trial Conversion: 66.7%
Churn Rate (30d): 0%
```

### Health Check

```powershell
# Verificar status
Show-ContainerStatus

# Ver logs recentes
Show-Logs 30

# Testar API
Test-API
```

---

## 🔧 Troubleshooting

### Container não inicia
```powershell
docker-compose down
docker-compose up -d
Show-Logs 100
```

### Erro "ModuleNotFoundError"
```powershell
# Verificar __init__.py em todos diretórios
docker exec frappe_docker_official-backend-1 find /home/frappe/frappe-bench/apps/innexar_core -type d -name "*.py" -exec dirname {} \; | xargs -I {} touch {}/__init__.py

Restart-Backend
```

### Dashboard não carrega
```powershell
Clear-Cache
Restart-Backend
```

### Migrate falha
```powershell
# Ver erro completo
Show-Logs 200

# Tentar com --force
docker exec frappe_docker_official-backend-1 bench --site innexar.local migrate --force
```

---

## 🤝 Contribuindo

1. Leia **[DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md)**
2. Faça mudanças seguindo padrões Frappe
3. Teste localmente (APIs + UI)
4. Verifique logs (sem erros)
5. Atualize **[CHANGELOG.md](CHANGELOG.md)**
6. Commit com mensagem descritiva

### Padrão de Commits

```
feat: adiciona novo módulo de inventário
fix: corrige cálculo de MRR em subscriptions
docs: atualiza DEVELOPMENT_RULES com novas guidelines
refactor: reorganiza estrutura de DocTypes
test: adiciona testes para tenant creation
```

---

## 📜 License

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

## 👥 Autores

- **Vinicius Vasques** - [viniciussvasques](https://github.com/viniciussvasques)

---

## 🙏 Acknowledgments

- **Frappe Framework** - Robust ERP foundation
- **ERPNext** - Reference implementation
- **SeaNotes** - Pattern inspiration
- **Docker Community** - Containerization best practices

---

**Last Updated:** 2025-11-13  
**Version:** 0.0.1-alpha  
**Status:** Active Development 🚧

---

## 📞 Support

- **Issues:** https://github.com/viniciussvasques/innexar-erp/issues
- **Docs:** Veja pasta de documentação
- **Helper:** `Show-Help` no PowerShell

**Built with ❤️ using Frappe Framework**
