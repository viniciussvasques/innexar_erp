# 🚀 Innexar ERP - Guia de Instalação

## Pré-requisitos

- Node.js 18+
- npm ou yarn

## Instalação

1. **Instalar dependências:**

```bash
npm install
```

2. **Configurar variáveis de ambiente:**

```bash
cp .env.local.example .env.local
```

Edite o `.env.local` e configure:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. **Executar em desenvolvimento:**

```bash
npm run dev
```

4. **Acessar a aplicação:**

- http://localhost:3000/en (inglês)
- http://localhost:3000/pt (português)
- http://localhost:3000/es (espanhol)

## Estrutura do Projeto

```
frontend/
├── app/                    # Next.js App Router
│   └── [locale]/           # Rotas por idioma
│       ├── login/          # Página de login
│       ├── register/       # Página de registro
│       ├── dashboard/      # Dashboard principal
│       └── crm/            # Módulo CRM
├── components/             # Componentes React
│   ├── ui/                 # Componentes shadcn/ui
│   ├── layouts/            # Layouts (Sidebar, Header)
│   └── providers/          # Providers (Theme, Query)
├── lib/                    # Utilitários
│   ├── api/                # Cliente API
│   ├── store/              # Zustand stores
│   └── i18n/               # Configuração i18n
├── messages/               # Traduções (en, pt, es)
└── types/                  # TypeScript types
```

## Funcionalidades Implementadas

✅ Autenticação (Login/Register)
✅ Dashboard básico
✅ Layout responsivo com Sidebar
✅ Internacionalização (3 idiomas)
✅ Integração com API backend
✅ Sistema de rotas por idioma
✅ Tema dark/light (preparado)
✅ CRM - Leads e Contacts

## Próximos Passos

- [ ] Completar módulo CRM (Deals, Activities)
- [ ] Implementar módulo Financeiro
- [ ] Implementar módulo Faturamento
- [ ] Adicionar mais componentes UI
- [ ] Implementar formulários completos

## Comandos Úteis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run start        # Iniciar produção
npm run lint         # Verificar código
npm run type-check   # Verificar tipos TypeScript
```
