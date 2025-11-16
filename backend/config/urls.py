"""
Tenant URL Configuration
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API
    path('api/v1/', include([
        path('auth/', include('apps.users.urls')),
        path('crm/', include('apps.crm.urls')),
        path('subscriptions/', include('apps.subscriptions.urls')),
        path('customers/', include('apps.customers.urls')),
        path('invoices/', include('apps.invoices.urls')),
        path('hr/', include('apps.hr.urls')),
        path('analytics/', include('apps.analytics.urls')),
        path('tenants/', include('apps.tenants.urls')),  # Tenant-specific routes (onboarding, settings)
        path('integrations/', include('apps.integrations.urls')),  # Integrations
    ])),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # Rosetta (Translation Interface)
    path('rosetta/', include('rosetta.urls')),
    
    # Stripe Webhooks
    path('stripe/', include('djstripe.urls', namespace='djstripe')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
