# Guia de Instalação - Innexar ERP (Windows)

## 🎯 Setup Completo no Windows

Este guia cobre a instalação do Frappe Framework e criação dos apps Innexar no Windows.

---

## ⚠️ IMPORTANTE: Pré-requisitos

### Opção 1: WSL2 (RECOMENDADO)
Frappe funciona melhor no Linux. No Windows, use WSL2:

```powershell
# Instalar WSL2 com Ubuntu
wsl --install -d Ubuntu-22.04

# Após instalação, abrir Ubuntu e seguir as instruções de Linux
```

### Opção 2: Windows Nativo (Experimental)
Possível mas com limitações. Use para desenvolvimento apenas.

---

## 🚀 Instalação WSL2 + Ubuntu (Recomendado)

### 1. Verificar WSL2

```powershell
# Verificar versão WSL
wsl --list --verbose

# Se não tiver WSL2, atualizar:
wsl --set-default-version 2
```

### 2. Instalar Ubuntu

```powershell
# Instalar Ubuntu 22.04
wsl --install -d Ubuntu-22.04

# Iniciar Ubuntu
wsl
```

### 3. Dentro do Ubuntu, instalar dependências

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências do Frappe
sudo apt install -y \
  python3.11 python3.11-dev python3.11-venv python3-pip \
  mariadb-server mariadb-client \
  redis-server \
  nodejs npm \
  git \
  wkhtmltopdf \
  libmysqlclient-dev \
  libffi-dev \
  libssl-dev \
  curl \
  supervisor

# Configurar MariaDB
sudo mysql_secure_installation
# Responda:
# - Set root password: Y → senha forte
# - Remove anonymous users: Y
# - Disallow root login remotely: N (para desenvolvimento)
# - Remove test database: Y
# - Reload privilege tables: Y

# Configurar MariaDB para Frappe
sudo nano /etc/mysql/mariadb.conf.d/50-server.cnf
```

**Adicionar no arquivo:**
```ini
[mysqld]
character-set-client-handshake = FALSE
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

[mysql]
default-character-set = utf8mb4
```

```bash
# Reiniciar MariaDB
sudo service mysql restart

# Configurar Redis
sudo service redis-server start

# Configurar Node.js (versão 18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar yarn
sudo npm install -g yarn
```

### 4. Instalar Frappe Bench

```bash
# Instalar frappe-bench
sudo pip3 install frappe-bench

# Verificar instalação
bench --version
# Deve mostrar: 5.x.x
```

### 5. Inicializar Frappe Bench

```bash
# Criar diretório para desenvolvimento
cd ~
mkdir innexar-dev
cd innexar-dev

# Inicializar bench (Frappe v15)
bench init frappe-bench \
  --frappe-branch version-15 \
  --python python3.11 \
  --verbose

# Isso vai:
# 1. Criar virtualenv Python
# 2. Clonar Frappe Framework
# 3. Instalar dependências Python
# 4. Instalar dependências Node.js

# Entrar no bench
cd frappe-bench
```

### 6. Criar Site de Desenvolvimento

```bash
# Criar novo site
bench new-site innexar.local \
  --db-name innexar_dev \
  --mariadb-root-password SUA_SENHA_MYSQL \
  --admin-password admin

# Definir site como default
bench use innexar.local

# Habilitar developer mode
bench --site innexar.local set-config developer_mode 1

# Desabilitar scheduler (evita jobs desnecessários em dev)
bench --site innexar.local set-config pause_scheduler 1
```

### 7. Adicionar ao hosts (Windows)

No **Windows** (não no WSL), editar:
```
C:\Windows\System32\drivers\etc\hosts
```

Adicionar:
```
127.0.0.1 innexar.local
```

---

## 📦 Criar Apps Innexar

### App 1: innexar_core

```bash
# Ainda dentro de frappe-bench/

# Criar app
bench new-app innexar_core

# Durante a criação, informar:
# Title: Innexar Core
# Description: Multi-tenant SaaS foundation for Innexar ERP
# Publisher: Innexar Inc
# Email: dev@innexar.com
# Icon: 🚀
# Color: #4F46E5
# App License: MIT

# Instalar app no site
bench --site innexar.local install-app innexar_core
```

### Estrutura do innexar_core

```bash
cd apps/innexar_core/innexar_core

# Criar módulos principais
mkdir -p {tenant_management,subscription_billing,user_management,audit_log,system_health}

# Criar estrutura de services (padrão SeaNotes)
mkdir -p services/{billing,email,tax,banking,ai,storage}

# Criar cada service com factory pattern
cd services/billing
touch __init__.py billing_service.py stripe_service.py factory.py

cd ../email
touch __init__.py email_service.py resend_service.py ses_service.py factory.py

cd ../tax
touch __init__.py tax_service.py avalara_service.py taxjar_service.py factory.py

cd ../banking
touch __init__.py banking_service.py plaid_service.py factory.py

cd ../ai
touch __init__.py ai_service.py openai_service.py factory.py

cd ../storage
touch __init__.py storage_service.py s3_service.py factory.py
```

### App 2: innexar_financial

```bash
cd ~/innexar-dev/frappe-bench

# Criar app
bench new-app innexar_financial

# Preencher:
# Title: Innexar Financial
# Description: US GAAP compliant financial management
# Publisher: Innexar Inc
# Email: dev@innexar.com
# Icon: 💰
# Color: #10B981
# App License: MIT

# Instalar
bench --site innexar.local install-app innexar_financial
```

### App 3: innexar_sales

```bash
# Criar app
bench new-app innexar_sales

# Preencher:
# Title: Innexar Sales
# Description: CRM and Sales Management
# Publisher: Innexar Inc
# Email: dev@innexar.com
# Icon: 📊
# Color: #F59E0B
# App License: MIT

# Instalar
bench --site innexar.local install-app innexar_sales
```

---

## 🔧 Configuração de Integrações

### Criar arquivo de configuração local

```bash
# Criar site_config.json com secrets
cd ~/innexar-dev/frappe-bench/sites/innexar.local

# Editar site_config.json
nano site_config.json
```

**Adicionar:**
```json
{
 "db_name": "innexar_dev",
 "db_password": "...",
 "developer_mode": 1,
 "pause_scheduler": 1,
 
 "stripe_secret_key": "sk_test_...",
 "stripe_publishable_key": "pk_test_...",
 "stripe_webhook_secret": "whsec_...",
 "stripe_free_price_id": "price_...",
 "stripe_pro_price_id": "price_...",
 
 "avalara_account_id": "...",
 "avalara_license_key": "...",
 "avalara_environment": "sandbox",
 
 "plaid_client_id": "...",
 "plaid_secret": "...",
 "plaid_environment": "sandbox",
 
 "resend_api_key": "re_...",
 "resend_from_email": "noreply@innexar.com",
 
 "openai_api_key": "sk-...",
 
 "base_url": "http://innexar.local:8000"
}
```

---

## 🎨 Configuração Frontend

### Instalar dependências adicionais

```bash
cd ~/innexar-dev/frappe-bench

# Instalar bibliotecas Python adicionais
bench --site innexar.local pip install \
  stripe \
  plaid-python \
  openai \
  resend \
  boto3

# Para desenvolvimento frontend
cd apps/innexar_core
yarn install
```

---

## 🚀 Iniciar Desenvolvimento

### Opção 1: Bench Start (Recomendado para desenvolvimento)

```bash
cd ~/innexar-dev/frappe-bench

# Iniciar todos os serviços
bench start
```

Isso inicia:
- Web server (port 8000)
- SocketIO (port 9000)
- Redis
- Scheduler (se habilitado)
- Workers

**Acessar:** http://innexar.local:8000

Login:
- User: Administrator
- Password: admin

### Opção 2: Serviços separados (para debug)

Terminal 1:
```bash
bench watch
```

Terminal 2:
```bash
bench serve --port 8000
```

Terminal 3:
```bash
bench worker
```

---

## 🛠️ Ferramentas de Desenvolvimento

### VS Code Setup

```bash
# Instalar extensões recomendadas (no Windows):
# 1. WSL (Microsoft)
# 2. Python (Microsoft)
# 3. Pylance
# 4. GitLens
# 5. ESLint
# 6. Prettier

# Abrir projeto no VS Code através do WSL:
code .
```

### Criar .vscode/settings.json

```json
{
  "python.defaultInterpreterPath": "./env/bin/python",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "files.exclude": {
    "**/__pycache__": true,
    "**/*.pyc": true
  }
}
```

---

## ✅ Verificação do Setup

### Checklist

```bash
# 1. Verificar Frappe
bench version
# Deve mostrar: frappe 15.x.x

# 2. Verificar apps instalados
bench --site innexar.local list-apps
# Deve mostrar: frappe, innexar_core, innexar_financial, innexar_sales

# 3. Verificar site está rodando
curl http://innexar.local:8000
# Deve retornar HTML

# 4. Verificar MariaDB
bench mariadb
# Deve conectar ao MySQL

# 5. Verificar Redis
redis-cli ping
# Deve retornar: PONG

# 6. Verificar logs
bench --site innexar.local console
>>> frappe.get_installed_apps()
# Deve listar os apps
```

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to MySQL"
```bash
sudo service mysql status
sudo service mysql start
```

### Erro: "Redis connection failed"
```bash
sudo service redis-server status
sudo service redis-server start
```

### Erro: "Port 8000 already in use"
```bash
# Parar bench
bench stop

# Ou mudar porta
bench serve --port 8001
```

### Erro: "Module not found"
```bash
# Reinstalar dependências
bench setup requirements
bench build
```

### WSL2 está lento
```bash
# No Windows, criar/editar: %USERPROFILE%\.wslconfig

[wsl2]
memory=8GB
processors=4
swap=2GB
```

```powershell
# Reiniciar WSL
wsl --shutdown
wsl
```

---

## 📊 Estrutura Final

```
innexar-dev/
└── frappe-bench/
    ├── apps/
    │   ├── frappe/              # Frappe Framework (auto)
    │   ├── innexar_core/        # Nosso app core
    │   ├── innexar_financial/   # Módulo financeiro
    │   └── innexar_sales/       # Módulo vendas
    │
    ├── sites/
    │   ├── innexar.local/       # Nosso site de dev
    │   │   ├── site_config.json # Configurações
    │   │   └── private/         # Arquivos privados
    │   └── assets/              # Static files
    │
    ├── config/                  # Bench config
    ├── env/                     # Python virtualenv
    ├── logs/                    # Application logs
    └── node_modules/            # Node dependencies
```

---

## 🎯 Próximos Passos

1. ✅ Setup completo
2. ⏳ Criar primeiro DocType (Tenant)
3. ⏳ Implementar Service Factory Pattern
4. ⏳ Criar System Health Dashboard
5. ⏳ Integrar Stripe

---

**Setup pronto! Vamos começar a desenvolver!** 🚀
