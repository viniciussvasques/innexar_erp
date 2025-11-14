# Django Multi-tenant Quick Start

## ✅ **Projeto Migrado de Frappe para Django!**

### **Por que Django?**
- ✅ **Mais simples** que Frappe (menos "mágica")
- ✅ **Multi-tenancy nativo** com PostgreSQL schemas
- ✅ **Deploy fácil** (Railway, Render, Heroku)
- ✅ **Comunidade gigante** e documentação excelente
- ✅ **Controle total** do código
- ✅ **APIs REST** com Django REST Framework

---

## 🚀 **Início Rápido**

### **1. Subir Serviços**
```powershell
docker-compose up -d
```

Isso inicia:
- PostgreSQL 16 (porta 5432)
- Redis 7 (porta 6379)
- Django web server (porta 8000)
- Celery worker (background tasks)
- Celery beat (scheduled tasks)

### **2. Criar Schema Público (Tenants)**
```powershell
# Migrations para apps compartilhados (public schema)
docker-compose exec web python manage.py migrate_schemas --shared
```

### **3. Criar Primeiro Tenant**
```powershell
docker-compose exec web python manage.py shell
```

Dentro do shell:
```python
from apps.tenants.models import Tenant, Domain

# Criar tenant
tenant = Tenant.objects.create(
    name="ACME Corporation",
    schema_name="acme",  # Nome do schema PostgreSQL
    plan="professional"
)

# Criar domínio (subdomínio)
Domain.objects.create(
    domain="acme.localhost",  # Para dev: acme.localhost:8000
    tenant=tenant,
    is_primary=True
)

print(f"Tenant criado: {tenant.name} ({tenant.schema_name})")
exit()
```

### **4. Migrar Apps do Tenant**
```powershell
# Aplicar migrations nos schemas dos tenants
docker-compose exec web python manage.py migrate_schemas --tenant
```

### **5. Criar Superuser para Tenant**
```powershell
docker-compose exec web python manage.py create_tenant_superuser --schema=acme
```

---

## 🌐 **Acessar Aplicação**

### **APIs Públicas (Registro de Tenants)**
```
http://localhost:8000/api/v1/public/tenants/
http://localhost:8000/api/docs/  # Swagger UI
```

### **APIs do Tenant (ACME)**
```
http://acme.localhost:8000/api/v1/
http://acme.localhost:8000/admin/
```

**⚠️ Importante**: Use `acme.localhost:8000` (não `localhost:8000`) para acessar tenant.

---

## 📡 **Testar API**

### **1. Registrar Novo Tenant (Público)**
```powershell
curl -X POST http://localhost:8000/api/v1/public/tenants/ `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Test Company",
    "domain": "test",
    "plan": "starter"
  }'
```

### **2. Checar Disponibilidade de Subdomínio**
```powershell
curl "http://localhost:8000/api/v1/public/tenants/check-subdomain/?subdomain=acme"
```

### **3. Login (JWT)**
```powershell
curl -X POST http://acme.localhost:8000/api/v1/auth/token/ `
  -H "Content-Type: application/json" `
  -d '{
    "username": "admin",
    "password": "suasenha"
  }'
```

Resposta:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJh...",
  "access": "eyJ0eXAiOiJKV1QiLCJh..."
}
```

### **4. Acessar API Autenticado**
```powershell
curl http://acme.localhost:8000/api/v1/subscriptions/ `
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJh..."
```

---

## 🛠️ **Desenvolvimento Local (Sem Docker)**

```powershell
# Criar virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Instalar dependências
pip install -r requirements.txt

# Configurar .env
cp .env.example .env
# Editar .env com credenciais locais PostgreSQL/Redis

# Migrations
python manage.py migrate_schemas --shared

# Criar tenant
python manage.py shell
# (mesmo código acima)

python manage.py migrate_schemas --tenant

# Runserver
python manage.py runserver

# Celery (terminal separado)
celery -A config worker -l info
```

---

## 📋 **Comandos Úteis**

### **Migrations**
```powershell
# Criar migrations
docker-compose exec web python manage.py makemigrations

# Aplicar em schema público
docker-compose exec web python manage.py migrate_schemas --shared

# Aplicar em todos tenants
docker-compose exec web python manage.py migrate_schemas --tenant

# Aplicar em tenant específico
docker-compose exec web python manage.py migrate_schemas --schema=acme
```

### **Shell Django**
```powershell
docker-compose exec web python manage.py shell
```

### **Logs**
```powershell
# Ver logs web
docker-compose logs -f web

# Ver logs Celery
docker-compose logs -f celery

# Ver todos
docker-compose logs -f
```

---

## 🔧 **Troubleshooting**

### **Erro: "Tenant não encontrado"**
- Certifique-se de usar `acme.localhost:8000` (não `localhost:8000`)
- Verifique se domínio existe: `Domain.objects.all()`

### **Erro ao criar tenant**
- Verifique se migrations do public schema rodaram
- Veja se PostgreSQL está acessível

### **Portas em uso**
```powershell
# Parar todos containers
docker-compose down

# Remover volumes
docker-compose down -v
```

---

## 📚 **Próximos Passos**

1. ✅ Ambiente rodando
2. ⏳ Integrar Stripe webhooks
3. ⏳ Criar models de Customer/Invoice
4. ⏳ Frontend React/Next.js
5. ⏳ Deploy Railway/Render

Veja `docs/NEXT_STEPS.md` para roadmap completo!
