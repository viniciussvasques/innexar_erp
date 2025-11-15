# 📊 Módulo CRM (Customer Relationship Management)

**Última atualização:** 2025-11-14  
**Status:** ✅ Implementado  
**Progresso:** 100%

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Funcionalidades](#funcionalidades)
3. [Modelos/Entidades](#modelosentidades)
4. [APIs/Endpoints](#apisendpoints)
5. [Fluxos de Trabalho](#fluxos-de-trabalho)
6. [Regras de Negócio](#regras-de-negócio)
7. [Permissões](#permissões)
8. [Status de Implementação](#status-de-implementação)
9. [Notas Técnicas](#notas-técnicas)

---

## 🎯 Visão Geral

O módulo CRM gerencia o relacionamento com clientes através de leads, contatos, oportunidades (deals) e atividades. Permite rastrear todo o funil de vendas desde a prospecção até o fechamento.

### Objetivos Principais

- Gerenciar leads e prospecções
- Converter leads em contatos
- Gerenciar oportunidades de venda
- Registrar atividades (ligações, emails, reuniões)
- Pipeline de vendas
- Score de leads (preparado para IA)

---

## 🚀 Funcionalidades

### 1. Leads

- CRUD completo
- Status: new, contacted, qualified, converted, lost
- Source: website, social, referral, ads, cold_call, event, other
- Score: 0-100 (calculado por IA - futuro)
- Conversão automática para contato

### 2. Contacts

- CRUD completo
- Dados completos (endereço, contatos, social)
- Tags
- Histórico de conversão de lead
- Marcação como cliente

### 3. Deals

- CRUD completo
- Stages: prospecting, qualification, proposal, negotiation, closed_won, closed_lost
- Cálculo automático de receita esperada
- Pipeline overview

### 4. Activities

- CRUD completo
- Tipos: call, email, meeting, task, note, whatsapp
- Status: planned, completed, canceled
- Vinculação com lead/contact/deal

---

## 🗄️ Modelos/Entidades

Ver `backend/apps/crm/models.py` para modelos completos.

### Principais Modelos

- **Lead** - Prospecção
- **Contact** - Contato
- **Deal** - Oportunidade
- **Activity** - Atividade

---

## 🔌 APIs/Endpoints

Ver `docs/APIS_COMPLETO.md` seção CRM para documentação completa.

### Base URL
```
/api/v1/crm/
```

### Principais Endpoints

- `GET /api/v1/crm/leads/` - Listar leads
- `POST /api/v1/crm/leads/` - Criar lead
- `POST /api/v1/crm/leads/{id}/convert/` - Converter em contato
- `GET /api/v1/crm/contacts/` - Listar contatos
- `GET /api/v1/crm/deals/` - Listar deals
- `GET /api/v1/crm/deals/pipeline/` - Pipeline overview
- `GET /api/v1/crm/activities/` - Listar atividades

---

## ✅ Status de Implementação

### Leads
- [x] Modelo Lead
- [x] CRUD completo
- [x] Conversão para contato
- [x] Filtros e busca
- [ ] Score automático (IA - futuro)

### Contacts
- [x] Modelo Contact
- [x] CRUD completo
- [x] Filtros e busca

### Deals
- [x] Modelo Deal
- [x] CRUD completo
- [x] Pipeline overview
- [x] Cálculo de receita esperada

### Activities
- [x] Modelo Activity
- [x] CRUD completo
- [x] Marcar como concluída

### APIs
- [x] Todos os endpoints implementados
- [x] Filtros funcionando
- [x] Busca funcionando
- [x] Ordenação funcionando

---

**⚠️ IMPORTANTE:** Atualize este documento conforme novas funcionalidades forem adicionadas!

