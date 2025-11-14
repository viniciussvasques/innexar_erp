from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Lead, Contact, Deal, Activity
from .serializers import LeadSerializer, ContactSerializer, DealSerializer, ActivitySerializer


class LeadViewSet(viewsets.ModelViewSet):
    """
    API endpoints for Lead management
    """
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'source', 'owner']
    search_fields = ['name', 'email', 'company']
    ordering_fields = ['score', 'created_at', 'updated_at']
    ordering = ['-score', '-created_at']
    
    def perform_create(self, serializer):
        """Auto-assign current user as owner if not set"""
        serializer.save(owner=serializer.validated_data.get('owner', self.request.user))
    
    @action(detail=True, methods=['post'])
    def convert(self, request, pk=None):
        """Convert lead to contact"""
        lead = self.get_object()
        
        if lead.status == 'converted':
            return Response(
                {'error': 'Lead already converted'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create contact from lead
        contact = Contact.objects.create(
            name=lead.name,
            email=lead.email,
            phone=lead.phone,
            company=lead.company,
            position=lead.position,
            notes=lead.notes,
            converted_from_lead=lead,
            owner=lead.owner
        )
        
        # Update lead status
        lead.status = 'converted'
        lead.save()
        
        return Response(
            ContactSerializer(contact).data,
            status=status.HTTP_201_CREATED
        )


class ContactViewSet(viewsets.ModelViewSet):
    """
    API endpoints for Contact management
    """
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_customer', 'owner']
    search_fields = ['name', 'email', 'company']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        serializer.save(owner=serializer.validated_data.get('owner', self.request.user))


class DealViewSet(viewsets.ModelViewSet):
    """
    API endpoints for Deal management
    """
    queryset = Deal.objects.select_related('contact', 'owner')
    serializer_class = DealSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['stage', 'owner', 'contact']
    search_fields = ['title', 'description', 'contact__name']
    ordering_fields = ['amount', 'expected_revenue', 'expected_close_date', 'created_at']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        serializer.save(owner=serializer.validated_data.get('owner', self.request.user))
    
    @action(detail=False, methods=['get'])
    def pipeline(self, request):
        """Get pipeline overview by stage"""
        from django.db.models import Sum, Count
        
        pipeline = []
        for stage_code, stage_name in Deal.STAGE_CHOICES:
            deals = self.queryset.filter(stage=stage_code)
            pipeline.append({
                'stage': stage_code,
                'stage_name': stage_name,
                'count': deals.count(),
                'total_amount': deals.aggregate(Sum('amount'))['amount__sum'] or 0,
                'total_expected_revenue': deals.aggregate(Sum('expected_revenue'))['expected_revenue__sum'] or 0,
            })
        
        return Response(pipeline)


class ActivityViewSet(viewsets.ModelViewSet):
    """
    API endpoints for Activity management
    """
    queryset = Activity.objects.select_related('lead', 'contact', 'deal', 'owner')
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['activity_type', 'status', 'owner', 'lead', 'contact', 'deal']
    search_fields = ['subject', 'description']
    ordering_fields = ['scheduled_at', 'completed_at', 'created_at']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        serializer.save(owner=serializer.validated_data.get('owner', self.request.user))
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark activity as completed"""
        from django.utils import timezone
        
        activity = self.get_object()
        activity.status = 'completed'
        activity.completed_at = timezone.now()
        activity.save()
        
        return Response(ActivitySerializer(activity).data)
