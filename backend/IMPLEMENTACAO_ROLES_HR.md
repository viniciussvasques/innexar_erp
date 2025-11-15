# ✅ Implementação: Sistema de Roles/Permissions + Módulo HR

**Data:** 2025-11-14  
**Status:** ✅ Implementado

---

## 📋 O que foi implementado

### 1. Sistema de Roles e Permissions (Módulo Users)

#### Modelos Criados

- **Role** - Função/Cargo dentro da empresa

  - Campos: name, code, description, is_active
  - Traduções: ✅ Todos os campos

- **Module** - Módulo do ERP

  - Campos: code, name, description, icon, order, is_active
  - Traduções: ✅ Todos os campos

- **Permission** - Permissão de acesso a módulo
  - Campos: role, module, level (none, view, create, edit, delete, admin)
  - Traduções: ✅ Choices traduzidos

#### User Model Estendido

- **Campos adicionados:**

  - `roles` (ManyToMany) - Funções do usuário
  - `assigned_warehouse` (FK) - Warehouse atribuído
  - `allowed_warehouses` (ManyToMany) - Warehouses permitidos
  - `discount_limit_percent` - Limite de desconto
  - `client_portfolio` (ManyToMany) - Carteira de clientes

- **Métodos adicionados:**
  - `has_module_permission(module_code, required_level)` - Verifica permissão
  - `can_apply_discount(discount_percent)` - Verifica limite de desconto
  - `get_accessible_warehouses()` - Retorna warehouses acessíveis

#### APIs Criadas

- **Roles:**

  - `GET /api/v1/auth/roles/` - Listar roles
  - `POST /api/v1/auth/roles/` - Criar role
  - `GET /api/v1/auth/roles/{id}/` - Detalhes
  - `PUT /api/v1/auth/roles/{id}/` - Atualizar
  - `DELETE /api/v1/auth/roles/{id}/` - Deletar

- **Modules:**

  - `GET /api/v1/auth/modules/` - Listar módulos (read-only)

- **Permissions:**

  - `GET /api/v1/auth/permissions/` - Listar permissões
  - `POST /api/v1/auth/permissions/` - Criar permissão
  - Query params: `role_id`, `module_id`

- **Users:**
  - `GET /api/v1/auth/users/` - Listar usuários
  - `POST /api/v1/auth/users/` - Criar usuário
  - `GET /api/v1/auth/users/{id}/` - Detalhes
  - `POST /api/v1/auth/users/{id}/assign_roles/` - Atribuir roles
  - `GET /api/v1/auth/users/{id}/permissions/` - Ver permissões do usuário

#### Permissions DRF

- **HasModulePermission** - Classe de permissão customizada
  - Verifica se usuário tem acesso ao módulo
  - Suporta níveis: view, create, edit, delete, admin
  - Superuser tem acesso total

#### Admin

- Admin para Role, Module, Permission
- UserAdmin atualizado com roles e campos de vendedor

#### Seed Command

- `python manage.py seed_roles_and_modules`
- Cria módulos padrão (users, crm, sales, warehouse, etc.)
- Cria roles padrão (admin, sales_manager, seller, etc.)
- Cria permissões para cada role

---

### 2. Módulo HR (Human Resources)

#### Modelos Criados

- **Department** - Departamento

  - Campos: name, code, description, manager, is_active
  - Traduções: ✅ Todos os campos

- **Company** - Empresa da Pessoa (LLC, S-Corp, etc.)

  - Campos: legal_name, trade_name, company_type, ein, address, owner
  - Tipos: LLC, S-Corp, C-Corp, Partnership, Sole Proprietorship
  - Traduções: ✅ Todos os campos e choices

- **Employee** - Funcionário
  - Campos completos: dados pessoais, profissionais, contrato
  - **Suporte a contratação via empresa:**
    - `hire_type`: individual ou company
    - `company`: FK para Company (se contratado via empresa)
  - Tipos de contrato: W2, 1099, LLC, S-Corp, CLT, PJ, etc.
  - `employee_number` gerado automaticamente (EMP-000001)
  - Traduções: ✅ Todos os campos e choices

#### APIs Criadas

- **Departments:**

  - `GET /api/v1/hr/departments/` - Listar
  - `POST /api/v1/hr/departments/` - Criar
  - Query params: `active_only=true`

- **Companies:**

  - `GET /api/v1/hr/companies/` - Listar
  - `POST /api/v1/hr/companies/` - Criar
  - Query params: `owner_id`, `active_only=true`

- **Employees:**
  - `GET /api/v1/hr/employees/` - Listar
  - `POST /api/v1/hr/employees/` - Criar
  - `GET /api/v1/hr/employees/by_user/` - Por user_id
  - Query params: `department_id`, `warehouse_id`, `status`, `hire_type`, `active_only=true`

#### Admin

- Admin para Department, Company, Employee
- Fieldsets organizados
- Filtros e busca configurados

---

## 🌐 Traduções

### Idiomas Suportados

- Inglês (en) - Padrão
- Português Brasil (pt-br)
- Espanhol (es)

### O que foi traduzido

- ✅ Todos os modelos (verbose_name, help_text)
- ✅ Todos os choices (get_XXX_display)
- ✅ Mensagens de erro
- ✅ Mensagens de sucesso
- ✅ Admin (labels, descriptions)

### Como usar

1. **Gerar arquivos de tradução:**

   ```bash
   python manage.py makemessages -l pt_BR
   python manage.py makemessages -l es
   ```

2. **Editar traduções:**

   - Acesse `/rosetta/` (interface web)
   - Ou edite manualmente: `locale/pt_BR/LC_MESSAGES/django.po`

3. **Compilar traduções:**
   ```bash
   python manage.py compilemessages
   ```

---

## 📝 Próximos Passos

### Para testar

1. **Criar migrations:**

   ```bash
   docker compose exec web python manage.py makemigrations users
   docker compose exec web python manage.py makemigrations hr
   ```

2. **Aplicar migrations:**

   ```bash
   docker compose exec web python manage.py migrate_schemas --shared
   docker compose exec web python manage.py migrate
   ```

3. **Popular dados iniciais:**
   ```bash
   docker compose exec web python manage.py seed_roles_and_modules
   ```

### Para continuar

- [ ] Criar APIs de Roles e Permissions (ViewSets já criados, falta testar)
- [ ] Implementar folha de pagamento (Payroll)
- [ ] Implementar controle de ponto (TimeRecord)
- [ ] Implementar férias (Vacation)
- [ ] Implementar benefícios (Benefit)
- [ ] Testar todas as APIs
- [ ] Adicionar mais traduções se necessário

---

## 🔗 Arquivos Criados/Modificados

### Criados

- `backend/apps/users/models.py` (atualizado)
- `backend/apps/users/permissions.py`
- `backend/apps/users/serializers.py` (atualizado)
- `backend/apps/users/views.py` (atualizado)
- `backend/apps/users/admin.py` (atualizado)
- `backend/apps/users/management/commands/seed_roles_and_modules.py`
- `backend/apps/hr/` (módulo completo)
  - `models.py`
  - `serializers.py`
  - `views.py`
  - `urls.py`
  - `admin.py`
  - `apps.py`

### Modificados

- `backend/config/settings.py` (adicionado apps.hr)
- `backend/config/urls.py` (adicionado path hr/)

---

## ✅ Checklist de Implementação

### Sistema de Roles/Permissions

- [x] Modelos Role, Module, Permission
- [x] User model estendido
- [x] Permissions DRF
- [x] Serializers
- [x] ViewSets
- [x] URLs
- [x] Admin
- [x] Seed command
- [x] Traduções

### Módulo HR

- [x] Modelo Department
- [x] Modelo Company (empresa da pessoa)
- [x] Modelo Employee (com suporte a contratação via empresa)
- [x] Serializers
- [x] ViewSets
- [x] URLs
- [x] Admin
- [x] Traduções

### Pendente

- [ ] Migrations (precisa rodar no Docker)
- [ ] Testes
- [ ] Documentação de APIs atualizada

---

**⚠️ IMPORTANTE:** Execute as migrations e o seed command antes de usar!
