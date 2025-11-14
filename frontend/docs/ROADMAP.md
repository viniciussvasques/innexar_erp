# 🗺️ Roadmap - Innexar ERP Frontend

**Versão Atual:** 1.0.0  
**Última Atualização:** 2025-11-13

## 📊 Status Geral

- ✅ **Fase 1:** Estrutura Base - **100% Completo**
- ✅ **Fase 2:** Infraestrutura Profissional - **100% Completo**
- 🔄 **Fase 3:** Funcionalidades Core - **20% Completo**
- ⏳ **Fase 4:** Módulos Avançados - **0% Completo**
- ⏳ **Fase 5:** Otimizações e Polimento - **0% Completo**

---

## 🎯 Próximos Passos Prioritários

### **Fase 3: Funcionalidades Core** (Prioridade Alta)

#### 1. **Módulo CRM - Funcionalidades Completas** 🔥

**Estimativa:** 3-5 dias

- [ ] **CRUD de Leads**
  - [ ] Formulário de criação/edição de Lead
  - [ ] Modal de confirmação de exclusão
  - [ ] Validação completa de formulários
  - [ ] Integração com API (POST, PUT, DELETE)
  - [ ] Feedback visual (toast notifications)
  - [ ] Testes unitários

- [ ] **CRUD de Contacts**
  - [ ] Formulário de criação/edição de Contact
  - [ ] Modal de confirmação de exclusão
  - [ ] Validação completa
  - [ ] Integração com API
  - [ ] Testes unitários

- [ ] **CRUD de Deals**
  - [ ] Formulário de criação/edição de Deal
  - [ ] Drag & drop no pipeline (Kanban)
  - [ ] Atualização de estágio
  - [ ] Integração com API
  - [ ] Testes unitários

- [ ] **Melhorias na Listagem**
  - [ ] Tabela com ordenação e paginação
  - [ ] Filtros avançados
  - [ ] Busca em tempo real (debounce)
  - [ ] Exportação de dados (CSV/Excel)

#### 2. **Componentes UI Essenciais** 🔥

**Estimativa:** 2-3 dias

- [ ] **Tabela (DataTable)**
  - [ ] Componente reutilizável com shadcn/ui
  - [ ] Ordenação por colunas
  - [ ] Seleção de linhas
  - [ ] Paginação
  - [ ] Responsivo

- [ ] **Modal/Dialog**
  - [ ] Modal de confirmação
  - [ ] Modal de formulário
  - [ ] Modal de detalhes

- [ ] **Formulários**
  - [ ] Componente de formulário reutilizável
  - [ ] Validação com Zod
  - [ ] Mensagens de erro
  - [ ] Loading states

- [ ] **Toast/Notifications**
  - [ ] Sistema de notificações
  - [ ] Sucesso, erro, warning, info
  - [ ] Auto-dismiss

- [ ] **Select/Dropdown**
  - [ ] Select com busca
  - [ ] Multi-select
  - [ ] Select com grupos

#### 3. **Dashboard Funcional** 🔥

**Estimativa:** 2-3 dias

- [ ] **Integração com API Real**
  - [ ] Buscar dados reais do backend
  - [ ] Gráficos com dados reais
  - [ ] Métricas calculadas

- [ ] **Gráficos e Visualizações**
  - [ ] Gráfico de vendas (linha)
  - [ ] Gráfico de leads (barra)
  - [ ] Gráfico de receitas (pizza)
  - [ ] Timeline de atividades

- [ ] **Widgets Interativos**
  - [ ] Filtro por período (hoje, semana, mês)
  - [ ] Atualização em tempo real
  - [ ] Drill-down nos gráficos

#### 4. **Sistema de Autenticação Completo**

**Estimativa:** 1-2 dias

- [ ] **Proteção de Rotas**
  - [ ] Middleware de autenticação
  - [ ] Redirecionamento se não autenticado
  - [ ] Loading state durante verificação

- [ ] **Gerenciamento de Sessão**
  - [ ] Refresh token automático
  - [ ] Logout em todas as abas
  - [ ] Expiração de sessão

- [ ] **Perfil do Usuário**
  - [ ] Página de perfil
  - [ ] Edição de dados pessoais
  - [ ] Alteração de senha
  - [ ] Upload de avatar

---

### **Fase 4: Módulos Avançados** (Prioridade Média)

#### 5. **Módulo Financeiro Completo**

**Estimativa:** 4-5 dias

- [ ] Listagem de transações
- [ ] Criação de receitas/despesas
- [ ] Categorização
- [ ] Relatórios financeiros
- [ ] Gráficos de fluxo de caixa

#### 6. **Módulo de Faturamento**

**Estimativa:** 4-5 dias

- [ ] Criação de notas fiscais
- [ ] Templates de invoice
- [ ] Envio por email
- [ ] Histórico de faturas
- [ ] Relatórios

#### 7. **Módulo de Estoque**

**Estimativa:** 3-4 dias

- [ ] Gestão de produtos
- [ ] Controle de entrada/saída
- [ ] Alertas de estoque baixo
- [ ] Histórico de movimentações

#### 8. **Configurações e Preferências**

**Estimativa:** 2-3 dias

- [ ] Configurações da conta
- [ ] Preferências de notificações
- [ ] Configurações de empresa
- [ ] Integrações (Stripe, etc.)

---

### **Fase 5: Otimizações e Polimento** (Prioridade Baixa)

#### 9. **Performance**

- [ ] Code splitting otimizado
- [ ] Lazy loading de componentes
- [ ] Virtual scrolling em listas grandes
- [ ] Cache otimizado (React Query)
- [ ] Lighthouse score > 90

#### 10. **Acessibilidade**

- [ ] Testes com screen readers
- [ ] Navegação por teclado
- [ ] Contraste de cores
- [ ] ARIA labels completos
- [ ] WCAG 2.1 AA compliance

#### 11. **Testes**

- [ ] Cobertura de testes > 70%
- [ ] Testes de integração
- [ ] Testes E2E (Playwright)
- [ ] Testes de performance

#### 12. **Documentação**

- [ ] Storybook para componentes
- [ ] Documentação de APIs
- [ ] Guias de uso
- [ ] Vídeos tutoriais

---

## 🚀 Sprint Atual (Próximas 2 Semanas)

### **Sprint 1: CRM Completo + Dashboard Real + Componentes UI**

**Objetivo:** Ter o módulo CRM totalmente funcional com CRUD completo e dashboard com dados reais

**Tarefas:**

1. ✅ Tela de login profissional
2. 🔄 Criar componente DataTable
3. 🔄 Criar componente Modal/Dialog
4. 🔄 Criar componente Toast
5. 🔄 Implementar API Analytics (`lib/api/analytics.ts`)
6. 🔄 Integrar dashboard com dados reais
7. 🔄 Implementar CRUD completo de Leads (formulários)
8. 🔄 Implementar CRUD completo de Contacts
9. 🔄 Melhorar CRUD de Deals (drag & drop)
10. 🔄 Adicionar testes para CRM

**Entregáveis:**

- Módulo CRM 100% funcional
- Dashboard com dados reais da API
- Componentes UI reutilizáveis
- Testes básicos implementados

**Ver análise completa de APIs:** `docs/ANALISE_API.md`

---

## 📈 Métricas de Progresso

### Por Módulo

| Módulo        | Status | Progresso |
| ------------- | ------ | --------- |
| Autenticação  | ✅     | 80%       |
| Dashboard     | 🔄     | 40%       |
| CRM           | 🔄     | 30%       |
| Financeiro    | ⏳     | 10%       |
| Faturamento   | ⏳     | 10%       |
| Estoque       | ⏳     | 10%       |
| Configurações | ⏳     | 10%       |

### Por Tipo de Trabalho

| Tipo           | Status | Progresso |
| -------------- | ------ | --------- |
| Estrutura Base | ✅     | 100%      |
| Componentes UI | 🔄     | 30%       |
| Integração API | 🔄     | 40%       |
| Testes         | 🔄     | 10%       |
| Documentação   | ✅     | 80%       |

---

## 🎯 Objetivos de Curto Prazo (1 Mês)

1. ✅ Tela de login profissional
2. 🔄 Módulo CRM 100% funcional
3. 🔄 Dashboard com dados reais
4. 🔄 Componentes UI essenciais
5. 🔄 Cobertura de testes > 50%

## 🎯 Objetivos de Médio Prazo (3 Meses)

1. Todos os módulos principais funcionais
2. Performance otimizada
3. Acessibilidade completa
4. Cobertura de testes > 70%
5. Documentação completa

---

## 📝 Notas

- **Prioridade 🔥** = Crítico para MVP
- **Prioridade ⚡** = Importante mas não bloqueante
- **Prioridade 📌** = Nice to have

**Última revisão:** 2025-11-13
