#!/usr/bin/env python
"""
Script para criar tenant e usuário de teste
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.tenants.models import Tenant, Domain
from apps.users.models import User, Role
from django_tenants.utils import schema_context

print("=" * 60)
print("CRIANDO TENANT E USUÁRIO DE TESTE")
print("=" * 60)

# 1. Criar Tenant
tenant_name = "Test Company"
schema_name = "testcompany"

try:
    tenant = Tenant.objects.get(schema_name=schema_name)
    print(f"⚠️  Tenant '{tenant_name}' já existe (schema: {schema_name})")
except Tenant.DoesNotExist:
    tenant = Tenant.objects.create(
        name=tenant_name,
        schema_name=schema_name,
        plan='professional',
        max_users=50,
        max_storage_mb=10000,
        is_active=True
    )
    print(f"✅ Tenant criado: {tenant.name} (schema: {schema_name})")
    
    # Criar domínio
    domain, created = Domain.objects.get_or_create(
        domain=f"{schema_name}.localhost",
        tenant=tenant,
        is_primary=True
    )
    if created:
        print(f"✅ Domínio criado: {domain.domain}")

# 2. Criar usuário no schema tenant
with schema_context(schema_name):
    email = "admin@testcompany.com"
    password = "admin123"
    
    try:
        user = User.objects.get(email=email)
        print(f"⚠️  Usuário '{email}' já existe")
        # Atualizar senha
        user.set_password(password)
        user.is_staff = True
        user.is_active = True
        user.save()
        print(f"✅ Senha atualizada para: {password}")
    except User.DoesNotExist:
        # Usar username único baseado no email
        username = f"admin_testcompany_{schema_name}"
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name="Admin",
            last_name="Test",
            is_staff=True,
            is_active=True
        )
        print(f"✅ Usuário criado: {email}")
        print(f"   Senha: {password}")
    
    # Atribuir role de admin
    try:
        admin_role = Role.objects.get(code='admin')
        user.roles.add(admin_role)
        print(f"✅ Role 'Administrator' atribuída ao usuário")
    except Role.DoesNotExist:
        print("⚠️  Role 'admin' não encontrada. Execute: python manage.py seed_roles_and_modules")
    
    # Criar usuário vendedor de teste
    seller_email = "seller@testcompany.com"
    seller_password = "seller123"
    
    try:
        seller = User.objects.get(email=seller_email)
        print(f"⚠️  Usuário vendedor '{seller_email}' já existe")
        seller.set_password(seller_password)
        seller.discount_limit_percent = 10.00
        seller.save()
        print(f"✅ Senha do vendedor atualizada para: {seller_password}")
    except User.DoesNotExist:
        # Usar username único baseado no email
        seller_username = f"seller_testcompany_{schema_name}"
        seller = User.objects.create_user(
            username=seller_username,
            email=seller_email,
            password=seller_password,
            first_name="Seller",
            last_name="Test",
            is_staff=False,
            is_active=True,
            discount_limit_percent=10.00  # Limite de 10% para vendedor
        )
        print(f"✅ Usuário vendedor criado: {seller_email}")
        print(f"   Senha: {seller_password}")
        print(f"   Limite de desconto: {seller.discount_limit_percent}%")
        
        # Atribuir role de vendedor
        try:
            seller_role = Role.objects.get(code='seller')
            seller.roles.add(seller_role)
            print(f"✅ Role 'Seller' atribuída ao vendedor")
        except Role.DoesNotExist:
            print("⚠️  Role 'seller' não encontrada")

print("\n" + "=" * 60)
print("DADOS DE ACESSO")
print("=" * 60)
print(f"\n🌐 URL do Tenant:")
print(f"   http://{schema_name}.localhost:8000")
print(f"\n👤 Usuário Admin:")
print(f"   Email: {email}")
print(f"   Senha: {password}")
print(f"\n👤 Usuário Vendedor:")
print(f"   Email: {seller_email}")
print(f"   Senha: {seller_password}")
print(f"\n📝 Nota: Use o subdomínio '{schema_name}.localhost' para acessar o tenant")
print("=" * 60)

