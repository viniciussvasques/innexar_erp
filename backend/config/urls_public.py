"""
Public Schema URL Configuration (Landing Page, Tenant Registration)
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),
    
    # Public API (tenant registration, etc)
    path('api/v1/public/', include('apps.tenants.urls')),
    path('api/v1/public/auth/', include('apps.users.urls')),  # Public login
    
    # Admin Panel API
    path('api/v1/admin/', include('apps.admin_api.urls')),  # Admin endpoints
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
