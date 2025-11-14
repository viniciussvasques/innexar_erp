from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils.translation import gettext as _
from .models import Tenant, Domain
from .serializers import TenantSerializer, DomainSerializer


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

