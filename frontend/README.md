# 🎨 Innexar ERP - Frontend

Sistema ERP multi-tenant profissional com suporte a 3 mercados (USA, Brasil, LATAM).

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.local.example .env.local

# Executar em desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

## 📚 Documentação

- **[docs/CONTEXTO.md](docs/CONTEXTO.md)** - Contexto e status do projeto
- **[docs/ARQUITETURA.md](docs/ARQUITETURA.md)** - Arquitetura detalhada
- **[docs/TESTES.md](docs/TESTES.md)** - Guia de testes
- **[docs/BACKEND_API_SPEC.md](docs/BACKEND_API_SPEC.md)** - Especificação da API

## 🛠️ Scripts

```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run start        # Iniciar produção
npm run lint         # Verificar código
npm run lint:fix     # Corrigir código
npm run type-check   # Verificar tipos
npm run test         # Executar testes
npm run test:watch   # Testes em modo watch
npm run test:coverage # Testes com coverage
npm run format       # Formatar código
npm run format:check # Verificar formatação
```

## 🏗️ Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **shadcn/ui**
- **React Query**
- **Zustand**
- **next-intl**

## 📋 Padrões

- TypeScript strict mode
- ESLint + Prettier
- Testes automatizados (Jest)
- CI/CD (GitHub Actions)
- Conventional Commits

## 📖 Mais Informações

Consulte a [documentação completa](.cursor/rules/rules.mdc) para padrões de desenvolvimento.
