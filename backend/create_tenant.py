from apps.tenants.models import Tenant, Domain

# Create tenant
tenant = Tenant.objects.create(
    name="ACME Corp",
    schema_name="acme",
    plan="professional"
)

# Create domain
Domain.objects.create(
    domain="acme.localhost",
    tenant=tenant,
    is_primary=True
)

print(f"✓ Tenant created: {tenant.name} (schema: {tenant.schema_name})")
print(f"✓ Domain created: acme.localhost")
