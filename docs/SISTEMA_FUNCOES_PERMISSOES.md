# 👥 Sistema de Funções e Permissões - Innexar ERP

**Última atualização:** 2025-11-14  
**Versão:** 1.0.0

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Funções Empresariais](#funções-empresariais)
3. [Módulos do ERP](#módulos-do-erp)
4. [Matriz de Permissões](#matriz-de-permissões)
5. [Níveis de Acesso](#níveis-de-acesso)
6. [Implementação Técnica](#implementação-técnica)

---

## 🎯 Visão Geral

O sistema de funções e permissões do Innexar ERP permite controlar o acesso de usuários aos módulos e funcionalidades baseado em suas responsabilidades dentro da empresa. Cada usuário possui uma ou mais funções, e cada função tem permissões específicas para acessar módulos do ERP.

### Conceitos

- **Função (Role)**: Cargo ou responsabilidade dentro da empresa (ex: Gerente de Vendas, Contador, Operador de Estoque)
- **Módulo**: Área funcional do ERP (ex: CRM, Financeiro, Estoque)
- **Permissão**: Nível de acesso dentro de um módulo (Visualizar, Criar, Editar, Deletar, Administrar)
- **Usuário**: Pessoa que acessa o sistema, pode ter múltiplas funções

---

## 👔 Funções Empresariais

### Funções Administrativas

1. **Administrador Geral**
   - Acesso total ao sistema
   - Gerenciamento de usuários e funções
   - Configurações gerais da empresa

2. **Administrador de Sistema**
   - Configurações técnicas
   - Integrações e APIs
   - Backup e manutenção

### Funções Comerciais

3. **Diretor Comercial**
   - Visão completa do funil de vendas
   - Relatórios executivos
   - Gestão de equipe comercial

4. **Gerente de Vendas**
   - Gestão de equipe de vendas
   - Pipeline e metas
   - Relatórios de performance

5. **Vendedor**
   - Gestão de leads e oportunidades
   - Criação de propostas
   - Acompanhamento de clientes

6. **Analista de Marketing**
   - Gestão de campanhas
   - Análise de leads
   - Relatórios de conversão

### Funções Financeiras

7. **Diretor Financeiro**
   - Visão completa financeira
   - Aprovações de alto valor
   - Relatórios executivos

8. **Contador/Contabilista**
   - Lançamentos contábeis
   - Apuração de impostos
   - SPED e obrigações fiscais

9. **Analista Financeiro**
   - Contas a pagar/receber
   - Conciliação bancária
   - Fluxo de caixa

10. **Auxiliar Financeiro**
    - Lançamentos básicos
    - Emissão de boletos
    - Controle de documentos

### Funções de Operações

11. **Gerente de Estoque**
    - Gestão completa de estoque
    - Movimentações e ajustes
    - Relatórios de inventário

12. **Operador de Estoque**
    - Entrada e saída de produtos
    - Contagem física
    - Etiquetagem

13. **Gerente de Compras**
    - Gestão de fornecedores
    - Pedidos de compra
    - Negociação e cotações

14. **Comprador**
    - Criação de pedidos
    - Cotação de produtos
    - Acompanhamento de entregas

15. **Gerente de Produção**
    - Ordens de produção
    - Controle de qualidade
    - Planejamento de produção

16. **Operador de Produção**
    - Execução de ordens
    - Registro de produção
    - Controle de tempo

### Funções de Suporte

17. **Gerente de RH**
    - Gestão de funcionários
    - Folha de pagamento
    - Recrutamento

18. **Analista de RH**
    - Cadastro de funcionários
    - Controle de ponto
    - Benefícios

19. **Atendente de Suporte**
    - Atendimento a clientes
    - Chamados e tickets
    - Base de conhecimento

### Funções de Análise

20. **Analista de Dados**
    - Acesso a relatórios
    - Dashboards e BI
    - Exportação de dados

21. **Auditor**
    - Acesso somente leitura
    - Logs e auditoria
    - Relatórios de conformidade

---

## 📦 Módulos do ERP

### Módulos Principais

1. **CRM (Customer Relationship Management)**
   - Leads, Contatos, Oportunidades
   - Atividades e histórico
   - Pipeline de vendas

2. **Financeiro**
   - Contas a Pagar
   - Contas a Receber
   - Fluxo de Caixa
   - Conciliação Bancária

3. **Contábil**
   - Plano de Contas
   - Lançamentos Contábeis
   - Balanço e DRE
   - SPED Fiscal/Contábil

4. **Estoque**
   - Produtos e Categorias
   - Movimentações
   - Inventário
   - Ajustes

5. **Compras**
   - Fornecedores
   - Pedidos de Compra
   - Recebimento de Mercadorias
   - Cotações

6. **Vendas**
   - Pedidos de Venda
   - Propostas Comerciais
   - Orçamentos
   - Comissões

7. **Faturamento**
   - Notas Fiscais (NF-e, NFS-e)
   - Faturas
   - Boletos
   - Retenções

8. **Produção**
   - Ordens de Produção
   - Roteiros
   - Controle de Qualidade
   - Custo de Produção

9. **RH (Recursos Humanos)**
   - Funcionários
   - Folha de Pagamento
   - Controle de Ponto
   - Benefícios

10. **Projetos**
    - Gestão de Projetos
    - Tarefas e Atividades
    - Controle de Tempo
    - Orçamentos

11. **Relatórios e BI**
    - Dashboards
    - Relatórios Customizados
    - Exportação de Dados
    - Analytics

12. **Configurações**
    - Parâmetros do Sistema
    - Usuários e Funções
    - Integrações
    - Backup

---

## 🔐 Matriz de Permissões

### Legenda de Níveis

- **🔴 Nenhum Acesso** - Não pode acessar o módulo
- **🟡 Visualizar** - Apenas leitura
- **🟢 Criar** - Pode criar novos registros
- **🔵 Editar** - Pode editar registros existentes
- **🟣 Deletar** - Pode deletar registros
- **⚫ Administrar** - Acesso total ao módulo

### Matriz Completa

| Função | CRM | Financeiro | Contábil | Estoque | Compras | Vendas | Faturamento | Produção | RH | Projetos | Relatórios | Configurações |
|--------|-----|------------|----------|---------|---------|--------|-------------|----------|----|----------|------------|---------------|
| **Administrador Geral** | ⚫ | ⚫ | ⚫ | ⚫ | ⚫ | ⚫ | ⚫ | ⚫ | ⚫ | ⚫ | ⚫ | ⚫ |
| **Administrador de Sistema** | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | ⚫ | ⚫ |
| **Diretor Comercial** | ⚫ | 🟡 | 🟡 | 🟡 | 🔴 | ⚫ | 🟡 | 🔴 | 🔴 | 🟡 | ⚫ | 🔴 |
| **Gerente de Vendas** | ⚫ | 🟡 | 🔴 | 🟡 | 🔴 | ⚫ | 🟡 | 🔴 | 🔴 | 🟡 | 🟢 | 🔴 |
| **Vendedor** | 🟢 | 🔴 | 🔴 | 🟡 | 🔴 | 🟢 | 🔴 | 🔴 | 🔴 | 🟡 | 🟡 | 🔴 |
| **Analista de Marketing** | 🟢 | 🔴 | 🔴 | 🔴 | 🔴 | 🟡 | 🔴 | 🔴 | 🔴 | 🔴 | 🟢 | 🔴 |
| **Diretor Financeiro** | 🟡 | ⚫ | ⚫ | 🟡 | 🟡 | 🟡 | ⚫ | 🔴 | 🟡 | 🟡 | ⚫ | 🔴 |
| **Contador** | 🔴 | 🟢 | ⚫ | 🔴 | 🔴 | 🔴 | 🟢 | 🔴 | 🔴 | 🔴 | 🟢 | 🔴 |
| **Analista Financeiro** | 🔴 | 🟢 | 🟡 | 🟡 | 🟡 | 🟡 | 🟢 | 🔴 | 🔴 | 🟡 | 🟢 | 🔴 |
| **Auxiliar Financeiro** | 🔴 | 🟢 | 🔴 | 🔴 | 🔴 | 🔴 | 🟢 | 🔴 | 🔴 | 🔴 | 🟡 | 🔴 |
| **Gerente de Estoque** | 🔴 | 🟡 | 🔴 | ⚫ | 🟢 | 🟡 | 🟡 | 🟡 | 🔴 | 🔴 | 🟢 | 🔴 |
| **Operador de Estoque** | 🔴 | 🔴 | 🔴 | 🟢 | 🟡 | 🔴 | 🔴 | 🟡 | 🔴 | 🔴 | 🟡 | 🔴 |
| **Gerente de Compras** | 🔴 | 🟡 | 🔴 | 🟢 | ⚫ | 🔴 | 🟡 | 🟡 | 🔴 | 🔴 | 🟢 | 🔴 |
| **Comprador** | 🔴 | 🔴 | 🔴 | 🟡 | 🟢 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🟡 | 🔴 |
| **Gerente de Produção** | 🔴 | 🟡 | 🔴 | 🟢 | 🟡 | 🔴 | 🟡 | ⚫ | 🔴 | 🟡 | 🟢 | 🔴 |
| **Operador de Produção** | 🔴 | 🔴 | 🔴 | 🟡 | 🔴 | 🔴 | 🔴 | 🟢 | 🔴 | 🟡 | 🟡 | 🔴 |
| **Gerente de RH** | 🔴 | 🟡 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | ⚫ | 🔴 | 🟢 | 🔴 |
| **Analista de RH** | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🟢 | 🔴 | 🟡 | 🔴 |
| **Atendente de Suporte** | 🟢 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🟡 | 🔴 |
| **Analista de Dados** | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | ⚫ | 🔴 |
| **Auditor** | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🔴 |

---

## 📊 Níveis de Acesso Detalhados

### Por Módulo e Ação

#### CRM

| Ação | Vendedor | Gerente de Vendas | Diretor Comercial |
|------|----------|-------------------|-------------------|
| Visualizar Leads | ✅ Próprios | ✅ Todos | ✅ Todos |
| Criar Lead | ✅ | ✅ | ✅ |
| Editar Lead | ✅ Próprios | ✅ Todos | ✅ Todos |
| Deletar Lead | ❌ | ✅ | ✅ |
| Converter Lead | ✅ Próprios | ✅ Todos | ✅ Todos |
| Visualizar Pipeline | ✅ Próprio | ✅ Equipe | ✅ Completo |
| Relatórios | ✅ Próprios | ✅ Equipe | ✅ Todos |

#### Financeiro

| Ação | Auxiliar Financeiro | Analista Financeiro | Contador | Diretor Financeiro |
|------|---------------------|---------------------|----------|-------------------|
| Visualizar Contas | ✅ | ✅ | ✅ | ✅ |
| Criar Conta a Pagar | ✅ | ✅ | ✅ | ✅ |
| Criar Conta a Receber | ✅ | ✅ | ✅ | ✅ |
| Editar Conta | ✅ | ✅ | ✅ | ✅ |
| Deletar Conta | ❌ | ❌ | ✅ | ✅ |
| Aprovar Pagamento | ❌ | ✅ (até limite) | ✅ | ✅ (sem limite) |
| Conciliação Bancária | ✅ | ✅ | ✅ | ✅ |
| Relatórios | 🟡 Básicos | 🟢 Completos | 🟢 Completos | ⚫ Todos |

#### Estoque

| Ação | Operador | Gerente de Estoque |
|------|----------|-------------------|
| Visualizar Produtos | ✅ | ✅ |
| Criar Produto | ❌ | ✅ |
| Editar Produto | ❌ | ✅ |
| Deletar Produto | ❌ | ✅ |
| Entrada de Mercadoria | ✅ | ✅ |
| Saída de Mercadoria | ✅ | ✅ |
| Ajuste de Estoque | ❌ | ✅ |
| Inventário | ✅ | ✅ |
| Relatórios | 🟡 Básicos | ⚫ Completos |

---

## 🛠️ Implementação Técnica

### Modelos Django

```python
# apps/users/models.py

class Role(models.Model):
    """Função/Cargo dentro da empresa"""
    name = models.CharField(max_length=100, unique=True)
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
    code = models.CharField(max_length=50, unique=True)  # crm, financeiro, estoque
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


# Uso nas views
from apps.users.permissions import HasModulePermission

class LeadViewSet(viewsets.ModelViewSet):
    permission_classes = [
        IsAuthenticated,
        HasModulePermission('crm', 'view')
    ]
    
    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated(), HasModulePermission('crm', 'create')]
        elif self.action in ['update', 'partial_update']:
            return [IsAuthenticated(), HasModulePermission('crm', 'edit')]
        elif self.action == 'destroy':
            return [IsAuthenticated(), HasModulePermission('crm', 'delete')]
        return super().get_permissions()
```

### Seed de Dados Inicial

```python
# apps/users/management/commands/seed_roles.py

from django.core.management.base import BaseCommand
from apps.users.models import Role, Module, Permission

ROLES_AND_PERMISSIONS = {
    'Administrador Geral': {
        'crm': 'admin',
        'financeiro': 'admin',
        'contabil': 'admin',
        'estoque': 'admin',
        'compras': 'admin',
        'vendas': 'admin',
        'faturamento': 'admin',
        'producao': 'admin',
        'rh': 'admin',
        'projetos': 'admin',
        'relatorios': 'admin',
        'configuracoes': 'admin',
    },
    'Vendedor': {
        'crm': 'create',
        'vendas': 'create',
        'relatorios': 'view',
    },
    'Contador': {
        'financeiro': 'create',
        'contabil': 'admin',
        'faturamento': 'create',
        'relatorios': 'create',
    },
    # ... outras funções
}

MODULES = [
    {'code': 'crm', 'name': 'CRM', 'order': 1},
    {'code': 'financeiro', 'name': 'Financeiro', 'order': 2},
    {'code': 'contabil', 'name': 'Contábil', 'order': 3},
    # ... outros módulos
]

class Command(BaseCommand):
    help = 'Cria funções, módulos e permissões iniciais'
    
    def handle(self, *args, **options):
        # Criar módulos
        for mod_data in MODULES:
            Module.objects.get_or_create(
                code=mod_data['code'],
                defaults=mod_data
            )
        
        # Criar funções e permissões
        for role_name, permissions in ROLES_AND_PERMISSIONS.items():
            role, _ = Role.objects.get_or_create(name=role_name)
            
            for module_code, level in permissions.items():
                try:
                    module = Module.objects.get(code=module_code)
                    Permission.objects.get_or_create(
                        role=role,
                        module=module,
                        defaults={'level': level}
                    )
                except Module.DoesNotExist:
                    self.stdout.write(
                        self.style.WARNING(f'Módulo {module_code} não encontrado')
                    )
        
        self.stdout.write(
            self.style.SUCCESS('Funções e permissões criadas com sucesso!')
        )
```

---

## 📝 Próximos Passos

1. ✅ Criar modelos Role, Module, Permission
2. ✅ Adicionar relacionamento User -> Roles
3. ✅ Implementar sistema de verificação de permissões
4. ✅ Criar command de seed de dados
5. ✅ Adicionar permissões nas views existentes
6. ✅ Criar API para gerenciar funções e permissões
7. ✅ Interface admin para atribuir funções a usuários
8. ✅ Middleware para verificar permissões em tempo real

---

**⚠️ IMPORTANTE:** Este documento deve ser atualizado sempre que:
- Novas funções forem criadas
- Novos módulos forem adicionados
- Matriz de permissões for alterada
- Novos níveis de acesso forem implementados

