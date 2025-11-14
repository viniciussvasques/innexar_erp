from rest_framework import serializers
from .models import Lead, Contact, Deal, Activity


class LeadSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    
    class Meta:
        model = Lead
        fields = [
            'id', 'name', 'email', 'phone', 'company', 'position',
            'source', 'status', 'score', 'notes',
            'owner', 'owner_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['score', 'created_at', 'updated_at']


class ContactSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    converted_from_lead_name = serializers.CharField(source='converted_from_lead.name', read_only=True)
    
    class Meta:
        model = Contact
        fields = [
            'id', 'name', 'email', 'phone', 'mobile',
            'company', 'position',
            'address', 'city', 'state', 'country', 'zip_code',
            'linkedin', 'twitter',
            'notes', 'tags', 'is_customer',
            'converted_from_lead', 'converted_from_lead_name',
            'owner', 'owner_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class DealSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    contact_name = serializers.CharField(source='contact.name', read_only=True)
    
    class Meta:
        model = Deal
        fields = [
            'id', 'title', 'description',
            'amount', 'currency', 'probability', 'expected_revenue',
            'stage',
            'contact', 'contact_name',
            'owner', 'owner_name',
            'expected_close_date', 'actual_close_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['expected_revenue', 'created_at', 'updated_at']


class ActivitySerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    lead_name = serializers.CharField(source='lead.name', read_only=True)
    contact_name = serializers.CharField(source='contact.name', read_only=True)
    deal_title = serializers.CharField(source='deal.title', read_only=True)
    
    class Meta:
        model = Activity
        fields = [
            'id', 'activity_type', 'subject', 'description', 'status',
            'lead', 'lead_name',
            'contact', 'contact_name',
            'deal', 'deal_title',
            'owner', 'owner_name',
            'scheduled_at', 'completed_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def validate(self, data):
        """Ensure at least one relationship is set"""
        if not any([data.get('lead'), data.get('contact'), data.get('deal')]):
            raise serializers.ValidationError(
                'At least one of lead, contact, or deal must be set'
            )
        return data
