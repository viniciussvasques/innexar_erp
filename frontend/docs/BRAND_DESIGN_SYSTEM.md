# 🎨 Brand & Design System - Innexar ERP

**Versão:** 1.0.0  
**Última atualização:** 2025-11-13

---

## 📋 Índice

1. [Identidade Visual](#identidade-visual)
2. [Paleta de Cores](#paleta-de-cores)
3. [Tipografia](#tipografia)
4. [Espaçamentos](#espaçamentos)
5. [Componentes Base](#componentes-base)
6. [Layout](#layout)
7. [Animações](#animações)
8. [Modais](#modais)
9. [Formulários](#formulários)
10. [Tabelas](#tabelas)

---

## 🎯 Identidade Visual

### Missão do Design

Criar uma experiência visual **profissional, moderna e corporativa** que transmita:
- **Confiabilidade**: Design sólido e consistente
- **Modernidade**: Interface atualizada e limpa
- **Eficiência**: Layout otimizado para produtividade
- **Profissionalismo**: Aparência corporativa de alto nível

### Princípios de Design

1. **Clareza acima de tudo**: Informações devem ser facilmente compreendidas
2. **Consistência**: Padrões visuais aplicados uniformemente
3. **Hierarquia visual**: Elementos importantes se destacam naturalmente
4. **Acessibilidade**: Contraste adequado e elementos legíveis
5. **Responsividade**: Funciona perfeitamente em todos os dispositivos

---

## 🎨 Paleta de Cores

### Cores Primárias

#### Primary (Azul Corporativo)
```css
--primary: 221.2 83.2% 53.3%;        /* #3b82f6 - Azul vibrante */
--primary-foreground: 210 40% 98%;  /* Texto sobre primary */
```

**Uso:**
- Botões principais (Salvar, Confirmar, Criar)
- Links e ações primárias
- Estados ativos (sidebar, tabs)
- Badges e indicadores importantes

**Dark Mode:**
```css
--primary: 217.2 91.2% 59.8%;        /* Azul mais claro para dark */
```

#### Secondary (Cinza Neutro)
```css
--secondary: 210 40% 96.1%;         /* #f3f4f6 - Cinza claro */
--secondary-foreground: 222.2 47.4% 11.2%;
```

**Uso:**
- Botões secundários
- Fundos de cards alternativos
- Estados desabilitados

### Cores Neutras (Slate)

Sistema de cores neutras baseado em **Slate** para máxima flexibilidade:

#### Light Mode
```css
/* Backgrounds */
--background: 0 0% 100%;              /* #ffffff - Branco puro */
--card: 0 0% 100%;                    /* #ffffff */

/* Textos */
--foreground: 222.2 84% 4.9%;        /* #111827 - Quase preto */
--muted-foreground: 215.4 16.3% 46.9%; /* #6b7280 - Cinza médio */

/* Bordas */
--border: 214.3 31.8% 91.4%;         /* #e5e7eb - Cinza claro */
--input: 214.3 31.8% 91.4%;
```

#### Dark Mode
```css
/* Backgrounds */
--background: 222.2 84% 4.9%;         /* #0f172a - Azul escuro */
--card: 222.2 84% 4.9%;

/* Textos */
--foreground: 210 40% 98%;            /* #f8fafc - Quase branco */
--muted-foreground: 215 20.2% 65.1%; /* #94a3b8 - Cinza claro */

/* Bordas */
--border: 217.2 32.6% 17.5%;         /* #1e293b - Cinza escuro */
--input: 217.2 32.6% 17.5%;
```

### Cores de Status

#### Success (Verde)
```css
--success: #10b981;  /* Verde esmeralda */
```
**Uso:** Confirmações, sucesso, status positivo

#### Warning (Amarelo)
```css
--warning: #f59e0b;  /* Amarelo âmbar */
```
**Uso:** Avisos, atenção necessária

#### Danger/Destructive (Vermelho)
```css
--destructive: 0 84.2% 60.2%;  /* #ef4444 - Vermelho */
--destructive-foreground: 210 40% 98%;
```
**Uso:** Erros, exclusões, ações destrutivas

### Cores de Background

#### Cards e Containers
- **Light:** `bg-white` (#ffffff)
- **Dark:** `bg-slate-900` (#0f172a)

#### Hover States
- **Light:** `bg-slate-50` (#f9fafb)
- **Dark:** `bg-slate-800` (#1e293b)

#### Overlay (Modais)
- **Light/Dark:** `rgba(0, 0, 0, 0.45)` com `backdrop-blur-[3px]`

---

## 📝 Tipografia

### Fonte Principal

**Inter** - Fonte sans-serif moderna e legível

```css
font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, 
  'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 
  'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

**Características:**
- Excelente legibilidade em telas
- Suporte completo a caracteres especiais
- Otimizada para interfaces digitais

### Escala Tipográfica

#### Títulos

```css
h1 {
  font-size: 1.5rem;      /* 24px */
  line-height: 1.2;
  font-weight: 700;      /* Bold */
  letter-spacing: -0.025em;
}

/* Desktop */
@media (min-width: 1024px) {
  h1 {
    font-size: 1.875rem;  /* 30px */
  }
}
```

```css
h2 {
  font-size: 1.25rem;     /* 20px */
  line-height: 1.3;
  font-weight: 600;       /* Semibold */
}

/* Desktop */
@media (min-width: 1024px) {
  h2 {
    font-size: 1.5rem;    /* 24px */
  }
}
```

```css
h3 {
  font-size: 1.125rem;    /* 18px */
  line-height: 1.4;
  font-weight: 600;       /* Semibold */
}

/* Desktop */
@media (min-width: 1024px) {
  h3 {
    font-size: 1.25rem;    /* 20px */
  }
}
```

#### Texto Corpo

- **Padrão:** `14px` (0.875rem) - `text-sm`
- **Pequeno:** `13px` (0.8125rem) - `text-xs`
- **Grande:** `16px` (1rem) - `text-base`

#### Pesos de Fonte

- **Regular:** 400 (padrão)
- **Medium:** 500 (`font-medium`)
- **Semibold:** 600 (`font-semibold`)
- **Bold:** 700 (`font-bold`)

### Aplicação por Contexto

| Elemento | Tamanho | Peso | Uso |
|----------|---------|------|-----|
| Título de Página | 24-30px | Bold | Páginas principais |
| Subtítulo | 16-18px | Regular | Descrições |
| Texto Corpo | 14px | Regular | Conteúdo geral |
| Texto Tabela | 13-14px | Regular | Dados tabulares |
| Labels | 14px | Medium | Formulários |
| Placeholders | 14px | Regular | Inputs |

---

## 📏 Espaçamentos

### Sistema de Grid (8px base)

Todos os espaçamentos seguem múltiplos de **8px**:

```css
/* Espaçamentos Padrão */
1 = 0.25rem  (4px)
2 = 0.5rem   (8px)
3 = 0.75rem  (12px)
4 = 1rem     (16px)
5 = 1.25rem  (20px)
6 = 1.5rem   (24px)
8 = 2rem     (32px)
10 = 2.5rem  (40px)
12 = 3rem    (48px)
```

### Aplicação

#### Padding Interno
- **Cards:** `p-6` (24px)
- **Modais:** `px-8 py-6` (32px horizontal, 24px vertical)
- **Inputs:** `px-4 py-2.5` (16px horizontal, 10px vertical)
- **Botões:** `px-5 py-2.5` (20px horizontal, 10px vertical)

#### Espaçamento entre Elementos
- **Formulários:** `space-y-5` (20px vertical)
- **Grid de Cards:** `gap-4` ou `gap-6` (16px ou 24px)
- **Listas:** `space-y-2` (8px vertical)

#### Margens
- **Seções:** `mb-6` ou `mb-8` (24px ou 32px)
- **Títulos:** `mb-2` ou `mb-4` (8px ou 16px)

---

## 🧩 Componentes Base

### Botões

#### Tamanhos
```css
/* Small */
height: 36px (h-9)
padding: 12px (px-3)
border-radius: 8px (rounded-lg)

/* Default */
height: 44px (h-11)
padding: 20px horizontal (px-5)
border-radius: 12px (rounded-xl)

/* Large */
height: 48px (h-12)
padding: 32px horizontal (px-8)
border-radius: 12px (rounded-xl)
```

#### Variantes
- **Default:** Primary color, sombra suave
- **Outline:** Borda, fundo transparente
- **Ghost:** Sem borda, hover sutil
- **Destructive:** Vermelho para ações destrutivas

### Inputs

```css
height: 44px (h-11)
padding: 16px horizontal, 10px vertical (px-4 py-2.5)
border-radius: 12px (rounded-lg)
border: 1px solid slate-200/800
font-size: 14px (text-sm)
```

**Estados:**
- **Focus:** Ring primary, 2px
- **Error:** Borda vermelha (`border-red-500`)
- **Disabled:** Opacidade 50%

### Cards

```css
border-radius: 16px (rounded-2xl)
border: 1px solid slate-200/800
background: white/slate-900
shadow: shadow-sm
padding: 24px (p-6)
```

---

## 📐 Layout

### Estrutura Principal

```
┌─────────────────────────────────────────┐
│ Header (64px altura fixa)              │
├──────────┬──────────────────────────────┤
│          │                              │
│ Sidebar  │  Conteúdo Principal         │
│ (280px)  │  (flexível)                 │
│          │                              │
│          │                              │
└──────────┴──────────────────────────────┘
```

### Sidebar

- **Largura expandida:** 280px (`w-[280px]`)
- **Largura colapsada:** 80px (`w-20`)
- **Background:** Branco (light) / Slate-900 (dark)
- **Borda:** Direita, `slate-200/800`
- **Altura:** 100vh (full height)

### Header

- **Altura:** 64px (`h-16`)
- **Background:** Branco (light) / Slate-900 (dark)
- **Borda:** Inferior, `slate-200/800`
- **Sticky:** Fixo no topo (`sticky top-0`)

### Área de Conteúdo

- **Padding:** 16px mobile, 24px desktop (`p-4 lg:p-6`)
- **Background:** `bg-background`
- **Max-width:** Sem limite (full width)

---

## ✨ Animações

### Duração Padrão

```css
/* Rápida */
duration-75: 75ms

/* Padrão */
duration-150: 150ms  /* Recomendado para UI corporativa */

/* Média */
duration-200: 200ms

/* Lenta */
duration-300: 300ms
```

### Easing

- **Padrão:** `ease-out` (início rápido, fim suave)
- **Hover:** `transition-all duration-150`

### Aplicações

| Elemento | Animação | Duração |
|----------|----------|---------|
| Modais | Fade in + Slide up | 150ms |
| Overlay | Fade in | 120-150ms |
| Hover | Background/Color change | 150ms |
| Sidebar | Width transition | 300ms |
| Tooltips | Fade in | 150ms |

---

## 🪟 Modais

### Tamanhos Padronizados

#### Small (Confirmações)
```css
max-width: 450px
Uso: Deletar, confirmar, alertas simples
```

#### Medium (Edição)
```css
max-width: 720px
Uso: Criar/editar Leads, Contacts, formulários padrão
```

#### Large (Formulários Complexos)
```css
max-width: 1100px
Uso: Criar/editar Contacts completo, formulários multi-seção
```

### Estrutura

```
┌─────────────────────────────────┐
│ Header (px-8 pt-8 pb-6)         │
│ ─────────────────────────────── │
│                                 │
│ Body (px-8 py-6)                │
│                                 │
│                                 │
│ ─────────────────────────────── │
│ Footer (px-8 py-6)              │
└─────────────────────────────────┘
```

### Overlay

```css
background: rgba(0, 0, 0, 0.45)
backdrop-filter: blur(3px)
animation: fade-in 150ms ease-out
```

### Estilo

- **Border-radius:** 16px (`rounded-2xl`)
- **Shadow:** `0 10px 40px rgba(0,0,0,0.12)`
- **Background:** Branco (light) / Slate-900 (dark)
- **Border:** `slate-200/800`

---

## 📋 Formulários

### Layout

- **Grid:** 2 colunas em desktop (`grid-cols-2`)
- **Gap:** 16px (`gap-4`)
- **Espaçamento vertical:** 20px (`space-y-5`)

### Labels

- **Posição:** Sempre acima do input
- **Tamanho:** 14px (`text-sm`)
- **Peso:** Medium (`font-medium`)
- **Espaçamento:** 8px abaixo (`mb-2`)

### Inputs

- **Altura:** 44px (`h-11`)
- **Padding:** 16px horizontal (`px-4`)
- **Border-radius:** 12px (`rounded-lg`)
- **Espaçamento entre campos:** 20px vertical

### Validação

- **Erro:** Borda vermelha (`border-red-500`)
- **Mensagem:** Texto vermelho pequeno abaixo do campo
- **Ícone:** Opcional, à direita do input

---

## 📊 Tabelas

### Estrutura

```css
/* Linhas */
height: 52px (h-[52px])
padding: 16px (p-4)

/* Header */
height: 48px (h-12)
background: slate-50/slate-900/50
font-weight: semibold
font-size: 14px (text-sm)

/* Células */
font-size: 14px (text-sm)
padding: 16px (p-4)
```

### Estilos

- **Bordas:** `slate-200/800`
- **Hover:** `slate-50/slate-800/50`
- **Zebra:** Opcional (não implementado por padrão)
- **Seleção:** `slate-100/slate-800`

### Paginação

- **Altura:** 48px
- **Padding:** 16px vertical (`py-4`)
- **Alinhamento:** Direita (`justify-end`)

---

## 🎯 Acessibilidade

### Contraste

- **Texto normal:** Mínimo 4.5:1
- **Texto grande:** Mínimo 3:1
- **Componentes UI:** Mínimo 3:1

### Foco

- **Ring:** 2px, cor primary
- **Offset:** 2px (`ring-offset-2`)

### Navegação por Teclado

- **Tab:** Navegação sequencial
- **Enter/Space:** Ativa botões
- **Esc:** Fecha modais

---

## 📱 Responsividade

### Breakpoints

```css
sm: 640px   /* Mobile grande */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Desktop grande */
2xl: 1400px /* Desktop extra grande */
```

### Aplicação

- **Mobile:** Sidebar oculta, menu hamburger
- **Tablet:** Sidebar colapsável
- **Desktop:** Sidebar sempre visível (280px ou 80px)

---

## 🔄 Dark Mode

### Suporte Completo

Todos os componentes suportam dark mode através de:
- Variáveis CSS com prefixo `dark:`
- Cores adaptadas para contraste adequado
- Backgrounds escuros para reduzir fadiga visual

### Toggle

- **Localização:** Header, canto superior direito
- **Opções:** Light, Dark, System
- **Persistência:** LocalStorage

---

## 📚 Recursos Adicionais

### Ícones

- **Biblioteca:** Lucide React
- **Tamanho padrão:** 20px (`h-5 w-5`)
- **Tamanho pequeno:** 16px (`h-4 w-4`)
- **Cor:** Herda do texto ou `text-slate-600`

### Sombras

```css
shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
shadow-md: 0 4px 6px rgba(0,0,0,0.1)
shadow-lg: 0 10px 15px rgba(0,0,0,0.1)
shadow-xl: 0 20px 25px rgba(0,0,0,0.1)
```

### Border Radius

```css
rounded-sm: 2px
rounded-md: 6px
rounded-lg: 12px
rounded-xl: 16px
rounded-2xl: 16px  /* Padrão corporativo */
```

---

## ✅ Checklist de Implementação

Ao criar novos componentes, verificar:

- [ ] Cores seguem a paleta definida
- [ ] Espaçamentos são múltiplos de 8px
- [ ] Tipografia usa a escala definida
- [ ] Animações têm 150ms
- [ ] Suporta dark mode
- [ ] É responsivo
- [ ] Tem estados de hover/focus
- [ ] Acessível (contraste, navegação por teclado)

---

**Documento mantido por:** Equipe de Desenvolvimento Innexar  
**Última revisão:** 2025-11-13

