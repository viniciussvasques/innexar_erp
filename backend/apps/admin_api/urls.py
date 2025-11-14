"""
Admin API URLs
"""
from django.urls import path
from . import views

app_name = 'admin_api'

urlpatterns = [
    # Dashboard
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
]
