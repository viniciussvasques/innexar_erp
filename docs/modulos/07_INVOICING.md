# 💰 Módulo de Invoice/Financeiro (Invoicing)

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

O módulo de Invoicing gerencia todo o processo de faturamento, contas a receber, pagamentos e controle financeiro. Inclui geração automática de invoices, numeração por warehouse, termos de pagamento configuráveis, e integração com gateways de pagamento.

### Objetivos Principais

- Gerar invoices automaticamente após separação/envio
- Gerenciar contas a receber
- Registrar pagamentos
- Controlar limite de crédito
- Integrar com gateways de pagamento
- Fornecer relatórios financeiros

---

## 🚀 Funcionalidades

### 1. Geração de Invoices

#### 1.1 Geração Automática

- **Regras de Geração:**
  - Após picking (configurável)
  - Após shipping (configurável)
  - Após confirmação (configurável)
  - Manual

- **Conteúdo da Invoice:**
  - Número único (sequencial ou por warehouse)
  - Dados do cliente
  - Dados do vendedor
  - Warehouse de origem
  - Lista de produtos
  - Preços e descontos
  - Impostos
  - Termos de pagamento
  - Data de vencimento calculada
  - Forma de pagamento

#### 1.2 Numeração

- **Opção 1: Global**
  - 000001, 000002, ...

- **Opção 2: Por Warehouse**
  - ORL-000001, ORL-000002, ...
  - MIA-000001, MIA-000002, ...

#### 1.3 Termos de Pagamento

- **Net X dias:**
  - Net 7 (7 dias)
  - Net 10 (10 dias)
  - Net 15 (15 dias)
  - Net 30 (30 dias)
  - Customizável

- **Cálculo de Vencimento:**
  - Data de emissão + dias
  - Considerar dias úteis (se configurado)
  - Considerar feriados (se configurado)

### 2. Contas a Receber

#### 2.1 Gestão de Invoices

- Lista de invoices:
  - Abertas
  - Parcialmente pagas
  - Pagas
  - Vencidas
  - Canceladas

- Filtros:
  - Por cliente
  - Por vendedor
  - Por warehouse
  - Por período
  - Por status

#### 2.2 Registro de Pagamentos

- **Pagamento Manual:**
  - Registrar pagamento
  - Selecionar invoice(s)
  - Valor (parcial ou total)
  - Data de pagamento
  - Forma de pagamento
  - Comprovante (upload)

- **Pagamento via Gateway:**
  - Integração com Stripe
  - Integração com PayPal
  - Integração com Zelle
  - Integração com PIX (Brasil)
  - Webhook de confirmação

#### 2.3 Baixa Automática

- Quando pagamento confirmado:
  - Atualiza status da invoice
  - Libera limite de crédito
  - Atualiza dashboard do vendedor
  - Notifica cliente

### 3. Controle de Crédito

#### 3.1 Limite de Crédito

- Configurar limite por cliente
- Verificar antes de confirmar pedido
- Bloquear se exceder
- Alertar se próximo do limite

#### 3.2 Aging

- Invoices por faixa:
  - 0-30 dias
  - 31-60 dias
  - 61-90 dias
  - 90+ dias

#### 3.3 Bloqueio de Cliente

- Bloquear automaticamente se:
  - Invoices vencidas acima de X dias
  - Valor vencido acima de X
  - Limite de crédito excedido

- Desbloquear quando:
  - Pagamento confirmado
  - Aprovação manual

### 4. Relatórios Financeiros

#### 4.1 KPIs

- **DSO (Days Sales Outstanding):**
  - Média de dias para receber
  - Por cliente
  - Por vendedor

- **Faturamento:**
  - Por período
  - Por cliente
  - Por vendedor
  - Por warehouse
  - Por produto

- **Inadimplência:**
  - Total vencido
  - Por faixa de aging
  - Taxa de inadimplência

---

## 🗄️ Modelos/Entidades

### Invoice

```python
class Invoice(models.Model):
    """Fatura/Invoice"""
    
    STATUS_CHOICES = [
        ('draft', 'Rascunho'),
        ('issued', 'Emitida'),
        ('sent', 'Enviada'),
        ('partially_paid', 'Parcialmente Paga'),
        ('paid', 'Paga'),
        ('overdue', 'Vencida'),
        ('cancelled', 'Cancelada'),
        ('refunded', 'Reembolsada'),
    ]
    
    # Numeração
    invoice_number = models.CharField(max_length=50, unique=True)
    warehouse_prefix = models.CharField(max_length=10, blank=True)  # ORL, MIA
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Relacionamentos
    sales_order = models.ForeignKey('sales.SalesOrder', on_delete=models.PROTECT)
    customer = models.ForeignKey('sales.Customer', on_delete=models.PROTECT)
    warehouse = models.ForeignKey('warehouse.Warehouse', on_delete=models.PROTECT)
    
    # Datas
    issue_date = models.DateField()
    due_date = models.DateField()
    paid_date = models.DateField(null=True, blank=True)
    
    # Termos de Pagamento
    payment_terms = models.ForeignKey('invoicing.PaymentTerm', on_delete=models.PROTECT)
    payment_method = models.CharField(max_length=50)  # cash, check, zelle, acc, card, pix
    
    # Itens
    lines = models.JSONField(default=list)  # [{product_id, qty, unit_price, tax, line_total}]
    
    # Totais
    sub_total = models.DecimalField(max_digits=15, decimal_places=2)
    tax_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    discount_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=15, decimal_places=2)
    paid_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    balance = models.DecimalField(max_digits=15, decimal_places=2)  # grand_total - paid_total
    
    # Impostos (por país)
    taxes = models.JSONField(default=dict)  # {icms: 100, ipi: 50, etc}
    
    # Observações
    notes = models.TextField(blank=True)
    internal_notes = models.TextField(blank=True)
    
    # Metadados
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'invoicing_invoices'
        ordering = ['-issue_date']
        indexes = [
            models.Index(fields=['customer', 'status']),
            models.Index(fields=['warehouse', 'status']),
            models.Index(fields=['due_date', 'status']),
            models.Index(fields=['invoice_number']),
        ]
    
    def __str__(self):
        return f"INV-{self.invoice_number}"
```

### PaymentTerm

```python
class PaymentTerm(models.Model):
    """Termo de Pagamento"""
    
    name = models.CharField(max_length=100)  # Net 15, Net 30, etc.
    net_days = models.IntegerField()  # 7, 10, 15, 30, etc.
    due_day_rule = models.CharField(max_length=50, blank=True)  # first_business_day, etc.
    
    # Descrição
    description = models.TextField(blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'invoicing_payment_terms'
    
    def __str__(self):
        return self.name
```

### Payment

```python
class Payment(models.Model):
    """Pagamento"""
    
    METHOD_CHOICES = [
        ('cash', 'Dinheiro'),
        ('check', 'Cheque'),
        ('zelle', 'Zelle'),
        ('acc', 'ACC'),
        ('card', 'Cartão'),
        ('pix', 'PIX'),
        ('transfer', 'Transferência'),
        ('gateway', 'Gateway'),
    ]
    
    payment_number = models.CharField(max_length=50, unique=True)
    
    # Invoice
    invoice = models.ForeignKey('invoicing.Invoice', on_delete=models.PROTECT, related_name='payments')
    
    # Valor
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Forma de Pagamento
    payment_method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    
    # Gateway (se aplicável)
    gateway = models.CharField(max_length=50, blank=True)  # stripe, paypal, etc.
    gateway_transaction_id = models.CharField(max_length=255, blank=True)
    
    # Data
    payment_date = models.DateField()
    received_at = models.DateTimeField(auto_now_add=True)
    
    # Comprovante
    receipt_file = models.FileField(upload_to='payments/', blank=True)
    
    # Observações
    notes = models.TextField(blank=True)
    
    # Usuário
    received_by = models.ForeignKey('users.User', on_delete=models.PROTECT)
    
    class Meta:
        db_table = 'invoicing_payments'
        ordering = ['-payment_date']
    
    def __str__(self):
        return f"PAY-{self.payment_number}"
```

---

## 🔌 APIs/Endpoints

### Base URL
```
/api/v1/invoicing/
```

### Endpoints

#### Invoices

```http
GET /api/v1/invoicing/invoices/
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `customer_id` - Filtrar por cliente
- `seller_id` - Filtrar por vendedor
- `warehouse_id` - Filtrar por warehouse
- `status` - Filtrar por status
- `overdue` - true (apenas vencidas)
- `date_from` - Data inicial
- `date_to` - Data final

```http
POST /api/v1/invoicing/invoices/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "sales_order_id": 1,
  "issue_date": "2025-11-14",
  "payment_terms_id": 1
}
```

**Gera invoice automaticamente do pedido**

```http
GET /api/v1/invoicing/invoices/{id}/
Authorization: Bearer {access_token}
```

**Retorna invoice com PDF**

```http
POST /api/v1/invoicing/invoices/{id}/send/
Authorization: Bearer {access_token}
```

**Envia invoice por email para cliente**

#### Payments

```http
POST /api/v1/invoicing/payments/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "invoice_id": 1,
  "amount": 1000.00,
  "payment_method": "zelle",
  "payment_date": "2025-11-14",
  "notes": "Pagamento recebido"
}
```

**Resposta (201 Created):**
```json
{
  "id": 1,
  "payment_number": "PAY-000001",
  "invoice": {
    "id": 1,
    "invoice_number": "ORL-000001",
    "balance": 0.00,
    "status": "paid"
  },
  "amount": 1000.00,
  "payment_method": "zelle",
  "payment_date": "2025-11-14"
}
```

#### Payment Terms

```http
GET /api/v1/invoicing/payment-terms/
Authorization: Bearer {access_token}
```

#### Credit Control

```http
GET /api/v1/invoicing/credit-control/
Authorization: Bearer {access_token}
```

**Retorna:**
- Clientes bloqueados
- Clientes próximos do limite
- Aging de invoices
- Total vencido

```http
POST /api/v1/invoicing/credit-control/{customer_id}/block/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "reason": "Invoices vencidas acima de 90 dias"
}
```

#### Reports

```http
GET /api/v1/invoicing/reports/dso/
Authorization: Bearer {access_token}
```

**DSO (Days Sales Outstanding)**

```http
GET /api/v1/invoicing/reports/revenue/
Authorization: Bearer {access_token}
```

**Faturamento por período**

---

## 🔄 Fluxos de Trabalho

### Fluxo 1: Geração Automática de Invoice

```
1. Pedido separado/enviado (Logistics)
   ↓
2. Sistema verifica regra de geração
   ↓
3. Cria Invoice
   ↓
4. Calcula vencimento (issue_date + net_days)
   ↓
5. Gera número (global ou por warehouse)
   ↓
6. Status: issued
   ↓
7. Envia para cliente (se auto-send)
   ↓
8. Atualiza Sales Order (status: invoiced)
   ↓
9. Registra em Contas a Receber
```

### Fluxo 2: Registro de Pagamento

```
1. Cliente paga (manual ou gateway)
   ↓
2. Financeiro registra pagamento
   ↓
3. Sistema atualiza invoice:
   - paid_total += amount
   - balance = grand_total - paid_total
   ↓
4. Se balance = 0:
   - status = paid
   - paid_date = payment_date
   ↓
5. Libera limite de crédito do cliente
   ↓
6. Atualiza dashboard do vendedor
   ↓
7. Notifica cliente (confirmação)
```

---

## 📐 Regras de Negócio

### 1. Numeração

- Sequencial e único
- Por warehouse (se configurado): ORL-000001
- Global: 000001
- Não pode ter gaps (usar transações)

### 2. Vencimento

- Calculado: issue_date + net_days
- Considerar dias úteis (se configurado)
- Considerar feriados (se configurado)

### 3. Pagamento Parcial

- Permitir pagamentos parciais
- Invoice fica "partially_paid"
- Balance atualizado
- Múltiplos pagamentos por invoice

### 4. Bloqueio de Cliente

- Automático se:
  - Invoices vencidas > 90 dias
  - Valor vencido > X
  - Limite de crédito excedido
- Manual por financeiro
- Desbloqueio automático ao pagar

---

## 🔐 Permissões

### Auxiliar Financeiro

- ✅ Ver invoices
- ✅ Registrar pagamentos
- ✅ Emitir boletos
- ❌ Editar invoices
- ❌ Bloquear clientes

### Analista Financeiro

- ✅ Tudo que auxiliar pode
- ✅ Editar invoices
- ✅ Bloquear/desbloquear clientes
- ✅ Ver relatórios
- ❌ Ver custos (apenas margem)

### Contador

- ✅ Ver todas as invoices
- ✅ Ver custos
- ✅ Exportar dados contábeis
- ✅ Gerar relatórios fiscais
- ❌ Registrar pagamentos

---

## ✅ Status de Implementação

### Invoices
- [ ] Modelo Invoice
- [ ] Geração automática
- [ ] Numeração (global e por warehouse)
- [ ] Cálculo de vencimento
- [ ] PDF da invoice
- [ ] Envio por email
- [ ] Integração com Sales

### Payments
- [ ] Modelo Payment
- [ ] Registro manual
- [ ] Integração Stripe
- [ ] Integração PayPal
- [ ] Integração Zelle
- [ ] Integração PIX
- [ ] Baixa automática

### Payment Terms
- [ ] Modelo PaymentTerm
- [ ] CRUD
- [ ] Configuração por cliente

### Credit Control
- [ ] Verificação de limite
- [ ] Bloqueio automático
- [ ] Aging
- [ ] Alertas

### Reports
- [ ] DSO
- [ ] Faturamento
- [ ] Inadimplência
- [ ] Aging report

### APIs
- [ ] GET /invoices/
- [ ] POST /invoices/
- [ ] GET /invoices/{id}/
- [ ] POST /invoices/{id}/send/
- [ ] POST /payments/
- [ ] GET /payment-terms/
- [ ] GET /credit-control/
- [ ] GET /reports/dso/
- [ ] GET /reports/revenue/

---

## 💻 Notas Técnicas

### Numeração

- Usar sequência do banco (PostgreSQL sequence)
- Lock para evitar duplicatas
- Transação para garantir atomicidade

### PDF

- Gerar PDF usando reportlab ou weasyprint
- Template configurável
- Cache de PDFs gerados

### Gateways

- Webhooks para confirmação
- Retry em caso de falha
- Logs de todas as transações

---

**⚠️ IMPORTANTE:** Atualize este documento conforme a implementação progride!

