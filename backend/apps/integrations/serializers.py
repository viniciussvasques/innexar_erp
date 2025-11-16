"""
Serializers for integrations
"""
from rest_framework import serializers
from .models import Integration, QuickBooksIntegration, IntegrationLog


class IntegrationSerializer(serializers.ModelSerializer):
    """Serializer for Integration model"""
    integration_type_display = serializers.CharField(
        source='get_integration_type_display',
        read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    
    class Meta:
        model = Integration
        fields = [
            'id', 'integration_type', 'integration_type_display',
            'name', 'status', 'status_display', 'config',
            'is_active', 'last_sync', 'last_error', 'error_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_sync']


class QuickBooksIntegrationSerializer(serializers.ModelSerializer):
    """Serializer for QuickBooks integration"""
    integration = IntegrationSerializer(read_only=True)
    integration_id = serializers.PrimaryKeyRelatedField(
        queryset=Integration.objects.filter(integration_type='quickbooks'),
        source='integration',
        write_only=True,
        required=False
    )
    sync_direction_display = serializers.CharField(
        source='get_sync_direction_display',
        read_only=True
    )
    is_token_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = QuickBooksIntegration
        fields = [
            'id', 'integration', 'integration_id',
            'realm_id', 'company_name', 'company_id',
            'sync_customers', 'sync_invoices', 'sync_payments',
            'sync_items', 'sync_employees',
            'sync_direction', 'sync_direction_display',
            'auto_sync_enabled', 'sync_interval_minutes',
            'is_token_expired', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at',
            'access_token', 'refresh_token', 'token_expires_at'
        ]


class QuickBooksOAuthSerializer(serializers.Serializer):
    """Serializer for QuickBooks OAuth callback"""
    code = serializers.CharField(required=True)
    realm_id = serializers.CharField(required=True)
    state = serializers.CharField(required=False)


class IntegrationLogSerializer(serializers.ModelSerializer):
    """Serializer for Integration Log"""
    log_type_display = serializers.CharField(
        source='get_log_type_display',
        read_only=True
    )
    integration_name = serializers.CharField(
        source='integration.name',
        read_only=True
    )
    
    class Meta:
        model = IntegrationLog
        fields = [
            'id', 'integration', 'integration_name',
            'log_type', 'log_type_display',
            'message', 'details', 'success', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

