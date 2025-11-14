from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings


class Lead(models.Model):
    """Lead (prospect) model for CRM"""
    
    SOURCE_CHOICES = [
        ('website', _('Website')),
        ('social', _('Social Media')),
        ('referral', _('Referral')),
        ('ads', _('Advertising')),
        ('cold_call', _('Cold Call')),
        ('event', _('Event')),
        ('other', _('Other')),
    ]
    
    STATUS_CHOICES = [
        ('new', _('New')),
        ('contacted', _('Contacted')),
        ('qualified', _('Qualified')),
        ('converted', _('Converted')),
        ('lost', _('Lost')),
    ]
    
    # Basic info
    name = models.CharField(_('Name'), max_length=255)
    email = models.EmailField(_('Email'))
    phone = models.CharField(_('Phone'), max_length=50, blank=True)
    company = models.CharField(_('Company'), max_length=255, blank=True)
    position = models.CharField(_('Position'), max_length=100, blank=True)
    
    # Lead tracking
    source = models.CharField(_('Source'), max_length=20, choices=SOURCE_CHOICES, default='other')
    status = models.CharField(_('Status'), max_length=20, choices=STATUS_CHOICES, default='new')
    score = models.IntegerField(_('Score'), default=0, help_text=_('AI-calculated lead score (0-100)'))
    
    # Details
    notes = models.TextField(_('Notes'), blank=True)
    
    # Ownership
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='leads',
        verbose_name=_('Owner')
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('Created At'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Updated At'), auto_now=True)
    
    class Meta:
        verbose_name = _('Lead')
        verbose_name_plural = _('Leads')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['status']),
            models.Index(fields=['score']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.email})"


class Contact(models.Model):
    """Contact (converted lead or direct contact) model"""
    
    # Basic info
    name = models.CharField(_('Name'), max_length=255)
    email = models.EmailField(_('Email'), unique=True)
    phone = models.CharField(_('Phone'), max_length=50, blank=True)
    mobile = models.CharField(_('Mobile'), max_length=50, blank=True)
    
    # Company info
    company = models.CharField(_('Company'), max_length=255, blank=True)
    position = models.CharField(_('Position'), max_length=100, blank=True)
    
    # Address
    address = models.TextField(_('Address'), blank=True)
    city = models.CharField(_('City'), max_length=100, blank=True)
    state = models.CharField(_('State'), max_length=100, blank=True)
    country = models.CharField(_('Country'), max_length=100, blank=True)
    zip_code = models.CharField(_('ZIP Code'), max_length=20, blank=True)
    
    # Social
    linkedin = models.URLField(_('LinkedIn'), blank=True)
    twitter = models.CharField(_('Twitter'), max_length=100, blank=True)
    
    # Details
    notes = models.TextField(_('Notes'), blank=True)
    tags = models.CharField(_('Tags'), max_length=500, blank=True, help_text=_('Comma-separated tags'))
    
    # Lifecycle
    is_customer = models.BooleanField(_('Is Customer'), default=False)
    converted_from_lead = models.ForeignKey(
        Lead,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='converted_contacts',
        verbose_name=_('Converted From Lead')
    )
    
    # Ownership
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='contacts',
        verbose_name=_('Owner')
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('Created At'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Updated At'), auto_now=True)
    
    class Meta:
        verbose_name = _('Contact')
        verbose_name_plural = _('Contacts')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['is_customer']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.email})"


class Deal(models.Model):
    """Sales deal/opportunity model"""
    
    STAGE_CHOICES = [
        ('prospecting', _('Prospecting')),
        ('qualification', _('Qualification')),
        ('proposal', _('Proposal')),
        ('negotiation', _('Negotiation')),
        ('closed_won', _('Closed Won')),
        ('closed_lost', _('Closed Lost')),
    ]
    
    # Basic info
    title = models.CharField(_('Title'), max_length=255)
    description = models.TextField(_('Description'), blank=True)
    
    # Financial
    amount = models.DecimalField(_('Amount'), max_digits=15, decimal_places=2)
    currency = models.CharField(_('Currency'), max_length=3, default='USD')
    probability = models.IntegerField(_('Probability'), default=50, help_text=_('Win probability (0-100%)'))
    expected_revenue = models.DecimalField(
        _('Expected Revenue'),
        max_digits=15,
        decimal_places=2,
        editable=False,
        help_text=_('Amount × Probability')
    )
    
    # Pipeline
    stage = models.CharField(_('Stage'), max_length=20, choices=STAGE_CHOICES, default='prospecting')
    
    # Relationships
    contact = models.ForeignKey(
        Contact,
        on_delete=models.CASCADE,
        related_name='deals',
        verbose_name=_('Contact')
    )
    
    # Ownership
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='deals',
        verbose_name=_('Owner')
    )
    
    # Dates
    expected_close_date = models.DateField(_('Expected Close Date'), null=True, blank=True)
    actual_close_date = models.DateField(_('Actual Close Date'), null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('Created At'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Updated At'), auto_now=True)
    
    class Meta:
        verbose_name = _('Deal')
        verbose_name_plural = _('Deals')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['stage']),
            models.Index(fields=['expected_close_date']),
        ]
    
    def save(self, *args, **kwargs):
        # Calculate expected revenue
        self.expected_revenue = self.amount * (self.probability / 100)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.title} - {self.amount} {self.currency}"


class Activity(models.Model):
    """Activity log for CRM (calls, emails, meetings, etc)"""
    
    TYPE_CHOICES = [
        ('call', _('Call')),
        ('email', _('Email')),
        ('meeting', _('Meeting')),
        ('task', _('Task')),
        ('note', _('Note')),
        ('whatsapp', _('WhatsApp')),
    ]
    
    STATUS_CHOICES = [
        ('planned', _('Planned')),
        ('completed', _('Completed')),
        ('canceled', _('Canceled')),
    ]
    
    # Type and details
    activity_type = models.CharField(_('Type'), max_length=20, choices=TYPE_CHOICES)
    subject = models.CharField(_('Subject'), max_length=255)
    description = models.TextField(_('Description'), blank=True)
    status = models.CharField(_('Status'), max_length=20, choices=STATUS_CHOICES, default='planned')
    
    # Relationships (at least one required)
    lead = models.ForeignKey(
        Lead,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='activities',
        verbose_name=_('Lead')
    )
    contact = models.ForeignKey(
        Contact,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='activities',
        verbose_name=_('Contact')
    )
    deal = models.ForeignKey(
        Deal,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='activities',
        verbose_name=_('Deal')
    )
    
    # Ownership
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='activities',
        verbose_name=_('Owner')
    )
    
    # Dates
    scheduled_at = models.DateTimeField(_('Scheduled At'), null=True, blank=True)
    completed_at = models.DateTimeField(_('Completed At'), null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('Created At'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Updated At'), auto_now=True)
    
    class Meta:
        verbose_name = _('Activity')
        verbose_name_plural = _('Activities')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['activity_type']),
            models.Index(fields=['status']),
            models.Index(fields=['scheduled_at']),
        ]
    
    def __str__(self):
        return f"{self.get_activity_type_display()}: {self.subject}"
