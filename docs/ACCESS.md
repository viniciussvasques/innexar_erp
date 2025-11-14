# ✅ Innexar ERP - Sistema Rodando!

## 🎉 Acesso

**URL:** http://localhost:8080

**Login:**
- **User:** `Administrator`
- **Pass:** `admin123`

---

## 📦 Apps Instalados

✅ **frappe** - Framework base
✅ **innexar_core** - Nosso app customizado

---

## 🎯 Próximos Passos - Criar via Web

### 1. Criar DocType: Tenant

1. Acessar: http://localhost:8080/app/doctype
2. Clicar em **New**
3. Preencher:
   - **Name:** Tenant
   - **Module:** Innexar Erp
   
**Fields:**
```
tenant_name (Data, Required)
subdomain (Data, Unique, Required)
site_name (Data, Read Only)
admin_email (Data, Required)
company_name (Data)
plan (Select: Free, Pro, Enterprise)
status (Select: Active, Suspended, Cancelled, Trial)
stripe_customer_id (Data)
stripe_subscription_id (Data)
created_at (Datetime, Default: now)
trial_ends_at (Datetime)
```

### 2. Criar DocType: Subscription

**Fields:**
```
tenant (Link: Tenant, Required)
plan (Select: Free, Pro, Enterprise)
status (Select: Active, Cancelled, Past Due)
mrr (Currency)
stripe_subscription_id (Data)
current_period_start (Date)
current_period_end (Date)
cancel_at_period_end (Check)
```

### 3. Criar Workspace: Innexar Admin

Dashboard para gerenciar todos os tenants:
- Lista de tenants
- Métricas (MRR, Churn, Total clientes)
- Gráficos

---

## 🛠️ Comandos Úteis

### Acessar container
```powershell
docker exec -it frappe_docker_official-backend-1 bash
```

### Console Python
```powershell
docker exec -it frappe_docker_official-backend-1 bench --site innexar.local console
```

### Ver logs
```powershell
docker logs -f frappe_docker_official-backend-1
```

### Migrar após mudanças
```powershell
docker exec frappe_docker_official-backend-1 bench --site innexar.local migrate
```

### Rebuild frontend
```powershell
docker exec frappe_docker_official-backend-1 bench build
```

### Limpar cache
```powershell
docker exec frappe_docker_official-backend-1 bench --site innexar.local clear-cache
```

---

## 📝 Criar DocTypes via Código (Alternativa)

Se preferir criar via código em vez da web:

```bash
# Entrar no container
docker exec -it frappe_docker_official-backend-1 bash

# Navegar para o app
cd /home/frappe/frappe-bench/apps/innexar_core

# Criar novo DocType
bench --site innexar.local new-doctype Tenant

# Editar o JSON em:
# apps/innexar_core/innexar_core/innexar_erp/doctype/tenant/tenant.json
```

---

## 🎨 Próxima Sessão: Criar Telas

1. **Página de Signup** - /signup (pública)
2. **Dashboard Admin** - /admin (gerenciar tenants)
3. **Área do Cliente** - Workspace customizado

**Pronto para começar!** 🚀
