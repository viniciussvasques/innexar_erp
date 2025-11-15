#!/usr/bin/env python
"""
Script de teste para validar implementação de Roles/Permissions e HR
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django_tenants.utils import schema_context
from apps.users.models import User, Role, Module, Permission
from apps.hr.models import Department, Company, Employee

print("=" * 60)
print("TESTE DE IMPLEMENTAÇÃO - Roles/Permissions + HR")
print("=" * 60)

# Testar no schema public (shared)
print("\n1. TESTANDO NO SCHEMA PUBLIC (SHARED)")
print("-" * 60)

try:
    roles_count = Role.objects.count()
    modules_count = Module.objects.count()
    permissions_count = Permission.objects.count()
    
    print(f"✅ Roles: {roles_count}")
    print(f"✅ Modules: {modules_count}")
    print(f"✅ Permissions: {permissions_count}")
    
    if roles_count > 0:
        admin_role = Role.objects.get(code='admin')
        print(f"✅ Role 'admin' encontrada: {admin_role.name}")
        print(f"   Permissões: {admin_role.permissions.count()}")
    
    if modules_count > 0:
        modules = Module.objects.all()[:5]
        print(f"✅ Módulos encontrados (primeiros 5):")
        for m in modules:
            print(f"   - {m.code}: {m.name}")
    
except Exception as e:
    print(f"❌ Erro no schema public: {e}")

# Testar no schema tenant (se existir)
print("\n2. TESTANDO NO SCHEMA TENANT")
print("-" * 60)

try:
    from apps.tenants.models import Tenant
    tenants = Tenant.objects.exclude(schema_name='public')
    
    if tenants.exists():
        tenant = tenants.first()
        print(f"✅ Tenant encontrado: {tenant.name} (schema: {tenant.schema_name})")
        
        with schema_context(tenant.schema_name):
            dept_count = Department.objects.count()
            company_count = Company.objects.count()
            employee_count = Employee.objects.count()
            
            print(f"✅ Departments: {dept_count}")
            print(f"✅ Companies: {company_count}")
            print(f"✅ Employees: {employee_count}")
            
            # Testar permissões de usuário
            users = User.objects.all()
            if users.exists():
                user = users.first()
                print(f"\n✅ Usuário encontrado: {user.email}")
                
                # Adicionar role admin se não tiver
                if not user.roles.exists():
                    admin_role = Role.objects.get(code='admin')
                    user.roles.add(admin_role)
                    print(f"   Role 'admin' adicionada")
                
                print(f"   Roles: {[r.name for r in user.roles.all()]}")
                print(f"   Has sales admin: {user.has_module_permission('sales', 'admin')}")
                print(f"   Can apply 10% discount: {user.can_apply_discount(10.0)}")
    else:
        print("⚠️  Nenhum tenant encontrado (normal se ainda não criou)")
        
except Exception as e:
    print(f"❌ Erro no schema tenant: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("TESTE CONCLUÍDO")
print("=" * 60)

