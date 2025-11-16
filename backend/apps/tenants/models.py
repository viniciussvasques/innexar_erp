"""
Multi-tenant models using django-tenants
Each tenant gets its own PostgreSQL schema
"""
from django.db import models
from django_tenants.models import TenantMixin, DomainMixin
from django.utils.translation import gettext_lazy as _


class Tenant(TenantMixin):
    """
    Tenant model - represents a customer company
    Each tenant has isolated database schema
    """
    name = models.CharField(max_length=100)
    created_on = models.DateTimeField(auto_now_add=True)
    
    # Stripe integration
    stripe_customer_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_subscription_id = models.CharField(max_length=255, blank=True, null=True)
    
    # Plan details
    plan = models.CharField(
        max_length=50,
        choices=[
            ('free', 'Free'),
            ('starter', 'Starter'),
            ('professional', 'Professional'),
            ('enterprise', 'Enterprise'),
        ],
        default='free'
    )
    
    # Limits
    max_users = models.IntegerField(default=5)
    max_storage_mb = models.IntegerField(default=1000)  # 1GB
    
    # Status
    is_active = models.BooleanField(default=True)
    trial_ends_on = models.DateField(null=True, blank=True)
    
    # Onboarding status
    onboarding_completed = models.BooleanField(default=False)
    
    # Auto-created schema name
    auto_create_schema = True
    auto_drop_schema = False
    
    class Meta:
        db_table = 'tenants_tenant'
    
    def __str__(self):
        return self.name


class TenantSettings(models.Model):
    """
    Tenant settings - configuration for each tenant
    Stored in tenant schema (not public schema)
    """
    # Basic Information
    company_name = models.CharField(max_length=200, verbose_name=_('Company Name'))
    legal_name = models.CharField(max_length=200, blank=True, null=True, verbose_name=_('Legal Name'))
    legal_entity_type = models.CharField(
        max_length=50,
        choices=[
            ('individual', _('Individual/Person')),
            ('llc', _('LLC - Limited Liability Company')),
            ('corporation', _('Corporation')),
            ('partnership', _('Partnership')),
            ('sole_proprietorship', _('Sole Proprietorship')),
            ('nonprofit', _('Non-Profit Organization')),
            ('other', _('Other')),
        ],
        blank=True,
        null=True,
        verbose_name=_('Legal Entity Type')
    )
    tax_id = models.CharField(max_length=50, blank=True, null=True, verbose_name=_('Tax ID'))
    registration_number = models.CharField(max_length=50, blank=True, null=True, verbose_name=_('Registration Number'))
    
    # Location & Regional Settings
    country = models.CharField(
        max_length=2,
        choices=[
            ('BR', _('Brazil')),
            ('US', _('United States')),
            ('ES', _('Spain')),
            ('MX', _('Mexico')),
            ('AR', _('Argentina')),
            ('CO', _('Colombia')),
            ('CL', _('Chile')),
            ('PE', _('Peru')),
            ('PT', _('Portugal')),
            ('CA', _('Canada')),
            ('GB', _('United Kingdom')),
            ('DE', _('Germany')),
            ('FR', _('France')),
            ('IT', _('Italy')),
            ('AU', _('Australia')),
        ],
        default='BR',
        verbose_name=_('Country')
    )
    currency = models.CharField(
        max_length=3,
        choices=[
            ('BRL', 'R$ - Brazilian Real'),
            ('USD', '$ - US Dollar'),
            ('EUR', '€ - Euro'),
            ('MXN', '$ - Mexican Peso'),
            ('ARS', '$ - Argentine Peso'),
            ('COP', '$ - Colombian Peso'),
            ('CLP', '$ - Chilean Peso'),
            ('PEN', 'S/ - Peruvian Sol'),
            ('GBP', '£ - British Pound'),
            ('CAD', '$ - Canadian Dollar'),
            ('AUD', '$ - Australian Dollar'),
        ],
        default='BRL',
        verbose_name=_('Currency')
    )
    timezone = models.CharField(
        max_length=50,
        default='America/Sao_Paulo',
        verbose_name=_('Timezone')
    )
    language = models.CharField(
        max_length=5,
        choices=[
            ('pt', _('Portuguese')),
            ('en', _('English')),
            ('es', _('Spanish')),
        ],
        default='pt',
        verbose_name=_('Language')
    )
    date_format = models.CharField(
        max_length=20,
        choices=[
            ('DD/MM/YYYY', 'DD/MM/YYYY'),
            ('MM/DD/YYYY', 'MM/DD/YYYY'),
            ('YYYY-MM-DD', 'YYYY-MM-DD'),
        ],
        default='DD/MM/YYYY',
        verbose_name=_('Date Format')
    )
    time_format = models.CharField(
        max_length=10,
        choices=[
            ('24h', '24 hours'),
            ('12h', '12 hours (AM/PM)'),
        ],
        default='24h',
        verbose_name=_('Time Format')
    )
    
    # Business Information
    business_type = models.CharField(
        max_length=50,
        choices=[
            ('retail', _('Retail')),
            ('wholesale', _('Wholesale')),
            ('manufacturing', _('Manufacturing')),
            ('services', _('Services')),
            ('ecommerce', _('E-commerce')),
            ('restaurant', _('Restaurant/Food Service')),
            ('healthcare', _('Healthcare')),
            ('education', _('Education')),
            ('construction', _('Construction')),
            ('logistics', _('Logistics/Transportation')),
            ('technology', _('Technology/IT')),
            ('consulting', _('Consulting')),
            ('other', _('Other')),
        ],
        verbose_name=_('Business Type')
    )
    industry = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_('Industry')
    )
    main_activity = models.CharField(
        max_length=50,
        choices=[
            ('products', _('Products')),
            ('services', _('Services')),
            ('both', _('Products and Services')),
        ],
        default='products',
        verbose_name=_('Main Activity')
    )
    
    # Contact Information
    address = models.TextField(blank=True, null=True, verbose_name=_('Address'))
    city = models.CharField(max_length=100, blank=True, null=True, verbose_name=_('City'))
    state = models.CharField(max_length=100, blank=True, null=True, verbose_name=_('State/Province'))
    postal_code = models.CharField(max_length=20, blank=True, null=True, verbose_name=_('Postal Code'))
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name=_('Phone'))
    email = models.EmailField(blank=True, null=True, verbose_name=_('Email'))
    website = models.URLField(blank=True, null=True, verbose_name=_('Website'))
    
    # Additional Settings
    fiscal_year_start = models.CharField(
        max_length=5,
        choices=[
            ('01-01', _('January 1st')),
            ('04-01', _('April 1st')),
            ('07-01', _('July 1st')),
            ('10-01', _('October 1st')),
        ],
        default='01-01',
        verbose_name=_('Fiscal Year Start')
    )
    tax_regime = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_('Tax Regime')
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tenants_settings'
        verbose_name = _('Tenant Settings')
        verbose_name_plural = _('Tenant Settings')
    
    def __str__(self):
        return f'Settings for {self.company_name}'


class Domain(DomainMixin):
    """
    Domain model - maps subdomain to tenant
    Example: acme.innexar.com -> Tenant(name='ACME Corp')
    """
    class Meta:
        db_table = 'tenants_domain'
