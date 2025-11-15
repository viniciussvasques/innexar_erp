# 📦 Módulo de Estoque (Warehouse)

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

O módulo de Warehouse gerencia todo o estoque físico da empresa, incluindo múltiplos depósitos (warehouses), cadastro de produtos, movimentações, transferências entre warehouses, e controle de posições físicas dentro de cada depósito.

### Objetivos Principais

- Gerenciar múltiplos warehouses (Orlando, Miami, etc.)
- Controlar estoque por warehouse, posição, lote
- Registrar todas as movimentações
- Permitir transferências entre warehouses
- Fornecer visão em tempo real do estoque
- Integrar com Sales e Logistics

---

## 🚀 Funcionalidades

### 1. Cadastro de Produtos

#### 1.1 Tipos de Produto

- **Produto Físico:** Produto físico com estoque
- **Serviço:** Não tem estoque físico
- **Produto Digital:** Arquivos, softwares, cursos
- **Assinatura:** Serviços recorrentes
- **Bundle/Kit:** Produto composto por outros produtos

#### 1.2 Campos do Produto

**Identificação:**
- SKU interno
- Código de barras (EAN/UPC)
- EIN (USA)
- HS Code (Internacional)
- NCM/CEST (Brasil)

**Embalagens:**
- Unidade básica
- Display (unidades por display)
- Caixa (displays por caixa, unidades totais)
- Peso e dimensões por embalagem

**Custo e Preço:**
- Custo unitário
- Custo por caixa
- Custo logístico
- Custo total calculado
- Preço base
- Preço mínimo
- Markup e margem

**Estoque:**
- Controla estoque? (sim/não)
- Controle por lote
- Controle por série
- Validade obrigatória
- Posição preferencial no warehouse

**Outros:**
- Categoria e subcategoria
- Marca/Fabricante
- Descrição curta e longa
- Imagens
- Atributos (cor, tamanho, etc.)

### 2. Múltiplos Warehouses

#### 2.1 Cadastro de Warehouse

- Nome e código (ex: ORL, MIA)
- Endereço completo
- Cidade, Estado, País
- Responsável
- Tipo (matriz, filial, cross-dock)
- Impressora configurada
- Timezone

#### 2.2 Posições no Warehouse

- Sistema de endereçamento:
  - Corredor (Aisle): A1, A2, B1, etc.
  - Rack: Prateleira
  - Level: Nível
  - Bin: Posição específica

- Mapa de posições:
  - Visualização do layout
  - Capacidade máxima por posição
  - Produtos por posição

### 3. Movimentações

#### 3.1 Entrada de Mercadoria

- Recebimento de compra (PO)
- Recebimento de transferência
- Ajuste de entrada
- Confirmação de lote/série
- Atualização de estoque

#### 3.2 Saída de Mercadoria

- Saída por pedido de venda
- Saída por transferência
- Ajuste de saída
- Baixa por perda/avaria

#### 3.3 Ajustes de Inventário

- Ajuste manual (com motivo)
- Contagem física
- Correções
- Requer aprovação (se valor alto)

### 4. Transferências entre Warehouses

#### 4.1 Processo de Transferência

1. Criar Transfer Order
2. Selecionar origem e destino
3. Adicionar produtos e quantidades
4. Aprovação (se necessário)
5. Separação no warehouse origem
6. Envio
7. Recebimento no warehouse destino
8. Atualização de estoque

#### 4.2 Rastreamento

- Status da transferência
- Data de envio
- Data de recebimento
- Responsável em cada etapa

### 5. Inventário Físico

#### 5.1 Tipos de Contagem

- **Contagem Total:** Inventário completo
- **Contagem Cíclica:** Por zona/área
- **Contagem por Produto:** Produto específico

#### 5.2 Processo

1. Gerar planilha de contagem
2. Contagem física
3. Importar contagens
4. Comparar com sistema
5. Gerar ajustes (com motivo)
6. Aprovar ajustes
7. Aplicar ajustes

---

## 🗄️ Modelos/Entidades

### Warehouse

```python
class Warehouse(models.Model):
    """Depósito/Warehouse"""
    
    TYPE_CHOICES = [
        ('main', 'Matriz'),
        ('branch', 'Filial'),
        ('crossdock', 'Cross-Dock'),
    ]
    
    code = models.CharField(max_length=10, unique=True)  # ORL, MIA
    name = models.CharField(max_length=100)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='USA')
    phone = models.CharField(max_length=20, blank=True)
    
    # Configurações
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='branch')
    positions_enabled = models.BooleanField(default=True)
    timezone = models.CharField(max_length=50, default='America/New_York')
    
    # Responsável
    manager = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='managed_warehouses'
    )
    
    # Impressora
    printer_config = models.JSONField(default=dict, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'warehouse_warehouses'
        ordering = ['code']
    
    def __str__(self):
        return f"{self.code} - {self.name}"
```

### Product

```python
class Product(models.Model):
    """Produto"""
    
    TYPE_CHOICES = [
        ('physical', 'Produto Físico'),
        ('service', 'Serviço'),
        ('digital', 'Produto Digital'),
        ('subscription', 'Assinatura'),
        ('bundle', 'Bundle/Kit'),
    ]
    
    # Identificação
    sku = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    description_short = models.TextField(blank=True)
    description_long = models.TextField(blank=True)
    
    # Tipo
    product_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='physical')
    
    # Códigos
    ean_upc = models.CharField(max_length=50, blank=True)
    ein = models.CharField(max_length=50, blank=True)
    hs_code = models.CharField(max_length=50, blank=True)
    ncm = models.CharField(max_length=10, blank=True)  # Brasil
    cest = models.CharField(max_length=10, blank=True)  # Brasil
    
    # Categoria
    category = models.ForeignKey('warehouse.Category', on_delete=models.SET_NULL, null=True)
    subcategory = models.ForeignKey('warehouse.SubCategory', on_delete=models.SET_NULL, null=True)
    brand = models.CharField(max_length=100, blank=True)
    manufacturer = models.CharField(max_length=100, blank=True)
    
    # Embalagens
    packaging = models.JSONField(default=dict)  # {unit: 1, display: 10, box: 120}
    
    # Dimensões e Peso
    weight = models.DecimalField(max_digits=10, decimal_places=3, null=True)  # kg
    length = models.DecimalField(max_digits=10, decimal_places=2, null=True)  # cm
    width = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    height = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    
    # Custo
    cost_unit = models.DecimalField(max_digits=15, decimal_places=2, null=True)
    cost_box = models.DecimalField(max_digits=15, decimal_places=2, null=True)
    cost_logistic = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    cost_total = models.DecimalField(max_digits=15, decimal_places=2, null=True)  # Calculado
    
    # Preço
    price_base = models.DecimalField(max_digits=15, decimal_places=2)
    price_min = models.DecimalField(max_digits=15, decimal_places=2, null=True)
    
    # Controle de Estoque
    track_inventory = models.BooleanField(default=True)
    track_lot = models.BooleanField(default=False)
    track_serial = models.BooleanField(default=False)
    expiry_required = models.BooleanField(default=False)
    
    # Posição Preferencial
    preferred_position = models.CharField(max_length=50, blank=True)  # A1-R2-L3-B4
    
    # Imagens
    images = models.JSONField(default=list)  # [{url, is_primary}]
    
    # Status
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'warehouse_products'
        ordering = ['name']
        indexes = [
            models.Index(fields=['sku']),
            models.Index(fields=['product_type', 'is_active']),
            models.Index(fields=['category', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.sku} - {self.name}"
```

### InventoryBalance

```python
class InventoryBalance(models.Model):
    """Saldo de Estoque por Warehouse"""
    
    product = models.ForeignKey('warehouse.Product', on_delete=models.CASCADE)
    warehouse = models.ForeignKey('warehouse.Warehouse', on_delete=models.CASCADE)
    
    # Quantidades
    on_hand_qty = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    available_qty = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    reserved_qty = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    in_transit_qty = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Posição
    position = models.CharField(max_length=50, blank=True)  # A1-R2-L3-B4
    
    # Lote (se aplicável)
    lot_number = models.CharField(max_length=100, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    
    # Custo médio
    average_cost = models.DecimalField(max_digits=15, decimal_places=2, null=True)
    
    # Metadados
    last_movement_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'warehouse_inventory_balances'
        unique_together = ['product', 'warehouse', 'lot_number', 'position']
        indexes = [
            models.Index(fields=['warehouse', 'product']),
            models.Index(fields=['warehouse', 'position']),
            models.Index(fields=['expiry_date']),
        ]
    
    def __str__(self):
        return f"{self.product.sku} - {self.warehouse.code}: {self.available_qty}"
```

### InventoryMovement

```python
class InventoryMovement(models.Model):
    """Movimentação de Estoque"""
    
    TYPE_CHOICES = [
        ('receipt', 'Entrada'),
        ('issue', 'Saída'),
        ('transfer_out', 'Transferência Saída'),
        ('transfer_in', 'Transferência Entrada'),
        ('adjustment', 'Ajuste'),
        ('count', 'Contagem'),
    ]
    
    movement_number = models.CharField(max_length=50, unique=True)
    movement_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    
    # Warehouse
    warehouse = models.ForeignKey('warehouse.Warehouse', on_delete=models.PROTECT)
    
    # Produto
    product = models.ForeignKey('warehouse.Product', on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Posição e Lote
    position = models.CharField(max_length=50, blank=True)
    lot_number = models.CharField(max_length=100, blank=True)
    
    # Referências
    reference_type = models.CharField(max_length=50, blank=True)  # sales_order, transfer_order, etc.
    reference_id = models.IntegerField(null=True, blank=True)
    
    # Custo
    unit_cost = models.DecimalField(max_digits=15, decimal_places=2, null=True)
    total_cost = models.DecimalField(max_digits=15, decimal_places=2, null=True)
    
    # Motivo (para ajustes)
    reason = models.TextField(blank=True)
    
    # Usuário
    user = models.ForeignKey('users.User', on_delete=models.PROTECT)
    
    # Data
    movement_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'warehouse_inventory_movements'
        ordering = ['-movement_date']
        indexes = [
            models.Index(fields=['warehouse', 'movement_date']),
            models.Index(fields=['product', 'movement_date']),
            models.Index(fields=['reference_type', 'reference_id']),
        ]
    
    def __str__(self):
        return f"{self.movement_number} - {self.get_movement_type_display()}"
```

### TransferOrder

```python
class TransferOrder(models.Model):
    """Ordem de Transferência entre Warehouses"""
    
    STATUS_CHOICES = [
        ('requested', 'Solicitado'),
        ('approved', 'Aprovado'),
        ('dispatched', 'Despachado'),
        ('in_transit', 'Em Trânsito'),
        ('received', 'Recebido'),
        ('cancelled', 'Cancelado'),
    ]
    
    transfer_number = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    
    # Warehouses
    from_warehouse = models.ForeignKey(
        'warehouse.Warehouse',
        on_delete=models.PROTECT,
        related_name='transfer_orders_out'
    )
    to_warehouse = models.ForeignKey(
        'warehouse.Warehouse',
        on_delete=models.PROTECT,
        related_name='transfer_orders_in'
    )
    
    # Itens
    lines = models.JSONField(default=list)  # [{product_id, qty, lot, position}]
    
    # Aprovação
    approved_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='approved_transfers'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    
    # Datas
    requested_at = models.DateTimeField(auto_now_add=True)
    dispatched_at = models.DateTimeField(null=True, blank=True)
    received_at = models.DateTimeField(null=True, blank=True)
    
    # Observações
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'warehouse_transfer_orders'
        ordering = ['-requested_at']
    
    def __str__(self):
        return f"TO-{self.transfer_number}"
```

---

## 🔌 APIs/Endpoints

### Base URL
```
/api/v1/warehouse/
```

### Endpoints

#### Products

```http
GET /api/v1/warehouse/products/
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `warehouse_id` - Filtrar por warehouse (mostra estoque)
- `category` - Filtrar por categoria
- `brand` - Filtrar por marca
- `product_type` - Filtrar por tipo
- `in_stock` - true/false (apenas com estoque)
- `search` - Busca textual

```http
POST /api/v1/warehouse/products/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "sku": "PROD-001",
  "name": "Produto Exemplo",
  "product_type": "physical",
  "category_id": 1,
  "packaging": {
    "unit": 1,
    "display": 10,
    "box": 120
  },
  "cost_unit": 50.00,
  "price_base": 100.00,
  "track_inventory": true
}
```

#### Warehouses

```http
GET /api/v1/warehouse/warehouses/
Authorization: Bearer {access_token}
```

```http
POST /api/v1/warehouse/warehouses/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "code": "ORL",
  "name": "Orlando Warehouse",
  "address": "123 Main St",
  "city": "Orlando",
  "state": "FL",
  "country": "USA",
  "type": "branch",
  "positions_enabled": true
}
```

#### Inventory

```http
GET /api/v1/warehouse/inventory/
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `warehouse_id` - Filtrar por warehouse
- `product_id` - Filtrar por produto
- `position` - Filtrar por posição
- `low_stock` - true (apenas com estoque baixo)

**Resposta (200 OK):**
```json
{
  "count": 500,
  "results": [
    {
      "product": {
        "id": 1,
        "sku": "PROD-001",
        "name": "Produto Exemplo"
      },
      "warehouse": {
        "id": 1,
        "code": "ORL",
        "name": "Orlando"
      },
      "on_hand_qty": 100,
      "available_qty": 95,
      "reserved_qty": 5,
      "position": "A1-R2-L3-B4",
      "average_cost": 50.00
    }
  ]
}
```

#### Movements

```http
GET /api/v1/warehouse/movements/
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `warehouse_id` - Filtrar por warehouse
- `product_id` - Filtrar por produto
- `movement_type` - Filtrar por tipo
- `date_from` - Data inicial
- `date_to` - Data final

```http
POST /api/v1/warehouse/movements/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "movement_type": "adjustment",
  "warehouse_id": 1,
  "product_id": 1,
  "quantity": 10,
  "reason": "Ajuste de contagem física"
}
```

#### Transfer Orders

```http
GET /api/v1/warehouse/transfers/
Authorization: Bearer {access_token}
```

```http
POST /api/v1/warehouse/transfers/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "from_warehouse_id": 1,
  "to_warehouse_id": 2,
  "lines": [
    {
      "product_id": 1,
      "quantity": 50,
      "lot_number": "LOT-001"
    }
  ],
  "notes": "Transferência solicitada"
}
```

---

## 🔄 Fluxos de Trabalho

### Fluxo 1: Entrada de Mercadoria

```
1. Recebimento de compra/transferência
   ↓
2. Criar movimento tipo "receipt"
   ↓
3. Confirmar lote/série (se aplicável)
   ↓
4. Atribuir posição no warehouse
   ↓
5. Registrar quantidade
   ↓
6. Atualizar InventoryBalance
   ↓
7. Criar InventoryMovement
   ↓
8. Imprimir etiqueta (se configurado)
```

### Fluxo 2: Transferência entre Warehouses

```
1. Criar Transfer Order
   ↓
2. Aprovação (se necessário)
   ↓
3. Separação no warehouse origem
   ↓
4. Criar movimento "transfer_out"
   ↓
5. Atualizar estoque origem
   ↓
6. Envio
   ↓
7. Recebimento no destino
   ↓
8. Criar movimento "transfer_in"
   ↓
9. Atualizar estoque destino
```

---

## 📐 Regras de Negócio

### 1. Controle de Estoque

- Produtos físicos controlam estoque
- Serviços, digitais e assinaturas não controlam
- Estoque é por warehouse
- Estoque pode ser por posição (se positions_enabled)
- Estoque pode ser por lote (se track_lot)

### 2. Reservas

- Estoque pode ser reservado ao confirmar pedido
- available_qty = on_hand_qty - reserved_qty
- Reserva liberada ao cancelar pedido

### 3. Custo Médio

- Custo médio calculado por warehouse
- Atualizado a cada entrada
- Usado para cálculo de margem

### 4. Posições

- Produto pode ter posição preferencial
- Sistema sugere posição na entrada
- Picking otimizado por posição

---

## 🔐 Permissões

### Operador de Estoque

- ✅ Ver produtos
- ✅ Ver estoque (próprio warehouse)
- ✅ Registrar entrada
- ✅ Registrar saída
- ✅ Fazer contagem
- ❌ Ajustar estoque (requer aprovação)
- ❌ Ver custos

### Gerente de Estoque

- ✅ Tudo que operador pode
- ✅ Ajustar estoque
- ✅ Criar transferências
- ✅ Aprovar transferências
- ✅ Ver custos
- ✅ Ver todos os warehouses

---

## ✅ Status de Implementação

### Produtos
- [ ] Modelo Product
- [ ] CRUD de produtos
- [ ] Tipos de produto
- [ ] Embalagens
- [ ] Códigos (EAN, EIN, etc.)
- [ ] Custo e preço
- [ ] Imagens

### Warehouses
- [ ] Modelo Warehouse
- [ ] CRUD de warehouses
- [ ] Posições (aisle/rack/level/bin)
- [ ] Mapa de posições

### Estoque
- [ ] Modelo InventoryBalance
- [ ] Atualização automática
- [ ] Reservas
- [ ] Custo médio

### Movimentações
- [ ] Modelo InventoryMovement
- [ ] Entrada de mercadoria
- [ ] Saída de mercadoria
- [ ] Ajustes
- [ ] Contagem física

### Transferências
- [ ] Modelo TransferOrder
- [ ] Criação de transferência
- [ ] Aprovação
- [ ] Separação
- [ ] Recebimento

### APIs
- [ ] GET /products/
- [ ] POST /products/
- [ ] GET /warehouses/
- [ ] GET /inventory/
- [ ] POST /movements/
- [ ] GET /transfers/
- [ ] POST /transfers/

---

## 💻 Notas Técnicas

### Performance

- **Cache de Estoque:**
  - Cachear saldos por warehouse
  - TTL: 1 minuto
  - Invalidar ao criar movimento

- **Índices:**
  - Índices em warehouse + product
  - Índices em position
  - Índices em expiry_date (para FEFO)

### Integrações

- **Sales:** Verificar estoque em tempo real
- **Logistics:** Atualizar estoque após picking
- **Purchases:** Atualizar estoque após recebimento

---

**⚠️ IMPORTANTE:** Atualize este documento conforme a implementação progride!

