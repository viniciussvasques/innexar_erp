# 💵 Módulo de Preços e Descontos (Pricing)

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

O módulo de Pricing gerencia todo o sistema de preços e descontos do ERP, incluindo tabelas de preço, regras de desconto complexas, políticas por cliente, categoria, marca, volume, e sistema de aprovações para descontos acima dos limites.

### Objetivos Principais

- Gerenciar múltiplas tabelas de preço
- Aplicar descontos automáticos baseados em regras
- Controlar limites de desconto por vendedor
- Calcular preços finais considerando todas as regras
- Fornecer preço sugerido de revenda
- Sistema de aprovações para descontos

---

## 🚀 Funcionalidades

### 1. Tabelas de Preço

#### 1.1 Tipos de Tabela

- **Preço Base:** Preço padrão do produto
- **Tabela Varejo:** Preço para consumidor final
- **Tabela Atacado:** Preço para revendedores
- **Tabela Distribuidor:** Preço para distribuidores
- **Tabela VIP:** Preço para clientes VIP
- **Tabela Promocional:** Preços promocionais temporários

#### 1.2 Configuração

- Nome da tabela
- Tipo de tabela
- Validade (data início/fim)
- Produtos incluídos
- Preços por produto
- Aplicação automática por tipo de cliente

### 2. Sistema de Descontos

#### 2.1 Descontos por Cliente

- **Desconto Global:**
  - Percentual aplicado em todos os produtos
  - Exemplo: 5% em tudo

- **Desconto por Categoria:**
  - Categoria → Percentual
  - Exemplo: Bebidas 10%, Higiene 5%

- **Desconto por Subcategoria:**
  - Subcategoria → Percentual
  - Exemplo: Refrigerante 12%

- **Desconto por Fabricante/Marca:**
  - Marca → Percentual
  - Exemplo: Coca-Cola 8%, Nestlé 4%

- **Desconto por Tipo de Item:**
  - Produto físico, serviço, digital
  - Cada tipo com desconto específico

#### 2.2 Descontos por Volume

- **Descontos Progressivos:**
  - 10 unidades → 5%
  - 20 unidades → 8%
  - 50 unidades → 12%
  - 100 unidades → 15%

- **Descontos por Valor:**
  - R$ 1.000 → 3%
  - R$ 5.000 → 5%
  - R$ 10.000 → 8%

#### 2.3 Descontos Promocionais

- **Por Período:**
  - Data início/fim
  - Percentual ou valor fixo

- **Por Produto:**
  - Produto específico
  - Percentual ou valor fixo

- **Por Categoria:**
  - Toda a categoria
  - Percentual ou valor fixo

#### 2.4 Descontos Especiais

- **Por Fidelidade:**
  - Após X pedidos → desconto extra
  - Exemplo: 50 pedidos → +2%

- **Por Volume Mensal:**
  - R$ 5.000/mês → +3%
  - R$ 15.000/mês → +5%

- **Por Mix:**
  - Comprar categoria X + Y → desconto adicional

### 3. Prioridade de Descontos

#### 3.1 Ordem de Avaliação

1. Desconto específico do produto
2. Desconto por categoria
3. Desconto por subcategoria
4. Desconto por fabricante
5. Desconto por tipo de produto
6. Desconto padrão do cliente
7. Desconto de promoção geral
8. Desconto por volume
9. Desconto manual do vendedor

#### 3.2 Regra de Aplicação

- Sempre aplica o **maior desconto válido**
- A menos que `stackable=True` (descontos acumulativos)
- Nunca ultrapassa preço mínimo

### 4. Limites de Desconto

#### 4.1 Por Vendedor

- **Vendedor Júnior:** 3%
- **Vendedor:** 5-10% (configurável)
- **Supervisor:** até 15%
- **Gerente:** até 25%
- **Diretor:** sem limite

#### 4.2 Sistema de Aprovação

- Se vendedor ultrapassar limite:
  - Bloqueia aplicação
  - Gera task de aprovação
  - Notifica supervisor/gerente
  - Aprovação/rejeição com motivo

### 5. Preço Sugerido de Revenda

#### 5.1 Para Revendedores

- Mostra preço atacado (quanto paga)
- Mostra preço sugerido de revenda (MSRP)
- Calcula margem do revendedor
- Calcula lucro por unidade/caixa
- Sugestão de markup

#### 5.2 Simulador

- Revendedor pode:
  - Aplicar markup desejado
  - Ver preço final sugerido
  - Ou definir preço final
  - Ver margem calculada

---

## 🗄️ Modelos/Entidades

### PriceList

```python
class PriceList(models.Model):
    """Tabela de Preço"""
    
    TYPE_CHOICES = [
        ('base', 'Preço Base'),
        ('retail', 'Varejo'),
        ('wholesale', 'Atacado'),
        ('distributor', 'Distribuidor'),
        ('vip', 'VIP'),
        ('promotional', 'Promocional'),
    ]
    
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50, unique=True)
    price_list_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    
    # Validade
    valid_from = models.DateField(null=True, blank=True)
    valid_to = models.DateField(null=True, blank=True)
    
    # Aplicação
    auto_apply_to_customer_type = models.CharField(max_length=50, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'pricing_price_lists'
        ordering = ['name']
    
    def __str__(self):
        return self.name
```

### PriceListItem

```python
class PriceListItem(models.Model):
    """Item da Tabela de Preço"""
    
    price_list = models.ForeignKey('pricing.PriceList', on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('warehouse.Product', on_delete=models.CASCADE)
    
    # Preço
    price = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Embalagem (se preço específico)
    uom = models.CharField(max_length=20, default='unit')  # unit, display, box
    
    # Validade
    valid_from = models.DateField(null=True, blank=True)
    valid_to = models.DateField(null=True, blank=True)
    
    class Meta:
        db_table = 'pricing_price_list_items'
        unique_together = ['price_list', 'product', 'uom']
    
    def __str__(self):
        return f"{self.price_list.name} - {self.product.name}: {self.price}"
```

### DiscountRule

```python
class DiscountRule(models.Model):
    """Regra de Desconto"""
    
    TYPE_CHOICES = [
        ('product', 'Produto Específico'),
        ('category', 'Categoria'),
        ('subcategory', 'Subcategoria'),
        ('brand', 'Marca/Fabricante'),
        ('customer', 'Cliente'),
        ('customer_type', 'Tipo de Cliente'),
        ('order_total', 'Valor do Pedido'),
        ('volume', 'Volume'),
        ('promo', 'Promoção'),
        ('loyalty', 'Fidelidade'),
    ]
    
    name = models.CharField(max_length=100)
    discount_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    
    # Target (o que recebe o desconto)
    target_id = models.IntegerField(null=True, blank=True)  # product_id, category_id, etc.
    target_criteria = models.JSONField(default=dict)  # Critérios complexos
    
    # Valor do desconto
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    discount_amount = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    
    # Validade
    valid_from = models.DateField(null=True, blank=True)
    valid_to = models.DateField(null=True, blank=True)
    
    # Prioridade (maior = aplicado primeiro)
    priority = models.IntegerField(default=0)
    
    # Stackable (pode acumular com outros)
    stackable = models.BooleanField(default=False)
    
    # Condições
    min_quantity = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    min_amount = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'pricing_discount_rules'
        ordering = ['-priority', 'name']
    
    def __str__(self):
        return f"{self.name} - {self.get_discount_type_display()}"
```

### DiscountApproval

```python
class DiscountApproval(models.Model):
    """Aprovação de Desconto"""
    
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('approved', 'Aprovado'),
        ('rejected', 'Rejeitado'),
    ]
    
    # Relacionamentos
    sales_order = models.ForeignKey('sales.SalesOrder', on_delete=models.CASCADE, related_name='discount_approvals')
    requested_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='discount_requests')
    
    # Desconto
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=15, decimal_places=2)
    seller_limit = models.DecimalField(max_digits=5, decimal_places=2)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Aprovação
    approved_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='discount_approvals'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # Metadados
    requested_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'pricing_discount_approvals'
        ordering = ['-requested_at']
    
    def __str__(self):
        return f"Approval {self.id} - {self.sales_order.order_number}"
```

---

## 🔌 APIs/Endpoints

### Base URL
```
/api/v1/pricing/
```

### Endpoints

#### Price Lists

```http
GET /api/v1/pricing/price-lists/
Authorization: Bearer {access_token}
```

```http
POST /api/v1/pricing/price-lists/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Tabela Atacado",
  "code": "WHOLESALE-001",
  "price_list_type": "wholesale",
  "valid_from": "2025-01-01",
  "valid_to": "2025-12-31"
}
```

#### Calculate Price

```http
POST /api/v1/pricing/calculate/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "product_id": 1,
  "customer_id": 5,
  "quantity": 10,
  "uom": "box"
}
```

**Resposta (200 OK):**
```json
{
  "product_id": 1,
  "base_price": 100.00,
  "price_list_price": 95.00,
  "discounts_applied": [
    {
      "type": "customer",
      "name": "Desconto Cliente",
      "percent": 5.00
    }
  ],
  "final_price": 90.25,
  "total_discount_percent": 9.75,
  "margin_percent": 25.5,
  "suggested_retail_price": 125.00
}
```

#### Discount Rules

```http
GET /api/v1/pricing/discount-rules/
Authorization: Bearer {access_token}
```

```http
POST /api/v1/pricing/discount-rules/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Desconto Bebidas",
  "discount_type": "category",
  "target_id": 1,
  "discount_percent": 10.00,
  "priority": 5,
  "valid_from": "2025-11-01",
  "valid_to": "2025-11-30"
}
```

#### Discount Approvals

```http
GET /api/v1/pricing/discount-approvals/
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `status` - pending, approved, rejected
- `requested_by` - Filtrar por vendedor

```http
POST /api/v1/pricing/discount-approvals/{id}/approve/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "approved": true,
  "notes": "Aprovado - cliente VIP"
}
```

---

## 🔄 Fluxos de Trabalho

### Fluxo 1: Cálculo de Preço

```
1. Sistema recebe: produto, cliente, quantidade
   ↓
2. Busca tabela de preço do cliente
   ↓
3. Busca preço base do produto
   ↓
4. Aplica tabela de preço (se houver)
   ↓
5. Avalia regras de desconto (por prioridade):
   - Desconto específico do produto?
   - Desconto por categoria?
   - Desconto por marca?
   - Desconto do cliente?
   - Desconto por volume?
   ↓
6. Aplica maior desconto válido
   ↓
7. Calcula preço final
   ↓
8. Valida preço mínimo
   ↓
9. Retorna preço + margem + MSRP
```

### Fluxo 2: Aplicação de Desconto Manual

```
1. Vendedor aplica desconto no pedido
   ↓
2. Sistema verifica limite do vendedor
   ↓
3. Se dentro do limite:
   - Aplica desconto
   - Atualiza totais
   ↓
4. Se ultrapassar limite:
   - Bloqueia aplicação
   - Cria DiscountApproval
   - Notifica supervisor
   ↓
5. Supervisor aprova/rejeita
   ↓
6. Se aprovado:
   - Desconto aplicado
   - Pedido liberado
```

---

## 📐 Regras de Negócio

### 1. Prioridade

- Maior prioridade = avaliado primeiro
- Maior desconto válido é aplicado
- Stackable permite acumular

### 2. Validações

- Preço nunca abaixo do mínimo
- Desconto nunca acima do limite do vendedor (sem aprovação)
- Regras com validade respeitada

### 3. Performance

- Cache de regras ativas
- Avaliação otimizada
- Background para cálculos complexos

---

## 🔐 Permissões

### Vendedor

- ✅ Ver preços
- ✅ Aplicar desconto (até limite)
- ❌ Criar regras de desconto
- ❌ Editar tabelas de preço

### Gerente de Vendas

- ✅ Tudo que vendedor pode
- ✅ Aprovar descontos
- ✅ Criar regras de desconto
- ✅ Editar tabelas de preço

---

## ✅ Status de Implementação

### Tabelas de Preço
- [ ] Modelo PriceList
- [ ] Modelo PriceListItem
- [ ] CRUD de tabelas
- [ ] Aplicação automática

### Descontos
- [ ] Modelo DiscountRule
- [ ] Engine de avaliação
- [ ] Descontos por cliente
- [ ] Descontos por categoria
- [ ] Descontos por volume
- [ ] Descontos promocionais

### Aprovações
- [ ] Modelo DiscountApproval
- [ ] Sistema de tasks
- [ ] Notificações
- [ ] Workflow de aprovação

### Cálculo
- [ ] Endpoint /calculate/
- [ ] Cache de resultados
- [ ] Validação de preço mínimo

### APIs
- [ ] GET /price-lists/
- [ ] POST /price-lists/
- [ ] POST /calculate/
- [ ] GET /discount-rules/
- [ ] POST /discount-rules/
- [ ] GET /discount-approvals/
- [ ] POST /discount-approvals/{id}/approve/

---

## 💻 Notas Técnicas

### Performance

- **Cache:**
  - Cachear regras ativas
  - Cachear preços calculados
  - TTL: 5 minutos

- **Otimização:**
  - Índices em prioridade
  - Avaliação em ordem de prioridade
  - Parar na primeira regra válida (se não stackable)

### Segurança

- Validações sempre no backend
- Limites rígidos
- Auditoria de descontos aplicados

---

**⚠️ IMPORTANTE:** Atualize este documento conforme a implementação progride!

