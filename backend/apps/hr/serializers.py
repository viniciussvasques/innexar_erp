from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import (
    Department, Company, Employee, Benefit, EmployeeBenefit,
    TimeRecord, Vacation, PerformanceReview, Training, EmployeeTraining,
    JobOpening, Candidate, Payroll, JobPosition, BankAccount, Dependent,
    Education, WorkExperience, Contract, EmployeeDocument, EmployeeHistory,
    HRNotification
)
from apps.users.serializers import UserSerializer


class DepartmentSerializer(serializers.ModelSerializer):
    manager_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Department
        fields = [
            'id', 'name', 'code', 'description', 'manager', 'manager_name',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_manager_name(self, obj):
        """Get manager name safely handling null user"""
        if obj.manager and obj.manager.user:
            return obj.manager.user.get_full_name()
        return None


class JobPositionSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    
    class Meta:
        model = JobPosition
        fields = [
            'id', 'code', 'name', 'department', 'department_name',
            'level', 'level_display', 'salary_min', 'salary_max',
            'description', 'requirements', 'responsibilities',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class CompanySerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.user.get_full_name', read_only=True)
    company_type_display = serializers.CharField(source='get_company_type_display', read_only=True)
    
    class Meta:
        model = Company
        fields = [
            'id', 'legal_name', 'trade_name', 'company_type', 'company_type_display',
            'ein', 'address', 'city', 'state', 'zip_code', 'country',
            'phone', 'email', 'website', 'owner', 'owner_name',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def validate_ein(self, value):
        """Validate EIN format (basic validation)"""
        if value and len(value.replace('-', '')) not in [9, 10]:
            raise serializers.ValidationError(_('EIN must be 9 or 10 digits'))
        return value


class EmployeeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True, required=False)
    department_name = serializers.CharField(source='department.name', read_only=True)
    # warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)  # TODO: Uncomment when warehouse module is created
    supervisor_name = serializers.SerializerMethodField()
    company_name = serializers.CharField(source='company.legal_name', read_only=True)
    contract_type_display = serializers.CharField(source='get_contract_type_display', read_only=True)
    hire_type_display = serializers.CharField(source='get_hire_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    # Write-only fields for IDs (frontend sends these)
    department_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    supervisor_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    company_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    job_position_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    # Display fields
    job_position_name = serializers.CharField(source='job_position.name', read_only=True)
    job_position_code = serializers.CharField(source='job_position.code', read_only=True)
    gender_display = serializers.CharField(source='get_gender_display', read_only=True)
    marital_status_display = serializers.CharField(source='get_marital_status_display', read_only=True)
    work_shift_display = serializers.CharField(source='get_work_shift_display', read_only=True)
    photo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Employee
        fields = [
            'id', 'user', 'user_id', 'employee_number',
            # Dados pessoais
            'date_of_birth', 'cpf', 'ssn', 'rg', 'gender', 'gender_display',
            'marital_status', 'marital_status_display', 'nationality',
            'photo', 'photo_url', 'ethnicity', 'has_disability', 'disability_description',
            # Endereço
            'address', 'city', 'state', 'zip_code', 'country',
            # Contatos de emergência
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation',
            # Dados profissionais
            'job_position', 'job_position_id', 'job_position_name', 'job_position_code',
            'job_title', 'department', 'department_id', 'department_name',
            'supervisor', 'supervisor_id', 'supervisor_name',
            # Contrato
            'contract_type', 'contract_type_display', 'hire_type', 'hire_type_display',
            'company', 'company_id', 'company_name',
            'hire_date', 'termination_date',
            'probation_period_days', 'probation_end_date',
            # Jornada de trabalho
            'work_shift', 'work_shift_display', 'weekly_hours',
            'work_schedule_start', 'work_schedule_end', 'days_off',
            # Salário
            'base_salary', 'commission_percent',
            # Status
            'status', 'status_display',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'employee_number', 'photo_url']
    
    def get_photo_url(self, obj):
        """Get photo URL"""
        if obj.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url
        return None
    
    def get_supervisor_name(self, obj):
        """Get supervisor name safely handling null user"""
        if obj.supervisor and obj.supervisor.user:
            return obj.supervisor.user.get_full_name()
        return None
    
    def create(self, validated_data):
        # Process user_id
        user_id = validated_data.pop('user_id', None)
        if user_id:
            from apps.users.models import User
            validated_data['user'] = User.objects.get(id=user_id)
        
        # Process foreign key IDs
        department_id = validated_data.pop('department_id', None)
        if department_id is not None:
            if department_id:
                validated_data['department'] = Department.objects.get(id=department_id)
            else:
                validated_data['department'] = None
        
        job_position_id = validated_data.pop('job_position_id', None)
        if job_position_id is not None:
            if job_position_id:
                from .models import JobPosition
                validated_data['job_position'] = JobPosition.objects.get(id=job_position_id)
            else:
                validated_data['job_position'] = None
        
        supervisor_id = validated_data.pop('supervisor_id', None)
        if supervisor_id is not None:
            if supervisor_id:
                validated_data['supervisor'] = Employee.objects.get(id=supervisor_id)
            else:
                validated_data['supervisor'] = None
        
        company_id = validated_data.pop('company_id', None)
        if company_id is not None:
            if company_id:
                validated_data['company'] = Company.objects.get(id=company_id)
            else:
                validated_data['company'] = None
        
        # Convert empty strings to None for optional fields
        optional_fields = [
            'date_of_birth', 'cpf', 'ssn', 'rg', 'gender', 'marital_status', 'nationality',
            'address', 'city', 'state', 'zip_code', 'country',
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation',
            'termination_date', 'commission_percent', 'ethnicity', 'disability_description',
            'probation_period_days', 'probation_end_date', 'work_shift', 'weekly_hours',
            'work_schedule_start', 'work_schedule_end', 'days_off'
        ]
        for field in optional_fields:
            if field in validated_data and validated_data[field] == '':
                validated_data[field] = None
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Process user_id
        user_id = validated_data.pop('user_id', None)
        if user_id is not None:  # Allow setting user_id to None to clear the user
            from apps.users.models import User
            if user_id:
                validated_data['user'] = User.objects.get(id=user_id)
            else:
                validated_data['user'] = None
        
        # Process foreign key IDs
        department_id = validated_data.pop('department_id', None)
        if department_id is not None:
            if department_id:
                validated_data['department'] = Department.objects.get(id=department_id)
            else:
                validated_data['department'] = None
        
        supervisor_id = validated_data.pop('supervisor_id', None)
        if supervisor_id is not None:
            if supervisor_id:
                validated_data['supervisor'] = Employee.objects.get(id=supervisor_id)
            else:
                validated_data['supervisor'] = None
        
        company_id = validated_data.pop('company_id', None)
        if company_id is not None:
            if company_id:
                validated_data['company'] = Company.objects.get(id=company_id)
            else:
                validated_data['company'] = None
        
        # Handle nullable foreign keys - convert empty strings or "none" to None
        nullable_fk_fields = ['department', 'supervisor', 'company']
        for field in nullable_fk_fields:
            if field in validated_data:
                value = validated_data[field]
                if value == '' or value == 'none' or value is None:
                    validated_data[field] = None
        
        # Convert empty strings to None for optional text fields
        optional_fields = [
            'date_of_birth', 'cpf', 'ssn', 'rg', 'gender', 'marital_status', 'nationality',
            'address', 'city', 'state', 'zip_code', 'country',
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation',
            'termination_date', 'commission_percent', 'ethnicity', 'disability_description',
            'probation_period_days', 'probation_end_date', 'work_shift', 'weekly_hours',
            'work_schedule_start', 'work_schedule_end', 'days_off'
        ]
        for field in optional_fields:
            if field in validated_data and validated_data[field] == '':
                validated_data[field] = None
        
        return super().update(instance, validated_data)


class BenefitSerializer(serializers.ModelSerializer):
    benefit_type_display = serializers.CharField(source='get_benefit_type_display', read_only=True)
    
    class Meta:
        model = Benefit
        fields = [
            'id', 'name', 'benefit_type', 'benefit_type_display', 'description',
            'value', 'limit', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class EmployeeBenefitSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    benefit_name = serializers.CharField(source='benefit.name', read_only=True)
    
    class Meta:
        model = EmployeeBenefit
        fields = [
            'id', 'employee', 'employee_name', 'benefit', 'benefit_name',
            'value', 'start_date', 'end_date', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_employee_name(self, obj):
        """Get employee name safely handling null user"""
        if obj.employee and obj.employee.user:
            return obj.employee.user.get_full_name()
        return obj.employee.employee_number if obj.employee else None


class TimeRecordSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    record_type_display = serializers.CharField(source='get_record_type_display', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = TimeRecord
        fields = [
            'id', 'employee', 'employee_name', 'record_type', 'record_type_display',
            'record_date', 'record_time', 'latitude', 'longitude',
            'is_approved', 'approved_by', 'approved_by_name', 'approved_at',
            'justification', 'created_at'
        ]
        read_only_fields = ['created_at']
    
    def get_employee_name(self, obj):
        """Get employee name safely handling null user"""
        if obj.employee and obj.employee.user:
            return obj.employee.user.get_full_name()
        return obj.employee.employee_number if obj.employee else None


class VacationSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = Vacation
        fields = [
            'id', 'employee', 'employee_name', 'status', 'status_display',
            'start_date', 'end_date', 'days',
            'acquisition_period_start', 'acquisition_period_end',
            'sell_days', 'cash_allowance',
            'approved_by', 'approved_by_name', 'approved_at', 'rejection_reason',
            'requested_at', 'updated_at'
        ]
        read_only_fields = ['requested_at', 'updated_at']
    
    def get_employee_name(self, obj):
        """Get employee name safely handling null user"""
        if obj.employee and obj.employee.user:
            return obj.employee.user.get_full_name()
        return obj.employee.employee_number if obj.employee else None


class PerformanceReviewSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    reviewer_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = PerformanceReview
        fields = [
            'id', 'employee', 'employee_name', 'reviewer', 'reviewer_name',
            'review_period_start', 'review_period_end', 'review_date',
            'status', 'status_display',
            'criteria_scores', 'overall_score',
            'strengths', 'areas_for_improvement', 'goals', 'development_plan',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_employee_name(self, obj):
        """Get employee name safely handling null user"""
        if obj.employee and obj.employee.user:
            return obj.employee.user.get_full_name()
        return obj.employee.employee_number if obj.employee else None
    
    def get_reviewer_name(self, obj):
        """Get reviewer name safely handling null user"""
        if obj.reviewer and obj.reviewer.user:
            return obj.reviewer.user.get_full_name()
        return obj.reviewer.employee_number if obj.reviewer else None


class TrainingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Training
        fields = [
            'id', 'name', 'description', 'training_type',
            'start_date', 'end_date', 'duration_hours',
            'location', 'instructor',
            'provides_certificate', 'certificate_validity_months',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class EmployeeTrainingSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    training_name = serializers.CharField(source='training.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = EmployeeTraining
        fields = [
            'id', 'employee', 'employee_name', 'training', 'training_name',
            'status', 'status_display',
            'enrollment_date', 'completion_date', 'score',
            'certificate_issued', 'certificate_issued_date', 'certificate_expiry_date',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'enrollment_date']
    
    def get_employee_name(self, obj):
        """Get employee name safely handling null user"""
        if obj.employee and obj.employee.user:
            return obj.employee.user.get_full_name()
        return obj.employee.employee_number if obj.employee else None


class JobOpeningSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = JobOpening
        fields = [
            'id', 'title', 'department', 'department_name',
            'description', 'requirements',
            'salary_min', 'salary_max',
            'posted_date', 'closing_date',
            'status', 'status_display',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'posted_date']


class CandidateSerializer(serializers.ModelSerializer):
    job_opening_title = serializers.CharField(source='job_opening.title', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Candidate
        fields = [
            'id', 'first_name', 'last_name', 'full_name',
            'email', 'phone',
            'job_opening', 'job_opening_title',
            'status', 'status_display',
            'resume', 'notes',
            'applied_at', 'updated_at'
        ]
        read_only_fields = ['applied_at', 'updated_at']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"


class PayrollSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    employee_number = serializers.CharField(source='employee.employee_number', read_only=True)
    
    class Meta:
        model = Payroll
        fields = [
            'id', 'payroll_number', 'month', 'year',
            'employee', 'employee_name', 'employee_number',
            'base_salary', 'commissions', 'overtime', 'bonuses', 'benefits_value', 'total_earnings',
            'inss', 'irrf', 'fgts', 'transportation', 'meal_voucher',
            'loans', 'advances', 'other_deductions', 'total_deductions',
            'net_salary',
            'is_processed', 'processed_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'created_at', 'updated_at', 'payroll_number',
            'total_earnings', 'total_deductions', 'net_salary'
        ]
    
    def get_employee_name(self, obj):
        """Get employee name safely handling null user"""
        if obj.employee and obj.employee.user:
            return obj.employee.user.get_full_name()
        return obj.employee.employee_number if obj.employee else None


class BankAccountSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    account_type_display = serializers.CharField(source='get_account_type_display', read_only=True)
    pix_key_type_display = serializers.CharField(source='get_pix_key_type_display', read_only=True)
    
    class Meta:
        model = BankAccount
        fields = [
            'id', 'employee', 'employee_name',
            'bank_name', 'bank_code', 'agency', 'account_number', 'account_type', 'account_type_display',
            'pix_key', 'pix_key_type', 'pix_key_type_display',
            'is_primary', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_employee_name(self, obj):
        """Get employee name safely handling null user"""
        if obj.employee.user:
            return obj.employee.user.get_full_name()
        return obj.employee.employee_number


class DependentSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    relationship_display = serializers.CharField(source='get_relationship_display', read_only=True)
    
    class Meta:
        model = Dependent
        fields = [
            'id', 'employee', 'employee_name',
            'name', 'date_of_birth', 'cpf', 'ssn', 'relationship', 'relationship_display',
            'is_tax_dependent', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_employee_name(self, obj):
        """Get employee name safely handling null user"""
        if obj.employee.user:
            return obj.employee.user.get_full_name()
        return obj.employee.employee_number


class EducationSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    certificate_file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Education
        fields = [
            'id', 'employee', 'employee_name',
            'level', 'level_display', 'institution', 'course',
            'start_date', 'end_date', 'is_completed', 'graduation_year',
            'certificate_file', 'certificate_file_url',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_employee_name(self, obj):
        """Get employee name safely handling null user"""
        if obj.employee.user:
            return obj.employee.user.get_full_name()
        return obj.employee.employee_number
    
    def get_certificate_file_url(self, obj):
        """Get certificate file URL"""
        if obj.certificate_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.certificate_file.url)
            return obj.certificate_file.url
        return None


class WorkExperienceSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    
    class Meta:
        model = WorkExperience
        fields = [
            'id', 'employee', 'employee_name',
            'company_name', 'job_title', 'start_date', 'end_date', 'is_current',
            'description', 'responsibilities', 'achievements',
            'reference_name', 'reference_phone', 'reference_email',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_employee_name(self, obj):
        """Get employee name safely handling null user"""
        if obj.employee.user:
            return obj.employee.user.get_full_name()
        return obj.employee.employee_number


class ContractSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    employee_number = serializers.CharField(source='employee.employee_number', read_only=True)
    contract_type_display = serializers.CharField(source='get_contract_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    pdf_file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Contract
        fields = [
            'id', 'contract_number', 'employee', 'employee_name', 'employee_number',
            'contract_type', 'contract_type_display',
            'start_date', 'end_date', 'signature_date',
            'pdf_file', 'pdf_file_url',
            'status', 'status_display',
            'contract_data', 'notes',
            'created_at', 'updated_at', 'generated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'contract_number', 'generated_at']
    
    def get_employee_name(self, obj):
        """Get employee name safely handling null user"""
        if obj.employee.user:
            return obj.employee.user.get_full_name()
        return obj.employee.employee_number
    
    def get_pdf_file_url(self, obj):
        """Get PDF file URL"""
        if obj.pdf_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.pdf_file.url)
            return obj.pdf_file.url
        return None


class EmployeeDocumentSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    employee_number = serializers.CharField(source='employee.employee_number', read_only=True)
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    file_url = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    days_until_expiry = serializers.SerializerMethodField()
    
    class Meta:
        model = EmployeeDocument
        fields = [
            'id', 'employee', 'employee_name', 'employee_number',
            'document_type', 'document_type_display',
            'name', 'description',
            'file', 'file_url',
            'expiry_date', 'is_expired', 'days_until_expiry',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_employee_name(self, obj):
        """Get employee name safely handling null user"""
        if obj.employee.user:
            return obj.employee.user.get_full_name()
        return obj.employee.employee_number
    
    def get_file_url(self, obj):
        """Get file URL"""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None
    
    def get_is_expired(self, obj):
        """Check if document is expired"""
        if obj.expiry_date:
            from datetime import date
            return date.today() > obj.expiry_date
        return False
    
    def get_days_until_expiry(self, obj):
        """Get days until expiry (negative if expired)"""
        if obj.expiry_date:
            from datetime import date
            delta = obj.expiry_date - date.today()
            return delta.days
        return None


class HRNotificationSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    employee_number = serializers.SerializerMethodField()
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    
    class Meta:
        model = HRNotification
        fields = [
            'id', 'employee', 'employee_name', 'employee_number',
            'notification_type', 'notification_type_display',
            'title', 'message', 'is_read', 'read_at',
            'action_url', 'created_at'
        ]
        read_only_fields = ['created_at', 'read_at']
    
    def get_employee_name(self, obj):
        """Get employee name safely handling null user"""
        if obj.employee and obj.employee.user:
            return obj.employee.user.get_full_name()
        elif obj.employee:
            return obj.employee.employee_number
        return None
    
    def get_employee_number(self, obj):
        """Get employee number"""
        if obj.employee:
            return obj.employee.employee_number
        return None


class EmployeeHistorySerializer(serializers.ModelSerializer):
    """Serializer for EmployeeHistory"""
    employee_name = serializers.SerializerMethodField()
    employee_number = serializers.CharField(source='employee.employee_number', read_only=True)
    change_type_display = serializers.CharField(source='get_change_type_display', read_only=True)
    old_department_name = serializers.CharField(source='old_department.name', read_only=True)
    new_department_name = serializers.CharField(source='new_department.name', read_only=True)
    changed_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = EmployeeHistory
        fields = [
            'id', 'employee', 'employee_name', 'employee_number',
            'change_type', 'change_type_display',
            'old_job_title', 'new_job_title',
            'old_department', 'old_department_name',
            'new_department', 'new_department_name',
            'old_salary', 'new_salary',
            'reason', 'notes',
            'changed_by', 'changed_by_name',
            'effective_date', 'created_at'
        ]
        read_only_fields = ['created_at']
    
    def get_employee_name(self, obj):
        """Get employee name safely handling null user"""
        if obj.employee.user:
            return obj.employee.user.get_full_name()
        return obj.employee.employee_number
    
    def get_changed_by_name(self, obj):
        """Get changed by user name"""
        if obj.changed_by:
            return obj.changed_by.get_full_name()
        return None

