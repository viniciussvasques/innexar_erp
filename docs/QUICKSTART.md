# 🚀 Innexar ERP - Quick Start Guide

## Setup Completo com Docker (Solução Simplificada)

Devido à complexidade do setup Docker com Frappe, vamos usar uma abordagem híbrida:

### Opção 1: Development Container (Recomendado)

Use o repositório oficial do Frappe com Docker:

```powershell
# 1. Clonar frappe_docker
git clone https://github.com/frappe/frappe_docker.git
cd frappe_docker

# 2. Copiar configuração
cp example.env .env
cp -r overrides development

# 3. Iniciar
docker-compose -f compose.yaml -f overrides/compose.erpnext.yaml up -d

# 4. Criar site
docker-compose exec backend bench new-site innexar.local --admin-password admin123

# 5. Acessar
# http://localhost:8080
# Login: Administrator / admin123
```

### Opção 2: WSL2 + Bench (Mais Controle)

Para desenvolvimento com hot reload:

```powershell
# 1. Instalar WSL2
wsl --install -d Ubuntu-22.04

# 2. Dentro do Ubuntu
wsl

# 3. Instalar Frappe
sudo apt update
sudo apt install -y python3-dev python3-pip redis-server mariadb-server

# 4. Instalar bench
sudo pip3 install frappe-bench

# 5. Inicializar
bench init frappe-bench --frappe-branch version-15
cd frappe-bench

# 6. Criar site
bench new-site innexar.local --admin-password admin123

# 7. Criar nossos apps
bench new-app innexar_core
bench --site innexar.local install-app innexar_core

# 8. Iniciar
bench start
```

---

## 📦 Apps Innexar - Estrutura Pronta

Já criamos a estrutura base:

```
apps/innexar_core/
├── innexar_core/
│   ├── tenant_management/
│   │   └── autoprovision.py ✅ (Sistema de autoprovision)
│   ├── subscription_billing/
│   └── services/
│       └── billing/
├── setup.py
├── requirements.txt
└── hooks.py
```

### ✨ Funcionalidades Implementadas:

1. **Autoprovisionamento** (`autoprovision.py`):
   - ✅ `provision_new_tenant()` - Cria tenant automaticamente
   - ✅ `check_subdomain_available()` - API para validar subdomain
   - ✅ Instalação automática de apps por plano
   - ✅ Configuração de integrações (Stripe, Avalara)
   - ✅ Email de boas-vindas

2. **Service Factory Pattern** (próximo passo):
   - Billing (Stripe)
   - Email (Resend / AWS SES)
   - Tax (Avalara / TaxJar)
   - Banking (Plaid)
   - AI (OpenAI)

---

## 🎨 Próximas Telas a Criar:

### 1. Login Multi-tenant
```
/signup → Página pública
├── Escolher subdomain (cliente123.innexar.com)
├── Escolher plano (Free, Pro, Enterprise)
├── Pagamento Stripe
└── → Autoprovision → Redirect para tenant
```

### 2. Dashboard Admin
```
/admin → Painel gerencial
├── Lista de Tenants (tabela)
├── Status (Active, Suspended, Cancelled)
├── Métricas (MRR, Churn, Growth)
└── Ações (Suspend, Delete, View)
```

### 3. Área do Cliente
```
/{tenant}/desk → Workspace customizado
├── Dashboard principal
├── Módulos instalados
├── Navegação por apps
└── Settings
```

---

## ⚡ Quick Deploy

Escolha seu método preferido:

### A) Docker Oficial (Produção-Ready)
```powershell
git clone https://github.com/frappe/frappe_docker
cd frappe_docker
docker-compose up -d
```

### B) WSL2 Local (Desenvolvimento)
```powershell
wsl --install
# Seguir INSTALL_WINDOWS.md
```

### C) Manual (Máximo controle)
Ver documentação completa em `INSTALL_WINDOWS.md`

---

## 🔑 Credenciais Padrão

- **User**: Administrator
- **Password**: admin123
- **Database**: innexar_root_2024

⚠️ **Mudar em produção!**

---

**Qual método você prefere? Posso configurar qualquer um deles agora!** 🚀
