from django.contrib import admin
from .models import Integration, QuickBooksIntegration, IntegrationLog


@admin.register(Integration)
class IntegrationAdmin(admin.ModelAdmin):
    list_display = ['name', 'integration_type', 'status', 'is_active', 'last_sync', 'created_at']
    list_filter = ['integration_type', 'status', 'is_active']
    search_fields = ['name', 'integration_type']
    readonly_fields = ['created_at', 'updated_at', 'last_sync']


@admin.register(QuickBooksIntegration)
class QuickBooksIntegrationAdmin(admin.ModelAdmin):
    list_display = ['company_name', 'realm_id', 'auto_sync_enabled', 'sync_direction', 'created_at']
    list_filter = ['auto_sync_enabled', 'sync_direction']
    search_fields = ['company_name', 'realm_id']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(IntegrationLog)
class IntegrationLogAdmin(admin.ModelAdmin):
    list_display = ['integration', 'log_type', 'success', 'message', 'created_at']
    list_filter = ['log_type', 'success', 'created_at']
    search_fields = ['message', 'integration__name']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'

