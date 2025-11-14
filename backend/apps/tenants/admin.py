from django.contrib import admin
from django.utils.html import format_html
from django_tenants.admin import TenantAdminMixin
from .models import Tenant, Domain


class DomainInline(admin.TabularInline):
    model = Domain
    extra = 1
    fields = ['domain', 'is_primary']


@admin.register(Tenant)
class TenantAdmin(TenantAdminMixin, admin.ModelAdmin):
    list_display = ['tenant_info', 'plan_badge', 'status_badge', 'domain_list', 'created_on']
    list_filter = ['plan', 'is_active', 'created_on']
    search_fields = ['name', 'schema_name']
    readonly_fields = ['created_on', 'schema_name']
    list_per_page = 25
    date_hierarchy = 'created_on'
    inlines = [DomainInline]
    
    fieldsets = (
        ('🏢 Informações da Empresa', {
            'fields': ('name', 'schema_name')
        }),
        ('💼 Plano & Status', {
            'fields': ('plan', 'is_active'),
            'classes': ('wide',)
        }),
        ('📅 Datas', {
            'fields': ('created_on',),
            'classes': ('collapse',)
        }),
    )
    
    def tenant_info(self, obj):
        return format_html('<div><strong>{}</strong><br><small style="color:#6c757d;">Schema: {}</small></div>', 
                         obj.name, obj.schema_name)
    tenant_info.short_description = 'Tenant'
    tenant_info.admin_order_field = 'name'
    
    def plan_badge(self, obj):
        colors = {
            'trial': '#6c757d',
            'basic': '#17a2b8',
            'professional': '#007bff',
            'enterprise': '#6f42c1'
        }
        color = colors.get(obj.plan, '#6c757d')
        return format_html('<span style="background:{};color:white;padding:4px 12px;border-radius:12px;font-size:11px;text-transform:uppercase;font-weight:600;">{}</span>', 
                         color, obj.plan)
    plan_badge.short_description = 'Plano'
    plan_badge.admin_order_field = 'plan'
    
    def status_badge(self, obj):
        if obj.is_active:
            return format_html('<span style="background:#28a745;color:white;padding:4px 12px;border-radius:12px;font-size:11px;">✓ Ativo</span>')
        return format_html('<span style="background:#dc3545;color:white;padding:4px 12px;border-radius:12px;font-size:11px;">✗ Inativo</span>')
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'is_active'
    
    def domain_list(self, obj):
        domains = obj.domains.all()
        if domains:
            html = '<br>'.join([
                '<span style="background:#f8f9fa;padding:2px 8px;border-radius:4px;font-size:11px;margin-right:4px;">{}</span>'.format(d.domain) +
                (' <span style="color:#28a745;">★</span>' if d.is_primary else '')
                for d in domains
            ])
            return format_html(html)
        return '-'
    domain_list.short_description = 'Domínios'


@admin.register(Domain)
class DomainAdmin(admin.ModelAdmin):
    list_display = ['domain', 'tenant_name', 'primary_badge']
    list_filter = ['is_primary', 'tenant']
    search_fields = ['domain', 'tenant__name']
    list_per_page = 25
    
    def tenant_name(self, obj):
        return obj.tenant.name
    tenant_name.short_description = 'Tenant'
    tenant_name.admin_order_field = 'tenant__name'
    
    def primary_badge(self, obj):
        if obj.is_primary:
            return format_html('<span style="background:#ffc107;color:#000;padding:3px 10px;border-radius:12px;font-size:11px;">★ Principal</span>')
        return format_html('<span style="background:#e9ecef;color:#6c757d;padding:3px 10px;border-radius:12px;font-size:11px;">Secundário</span>')
    primary_badge.short_description = 'Tipo'
    primary_badge.admin_order_field = 'is_primary'
