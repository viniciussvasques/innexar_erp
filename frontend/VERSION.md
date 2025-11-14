# 📦 Versionamento - Innexar ERP Frontend

## Versão Atual: 1.0.0

**Data de Lançamento:** 2025-11-13

### Changelog

#### v1.0.0 (2025-11-13) - Release Inicial

**✨ Features**

- Sistema de autenticação completo (login)
- Dashboard com widgets principais
- Módulo CRM (Leads, Contacts, Deals)
- Módulos Financeiro, Faturamento, Estoque, Configurações
- Internacionalização (en, pt, es)
- Layout responsivo com Sidebar
- Tema dark/light (preparado)
- Integração com API backend
- Testes automatizados configurados

**🎨 UI/UX**

- Tela de login profissional com efeitos visuais
- Design moderno e responsivo
- Componentes shadcn/ui
- Animações suaves

**🔧 Infraestrutura**

- Next.js 14 (App Router)
- TypeScript strict mode
- ESLint + Prettier
- Jest + Testing Library
- CI/CD (GitHub Actions)
- Husky git hooks

**📚 Documentação**

- Documentação completa em `docs/`
- Arquivo de contexto atualizado
- Regras de desenvolvimento
- Guia de testes

---

## Como Versionar

### Versionamento Semântico (SemVer)

- **MAJOR** (1.0.0): Mudanças incompatíveis
- **MINOR** (0.1.0): Novas features compatíveis
- **PATCH** (0.0.1): Correções de bugs

### Processo

1. Atualizar `package.json` version
2. Atualizar `VERSION.md` com changelog
3. Criar tag git: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`

### Exemplo

```bash
# Atualizar versão
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# Ou manualmente editar package.json
```
