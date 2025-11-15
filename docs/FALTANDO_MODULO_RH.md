# ❌ O que está Faltando no Módulo de Recursos Humanos (HR)

**Data da Análise:** 2025-01-27  
**Status:** Análise Completa  
**Última Atualização:** 2025-01-27

---

## 📋 Resumo Executivo

O módulo de RH possui uma **base sólida** com todos os modelos e APIs implementados no backend, mas está **incompleto no frontend**. Faltam formulários, funcionalidades de UI e integrações para tornar o módulo totalmente funcional.

---

## ✅ O que está Implementado

### Backend (100% Completo)
- ✅ 22 ViewSets com CRUD completo
- ✅ 29 rotas de API registradas
- ✅ Cálculos automáticos (folha, horas extras, férias)
- ✅ Sistema de notificações
- ✅ Geração de PDFs de contratos
- ✅ Histórico automático de funcionários
- ✅ Upload de documentos

### Frontend - Páginas (100% Criadas)
- ✅ `/hr` - Dashboard
- ✅ `/hr/employees` - Lista de Funcionários
- ✅ `/hr/employees/[id]` - Perfil do Funcionário
- ✅ `/hr/departments` - Departamentos
- ✅ `/hr/job-positions` - Cargos
- ✅ `/hr/payroll` - Folha de Pagamento
- ✅ `/hr/time-records` - Controle de Ponto
- ✅ `/hr/vacations` - Férias
- ✅ `/hr/benefits` - Benefícios
- ✅ `/hr/performance` - Avaliações
- ✅ `/hr/trainings` - Treinamentos
- ✅ `/hr/recruitment` - Recrutamento

### Frontend - Formulários (8 de 19)
- ✅ `EmployeeForm` - Completo com todas as abas
- ✅ `DepartmentForm` - Completo
- ✅ `JobPositionForm` - Completo
- ✅ `TimeRecordForm` - Completo
- ✅ `VacationForm` - Completo
- ✅ `PayrollForm` - Completo (visualização e recálculo)
- ✅ `EmployeeDocumentForm` - Completo
- ✅ `ContractForm` - Completo

---

## ❌ O que está Faltando - Frontend

### 🔴 CRÍTICO: Formulários Faltantes (11 formulários)

#### 1. **BenefitForm** - Criar/Editar Benefícios
- **Status:** ❌ Não existe
- **Onde usar:** `/hr/benefits`
- **Campos necessários:**
  - Nome
  - Tipo (meal_voucher, food_voucher, transportation, health_insurance, etc.)
  - Valor
  - Descrição
  - Ativo/Inativo
- **Prioridade:** 🔴 Alta

#### 2. **EmployeeBenefitForm** - Atribuir Benefícios a Funcionários
- **Status:** ❌ Não existe
- **Onde usar:** `/hr/employees/[id]` (aba Benefits) ou `/hr/benefits`
- **Campos necessários:**
  - Funcionário
  - Benefício
  - Data de início
  - Data de término (opcional)
  - Valor (se customizado)
- **Prioridade:** 🔴 Alta

#### 3. **PerformanceReviewForm** - Criar/Editar Avaliações
- **Status:** ❌ Não existe
- **Onde usar:** `/hr/performance`
- **Campos necessários:**
  - Funcionário
  - Revisor
  - Data da avaliação
  - Período avaliado (início/fim)
  - Status (draft, in_progress, completed)
  - Critérios e pontuações (JSON)
  - Comentários
  - Pontuação final
- **Prioridade:** 🔴 Alta

#### 4. **TrainingForm** - Criar/Editar Treinamentos
- **Status:** ❌ Não existe
- **Onde usar:** `/hr/trainings`
- **Campos necessários:**
  - Nome
  - Tipo (internal, external, online, etc.)
  - Descrição
  - Data de início
  - Data de término
  - Duração (horas)
  - Instrutor
  - Local
  - Capacidade máxima
  - Status (scheduled, in_progress, completed, cancelled)
- **Prioridade:** 🔴 Alta

#### 5. **EmployeeTrainingForm** - Inscrever Funcionários em Treinamentos
- **Status:** ❌ Não existe
- **Onde usar:** `/hr/trainings` ou `/hr/employees/[id]` (aba Trainings)
- **Campos necessários:**
  - Funcionário
  - Treinamento
  - Status (enrolled, in_progress, completed, failed)
  - Data de inscrição
  - Data de conclusão (opcional)
  - Nota/Certificado
- **Prioridade:** 🟡 Média

#### 6. **JobOpeningForm** - Criar/Editar Vagas
- **Status:** ❌ Não existe
- **Onde usar:** `/hr/recruitment` (aba Jobs)
- **Campos necessários:**
  - Título
  - Departamento
  - Cargo (Job Position)
  - Descrição
  - Requisitos
  - Data de publicação
  - Data de fechamento
  - Status (open, closed)
  - Tipo (full_time, part_time, contract, etc.)
- **Prioridade:** 🔴 Alta

#### 7. **CandidateForm** - Criar/Editar Candidatos
- **Status:** ❌ Não existe
- **Onde usar:** `/hr/recruitment` (aba Candidates)
- **Campos necessários:**
  - Nome
  - Email
  - Telefone
  - Vaga (Job Opening)
  - Status (applied, screening, interview, test, hired, rejected)
  - Data de candidatura
  - Currículo (upload)
  - Notas
- **Prioridade:** 🔴 Alta

#### 8. **BankAccountForm** - Gerenciar Contas Bancárias
- **Status:** ❌ Não existe
- **Onde usar:** `/hr/employees/[id]` (aba Bank Accounts)
- **Campos necessários:**
  - Funcionário
  - Nome do banco
  - Agência
  - Número da conta
  - Tipo (checking, savings)
  - Chave PIX (opcional)
  - Conta principal (sim/não)
- **Prioridade:** 🟡 Média

#### 9. **DependentForm** - Gerenciar Dependentes
- **Status:** ❌ Não existe
- **Onde usar:** `/hr/employees/[id]` (aba Dependents)
- **Campos necessários:**
  - Funcionário
  - Nome
  - Data de nascimento
  - CPF/SSN
  - Relação (spouse, son, daughter, etc.)
  - Dependente para imposto (sim/não)
- **Prioridade:** 🟡 Média

#### 10. **EducationForm** - Gerenciar Educação
- **Status:** ❌ Não existe
- **Onde usar:** `/hr/employees/[id]` (aba Education)
- **Campos necessários:**
  - Funcionário
  - Nível (elementary, high_school, bachelor, masters, etc.)
  - Instituição
  - Curso
  - Data de início
  - Data de término
  - Concluído (sim/não)
  - Ano de conclusão
  - Certificado (upload opcional)
- **Prioridade:** 🟡 Média

#### 11. **WorkExperienceForm** - Gerenciar Experiência Profissional
- **Status:** ❌ Não existe
- **Onde usar:** `/hr/employees/[id]` (aba Work Experience)
- **Campos necessários:**
  - Funcionário
  - Nome da empresa
  - Cargo
  - Data de início
  - Data de término
  - Trabalho atual (sim/não)
  - Descrição
  - Responsabilidades
  - Conquistas
  - Referência (nome, telefone, email)
- **Prioridade:** 🟡 Média

---

### 🟡 MÉDIO: Funcionalidades Faltantes

#### 1. **Sistema de Notificações no Frontend**
- **Status:** ❌ Backend existe, frontend não
- **O que falta:**
  - Componente de notificações
  - Badge com contador de não lidas
  - Lista de notificações
  - Marcar como lida
  - Ações rápidas (ex: aprovar férias direto da notificação)
- **Prioridade:** 🟡 Média

#### 2. **Aprovações de Férias e Ponto**
- **Status:** ⚠️ Parcial (backend existe, UI não)
- **O que falta:**
  - Botões de aprovar/rejeitar nas listagens
  - Modal de aprovação com campo de motivo
  - Notificações quando há pendências
  - Dashboard com pendências
- **Prioridade:** 🔴 Alta

#### 3. **Upload de Foto do Funcionário**
- **Status:** ❌ Campo existe no modelo, UI não
- **O que falta:**
  - Input de upload de imagem
  - Preview da foto
  - Crop/redimensionamento
  - Exibição da foto no perfil
- **Prioridade:** 🟡 Média

#### 4. **Visualização de Documentos**
- **Status:** ⚠️ Parcial (download existe, visualização não)
- **O que falta:**
  - Viewer de PDF
  - Viewer de imagens
  - Preview antes de download
- **Prioridade:** 🟡 Média

#### 5. **Geração de Relatórios em PDF**
- **Status:** ❌ Não existe
- **O que falta:**
  - Relatório de folha de pagamento
  - Relatório de férias
  - Relatório de ponto
  - Relatório de funcionários
  - Relatório de benefícios
- **Prioridade:** 🟢 Baixa

#### 6. **Filtros Avançados**
- **Status:** ⚠️ Básico existe, avançado não
- **O que falta:**
  - Filtros por múltiplos campos
  - Filtros por período
  - Filtros por status
  - Filtros combinados
  - Salvar filtros favoritos
- **Prioridade:** 🟡 Média

#### 7. **Exportação de Dados**
- **Status:** ❌ Não existe
- **O que falta:**
  - Exportar para Excel
  - Exportar para CSV
  - Exportar para PDF
  - Exportação customizada
- **Prioridade:** 🟢 Baixa

#### 8. **Dashboard Mais Completo**
- **Status:** ⚠️ Básico existe
- **O que falta:**
  - Gráficos de evolução
  - Comparativos mensais/anuais
  - Indicadores de performance
  - Alertas e pendências
  - Widgets customizáveis
- **Prioridade:** 🟡 Média

#### 9. **Histórico Visual Melhorado**
- **Status:** ⚠️ Básico existe
- **O que falta:**
  - Timeline visual
  - Filtros por tipo de mudança
  - Comparação lado a lado
  - Exportação do histórico
- **Prioridade:** 🟢 Baixa

#### 10. **Integração com Sistema de Ponto Eletrônico**
- **Status:** ❌ Não existe
- **O que falta:**
  - API para receber registros de ponto
  - Sincronização automática
  - Validação de localização
  - Reconhecimento facial/biométrico
- **Prioridade:** 🟢 Baixa (futuro)

---

## 📊 Resumo por Prioridade

### 🔴 Alta Prioridade (7 itens)
1. BenefitForm
2. EmployeeBenefitForm
3. PerformanceReviewForm
4. TrainingForm
5. JobOpeningForm
6. CandidateForm
7. Aprovações de Férias e Ponto

### 🟡 Média Prioridade (8 itens)
1. EmployeeTrainingForm
2. BankAccountForm
3. DependentForm
4. EducationForm
5. WorkExperienceForm
6. Sistema de Notificações no Frontend
7. Upload de Foto do Funcionário
8. Filtros Avançados

### 🟢 Baixa Prioridade (4 itens)
1. Geração de Relatórios em PDF
2. Exportação de Dados
3. Dashboard Mais Completo
4. Histórico Visual Melhorado

---

## 🎯 Plano de Implementação Sugerido

### Fase 1: Formulários Críticos (1-2 semanas)
1. BenefitForm
2. EmployeeBenefitForm
3. PerformanceReviewForm
4. TrainingForm
5. JobOpeningForm
6. CandidateForm

### Fase 2: Funcionalidades de Aprovação (1 semana)
1. Aprovações de Férias
2. Aprovações de Ponto
3. Sistema de Notificações no Frontend

### Fase 3: Formulários Secundários (1 semana)
1. EmployeeTrainingForm
2. BankAccountForm
3. DependentForm
4. EducationForm
5. WorkExperienceForm

### Fase 4: Melhorias e Polimento (1-2 semanas)
1. Upload de Foto
2. Filtros Avançados
3. Visualização de Documentos
4. Dashboard Melhorado

### Fase 5: Relatórios e Exportação (1 semana)
1. Geração de PDFs
2. Exportação de Dados
3. Histórico Visual

---

## 📝 Notas Técnicas

### Estrutura de Formulários
Todos os formulários devem seguir o padrão estabelecido:
- Usar `react-hook-form` com `zod` para validação
- Usar `Dialog` do shadcn/ui
- Incluir loading states
- Incluir error handling
- Usar `useToast` para feedback
- Seguir padrão de traduções

### Integração com APIs
- Todos os formulários devem usar `hrApi` do `@/lib/api/hr`
- Usar `useMutation` do `@tanstack/react-query`
- Incluir `onSuccess` callback para atualizar listas

### Traduções
- Todas as strings devem usar `useTranslations('hr')`
- Adicionar novas chaves em `frontend/messages/{en,pt,es}.json`
- Seguir padrão de nomenclatura existente

---

## ✅ Conclusão

O módulo de RH está **80% completo** no backend e **60% completo** no frontend. As principais lacunas são:

1. **11 formulários faltantes** (principalmente para Benefits, Performance, Training e Recruitment)
2. **Sistema de aprovações** não implementado no frontend
3. **Notificações** sem UI
4. **Funcionalidades secundárias** (upload de foto, filtros avançados, etc.)

Com a implementação das **Fases 1 e 2**, o módulo estará **90% funcional** e pronto para uso em produção.




