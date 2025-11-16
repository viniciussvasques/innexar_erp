from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils.translation import gettext as _, activate, get_language
from django_tenants.utils import schema_context
from .models import Tenant, Domain, TenantSettings
from .serializers import (
    TenantSerializer, DomainSerializer, TenantSettingsSerializer, OnboardingSerializer
)


class TenantViewSet(viewsets.ModelViewSet):
    """
    API endpoints for tenant management
    POST /api/v1/public/tenants/ - Create new tenant (public)
    GET /api/v1/public/tenants/check-subdomain/ - Check availability
    """
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer
    permission_classes = [AllowAny]  # Public registration
    
    @action(detail=False, methods=['get'])
    def check_subdomain(self, request):
        """Check if subdomain is available"""
        subdomain = request.query_params.get('subdomain', '')
        
        if not subdomain:
            return Response({'error': 'subdomain required'}, status=400)
        
        # Check if schema_name exists (more reliable than domain check)
        exists = Tenant.objects.filter(schema_name=subdomain).exists()
        
        return Response({
            'subdomain': subdomain,
            'available': not exists
        })
    
    def create(self, request, *args, **kwargs):
        """Create new tenant with Stripe customer"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # TODO: Create Stripe customer
        # stripe_customer = stripe.Customer.create(
        #     email=request.data.get('email'),
        #     metadata={'tenant_id': tenant.id}
        # )
        
        tenant = serializer.save()
        
        return Response(
            TenantSerializer(tenant).data,
            status=status.HTTP_201_CREATED
        )


class DomainViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoints for domain management"""
    queryset = Domain.objects.all()
    serializer_class = DomainSerializer


class TenantSettingsViewSet(viewsets.ModelViewSet):
    """API endpoints for tenant settings"""
    serializer_class = TenantSettingsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get settings for current tenant"""
        if not hasattr(self.request, 'tenant'):
            return TenantSettings.objects.none()
        
        tenant = self.request.tenant
        with schema_context(tenant.schema_name):
            return TenantSettings.objects.all()
    
    def get_object(self):
        """Get or create settings for current tenant"""
        if not hasattr(self.request, 'tenant'):
            return None
        
        tenant = self.request.tenant
        with schema_context(tenant.schema_name):
            settings, _ = TenantSettings.objects.get_or_create(
                defaults={'company_name': tenant.name}
            )
            return settings
    
    def get_serializer_context(self):
        """Add request to serializer context"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class OnboardingViewSet(viewsets.ViewSet):
    """
    API endpoints for onboarding wizard
    
    Onboarding should be done by admin (is_staff or is_superuser) or the first user
    """
    permission_classes = [IsAuthenticated]
    queryset = []  # Empty queryset for router registration
    
    def check_onboarding_permission(self, request):
        """
        Check if user can perform onboarding
        
        Rules:
        - If onboarding is not completed, any authenticated user can complete it
        - If onboarding is already completed, only admin can redo it
        - Superuser and staff can always do onboarding
        """
        user = request.user
        
        # Superuser and staff can always do onboarding
        if user.is_superuser or user.is_staff:
            return True
        
        # Check if onboarding is already completed
        if hasattr(request, 'tenant'):
            tenant = request.tenant
            if tenant.onboarding_completed:
                # If already completed, only admin can redo
                return False
        
        # If onboarding is not completed, any authenticated user can complete it
        # This allows the first user to complete onboarding
        return True
    
    @action(detail=False, methods=['get'])
    def status(self, request):
        """Check if onboarding is needed"""
        if not hasattr(request, 'tenant'):
            return Response({
                'needs_onboarding': True,
                'reason': 'Tenant not found'
            })
        
        tenant = request.tenant
        needs_onboarding = not tenant.onboarding_completed
        
        # Check if settings exist
        if not needs_onboarding:
            with schema_context(tenant.schema_name):
                has_settings = TenantSettings.objects.exists()
                if not has_settings:
                    needs_onboarding = True
        
        return Response({
            'needs_onboarding': needs_onboarding,
            'onboarding_completed': tenant.onboarding_completed
        })
    
    @action(detail=False, methods=['post'])
    def complete(self, request):
        """Complete onboarding wizard"""
        # Check if user has permission to do onboarding
        if not self.check_onboarding_permission(request):
            return Response(
                {'error': _('Only administrators can complete onboarding')},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Activate language based on Accept-Language header
        lang = request.META.get('HTTP_ACCEPT_LANGUAGE', 'pt').lower()
        if 'en' in lang:
            activate('en')
        elif 'es' in lang:
            activate('es')
        else:
            activate('pt')
        
        if not hasattr(request, 'tenant'):
            return Response(
                {'error': _('Tenant not found')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = OnboardingSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        settings = serializer.save()
        
        return Response(
            TenantSettingsSerializer(settings, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=False, methods=['get'])
    def locale(self, request):
        """Get tenant language/locale preference (public endpoint)"""
        if not hasattr(request, 'tenant'):
            return Response({
                'locale': 'en',
                'default': True
            })
        
        tenant = request.tenant
        with schema_context(tenant.schema_name):
            settings = TenantSettings.objects.first()
            if settings and settings.language:
                return Response({
                    'locale': settings.language,
                    'default': False
                })
        
        return Response({
            'locale': 'en',
            'default': True
        })
    
    @action(detail=False, methods=['get'])
    def requirements(self, request):
        """Get required fields based on country and legal entity type"""
        country = request.query_params.get('country', 'BR')
        legal_entity_type = request.query_params.get('legal_entity_type')
        
        from .serializers import OnboardingSerializer
        serializer = OnboardingSerializer()
        required_fields = serializer.get_required_fields(country, legal_entity_type)
        
        # Map field names to labels
        field_labels = {
            'company_name': 'Company Name',
            'legal_name': 'Legal Name',
            'tax_id': 'Tax ID',
            'registration_number': 'Registration Number',
            'country': 'Country',
            'currency': 'Currency',
            'timezone': 'Timezone',
            'language': 'Language',
            'date_format': 'Date Format',
            'time_format': 'Time Format',
            'business_type': 'Business Type',
            'main_activity': 'Main Activity',
        }
        
        return Response({
            'required_fields': required_fields,
            'field_labels': field_labels,
            'country': country,
            'legal_entity_type': legal_entity_type,
        })
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def countries(self, request):
        """Get list of available countries with currencies and timezones"""
        countries = [
            {
                'code': 'BR',
                'name': 'Brazil',
                'currency': 'BRL',
                'currency_symbol': 'R$',
                'timezone': 'America/Sao_Paulo',
                'language': 'pt',
            },
            {
                'code': 'US',
                'name': 'United States',
                'currency': 'USD',
                'currency_symbol': '$',
                'timezone': 'America/New_York',
                'language': 'en',
            },
            {
                'code': 'ES',
                'name': 'Spain',
                'currency': 'EUR',
                'currency_symbol': '€',
                'timezone': 'Europe/Madrid',
                'language': 'es',
            },
            {
                'code': 'MX',
                'name': 'Mexico',
                'currency': 'MXN',
                'currency_symbol': '$',
                'timezone': 'America/Mexico_City',
                'language': 'es',
            },
            {
                'code': 'AR',
                'name': 'Argentina',
                'currency': 'ARS',
                'currency_symbol': '$',
                'timezone': 'America/Argentina/Buenos_Aires',
                'language': 'es',
            },
            {
                'code': 'CO',
                'name': 'Colombia',
                'currency': 'COP',
                'currency_symbol': '$',
                'timezone': 'America/Bogota',
                'language': 'es',
            },
            {
                'code': 'CL',
                'name': 'Chile',
                'currency': 'CLP',
                'currency_symbol': '$',
                'timezone': 'America/Santiago',
                'language': 'es',
            },
            {
                'code': 'PE',
                'name': 'Peru',
                'currency': 'PEN',
                'currency_symbol': 'S/',
                'timezone': 'America/Lima',
                'language': 'es',
            },
            {
                'code': 'PT',
                'name': 'Portugal',
                'currency': 'EUR',
                'currency_symbol': '€',
                'timezone': 'Europe/Lisbon',
                'language': 'pt',
            },
            {
                'code': 'CA',
                'name': 'Canada',
                'currency': 'CAD',
                'currency_symbol': '$',
                'timezone': 'America/Toronto',
                'language': 'en',
            },
            {
                'code': 'GB',
                'name': 'United Kingdom',
                'currency': 'GBP',
                'currency_symbol': '£',
                'timezone': 'Europe/London',
                'language': 'en',
            },
        ]
        return Response(countries)


class I18nTestViewSet(viewsets.ViewSet):
    """Test endpoint for i18n translations"""
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def test(self, request):
        """Test translations with Accept-Language header"""
        return Response({
            'dashboard': _('Dashboard'),
            'crm': _('CRM'),
            'finance': _('Finance'),
            'invoicing': _('Invoicing'),
            'leads': _('Leads'),
            'contacts': _('Contacts'),
            'deals': _('Deals'),
            'login': _('Login'),
            'logout': _('Logout'),
            'save': _('Save'),
            'cancel': _('Cancel'),
            'success': _('Success'),
            'error': _('Error'),
            'today': _('Today'),
            'message': _('Created successfully'),
        })

