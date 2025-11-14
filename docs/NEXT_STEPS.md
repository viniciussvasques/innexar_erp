# 🚀 Innexar ERP - Próximos Passos

## ✅ Status Atual

- [x] Repositório frappe_docker clonado
- [x] Configuração `.env` criada
- [⏳] Download das imagens Docker (em progresso ~5min)
- [ ] Containers iniciados
- [ ] Site innexar.local criado
- [ ] Apps Innexar instalados

---

## 📋 Após Download Completar

### 1. Verificar containers rodando

```powershell
docker ps
```

Deve mostrar 10 containers:
- ✅ frappe_docker_official-backend-1
- ✅ frappe_docker_official-frontend-1
- ✅ frappe_docker_official-websocket-1
- ✅ frappe_docker_official-queue-short-1
- ✅ frappe_docker_official-queue-long-1
- ✅ frappe_docker_official-scheduler-1
- ✅ frappe_docker_official-db-1
- ✅ frappe_docker_official-redis-cache-1
- ✅ frappe_docker_official-redis-queue-1
- ✅ frappe_docker_official-configurator-1 (completa e sai)

### 2. Executar setup automático

```powershell
cd c:\innexar_erp
.\setup-innexar.ps1
```

Isso vai:
1. ✅ Aguardar containers prontos
2. ✅ Criar site `innexar.local`
3. ✅ Configurar developer mode
4. ✅ Adicionar ao hosts do Windows

### 3. Acessar Frappe

URL: **http://innexar.local:8080**

Login:
- User: `Administrator`
- Pass: `admin123`

---

## 🛠️ Criar Apps Innexar

### App 1: innexar_core

```bash
# Entrar no container
docker exec -it frappe_docker_official-backend-1 bash

# Criar app
cd /home/frappe/frappe-bench
bench new-app innexar_core

# Preencher:
# Title: Innexar Core
# Description: Multi-tenant SaaS foundation
# Publisher: Innexar Inc
# Email: dev@innexar.com
# Icon: 🚀
# Color: #4F46E5
# License: MIT

# Instalar no site
bench --site innexar.local install-app innexar_core

# Sair
exit
```

### Copiar código autoprovision

```powershell
# Copiar nosso código já criado para dentro do container
docker cp c:\innexar_erp\apps\innexar_core\innexar_core\tenant_management\autoprovision.py `
  frappe_docker_official-backend-1:/home/frappe/frappe-bench/apps/innexar_core/innexar_core/tenant_management/
```

---

## 🎨 Criar Telas (depois dos apps)

### 1. Tela de Login/Signup Multi-tenant

Localização: `apps/innexar_core/innexar_core/public/`

Funcionalidades:
- ✅ Escolha de subdomain em tempo real
- ✅ Validação de disponibilidade (API)
- ✅ Seleção de plano (Free/Pro/Enterprise)
- ✅ Checkout Stripe embedded
- ✅ Autoprovision após pagamento

### 2. Dashboard Admin

Localização: `apps/innexar_core/innexar_core/admin_dashboard/`

Funcionalidades:
- ✅ Lista de todos os tenants
- ✅ Métricas: MRR, Churn, Growth
- ✅ Gráficos de crescimento
- ✅ Ações: View, Suspend, Delete

### 3. Área do Cliente

Localização: Frappe Workspace customizado

Funcionalidades:
- ✅ Dashboard principal por tenant
- ✅ Widgets de cada módulo
- ✅ Navegação entre apps
- ✅ Settings e perfil

---

## 🔧 Comandos Úteis

### Ver logs
```powershell
docker-compose -f compose.yaml -f overrides/compose.mariadb.yaml -f overrides/compose.redis.yaml logs -f backend
```

### Shell do container
```powershell
docker exec -it frappe_docker_official-backend-1 bash
```

### Console Frappe (Python)
```powershell
docker exec -it frappe_docker_official-backend-1 bench --site innexar.local console
```

### Migrar após mudanças
```powershell
docker exec frappe_docker_official-backend-1 bench --site innexar.local migrate
```

### Rebuild frontend
```powershell
docker exec frappe_docker_official-backend-1 bench build
```

### Parar tudo
```powershell
cd c:\frappe_docker_official
docker-compose -f compose.yaml -f overrides/compose.mariadb.yaml -f overrides/compose.redis.yaml down
```

---

## 📊 Estrutura Final

```
c:\frappe_docker_official/
├── compose.yaml                 # Docker compose principal
├── .env                        # Configurações
├── overrides/
│   ├── compose.mariadb.yaml   # Database
│   └── compose.redis.yaml     # Cache
└── sites/
    └── innexar.local/         # Nosso site
        ├── site_config.json
        └── apps/
            ├── frappe/
            ├── erpnext/
            └── innexar_core/  # 🚀 Nosso app
```

---

**Aguardando download completar... ⏳**

Assim que terminar, vou executar o setup automaticamente! 🚀
