"""
Analytics API Views
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Count, Q, DecimalField
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta, datetime
from decimal import Decimal

# Import models
try:
    from apps.crm.models import Lead, Deal, Contact
except ImportError:
    Lead = None
    Deal = None
    Contact = None

try:
    from apps.invoices.models import Invoice
except ImportError:
    Invoice = None


def get_period_dates(period):
    """Get start and end dates based on period parameter"""
    today = timezone.now().date()
    
    if period == '7d':
        start_date = today - timedelta(days=7)
        end_date = today
    elif period == '30d':
        start_date = today - timedelta(days=30)
        end_date = today
    elif period == '90d':
        start_date = today - timedelta(days=90)
        end_date = today
    elif period == 'year':
        start_date = today.replace(month=1, day=1)
        end_date = today
    else:
        # Default to 30 days
        start_date = today - timedelta(days=30)
        end_date = today
    
    return start_date, end_date


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    """
    Get dashboard statistics
    
    Query params:
    - period: 7d | 30d | 90d | year | custom
    - start_date: YYYY-MM-DD (for custom period)
    - end_date: YYYY-MM-DD (for custom period)
    """
    period = request.query_params.get('period', '30d')
    start_date_param = request.query_params.get('start_date')
    end_date_param = request.query_params.get('end_date')
    
    # Get date range
    if start_date_param and end_date_param:
        try:
            start_date = datetime.strptime(start_date_param, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_param, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD.'},
                status=status.HTTP_400_BAD_REQUEST
            )
    else:
        start_date, end_date = get_period_dates(period)
    
    # Initialize response
    response_data = {
        'sales': {
            'total': '0.00',
            'change_percent': 0,
            'chart': []
        },
        'leads': {
            'total': 0,
            'new_today': 0,
            'conversion_rate': 0
        },
        'receivable': {
            'total': '0.00',
            'overdue': '0.00'
        }
    }
    
    # Sales data (from Deals)
    if Deal:
        # Total sales in period (closed won deals)
        closed_deals = Deal.objects.filter(
            stage='closed_won',
            actual_close_date__gte=start_date,
            actual_close_date__lte=end_date
        )
        total_sales = closed_deals.aggregate(
            total=Sum('amount', output_field=DecimalField())
        )['total'] or Decimal('0.00')
        
        # Previous period for comparison
        period_days = (end_date - start_date).days
        prev_start = start_date - timedelta(days=period_days)
        prev_end = start_date - timedelta(days=1)
        prev_deals = Deal.objects.filter(
            stage='closed_won',
            actual_close_date__gte=prev_start,
            actual_close_date__lte=prev_end
        )
        prev_total = prev_deals.aggregate(
            total=Sum('amount', output_field=DecimalField())
        )['total'] or Decimal('0.00')
        
        # Calculate change percent
        if prev_total > 0:
            change_percent = float(((total_sales - prev_total) / prev_total) * 100)
        else:
            change_percent = 100.0 if total_sales > 0 else 0.0
        
        # Sales chart data (daily aggregation)
        chart_data = []
        current_date = start_date
        while current_date <= end_date:
            day_deals = Deal.objects.filter(
                stage='closed_won',
                actual_close_date=current_date
            )
            day_total = day_deals.aggregate(
                total=Sum('amount', output_field=DecimalField())
            )['total'] or Decimal('0.00')
            
            chart_data.append({
                'date': current_date.isoformat(),
                'value': str(day_total)
            })
            current_date += timedelta(days=1)
        
        response_data['sales'] = {
            'total': str(total_sales),
            'change_percent': round(change_percent, 2),
            'chart': chart_data
        }
    
    # Leads data
    if Lead:
        # Total leads
        total_leads = Lead.objects.count()
        
        # New leads today
        today = timezone.now().date()
        new_today = Lead.objects.filter(created_at__date=today).count()
        
        # Conversion rate (leads converted to contacts)
        converted_leads = Lead.objects.filter(status='converted').count()
        conversion_rate = (converted_leads / total_leads * 100) if total_leads > 0 else 0
        
        response_data['leads'] = {
            'total': total_leads,
            'new_today': new_today,
            'conversion_rate': round(conversion_rate, 2)
        }
    
    # Receivable data (from Invoices)
    if Invoice:
        try:
            # Try to use balance field (if exists) or grand_total
            # Status values: 'issued', 'sent', 'partially_paid', 'overdue'
            total_receivable_qs = Invoice.objects.filter(
                status__in=['issued', 'sent', 'partially_paid', 'overdue']
            )
            
            # Try balance field first, fallback to grand_total
            if hasattr(Invoice, 'balance'):
                total_receivable = total_receivable_qs.aggregate(
                    total=Sum('balance', output_field=DecimalField())
                )['total'] or Decimal('0.00')
            elif hasattr(Invoice, 'grand_total'):
                total_receivable = total_receivable_qs.aggregate(
                    total=Sum('grand_total', output_field=DecimalField())
                )['total'] or Decimal('0.00')
            else:
                total_receivable = Decimal('0.00')
            
            # Overdue invoices
            today = timezone.now().date()
            overdue_qs = Invoice.objects.filter(
                status__in=['issued', 'sent', 'partially_paid', 'overdue'],
                due_date__lt=today
            )
            
            if hasattr(Invoice, 'balance'):
                overdue_receivable = overdue_qs.aggregate(
                    total=Sum('balance', output_field=DecimalField())
                )['total'] or Decimal('0.00')
            elif hasattr(Invoice, 'grand_total'):
                overdue_receivable = overdue_qs.aggregate(
                    total=Sum('grand_total', output_field=DecimalField())
                )['total'] or Decimal('0.00')
            else:
                overdue_receivable = Decimal('0.00')
            
            response_data['receivable'] = {
                'total': str(total_receivable),
                'overdue': str(overdue_receivable)
            }
        except Exception as e:
            # If Invoice model exists but has different structure, just skip
            pass
    
    return Response(response_data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_report(request):
    """
    Generate a custom report
    
    Body:
    {
        "type": "sales_by_product" | "leads_by_source" | "deals_pipeline",
        "start_date": "2025-01-01",
        "end_date": "2025-11-13",
        "format": "pdf" | "excel" | "csv"
    }
    """
    # TODO: Implement report generation
    # For now, return a placeholder response
    return Response({
        'report_id': 'placeholder',
        'download_url': '',
        'expires_at': (timezone.now() + timedelta(days=7)).isoformat()
    }, status=status.HTTP_501_NOT_IMPLEMENTED)

