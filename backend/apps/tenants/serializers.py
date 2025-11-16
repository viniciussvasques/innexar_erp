from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import Tenant, Domain, TenantSettings


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
        
        # Apply migrations and load fixtures for new tenant
        try:
            from django.core.management import call_command
            from django_tenants.utils import schema_context
            from apps.hr.fixtures import load_hr_fixtures_for_country
            import logging
            
            logger = logging.getLogger(__name__)
            
            # Apply migrations
            logger.info(f'Applying migrations for new tenant: {tenant.schema_name}')
            call_command('migrate_schemas', '--schema', tenant.schema_name, verbosity=0)
            
            # Load HR fixtures
            logger.info(f'Loading HR fixtures for new tenant: {tenant.name}')
            with schema_context(tenant.schema_name):
                def output_callback(message, style='INFO'):
                    if style == 'SUCCESS':
                        logger.info(f'✓ {message}')
                    elif style == 'WARNING':
                        logger.warning(f'⚠ {message}')
                    elif style == 'ERROR':
                        logger.error(f'✗ {message}')
                    else:
                        logger.info(message)
                
                load_hr_fixtures_for_country(
                    country_code='BR',
                    clear=False,
                    output_callback=output_callback
                )
            
            logger.info(f'✓ Setup completed for tenant: {tenant.name}')
        except Exception as e:
            # Log error but don't fail tenant creation
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f'Error setting up tenant {tenant.name}: {str(e)}', exc_info=True)
            logger.info(f'You can run manually: python manage.py migrate_schemas --schema {tenant.schema_name}')
            logger.info(f'Then: python manage.py load_hr_fixtures --schema {tenant.schema_name}')
        
        return tenant


class DomainSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    
    class Meta:
        model = Domain
        fields = ['id', 'domain', 'tenant', 'tenant_name', 'is_primary']
        read_only_fields = ['id']


class TenantSettingsSerializer(serializers.ModelSerializer):
    """Serializer for Tenant Settings with permission-based field restrictions"""
    
    class Meta:
        model = TenantSettings
        fields = [
            'id', 'company_name', 'legal_name', 'legal_entity_type', 'tax_id', 'registration_number',
            'country', 'currency', 'timezone', 'language', 'date_format', 'time_format',
            'business_type', 'industry', 'main_activity',
            'address', 'city', 'state', 'postal_code', 'phone', 'email', 'website',
            'fiscal_year_start', 'tax_regime',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validate that user has permission to edit admin-only fields"""
        request = self.context.get('request')
        if not request:
            return data
        
        user = request.user
        is_admin = user.is_staff or user.is_superuser
        
        # Fields that only admin can edit
        admin_only_fields = [
            'company_name', 'legal_name', 'legal_entity_type', 'tax_id', 'registration_number',
            'country', 'currency', 'timezone', 'fiscal_year_start', 'tax_regime', 'business_type'
        ]
        
        # Check if user is trying to edit admin-only fields
        if not is_admin:
            for field in admin_only_fields:
                if field in data:
                    raise serializers.ValidationError({
                        field: _('Only administrators can edit this field')
                    })
        
        return data


class OnboardingSerializer(serializers.Serializer):
    """Serializer for onboarding wizard with conditional validation"""
    # Step 1: Basic Information
    company_name = serializers.CharField(max_length=200)
    legal_name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    legal_entity_type = serializers.CharField(max_length=50, required=False, allow_blank=True)
    tax_id = serializers.CharField(max_length=50, required=False, allow_blank=True)
    registration_number = serializers.CharField(max_length=50, required=False, allow_blank=True)
    
    # Step 2: Location & Regional
    country = serializers.CharField(max_length=2)
    currency = serializers.CharField(max_length=3)
    timezone = serializers.CharField(max_length=50)
    language = serializers.CharField(max_length=5)
    date_format = serializers.CharField(max_length=20)
    time_format = serializers.CharField(max_length=10)
    
    # Step 3: Business Information
    business_type = serializers.CharField(max_length=50)
    industry = serializers.CharField(max_length=100, required=False, allow_blank=True)
    main_activity = serializers.CharField(max_length=50)
    
    # Step 4: Contact (Optional)
    address = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    state = serializers.CharField(max_length=100, required=False, allow_blank=True)
    postal_code = serializers.CharField(max_length=20, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    website = serializers.URLField(required=False, allow_blank=True)
    
    # Additional
    fiscal_year_start = serializers.CharField(max_length=5, required=False)
    tax_regime = serializers.CharField(max_length=50, required=False, allow_blank=True)
    
    def get_required_fields(self, country: str, legal_entity_type: str = None) -> dict:
        """
        Define required fields based on country and legal entity type
        Returns dict with field names as keys and required status as values
        
        Rules:
        - Always required: company_name, country, currency, timezone, language, 
          date_format, time_format, business_type, main_activity
        - Country-specific: Tax ID requirements vary by country
        - Entity-specific: Legal name required for businesses (not individuals)
        """
        # Base required fields (always required)
        required = {
            'company_name': True,
            'country': True,
            'currency': True,
            'timezone': True,
            'language': True,
            'date_format': True,
            'time_format': True,
            'business_type': True,
            'main_activity': True,
        }
        
        # Country-specific requirements
        if country == 'BR':
            # Brazil: CNPJ required for companies, CPF for individuals
            # But we make it flexible - only require if entity type is specified
            if legal_entity_type:
                if legal_entity_type != 'individual':
                    required['tax_id'] = True  # CNPJ for companies
                    required['legal_name'] = True  # Razão Social required
                else:
                    required['tax_id'] = True  # CPF for individuals
        elif country == 'US':
            # USA: EIN for businesses, SSN for individuals
            # Flexible - only require if entity type is specified
            if legal_entity_type:
                required['tax_id'] = True  # EIN or SSN
                if legal_entity_type != 'individual':
                    required['legal_name'] = True  # Legal name for businesses
        elif country in ['MX', 'AR', 'CO', 'CL', 'PE']:
            # Latin America: Tax ID usually required (but flexible)
            # Only require if entity type is specified
            if legal_entity_type:
                required['tax_id'] = True
                if legal_entity_type != 'individual':
                    required['legal_name'] = True
        elif country in ['ES', 'PT', 'GB', 'DE', 'FR', 'IT']:
            # Europe: More flexible, usually only require if business
            if legal_entity_type and legal_entity_type != 'individual':
                required['legal_name'] = True
                # Tax ID optional in Europe (can be VAT number)
        
        # Legal entity type requirements (only if specified)
        if legal_entity_type and legal_entity_type != 'individual':
            # For businesses, legal name is usually required
            # But we keep it flexible - only require if country also requires it
            # (already handled above)
            pass
        
        return required
    
    def validate(self, data):
        """Validate fields based on country and legal entity type"""
        from django.utils.translation import gettext_lazy as _
        
        country = data.get('country', 'BR')
        legal_entity_type = data.get('legal_entity_type')
        
        required_fields = self.get_required_fields(country, legal_entity_type)
        errors = {}
        
        # Field labels in multiple languages
        field_labels = {
            'company_name': _('Company Name'),
            'legal_name': _('Legal Name'),
            'legal_entity_type': _('Legal Entity Type'),
            'tax_id': _('Tax ID'),
            'registration_number': _('Registration Number'),
            'country': _('Country'),
            'currency': _('Currency'),
            'timezone': _('Timezone'),
            'language': _('Language'),
            'date_format': _('Date Format'),
            'time_format': _('Time Format'),
            'business_type': _('Business Type'),
            'main_activity': _('Main Activity'),
        }
        
        for field, is_required in required_fields.items():
            if is_required:
                value = data.get(field)
                if not value or (isinstance(value, str) and not value.strip()):
                    field_label = str(field_labels.get(field, field.replace('_', ' ').title()))
                    errors[field] = _('%(field)s is required') % {'field': field_label}
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data
    
    def create(self, validated_data):
        """Create or update tenant settings"""
        from django_tenants.utils import schema_context
        from apps.tenants.models import Tenant
        
        # Get tenant from request
        request = self.context.get('request')
        if not request or not hasattr(request, 'tenant'):
            raise serializers.ValidationError('Tenant not found in request context')
        
        tenant = request.tenant
        
        # Mark tenant as onboarding completed (must be done in public schema)
        # because Tenant model is in public schema, not tenant schema
        from django_tenants.utils import schema_context as public_schema_context
        with public_schema_context('public'):
            # Refresh tenant from database to ensure we have the latest version
            tenant.refresh_from_db()
            tenant.onboarding_completed = True
            tenant.save(update_fields=['onboarding_completed'])
        
        # Now save settings in tenant schema
        with schema_context(tenant.schema_name):
            # Get or create settings (singleton pattern - only one per tenant)
            # Since TenantSettings is a singleton, we get the first one or create it
            settings = TenantSettings.objects.first()
            
            if settings:
                # Update existing settings
                for key, value in validated_data.items():
                    setattr(settings, key, value)
                settings.save()
                created = False
            else:
                # Create new settings
                settings = TenantSettings.objects.create(**validated_data)
                created = True
            
            # Load HR fixtures based on country
            if created:
                from apps.hr.fixtures import load_hr_fixtures_for_country
                import logging
                
                logger = logging.getLogger(__name__)
                country_code = validated_data.get('country', 'BR')
                
                def output_callback(message, style='INFO'):
                    if style == 'SUCCESS':
                        logger.info(f'✓ {message}')
                    elif style == 'WARNING':
                        logger.warning(f'⚠ {message}')
                    elif style == 'ERROR':
                        logger.error(f'✗ {message}')
                    else:
                        logger.info(message)
                
                load_hr_fixtures_for_country(
                    country_code=country_code,
                    clear=False,
                    output_callback=output_callback
                )
            
            return settings
