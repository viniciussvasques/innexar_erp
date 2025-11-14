# Stack Tecnológico Detalhado - Innexar ERP

## 🎯 Decisões Técnicas

### Por que Frappe Framework?

✅ **Multi-tenancy nativo**  
✅ **Metadata-driven** - Desenvolvimento rápido  
✅ **REST + GraphQL APIs** prontas  
✅ **Sistema de permissões robusto**  
✅ **Background jobs** (RQ)  
✅ **Real-time updates** (Socket.io)  
✅ **Workflow engine** built-in  
✅ **Report builder** visual  
✅ **Print formats** customizáveis  
✅ **Comunidade ativa** (ERPNext)

---

## 🏗️ Camadas da Aplicação

```
┌─────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Frappe UI   │  │   Next.js    │  │  Mobile App  │  │
│  │   (Vue 3)    │  │  (React 18)  │  │(React Native)│  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      API LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  REST API    │  │  GraphQL     │  │  WebSocket   │  │
│  │              │  │              │  │  (Realtime)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                     │
│  ┌────────────────────────────────────────────────────┐ │
│  │           Frappe Framework (Python)                │ │
│  │  - DocTypes (Models)                               │ │
│  │  - Controllers (Business Logic)                    │ │
│  │  - Hooks & Events                                  │ │
│  │  - Workflows                                       │ │
│  │  - Permissions                                     │ │
│  │  - Background Jobs                                 │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     DATA LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   MariaDB    │  │    Redis     │  │ File Storage │  │
│  │  (Primary)   │  │  (Cache/Q)   │  │   (S3/Local) │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Componentes Principais

### 1. Backend - Frappe Framework

#### Estrutura de um App Frappe

```
innexar_financial/
├── innexar_financial/
│   ├── hooks.py                    # Event hooks
│   ├── patches.txt                 # Database migrations
│   ├── modules.txt                 # Módulos do app
│   │
│   ├── config/
│   │   ├── desktop.py             # Desktop icons
│   │   └── docs.py                # Documentation
│   │
│   ├── accounts_payable/          # Módulo
│   │   ├── doctype/
│   │   │   ├── supplier/
│   │   │   │   ├── supplier.json  # Metadata
│   │   │   │   ├── supplier.py    # Controller
│   │   │   │   └── supplier.js    # Client script
│   │   │   │
│   │   │   └── payment_entry/
│   │   │       ├── payment_entry.json
│   │   │       ├── payment_entry.py
│   │   │       └── payment_entry.js
│   │   │
│   │   ├── page/                  # Custom pages
│   │   ├── report/                # Reports
│   │   └── dashboard/             # Dashboards
│   │
│   ├── public/                    # Static files
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   │
│   └── templates/                 # Web templates
│       ├── pages/
│       └── emails/
│
├── requirements.txt               # Python dependencies
├── package.json                   # JS dependencies
└── setup.py                       # App metadata
```

#### DocType (Modelo de Dados)

Exemplo: `supplier.json`
```json
{
 "name": "Supplier",
 "doctype": "DocType",
 "module": "Accounts Payable",
 "autoname": "field:supplier_name",
 "fields": [
  {
   "fieldname": "supplier_name",
   "label": "Supplier Name",
   "fieldtype": "Data",
   "reqd": 1,
   "unique": 1
  },
  {
   "fieldname": "tax_id",
   "label": "CNPJ/CPF",
   "fieldtype": "Data",
   "reqd": 1
  },
  {
   "fieldname": "payment_terms",
   "label": "Payment Terms",
   "fieldtype": "Link",
   "options": "Payment Terms"
  },
  {
   "fieldname": "bank_account",
   "label": "Bank Account",
   "fieldtype": "Table",
   "options": "Supplier Bank Account"
  }
 ],
 "permissions": [
  {
   "role": "Accounts Manager",
   "read": 1,
   "write": 1,
   "create": 1,
   "delete": 1
  },
  {
   "role": "Accounts User",
   "read": 1,
   "write": 1
  }
 ]
}
```

#### Controller (Lógica de Negócio)

`supplier.py`
```python
import frappe
from frappe.model.document import Document
from frappe.utils import validate_email_address

class Supplier(Document):
    def validate(self):
        """Validação antes de salvar"""
        self.validate_tax_id()
        self.validate_email()
        
    def validate_tax_id(self):
        """Valida CNPJ/CPF"""
        if not self.tax_id:
            return
            
        # Remove caracteres especiais
        tax_id = ''.join(filter(str.isdigit, self.tax_id))
        
        if len(tax_id) == 11:
            # Valida CPF
            if not self.validate_cpf(tax_id):
                frappe.throw("CPF inválido")
        elif len(tax_id) == 14:
            # Valida CNPJ
            if not self.validate_cnpj(tax_id):
                frappe.throw("CNPJ inválido")
        else:
            frappe.throw("CNPJ/CPF deve ter 11 ou 14 dígitos")
    
    def validate_email(self):
        """Valida email"""
        if self.email:
            validate_email_address(self.email, True)
    
    def on_update(self):
        """Após salvar"""
        self.update_linked_transactions()
        
    def on_trash(self):
        """Antes de deletar"""
        # Verifica se tem transações vinculadas
        if frappe.db.exists("Purchase Order", {"supplier": self.name}):
            frappe.throw("Cannot delete Supplier with linked transactions")
    
    @staticmethod
    def validate_cpf(cpf):
        """Algoritmo de validação CPF"""
        # Implementação...
        return True
        
    @staticmethod
    def validate_cnpj(cnpj):
        """Algoritmo de validação CNPJ"""
        # Implementação...
        return True
```

#### API Endpoints (Whitelisted Methods)

```python
# supplier.py (continuação)

@frappe.whitelist()
def get_supplier_balance(supplier):
    """API: Retorna saldo do fornecedor"""
    balance = frappe.db.sql("""
        SELECT 
            SUM(outstanding_amount) as total
        FROM 
            `tabPurchase Invoice`
        WHERE 
            supplier = %s
            AND docstatus = 1
            AND outstanding_amount > 0
    """, supplier, as_dict=1)
    
    return balance[0].total if balance else 0

@frappe.whitelist()
def get_supplier_analytics(supplier, from_date, to_date):
    """API: Analytics do fornecedor"""
    data = frappe.db.sql("""
        SELECT 
            MONTH(posting_date) as month,
            SUM(grand_total) as total_purchased,
            COUNT(*) as invoice_count,
            AVG(DATEDIFF(due_date, posting_date)) as avg_payment_days
        FROM 
            `tabPurchase Invoice`
        WHERE 
            supplier = %s
            AND posting_date BETWEEN %s AND %s
            AND docstatus = 1
        GROUP BY 
            MONTH(posting_date)
    """, (supplier, from_date, to_date), as_dict=1)
    
    return data
```

**Chamada da API:**
```javascript
// Frontend
frappe.call({
    method: 'innexar_financial.accounts_payable.doctype.supplier.supplier.get_supplier_balance',
    args: {
        supplier: 'SUP-00001'
    },
    callback: (r) => {
        console.log('Balance:', r.message);
    }
});
```

### 2. Frontend - Frappe UI (Vue.js)

#### Client Script

`supplier.js`
```javascript
frappe.ui.form.on('Supplier', {
    refresh: function(frm) {
        // Botão customizado
        if (!frm.is_new()) {
            frm.add_custom_button(__('View Transactions'), function() {
                frappe.route_options = {
                    "supplier": frm.doc.name
                };
                frappe.set_route("List", "Purchase Invoice");
            });
            
            // Dashboard de analytics
            frm.trigger('show_analytics');
        }
    },
    
    show_analytics: function(frm) {
        frappe.call({
            method: 'innexar_financial.accounts_payable.doctype.supplier.supplier.get_supplier_analytics',
            args: {
                supplier: frm.doc.name,
                from_date: frappe.datetime.add_months(frappe.datetime.get_today(), -6),
                to_date: frappe.datetime.get_today()
            },
            callback: (r) => {
                if (r.message) {
                    frm.dashboard.add_section(
                        frappe.render_template('supplier_analytics', {
                            data: r.message
                        })
                    );
                }
            }
        });
    },
    
    tax_id: function(frm) {
        // Auto-format CNPJ/CPF
        if (frm.doc.tax_id) {
            let tax_id = frm.doc.tax_id.replace(/\D/g, '');
            
            if (tax_id.length === 11) {
                // Formato CPF: 000.000.000-00
                frm.set_value('tax_id', 
                    tax_id.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
                );
            } else if (tax_id.length === 14) {
                // Formato CNPJ: 00.000.000/0000-00
                frm.set_value('tax_id', 
                    tax_id.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
                );
            }
        }
    }
});
```

### 3. Background Jobs (Async Tasks)

#### Configuração de Jobs

`hooks.py`
```python
# Scheduled jobs
scheduler_events = {
    # Diário
    "daily": [
        "innexar_financial.tasks.daily.send_payment_reminders",
        "innexar_financial.tasks.daily.update_exchange_rates",
        "innexar_financial.tasks.daily.calculate_interest"
    ],
    
    # A cada hora
    "hourly": [
        "innexar_financial.tasks.hourly.import_bank_statements",
        "innexar_financial.tasks.hourly.sync_nfe_status"
    ],
    
    # Semanal
    "weekly": [
        "innexar_financial.tasks.weekly.generate_financial_reports"
    ],
    
    # Mensal
    "monthly": [
        "innexar_financial.tasks.monthly.close_fiscal_period",
        "innexar_financial.tasks.monthly.calculate_taxes"
    ],
    
    # Cron customizado
    "cron": {
        "0 9 * * *": [  # Todo dia às 9h
            "innexar_financial.tasks.send_daily_summary"
        ]
    }
}
```

#### Implementação de Tasks

`tasks/daily.py`
```python
import frappe
from frappe.utils import today, add_days, getdate

def send_payment_reminders():
    """Envia lembretes de pagamento"""
    
    # Pagamentos que vencem em 3 dias
    upcoming_payments = frappe.get_all(
        "Payment Entry",
        filters={
            "payment_date": ["between", [today(), add_days(today(), 3)]],
            "docstatus": 0,
            "payment_type": "Pay"
        },
        fields=["name", "party", "paid_amount", "payment_date"]
    )
    
    for payment in upcoming_payments:
        # Envia email
        frappe.sendmail(
            recipients=get_finance_team_emails(),
            subject=f"Payment Reminder: {payment.party}",
            message=f"""
                <p>Payment of {payment.paid_amount} to {payment.party} 
                is due on {payment.payment_date}</p>
                <p><a href="{frappe.utils.get_url()}/app/payment-entry/{payment.name}">
                    View Payment
                </a></p>
            """
        )
        
    # Log
    frappe.logger().info(f"Sent {len(upcoming_payments)} payment reminders")

def update_exchange_rates():
    """Atualiza taxas de câmbio"""
    
    import requests
    
    # API do Banco Central
    response = requests.get("https://api.bcb.gov.br/dados/serie/bcdata.sgs.10813/dados/ultimos/1")
    
    if response.status_code == 200:
        data = response.json()[0]
        rate = float(data['valor'])
        
        # Atualiza no sistema
        frappe.db.set_value("Currency Exchange", 
            {"from_currency": "USD", "to_currency": "BRL"},
            "exchange_rate", rate
        )
        
        frappe.db.commit()
        frappe.logger().info(f"Updated USD/BRL rate to {rate}")

# Enqueue job manualmente
@frappe.whitelist()
def trigger_bank_sync():
    """API para disparar sync manualmente"""
    frappe.enqueue(
        method='innexar_financial.tasks.hourly.import_bank_statements',
        queue='long',  # short, default, long
        timeout=300,
        is_async=True,
        job_name='bank_sync_manual'
    )
    return {"status": "queued"}
```

### 4. Workflows

#### Configuração de Workflow (JSON)

`purchase_order_workflow.json`
```json
{
 "name": "Purchase Order Approval",
 "document_type": "Purchase Order",
 "is_active": 1,
 "states": [
  {
   "state": "Draft",
   "doc_status": 0,
   "allow_edit": "Purchasing User"
  },
  {
   "state": "Pending Approval",
   "doc_status": 0,
   "allow_edit": "Purchasing Manager"
  },
  {
   "state": "Approved",
   "doc_status": 1,
   "is_optional_state": 0
  },
  {
   "state": "Rejected",
   "doc_status": 2
  }
 ],
 "transitions": [
  {
   "state": "Draft",
   "action": "Submit for Approval",
   "next_state": "Pending Approval",
   "allowed": "Purchasing User",
   "condition": "doc.grand_total > 0"
  },
  {
   "state": "Pending Approval",
   "action": "Approve",
   "next_state": "Approved",
   "allowed": "Purchasing Manager",
   "condition": "doc.grand_total <= 10000"
  },
  {
   "state": "Pending Approval",
   "action": "Approve",
   "next_state": "Approved",
   "allowed": "Finance Manager",
   "condition": "doc.grand_total > 10000"
  },
  {
   "state": "Pending Approval",
   "action": "Reject",
   "next_state": "Rejected",
   "allowed": "Purchasing Manager"
  }
 ]
}
```

### 5. Reports

#### Query Report (SQL)

`supplier_ledger.py`
```python
import frappe

def execute(filters=None):
    columns = get_columns()
    data = get_data(filters)
    
    return columns, data

def get_columns():
    return [
        {
            "fieldname": "posting_date",
            "label": "Date",
            "fieldtype": "Date",
            "width": 100
        },
        {
            "fieldname": "voucher_type",
            "label": "Voucher Type",
            "fieldtype": "Data",
            "width": 120
        },
        {
            "fieldname": "voucher_no",
            "label": "Voucher No",
            "fieldtype": "Dynamic Link",
            "options": "voucher_type",
            "width": 150
        },
        {
            "fieldname": "debit",
            "label": "Debit",
            "fieldtype": "Currency",
            "width": 120
        },
        {
            "fieldname": "credit",
            "label": "Credit",
            "fieldtype": "Currency",
            "width": 120
        },
        {
            "fieldname": "balance",
            "label": "Balance",
            "fieldtype": "Currency",
            "width": 120
        }
    ]

def get_data(filters):
    conditions = get_conditions(filters)
    
    data = frappe.db.sql(f"""
        SELECT
            posting_date,
            voucher_type,
            voucher_no,
            debit,
            credit,
            SUM(debit - credit) OVER (ORDER BY posting_date, creation) as balance
        FROM
            `tabGL Entry`
        WHERE
            party_type = 'Supplier'
            AND party = %(supplier)s
            {conditions}
        ORDER BY
            posting_date, creation
    """, filters, as_dict=1)
    
    return data

def get_conditions(filters):
    conditions = []
    
    if filters.get("from_date"):
        conditions.append("posting_date >= %(from_date)s")
    if filters.get("to_date"):
        conditions.append("posting_date <= %(to_date)s")
        
    return " AND " + " AND ".join(conditions) if conditions else ""
```

### 6. Real-time Updates (WebSocket)

```python
# No controller
def on_update(self):
    # Publica evento real-time
    frappe.publish_realtime(
        event='payment_received',
        message={
            'supplier': self.supplier,
            'amount': self.paid_amount
        },
        user=frappe.session.user  # ou room='finance_team'
    )

# No frontend (client script)
frappe.realtime.on('payment_received', (data) => {
    console.log('Payment received:', data);
    frappe.show_alert({
        message: `Payment of ${data.amount} received from ${data.supplier}`,
        indicator: 'green'
    });
    
    // Recarrega dashboard
    cur_frm.reload_doc();
});
```

---

## 🗄️ Database Schema

### Multi-tenant Database Strategy

Cada tenant (site) tem seu próprio database:

```
MariaDB Server
├── tenant1_innexar     (Database para Tenant 1)
│   ├── tabSupplier
│   ├── tabPurchase Order
│   └── ...
├── tenant2_innexar     (Database para Tenant 2)
│   ├── tabSupplier
│   ├── tabPurchase Order
│   └── ...
└── _common             (Shared metadata)
    └── tabUser
```

### Convenções de Nomenclatura

- **DocTypes**: PascalCase singular (ex: `Purchase Order`)
- **Tables**: `tab{DocType}` (ex: `tabPurchase Order`)
- **Fields**: snake_case (ex: `grand_total`, `posting_date`)
- **Child Tables**: `{Parent} Item` (ex: `Purchase Order Item`)

---

## 🔌 APIs

### REST API

**Autenticação:**
```bash
# API Key/Secret
curl -X GET 'https://innexar.com/api/resource/Supplier' \
  -H 'Authorization: token api_key:api_secret'

# OAuth 2.0 (futuro)
curl -X GET 'https://innexar.com/api/resource/Supplier' \
  -H 'Authorization: Bearer {access_token}'
```

**Endpoints padrão:**
```
GET    /api/resource/{doctype}              # List
GET    /api/resource/{doctype}/{name}       # Get
POST   /api/resource/{doctype}              # Create
PUT    /api/resource/{doctype}/{name}       # Update
DELETE /api/resource/{doctype}/{name}       # Delete

GET    /api/method/{app}.{module}.{function}  # Custom methods
```

### GraphQL (via Frappe GraphQL)

```graphql
query {
  Supplier(filters: {disabled: 0}, limit: 10) {
    name
    supplier_name
    tax_id
    total_unpaid: _aggregate(
      field: "outstanding_amount"
      function: SUM
    )
  }
}
```

---

## 📱 Mobile Strategy (Futuro)

### React Native App

```
innexar-mobile/
├── src/
│   ├── screens/
│   │   ├── Dashboard/
│   │   ├── Sales/
│   │   └── Inventory/
│   ├── components/
│   ├── services/
│   │   └── api.ts         # Frappe API client
│   └── navigation/
├── ios/
└── android/
```

**Features mobile:**
- Dashboard executivo
- Aprovações de workflow
- Consulta de estoque
- Vendas offline-first
- Scanner de código de barras
- Assinatura digital

---

## 🛡️ Performance & Escalabilidade

### Caching Strategy

```python
# Redis cache
@frappe.cache()
def get_supplier_list():
    return frappe.get_all("Supplier", filters={"disabled": 0})

# Cache com TTL
@frappe.cache(ttl=3600)  # 1 hora
def get_exchange_rate(currency):
    return frappe.db.get_value("Currency Exchange", 
        {"to_currency": currency}, "exchange_rate")
```

### Database Optimization

```python
# Índices customizados
frappe.db.add_index("Purchase Invoice", ["supplier", "posting_date"])

# Query optimization
# ❌ Ruim
suppliers = frappe.get_all("Supplier")
for s in suppliers:
    balance = frappe.db.get_value("Purchase Invoice", 
        {"supplier": s.name}, "sum(outstanding_amount)")

# ✅ Bom
data = frappe.db.sql("""
    SELECT 
        s.name,
        COALESCE(SUM(pi.outstanding_amount), 0) as balance
    FROM 
        `tabSupplier` s
    LEFT JOIN 
        `tabPurchase Invoice` pi ON pi.supplier = s.name
    GROUP BY 
        s.name
""", as_dict=1)
```

### Load Balancing

```
                 ┌──────────────┐
                 │ Load Balancer│
                 └──────┬───────┘
            ┌───────────┼───────────┐
            │           │           │
    ┌───────▼────┐ ┌────▼─────┐ ┌──▼────────┐
    │  Web Node  │ │ Web Node │ │ Web Node  │
    │  (Gunicorn)│ │(Gunicorn)│ │(Gunicorn) │
    └───────┬────┘ └────┬─────┘ └──┬────────┘
            └───────────┼───────────┘
                        │
            ┌───────────▼──────────┐
            │   MariaDB (Master)   │
            └───────────┬──────────┘
                        │
            ┌───────────┴──────────┐
            │                      │
    ┌───────▼────┐        ┌────────▼─────┐
    │   Replica  │        │   Replica    │
    │   (Read)   │        │   (Read)     │
    └────────────┘        └──────────────┘
```

---

## 📦 Deployment

### Docker Compose (Development)

```yaml
version: '3.8'

services:
  frappe:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - ./apps:/home/frappe/frappe-bench/apps
      - ./sites:/home/frappe/frappe-bench/sites
    depends_on:
      - mariadb
      - redis

  mariadb:
    image: mariadb:10.6
    environment:
      MYSQL_ROOT_PASSWORD: admin
    volumes:
      - mariadb_data:/var/lib/mysql

  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data

volumes:
  mariadb_data:
  redis_data:
```

### Kubernetes (Production)

```yaml
# Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: innexar-web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: innexar-web
  template:
    metadata:
      labels:
        app: innexar-web
    spec:
      containers:
      - name: frappe
        image: innexar/frappe:latest
        ports:
        - containerPort: 8000
        env:
        - name: DB_HOST
          value: mariadb-service
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
---
# Service
apiVersion: v1
kind: Service
metadata:
  name: innexar-service
spec:
  type: LoadBalancer
  selector:
    app: innexar-web
  ports:
  - port: 80
    targetPort: 8000
```

---

**Próximo:** Setup do ambiente de desenvolvimento! 🚀
