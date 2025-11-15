# 🌐 Portal do Cliente (Customer Portal)

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

O Portal do Cliente permite que clientes acessem informações sobre seus pedidos, invoices, rastreamento de entregas, histórico de compras e solicitem devoluções (RMA). É uma interface web e mobile-first que fornece transparência total ao cliente.

### Objetivos Principais

- Fornecer acesso 24/7 às informações do cliente
- Acompanhamento em tempo real de pedidos
- Visualização e download de invoices
- Rastreamento de entregas
- Solicitação de devoluções (RMA)
- Histórico completo de relacionamento

---

## 🚀 Funcionalidades

### 1. Dashboard do Cliente

#### 1.1 Visão Geral

- **Pedidos Recentes:**
  - Últimos 5 pedidos
  - Status atual
  - Valor total
  - Link para detalhes

- **Invoices:**
  - Invoices em aberto
  - Total a pagar
  - Próximos vencimentos
  - Link para pagamento

- **Rastreamento:**
  - Pedidos em trânsito
  - Próximas entregas
  - Link para tracking

- **Alertas:**
  - Invoices vencidas
  - Pedidos com atualização
  - RMA pendentes

### 2. Pedidos

#### 2.1 Lista de Pedidos

- Todos os pedidos do cliente
- Filtros:
  - Por status
  - Por período
  - Por valor
- Busca por número do pedido

#### 2.2 Detalhes do Pedido

- **Informações:**
  - Número do pedido
  - Data de criação
  - Status atual
  - Vendedor responsável
  - Warehouse de origem

- **Itens:**
  - Lista completa de produtos
  - Quantidades
  - Preços
  - Descontos aplicados

- **Timeline:**
  - Criado
  - Confirmado
  - Em separação
  - Separado
  - Enviado
  - Em trânsito
  - Entregue
  - Com datas e horários

- **Rastreamento:**
  - Link para tracking do carrier
  - Mapa (se disponível)
  - Eventos de tracking

- **Documentos:**
  - Download de invoice
  - Download de packing list
  - Download de comprovante de entrega (POD)

### 3. Invoices

#### 3.1 Lista de Invoices

- Todas as invoices do cliente
- Filtros:
  - Por status (aberta, paga, vencida)
  - Por período
- Busca por número

#### 3.2 Detalhes da Invoice

- **Informações:**
  - Número da invoice
  - Data de emissão
  - Data de vencimento
  - Status
  - Valor total
  - Valor pago
  - Saldo devedor

- **Itens:**
  - Lista de produtos/serviços
  - Quantidades
  - Preços unitários
  - Impostos
  - Totais

- **Pagamento:**
  - Forma de pagamento
  - Histórico de pagamentos
  - Link para pagar (se gateway integrado)

- **Download:**
  - PDF da invoice
  - XML (se NF-e)

### 4. Rastreamento

#### 4.1 Tracking em Tempo Real

- Status atual do envio
- Timeline de eventos:
  - Coletado
  - Em trânsito
  - Em centro de distribuição
  - Saiu para entrega
  - Entregue
- Mapa com localização (se disponível)
- Previsão de entrega

#### 4.2 Integração com Carriers

- Links diretos para tracking do carrier
- Atualizações automáticas
- Notificações push/email

### 5. RMA (Devoluções)

#### 5.1 Solicitação de Devolução

- Selecionar pedido
- Selecionar itens para devolver
- Motivo da devolução:
  - Produto defeituoso
  - Produto errado
  - Não satisfeito
  - Outro
- Upload de fotos (opcional)
- Descrição detalhada

#### 5.2 Acompanhamento de RMA

- Status do RMA:
  - Solicitado
  - Aprovado
  - Etiqueta gerada
  - Em retorno
  - Recebido
  - Inspecionado
  - Processado
  - Rejeitado
- Timeline de eventos
- Credit note (se aplicável)

### 6. Histórico

#### 6.1 Histórico de Compras

- Todos os pedidos
- Gráfico de compras ao longo do tempo
- Total gasto
- Produtos mais comprados

#### 6.2 Histórico de Pagamentos

- Todas as invoices
- Pagamentos realizados
- Pendências

### 7. Catálogo (Opcional)

#### 7.1 Visualização de Produtos

- Catálogo com preços liberados
- Filtros e busca
- Adicionar ao carrinho (se e-commerce integrado)

---

## 🗄️ Modelos/Entidades

### CustomerPortalAccess

```python
class CustomerPortalAccess(models.Model):
    """Acesso do Cliente ao Portal"""
    
    customer = models.OneToOneField('sales.Customer', on_delete=models.CASCADE)
    
    # Credenciais
    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=255)
    
    # Status
    is_active = models.BooleanField(default=True)
    last_login = models.DateTimeField(null=True, blank=True)
    
    # Preferências
    language = models.CharField(max_length=10, default='pt-BR')
    notifications_enabled = models.BooleanField(default=True)
    
    # Metadados
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'customer_portal_access'
    
    def __str__(self):
        return f"Portal Access - {self.customer.name}"
```

### RMA

```python
class RMA(models.Model):
    """Return Merchandise Authorization (Devolução)"""
    
    STATUS_CHOICES = [
        ('requested', 'Solicitado'),
        ('approved', 'Aprovado'),
        ('label_generated', 'Etiqueta Gerada'),
        ('in_return', 'Em Retorno'),
        ('received', 'Recebido'),
        ('inspected', 'Inspecionado'),
        ('processed', 'Processado'),
        ('rejected', 'Rejeitado'),
    ]
    
    rma_number = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    
    # Relacionamentos
    customer = models.ForeignKey('sales.Customer', on_delete=models.PROTECT)
    sales_order = models.ForeignKey('sales.SalesOrder', on_delete=models.PROTECT, null=True, blank=True)
    invoice = models.ForeignKey('invoicing.Invoice', on_delete=models.PROTECT, null=True, blank=True)
    
    # Itens
    items = models.JSONField(default=list)  # [{product_id, qty, reason, condition}]
    
    # Motivo
    reason = models.TextField()
    reason_category = models.CharField(max_length=50)  # defective, wrong_item, not_satisfied, other
    
    # Fotos
    photos = models.JSONField(default=list)  # [{url, description}]
    
    # Credit Note
    credit_note = models.ForeignKey('invoicing.CreditNote', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Datas
    requested_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    received_at = models.DateTimeField(null=True, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    # Observações
    customer_notes = models.TextField(blank=True)
    internal_notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'customer_portal_rmas'
        ordering = ['-requested_at']
    
    def __str__(self):
        return f"RMA-{self.rma_number}"
```

---

## 🔌 APIs/Endpoints

### Base URL
```
/api/v1/customer-portal/
```

### Autenticação

```http
POST /api/v1/customer-portal/auth/login/
Content-Type: application/json

{
  "email": "cliente@example.com",
  "password": "senha123"
}
```

**Resposta (200 OK):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "customer": {
    "id": 1,
    "name": "Cliente Exemplo",
    "email": "cliente@example.com"
  }
}
```

### Dashboard

```http
GET /api/v1/customer-portal/dashboard/
Authorization: Bearer {access_token}
```

**Resposta (200 OK):**
```json
{
  "recent_orders": [
    {
      "id": 1,
      "order_number": "SO-000001",
      "status": "shipped",
      "total": 1000.00,
      "created_at": "2025-11-10T10:00:00Z"
    }
  ],
  "open_invoices": {
    "count": 3,
    "total_amount": 5000.00,
    "next_due_date": "2025-11-20"
  },
  "tracking": [
    {
      "order_id": 1,
      "tracking_number": "1Z999AA10123456784",
      "status": "in_transit",
      "estimated_delivery": "2025-11-18"
    }
  ],
  "alerts": [
    {
      "type": "invoice_overdue",
      "message": "Invoice ORL-000001 vencida",
      "invoice_id": 1
    }
  ]
}
```

### Orders

```http
GET /api/v1/customer-portal/orders/
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `status` - Filtrar por status
- `date_from` - Data inicial
- `date_to` - Data final

```http
GET /api/v1/customer-portal/orders/{id}/
Authorization: Bearer {access_token}
```

**Resposta (200 OK):**
```json
{
  "id": 1,
  "order_number": "SO-000001",
  "status": "shipped",
  "created_at": "2025-11-10T10:00:00Z",
  "seller": {
    "id": 1,
    "name": "João Vendedor"
  },
  "warehouse": {
    "id": 1,
    "name": "Orlando"
  },
  "items": [
    {
      "product": {
        "name": "Produto Exemplo",
        "sku": "PROD-001"
      },
      "quantity": 10,
      "unit_price": 100.00,
      "line_total": 1000.00
    }
  ],
  "totals": {
    "sub_total": 1000.00,
    "discounts": 50.00,
    "grand_total": 950.00
  },
  "timeline": [
    {
      "status": "created",
      "date": "2025-11-10T10:00:00Z",
      "description": "Pedido criado"
    },
    {
      "status": "shipped",
      "date": "2025-11-12T14:30:00Z",
      "description": "Pedido enviado"
    }
  ],
  "tracking": {
    "tracking_number": "1Z999AA10123456784",
    "carrier": "UPS",
    "status": "in_transit",
    "events": [
      {
        "date": "2025-11-12T14:30:00Z",
        "status": "Shipped",
        "location": "Orlando, FL"
      }
    ],
    "estimated_delivery": "2025-11-18"
  },
  "documents": {
    "invoice": "https://.../invoices/1.pdf",
    "packing_list": "https://.../packing/1.pdf"
  }
}
```

### Invoices

```http
GET /api/v1/customer-portal/invoices/
Authorization: Bearer {access_token}
```

```http
GET /api/v1/customer-portal/invoices/{id}/
Authorization: Bearer {access_token}
```

```http
GET /api/v1/customer-portal/invoices/{id}/pdf/
Authorization: Bearer {access_token}
```

**Retorna PDF da invoice**

### Tracking

```http
GET /api/v1/customer-portal/tracking/{tracking_number}/
Authorization: Bearer {access_token}
```

**Resposta (200 OK):**
```json
{
  "tracking_number": "1Z999AA10123456784",
  "carrier": "UPS",
  "status": "in_transit",
  "estimated_delivery": "2025-11-18",
  "events": [
    {
      "date": "2025-11-12T14:30:00Z",
      "status": "Shipped",
      "location": "Orlando, FL",
      "description": "Package picked up"
    },
    {
      "date": "2025-11-13T08:00:00Z",
      "status": "In Transit",
      "location": "Atlanta, GA",
      "description": "Arrived at facility"
    }
  ],
  "carrier_tracking_url": "https://www.ups.com/track?tracknum=1Z999AA10123456784"
}
```

### RMA

```http
GET /api/v1/customer-portal/rmas/
Authorization: Bearer {access_token}
```

```http
POST /api/v1/customer-portal/rmas/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

{
  "sales_order_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "reason": "Produto defeituoso",
      "reason_category": "defective"
    }
  ],
  "photos": [<files>],
  "customer_notes": "Descrição do problema"
}
```

**Resposta (201 Created):**
```json
{
  "id": 1,
  "rma_number": "RMA-000001",
  "status": "requested",
  "items": [...],
  "requested_at": "2025-11-14T10:00:00Z"
}
```

```http
GET /api/v1/customer-portal/rmas/{id}/
Authorization: Bearer {access_token}
```

### Payment

```http
POST /api/v1/customer-portal/invoices/{id}/pay/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "payment_method": "stripe",
  "amount": 1000.00
}
```

**Integração com gateway de pagamento**

---

## 🔄 Fluxos de Trabalho

### Fluxo 1: Acompanhamento de Pedido

```
1. Cliente acessa portal
   ↓
2. Vê lista de pedidos
   ↓
3. Clica em pedido específico
   ↓
4. Vê timeline completa
   ↓
5. Clica em tracking
   ↓
6. Vê status atual e eventos
   ↓
7. Recebe notificações de atualizações
```

### Fluxo 2: Solicitação de RMA

```
1. Cliente acessa pedido
   ↓
2. Clica em "Solicitar Devolução"
   ↓
3. Seleciona itens para devolver
   ↓
4. Escolhe motivo
   ↓
5. Upload de fotos (opcional)
   ↓
6. Envia solicitação
   ↓
7. Sistema cria RMA
   ↓
8. Notifica suporte
   ↓
9. Suporte aprova/rejeita
   ↓
10. Se aprovado:
    - Gera etiqueta de retorno
    - Envia para cliente
    ↓
11. Cliente envia produto
    ↓
12. Empresa recebe e inspeciona
    ↓
13. Processa devolução
    ↓
14. Gera credit note (se aplicável)
```

---

## 📐 Regras de Negócio

### 1. Acesso

- Cliente precisa ter cadastro ativo
- Email único por cliente
- Senha com requisitos mínimos
- 2FA opcional

### 2. Visibilidade

- Cliente vê apenas seus próprios dados
- Não vê custos/preços de outros clientes
- Não vê informações de outros clientes

### 3. RMA

- Permitir RMA apenas dentro de X dias da entrega
- Alguns produtos podem não ter RMA
- RMA requer aprovação
- Credit note gerado após inspeção

### 4. Pagamento

- Integração com gateways
- Pagamento parcial permitido
- Confirmação via webhook

---

## 🔐 Permissões

### Cliente (Portal)

- ✅ Ver próprios pedidos
- ✅ Ver próprias invoices
- ✅ Rastrear próprias entregas
- ✅ Solicitar RMA
- ✅ Ver histórico próprio
- ✅ Pagar invoices
- ❌ Ver dados de outros clientes
- ❌ Ver custos/preços internos

---

## ✅ Status de Implementação

### Autenticação
- [ ] Modelo CustomerPortalAccess
- [ ] Login/Logout
- [ ] Recuperação de senha
- [ ] 2FA (opcional)

### Dashboard
- [ ] Endpoint /dashboard/
- [ ] Pedidos recentes
- [ ] Invoices em aberto
- [ ] Rastreamento
- [ ] Alertas

### Pedidos
- [ ] GET /orders/
- [ ] GET /orders/{id}/
- [ ] Timeline de status
- [ ] Download de documentos

### Invoices
- [ ] GET /invoices/
- [ ] GET /invoices/{id}/
- [ ] GET /invoices/{id}/pdf/
- [ ] Histórico de pagamentos

### Rastreamento
- [ ] GET /tracking/{number}/
- [ ] Integração com carriers
- [ ] Atualizações em tempo real
- [ ] Mapa (opcional)

### RMA
- [ ] Modelo RMA
- [ ] GET /rmas/
- [ ] POST /rmas/
- [ ] GET /rmas/{id}/
- [ ] Upload de fotos
- [ ] Acompanhamento de status

### Pagamento
- [ ] POST /invoices/{id}/pay/
- [ ] Integração Stripe
- [ ] Integração PayPal
- [ ] Integração PIX

### Notificações
- [ ] Email
- [ ] Push (se app)
- [ ] SMS (opcional)

---

## 💻 Notas Técnicas

### Segurança

- Autenticação JWT
- Rate limiting
- CORS configurado
- HTTPS obrigatório

### Performance

- Cache de pedidos recentes
- Lazy loading de histórico
- CDN para documentos

### Mobile

- API-first design
- Responsive web
- App nativo (futuro)

---

**⚠️ IMPORTANTE:** Atualize este documento conforme a implementação progride!

