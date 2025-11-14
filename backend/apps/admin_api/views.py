"""
Admin API - Dashboard Stats
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from apps.tenants.models import Tenant
from datetime import datetime, timedelta

User = get_user_model()


@api_view(['GET'])
@permission_classes([IsAdminUser])
def dashboard_stats(request):
    """Get global dashboard statistics"""
    
    total_tenants = Tenant.objects.count()
    active_tenants = Tenant.objects.filter(is_active=True).count()
    total_users = User.objects.count()
    
    # Calculate MRR based on active tenants and their plans
    plan_prices = {
        'trial': 0,
        'basic': 99,
        'professional': 299,
        'enterprise': 999,
    }
    
    mrr = sum(plan_prices.get(t.plan, 0) for t in Tenant.objects.filter(is_active=True))
    
    # New tenants this month
    first_day_of_month = datetime.now().replace(day=1)
    new_tenants_this_month = Tenant.objects.filter(created_on__gte=first_day_of_month).count()
    
    # Growth rate
    last_month = first_day_of_month - timedelta(days=1)
    last_month_first = last_month.replace(day=1)
    tenants_last_month = Tenant.objects.filter(
        created_on__lt=first_day_of_month, 
        created_on__gte=last_month_first
    ).count()
    growth_rate = ((new_tenants_this_month - tenants_last_month) / max(tenants_last_month, 1)) * 100 if tenants_last_month > 0 else 0
    
    return Response({
        'total_tenants': total_tenants,
        'active_tenants': active_tenants,
        'total_users': total_users,
        'total_revenue': mrr * 12,
        'mrr': mrr,
        'new_tenants_this_month': new_tenants_this_month,
        'growth_rate': round(growth_rate, 2),
    })

