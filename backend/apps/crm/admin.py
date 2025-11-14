"""
CRM admin configuration
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import Lead, Contact, Deal, Activity


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'status_badge', 'source_badge', 'score_bar', 'owner', 'created_at']
    list_filter = ['status', 'source', 'created_at']
    search_fields = ['name', 'email', 'company', 'phone']
    ordering = ['-created_at']
    list_per_page = 25
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('👤 Informações do Lead', {
            'fields': ('name', 'email', 'phone', 'company', 'position')
        }),
        ('📊 Status & Qualificação', {
            'fields': ('status', 'source', 'score'),
            'classes': ('wide',)
        }),
        ('📝 Detalhes', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        ('👥 Responsável', {
            'fields': ('owner',)
        }),
    )
    
    def status_badge(self, obj):
        colors = {
            'new': '#17a2b8',
            'contacted': '#ffc107',
            'qualified': '#007bff',
            'converted': '#28a745',
            'lost': '#dc3545'
        }
        color = colors.get(obj.status, '#6c757d')
        labels = {
            'new': 'Novo',
            'contacted': 'Contatado',
            'qualified': 'Qualificado',
            'converted': 'Convertido',
            'lost': 'Perdido'
        }
        return format_html('<span style="background:{};color:white;padding:4px 12px;border-radius:12px;font-size:11px;font-weight:600;">{}</span>', 
                         color, labels.get(obj.status, obj.status))
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'status'
    
    def source_badge(self, obj):
        if obj.source:
            return format_html('<span style="background:#e9ecef;color:#495057;padding:3px 10px;border-radius:8px;font-size:10px;">{}</span>', obj.source)
        return '-'
    source_badge.short_description = 'Origem'
    source_badge.admin_order_field = 'source'
    
    def score_bar(self, obj):
        if obj.score is not None:
            color = '#dc3545' if obj.score < 30 else '#ffc107' if obj.score < 70 else '#28a745'
            return format_html(
                '<div style="width:100px;background:#e9ecef;border-radius:10px;overflow:hidden;">'
                '<div style="width:{}%;background:{};height:16px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:bold;">{}</div>'
                '</div>',
                obj.score, color, obj.score
            )
        return '-'
    score_bar.short_description = 'Score'
    score_bar.admin_order_field = 'score'


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'company', 'phone', 'customer_badge', 'owner', 'created_at']
    list_filter = ['is_customer', 'created_at']
    search_fields = ['name', 'email', 'company', 'phone']
    ordering = ['-created_at']
    list_per_page = 25
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('👤 Informações do Contato', {
            'fields': ('name', 'email', 'phone', 'mobile', 'company', 'position')
        }),
        ('📍 Endereço', {
            'fields': ('address', 'city', 'state', 'country', 'zip_code'),
            'classes': ('collapse',)
        }),
        ('🌐 Redes Sociais', {
            'fields': ('linkedin', 'twitter'),
            'classes': ('collapse',)
        }),
        ('🏷️ Classificação', {
            'fields': ('is_customer', 'tags'),
            'classes': ('wide',)
        }),
        ('📝 Detalhes', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        ('👥 Responsável', {
            'fields': ('owner',)
        }),
    )
    
    def customer_badge(self, obj):
        if obj.is_customer:
            return format_html('<span style="background:#28a745;color:white;padding:3px 10px;border-radius:12px;font-size:11px;">✓ Cliente</span>')
        return format_html('<span style="background:#6c757d;color:white;padding:3px 10px;border-radius:12px;font-size:11px;">Prospect</span>')
    customer_badge.short_description = 'Status'
    customer_badge.admin_order_field = 'is_customer'


@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    list_display = ['title', 'contact_link', 'value_formatted', 'stage_badge', 'probability_bar', 'owner', 'expected_close_date']
    list_filter = ['stage', 'expected_close_date']
    search_fields = ['title', 'contact__name', 'contact__company']
    ordering = ['-expected_close_date']
    list_per_page = 25
    date_hierarchy = 'expected_close_date'
    
    fieldsets = (
        ('💼 Informações do Negócio', {
            'fields': ('title', 'description', 'contact')
        }),
        ('💰 Financeiro', {
            'fields': ('amount', 'currency', 'probability'),
            'classes': ('wide',)
        }),
        ('📊 Pipeline', {
            'fields': ('stage',),
            'classes': ('wide',)
        }),
        ('📅 Datas', {
            'fields': ('expected_close_date', 'actual_close_date'),
        }),
        ('👥 Responsável', {
            'fields': ('owner',)
        }),
    )
    
    def contact_link(self, obj):
        if obj.contact:
            return format_html('<strong>{}</strong><br><small style="color:#6c757d;">{}</small>', 
                             obj.contact.name, obj.contact.company or 'Sem empresa')
        return '-'
    contact_link.short_description = 'Contato'
    contact_link.admin_order_field = 'contact__name'
    
    def value_formatted(self, obj):
        if obj.amount:
            return format_html('<strong style="color:#28a745;">R$ {:,.2f}</strong>', obj.amount)
        return '-'
    value_formatted.short_description = 'Valor'
    value_formatted.admin_order_field = 'amount'
    
    def stage_badge(self, obj):
        colors = {
            'prospecting': '#17a2b8',
            'qualification': '#ffc107',
            'proposal': '#007bff',
            'negotiation': '#6f42c1',
            'closed_won': '#28a745',
            'closed_lost': '#dc3545'
        }
        color = colors.get(obj.stage, '#6c757d')
        labels = {
            'prospecting': 'Prospecção',
            'qualification': 'Qualificação',
            'proposal': 'Proposta',
            'negotiation': 'Negociação',
            'closed_won': 'Ganho',
            'closed_lost': 'Perdido'
        }
        return format_html('<span style="background:{};color:white;padding:4px 12px;border-radius:12px;font-size:11px;font-weight:600;">{}</span>', 
                         color, labels.get(obj.stage, obj.stage))
    stage_badge.short_description = 'Etapa'
    stage_badge.admin_order_field = 'stage'
    
    def probability_bar(self, obj):
        if obj.probability is not None:
            color = '#dc3545' if obj.probability < 30 else '#ffc107' if obj.probability < 70 else '#28a745'
            return format_html(
                '<div style="width:100px;background:#e9ecef;border-radius:10px;overflow:hidden;">'
                '<div style="width:{}%;background:{};height:16px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:bold;">{}%</div>'
                '</div>',
                obj.probability, color, obj.probability
            )
        return '-'
    probability_bar.short_description = 'Probabilidade'
    probability_bar.admin_order_field = 'probability'


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ['subject', 'type_badge', 'related_to', 'status_badge', 'scheduled_at', 'owner']
    list_filter = ['activity_type', 'status', 'scheduled_at']
    search_fields = ['subject', 'description']
    ordering = ['-scheduled_at']
    list_per_page = 25
    date_hierarchy = 'scheduled_at'
    
    fieldsets = (
        ('📋 Informações da Atividade', {
            'fields': ('subject', 'activity_type', 'description', 'status')
        }),
        ('🎯 Relacionamento', {
            'fields': ('lead', 'contact', 'deal'),
            'description': 'Relacione a atividade com um Lead, Contato ou Negócio'
        }),
        ('📅 Agendamento', {
            'fields': ('scheduled_at', 'completed_at'),
            'classes': ('wide',)
        }),
        ('👥 Responsável', {
            'fields': ('owner',)
        }),
    )
    
    def type_badge(self, obj):
        colors = {
            'call': '#17a2b8',
            'email': '#6f42c1',
            'meeting': '#007bff',
            'task': '#ffc107',
            'note': '#28a745',
            'whatsapp': '#25d366'
        }
        icons = {
            'call': '📞',
            'email': '✉️',
            'meeting': '👥',
            'task': '✓',
            'note': '📝',
            'whatsapp': '💬'
        }
        color = colors.get(obj.activity_type, '#6c757d')
        icon = icons.get(obj.activity_type, '•')
        return format_html('<span style="background:{};color:white;padding:3px 10px;border-radius:12px;font-size:11px;">{} {}</span>', 
                         color, icon, obj.get_activity_type_display())
    type_badge.short_description = 'Tipo'
    type_badge.admin_order_field = 'activity_type'
    
    def status_badge(self, obj):
        if obj.status == 'completed':
            return format_html('<span style="background:#28a745;color:white;padding:3px 10px;border-radius:12px;font-size:11px;">✓ Completa</span>')
        elif obj.status == 'planned':
            return format_html('<span style="background:#007bff;color:white;padding:3px 10px;border-radius:12px;font-size:11px;">📅 Planejada</span>')
        else:
            return format_html('<span style="background:#dc3545;color:white;padding:3px 10px;border-radius:12px;font-size:11px;">✗ Cancelada</span>')
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'status'
    
    def related_to(self, obj):
        if obj.lead:
            return format_html('<span style="background:#ffc107;color:#000;padding:2px 8px;border-radius:8px;font-size:10px;">Lead: {}</span>', obj.lead.name)
        elif obj.contact:
            return format_html('<span style="background:#28a745;color:white;padding:2px 8px;border-radius:8px;font-size:10px;">Contato: {}</span>', obj.contact.name)
        elif obj.deal:
            return format_html('<span style="background:#007bff;color:white;padding:2px 8px;border-radius:8px;font-size:10px;">Negócio: {}</span>', obj.deal.title)
        return '-'
    related_to.short_description = 'Relacionado a'
