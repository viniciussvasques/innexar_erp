# Innexar ERP - Arquitetura Multi-Tenant SaaS

## 📋 Visão Geral

**Innexar ERP** é um sistema ERP SaaS multi-tenant baseado em Frappe/ERPNext, projetado para escalabilidade, modularidade e customização.

---

## 🏗️ Arquitetura Geral

### Stack Tecnológico

#### Backend
- **Framework**: Frappe Framework v15+
- **Database**: MariaDB 10.6+ (com multi-tenancy por site)
- **Cache**: Redis (sessions, queues, realtime)
- **Task Queue**: RQ (Redis Queue) para jobs assíncronos
- **Search**: Full-text search nativo do MariaDB
- **API**: REST + GraphQL

#### Frontend
- **Framework**: Frappe UI (Vue.js 3)
- **Customização**: Opção de frontend Next.js (futuro)
- **UI Components**: Frappe UI + Custom components
- **State Management**: Vue Composition API + Pinia
- **Build**: Vite

#### Infrastructure
- **Containers**: Docker + Docker Compose
- **Orchestration**: Kubernetes (produção)
- **Proxy**: Nginx (reverse proxy + load balancer)
- **SSL**: Let's Encrypt (Certbot)
- **Monitoring**: Prometheus + Grafana
- **Logs**: ELK Stack (Elasticsearch, Logstash, Kibana)

---

## 🏢 Arquitetura Multi-Tenant

### Estratégia: Site-Based Multi-Tenancy

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer (Nginx)                │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼───────┐  ┌────────▼──────┐
│   tenant1.com  │  │ tenant2.com  │  │ tenant3.com   │
│   (Site/DB)    │  │  (Site/DB)   │  │  (Site/DB)    │
└────────────────┘  └──────────────┘  └───────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                ┌───────────▼──────────┐
                │  Shared Resources:   │
                │  - Redis             │
                │  - File Storage      │
                │  - Background Jobs   │
                └──────────────────────┘
```

### Características:
- **1 Database por Tenant** - Isolamento total de dados
- **Sites Frappe** - Cada tenant é um "site" Frappe
- **Domain Mapping** - Custom domains ou subdomains
- **Shared Infrastructure** - Redis, workers compartilhados
- **Cross-tenant Isolation** - Segurança por design

---

## 📦 Estrutura de Módulos

### Módulos Core (Sempre Instalados)

#### 1. **Core System**
```
innexar_core/
├── user_management/      # Usuários, roles, permissões
├── tenant_management/    # Gestão de tenants/sites
├── billing/             # Faturamento SaaS (assinaturas)
├── audit_log/           # Logs de auditoria
└── settings/            # Configurações globais
```

#### 2. **Financeiro** (innexar_financial)
- **Contas a Pagar**
  - Cadastro de fornecedores
  - Lançamento de contas
  - Agendamento de pagamentos
  - Conciliação bancária
  - Fluxo de aprovação

- **Contas a Receber**
  - Cadastro de clientes
  - Emissão de boletos/cobranças
  - Controle de recebimentos
  - Negociação de dívidas
  - Relatórios de inadimplência

- **Livro Caixa/Bancos**
  - Múltiplas contas bancárias
  - Movimentações diárias
  - Transferências entre contas
  - Importação OFX/CNAB
  - Reconciliação automática

- **Fiscal/Tributário**
  - Emissão NF-e, NFS-e
  - Cálculo de impostos (ICMS, IPI, PIS, COFINS)
  - SPED Fiscal, Contribuições
  - Integração com Receita Federal
  - Apuração de impostos

- **Relatórios Gerenciais**
  - DRE (Demonstração do Resultado)
  - Fluxo de caixa projetado
  - Balanço patrimonial
  - Análise de custos
  - Dashboards financeiros

#### 3. **Vendas** (innexar_sales)
- **CRM**
  - Pipeline de vendas
  - Leads e oportunidades
  - Funil de conversão
  - Histórico de interações
  - Email marketing integrado

- **Pedidos de Venda**
  - Cotações e orçamentos
  - Pedidos (PV)
  - Aprovação de pedidos
  - Controle de descontos
  - Reserva de estoque

- **Faturamento**
  - Geração de NF a partir do PV
  - Emissão automática
  - Controle de remessa
  - Devoluções de vendas

- **Comissões**
  - Regras de comissionamento
  - Cálculo automático
  - Relatórios por vendedor
  - Pagamento de comissões

- **Tabela de Preços**
  - Múltiplas tabelas
  - Preços por cliente/região
  - Promoções e descontos
  - Regras de markup

#### 4. **Compras** (innexar_purchase)
- **Solicitação de Compras**
  - Requisições internas
  - Workflow de aprovação
  - Cotação de fornecedores
  - Comparativo de preços

- **Pedidos de Compra**
  - Ordem de compra (OC)
  - Acompanhamento de entregas
  - Recebimento parcial
  - Integração com fiscal

- **Gestão de Fornecedores**
  - Cadastro completo
  - Avaliação de desempenho
  - Histórico de compras
  - Contratos e condições

#### 5. **Estoque** (innexar_inventory)
- **Cadastro de Produtos**
  - Produtos e serviços
  - Variações (cor, tamanho)
  - Kits e combos
  - Códigos de barras
  - Imagens e anexos

- **Controle de Estoque**
  - Múltiplos armazéns
  - Movimentações (entrada/saída)
  - Transferências entre armazéns
  - Inventário cíclico
  - Estoque mínimo/máximo

- **Rastreabilidade**
  - Lotes e validade
  - Número de série
  - Localização (endereçamento)
  - Rastreio de movimentações

- **Inventário**
  - Contagem física
  - Ajustes de estoque
  - Perdas e ganhos
  - Relatórios de divergências

#### 6. **Recursos Humanos** (innexar_hr)
- **Cadastro de Colaboradores**
  - Dados pessoais
  - Documentos digitalizados
  - Histórico profissional
  - Dependentes

- **Folha de Pagamento**
  - Cálculo de salários
  - Horas extras
  - Descontos e benefícios
  - Integração eSocial
  - Geração de recibos

- **Ponto Eletrônico**
  - Registro de jornada
  - Banco de horas
  - Faltas e atrasos
  - Integração com REP (relógio)

- **Férias e Afastamentos**
  - Programação de férias
  - Aviso prévio
  - Licenças médicas
  - Controle de atestados

- **Recrutamento**
  - Vagas abertas
  - Processo seletivo
  - Candidatos
  - Entrevistas

#### 7. **Produção** (innexar_manufacturing)
- **Ordens de Produção**
  - Planejamento (MRP)
  - Ordens de fabricação
  - Controle de etapas
  - Apontamento de produção

- **Estrutura de Produtos (BOM)**
  - Lista de materiais
  - Rotas de produção
  - Operações e centros de trabalho
  - Versões de BOM

- **Qualidade**
  - Inspeção de qualidade
  - Não conformidades
  - Ações corretivas
  - Certificados

### Módulos Opcionais (Instaláveis)

#### 8. **E-commerce** (innexar_ecommerce)
- Integração com lojas online
- Sincronização de produtos
- Pedidos web → ERP
- Gestão de marketplaces

#### 9. **Service Desk** (innexar_helpdesk)
- Tickets de suporte
- SLA
- Base de conhecimento
- Chat integrado

#### 10. **Projetos** (innexar_projects)
- Gestão de projetos
- Tarefas e sprints
- Timesheet
- Gantt e Kanban

#### 11. **Ativos** (innexar_assets)
- Cadastro de ativos fixos
- Depreciação
- Manutenção preventiva
- Histórico de manutenções

#### 12. **BI & Analytics** (innexar_analytics)
- Dashboards customizáveis
- Relatórios avançados
- Data warehouse
- Integração Power BI

---

## 🔄 Fluxos Principais

### 1. Fluxo de Vendas Completo

```
┌─────────────┐
│    Lead     │ → Oportunidade criada no CRM
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Cotação    │ → Orçamento enviado ao cliente
└──────┬──────┘
       │ (Aprovação do cliente)
       ▼
┌─────────────┐
│ Pedido de   │ → Reserva de estoque
│   Venda     │ → Workflow de aprovação interna
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Separação  │ → Picking no estoque
│  de Estoque │ → Emissão de romaneio
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Emissão    │ → NF-e automática
│  de NF-e    │ → Baixa de estoque
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Contas a    │ → Financeiro integrado
│  Receber    │ → Geração de boleto
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Recebimento │ → Baixa automática
│  Pagamento  │ → Conciliação bancária
└─────────────┘
```

### 2. Fluxo de Compras

```
┌─────────────┐
│ Requisição  │ → Solicitação de departamento
│  de Compra  │ → Aprovação gerencial
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Cotação    │ → Envio para fornecedores
│ Fornecedores│ → Comparativo de preços
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Pedido de   │ → Ordem de compra (OC)
│   Compra    │ → Envio ao fornecedor
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Recebimento │ → Conferência física
│  de Mercad. │ → NF entrada
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Entrada no  │ → Atualização estoque
│  Estoque    │ → Custo médio
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Contas a    │ → Agendamento pagamento
│   Pagar     │ → Fluxo de aprovação
└─────────────┘
```

### 3. Fluxo de Produção

```
┌─────────────┐
│ Previsão de │ → Demanda de vendas
│   Vendas    │ → MRP (planejamento)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Ordem     │ → Separação de materiais
│    de       │ → Alocação de recursos
│  Produção   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Apontamento │ → Registro por operação
│    de       │ → Controle de tempo
│  Produção   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Inspeção   │ → Controle de qualidade
│    de       │ → Aprovação/Rejeição
│ Qualidade   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Entrada no  │ → Produto acabado
│  Estoque    │ → Custo de produção
└─────────────┘
```

### 4. Fluxo Fiscal/Contábil

```
┌─────────────┐
│ Movimentações│ → Vendas, Compras, Produção
│  Operacionais│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Emissão de │ → NF-e, NFS-e automáticas
│    Notas    │ → Cálculo de impostos
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Lançamentos │ → Integração contábil
│  Contábeis  │ → Partida dobrada
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Apuração   │ → ICMS, IPI, PIS, COFINS
│    de       │ → IRPJ, CSLL
│  Impostos   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   SPED      │ → Fiscal, Contribuições
│ (Obrigações)│ → EFD, ECD, ECF
└─────────────┘
```

---

## 🔐 Segurança e Permissões

### Níveis de Acesso

1. **Super Admin** - Gestão de tenants (SaaS)
2. **Tenant Admin** - Admin do cliente/empresa
3. **Manager** - Gestão de módulos específicos
4. **User** - Operação padrão
5. **Read Only** - Apenas visualização

### Recursos de Segurança

- ✅ **2FA (Two-Factor Auth)**
- ✅ **SSO (SAML, OAuth2)**
- ✅ **Audit Log completo**
- ✅ **Field-level permissions**
- ✅ **IP Whitelisting**
- ✅ **Session management**
- ✅ **Data encryption (at rest + transit)**
- ✅ **LGPD/GDPR compliance**

---

## 📊 Integrações

### Integrações Nativas

#### Fiscal/Tributário
- **NFe/NFSe**: Integração com SEFAZ
- **SPED**: Geração de arquivos
- **eSocial**: Envio de eventos trabalhistas
- **Receita Federal**: Consultas e validações

#### Bancárias
- **OFX/CNAB**: Importação extratos
- **Boletos**: Geração e registro
- **PIX**: Emissão e recebimento
- **TEF**: Terminal de pagamento

#### E-commerce
- **Shopify, WooCommerce, Magento**
- **Mercado Livre, B2W, Via**
- **Sincronização automática**

#### Comunicação
- **Email** (SMTP/IMAP)
- **WhatsApp Business API**
- **SMS (Twilio, Vonage)**
- **Slack/Teams** (notificações)

#### Logística
- **Correios, Jadlog, Total Express**
- **Cálculo de frete**
- **Rastreamento**

---

## 🚀 Roadmap de Implementação

### Fase 1 - Foundation (Mês 1-2)
- [ ] Setup infrastructure (Docker, CI/CD)
- [ ] Frappe bench setup
- [ ] Core system (users, tenants, billing)
- [ ] Multi-tenancy configuration
- [ ] Authentication & Authorization

### Fase 2 - Módulos Core (Mês 3-5)
- [ ] Financeiro básico (Contas a Pagar/Receber)
- [ ] Vendas (CRM, Pedidos, Faturamento)
- [ ] Compras (Requisição, OC, Recebimento)
- [ ] Estoque (Produtos, Movimentações)

### Fase 3 - Módulos Avançados (Mês 6-8)
- [ ] Fiscal/Tributário (NF-e, SPED)
- [ ] Produção (Ordens, BOM)
- [ ] RH (Folha, Ponto)
- [ ] Integrações bancárias

### Fase 4 - Marketplace & Escala (Mês 9-12)
- [ ] Sistema de módulos instaláveis
- [ ] Marketplace de apps
- [ ] Analytics avançado
- [ ] Mobile apps (React Native)

---

## 📈 Modelo de Negócio SaaS

### Planos de Assinatura

#### Starter - R$ 197/mês
- 5 usuários
- Módulos: Financeiro, Vendas, Estoque
- 5GB armazenamento
- Suporte por email

#### Professional - R$ 497/mês
- 20 usuários
- Todos os módulos core
- 50GB armazenamento
- Suporte prioritário
- API access

#### Enterprise - R$ 997/mês
- Usuários ilimitados
- Todos os módulos + opcionais
- 500GB armazenamento
- Suporte 24/7
- White-label
- Custom development

#### Custom - Sob consulta
- Infraestrutura dedicada
- SLA garantido
- Consultoria inclusa

---

## 🛠️ Ferramentas de Desenvolvimento

### Desenvolvimento Local
```bash
# Frappe Bench
bench init frappe-bench
bench new-site innexar.local
bench get-app innexar_core
bench install-app innexar_core
bench start
```

### Ambientes
- **Development**: Local (Docker)
- **Staging**: Cloud (testing)
- **Production**: Kubernetes cluster

### CI/CD Pipeline
1. **Commit** → GitHub
2. **Tests** → GitHub Actions
3. **Build** → Docker images
4. **Deploy** → Kubernetes (automated)

---

## 📞 Próximos Passos

1. ✅ Revisar esta arquitetura
2. ⏳ Definir prioridades de módulos
3. ⏳ Setup do ambiente de desenvolvimento
4. ⏳ Criar primeiros módulos (MVP)
5. ⏳ Testes e validação

---

**Documento criado em:** Novembro 2025  
**Versão:** 1.0  
**Status:** Em Planejamento
