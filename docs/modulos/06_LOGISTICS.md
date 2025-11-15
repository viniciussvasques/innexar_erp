# 🚚 Módulo de Logística (Logistics)

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

O módulo de Logística gerencia todo o processo de separação (picking), conferência, packing e expedição de pedidos. Inclui integração com código de barras, mobile app para operadores, e integração com carriers para rastreamento.

### Objetivos Principais

- Gerenciar separação de pedidos
- Otimizar rotas de picking
- Facilitar conferência e packing
- Integrar com carriers
- Fornecer rastreamento em tempo real
- Mobile-first para operadores

---

## 🚀 Funcionalidades

### 1. Picking (Separação)

#### 1.1 Picking Board (Desktop)

- Lista de pedidos para separar
- Filtros por:
  - Warehouse
  - Prioridade
  - Carrier
  - SLA
  - Status
- Visualização Kanban
- Atribuição de operadores
- Impressão de picking lists

#### 1.2 Mobile App para Picking

**Funcionalidades:**
- Login do operador
- Lista de picks atribuídos
- Rota otimizada (ordem de posições)
- Escaneamento de código de barras:
  - Escanear posição (bin)
  - Escanear produto
  - Confirmar quantidade
- Interface minimalista
- Registro de divergências:
  - Item faltando
  - Item danificado
  - SKU errado
  - Quantidade incorreta

**Fluxo no App:**
1. Operador seleciona pick job
2. App mostra primeiro item com posição
3. Operador vai até a posição
4. Escaneia código da posição
5. App confirma posição correta
6. Escaneia código do produto
7. App confirma produto correto
8. Informa quantidade (ou escaneia múltiplas vezes)
9. App marca item como separado
10. Próximo item (com rota otimizada)
11. Ao finalizar → confirma pick completo

#### 1.3 Tipos de Picking

- **Picking Individual:** Um pedido por vez
- **Batch Picking:** Múltiplos pedidos juntos
- **Wave Picking:** Agrupado por carrier/rota
- **Zone Picking:** Por zona do warehouse

### 2. Conferência

#### 2.1 Processo de Conferência

- Validar itens separados
- Verificar quantidades
- Verificar condições (danificado, etc.)
- Gerar packing list
- Dividir em múltiplas caixas (se necessário)
- Gerar etiquetas de caixa

#### 2.2 Packing List

- Lista de itens por caixa
- Peso e dimensões
- SSCC (Serial Shipping Container Code)
- Código de barras da caixa
- QR Code para rastreamento

### 3. Expedição

#### 3.1 Integração com Carriers

- **Carriers Suportados:**
  - UPS
  - FedEx
  - DHL
  - Correios (Brasil)
  - Transportadoras locais

- **Funcionalidades:**
  - Gerar AWB (Air Waybill)
  - Obter tracking number
  - Imprimir etiquetas de remessa
  - Atualizar status de tracking
  - Enviar tracking para cliente

#### 3.2 Manifest

- Gerar manifest para carrier
- Agrupar por carrier/rota
- Imprimir manifest
- Upload para carrier (se API disponível)

### 4. Rastreamento

#### 4.1 Tracking em Tempo Real

- Status atualizado via API do carrier
- Webhook do carrier → atualiza status
- Notificação para cliente
- Timeline de eventos

---

## 🗄️ Modelos/Entidades

### PickingJob

```python
class PickingJob(models.Model):
    """Job de Separação"""
    
    STATUS_CHOICES = [
        ('waiting', 'Aguardando'),
        ('assigned', 'Atribuído'),
        ('in_progress', 'Em Andamento'),
        ('on_hold', 'Em Espera'),
        ('completed', 'Concluído'),
        ('quality_check', 'Conferência'),
        ('failed', 'Falhou'),
    ]
    
    job_number = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='waiting')
    
    # Warehouse
    warehouse = models.ForeignKey('warehouse.Warehouse', on_delete=models.PROTECT)
    
    # Pedidos
    sales_orders = models.ManyToManyField('sales.SalesOrder', related_name='picking_jobs')
    
    # Operador
    assigned_to = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='assigned_picks'
    )
    
    # Prioridade
    priority = models.IntegerField(default=5)  # 1-10
    sla_hours = models.IntegerField(null=True)  # SLA em horas
    
    # Itens para separar
    picking_lines = models.JSONField(default=list)  # [{product_id, qty, position, scanned_qty, lot}]
    
    # Rota
    optimized_route = models.JSONField(default=list)  # Ordem de posições
    
    # Datas
    assigned_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Divergências
    exceptions = models.JSONField(default=list)  # [{type, product_id, reason, qty}]
    
    class Meta:
        db_table = 'logistics_picking_jobs'
        ordering = ['priority', 'assigned_at']
        indexes = [
            models.Index(fields=['warehouse', 'status']),
            models.Index(fields=['assigned_to', 'status']),
        ]
    
    def __str__(self):
        return f"PICK-{self.job_number}"
```

### PackingList

```python
class PackingList(models.Model):
    """Lista de Embalagem"""
    
    packing_number = models.CharField(max_length=50, unique=True)
    
    # Pedido
    sales_order = models.ForeignKey('sales.SalesOrder', on_delete=models.PROTECT)
    
    # Caixas
    boxes = models.JSONField(default=list)  # [{box_number, items: [], weight, dimensions, sscc}]
    
    # Conferente
    checked_by = models.ForeignKey('users.User', on_delete=models.PROTECT)
    
    # Data
    packed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'logistics_packing_lists'
    
    def __str__(self):
        return f"PKG-{self.packing_number}"
```

### Shipment

```python
class Shipment(models.Model):
    """Envio/Expedição"""
    
    STATUS_CHOICES = [
        ('ready', 'Pronto para Envio'),
        ('shipped', 'Enviado'),
        ('in_transit', 'Em Trânsito'),
        ('out_for_delivery', 'Saiu para Entrega'),
        ('delivered', 'Entregue'),
        ('exception', 'Exceção'),
        ('returned', 'Devolvido'),
    ]
    
    shipment_number = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ready')
    
    # Pedido
    sales_order = models.ForeignKey('sales.SalesOrder', on_delete=models.PROTECT)
    
    # Packing
    packing_list = models.OneToOneField('logistics.PackingList', on_delete=models.PROTECT)
    
    # Carrier
    carrier = models.CharField(max_length=50)  # UPS, FedEx, etc.
    carrier_service = models.CharField(max_length=50, blank=True)  # Ground, Express, etc.
    awb_number = models.CharField(max_length=100, blank=True)
    tracking_number = models.CharField(max_length=100, blank=True)
    
    # Endereço
    shipping_address = models.JSONField()
    
    # Datas
    shipped_at = models.DateTimeField(null=True, blank=True)
    estimated_delivery = models.DateField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    
    # Tracking
    tracking_events = models.JSONField(default=list)  # [{date, status, location, description}]
    
    # Exceções
    exception_reason = models.TextField(blank=True)
    
    class Meta:
        db_table = 'logistics_shipments'
        ordering = ['-shipped_at']
        indexes = [
            models.Index(fields=['tracking_number']),
            models.Index(fields=['status', 'shipped_at']),
        ]
    
    def __str__(self):
        return f"SHIP-{self.shipment_number}"
```

---

## 🔌 APIs/Endpoints

### Base URL
```
/api/v1/logistics/
```

### Endpoints

#### Picking Jobs

```http
GET /api/v1/logistics/picking-jobs/
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `warehouse_id` - Filtrar por warehouse
- `status` - Filtrar por status
- `assigned_to` - Filtrar por operador
- `priority` - Filtrar por prioridade

```http
POST /api/v1/logistics/picking-jobs/{id}/assign/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "assigned_to_id": 5
}
```

#### Mobile Picking

```http
POST /api/v1/logistics/picking-jobs/{id}/start/
Authorization: Bearer {access_token}
```

```http
POST /api/v1/logistics/picking-jobs/{id}/scan/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "position_barcode": "A1-R2-L3-B4",
  "product_barcode": "1234567890123",
  "quantity": 2,
  "lot_number": "LOT-001"
}
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Item confirmado",
  "next_item": {
    "product_id": 2,
    "product_name": "Produto 2",
    "position": "A2-R1-L2-B3",
    "quantity": 5
  },
  "progress": {
    "scanned": 3,
    "total": 10
  }
}
```

```http
POST /api/v1/logistics/picking-jobs/{id}/complete/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "exceptions": [
    {
      "type": "shortage",
      "product_id": 5,
      "reason": "Item não encontrado na posição",
      "quantity_missing": 2
    }
  ]
}
```

#### Packing

```http
POST /api/v1/logistics/packing/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "sales_order_id": 1,
  "boxes": [
    {
      "items": [
        {"product_id": 1, "quantity": 10},
        {"product_id": 2, "quantity": 5}
      ],
      "weight": 5.5,
      "dimensions": {"length": 30, "width": 20, "height": 15}
    }
  ]
}
```

#### Shipments

```http
GET /api/v1/logistics/shipments/
Authorization: Bearer {access_token}
```

```http
POST /api/v1/logistics/shipments/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "sales_order_id": 1,
  "packing_list_id": 1,
  "carrier": "UPS",
  "carrier_service": "Ground",
  "shipping_address": {...}
}
```

```http
POST /api/v1/logistics/shipments/{id}/track/
Authorization: Bearer {access_token}
```

**Atualiza tracking via API do carrier**

---

## 🔄 Fluxos de Trabalho

### Fluxo 1: Separação Completa

```
1. Pedido confirmado (Sales)
   ↓
2. Sistema cria Picking Job
   ↓
3. Job aparece no Picking Board
   ↓
4. Supervisor atribui a operador
   ↓
5. Operador inicia no mobile app
   ↓
6. App mostra rota otimizada
   ↓
7. Operador escaneia posição
   ↓
8. Operador escaneia produto
   ↓
9. Confirma quantidade
   ↓
10. Próximo item
    ↓
11. Ao finalizar → marca como completo
    ↓
12. Sistema atualiza estoque
    ↓
13. Job vai para conferência
```

### Fluxo 2: Expedição

```
1. Packing List gerada
   ↓
2. Sistema cria Shipment
   ↓
3. Integração com carrier:
   - Gera AWB
   - Obtém tracking number
   - Imprime etiqueta
   ↓
4. Atualiza Sales Order (status: shipped)
   ↓
5. Envia tracking para cliente
   ↓
6. Webhook do carrier atualiza status
   ↓
7. Cliente recebe notificações
```

---

## 📐 Regras de Negócio

### 1. Priorização

- Pedidos com SLA menor têm prioridade
- Pedidos VIP têm prioridade alta
- Pedidos com data prometida próxima têm prioridade

### 2. Rota Otimizada

- Agrupar itens por posição próxima
- Minimizar distância percorrida
- Considerar peso (itens pesados primeiro)

### 3. Divergências

- Item faltando → criar exceção
- Item danificado → criar exceção
- SKU errado → criar exceção
- Supervisor aprova exceções
- Sistema pode gerar backorder

### 4. Tracking

- Atualizar status via webhook do carrier
- Notificar cliente em cada atualização
- Timeline completa de eventos

---

## 🔐 Permissões

### Operador de Separação

- ✅ Ver picks atribuídos
- ✅ Iniciar pick
- ✅ Escanear produtos
- ✅ Marcar como completo
- ✅ Registrar divergências
- ❌ Ver preços/custos
- ❌ Atribuir picks

### Conferente

- ✅ Ver packing lists
- ✅ Conferir itens
- ✅ Gerar packing list
- ✅ Imprimir etiquetas
- ❌ Ver preços/custos

### Expedidor

- ✅ Criar shipments
- ✅ Integrar com carriers
- ✅ Imprimir etiquetas
- ✅ Atualizar tracking
- ❌ Ver preços/custos

---

## ✅ Status de Implementação

### Picking
- [ ] Modelo PickingJob
- [ ] Picking Board (desktop)
- [ ] Mobile app
- [ ] Escaneamento código de barras
- [ ] Rota otimizada
- [ ] Registro de divergências
- [ ] Integração com Warehouse

### Conferência
- [ ] Modelo PackingList
- [ ] Tela de conferência
- [ ] Geração de packing list
- [ ] Etiquetas de caixa
- [ ] SSCC

### Expedição
- [ ] Modelo Shipment
- [ ] Integração UPS
- [ ] Integração FedEx
- [ ] Integração DHL
- [ ] Integração Correios
- [ ] Geração de AWB
- [ ] Tracking em tempo real
- [ ] Webhooks de carriers

### APIs
- [ ] GET /picking-jobs/
- [ ] POST /picking-jobs/{id}/assign/
- [ ] POST /picking-jobs/{id}/start/
- [ ] POST /picking-jobs/{id}/scan/
- [ ] POST /picking-jobs/{id}/complete/
- [ ] POST /packing/
- [ ] GET /shipments/
- [ ] POST /shipments/
- [ ] POST /shipments/{id}/track/

---

## 💻 Notas Técnicas

### Mobile App

- **Offline Support:**
  - Baixar picks atribuídos
  - Trabalhar offline
  - Sincronizar quando online

- **Performance:**
  - Cache de produtos e posições
  - Validação local de códigos
  - Upload em background

### Integrações

- **Carriers:**
  - APIs REST
  - Webhooks para tracking
  - Retry em caso de falha

- **Impressão:**
  - Network printers
  - Print server
  - Etiquetas térmicas

---

**⚠️ IMPORTANTE:** Atualize este documento conforme a implementação progride!

