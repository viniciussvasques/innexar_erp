# 📚 Documentação de Módulos - Innexar ERP

**Última atualização:** 2025-11-14  
**Versão:** 1.0.0

---

## 📋 Índice de Módulos

Esta pasta contém a documentação completa e detalhada de cada módulo do ERP Innexar. Cada módulo possui seu próprio documento com todas as especificações, funcionalidades, modelos, APIs e regras de negócio.

### Módulos Implementados ✅

- [CRM](01_CRM.md) - Customer Relationship Management (100%)
- [Users & Auth](02_USERS_AUTH.md) - Autenticação e Gerenciamento de Usuários (100%)
- [Tenants](03_TENANTS.md) - Multi-Tenancy (100%)
- [HR](08_HR.md) - Recursos Humanos (100% - 57 endpoints) ✅ **COMPLETO**
  - ✅ Departments, Companies, Employees (CRUD completo)
  - ✅ Payroll, Time Records, Vacations, Benefits, Performance, Trainings, Recruitment (todos implementados)

### Módulos em Desenvolvimento 🚧

- [Sales](04_SALES.md) - Módulo de Vendas (0%)
- [Warehouse](05_WAREHOUSE.md) - Módulo de Estoque (0%)
- [Logistics](06_LOGISTICS.md) - Módulo de Logística (0%)
- [Invoicing](07_INVOICING.md) - Módulo de Invoice/Financeiro (0%)
- [Customer Portal](09_CUSTOMER_PORTAL.md) - Portal do Cliente (0%)
- [Products](10_PRODUCTS.md) - Cadastro de Produtos e Serviços (0%)
- [Pricing](11_PRICING.md) - Sistema de Preços e Descontos (0%)

---

## 📝 Como Usar Esta Documentação

### Para Desenvolvedores

1. **Antes de implementar um módulo:**

   - Leia o documento completo do módulo
   - Verifique os modelos e relacionamentos
   - Entenda as regras de negócio
   - Revise as permissões necessárias

2. **Durante a implementação:**

   - Atualize o status de cada funcionalidade
   - Documente decisões técnicas
   - Adicione notas sobre problemas encontrados

3. **Após implementar:**
   - Marque funcionalidades como concluídas
   - Atualize exemplos de código se necessário
   - Documente APIs criadas

### Para Product Owners / Gerentes

- Use esta documentação para entender o escopo completo
- Verifique o status de implementação de cada módulo
- Use como referência para planejamento de sprints

---

## 🔄 Status de Implementação

| Módulo          | Status          | Progresso | Última Atualização |
| --------------- | --------------- | --------- | ------------------ |
| CRM             | ✅ Implementado | 100%      | 2025-11-14         |
| Users & Auth    | ✅ Implementado | 100%      | 2025-11-14         |
| Tenants         | ✅ Implementado | 100%      | 2025-11-14         |
| HR              | ✅ Implementado | 100%      | 2025-11-14         |
| Sales           | 🚧 Planejado    | 0%        | 2025-11-14         |
| Warehouse       | 🚧 Planejado    | 0%        | 2025-11-14         |
| Logistics       | 🚧 Planejado    | 0%        | 2025-11-14         |
| Invoicing       | 🚧 Planejado    | 0%        | 2025-11-14         |
| Customer Portal | 🚧 Planejado    | 0%        | 2025-11-14         |
| Products        | 🚧 Planejado    | 0%        | 2025-11-14         |
| Pricing         | 🚧 Planejado    | 0%        | 2025-11-14         |

**Total:** 4 módulos implementados, 0 módulos parciais, 7 módulos planejados

**Nota:** O módulo HR está 100% implementado (57 de 57 endpoints). Veja `08_HR.md` para detalhes.

**Legenda:**

- ✅ Implementado - Módulo funcional e em produção (100%)
- 🟡 Parcial - Módulo parcialmente implementado (< 100%)
- 🚧 Planejado - Documentado, aguardando implementação (0%)
- 🔄 Em Desenvolvimento - Sendo implementado atualmente
- ⚠️ Em Revisão - Implementado, mas precisa de revisão

---

## 📖 Estrutura dos Documentos

Cada documento de módulo segue a seguinte estrutura:

1. **Visão Geral** - O que é o módulo, objetivos principais
2. **Funcionalidades** - Lista completa de funcionalidades
3. **Modelos/Entidades** - Estrutura de dados, relacionamentos
4. **APIs/Endpoints** - Endpoints REST, especificações
5. **Fluxos** - Fluxos de trabalho principais
6. **Regras de Negócio** - Regras importantes
7. **Permissões** - Quem pode fazer o quê
8. **Status de Implementação** - Checklist de funcionalidades
9. **Notas Técnicas** - Decisões técnicas, considerações

---

## 🔗 Links Relacionados

- [Módulos e Funções Gerais](../MODULOS_E_FUNCOES.md)
- [Sistema de Funções e Permissões](../SISTEMA_FUNCOES_PERMISSOES_COMPLETO.md)
- [APIs Completas](../APIS_COMPLETO.md)
- [Análise da Conversa](../ANALISE_CONVERSA_CHATGPT.md)

---

**⚠️ IMPORTANTE:** Sempre atualize o status de implementação quando trabalhar em um módulo!
