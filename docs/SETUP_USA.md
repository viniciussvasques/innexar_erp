# Setup Inicial - Innexar ERP (USA Edition)

## 🇺🇸 Começando nos Estados Unidos

Este guia cobre o setup inicial do Innexar ERP com foco no mercado americano.

---

## 📋 Pré-requisitos

### 1. Ambiente de Desenvolvimento

**Opção A: macOS (Recomendado para desenvolvimento)**
```bash
# Instalar Homebrew (se ainda não tiver)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar dependências
brew install python@3.11 mariadb redis node git

# Instalar wkhtmltopdf (para PDFs)
brew install --cask wkhtmltopdf
```

**Opção B: Linux (Ubuntu/Debian)**
```bash
sudo apt update
sudo apt install -y \
  python3.11 python3.11-dev python3-pip \
  mariadb-server mariadb-client \
  redis-server \
  nodejs npm \
  git \
  wkhtmltopdf
```

**Opção C: Windows (WSL2 recomendado)**
```powershell
# Instalar WSL2
wsl --install -d Ubuntu-22.04

# Depois, seguir instruções Linux dentro do WSL
```

### 2. Contas Necessárias (US Market)

- [ ] **GitHub Account** - Para código
- [ ] **AWS Account** - Para hosting
  - [ ] Configure billing alerts
  - [ ] Enable MFA
- [ ] **Stripe Account** - Para pagamentos
  - [ ] Criar conta business (US entity)
  - [ ] Ativar modo teste
  - [ ] Configurar webhooks
- [ ] **Avalara Account** (ou TaxJar) - Para sales tax
  - [ ] Trial account (30 dias grátis)
  - [ ] Configurar nexus (estados onde você vende)
- [ ] **Plaid Account** - Para banking
  - [ ] Development account (grátis)
  - [ ] API keys (sandbox)
- [ ] **Domain** - Para SaaS
  - [ ] Sugestão: innexar.com, getinnexar.com
  - [ ] Registrar em Namecheap, Google Domains, etc
- [ ] **Email Service**
  - [ ] AWS SES (custo baixo, boa deliverability)
  - [ ] ou SendGrid, Mailgun

---

## 🚀 Instalação do Frappe Bench

### Passo 1: Instalar Frappe Bench

```bash
# Instalar bench CLI
pip3 install frappe-bench

# Verificar instalação
bench --version
```

### Passo 2: Inicializar Bench

```bash
# Criar diretório do projeto
mkdir ~/innexar-dev
cd ~/innexar-dev

# Inicializar bench (Frappe v15)
bench init frappe-bench \
  --frappe-branch version-15 \
  --python python3.11 \
  --verbose

# Entrar no bench
cd frappe-bench
```

### Passo 3: Criar Site

```bash
# Criar site de desenvolvimento
bench new-site innexar.local \
  --db-name innexar_dev \
  --mariadb-root-password YOUR_MYSQL_ROOT_PASSWORD \
  --admin-password admin

# Adicionar ao hosts (para acessar via browser)
# macOS/Linux:
sudo echo "127.0.0.1 innexar.local" >> /etc/hosts

# Windows (WSL):
# Adicionar manualmente: C:\Windows\System32\drivers\etc\hosts
```

### Passo 4: Configurar para Desenvolvimento

```bash
# Habilitar developer mode
bench --site innexar.local set-config developer_mode 1

# Desabilitar scheduler (evita jobs desnecessários)
bench --site innexar.local set-config pause_scheduler 1

# Configurar email (desenvolvimento - console)
bench --site innexar.local set-config mail_server "localhost"
bench --site innexar.local set-config mail_port 1025
```

---

## 📦 Criar Apps Innexar

### App 1: innexar_core (Foundation)

```bash
# Criar app
bench new-app innexar_core

# Preencher informações:
# Title: Innexar Core
# Description: Multi-tenant SaaS foundation for Innexar ERP
# Publisher: Innexar Inc
# Email: dev@innexar.com
# License: MIT
# Branch: main

# Instalar app no site
bench --site innexar.local install-app innexar_core
```

#### Estrutura Inicial (innexar_core)

```bash
cd apps/innexar_core/innexar_core

# Criar módulos
mkdir -p {tenant_management,subscription_billing,user_management,audit_log}

# Cada módulo terá:
# - doctype/
# - page/
# - report/
# - dashboard/
```

### App 2: innexar_financial (Accounting)

```bash
cd ~/innexar-dev/frappe-bench

# Criar app
bench new-app innexar_financial

# Preencher:
# Title: Innexar Financial
# Description: US GAAP compliant financial management
# Publisher: Innexar Inc

# Instalar
bench --site innexar.local install-app innexar_financial
```

### App 3: innexar_sales (CRM & Sales)

```bash
bench new-app innexar_sales
bench --site innexar.local install-app innexar_sales
```

---

## 🔧 Configuração de Integrações (US Market)

### Stripe Integration

```bash
# Instalar biblioteca Python
bench --site innexar.local pip install stripe

# Configurar API keys (test mode)
bench --site innexar.local set-config stripe_secret_key "sk_test_..."
bench --site innexar.local set-config stripe_publishable_key "pk_test_..."
```

**Criar webhook endpoint:**
```python
# apps/innexar_core/innexar_core/api/stripe_webhook.py

import frappe
import stripe
from frappe import _

@frappe.whitelist(allow_guest=True)
def stripe_webhook():
    payload = frappe.request.get_data()
    sig_header = frappe.request.headers.get('Stripe-Signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, frappe.conf.stripe_webhook_secret
        )
        
        # Handle different event types
        if event['type'] == 'invoice.payment_succeeded':
            handle_payment_success(event['data']['object'])
        elif event['type'] == 'invoice.payment_failed':
            handle_payment_failed(event['data']['object'])
            
        return {'status': 'success'}
    except Exception as e:
        frappe.log_error(f'Stripe webhook error: {str(e)}')
        return {'status': 'error'}, 400
```

### Avalara Integration (Sales Tax)

```bash
# Instalar biblioteca
bench --site innexar.local pip install avalara

# Configurar
bench --site innexar.local set-config avalara_account_id "YOUR_ACCOUNT"
bench --site innexar.local set-config avalara_license_key "YOUR_LICENSE"
bench --site innexar.local set-config avalara_environment "sandbox"
```

### Plaid Integration (Banking)

```bash
# Instalar biblioteca
bench --site innexar.local pip install plaid-python

# Configurar
bench --site innexar.local set-config plaid_client_id "YOUR_CLIENT_ID"
bench --site innexar.local set-config plaid_secret "YOUR_SECRET"
bench --site innexar.local set-config plaid_environment "sandbox"
```

---

## 🎨 Configuração do Frontend

### Custom Theme (US Market)

```bash
cd apps/innexar_core/innexar_core/public

# Criar CSS customizado
mkdir css
touch css/innexar.css
```

**innexar.css:**
```css
:root {
  /* Brand colors */
  --innexar-primary: #4F46E5; /* Indigo */
  --innexar-success: #10B981; /* Green */
  --innexar-warning: #F59E0B; /* Amber */
  --innexar-danger: #EF4444; /* Red */
  
  /* Fonts - US standard */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

/* Modern, clean interface */
.page-head {
  background: white;
  border-bottom: 1px solid #E5E7EB;
}

/* US date format */
.frappe-control[data-fieldtype="Date"] {
  /* MM/DD/YYYY format enforced */
}
```

### Incluir no build:

```python
# apps/innexar_core/innexar_core/hooks.py

app_include_css = [
    "/assets/innexar_core/css/innexar.css"
]

app_include_js = [
    "/assets/innexar_core/js/innexar.bundle.js"
]
```

---

## 🗄️ Configuração do Database

### Otimizações para MariaDB

```bash
# Editar configuração MariaDB
sudo nano /etc/mysql/mariadb.conf.d/50-server.cnf
```

**Adicionar:**
```ini
[mysqld]
# Performance
innodb_buffer_pool_size = 2G
innodb_log_file_size = 512M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT

# Character set (importante para i18n)
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# Timezone (UTC sempre)
default-time-zone = '+00:00'

# Logs
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow-query.log
long_query_time = 2
```

```bash
# Reiniciar MariaDB
sudo systemctl restart mariadb
```

---

## 🐳 Docker Setup (Opcional - Recomendado)

### docker-compose.yml

```yaml
version: '3.8'

services:
  frappe:
    build: 
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
      - "9000:9000"
    volumes:
      - ./apps:/home/frappe/frappe-bench/apps
      - ./sites:/home/frappe/frappe-bench/sites
    environment:
      - DB_HOST=mariadb
      - REDIS_CACHE=redis-cache:6379
      - REDIS_QUEUE=redis-queue:6379
    depends_on:
      - mariadb
      - redis-cache
      - redis-queue

  mariadb:
    image: mariadb:10.6
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: innexar_dev
    volumes:
      - mariadb-data:/var/lib/mysql
    command: 
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci

  redis-cache:
    image: redis:7-alpine
    volumes:
      - redis-cache-data:/data

  redis-queue:
    image: redis:7-alpine
    volumes:
      - redis-queue-data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./sites:/var/www/html/sites
    depends_on:
      - frappe

volumes:
  mariadb-data:
  redis-cache-data:
  redis-queue-data:
```

### Iniciar com Docker

```bash
# Build
docker-compose build

# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f frappe
```

---

## ✅ Checklist de Setup Completo

### Ambiente Base
- [ ] Frappe bench instalado
- [ ] Site criado (`innexar.local`)
- [ ] Developer mode ativado
- [ ] Apps criados (core, financial, sales)
- [ ] MariaDB otimizado
- [ ] Redis configurado

### Integrações US
- [ ] Stripe (test mode)
- [ ] Avalara/TaxJar (sandbox)
- [ ] Plaid (development)
- [ ] AWS SES (email)

### Development Tools
- [ ] VS Code com extensões:
  - [ ] Python
  - [ ] Frappe/ERPNext (se disponível)
  - [ ] GitLens
  - [ ] ESLint, Prettier
- [ ] Git configurado
- [ ] GitHub repository criado

### Testes
- [ ] Site acessível em http://innexar.local:8000
- [ ] Login com admin/admin funciona
- [ ] Apps aparecem na desk
- [ ] Logs sem erros

---

## 🚀 Próximos Passos

1. **Criar primeiro DocType** (Tenant)
2. **Setup CI/CD** (GitHub Actions)
3. **Deploy staging** (AWS)
4. **Começar Sprint 1** do Roadmap

---

## 📚 Recursos Úteis

### Documentação
- [Frappe Framework Docs](https://frappeframework.com/docs)
- [Frappe School](https://frappe.school) - Video tutorials
- [Stripe API Docs](https://stripe.com/docs/api)
- [Avalara API Docs](https://developer.avalara.com)

### Comunidade
- [Frappe Forum](https://discuss.frappe.io)
- [GitHub Discussions](https://github.com/frappe/frappe/discussions)
- [Discord](https://discord.gg/frappe)

### US-Specific Resources
- [IRS E-file](https://www.irs.gov/e-file-providers)
- [NACHA (ACH)](https://www.nacha.org)
- [GAAP Standards](https://www.fasb.org)

---

**Ready to build? Let's go! 🚀**
