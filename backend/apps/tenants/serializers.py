from rest_framework import serializers
from .models import Tenant, Domain


class TenantSerializer(serializers.ModelSerializer):
    domain = serializers.CharField(write_only=True)
    
    class Meta:
        model = Tenant
        fields = ['id', 'name', 'schema_name', 'plan', 'is_active', 'domain', 'created_on']
        read_only_fields = ['id', 'schema_name', 'created_on']
    
    def create(self, validated_data):
        domain_name = validated_data.pop('domain')
        
        # Create tenant with auto-generated schema name
        tenant = Tenant.objects.create(**validated_data)
        
        # Create domain
        Domain.objects.create(
            domain=f"{domain_name}.innexar.com",
            tenant=tenant,
            is_primary=True
        )
        
        return tenant


class DomainSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    
    class Meta:
        model = Domain
        fields = ['id', 'domain', 'tenant', 'tenant_name', 'is_primary']
        read_only_fields = ['id']
