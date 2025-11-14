# 🐳 Innexar ERP - Setup com Docker Desktop

Guia rápido para rodar Innexar ERP com Docker Desktop no Windows.

---

## ✅ Pré-requisitos

1. **Docker Desktop** instalado e rodando
2. **Git** instalado
3. **Make** (opcional, facilita comandos)
   - Instalar via Chocolatey: `choco install make`
   - Ou usar comandos docker-compose diretos

---

## 🚀 Quick Start (3 passos)

### 1. Clonar repositório

```powershell
cd C:\
git clone https://github.com/viniciussvasques/Innexar-erp.git innexar_erp
cd innexar_erp
```

### 2. Configurar ambiente

```powershell
# Copiar .env de exemplo (já existe)
# Editar .env se quiser mudar senhas padrão

# Criar diretórios necessários
mkdir apps, sites, logs -Force
```

### 3. Iniciar containers

```powershell
# Com Make (recomendado)
make up

# OU sem Make
docker-compose up -d
```

**Aguardar ~2 minutos** para setup inicial...

---

## 🌐 Acessar aplicação

### Adicionar ao hosts do Windows

Editar: `C:\Windows\System32\drivers\etc\hosts`

Adicionar:
```
127.0.0.1 innexar.local
```

### URLs:

- **ERP Principal**: http://innexar.local
- **Login**:
  - User: `Administrator`
  - Password: `admin123`

### Ferramentas Dev (modo dev):

```powershell
make dev
```

- **Adminer (DB)**: http://localhost:8080
  - Server: `mariadb`
  - User: `root`
  - Password: `innexar_root_2024`
  
- **Redis Commander**: http://localhost:8081

---

## 📋 Comandos Principais

### Com Make:

```powershell
make up          # Iniciar containers
make down        # Parar containers
make restart     # Reiniciar
make logs        # Ver logs
make shell       # Entrar no container Frappe
make console     # Python console do Frappe
make db          # MySQL shell
make redis       # Redis CLI
make backup      # Backup do banco
make migrate     # Rodar migrations
make clean       # Limpar tudo (⚠️ deleta dados)
```

### Sem Make (docker-compose direto):

```powershell
# Iniciar
docker-compose up -d

# Parar
docker-compose down

# Ver logs
docker-compose logs -f frappe

# Entrar no container
docker exec -it innexar_frappe bash

# Ver status
docker-compose ps
```

---

## 🔧 Desenvolvimento

### Criar novo app Innexar

```powershell
# Entrar no container
docker exec -it innexar_frappe bash

# Dentro do container:
cd /home/frappe/frappe-bench
bench new-app innexar_core

# Preencher:
# - App Name: innexar_core
# - Title: Innexar Core
# - Description: Multi-tenant SaaS foundation
# - Publisher: Innexar Inc
# - Email: dev@innexar.com
# - Icon: 🚀
# - Color: #4F46E5

# Instalar app
bench --site innexar.local install-app innexar_core

# Sair
exit
```

### Estrutura de diretórios

```
innexar_erp/
├── apps/                    # Apps Frappe (seus apps customizados)
│   ├── frappe/             # Framework (auto)
│   ├── erpnext/            # ERPNext (auto)
│   ├── innexar_core/       # ⭐ Seu app core
│   ├── innexar_financial/  # ⭐ Módulo financeiro
│   └── innexar_sales/      # ⭐ Módulo vendas
│
├── sites/                   # Sites (tenants)
│   ├── innexar.local/      # Site principal
│   │   ├── site_config.json
│   │   ├── private/
│   │   └── public/
│   └── assets/             # Assets compilados
│
├── logs/                    # Application logs
├── docker/                  # Configs Docker
│   ├── nginx/
│   └── mariadb/
│
├── docker-compose.yml       # Produção
├── docker-compose.dev.yml   # Dev overrides
├── Dockerfile.frappe        # Imagem customizada
├── .env                     # Environment vars
└── Makefile                 # Comandos helper
```

---

## 🏗️ Criar Apps Innexar (pela primeira vez)

### App 1: innexar_core

```bash
# Dentro do container
bench new-app innexar_core

# Criar módulos base
cd apps/innexar_core/innexar_core
mkdir tenant_management subscription_billing user_management

# Criar services (padrão factory)
mkdir -p services/{billing,email,tax,banking,ai}

# Criar primeiro DocType
cd tenant_management
cat > tenant.json << 'EOF'
{
 "name": "Tenant",
 "module": "Tenant Management",
 "doctype": "DocType",
 "fields": [
  {"fieldname": "tenant_name", "label": "Tenant Name", "fieldtype": "Data", "reqd": 1},
  {"fieldname": "subdomain", "label": "Subdomain", "fieldtype": "Data", "unique": 1},
  {"fieldname": "status", "label": "Status", "fieldtype": "Select", "options": "Active\nInactive\nSuspended"}
 ]
}
EOF

# Voltar e instalar
cd /home/frappe/frappe-bench
bench --site innexar.local install-app innexar_core
```

### App 2: innexar_financial

```bash
bench new-app innexar_financial
bench --site innexar.local install-app innexar_financial
```

### App 3: innexar_sales

```bash
bench new-app innexar_sales
bench --site innexar.local install-app innexar_sales
```

---

## 🎨 Criar Telas Principais

Agora vamos criar as 3 telas base que você pediu:

### 1. Login Multi-tenant (com subdomain)

Arquivo: `apps/innexar_core/innexar_core/public/js/login.js`

### 2. Dashboard Admin

Arquivo: `apps/innexar_core/innexar_core/admin_dashboard/page/admin_dashboard.py`

### 3. Área do Cliente (Painel ERP)

Usar Frappe Workspace nativo customizado.

**Vou criar esses arquivos agora!** 🚀

---

## 🔄 Hot Reload (Auto-refresh)

```powershell
# Modo dev com hot reload
make dev

# OU manualmente
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Webpack watch (auto rebuild frontend)
docker exec -it innexar_frappe bench watch
```

---

## 📊 Monitoramento

### Ver logs em tempo real

```powershell
# Todos os containers
docker-compose logs -f

# Só Frappe
docker-compose logs -f frappe

# Últimas 100 linhas
docker-compose logs -f --tail=100 frappe
```

### Status dos containers

```powershell
docker-compose ps
```

### Uso de recursos

```powershell
docker stats
```

---

## 🗄️ Banco de Dados

### Acessar via Adminer (GUI)

```powershell
make dev
# Abrir: http://localhost:8080
```

### Acessar via CLI

```powershell
make db

# OU
docker exec -it innexar_mariadb mysql -u root -pinnexar_root_2024
```

### Backup manual

```powershell
make backup

# OU
docker exec innexar_frappe bench --site innexar.local backup --with-files
```

### Restaurar backup

```powershell
# Listar backups
docker exec innexar_frappe ls sites/innexar.local/private/backups/

# Restaurar
docker exec -it innexar_frappe bench --site innexar.local restore <arquivo-backup>
```

---

## 🧪 Testes

```powershell
# Rodar todos os testes
make test

# Rodar testes de um app específico
docker exec -it innexar_frappe bench --site innexar.local run-tests --app innexar_core

# Testes de um módulo
docker exec -it innexar_frappe bench --site innexar.local run-tests --module innexar_core.tenant_management
```

---

## 🐛 Troubleshooting

### Container não inicia

```powershell
# Ver logs de erro
docker-compose logs frappe

# Verificar status
docker-compose ps
```

### Erro: "Port already in use"

```powershell
# Ver processo usando porta 8000
netstat -ano | findstr :8000

# Matar processo (substitua PID)
taskkill /PID <PID> /F

# OU mudar porta no docker-compose.yml
# ports:
#   - "8001:8000"
```

### Erro: "Cannot connect to database"

```powershell
# Verificar MariaDB está rodando
docker-compose ps mariadb

# Reiniciar MariaDB
docker-compose restart mariadb

# Ver logs
docker-compose logs mariadb
```

### Redis connection failed

```powershell
docker-compose restart redis
```

### Frappe bench crash

```powershell
# Reconstruir container
docker-compose down
docker-compose up -d --build frappe

# OU limpar cache
docker exec -it innexar_frappe bench --site innexar.local clear-cache
docker-compose restart frappe
```

### Permissões (Linux/WSL)

```bash
# Dentro do container
sudo chown -R frappe:frappe /home/frappe/frappe-bench
```

---

## 🔒 Segurança

### Produção (⚠️ IMPORTANTE)

Antes de deploy em produção:

1. **Mudar todas as senhas** no `.env`
2. **Gerar chaves fortes**:
   ```bash
   # JWT Secret
   openssl rand -base64 32
   
   # Encryption Key
   openssl rand -base64 32
   ```

3. **Configurar SSL** (HTTPS)
4. **Habilitar firewall**
5. **Limitar acesso SSH**
6. **Configurar backups automáticos**

---

## 🚢 Deploy Produção

### Usar docker-compose.prod.yml (criar depois)

```powershell
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Checklist produção:

- [ ] SSL/TLS configurado
- [ ] Senhas fortes
- [ ] Backups automáticos
- [ ] Monitoring (Sentry, Grafana)
- [ ] Rate limiting
- [ ] CDN para assets
- [ ] Redis persistence
- [ ] MariaDB replication

---

## 📚 Próximos Passos

Agora que o ambiente está rodando, vamos:

1. ✅ Criar apps Innexar (core, financial, sales)
2. ✅ Criar tela de Login multi-tenant
3. ✅ Criar Dashboard Admin
4. ✅ Criar Área do Cliente
5. ⏳ Implementar service factory pattern
6. ⏳ Integrar Stripe
7. ⏳ Integrar Avalara (sales tax)
8. ⏳ Integrar Plaid (banking)

---

**Setup Docker completo! Vamos criar as telas agora!** 🎨
