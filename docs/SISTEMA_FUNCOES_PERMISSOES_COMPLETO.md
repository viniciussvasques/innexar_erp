# 👥 Sistema de Funções e Permissões Completo - Innexar ERP

**Última atualização:** 2025-11-14  
**Versão:** 2.0.0  
**Baseado em:** Especificações completas dos módulos Vendas, Estoque, Logística e Invoice

---

## 📋 Índice

1. [Análise da Conversa](#análise-da-conversa)
2. [Funções Empresariais Detalhadas](#funções-empresariais-detalhadas)
3. [Módulos do ERP](#módulos-do-erp)
4. [Matriz de Permissões Completa](#matriz-de-permissões-completa)
5. [Regras Especiais por Função](#regras-especiais-por-função)
6. [Implementação Técnica](#implementação-técnica)

---

## 🎯 Análise da Conversa

### ✅ Pontos Fortes da Especificação

1. **Arquitetura bem definida**
   - Separação clara entre Vendas, Estoque, Logística e Invoice
   - Fluxo de dados bem mapeado
   - Integração entre módulos bem pensada

2. **Funcionalidades avançadas**
   - Multi-warehouse com vendedores vinculados
   - Carteira de clientes por vendedor
   - Sistema de picking com código de barras
   - Catálogo com modos Card/Lista/Detalhado
   - Tipos de produtos diversos (físico, serviço, digital, assinatura, bundle)
   - Sistema de descontos complexo e flexível

3. **Atenção aos detalhes**
   - Status detalhados de pedidos
   - Numeração de invoices por warehouse
   - Portal do cliente
   - Mobile app para picking
   - Impressão automática

### ⚠️ Pontos que Precisam de Atenção

1. **Performance**
   - Sistema de descontos complexo pode ser lento se não otimizado
   - Multi-warehouse precisa de cache inteligente
   - Catálogo offline precisa de estratégia de sincronização

2. **Segurança**
   - Vendedor não deve ver custos (apenas margem)
   - Limites de desconto precisam ser rígidos
   - Auditoria completa é essencial

3. **Escalabilidade**
   - Picking simultâneo de múltiplos operadores
   - Transferências entre warehouses
   - Geração de invoices em lote

### 💡 Melhorias Sugeridas

1. **Dashboard do Vendedor**
   - KPIs em tempo real
   - Alertas de estoque baixo
   - Clientes sem compra há X dias

2. **Sistema de Aprovações**
   - Workflow visual para descontos acima do limite
   - Aprovação de crédito
   - Cancelamento de pedidos

3. **Notificações**
   - Push notifications para mobile
   - Email para clientes
   - Alertas internos entre setores

---

## 👔 Funções Empresariais Detalhadas

### Funções Administrativas

#### 1. **Administrador Geral**
- **Descrição**: Acesso total ao sistema, configurações e gestão de usuários
- **Warehouse**: Todos
- **Carteira**: Todos os clientes
- **Permissões Especiais**: Sem limites

#### 2. **Administrador de Sistema**
- **Descrição**: Configurações técnicas, integrações, backup
- **Warehouse**: Visualização de todos
- **Carteira**: N/A
- **Permissões Especiais**: Acesso a logs, APIs, configurações técnicas

### Funções Comerciais (Vendas)

#### 3. **Diretor Comercial**
- **Descrição**: Visão estratégica de vendas, relatórios executivos
- **Warehouse**: Visualização de todos
- **Carteira**: Todos os clientes (visualização)
- **Permissões Especiais**: Aprovações de alto valor, reatribuição de carteiras

#### 4. **Gerente de Vendas**
- **Descrição**: Gestão de equipe de vendas, metas, performance
- **Warehouse**: Visualização de todos (pode reatribuir vendedores)
- **Carteira**: Todos os clientes da equipe
- **Permissões Especiais**: 
  - Aprovar descontos acima do limite do vendedor
  - Reatribuir clientes entre vendedores
  - Ver relatórios de toda equipe
  - Limite de desconto: 25%

#### 5. **Supervisor de Vendas**
- **Descrição**: Supervisão de vendedores, aprovações intermediárias
- **Warehouse**: Warehouse atribuído + visualização de outros
- **Carteira**: Clientes da equipe supervisionada
- **Permissões Especiais**:
  - Aprovar descontos até 15%
  - Ver pedidos da equipe
  - Reatribuir clientes dentro da equipe

#### 6. **Vendedor**
- **Descrição**: Criação de pedidos, gestão de carteira de clientes
- **Warehouse**: Warehouse atribuído (único ou múltiplos permitidos)
- **Carteira**: Apenas clientes atribuídos
- **Permissões Especiais**:
  - Limite de desconto: 5-10% (configurável)
  - Ver apenas produtos do seu warehouse
  - Ver apenas seus pedidos
  - Ver invoices dos seus clientes
  - Dashboard com faturas em aberto dos clientes

#### 7. **Vendedor Júnior**
- **Descrição**: Vendedor iniciante com restrições
- **Warehouse**: Warehouse atribuído
- **Carteira**: Clientes atribuídos
- **Permissões Especiais**:
  - Limite de desconto: 3%
  - Não pode cancelar pedidos
  - Pedidos acima de valor X precisam aprovação

### Funções de Estoque / Warehouse

#### 8. **Gerente de Estoque**
- **Descrição**: Gestão completa de estoque, múltiplos warehouses
- **Warehouse**: Todos
- **Carteira**: N/A
- **Permissões Especiais**:
  - Ajustes de inventário
  - Transferências entre warehouses
  - Configuração de posições
  - Relatórios de estoque

#### 9. **Operador de Estoque**
- **Descrição**: Entrada/saída de produtos, contagem
- **Warehouse**: Warehouse atribuído
- **Carteira**: N/A
- **Permissões Especiais**:
  - Registrar entrada de mercadoria
  - Registrar saída
  - Contagem física
  - Não pode fazer ajustes sem aprovação

### Funções de Logística

#### 10. **Gerente de Logística**
- **Descrição**: Gestão completa da separação e expedição
- **Warehouse**: Todos
- **Carteira**: N/A
- **Permissões Especiais**:
  - Atribuir picking jobs
  - Ver todos os pedidos
  - Configurar impressão
  - Aprovar transferências

#### 11. **Supervisor de Logística**
- **Descrição**: Supervisão da equipe de separação
- **Warehouse**: Warehouse atribuído
- **Carteira**: N/A
- **Permissões Especiais**:
  - Atribuir picks
  - Ver pedidos do warehouse
  - Aprovar exceções
  - Reatribuir picks

#### 12. **Operador de Separação (Picker)**
- **Descrição**: Separação de produtos usando código de barras
- **Warehouse**: Warehouse atribuído
- **Carteira**: N/A
- **Permissões Especiais**:
  - Acessar mobile app de picking
  - Escanear códigos de barras
  - Marcar itens como separados
  - Registrar divergências
  - Não pode ver custos/preços

#### 13. **Conferente**
- **Descrição**: Conferência e packing de pedidos
- **Warehouse**: Warehouse atribuído
- **Carteira**: N/A
- **Permissões Especiais**:
  - Conferir itens separados
  - Gerar packing list
  - Imprimir etiquetas
  - Marcar como pronto para envio

#### 14. **Expedidor**
- **Descrição**: Expedição e integração com carriers
- **Warehouse**: Warehouse atribuído
- **Carteira**: N/A
- **Permissões Especiais**:
  - Gerar etiquetas de remessa
  - Integrar com carriers
  - Atualizar tracking
  - Marcar como enviado

### Funções Financeiras

#### 15. **Diretor Financeiro**
- **Descrição**: Visão completa financeira, aprovações
- **Warehouse**: Visualização de todos
- **Carteira**: Todos os clientes (visualização)
- **Permissões Especiais**:
  - Aprovar limites de crédito
  - Ver todos os relatórios financeiros
  - Configurar termos de pagamento

#### 16. **Contador/Contabilista**
- **Descrição**: Lançamentos contábeis, impostos, SPED
- **Warehouse**: Visualização
- **Carteira**: N/A
- **Permissões Especiais**:
  - Acesso completo a invoices
  - Gerar relatórios fiscais
  - Exportar dados contábeis

#### 17. **Analista Financeiro**
- **Descrição**: Contas a receber, conciliação, fluxo de caixa
- **Warehouse**: Visualização
- **Carteira**: Todos os clientes (visualização)
- **Permissões Especiais**:
  - Registrar pagamentos
  - Dar baixa em invoices
  - Ver relatórios financeiros
  - Bloquear/desbloquear clientes

#### 18. **Auxiliar Financeiro**
- **Descrição**: Lançamentos básicos, controle de documentos
- **Warehouse**: N/A
- **Carteira**: N/A
- **Permissões Especiais**:
  - Registrar pagamentos
  - Emitir boletos
  - Ver invoices (sem editar)

### Funções de Suporte

#### 19. **Atendente de Suporte**
- **Descrição**: Atendimento a clientes, chamados
- **Warehouse**: N/A
- **Carteira**: Visualização de clientes
- **Permissões Especiais**:
  - Ver pedidos de clientes
  - Criar chamados
  - Ver histórico de clientes

### Funções de Análise

#### 20. **Analista de Dados**
- **Descrição**: Relatórios, dashboards, BI
- **Warehouse**: Visualização de todos
- **Carteira**: Visualização de todos
- **Permissões Especiais**:
  - Acesso somente leitura
  - Exportar dados
  - Criar relatórios customizados
  - Não vê custos (apenas margens)

#### 21. **Auditor**
- **Descrição**: Auditoria, compliance, logs
- **Warehouse**: Visualização de todos
- **Carteira**: Visualização de todos
- **Permissões Especiais**:
  - Acesso somente leitura
  - Ver logs completos
  - Exportar trilhas de auditoria
  - Não pode fazer alterações

### Funções Especiais

#### 22. **Cliente (Portal)**
- **Descrição**: Acesso via portal do cliente
- **Warehouse**: N/A
- **Carteira**: Apenas próprio cadastro
- **Permissões Especiais**:
  - Ver próprios pedidos
  - Ver próprias invoices
  - Rastrear entregas
  - Solicitar RMA
  - Ver catálogo (preços liberados)

---

## 📦 Módulos do ERP

### Módulos Principais

1. **CRM** (já implementado)
   - Leads, Contatos, Oportunidades, Atividades

2. **Vendas** (a implementar)
   - Catálogo de Produtos
   - Pedidos de Venda (Sales Orders)
   - Carteira de Clientes
   - Dashboard do Vendedor
   - Aprovações

3. **Estoque / Warehouse** (a implementar)
   - Cadastro de Produtos
   - Múltiplos Warehouses
   - Posições no Warehouse
   - Movimentações
   - Transferências
   - Inventário

4. **Logística / Picking** (a implementar)
   - Separação (Picking)
   - Conferência
   - Packing
   - Expedição
   - Mobile App

5. **Invoice / Financeiro** (a implementar)
   - Geração de Invoices
   - Contas a Receber
   - Pagamentos
   - Termos de Pagamento
   - Relatórios Financeiros

6. **Portal do Cliente** (a implementar)
   - Acompanhamento de Pedidos
   - Invoices
   - Rastreamento
   - RMA

7. **Configurações** (a implementar)
   - Usuários e Funções
   - Warehouses
   - Regras de Desconto
   - Termos de Pagamento
   - Numeração de Invoices

---

## 🔐 Matriz de Permissões Completa

### Legenda

- **🔴 Nenhum Acesso** - Não pode acessar
- **🟡 Visualizar** - Apenas leitura
- **🟢 Criar** - Pode criar novos registros
- **🔵 Editar** - Pode editar registros existentes
- **🟣 Deletar** - Pode deletar
- **⚫ Administrar** - Acesso total

### Matriz por Módulo

| Função | CRM | Vendas | Estoque | Logística | Invoice | Portal Cliente | Configurações |
|--------|-----|--------|---------|-----------|---------|----------------|---------------|
| **Administrador Geral** | ⚫ | ⚫ | ⚫ | ⚫ | ⚫ | ⚫ | ⚫ |
| **Administrador Sistema** | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | ⚫ |
| **Diretor Comercial** | ⚫ | ⚫ | 🟡 | 🟡 | 🟡 | 🟡 | 🔴 |
| **Gerente de Vendas** | ⚫ | ⚫ | 🟡 | 🟡 | 🟡 | 🟡 | 🔴 |
| **Supervisor de Vendas** | 🟢 | 🟢 | 🟡 | 🟡 | 🟡 | 🟡 | 🔴 |
| **Vendedor** | 🟢 | 🟢 | 🟡 | 🔴 | 🟡 | 🔴 | 🔴 |
| **Vendedor Júnior** | 🟢 | 🟢 | 🟡 | 🔴 | 🟡 | 🔴 | 🔴 |
| **Gerente de Estoque** | 🔴 | 🟡 | ⚫ | 🟡 | 🔴 | 🔴 | 🔴 |
| **Operador de Estoque** | 🔴 | 🔴 | 🟢 | 🔴 | 🔴 | 🔴 | 🔴 |
| **Gerente de Logística** | 🔴 | 🟡 | 🟡 | ⚫ | 🟡 | 🔴 | 🔴 |
| **Supervisor de Logística** | 🔴 | 🟡 | 🟡 | 🟢 | 🟡 | 🔴 | 🔴 |
| **Operador de Separação** | 🔴 | 🟡 | 🟡 | 🟢 | 🔴 | 🔴 | 🔴 |
| **Conferente** | 🔴 | 🟡 | 🟡 | 🟢 | 🔴 | 🔴 | 🔴 |
| **Expedidor** | 🔴 | 🟡 | 🟡 | 🟢 | 🔴 | 🔴 | 🔴 |
| **Diretor Financeiro** | 🟡 | 🟡 | 🟡 | 🟡 | ⚫ | 🟡 | 🔴 |
| **Contador** | 🔴 | 🔴 | 🔴 | 🔴 | ⚫ | 🔴 | 🔴 |
| **Analista Financeiro** | 🔴 | 🟡 | 🔴 | 🔴 | 🟢 | 🟡 | 🔴 |
| **Auxiliar Financeiro** | 🔴 | 🔴 | 🔴 | 🔴 | 🟡 | 🔴 | 🔴 |
| **Atendente Suporte** | 🟢 | 🟡 | 🔴 | 🔴 | 🟡 | 🟡 | 🔴 |
| **Analista de Dados** | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🔴 |
| **Auditor** | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🔴 |
| **Cliente (Portal)** | 🔴 | 🟡 | 🔴 | 🔴 | 🟡 | ⚫ | 🔴 |

### Matriz Detalhada - Módulo Vendas

| Função | Catálogo | Criar Pedido | Editar Pedido | Cancelar Pedido | Aplicar Desconto | Ver Carteira | Dashboard Vendedor |
|--------|----------|--------------|---------------|-----------------|------------------|--------------|-------------------|
| **Vendedor** | 🟢 (próprio warehouse) | 🟢 (próprios clientes) | 🟢 (próprios pedidos) | 🔴 | 🟢 (até limite) | 🟢 (própria) | ⚫ |
| **Vendedor Júnior** | 🟢 (próprio warehouse) | 🟢 (próprios clientes) | 🟢 (próprios pedidos) | 🔴 | 🟢 (até 3%) | 🟢 (própria) | 🟢 |
| **Supervisor Vendas** | 🟢 (todos warehouses) | 🟢 (equipe) | 🟢 (equipe) | 🟢 (equipe) | 🟢 (até 15%) | 🟢 (equipe) | ⚫ |
| **Gerente Vendas** | 🟢 (todos) | 🟢 (todos) | 🟢 (todos) | 🟢 (todos) | 🟢 (até 25%) | ⚫ | ⚫ |
| **Diretor Comercial** | 🟢 (todos) | 🟢 (todos) | 🟢 (todos) | 🟢 (todos) | ⚫ | ⚫ | ⚫ |

### Matriz Detalhada - Módulo Estoque

| Função | Cadastrar Produto | Editar Produto | Ver Estoque | Ajustar Estoque | Transferir | Ver Custo |
|--------|-------------------|---------------|-------------|-----------------|------------|-----------|
| **Operador Estoque** | 🔴 | 🔴 | 🟢 (próprio warehouse) | 🔴 | 🔴 | 🔴 |
| **Gerente Estoque** | ⚫ | ⚫ | ⚫ | ⚫ | ⚫ | ⚫ |
| **Vendedor** | 🔴 | 🔴 | 🟡 (próprio warehouse, sem custo) | 🔴 | 🔴 | 🔴 |
| **Analista Dados** | 🔴 | 🔴 | 🟡 (todos, sem custo) | 🔴 | 🔴 | 🔴 |

### Matriz Detalhada - Módulo Logística

| Função | Ver Pedidos | Atribuir Picking | Fazer Picking | Conferir | Expedir | Ver Preços |
|--------|-------------|------------------|---------------|----------|---------|------------|
| **Operador Separação** | 🟡 (atribuídos) | 🔴 | 🟢 (mobile app) | 🔴 | 🔴 | 🔴 |
| **Conferente** | 🟡 (próprio warehouse) | 🔴 | 🔴 | 🟢 | 🔴 | 🔴 |
| **Expedidor** | 🟡 (próprio warehouse) | 🔴 | 🔴 | 🔴 | 🟢 | 🔴 |
| **Supervisor Logística** | 🟢 (próprio warehouse) | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 |
| **Gerente Logística** | ⚫ | ⚫ | ⚫ | ⚫ | ⚫ | 🔴 |

### Matriz Detalhada - Módulo Invoice

| Função | Gerar Invoice | Editar Invoice | Dar Baixa | Ver Custo | Ver Margem | Bloquear Cliente |
|--------|---------------|----------------|-----------|-----------|------------|------------------|
| **Auxiliar Financeiro** | 🔴 | 🔴 | 🟢 | 🔴 | 🔴 | 🔴 |
| **Analista Financeiro** | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 |
| **Contador** | ⚫ | ⚫ | 🟢 | ⚫ | ⚫ | 🔴 |
| **Diretor Financeiro** | ⚫ | ⚫ | ⚫ | ⚫ | ⚫ | ⚫ |
| **Vendedor** | 🔴 | 🔴 | 🔴 | 🔴 | 🟢 (próprios clientes) | 🔴 |

---

## 🎯 Regras Especiais por Função

### Vendedor

**Restrições:**
- Só vê produtos do warehouse atribuído
- Só vê clientes da sua carteira
- Não vê custos (apenas margem)
- Limite de desconto configurável (padrão: 5-10%)
- Descontos acima do limite → aprovação necessária

**Permissões Especiais:**
- Dashboard com faturas em aberto dos clientes
- Alertas de estoque baixo
- Clientes sem compra há X dias
- Ver histórico completo dos seus clientes

### Operador de Separação

**Restrições:**
- Só vê pedidos atribuídos
- Não vê preços/custos
- Não pode editar pedidos
- Só pode marcar como separado

**Permissões Especiais:**
- Mobile app com código de barras
- Ver posição no warehouse
- Registrar divergências
- Ver foto do produto

### Analista Financeiro

**Restrições:**
- Não vê custos de produtos
- Não pode bloquear clientes sem aprovação
- Não pode alterar termos de pagamento

**Permissões Especiais:**
- Ver todas as invoices
- Registrar pagamentos
- Ver margem (não custo)
- Gerar relatórios financeiros

---

## 🛠️ Implementação Técnica

### Modelos Django Sugeridos

```python
# apps/users/models.py

class Role(models.Model):
    """Função/Cargo dentro da empresa"""
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=50, unique=True)  # seller, picker, etc
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'users_role'
        verbose_name = 'Função'
        verbose_name_plural = 'Funções'
    
    def __str__(self):
        return self.name


class Module(models.Model):
    """Módulo do ERP"""
    code = models.CharField(max_length=50, unique=True)  # sales, inventory, logistics
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'users_module'
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name


class Permission(models.Model):
    """Permissão de acesso a módulo"""
    PERMISSION_LEVELS = [
        ('none', 'Nenhum Acesso'),
        ('view', 'Visualizar'),
        ('create', 'Criar'),
        ('edit', 'Editar'),
        ('delete', 'Deletar'),
        ('admin', 'Administrar'),
    ]
    
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='permissions')
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='permissions')
    level = models.CharField(max_length=20, choices=PERMISSION_LEVELS, default='none')
    
    class Meta:
        db_table = 'users_permission'
        unique_together = ['role', 'module']
    
    def __str__(self):
        return f"{self.role.name} - {self.module.name}: {self.get_level_display()}"


# Adicionar ao User model
class User(AbstractUser):
    # ... campos existentes ...
    
    roles = models.ManyToManyField(
        'Role',
        related_name='users',
        blank=True
    )
    
    # Campos específicos para vendedores
    assigned_warehouse = models.ForeignKey(
        'warehouse.Warehouse',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_users'
    )
    
    allowed_warehouses = models.ManyToManyField(
        'warehouse.Warehouse',
        related_name='allowed_users',
        blank=True
    )
    
    discount_limit_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=5.00,
        help_text='Limite máximo de desconto permitido (%)'
    )
    
    client_portfolio = models.ManyToManyField(
        'sales.Customer',
        related_name='assigned_sellers',
        blank=True
    )
    
    def has_module_permission(self, module_code, required_level='view'):
        """Verifica se usuário tem permissão no módulo"""
        level_hierarchy = {
            'none': 0,
            'view': 1,
            'create': 2,
            'edit': 3,
            'delete': 4,
            'admin': 5,
        }
        
        required = level_hierarchy.get(required_level, 0)
        
        for role in self.roles.filter(is_active=True):
            try:
                permission = role.permissions.get(
                    module__code=module_code,
                    module__is_active=True
                )
                if level_hierarchy.get(permission.level, 0) >= required:
                    return True
            except Permission.DoesNotExist:
                continue
        
        return False
    
    def can_apply_discount(self, discount_percent):
        """Verifica se pode aplicar desconto"""
        return discount_percent <= self.discount_limit_percent
    
    def get_accessible_warehouses(self):
        """Retorna warehouses que o usuário pode acessar"""
        warehouses = []
        if self.assigned_warehouse:
            warehouses.append(self.assigned_warehouse)
        warehouses.extend(self.allowed_warehouses.all())
        return warehouses
```

### Permissões no DRF

```python
# apps/users/permissions.py

from rest_framework import permissions

class HasModulePermission(permissions.BasePermission):
    """Verifica se usuário tem permissão no módulo"""
    
    def __init__(self, module_code, required_level='view'):
        self.module_code = module_code
        self.required_level = required_level
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.has_module_permission(
            self.module_code,
            self.required_level
        )


class HasWarehouseAccess(permissions.BasePermission):
    """Verifica se usuário tem acesso ao warehouse"""
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admin vê tudo
        if request.user.is_superuser:
            return True
        
        # Verifica se o objeto tem warehouse e se o usuário tem acesso
        if hasattr(obj, 'warehouse'):
            accessible_warehouses = request.user.get_accessible_warehouses()
            return obj.warehouse in accessible_warehouses
        
        return True


class CanApplyDiscount(permissions.BasePermission):
    """Verifica se pode aplicar desconto"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        discount_percent = request.data.get('discount_percent', 0)
        return request.user.can_apply_discount(discount_percent)


# Uso nas views
from apps.users.permissions import HasModulePermission, HasWarehouseAccess, CanApplyDiscount

class SalesOrderViewSet(viewsets.ModelViewSet):
    permission_classes = [
        IsAuthenticated,
        HasModulePermission('sales', 'view')
    ]
    
    def get_permissions(self):
        if self.action == 'create':
            return [
                IsAuthenticated(),
                HasModulePermission('sales', 'create'),
                CanApplyDiscount()
            ]
        elif self.action in ['update', 'partial_update']:
            return [
                IsAuthenticated(),
                HasModulePermission('sales', 'edit'),
                HasWarehouseAccess()
            ]
        return super().get_permissions()
    
    def get_queryset(self):
        """Filtra pedidos baseado no papel do usuário"""
        queryset = SalesOrder.objects.all()
        
        # Vendedor vê apenas seus pedidos
        if self.request.user.has_module_permission('sales', 'create'):
            # Verifica se é vendedor (tem warehouse atribuído)
            if self.request.user.assigned_warehouse:
                queryset = queryset.filter(
                    seller=self.request.user,
                    warehouse=self.request.user.assigned_warehouse
                )
        
        return queryset
```

---

## 📝 Próximos Passos

1. ✅ Criar modelos Role, Module, Permission
2. ✅ Adicionar campos ao User (warehouse, carteira, limite desconto)
3. ✅ Implementar sistema de verificação de permissões
4. ✅ Criar command de seed de dados
5. ✅ Adicionar permissões nas views existentes
6. ✅ Criar API para gerenciar funções e permissões
7. ✅ Interface admin para atribuir funções a usuários
8. ✅ Middleware para verificar permissões em tempo real
9. ✅ Dashboard do vendedor com faturas em aberto
10. ✅ Sistema de aprovações para descontos

---

**⚠️ IMPORTANTE:** Este documento deve ser atualizado sempre que:
- Novas funções forem criadas
- Novos módulos forem adicionados
- Matriz de permissões for alterada
- Novos níveis de acesso forem implementados
- Regras especiais forem modificadas

