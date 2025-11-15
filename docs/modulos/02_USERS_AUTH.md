# 👤 Módulo de Usuários e Autenticação (Users & Auth)

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

O módulo de Usuários e Autenticação gerencia autenticação, autorização, registro de usuários, gestão de senhas e integração com o sistema de multi-tenancy.

### Objetivos Principais

- Autenticação segura com JWT
- Registro de novos usuários
- Gestão de senhas (reset, alteração)
- Integração com tenants
- Perfil do usuário

---

## 🚀 Funcionalidades

### 1. Autenticação

- Login com email/password
- JWT tokens (access + refresh)
- Auto-detecção de tenant
- Logout com blacklist

### 2. Registro

- Criação de conta
- Validação de email
- Integração com tenant

### 3. Gestão de Senha

- Alteração de senha
- Reset de senha via email
- Confirmação de reset

### 4. Perfil

- Dados do usuário
- Informações do tenant
- Avatar

---

## 🗄️ Modelos/Entidades

Ver `backend/apps/users/models.py` para modelo completo.

### User

- Extends AbstractUser
- Email único
- Default tenant
- Avatar
- Phone

---

## 🔌 APIs/Endpoints

Ver `docs/APIS_COMPLETO.md` seção Autenticação para documentação completa.

### Base URL
```
/api/v1/auth/
```

### Principais Endpoints

- `POST /api/v1/auth/login/` - Login
- `POST /api/v1/auth/register/` - Registro
- `POST /api/v1/auth/logout/` - Logout
- `GET /api/v1/auth/me/` - Dados do usuário
- `POST /api/v1/auth/change-password/` - Alterar senha
- `POST /api/v1/auth/password-reset/` - Solicitar reset
- `POST /api/v1/auth/password-reset/confirm/` - Confirmar reset
- `POST /api/v1/auth/token/refresh/` - Refresh token

---

## ✅ Status de Implementação

### Autenticação
- [x] Login com JWT
- [x] Refresh token
- [x] Logout com blacklist
- [x] Auto-detecção de tenant

### Registro
- [x] Criação de conta
- [x] Validação de email

### Gestão de Senha
- [x] Alteração de senha
- [x] Reset via email
- [x] Confirmação de reset

### Perfil
- [x] Endpoint /me/
- [x] Retorna dados completos

### APIs
- [x] Todos os endpoints implementados
- [x] Validações funcionando
- [x] Segurança implementada

---

**⚠️ IMPORTANTE:** Atualize este documento conforme novas funcionalidades forem adicionadas!

