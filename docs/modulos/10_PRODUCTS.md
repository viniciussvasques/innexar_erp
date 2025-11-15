# 📦 Módulo de Produtos (Products)

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

O módulo de Produtos gerencia o cadastro completo de produtos e serviços, incluindo tipos diversos (físico, serviço, digital, assinatura, bundle), embalagens complexas (unidade → display → caixa), códigos internacionais, custos, preços e configurações de estoque.

### Objetivos Principais

- Cadastro completo de produtos e serviços
- Suporte a múltiplos tipos de produto
- Gestão de embalagens e conversões
- Códigos internacionais (EAN, EIN, HS Code, NCM)
- Cálculo automático de custo, markup e margem
- Integração com Warehouse, Sales e Pricing

---

## 🚀 Funcionalidades

### 1. Tipos de Produto

#### 1.1 Produto Físico

- Controla estoque
- Tem peso e dimensões
- Pode ter lote/série
- Pode ter validade
- Posição no warehouse
- Custo de compra
- Custo logístico

#### 1.2 Serviço

- Não controla estoque
- Tem duração
- Tipo de cobrança (hora/projeto/fixo)
- Pode ser agendado
- Relatórios de execução

#### 1.3 Produto Digital

- Link de download
- Tamanho do arquivo
- Licença/serial
- Limite de downloads
- Expiração de acesso

#### 1.4 Assinatura

- Frequência (mensal/trimestral/anual)
- Período mínimo
- Taxa setup
- Renovação automática
- Cancelamento

#### 1.5 Bundle/Kit

- Lista de produtos componentes
- Quantidade de cada componente
- Desconto aplicado
- Estoque calculado pelo menor

#### 1.6 Variantes

- Produto pai
- Produtos filhos (variantes)
- Atributos (cor, tamanho, sabor, etc.)
- SKU próprio por variante
- Estoque por variante

### 2. Embalagens

#### 2.1 Configuração

- **Unidade Básica:**
  - Quantidade: 1
  - Peso por unidade
  - Dimensões por unidade

- **Display:**
  - Unidades por display
  - Peso do display
  - Dimensões do display

- **Caixa:**
  - Displays por caixa
  - Unidades totais na caixa (calculado)
  - Peso bruto da caixa
  - Dimensões da caixa

#### 2.2 Conversões Automáticas

- Sistema converte automaticamente:
  - Unidades → Displays
  - Displays → Caixas
  - Qualquer combinação

### 3. Códigos

#### 3.1 Códigos Internos

- SKU (código interno)
- Código alternativo
- Código do fabricante

#### 3.2 Códigos Internacionais

- **EAN/UPC:** Código de barras
- **EIN:** USA
- **HS Code:** Internacional
- **NCM:** Brasil
- **CEST:** Brasil

### 4. Custo e Preço

#### 4.1 Custo

- Custo de compra (por unidade)
- Custo de compra (por caixa)
- Custo logístico
- Custo médio (calculado)
- Custo total (calculado)

#### 4.2 Preço

- Preço base
- Preço mínimo
- Preço por embalagem
- Preço de atacado
- Preço para revendedor
- Preço sugerido de revenda (MSRP)

#### 4.3 Cálculos Automáticos

- **Custo Total por Unidade:**
  ```
  Custo_Total_Unidade = (Custo_Compra / Unidades_Por_Caixa) + Custo_Logístico_Unitário
  ```

- **Markup:**
  ```
  Markup = (Preço_Venda / Custo_Total_Unidade) - 1
  ```

- **Margem de Lucro:**
  ```
  Margem(%) = ((Preço_Venda - Custo_Total_Unidade) / Preço_Venda) * 100
  ```

### 5. Controle de Estoque

#### 5.1 Configurações

- Controla estoque? (sim/não)
- Controle por lote
- Controle por série
- Validade obrigatória
- Posição preferencial

#### 5.2 Políticas

- FIFO (First In, First Out)
- LIFO (Last In, First Out)
- FEFO (First Expired, First Out)
- Reorder point
- Safety stock

---

## 🗄️ Modelos/Entidades

### Product

```python
class Product(models.Model):
    """Produto - Modelo completo (ver Warehouse para detalhes)"""
    
    # Campos principais já definidos em Warehouse
    # Este módulo foca em funcionalidades específicas de produtos
    pass
```

### ProductVariant

```python
class ProductVariant(models.Model):
    """Variante de Produto"""
    
    parent_product = models.ForeignKey(
        'warehouse.Product',
        on_delete=models.CASCADE,
        related_name='variants'
    )
    
    # Atributos da variante
    attributes = models.JSONField(default=dict)  # {color: "red", size: "M"}
    
    # SKU próprio
    sku = models.CharField(max_length=100, unique=True)
    
    # Preço (pode ser diferente do pai)
    price_override = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    
    # Estoque (por warehouse)
    # Gerenciado via InventoryBalance
    
    class Meta:
        db_table = 'products_variants'
        unique_together = ['parent_product', 'attributes']
    
    def __str__(self):
        attrs_str = ", ".join([f"{k}:{v}" for k, v in self.attributes.items()])
        return f"{self.parent_product.name} - {attrs_str}"
```

### ProductBundle

```python
class ProductBundle(models.Model):
    """Produto Bundle/Kit"""
    
    bundle_product = models.ForeignKey(
        'warehouse.Product',
        on_delete=models.CASCADE,
        related_name='as_bundle'
    )
    
    component_product = models.ForeignKey(
        'warehouse.Product',
        on_delete=models.CASCADE,
        related_name='in_bundles'
    )
    
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        db_table = 'products_bundles'
        unique_together = ['bundle_product', 'component_product']
    
    def __str__(self):
        return f"{self.bundle_product.name} - {self.component_product.name} x{self.quantity}"
```

### Category

```python
class Category(models.Model):
    """Categoria de Produto"""
    
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50, unique=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', blank=True)
    
    # Ordem
    order = models.IntegerField(default=0)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'products_categories'
        ordering = ['order', 'name']
        verbose_name_plural = 'Categories'
    
    def __str__(self):
        return self.name
```

---

## 🔌 APIs/Endpoints

### Base URL
```
/api/v1/products/
```

### Endpoints

#### Products

```http
GET /api/v1/products/
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `product_type` - Filtrar por tipo
- `category_id` - Filtrar por categoria
- `brand` - Filtrar por marca
- `warehouse_id` - Mostrar estoque
- `in_stock` - true/false
- `search` - Busca textual

```http
POST /api/v1/products/
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
  "price_base": 100.00
}
```

#### Variants

```http
GET /api/v1/products/{id}/variants/
Authorization: Bearer {access_token}
```

```http
POST /api/v1/products/{id}/variants/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "attributes": {
    "color": "red",
    "size": "M"
  },
  "sku": "PROD-001-RED-M",
  "price_override": 105.00
}
```

#### Bundles

```http
GET /api/v1/products/{id}/bundle-components/
Authorization: Bearer {access_token}
```

```http
POST /api/v1/products/{id}/bundle-components/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "component_product_id": 2,
  "quantity": 5
}
```

#### Categories

```http
GET /api/v1/products/categories/
Authorization: Bearer {access_token}
```

---

## 🔄 Fluxos de Trabalho

### Fluxo 1: Cadastro de Produto Físico

```
1. Criar produto
   ↓
2. Definir tipo: físico
   ↓
3. Configurar embalagens
   ↓
4. Informar códigos (EAN, EIN, etc.)
   ↓
5. Configurar custos
   ↓
6. Definir preços
   ↓
7. Sistema calcula markup e margem
   ↓
8. Configurar controle de estoque
   ↓
9. Definir posição preferencial
   ↓
10. Salvar
```

### Fluxo 2: Criação de Bundle

```
1. Criar produto tipo bundle
   ↓
2. Adicionar produtos componentes
   ↓
3. Definir quantidade de cada
   ↓
4. Sistema calcula estoque (menor disponível)
   ↓
5. Definir desconto do bundle
   ↓
6. Salvar
```

---

## 📐 Regras de Negócio

### 1. Embalagens

- Conversões sempre automáticas
- Estoque sempre em unidades internas
- Exibição pode ser em qualquer embalagem

### 2. Custo

- Custo total sempre calculado
- Atualizado a cada compra
- Custo médio por warehouse

### 3. Preço

- Preço mínimo sempre validado
- Margem calculada em tempo real
- Preço sugerido de revenda (se revendedor)

### 4. Variantes

- Cada variante tem SKU próprio
- Estoque independente
- Preço pode ser diferente

---

## 🔐 Permissões

### Operador de Estoque

- ✅ Ver produtos
- ✅ Editar produtos básicos
- ❌ Ver custos
- ❌ Editar preços

### Gerente de Estoque

- ✅ Tudo que operador pode
- ✅ Ver custos
- ✅ Editar preços
- ✅ Criar produtos

### Vendedor

- ✅ Ver produtos (sem custo)
- ✅ Ver margem
- ❌ Editar produtos
- ❌ Ver custos

---

## ✅ Status de Implementação

### Tipos de Produto
- [ ] Produto físico
- [ ] Serviço
- [ ] Produto digital
- [ ] Assinatura
- [ ] Bundle/Kit
- [ ] Variantes

### Embalagens
- [ ] Configuração de embalagens
- [ ] Conversões automáticas
- [ ] Cálculo de peso/volume

### Códigos
- [ ] SKU interno
- [ ] EAN/UPC
- [ ] EIN
- [ ] HS Code
- [ ] NCM/CEST

### Custo e Preço
- [ ] Custo de compra
- [ ] Custo logístico
- [ ] Cálculo de custo total
- [ ] Markup automático
- [ ] Margem calculada

### APIs
- [ ] GET /products/
- [ ] POST /products/
- [ ] GET /products/{id}/variants/
- [ ] POST /products/{id}/variants/
- [ ] GET /products/{id}/bundle-components/
- [ ] POST /products/{id}/bundle-components/
- [ ] GET /categories/

---

## 💻 Notas Técnicas

### Performance

- Cache de produtos por warehouse
- Índices em SKU, EAN, categoria
- Lazy loading de variantes

### Integrações

- **Warehouse:** Estoque
- **Sales:** Catálogo
- **Pricing:** Preços e descontos

---

**⚠️ IMPORTANTE:** Atualize este documento conforme a implementação progride!

