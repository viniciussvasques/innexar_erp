#!/usr/bin/env python
"""
Script para verificar dados de teste
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.tenants.models import Tenant
from django_tenants.utils import schema_context
from apps.users.models import User, Role

print("=" * 60)
print("VERIFICANDO DADOS DE TESTE")
print("=" * 60)

# Verificar tenant
try:
    tenant = Tenant.objects.get(schema_name='testcompany')
    print(f"\n✅ Tenant encontrado:")
    print(f"   Nome: {tenant.name}")
    print(f"   Schema: {tenant.schema_name}")
    print(f"   Ativo: {tenant.is_active}")
    
    # Verificar usuários no tenant
    with schema_context(tenant.schema_name):
        users = User.objects.all()
        print(f"\n✅ Usuários no tenant ({users.count()}):")
        for u in users:
            roles = [r.name for r in u.roles.all()]
            print(f"   - {u.email}")
            print(f"     Nome: {u.get_full_name()}")
            print(f"     Staff: {u.is_staff}")
            print(f"     Ativo: {u.is_active}")
            print(f"     Roles: {roles if roles else 'Nenhuma'}")
            if hasattr(u, 'discount_limit_percent'):
                print(f"     Limite desconto: {u.discount_limit_percent}%")
            print()
        
        # Verificar roles disponíveis
        roles = Role.objects.all()
        print(f"✅ Roles disponíveis ({roles.count()}):")
        for r in roles[:5]:
            print(f"   - {r.code}: {r.name}")
        
except Tenant.DoesNotExist:
    print("\n❌ Tenant 'testcompany' não encontrado!")
    print("   Execute: python create_test_data.py")

print("\n" + "=" * 60)

