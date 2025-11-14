from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TenantViewSet, DomainViewSet, I18nTestViewSet

router = DefaultRouter()
router.register(r'tenants', TenantViewSet)
router.register(r'domains', DomainViewSet)
router.register(r'i18n', I18nTestViewSet, basename='i18n')

urlpatterns = [
    path('', include(router.urls)),
]
