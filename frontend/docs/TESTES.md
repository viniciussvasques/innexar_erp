# 🧪 Guia de Testes - Innexar ERP Frontend

## 📋 Visão Geral

Este projeto usa **Jest** e **React Testing Library** para testes automatizados.

## 🚀 Configuração

### Instalar Dependências

```bash
npm install
```

### Executar Testes

```bash
# Todos os testes
npm run test

# Modo watch
npm run test:watch

# Com coverage
npm run test:coverage
```

## 📝 Estrutura de Testes

```
tests/
├── setup.ts                 # Configuração global
├── utils/
│   └── test-utils.tsx      # Helpers de teste
├── components/
│   └── ui/                  # Testes de componentes UI
├── lib/                     # Testes de utilitários
└── __mocks__/               # Mocks globais
```

## ✍️ Escrevendo Testes

### Componente Simples

```typescript
import { render, screen } from '@/tests/utils/test-utils'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```

### Componente com Props

```typescript
it('applies variant styles', () => {
  render(<Button variant="destructive">Delete</Button>)
  const button = screen.getByRole('button')
  expect(button).toHaveClass('bg-destructive')
})
```

### Testes de Interação

```typescript
import userEvent from '@testing-library/user-event'

it('calls onClick when clicked', async () => {
  const handleClick = jest.fn()
  const user = userEvent.setup()

  render(<Button onClick={handleClick}>Click</Button>)
  await user.click(screen.getByRole('button'))

  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

### Testes com React Query

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
})

render(
  <QueryClientProvider client={queryClient}>
    <Component />
  </QueryClientProvider>
)
```

## 🎯 Boas Práticas

### ✅ Fazer

- Testar comportamento, não implementação
- Usar queries acessíveis (getByRole, getByLabelText)
- Testar estados diferentes (loading, error, success)
- Isolar testes (não depender de outros)
- Usar nomes descritivos

### ❌ Evitar

- Testar detalhes de implementação
- Usar `getByTestId` como primeira opção
- Testes que dependem uns dos outros
- Mocks desnecessários
- Testes muito complexos

## 📊 Coverage

### Meta de Coverage

- **Mínimo:** 70%
- **Ideal:** 80%+
- **Componentes UI:** 70%+
- **Utilitários:** 90%+
- **Hooks:** 90%+

### Verificar Coverage

```bash
npm run test:coverage
```

## 🔧 Mocks

### Mock de next/navigation

Já configurado em `tests/setup.ts`

### Mock de next-intl

Já configurado em `tests/setup.ts`

### Mock de API

```typescript
jest.mock('@/lib/api/crm', () => ({
  crmApi: {
    getLeads: jest.fn(() => Promise.resolve({ results: [] })),
  },
}))
```

## 🐛 Debugging

### Ver HTML Renderizado

```typescript
import { screen } from '@testing-library/react'

screen.debug() // Imprime HTML no console
```

### Ver Queries Disponíveis

```typescript
screen.logTestingPlaygroundURL() // Gera URL com sugestões
```

## 📚 Recursos

- [React Testing Library](https://testing-library.com/react)
- [Jest](https://jestjs.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
