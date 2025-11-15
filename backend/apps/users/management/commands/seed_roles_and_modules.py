"""
Management command to seed default roles and modules
"""
from django.core.management.base import BaseCommand
from django.utils.translation import gettext_lazy as _
from apps.users.models import Role, Module, Permission


class Command(BaseCommand):
    help = 'Seed default roles and modules'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Creating modules...'))
        
        # Create Modules
        modules_data = [
            {'code': 'users', 'name': _('Users & Auth'), 'order': 1, 'icon': 'users'},
            {'code': 'crm', 'name': _('CRM'), 'order': 2, 'icon': 'briefcase'},
            {'code': 'sales', 'name': _('Sales'), 'order': 3, 'icon': 'shopping-cart'},
            {'code': 'warehouse', 'name': _('Warehouse'), 'order': 4, 'icon': 'warehouse'},
            {'code': 'logistics', 'name': _('Logistics'), 'order': 5, 'icon': 'truck'},
            {'code': 'invoicing', 'name': _('Invoicing'), 'order': 6, 'icon': 'file-invoice-dollar'},
            {'code': 'hr', 'name': _('Human Resources'), 'order': 7, 'icon': 'users-cog'},
            {'code': 'products', 'name': _('Products'), 'order': 8, 'icon': 'box'},
            {'code': 'pricing', 'name': _('Pricing'), 'order': 9, 'icon': 'dollar-sign'},
            {'code': 'customer_portal', 'name': _('Customer Portal'), 'order': 10, 'icon': 'globe'},
        ]
        
        modules = {}
        for data in modules_data:
            module, created = Module.objects.get_or_create(
                code=data['code'],
                defaults=data
            )
            modules[data['code']] = module
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created module: {module.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'  - Module already exists: {module.name}'))
        
        self.stdout.write(self.style.SUCCESS('\nCreating roles...'))
        
        # Create Roles
        roles_data = [
            {
                'name': _('Administrator'),
                'code': 'admin',
                'description': _('Full system access'),
                'permissions': {code: 'admin' for code in modules.keys()}
            },
            {
                'name': _('Sales Manager'),
                'code': 'sales_manager',
                'description': _('Manages sales team and operations'),
                'permissions': {
                    'users': 'view',
                    'crm': 'admin',
                    'sales': 'admin',
                    'warehouse': 'view',
                    'logistics': 'view',
                    'invoicing': 'view',
                    'hr': 'view',
                    'products': 'view',
                    'pricing': 'admin',
                }
            },
            {
                'name': _('Seller'),
                'code': 'seller',
                'description': _('Sales representative'),
                'permissions': {
                    'users': 'view',
                    'crm': 'create',
                    'sales': 'create',
                    'warehouse': 'view',
                    'products': 'view',
                    'pricing': 'view',
                }
            },
            {
                'name': _('Warehouse Manager'),
                'code': 'warehouse_manager',
                'description': _('Manages warehouse operations'),
                'permissions': {
                    'users': 'view',
                    'warehouse': 'admin',
                    'logistics': 'admin',
                    'products': 'admin',
                }
            },
            {
                'name': _('Picker'),
                'code': 'picker',
                'description': _('Warehouse picking operator'),
                'permissions': {
                    'warehouse': 'view',
                    'logistics': 'create',
                    'products': 'view',
                }
            },
            {
                'name': _('Financial Analyst'),
                'code': 'financial_analyst',
                'description': _('Manages invoicing and payments'),
                'permissions': {
                    'users': 'view',
                    'sales': 'view',
                    'invoicing': 'admin',
                }
            },
            {
                'name': _('HR Manager'),
                'code': 'hr_manager',
                'description': _('Manages human resources'),
                'permissions': {
                    'users': 'view',
                    'hr': 'admin',
                }
            },
        ]
        
        roles = {}
        for data in roles_data:
            role, created = Role.objects.get_or_create(
                code=data['code'],
                defaults={
                    'name': data['name'],
                    'description': data['description']
                }
            )
            roles[data['code']] = role
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created role: {role.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'  - Role already exists: {role.name}'))
            
            # Create permissions for this role
            for module_code, level in data['permissions'].items():
                if module_code in modules:
                    permission, perm_created = Permission.objects.get_or_create(
                        role=role,
                        module=modules[module_code],
                        defaults={'level': level}
                    )
                    if perm_created:
                        self.stdout.write(self.style.SUCCESS(
                            f'    ✓ Permission: {role.name} -> {modules[module_code].name} ({level})'
                        ))
        
        self.stdout.write(self.style.SUCCESS('\n✅ Seed completed successfully!'))

