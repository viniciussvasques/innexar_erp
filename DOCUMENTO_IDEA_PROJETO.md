## Visão Geral do Projeto Innexar ERP

Este documento consolida a visão completa do projeto Innexar ERP, um ambiente multi-tenant construído sobre o Frappe Framework v15 e ERPNext v15, com o aplicativo customizado `innexar`. O objetivo é entregar uma solução SaaS modular para os mercados dos EUA e Brasil, garantindo isolamento por cliente (tenant), flexibilidade de planos e controle total do código-fonte e infraestrutura.

---

## Objetivos Principais
- Disponibilizar um ERP multi-tenant com isolamento por container (um stack Docker por cliente).
- Permitir planos configuráveis que ativam módulos, recursos e limites.
- Controlar 100% do código-fonte (Frappe, ERPNext e app Innexar) dentro de um monorepo.
- Personalizar branding, layout e comportamento do core ERP.
- Automatizar provisionamento de novos clientes, incluindo criação de sites e instalação de apps.

---

## Estrutura do Repositório

```
innexar/
├── frappe/                  # Source oficial Frappe (fork com customizações)
├── erpnext/                 # Source oficial ERPNext (fork com customizações)
├── innexar/                 # Aplicativo customizado Innexar
├── images/
│   ├── frappe/              # Dockerfile customizado do framework
│   └── erpnext/             # Dockerfile customizado do ERP (se necessário)
├── sites/                   # Sites de cada tenant (persistidos via volumes)
│   ├── tenant1.local/
│   └── tenant2.local/
└── docker/
    ├── images/
    │   └── frappe/Dockerfile
    └── compose/
        ├── tenant-1/docker-compose.yml
        └── tenant-2/docker-compose.yml
```

- **Controle de código**: as pastas `frappe`, `erpnext` e `innexar` são carregadas dentro da imagem Docker via `COPY`, permitindo personalizações completas.
- **Sites**: armazenados em `innexar/sites`, montados como volume para cada container.
- **Stacks**: cada tenant possui um `docker-compose.yml` dedicado com backend, MariaDB e Redis isolados.

---

## Pipeline de Provisionamento e Deploy

1. **Clonar fontes oficiais** e ajustar para a versão alvo (ex.: `version-15`).
2. **Criar o app `innexar`** via CLI do Frappe (sem `bench init`), estruturando `hooks.py`, `doctype/`, `public/`, `www/`, etc.
3. **Construir imagem Docker personalizada** (`docker/images/frappe/Dockerfile`):
   - Instala dependências do sistema (MariaDB client, Redis tools, Node, Yarn, wkhtmltopdf).
   - Copia fontes locais (`frappe`, `erpnext`, `innexar`) para `/workspace`.
   - Instala cada app em modo `editable` via `pip install -e`.
   - Executa `yarn install && yarn build` em cada app para compilar assets.
   - Define entrypoint `frappe serve`.
4. **Criar sites** dentro do container:
   - `frappe --site tenantX.local new-site`
   - `frappe --site tenantX.local install-app erpnext`
   - `frappe --site tenantX.local install-app innexar`
5. **Executar docker-compose por tenant**:
   - Monta volumes de código (`frappe`, `erpnext`, `innexar`) e `sites/tenantX.local`.
   - Expõe porta exclusiva (ex.: 8001 → 8000).
   - Garante que alterações no código reflitam instantaneamente via bind mounts.

---

## Customização de Layout e Assets

- Brandings, layouts e templates são ajustados diretamente nas fontes:
  - `frappe/frappe/templates`, `frappe/frappe/public/scss`
  - `erpnext/erpnext/public`, `erpnext/erpnext/public/scss`
  - `innexar/innexar/public/css`, `innexar/innexar/public/js`
- Após alterações visuais, executar:
  ```
  cd frappe   && yarn build
  cd ../erpnext && yarn build
  cd ../innexar && yarn build
  ```
- Reiniciar container do backend para refletir mudanças (`docker compose restart backend`).

---

## Modelo de Planos e Modularização

### Conceito Central
**Plano = Conjunto de módulos, recursos e limites.**  
Cada cliente é associado a um plano que define:
- Módulos ERP ativos (CRM, Estoque, Vendas, etc.).
- Recursos extras (APIs, integrações, automações).
- Limites de usuários, armazenamento, requisições.
- Feature flags específicas do app Innexar.

### DocTypes Principais

1. **Innexar Subscription Plan**
   - `plan_name`, `monthly_price`, `yearly_price`
   - `max_users`, `max_storage_gb`, `rate_limit_api`
   - Child tables:
     - `enabled_modules`: lista de módulos com `module_name`
     - `enabled_features`: lista de chaves (`feature_key`) e `enabled`
   - Campo `active` para habilitar/desabilitar plano.

2. **Innexar Tenant**
   - Dados de cada cliente: `tenant_name`, `site_name`, `plan`
   - Atributos: `active`, `container_id/url`, `usage_storage`, `used_api_requests`, `last_billing_date`

3. **Innexar Feature Flag**
   - Controle dinâmico de recursos: `tenant`, `feature_key`, `enabled`
   - Permite validações runtime (`innexar.feature_enabled("api_access")`)

---

## Fluxo de Provisionamento de Tenant

1. **Seleção de Plano** via página pública `/pricing` (`pricing.html`, `pricing.js`, `pricing.py`).
2. **API de criação** (`POST /api/method/innexar.api.create_tenant`):
   - Executa comandos `frappe` dentro do container (via helper `run_in_docker`):
     - `new-site`
     - `install-app erpnext`
     - `install-app innexar`
   - Registra novo documento `Innexar Tenant` com plano escolhido.
   - Chama `apply_plan_to_tenant(plan, domain)`.
3. **Aplicar plano ao tenant** (`innexar/api/plan_manager.py`):
   - `frappe.init(site)` e `frappe.connect()` para operar no contexto do site do cliente.
   - **Habilitar módulos**: desabilita todos e reabilita apenas os do plano.
   - **Configurar feature flags**: cria documentos `Innexar Feature Flag`.
   - **Aplicar limites**: atualiza `System Settings` e outras DocTypes (ex.: `Innexar API Settings`).
   - Comita e destrói contexto Frappe.

---

## Segurança e Controle de Acesso

- Hook global em `innexar/hooks.py` sobrescrevendo métodos whitelisted:
  ```python
  override_whitelisted_methods = {
      "*": "innexar.api.auth.validate_access"
  }
  ```
- `validate_access` identifica tenant pela requisição e consulta feature flags/planos:
  - Bloqueia módulos e endpoints não pertencentes ao plano.
  - Exibe mensagem amigável: “Este recurso não faz parte do seu plano.”

---

## Páginas e Experiência do Usuário

- **Página Pública `/pricing`**:
  - Lista planos, recursos e preços.
  - Permite selecionar plano e iniciar fluxo de criação de conta.
  - Pode integrar com meios de pagamento (Stripe, PayPal, Braintree).

- **Dashboard do Cliente (`/tenant-dashboard`)**:
  - Exibe plano atual, recursos habilitados, status de assinatura.
  - Mostra uso de limites (storage, usuários, API).
  - Oferece ações como upgrade, gerenciamento de billing, suporte.

---

## Operação Multi-Tenant

- Cada cliente possui stack isolado (`docker/compose/tenant-X`).
- Componentes por stack:
  - `backend` (container com Frappe, ERPNext, Innexar)
  - `mariadb`
  - `redis`
- Cada stack define domínio, porta, volumes e variáveis específicas.
- Permite escalar horizontalmente, customizar recursos por cliente e facilitar manutenção independente.

---

## Próximos Passos

1. **Configurar repositório** com submódulos/forks de Frappe e ERPNext.
2. **Inicializar app `innexar`** com DocTypes base e hooks.
3. **Implementar pagina `/pricing`** e API de provisionamento.
4. **Codificar `plan_manager`** com toda a lógica de ativação de módulos/limites.
5. **Adicionar testes** para DocTypes e fluxos críticos.
6. **Documentar configurações** em `PROJECT_CONTEXT.md` e demais arquivos de referência.

Este documento serve como referência inicial para alinhar visão, escopo e arquitetura do Innexar ERP.

