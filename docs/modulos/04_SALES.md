# 💼 Módulo de Vendas (Sales)

**Última atualização:** 2025-11-14  
**Status:** 🚧 Planejado  
**Progresso:** 0%

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

O módulo de Vendas é responsável por todo o processo de vendas, desde o catálogo de produtos até a criação de pedidos. Inclui gestão de carteira de clientes por vendedor, aplicação de descontos, validações de estoque e crédito, e integração com os módulos de Logística e Invoice.

### Objetivos Principais

- Facilitar o processo de vendas para vendedores
- Gerenciar carteira de clientes por vendedor
- Aplicar regras de desconto automáticas e manuais
- Validar estoque e crédito antes de confirmar pedidos
- Fornecer dashboard com KPIs para vendedores
- Integrar com Warehouse, Logistics e Invoicing

---

## 🚀 Funcionalidades

### 1. Catálogo de Produtos

#### 1.1 Modos de Visualização

**Modo Card (Visual)**

- Imagem grande do produto
- Nome e descrição curta
- Preço (adaptado ao cliente selecionado)
- Estoque disponível (por warehouse)
- Embalagens (Unidade/Display/Caixa)
- Marca e categoria
- Promoções ativas
- Margem sugerida
- Preço recomendado de revenda (se revendedor)
- Botão "Adicionar ao carrinho"

**Modo Lista (Produtividade)**

- Visualização compacta
- Informações essenciais
- Input rápido de quantidade
- Ações rápidas (+1, +10, adicionar caixa/display)
- Ideal para vendedores experientes

**Modo Detalhado (Ficha Completa)**

- Todas as imagens
- Descrição longa (HTML/Markdown)
- Especificações técnicas
- Embalagens com conversões
- Lote/validade (se aplicável)
- Fabricante
- Códigos (NCM, EAN, UPC, SKU)
- Preços (padrão, cliente, margens)
- Descontos aplicados
- Produtos relacionados (upsell/cross-sell)
- Estoque por warehouse (se permissão)

#### 1.2 Funcionalidades do Catálogo

- **Filtros:**

  - Por categoria
  - Por marca/fabricante
  - Por disponibilidade (em estoque)
  - Por preço
  - Por tipo de produto (físico, serviço, digital, etc.)
  - Por warehouse (vendedor vê apenas seu warehouse)

- **Busca:**

  - Por nome
  - Por SKU
  - Por código de barras
  - Por descrição

- **Modo Offline:**
  - Download de catálogo completo
  - Imagens e regras de preço
  - Sincronização quando online
  - TTL (Time To Live) configurável

### 2. Sales Orders (Pedidos de Venda)

#### 2.1 Criação de Pedido

**Passo 1: Seleção do Warehouse**

- Vendedor seleciona warehouse (padrão: warehouse atribuído)
- Sistema valida permissão do vendedor
- Catálogo filtra produtos do warehouse selecionado

**Passo 2: Seleção do Cliente**

- Buscar cliente (apenas carteira do vendedor)
- Criar novo cliente (se permissão)
- Ver histórico do cliente
- Ver limite de crédito
- Ver invoices em aberto

**Passo 3: Adicionar Produtos**

- Via catálogo (modo card/lista/detalhado)
- Via busca por SKU/código de barras
- Selecionar embalagem (Unidade/Display/Caixa)
- Quantidade
- Sistema converte automaticamente para unidades internas

**Passo 4: Aplicar Descontos**

- Descontos automáticos aplicados (por cliente, categoria, etc.)
- Vendedor pode aplicar desconto manual (até seu limite)
- Se ultrapassar limite → gera task de aprovação
- Sistema calcula margem final

**Passo 5: Validações**

- Estoque disponível
- Limite de crédito do cliente
- Preço mínimo permitido
- Restrições fiscais (se aplicável)

**Passo 6: Confirmar Pedido**

- Gerar Sales Order
- Status: `confirmed`
- Reservar estoque (se configurado)
- Enviar notificação para Logística
- Criar Picking Job (se auto-picking)

#### 2.2 Edição de Pedido

- Permitir edição apenas se status permitir
- Adicionar/remover itens
- Alterar quantidades
- Ajustar descontos (com validação)
- Atualizar observações

#### 2.3 Cancelamento de Pedido

- Permitir cancelamento se status permitir
- Liberar estoque reservado
- Gerar notificação
- Registrar motivo do cancelamento
- Se invoice já gerada → criar credit note

### 3. Carteira de Clientes

#### 3.1 Gestão de Carteira

- **Atribuição de Clientes:**

  - Cliente vinculado a vendedor
  - Gerente pode reatribuir
  - Histórico de reatribuições mantido

- **Visualização:**

  - Lista de clientes da carteira
  - Filtros por status, cidade, tipo
  - Busca por nome, email, documento

- **Informações do Cliente:**
  - Dados cadastrais
  - Histórico de compras
  - Invoices em aberto
  - Invoices vencidas
  - Volume total comprado
  - Score de compra
  - Limite de crédito
  - Termos de pagamento
  - Descontos configurados

### 4. Dashboard do Vendedor

#### 4.1 KPIs Principais

- **Vendas do Mês:**

  - Total vendido
  - Meta mensal
  - % atingido
  - Comparação com mês anterior

- **Pedidos:**

  - Pedidos em aberto (por status)
  - Pedidos do dia
  - Pedidos da semana

- **Clientes:**

  - Total de clientes na carteira
  - Clientes ativos (compraram nos últimos 30 dias)
  - Clientes sem compra há X dias (alerta)

- **Financeiro:**
  - Faturas em aberto (agregado por cliente)
  - Total a receber
  - Invoices vencidas

#### 4.2 Alertas

- Estoque baixo de produtos que ele mais vende
- Clientes sem compra há X dias
- Invoices vencidas dos clientes
- Pedidos aguardando aprovação

#### 4.3 Ranking (Gamificação - Opcional)

- Posição no ranking de vendas
- Comparação com outros vendedores
- Badges e conquistas

### 5. Sistema de Aprovações

#### 5.1 Tipos de Aprovação

- **Desconto acima do limite:**

  - Vendedor aplica desconto > seu limite
  - Gera task para supervisor/gerente
  - Notificação em tempo real
  - Aprovação/rejeição com motivo

- **Crédito excedido:**

  - Cliente ultrapassa limite de crédito
  - Gera task para financeiro
  - Aprovação necessária para prosseguir

- **Cancelamento de pedido:**
  - Se valor acima de X
  - Requer aprovação de gerente

---

## 🗄️ Modelos/Entidades

### SalesOrder

```python
class SalesOrder(models.Model):
    """Pedido de Venda"""

    STATUS_CHOICES = [
        ('draft', 'Rascunho'),
        ('pending_validation', 'Aguardando Validação'),
        ('confirmed', 'Confirmado'),
        ('allocated', 'Estoque Reservado'),
        ('picking_in_progress', 'Em Separação'),
        ('picked', 'Separado'),
        ('packed', 'Embalado'),
        ('shipped', 'Enviado'),
        ('in_transit', 'Em Trânsito'),
        ('delivered', 'Entregue'),
        ('partially_delivered', 'Parcialmente Entregue'),
        ('cancelled', 'Cancelado'),
        ('returned', 'Devolvido'),
        ('closed', 'Fechado'),
    ]

    # Identificação
    order_number = models.CharField(max_length=50, unique=True)
    warehouse = models.ForeignKey('warehouse.Warehouse', on_delete=models.PROTECT)
    seller = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='sales_orders')
    customer = models.ForeignKey('sales.Customer', on_delete=models.PROTECT)

    # Status
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='draft')

    # Itens
    order_lines = models.JSONField(default=list)  # [{product_id, qty, uom, price, discount, total}]

    # Totais
    sub_total = models.DecimalField(max_digits=15, decimal_places=2)
    total_discounts = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_tax = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    shipping_cost = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=15, decimal_places=2)

    # Endereço de entrega
    shipping_address = models.JSONField()

    # Pagamento
    payment_terms = models.ForeignKey('invoicing.PaymentTerm', on_delete=models.PROTECT, null=True)
    payment_method = models.CharField(max_length=50, blank=True)

    # Observações
    notes = models.TextField(blank=True)
    internal_notes = models.TextField(blank=True)

    # Metadados
    source = models.CharField(max_length=20, default='manual')  # manual, web, app
    allocated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'sales_orders'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['seller', 'status']),
            models.Index(fields=['customer', 'status']),
            models.Index(fields=['warehouse', 'status']),
        ]

    def __str__(self):
        return f"SO-{self.order_number}"
```

### Customer

```python
class Customer(models.Model):
    """Cliente"""

    TYPE_CHOICES = [
        ('consumer', 'Consumidor Final'),
        ('reseller_small', 'Revendedor Pequeno'),
        ('reseller_med', 'Revendedor Médio'),
        ('distributor', 'Distribuidor'),
        ('vip', 'VIP/Parceiro'),
    ]

    STATUS_CHOICES = [
        ('active', 'Ativo'),
        ('blocked', 'Bloqueado'),
        ('prospect', 'Prospect'),
    ]

    # Identificação
    name = models.CharField(max_length=255)
    legal_name = models.CharField(max_length=255, blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='consumer')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')

    # Documentos
    tax_id_cpf = models.CharField(max_length=14, blank=True)
    tax_id_cnpj = models.CharField(max_length=18, blank=True)
    tax_id_ein = models.CharField(max_length=20, blank=True)

    # Contato
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    mobile = models.CharField(max_length=20, blank=True)

    # Endereços
    addresses = models.JSONField(default=list)  # [{label, address, city, state, zip, country}]

    # Vendedor
    assigned_seller = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='portfolio_customers'
    )

    # Financeiro
    credit_limit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    payment_terms = models.ForeignKey('invoicing.PaymentTerm', on_delete=models.SET_NULL, null=True)
    default_payment_method = models.CharField(max_length=50, blank=True)

    # Descontos (configurados no cliente)
    discount_policy = models.JSONField(default=dict)  # {global_percent, by_category: [], by_brand: []}

    # Metadados
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sales_customers'
        ordering = ['name']
        indexes = [
            models.Index(fields=['assigned_seller', 'status']),
            models.Index(fields=['type', 'status']),
        ]

    def __str__(self):
        return self.name
```

### SalesOrderLine

```python
class SalesOrderLine(models.Model):
    """Linha do Pedido de Venda"""

    order = models.ForeignKey('sales.SalesOrder', on_delete=models.CASCADE, related_name='lines')
    product = models.ForeignKey('warehouse.Product', on_delete=models.PROTECT)

    # Quantidade e embalagem
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    uom = models.CharField(max_length=20)  # unit, display, box
    quantity_in_units = models.DecimalField(max_digits=10, decimal_places=2)  # Convertido

    # Preço
    unit_price = models.DecimalField(max_digits=15, decimal_places=2)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=15, decimal_places=2)

    # Margem (calculada)
    cost_per_unit = models.DecimalField(max_digits=15, decimal_places=2, null=True)
    margin_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True)

    # Lote (se aplicável)
    lot_number = models.CharField(max_length=100, blank=True)

    class Meta:
        db_table = 'sales_order_lines'

    def __str__(self):
        return f"{self.order.order_number} - {self.product.name}"
```

---

## 🔌 APIs/Endpoints

### Base URL

```
/api/v1/sales/
```

### Endpoints

#### Catálogo

```http
GET /api/v1/sales/catalog/
Authorization: Bearer {access_token}
```

**Query Parameters:**

- `customer_id` - ID do cliente (aplica preços e descontos)
- `warehouse_id` - ID do warehouse (filtra produtos)
- `mode` - card, list, detailed
- `category` - Filtrar por categoria
- `brand` - Filtrar por marca
- `search` - Busca textual
- `in_stock` - true/false (apenas com estoque)

**Resposta (200 OK):**

```json
{
  "count": 150,
  "results": [
    {
      "id": 1,
      "sku": "PROD-001",
      "name": "Produto Exemplo",
      "description_short": "Descrição curta",
      "image": "https://...",
      "price": 100.0,
      "price_for_customer": 95.0,
      "discount_applied": 5.0,
      "available_stock": 50,
      "packaging": {
        "unit": { "qty": 1, "price": 100.0 },
        "display": { "qty": 10, "price": 950.0 },
        "box": { "qty": 120, "price": 10800.0 }
      },
      "margin_suggested": 25.5,
      "suggested_retail_price": 125.0
    }
  ]
}
```

#### Sales Orders

```http
GET /api/v1/sales/orders/
Authorization: Bearer {access_token}
```

**Query Parameters:**

- `status` - Filtrar por status
- `customer` - Filtrar por cliente
- `warehouse` - Filtrar por warehouse
- `date_from` - Data inicial
- `date_to` - Data final

```http
POST /api/v1/sales/orders/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "warehouse_id": 1,
  "customer_id": 5,
  "lines": [
    {
      "product_id": 10,
      "quantity": 2,
      "uom": "box",
      "discount_percent": 5
    }
  ],
  "payment_terms_id": 1,
  "notes": "Observações do pedido"
}
```

**Resposta (201 Created):**

```json
{
  "id": 1,
  "order_number": "SO-000001",
  "status": "confirmed",
  "warehouse": {"id": 1, "name": "Orlando"},
  "customer": {"id": 5, "name": "Cliente Exemplo"},
  "lines": [...],
  "totals": {
    "sub_total": 1000.00,
    "total_discounts": 50.00,
    "grand_total": 950.00
  },
  "created_at": "2025-11-14T10:00:00Z"
}
```

#### Customers

```http
GET /api/v1/sales/customers/
Authorization: Bearer {access_token}
```

**Query Parameters:**

- `seller` - Filtrar por vendedor (vendedor vê apenas sua carteira)
- `status` - Filtrar por status
- `type` - Filtrar por tipo

```http
POST /api/v1/sales/customers/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Novo Cliente",
  "email": "cliente@example.com",
  "type": "reseller_small",
  "assigned_seller_id": 1,
  "credit_limit": 10000.00,
  "payment_terms_id": 1,
  "discount_policy": {
    "global_percent": 5,
    "by_category": [
      {"category_id": 1, "percent": 10}
    ]
  }
}
```

#### Dashboard do Vendedor

```http
GET /api/v1/sales/dashboard/
Authorization: Bearer {access_token}
```

**Resposta (200 OK):**

```json
{
  "kpis": {
    "sales_this_month": 50000.0,
    "monthly_target": 60000.0,
    "target_percentage": 83.33,
    "orders_today": 5,
    "orders_this_week": 25
  },
  "open_orders": {
    "confirmed": 10,
    "picking": 5,
    "shipped": 3
  },
  "open_invoices": {
    "total_amount": 15000.0,
    "overdue_amount": 3000.0,
    "by_customer": [{ "customer_id": 1, "amount": 5000.0, "overdue": true }]
  },
  "alerts": {
    "low_stock": [{ "product_id": 1, "name": "Produto X", "stock": 5 }],
    "inactive_customers": [
      { "customer_id": 2, "name": "Cliente Y", "days_without_order": 45 }
    ]
  }
}
```

---

## 🔄 Fluxos de Trabalho

### Fluxo 1: Criação de Pedido Completo

```
1. Vendedor acessa Catálogo
   ↓
2. Seleciona Cliente (da sua carteira)
   ↓
3. Sistema aplica preços e descontos do cliente
   ↓
4. Vendedor adiciona produtos ao carrinho
   ↓
5. Sistema valida estoque em tempo real
   ↓
6. Vendedor aplica descontos (se necessário)
   ↓
7. Sistema valida limite de desconto do vendedor
   ↓
8. Se ultrapassar → gera task de aprovação
   ↓
9. Vendedor confirma pedido
   ↓
10. Sistema valida:
    - Estoque disponível
    - Limite de crédito
    - Preço mínimo
   ↓
11. Cria Sales Order (status: confirmed)
   ↓
12. Reserva estoque (se configurado)
   ↓
13. Envia notificação para Logística
   ↓
14. Cria Picking Job (se auto-picking)
```

### Fluxo 2: Aplicação de Desconto

```
1. Vendedor aplica desconto no pedido
   ↓
2. Sistema verifica limite do vendedor
   ↓
3. Se dentro do limite:
   - Aplica desconto
   - Atualiza totais
   - Calcula nova margem
   ↓
4. Se ultrapassar limite:
   - Bloqueia aplicação
   - Gera task de aprovação
   - Notifica supervisor/gerente
   ↓
5. Supervisor aprova/rejeita
   ↓
6. Se aprovado:
   - Desconto aplicado
   - Pedido liberado
```

---

## 📐 Regras de Negócio

### 1. Warehouse e Vendedor

- Vendedor só vê produtos do seu warehouse atribuído
- Vendedor só pode criar pedidos do seu warehouse
- Gerente pode ver todos os warehouses
- Admin pode reatribuir vendedor a outro warehouse

### 2. Carteira de Clientes

- Vendedor só vê clientes da sua carteira
- Vendedor pode criar novos clientes (se permissão)
- Novos clientes são automaticamente atribuídos ao vendedor
- Gerente pode reatribuir clientes entre vendedores
- Histórico de reatribuições é mantido

### 3. Descontos

- Descontos automáticos aplicados por:

  1. Cliente (desconto global)
  2. Categoria
  3. Marca
  4. Tipo de produto
  5. Volume
  6. Promoções ativas

- Descontos manuais:

  - Vendedor tem limite configurável (padrão: 5-10%)
  - Supervisor: até 15%
  - Gerente: até 25%
  - Diretor: sem limite

- Prioridade: maior desconto válido é aplicado

### 4. Validações

- **Estoque:**

  - Verificar disponibilidade antes de confirmar
  - Permitir backorder (se configurado)
  - Alertar se estoque insuficiente

- **Crédito:**

  - Verificar limite antes de confirmar
  - Se exceder → aprovação necessária
  - Bloquear se cliente inadimplente

- **Preço:**
  - Verificar preço mínimo permitido
  - Alertar se margem muito baixa
  - Requer aprovação se abaixo do mínimo

### 5. Status do Pedido

- **draft** → Vendedor pode editar livremente
- **confirmed** → Enviado para logística, não pode mais editar itens
- **picking** → Em separação, não pode cancelar
- **shipped** → Invoice pode ser gerada
- **delivered** → Pedido concluído

---

## 🔐 Permissões

### Vendedor

- ✅ Ver catálogo (apenas seu warehouse)
- ✅ Criar pedidos (apenas seus clientes)
- ✅ Editar pedidos próprios (se status permitir)
- ✅ Aplicar desconto (até seu limite)
- ✅ Ver dashboard próprio
- ✅ Ver carteira de clientes
- ❌ Ver custos (apenas margem)
- ❌ Cancelar pedidos (apenas se status permitir)
- ❌ Ver pedidos de outros vendedores

### Supervisor de Vendas

- ✅ Tudo que vendedor pode
- ✅ Ver pedidos da equipe
- ✅ Aprovar descontos (até 15%)
- ✅ Reatribuir clientes dentro da equipe
- ✅ Ver relatórios da equipe

### Gerente de Vendas

- ✅ Tudo que supervisor pode
- ✅ Ver todos os pedidos
- ✅ Aprovar descontos (até 25%)
- ✅ Reatribuir clientes entre vendedores
- ✅ Ver todos os relatórios
- ✅ Cancelar pedidos

---

## ✅ Status de Implementação

### Catálogo

- [ ] Modo Card
- [ ] Modo Lista
- [ ] Modo Detalhado
- [ ] Filtros e busca
- [ ] Modo offline
- [ ] Aplicação de preços por cliente
- [ ] Cálculo de margem

### Sales Orders

- [ ] Modelo SalesOrder
- [ ] Modelo SalesOrderLine
- [ ] Criação de pedido
- [ ] Edição de pedido
- [ ] Cancelamento
- [ ] Validações (estoque, crédito, preço)
- [ ] Status workflow
- [ ] Integração com Warehouse
- [ ] Integração com Logistics

### Customers

- [ ] Modelo Customer
- [ ] CRUD de clientes
- [ ] Carteira por vendedor
- [ ] Histórico de compras
- [ ] Invoices em aberto
- [ ] Configuração de descontos

### Dashboard

- [ ] KPIs principais
- [ ] Pedidos em aberto
- [ ] Faturas em aberto
- [ ] Alertas
- [ ] Ranking (opcional)

### Aprovações

- [ ] Sistema de tasks
- [ ] Aprovação de descontos
- [ ] Aprovação de crédito
- [ ] Aprovação de cancelamento
- [ ] Notificações

### APIs

- [ ] GET /catalog/
- [ ] GET /orders/
- [ ] POST /orders/
- [ ] PUT /orders/{id}/
- [ ] DELETE /orders/{id}/
- [ ] GET /customers/
- [ ] POST /customers/
- [ ] GET /dashboard/

---

## 💻 Notas Técnicas

### Performance

- **Cache do Catálogo:**

  - Cachear produtos por warehouse
  - Cachear preços por cliente
  - TTL: 5 minutos

- **Validações:**
  - Fazer validações em background quando possível
  - Usar Celery para tarefas pesadas

### Segurança

- Vendedor nunca vê custos, apenas margem
- Validações sempre no backend
- Limites de desconto rígidos
- Auditoria de todas as ações

### Integrações

- **Warehouse:** Verificar estoque em tempo real
- **Logistics:** Criar Picking Job automaticamente
- **Invoicing:** Gerar Invoice após shipping

---

**⚠️ IMPORTANTE:** Atualize este documento conforme a implementação progride!
