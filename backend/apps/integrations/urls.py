from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    IntegrationViewSet,
    QuickBooksIntegrationViewSet,
    IntegrationLogViewSet
)

router = DefaultRouter()
router.register(r'integrations', IntegrationViewSet, basename='integration')
router.register(r'quickbooks', QuickBooksIntegrationViewSet, basename='quickbooks')
router.register(r'logs', IntegrationLogViewSet, basename='integration-log')

urlpatterns = [
    path('', include(router.urls)),
]

