"""
User models and authentication
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import Q
from django.utils.translation import gettext_lazy as _


class Role(models.Model):
    """Função/Cargo dentro da empresa"""
    
    name = models.CharField(max_length=100, unique=True, verbose_name=_('Name'))
    code = models.CharField(max_length=50, unique=True, verbose_name=_('Code'), help_text=_('Unique code for the role (e.g., seller, picker)'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    is_active = models.BooleanField(default=True, verbose_name=_('Active'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created at'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated at'))
    
    class Meta:
        db_table = 'users_role'
        verbose_name = _('Role')
        verbose_name_plural = _('Roles')
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Module(models.Model):
    """Módulo do ERP"""
    
    code = models.CharField(max_length=50, unique=True, verbose_name=_('Code'), help_text=_('Module code (e.g., sales, inventory, logistics)'))
    name = models.CharField(max_length=100, verbose_name=_('Name'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    icon = models.CharField(max_length=50, blank=True, verbose_name=_('Icon'))
    order = models.IntegerField(default=0, verbose_name=_('Order'))
    is_active = models.BooleanField(default=True, verbose_name=_('Active'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created at'))
    
    class Meta:
        db_table = 'users_module'
        verbose_name = _('Module')
        verbose_name_plural = _('Modules')
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name


class Permission(models.Model):
    """Permissão de acesso a módulo"""
    
    PERMISSION_LEVELS = [
        ('none', _('No Access')),
        ('view', _('View')),
        ('create', _('Create')),
        ('edit', _('Edit')),
        ('delete', _('Delete')),
        ('admin', _('Admin')),
    ]
    
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='permissions', verbose_name=_('Role'))
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='permissions', verbose_name=_('Module'))
    level = models.CharField(max_length=20, choices=PERMISSION_LEVELS, default='none', verbose_name=_('Level'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created at'))
    
    class Meta:
        db_table = 'users_permission'
        unique_together = ['role', 'module']
        verbose_name = _('Permission')
        verbose_name_plural = _('Permissions')
    
    def __str__(self):
        return f"{self.role.name} - {self.module.name}: {self.get_level_display()}"


class User(AbstractUser):
    """
    Custom User model
    Extends Django's AbstractUser with tenant-specific fields, roles and permissions
    """
    # Override email to be unique and required
    email = models.EmailField(unique=True, verbose_name=_('Email'))
    
    # Additional fields
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name=_('Phone'))
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, verbose_name=_('Avatar'))
    
    # Tenant association (for users in public schema)
    # Note: In tenant schemas, users are isolated by schema
    default_tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users',
        verbose_name=_('Default Tenant')
    )
    
    # Roles and Permissions
    roles = models.ManyToManyField(
        Role,
        related_name='users',
        blank=True,
        verbose_name=_('Roles')
    )
    
    # Fields for sellers (vendedores)
    # TODO: Uncomment when warehouse and sales modules are created
    # assigned_warehouse = models.ForeignKey(
    #     'warehouse.Warehouse',
    #     on_delete=models.SET_NULL,
    #     null=True,
    #     blank=True,
    #     related_name='assigned_users',
    #     verbose_name=_('Assigned Warehouse'),
    #     help_text=_('Primary warehouse assigned to this user')
    # )
    
    # allowed_warehouses = models.ManyToManyField(
    #     'warehouse.Warehouse',
    #     related_name='allowed_users',
    #     blank=True,
    #     verbose_name=_('Allowed Warehouses'),
    #     help_text=_('Additional warehouses this user can access')
    # )
    
    discount_limit_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=5.00,
        verbose_name=_('Discount Limit (%)'),
        help_text=_('Maximum discount percentage this user can apply')
    )
    
    # client_portfolio = models.ManyToManyField(
    #     'sales.Customer',
    #     related_name='assigned_sellers',
    #     blank=True,
    #     verbose_name=_('Client Portfolio'),
    #     help_text=_('Customers assigned to this seller')
    # )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created at'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated at'))
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  # username still required for createsuperuser
    
    class Meta:
        db_table = 'users_user'
        verbose_name = _('User')
        verbose_name_plural = _('Users')
    
    def __str__(self):
        return self.email
    
    def has_module_permission(self, module_code, required_level='view'):
        """
        Verifica se usuário tem permissão no módulo
        
        Args:
            module_code: Código do módulo (ex: 'sales', 'inventory')
            required_level: Nível mínimo necessário ('view', 'create', 'edit', 'delete', 'admin')
        
        Returns:
            bool: True se tem permissão, False caso contrário
        """
        level_hierarchy = {
            'none': 0,
            'view': 1,
            'create': 2,
            'edit': 3,
            'delete': 4,
            'admin': 5,
        }
        
        required = level_hierarchy.get(required_level, 0)
        
        # Superuser tem todas as permissões
        if self.is_superuser:
            return True
        
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
        """
        Verifica se pode aplicar desconto
        
        Args:
            discount_percent: Percentual de desconto a aplicar
        
        Returns:
            bool: True se pode aplicar, False caso contrário
        """
        return discount_percent <= self.discount_limit_percent
    
    def get_accessible_warehouses(self):
        """
        Retorna warehouses que o usuário pode acessar
        
        Returns:
            QuerySet: Warehouses acessíveis
        """
        # TODO: Implement when warehouse module is created
        try:
            from warehouse.models import Warehouse
            
            warehouses = Warehouse.objects.none()
            
            # if self.assigned_warehouse:
            #     warehouses = Warehouse.objects.filter(id=self.assigned_warehouse.id)
            
            # warehouses = warehouses | self.allowed_warehouses.all()
            
            return warehouses.distinct()
        except ImportError:
            # Warehouse module not yet created
            from django.db.models import QuerySet
            return QuerySet().none()
