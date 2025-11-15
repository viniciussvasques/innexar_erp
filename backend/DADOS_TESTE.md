# 🧪 Dados de Teste - Innexar ERP

**Criado em:** 2025-11-14  
**Status:** ✅ Criado e Verificado

---

## 🌐 Tenant de Teste

**Nome:** Test Company  
**Schema:** testcompany  
**URL:** `http://testcompany.localhost:8000`  
**Status:** ✅ Ativo

---

## 👤 Usuários Criados

### 1. Administrador ✅

- **Email:** `admin@testcompany.com`
- **Senha:** `admin123`
- **Nome:** Admin Test
- **Role:** Administrator (acesso total a todos os módulos)
- **Staff:** Sim
- **Ativo:** Sim
- **Limite de Desconto:** 5% (padrão)

### 2. Vendedor ✅

- **Email:** `seller@testcompany.com`
- **Senha:** `seller123`
- **Nome:** Seller Test
- **Role:** Seller (vendedor - permissões limitadas)
- **Limite de Desconto:** 10%
- **Staff:** Não
- **Ativo:** Sim

---

## 🔗 Como Acessar

### 1. Configurar Hosts (Windows)

**IMPORTANTE:** Adicione ao arquivo `C:\Windows\System32\drivers\etc\hosts`:

```
127.0.0.1 testcompany.localhost
```

**Como editar:**

1. Abra o Notepad como Administrador
2. Abra o arquivo: `C:\Windows\System32\drivers\etc\hosts`
3. Adicione a linha: `127.0.0.1 testcompany.localhost`
4. Salve

### 2. Frontend

```
http://testcompany.localhost:3000
```

**Login:**

- Email: `admin@testcompany.com`
- Senha: `admin123`

### 3. Backend API

```
http://testcompany.localhost:8000/api/v1/
```

**Swagger UI:**

```
http://testcompany.localhost:8000/api/docs/
```

### 4. Admin Django

```
http://testcompany.localhost:8000/admin/
```

**Login:**

- Email: `admin@testcompany.com`
- Senha: `admin123`

---

## 🧪 Testar Login

### Via API (curl)

```bash
# Login Admin
curl -X POST http://testcompany.localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@testcompany.com",
    "password": "admin123"
  }'

# Login Seller
curl -X POST http://testcompany.localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seller@testcompany.com",
    "password": "seller123"
  }'
```

### Via Swagger

1. Acesse: `http://testcompany.localhost:8000/api/docs/`
2. Use o endpoint `/api/v1/auth/login/`
3. Teste com os credenciais acima

---

## 📝 Notas

- O tenant foi criado no schema `testcompany`
- Os usuários foram criados dentro do schema do tenant
- O role 'Administrator' tem acesso total a todos os módulos
- O role 'Seller' tem permissões limitadas (ver seed_roles_and_modules)

---

## 🔄 Recriar Dados

Para recriar os dados de teste:

```bash
docker compose exec web python create_test_data.py
```
