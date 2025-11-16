"""
Integration models for third-party services
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
import json


class Integration(models.Model):
    """
    Base model for third-party integrations
    Each tenant can have multiple integrations
    """
    INTEGRATION_TYPES = [
        ('quickbooks', _('QuickBooks Online')),
        ('xero', _('Xero')),
        ('stripe', _('Stripe')),
        ('shopify', _('Shopify')),
        ('woocommerce', _('WooCommerce')),
        ('zapier', _('Zapier')),
        ('plaid', _('Plaid')),
        ('twilio', _('Twilio')),
        ('sendgrid', _('SendGrid')),
        ('hubspot', _('HubSpot')),
        ('salesforce', _('Salesforce')),
        ('custom', _('Custom Integration')),
    ]
    
    STATUS_CHOICES = [
        ('inactive', _('Inactive')),
        ('active', _('Active')),
        ('error', _('Error')),
        ('expired', _('Expired')),
    ]
    
    integration_type = models.CharField(
        max_length=50,
        choices=INTEGRATION_TYPES,
        verbose_name=_('Integration Type')
    )
    name = models.CharField(
        max_length=200,
        verbose_name=_('Integration Name'),
        help_text=_('Custom name for this integration instance')
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='inactive',
        verbose_name=_('Status')
    )
    
    # Configuration stored as JSON
    config = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_('Configuration'),
        help_text=_('Integration-specific configuration')
    )
    
    # Metadata
    is_active = models.BooleanField(
        default=True,
        verbose_name=_('Is Active')
    )
    last_sync = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Last Sync')
    )
    last_error = models.TextField(
        blank=True,
        null=True,
        verbose_name=_('Last Error')
    )
    error_count = models.IntegerField(
        default=0,
        verbose_name=_('Error Count')
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Integration')
        verbose_name_plural = _('Integrations')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['integration_type', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.get_integration_type_display()} - {self.name}"
    
    def clean(self):
        """Validate integration-specific requirements"""
        if self.integration_type == 'quickbooks':
            # QuickBooks requires OAuth tokens
            if not self.config.get('access_token'):
                raise ValidationError({
                    'config': _('QuickBooks integration requires OAuth access token')
                })


class QuickBooksIntegration(models.Model):
    """
    QuickBooks Online specific integration data
    Stores OAuth tokens and company information
    """
    integration = models.OneToOneField(
        Integration,
        on_delete=models.CASCADE,
        related_name='quickbooks',
        verbose_name=_('Integration')
    )
    
    # OAuth 2.0 tokens
    access_token = models.TextField(
        verbose_name=_('Access Token'),
        help_text=_('OAuth 2.0 access token')
    )
    refresh_token = models.TextField(
        verbose_name=_('Refresh Token'),
        help_text=_('OAuth 2.0 refresh token')
    )
    token_expires_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Token Expires At')
    )
    
    # QuickBooks company info
    realm_id = models.CharField(
        max_length=100,
        verbose_name=_('Realm ID'),
        help_text=_('QuickBooks company ID')
    )
    company_name = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_('Company Name')
    )
    company_id = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_('Company ID')
    )
    
    # Sync settings
    sync_customers = models.BooleanField(
        default=True,
        verbose_name=_('Sync Customers')
    )
    sync_invoices = models.BooleanField(
        default=True,
        verbose_name=_('Sync Invoices')
    )
    sync_payments = models.BooleanField(
        default=True,
        verbose_name=_('Sync Payments')
    )
    sync_items = models.BooleanField(
        default=True,
        verbose_name=_('Sync Items')
    )
    sync_employees = models.BooleanField(
        default=False,
        verbose_name=_('Sync Employees')
    )
    
    # Sync direction
    SYNC_DIRECTION_CHOICES = [
        ('innexar_to_qb', _('Innexar → QuickBooks')),
        ('qb_to_innexar', _('QuickBooks → Innexar')),
        ('bidirectional', _('Bidirectional')),
    ]
    sync_direction = models.CharField(
        max_length=20,
        choices=SYNC_DIRECTION_CHOICES,
        default='bidirectional',
        verbose_name=_('Sync Direction')
    )
    
    # Auto-sync settings
    auto_sync_enabled = models.BooleanField(
        default=False,
        verbose_name=_('Auto Sync Enabled')
    )
    sync_interval_minutes = models.IntegerField(
        default=60,
        verbose_name=_('Sync Interval (minutes)')
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('QuickBooks Integration')
        verbose_name_plural = _('QuickBooks Integrations')
    
    def __str__(self):
        return f"QuickBooks - {self.company_name or self.realm_id}"
    
    def is_token_expired(self):
        """Check if OAuth token is expired"""
        if not self.token_expires_at:
            return True
        from django.utils import timezone
        return timezone.now() >= self.token_expires_at


class IntegrationLog(models.Model):
    """
    Log entries for integration activities
    """
    LOG_TYPES = [
        ('sync', _('Sync')),
        ('auth', _('Authentication')),
        ('error', _('Error')),
        ('webhook', _('Webhook')),
        ('manual', _('Manual Action')),
    ]
    
    integration = models.ForeignKey(
        Integration,
        on_delete=models.CASCADE,
        related_name='logs',
        verbose_name=_('Integration')
    )
    log_type = models.CharField(
        max_length=20,
        choices=LOG_TYPES,
        verbose_name=_('Log Type')
    )
    message = models.TextField(
        verbose_name=_('Message')
    )
    details = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_('Details')
    )
    success = models.BooleanField(
        default=True,
        verbose_name=_('Success')
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('Integration Log')
        verbose_name_plural = _('Integration Logs')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['integration', 'log_type', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.integration} - {self.get_log_type_display()} - {self.created_at}"

