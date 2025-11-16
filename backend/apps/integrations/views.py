"""
Views for integrations API
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils.translation import gettext_lazy as _
from django_tenants.utils import schema_context
from django.conf import settings
from .models import Integration, QuickBooksIntegration, IntegrationLog
from .serializers import (
    IntegrationSerializer,
    QuickBooksIntegrationSerializer,
    QuickBooksOAuthSerializer,
    IntegrationLogSerializer
)
from .quickbooks import QuickBooksClient


class IntegrationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing integrations"""
    serializer_class = IntegrationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get integrations for current tenant"""
        if not hasattr(self.request, 'tenant'):
            return Integration.objects.none()
        
        tenant = self.request.tenant
        with schema_context(tenant.schema_name):
            return Integration.objects.all()
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate an integration"""
        integration = self.get_object()
        integration.is_active = True
        integration.status = 'active'
        integration.save()
        
        return Response({
            'message': _('Integration activated successfully'),
            'integration': IntegrationSerializer(integration).data
        })
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate an integration"""
        integration = self.get_object()
        integration.is_active = False
        integration.status = 'inactive'
        integration.save()
        
        return Response({
            'message': _('Integration deactivated successfully'),
            'integration': IntegrationSerializer(integration).data
        })
    
    @action(detail=True, methods=['post'])
    def sync(self, request, pk=None):
        """Manually trigger sync for an integration"""
        integration = self.get_object()
        
        if integration.integration_type == 'quickbooks':
            try:
                qb_integration = integration.quickbooks
                client = QuickBooksClient(qb_integration)
                result = client.sync_all()
                
                return Response({
                    'message': _('Sync completed successfully'),
                    'result': result
                })
            except Exception as e:
                return Response({
                    'error': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'error': _('Sync not implemented for this integration type')
        }, status=status.HTTP_400_BAD_REQUEST)


class QuickBooksIntegrationViewSet(viewsets.ModelViewSet):
    """ViewSet for QuickBooks integration"""
    serializer_class = QuickBooksIntegrationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get QuickBooks integrations for current tenant"""
        if not hasattr(self.request, 'tenant'):
            return QuickBooksIntegration.objects.none()
        
        tenant = self.request.tenant
        with schema_context(tenant.schema_name):
            return QuickBooksIntegration.objects.select_related('integration').all()
    
    @action(detail=False, methods=['get'])
    def oauth_url(self, request):
        """Get OAuth authorization URL for QuickBooks"""
        from .quickbooks import get_quickbooks_oauth_url
        
        state = request.query_params.get('state', 'default')
        auth_url = get_quickbooks_oauth_url(state)
        
        return Response({
            'auth_url': auth_url,
            'state': state
        })
    
    @action(detail=False, methods=['post'])
    def oauth_callback(self, request):
        """Handle OAuth callback from QuickBooks"""
        serializer = QuickBooksOAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        code = serializer.validated_data['code']
        realm_id = serializer.validated_data['realm_id']
        
        try:
            from .quickbooks import exchange_code_for_tokens
            
            tokens = exchange_code_for_tokens(code, realm_id)
            
            # Create or update integration
            tenant = request.tenant
            with schema_context(tenant.schema_name):
                integration, created = Integration.objects.get_or_create(
                    integration_type='quickbooks',
                    defaults={
                        'name': f'QuickBooks - {realm_id}',
                        'status': 'active',
                        'is_active': True,
                    }
                )
                
                qb_integration, qb_created = QuickBooksIntegration.objects.get_or_create(
                    integration=integration,
                    defaults={
                        'realm_id': realm_id,
                        'access_token': tokens['access_token'],
                        'refresh_token': tokens['refresh_token'],
                        'token_expires_at': tokens.get('expires_at'),
                    }
                )
                
                if not qb_created:
                    qb_integration.access_token = tokens['access_token']
                    qb_integration.refresh_token = tokens['refresh_token']
                    qb_integration.token_expires_at = tokens.get('expires_at')
                    qb_integration.save()
                
                # Fetch company info
                client = QuickBooksClient(qb_integration)
                company_info = client.get_company_info()
                
                if company_info:
                    qb_integration.company_name = company_info.get('CompanyName', '')
                    qb_integration.company_id = company_info.get('Id', '')
                    qb_integration.save()
                
                return Response({
                    'message': _('QuickBooks connected successfully'),
                    'integration': QuickBooksIntegrationSerializer(qb_integration).data
                })
        
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def refresh_token(self, request, pk=None):
        """Refresh OAuth token"""
        qb_integration = self.get_object()
        
        try:
            from .quickbooks import refresh_quickbooks_token
            
            tokens = refresh_quickbooks_token(qb_integration.refresh_token)
            
            qb_integration.access_token = tokens['access_token']
            qb_integration.refresh_token = tokens.get('refresh_token', qb_integration.refresh_token)
            qb_integration.token_expires_at = tokens.get('expires_at')
            qb_integration.save()
            
            return Response({
                'message': _('Token refreshed successfully')
            })
        
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def test_connection(self, request, pk=None):
        """Test QuickBooks connection"""
        qb_integration = self.get_object()
        
        try:
            client = QuickBooksClient(qb_integration)
            company_info = client.get_company_info()
            
            return Response({
                'connected': True,
                'company_info': company_info
            })
        except Exception as e:
            return Response({
                'connected': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class IntegrationLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing integration logs"""
    serializer_class = IntegrationLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get logs for current tenant"""
        if not hasattr(self.request, 'tenant'):
            return IntegrationLog.objects.none()
        
        tenant = self.request.tenant
        integration_id = self.request.query_params.get('integration_id')
        
        with schema_context(tenant.schema_name):
            queryset = IntegrationLog.objects.select_related('integration').all()
            if integration_id:
                queryset = queryset.filter(integration_id=integration_id)
            return queryset

