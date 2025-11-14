from apps.tenants.models import Tenant, Domain

# Criar tenant público (obrigatório para django-tenants)
public_tenant, created = Tenant.objects.get_or_create(
    schema_name='public',
    defaults={
        'name': 'Innexar Public',
        'plan': 'public'
    }
)

if created:
    print(f"✓ Tenant público criado: {public_tenant.name}")
else:
    print(f"✓ Tenant público já existe: {public_tenant.name}")

# Criar domain para localhost
domain, created = Domain.objects.get_or_create(
    domain='localhost',
    defaults={
        'tenant': public_tenant,
        'is_primary': True
    }
)

if created:
    print(f"✓ Domain criado: localhost")
else:
    print(f"✓ Domain já existe: localhost")

# Listar todos os tenants
print("\n=== Tenants cadastrados ===")
for t in Tenant.objects.all():
    print(f"  {t.name} (schema: {t.schema_name})")
    for d in t.domains.all():
        print(f"    → {d.domain}")
