# Roadmap de Implementação - Innexar ERP

## 🎯 Estratégia de Desenvolvimento

### Abordagem: **MVP Incremental**
- Módulos core primeiro (gera receita rápido)
- Releases quinzenais
- Feedback contínuo dos early adopters
- Testes automatizados desde o início

---

## 📅 Timeline Geral

```
┌─────────────────────────────────────────────────────────────────┐
│  FASE 1: FOUNDATION        │  Mês 1-2  │  Infrastructure      │
├─────────────────────────────────────────────────────────────────┤
│  FASE 2: CORE MODULES      │  Mês 3-6  │  Financeiro + Vendas │
├─────────────────────────────────────────────────────────────────┤
│  FASE 3: OPERATIONS        │  Mês 7-9  │  Compras + Estoque   │
├─────────────────────────────────────────────────────────────────┤
│  FASE 4: ADVANCED          │  Mês 10-12│  Fiscal + Produção   │
├─────────────────────────────────────────────────────────────────┤
│  FASE 5: SCALE & GROWTH    │  Ano 2+   │  Marketplace + IA    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ FASE 1: FOUNDATION + USA COMPLIANCE (Mês 1-3)

### Objetivo: Infraestrutura sólida + compliance USA desde dia 1
### Foco: Mercado Americano (fundador baseado nos EUA)

#### Sprint 1 (Semana 1-2): Setup Infrastructure + US Compliance Prep
- [ ] **DevOps & CI/CD**
  - [ ] Repositório GitHub configurado
  - [ ] Docker & Docker Compose
  - [ ] GitHub Actions (CI/CD)
  - [ ] Ambientes: Dev, Staging, Prod (AWS US-East-1)
  - [ ] Monitoramento básico (CloudWatch)

- [ ] **Frappe Setup**
  - [ ] Frappe Bench instalado
  - [ ] Configuração multi-site
  - [ ] MariaDB + Redis configurados
  - [ ] Backup automático (S3)
  - [ ] Restore testado

- [ ] **US Compliance Foundation**
  - [ ] SSL/TLS (Let's Encrypt)
  - [ ] Data encryption at rest (AWS KMS)
  - [ ] Audit logging (CloudTrail)
  - [ ] Privacy policy (template CCPA)
  - [ ] Terms of Service (US-focused)

- [ ] **App Core: innexar_core**
  ```
  innexar_core/
  ├── tenant_management/       # Gestão de tenants
  ├── subscription_billing/    # Cobrança SaaS (Stripe native)
  ├── user_management/         # Usuários + SSO prep
  └── audit_log/              # Auditoria completa (SOC 2 ready)
  ```

#### Sprint 2 (Semana 3-4): Tenant Management + Stripe Integration
- [ ] **Multi-Tenancy**
  - [ ] DocType: Tenant (cadastro de clientes SaaS)
  - [ ] Criação automática de sites
  - [ ] Domain mapping (custom domains via Cloudflare)
  - [ ] Wizard de onboarding (US-focused)
  - [ ] Email de boas-vindas (English)

- [ ] **Subscription & Billing (Stripe Native)**
  - [ ] DocType: Subscription Plan (USD pricing)
  - [ ] Stripe integration (API v2023+)
    - [ ] Customer creation
    - [ ] Subscription management
    - [ ] Payment methods (cards, ACH)
    - [ ] Webhooks (payment success/failed)
  - [ ] Trial period (14 dias)
  - [ ] Downgrade/Upgrade de planos
  - [ ] Suspensão por inadimplência
  - [ ] Invoice generation (Stripe PDF)
  - [ ] Tax calculation (Stripe Tax para sales tax)

- [ ] **User Management**
  - [ ] Roles básicos (Admin, Manager, User)
  - [ ] Permissões por módulo
  - [ ] 2FA (TOTP via Google Authenticator)
  - [ ] SSO preparado (Google Workspace, Microsoft 365)

- [ ] **Landing Page & Portal**
  - [ ] Site institucional (English-first)
  - [ ] Formulário de cadastro/trial
  - [ ] Portal do cliente (self-service)
  - [ ] Documentação inicial (Stripe-like quality)

**Entregável Sprint 2:**
✅ Sistema multi-tenant funcional  
✅ Stripe payments working  
✅ Onboarding em inglês  

#### Sprint 3 (Semana 5-6): US Tax Compliance Foundation

- [ ] **Sales Tax Engine**
  - [ ] Avalara integration (or TaxJar)
    - [ ] API setup
    - [ ] Nexus configuration
    - [ ] Tax calculation on invoices
    - [ ] Tax exemption certificates
  - [ ] DocType: Tax Jurisdiction
  - [ ] Auto-detect based on customer address
  - [ ] Filing preparation (monthly/quarterly)

- [ ] **US Banking Integration**
  - [ ] Plaid integration
    - [ ] Bank account linking
    - [ ] Transaction sync
    - [ ] Balance checking
  - [ ] ACH payments (via Stripe)
  - [ ] Wire transfers (manual entry)

**Entregável Sprint 3:**
✅ Sales Tax compliance ready  
✅ US banking connected  

---

## 💰 FASE 2: CORE MODULES - US EDITION (Mês 4-7)

### Objetivo: Módulos essenciais para mercado americano (QuickBooks replacement)

#### Sprint 4-5 (Mês 4): Módulo Financeiro - US Accounting Standards

**App: innexar_financial**

- [ ] **Chart of Accounts (US GAAP)**
  - [ ] Template padrão US (Assets, Liabilities, Equity, Revenue, Expenses)
  - [ ] Suporte para accrual basis (padrão) e cash basis
  - [ ] Multi-currency (USD base)

- [ ] **Accounts Receivable**
  - [ ] DocType: Customer (US format)
    - [ ] EIN (Employer Identification Number)
    - [ ] W-9 form upload
  - [ ] DocType: Invoice (US format)
    - [ ] Sales tax line item (auto-calculated)
    - [ ] Payment terms (Net 30, Net 60, etc)
    - [ ] Due date calculation
  - [ ] DocType: Payment (multi-method)
    - [ ] Credit card (via Stripe)
    - [ ] ACH (via Stripe/Plaid)
    - [ ] Check (manual entry)
    - [ ] Wire transfer
  - [ ] Automatic payment reminders (email)
  - [ ] Late payment fees (configurable)
  - [ ] Collection workflow
  - [ ] Aging report (30/60/90 days)
  - [ ] Dashboard: Cash collection forecast

- [ ] **Accounts Payable**
  - [ ] DocType: Vendor (US format)
    - [ ] W-9 collection
    - [ ] 1099 eligible flag
    - [ ] Payment method preference
  - [ ] DocType: Bill
    - [ ] OCR for bill scanning
    - [ ] 3-way match (PO-Receipt-Bill)
    - [ ] Approval workflow
  - [ ] DocType: Payment
    - [ ] ACH batch payments
    - [ ] Check printing (US format)
    - [ ] Payment scheduling
  - [ ] 1099 preparation
    - [ ] Track 1099-eligible payments
    - [ ] Generate 1099-NEC, 1099-MISC
    - [ ] E-file with IRS (via third-party)
  - [ ] Dashboard: Cash flow (next 90 days)

- [ ] **Banking**
  - [ ] Plaid sync (automatic reconciliation)
  - [ ] Bank reconciliation tools
  - [ ] Cash flow statement (US GAAP)
  - [ ] Multi-bank account support

- [ ] **Reporting (US GAAP)**
  - [ ] Income Statement (P&L)
  - [ ] Balance Sheet
  - [ ] Cash Flow Statement
  - [ ] General Ledger
  - [ ] Trial Balance
  - [ ] Export to accountant (Excel, PDF, QBO format)

**Testes:**
- [ ] Complete AR cycle (invoice → payment → reconciliation)
- [ ] Complete AP cycle (bill → approval → payment → 1099)
- [ ] Bank reconciliation with real Plaid data
- [ ] Sales tax calculation accuracy (all 50 states)

#### Sprint 6-7 (Mês 5): Sales & CRM - US Market

**App: innexar_sales**

- [ ] **CRM**
  - [ ] DocType: Lead
  - [ ] DocType: Opportunity
  - [ ] Pipeline visual (Kanban)
  - [ ] Lead Scoring (regras)
  - [ ] Conversão Lead → Customer
  - [ ] Email tracking (aberturas)
  - [ ] Tasks de follow-up automáticas
  - [ ] Dashboard: Funil de vendas

- [ ] **Vendas**
  - [ ] DocType: Quotation (Orçamento)
  - [ ] Envio por email (template bonito)
  - [ ] Portal: Cliente aprova online
  - [ ] DocType: Sales Order (Pedido)
  - [ ] Workflow de aprovação (descontos)
  - [ ] Reserva de estoque (integra Fase 3)
  - [ ] Relatório: Vendas por período
  - [ ] Dashboard: Metas vs Realizado

- [ ] **Tabela de Preços**
  - [ ] DocType: Price List
  - [ ] DocType: Pricing Rule (regras promocionais)
  - [ ] Desconto por volume
  - [ ] Desconto por cliente

- [ ] **Comissões**
  - [ ] DocType: Sales Person
  - [ ] DocType: Commission Rule
  - [ ] Cálculo automático (após recebimento)
  - [ ] Relatório de comissões

**Testes:**
- [ ] Fluxo Lead → Oportunidade → Pedido → Fatura
- [ ] Aprovações de desconto
- [ ] Cálculo de comissões

#### Sprint 7-8 (Mês 5-6): Integrações & Polimento

- [ ] **Integrações Financeiras**
  - [ ] API Banco do Brasil (boletos)
  - [ ] API PIX (Banco Central)
  - [ ] Importação OFX (principais bancos)
  - [ ] Webhook Mercado Pago (notificações)

- [ ] **Relatórios Gerenciais**
  - [ ] DRE Gerencial
  - [ ] Fluxo de Caixa Realizado
  - [ ] Análise de Recebimentos
  - [ ] Inadimplência (clientes)

- [ ] **Dashboards**
  - [ ] Executive Dashboard
  - [ ] Sales Dashboard
  - [ ] Financial Dashboard

- [ ] **Mobile-Friendly**
  - [ ] Responsive design (todos os forms)
  - [ ] Aprovações mobile
  - [ ] Dashboards mobile

**Entregável Fase 2:**
✅ ERP funcional para empresas de serviço  
✅ Gestão financeira completa  
✅ CRM + Vendas operacional  
✅ **Pronto para primeiros clientes pagantes!**

---

## 📦 FASE 3: OPERATIONS (Mês 7-9)

### Objetivo: Suporte a empresas com estoque e operações complexas

#### Sprint 9-10 (Mês 7): Módulo de Compras

**App: innexar_purchase**

- [ ] **Requisição de Compras**
  - [ ] DocType: Material Request
  - [ ] Workflow de aprovação
  - [ ] Regras automáticas (estoque mínimo)

- [ ] **Cotação & Pedidos**
  - [ ] DocType: Supplier Quotation
  - [ ] Portal do fornecedor (responder RFQ)
  - [ ] Quadro comparativo
  - [ ] DocType: Purchase Order
  - [ ] Envio automático ao fornecedor
  - [ ] Tracking de entregas

- [ ] **Recebimento**
  - [ ] DocType: Purchase Receipt
  - [ ] Conferência (mobile/tablet)
  - [ ] Foto de divergências
  - [ ] Three-way match (PO-PR-Invoice)

- [ ] **Avaliação de Fornecedores**
  - [ ] Score automático
  - [ ] Relatório de performance

#### Sprint 11-12 (Mês 8): Módulo de Estoque

**App: innexar_inventory**

- [ ] **Cadastro de Produtos**
  - [ ] DocType: Item
  - [ ] Variantes (cor, tamanho)
  - [ ] Kits (Bill of Materials básica)
  - [ ] Código de barras (geração + leitura)
  - [ ] Imagens (upload múltiplo)

- [ ] **Controle de Estoque**
  - [ ] DocType: Warehouse (Armazéns)
  - [ ] DocType: Stock Entry (Movimentações)
  - [ ] Transferências entre armazéns
  - [ ] Ajustes de inventário
  - [ ] Estoque mínimo/máximo
  - [ ] Alertas de reposição

- [ ] **Rastreabilidade**
  - [ ] DocType: Batch (Lotes)
  - [ ] DocType: Serial No (Números de série)
  - [ ] Localização (endereçamento: Rua-Prat-Nivel)
  - [ ] Relatório de rastreio completo

- [ ] **Inventário**
  - [ ] Contagem cíclica
  - [ ] Inventário total
  - [ ] App mobile para contagem
  - [ ] Divergências e ajustes

- [ ] **Relatórios**
  - [ ] Posição de estoque
  - [ ] Movimentações
  - [ ] Produtos parados (>90 dias)
  - [ ] Curva ABC
  - [ ] Acuracidade de estoque

#### Sprint 13 (Mês 9): Integração Compras-Estoque-Vendas

- [ ] **Fluxo Completo**
  - [ ] Pedido Venda → Verifica estoque → Reserva
  - [ ] Se falta → Material Request automático
  - [ ] Compra → Recebimento → Entrada estoque
  - [ ] Venda → Delivery → Saída estoque

- [ ] **Integrações**
  - [ ] API Correios (cálculo frete)
  - [ ] Integração transportadoras (Jadlog, etc)
  - [ ] Rastreamento de entregas

**Entregável Fase 3:**
✅ Gestão completa de operações  
✅ Controle de estoque robusto  
✅ Compras integradas  
✅ **Suporta comércio e distribuição**

---

## 🧾 FASE 4: ADVANCED (Mês 10-12)

### Objetivo: Compliance fiscal e manufatura

#### Sprint 14-15 (Mês 10): Módulo Fiscal

**App: innexar_fiscal**

- [ ] **Emissão NF-e**
  - [ ] Integração SEFAZ (python-nfe)
  - [ ] Cálculo automático de impostos
  - [ ] ICMS (todas regras UF)
  - [ ] ICMS-ST
  - [ ] IPI, PIS, COFINS
  - [ ] Assinatura digital (A1/A3)
  - [ ] DANFE (PDF)
  - [ ] Envio automático por email

- [ ] **Gestão de NF-e**
  - [ ] Cancelamento
  - [ ] Carta de Correção (CC-e)
  - [ ] Inutilização de numeração
  - [ ] Consulta status SEFAZ
  - [ ] Download XML (cliente)

- [ ] **NF-e Entrada (Compras)**
  - [ ] Upload/email de XML
  - [ ] Validação e parsing
  - [ ] Lançamento automático
  - [ ] Matching com Purchase Order

- [ ] **SPED Fiscal**
  - [ ] Geração EFD ICMS/IPI
  - [ ] Validação PVA
  - [ ] Envio automático

- [ ] **NFS-e (Serviços)**
  - [ ] Integração prefeituras principais
  - [ ] Cálculo ISS
  - [ ] RPS (Recibo Provisório)

#### Sprint 16-17 (Mês 11): Módulo de Produção

**App: innexar_manufacturing**

- [ ] **BOM (Bill of Materials)**
  - [ ] Estrutura de produtos
  - [ ] Múltiplos níveis
  - [ ] Versões de BOM
  - [ ] Rotas de produção

- [ ] **MRP (Planejamento)**
  - [ ] Explosão de necessidades
  - [ ] Geração automática de WO
  - [ ] Lead time considerado
  - [ ] Relatório de MRP

- [ ] **Ordens de Produção**
  - [ ] DocType: Work Order
  - [ ] Requisição de materiais
  - [ ] Apontamento de produção
  - [ ] Job Cards (por operação)
  - [ ] Conclusão e entrada estoque

- [ ] **Controle de Qualidade**
  - [ ] Planos de inspeção
  - [ ] Quality Inspection
  - [ ] Não-conformidades
  - [ ] Ações corretivas (CAPA)

- [ ] **Custeio**
  - [ ] Custo padrão vs real
  - [ ] Variações de custo
  - [ ] Relatório de custos

#### Sprint 18 (Mês 12): RH Básico + Polimento

**App: innexar_hr**

- [ ] **Colaboradores**
  - [ ] DocType: Employee
  - [ ] Cargos e departamentos
  - [ ] Documentos digitalizados

- [ ] **Ponto Eletrônico**
  - [ ] Registro de ponto (web/mobile)
  - [ ] Banco de horas
  - [ ] Relatórios de jornada

- [ ] **Férias e Afastamentos**
  - [ ] Solicitação de férias
  - [ ] Aprovação
  - [ ] Calendário de férias

- [ ] **Folha de Pagamento (básica)**
  - [ ] Cálculo de salários
  - [ ] Holerites
  - [ ] Integração financeiro (contas a pagar)

**Entregável Fase 4:**
✅ Compliance fiscal total (Brasil)  
✅ Manufatura operacional  
✅ RH básico  
✅ **ERP completo para indústria**

---

## 🚀 FASE 5: SCALE & GROWTH (Ano 2+)

### Objetivo: Diferenciais competitivos e escala

#### Q1 - Ano 2: Marketplace de Módulos

- [ ] **Plugin System**
  - [ ] API para desenvolvedores
  - [ ] Documentação completa
  - [ ] SDK (Python/JS)
  - [ ] Sandbox para testes

- [ ] **Marketplace**
  - [ ] Portal de apps
  - [ ] Instalação one-click
  - [ ] Pagamentos (revenue share)
  - [ ] Ratings e reviews

- [ ] **Módulos Opcionais**
  - [ ] E-commerce (WooCommerce, Shopify)
  - [ ] Service Desk avançado
  - [ ] Projetos (Gantt, Kanban)
  - [ ] Ativos (manutenção preventiva)
  - [ ] Contratos (gestão completa)

#### Q2 - Ano 2: BI & Analytics

- [ ] **innexar_analytics**
  - [ ] Data warehouse (ETL)
  - [ ] Dashboards avançados
  - [ ] Relatórios customizáveis (drag-drop)
  - [ ] Integração Power BI/Metabase
  - [ ] Machine Learning:
    - [ ] Previsão de demanda
    - [ ] Churn prediction
    - [ ] Análise de crédito (clientes)

#### Q3 - Ano 2: Mobile Apps

- [ ] **React Native Apps**
  - [ ] App vendas (campo)
  - [ ] App estoque (inventário)
  - [ ] App aprovações (gestores)
  - [ ] Offline-first (sync)
  - [ ] Scanner código barras
  - [ ] Assinatura digital

#### Q4 - Ano 2: AI & Automation

- [ ] **Assistente IA**
  - [ ] Chatbot (suporte)
  - [ ] Comandos por voz
  - [ ] Geração de relatórios (NLP)
  - [ ] Sugestões inteligentes

- [ ] **Automações**
  - [ ] RPA (tarefas repetitivas)
  - [ ] OCR (leitura documentos)
  - [ ] Reconciliação bancária (ML)
  - [ ] Classificação fiscal automática

- [ ] **Integrações Premium**
  - [ ] Open Banking (todas as instituições)
  - [ ] Todos os marketplaces
  - [ ] ERPs legados (migração)

---

## 🎯 Priorização (Se recursos limitados)

### MVP Mínimo Viável (3 meses):
1. ✅ Tenant Management
2. ✅ Financeiro (Contas a Pagar/Receber)
3. ✅ Vendas básicas (Pedido → Fatura)
4. ✅ Emissão NF-e (só venda)

**Já gera receita!**

### MVP+ (6 meses): +
5. ✅ CRM completo
6. ✅ Estoque básico
7. ✅ Compras básicas

**Cobre 70% dos clientes potenciais**

### Completo (12 meses): +
8. ✅ Fiscal completo (SPED)
9. ✅ Produção
10. ✅ RH

**Cobre 95% dos casos de uso**

---

## 📊 Métricas de Sucesso (KPIs)

### Desenvolvimento
- **Velocity**: Story points por sprint
- **Quality**: <5% bug rate
- **Coverage**: >80% test coverage
- **Uptime**: >99.5%

### Produto
- **Onboarding**: Tempo médio < 10 min
- **Adoption**: % usuários ativos (DAU/MAU)
- **NPS**: Net Promoter Score > 50

### Negócio
- **MRR Growth**: +20% mês
- **Churn**: <5% ao mês
- **CAC Payback**: <6 meses
- **LTV/CAC**: >3x

---

## 👥 Time Necessário

### Fase 1-2 (Mês 1-6)
- 2 Backend Developers (Python/Frappe)
- 1 Frontend Developer (Vue.js)
- 1 DevOps
- 1 Product Owner
- 1 QA

### Fase 3-4 (Mês 7-12)
- +1 Backend Developer
- +1 Frontend Developer
- +1 Especialista Fiscal
- +1 QA

### Fase 5+ (Ano 2)
- Time cresce conforme tração

---

## 💰 Estimativa de Custos (Mensal)

| Item | Valor (R$) |
|------|------------|
| Time (6 pessoas × R$ 10k) | 60.000 |
| Infraestrutura (cloud) | 5.000 |
| Ferramentas (GitHub, etc) | 2.000 |
| Marketing (inicial) | 10.000 |
| **TOTAL** | **77.000/mês** |

**Break-even**: ~200 clientes no plano Professional (R$ 497/mês)

---

## ✅ Próximos Passos IMEDIATOS

1. [ ] Validar este roadmap
2. [ ] Setup do ambiente de desenvolvimento
3. [ ] Criar primeiro sprint backlog
4. [ ] Começar Sprint 1! 🚀

**Vamos começar?** 💪
