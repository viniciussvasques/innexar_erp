# 🏢 Módulo de Multi-Tenancy (Tenants)

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

O módulo de Tenants gerencia o sistema de multi-tenancy usando django-tenants, onde cada tenant (cliente/empresa) possui seu próprio schema PostgreSQL isolado.

### Objetivos Principais

- Criar novos tenants
- Gerenciar domínios
- Isolamento completo de dados
- Integração com Stripe (preparado)
- Planos e limites

---

## 🚀 Funcionalidades

### 1. Tenants

- CRUD completo
- Planos: free, starter, professional, enterprise
- Limites: usuários, armazenamento
- Status: ativo, inativo
- Trial

### 2. Domains

- Múltiplos domínios por tenant
- Domínio primário
- Subdomínios

### 3. Verificação

- Verificar disponibilidade de subdomínio
- Validação de formato

### 4. Internacionalização

- Teste de traduções
- Suporte a múltiplos idiomas

---

## 🗄️ Modelos/Entidades

Ver `backend/apps/tenants/models.py` para modelos completos.

### Tenant

- Schema name (subdomain)
- Plan
- Stripe integration (preparado)
- Limits
- Status

### Domain

- Domain name
- Tenant
- Is primary

---

## 🔌 APIs/Endpoints

Ver `docs/APIS_COMPLETO.md` seção Multi-Tenancy para documentação completa.

### Base URL
```
/api/v1/public/tenants/
```

### Principais Endpoints

- `GET /api/v1/public/tenants/` - Listar tenants
- `POST /api/v1/public/tenants/` - Criar tenant
- `GET /api/v1/public/tenants/check-subdomain/` - Verificar subdomínio
- `GET /api/v1/public/i18n/test/` - Teste de traduções

---

## ✅ Status de Implementação

### Tenants
- [x] Modelo Tenant
- [x] CRUD completo
- [x] Verificação de subdomínio
- [x] Planos e limites

### Domains
- [x] Modelo Domain
- [x] Gerenciamento de domínios

### APIs
- [x] Todos os endpoints implementados
- [x] Isolamento funcionando

---

**⚠️ IMPORTANTE:** Atualize este documento conforme novas funcionalidades forem adicionadas!

