from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from .models import (
    Department, Company, Employee, Benefit, EmployeeBenefit,
    TimeRecord, Vacation, PerformanceReview, Training, EmployeeTraining,
    JobOpening, Candidate, Payroll,
    EmployeeDocument, EmployeeHistory, TaxTable, HRNotification,
    JobPosition, BankAccount, Dependent, Education, WorkExperience, Contract
)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'manager', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'code']
    ordering = ['name']


@admin.register(JobPosition)
class JobPositionAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'department', 'level', 'salary_min', 'salary_max', 'is_active']
    list_filter = ['department', 'level', 'is_active']
    search_fields = ['code', 'name', 'description']
    ordering = ['department', 'level', 'name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['legal_name', 'trade_name', 'company_type', 'ein', 'owner', 'is_active']
    list_filter = ['company_type', 'is_active', 'country']
    search_fields = ['legal_name', 'trade_name', 'ein']
    ordering = ['legal_name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['employee_number', 'user', 'job_position', 'job_title', 'department', 'hire_type', 'status']
    list_filter = ['status', 'contract_type', 'hire_type', 'department', 'work_shift', 'gender']
    search_fields = ['employee_number', 'user__email', 'user__first_name', 'user__last_name', 'cpf', 'ssn']
    ordering = ['employee_number']
    readonly_fields = ['created_at', 'updated_at', 'employee_number']
    
    fieldsets = (
        (_('User'), {
            'fields': ('user',)
        }),
        (_('Personal Information'), {
            'fields': ('employee_number', 'photo', 'date_of_birth', 'cpf', 'ssn', 'rg', 
                      'gender', 'marital_status', 'nationality', 'ethnicity', 
                      'has_disability', 'disability_description')
        }),
        (_('Address'), {
            'fields': ('address', 'city', 'state', 'zip_code', 'country')
        }),
        (_('Emergency Contact'), {
            'fields': ('emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation')
        }),
        (_('Professional Information'), {
            'fields': ('job_position', 'job_title', 'department', 'supervisor')
        }),
        (_('Contract'), {
            'fields': ('contract_type', 'hire_type', 'company', 'hire_date', 'termination_date',
                      'probation_period_days', 'probation_end_date')
        }),
        (_('Work Schedule'), {
            'fields': ('work_shift', 'weekly_hours', 'work_schedule_start', 'work_schedule_end', 'days_off')
        }),
        (_('Compensation'), {
            'fields': ('base_salary', 'commission_percent')
        }),
        (_('Status'), {
            'fields': ('status',)
        }),
        (_('Metadata'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Benefit)
class BenefitAdmin(admin.ModelAdmin):
    list_display = ['name', 'benefit_type', 'value', 'limit', 'is_active', 'created_at']
    list_filter = ['benefit_type', 'is_active']
    search_fields = ['name', 'description']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(EmployeeBenefit)
class EmployeeBenefitAdmin(admin.ModelAdmin):
    list_display = ['employee', 'benefit', 'value', 'start_date', 'end_date', 'is_active']
    list_filter = ['benefit', 'is_active', 'start_date']
    search_fields = ['employee__user__first_name', 'employee__user__last_name', 'benefit__name']
    ordering = ['-start_date']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(TimeRecord)
class TimeRecordAdmin(admin.ModelAdmin):
    list_display = ['employee', 'record_type', 'record_date', 'record_time', 'is_approved', 'created_at']
    list_filter = ['record_type', 'is_approved', 'record_date']
    search_fields = ['employee__user__first_name', 'employee__user__last_name', 'justification']
    ordering = ['-record_date', '-record_time']
    readonly_fields = ['created_at']


@admin.register(Vacation)
class VacationAdmin(admin.ModelAdmin):
    list_display = ['employee', 'start_date', 'end_date', 'days', 'status', 'approved_by', 'requested_at']
    list_filter = ['status', 'start_date']
    search_fields = ['employee__user__first_name', 'employee__user__last_name', 'rejection_reason']
    ordering = ['-start_date']
    readonly_fields = ['requested_at', 'updated_at']


@admin.register(PerformanceReview)
class PerformanceReviewAdmin(admin.ModelAdmin):
    list_display = ['employee', 'reviewer', 'review_date', 'overall_score', 'status', 'created_at']
    list_filter = ['status', 'review_date']
    search_fields = [
        'employee__user__first_name', 'employee__user__last_name',
        'reviewer__user__first_name', 'reviewer__user__last_name'
    ]
    ordering = ['-review_date']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Training)
class TrainingAdmin(admin.ModelAdmin):
    list_display = ['name', 'training_type', 'start_date', 'end_date', 'is_active', 'created_at']
    list_filter = ['training_type', 'is_active', 'provides_certificate']
    search_fields = ['name', 'description', 'instructor', 'location']
    ordering = ['-start_date', 'name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(EmployeeTraining)
class EmployeeTrainingAdmin(admin.ModelAdmin):
    list_display = ['employee', 'training', 'status', 'score', 'certificate_issued', 'enrollment_date']
    list_filter = ['status', 'certificate_issued', 'training']
    search_fields = [
        'employee__user__first_name', 'employee__user__last_name',
        'training__name'
    ]
    ordering = ['-enrollment_date']
    readonly_fields = ['created_at', 'updated_at', 'enrollment_date']


@admin.register(JobOpening)
class JobOpeningAdmin(admin.ModelAdmin):
    list_display = ['title', 'department', 'status', 'posted_date', 'closing_date', 'created_at']
    list_filter = ['status', 'department', 'posted_date']
    search_fields = ['title', 'description', 'requirements']
    ordering = ['-posted_date']
    readonly_fields = ['created_at', 'updated_at', 'posted_date']


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ['full_name_display', 'email', 'job_opening', 'status', 'applied_at']
    list_filter = ['status', 'job_opening', 'applied_at']
    search_fields = ['first_name', 'last_name', 'email', 'phone', 'notes']
    ordering = ['-applied_at']
    readonly_fields = ['applied_at', 'updated_at']
    
    def full_name_display(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    full_name_display.short_description = _('Full Name')


@admin.register(Payroll)
class PayrollAdmin(admin.ModelAdmin):
    list_display = [
        'payroll_number', 'employee', 'month', 'year',
        'net_salary', 'is_processed', 'processed_at'
    ]
    list_filter = ['is_processed', 'year', 'month']
    search_fields = [
        'payroll_number', 'employee__user__first_name',
        'employee__user__last_name', 'employee__employee_number'
    ]
    ordering = ['-year', '-month']
    readonly_fields = ['created_at', 'updated_at', 'payroll_number', 'total_earnings', 'total_deductions', 'net_salary']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('payroll_number', 'employee', 'month', 'year')
        }),
        (_('Earnings'), {
            'fields': (
                'base_salary', 'commissions', 'overtime', 'bonuses',
                'benefits_value', 'total_earnings'
            )
        }),
        (_('Deductions'), {
            'fields': (
                'inss', 'irrf', 'fgts', 'transportation', 'meal_voucher',
                'loans', 'advances', 'other_deductions', 'total_deductions'
            )
        }),
        (_('Total'), {
            'fields': ('net_salary',)
        }),
        (_('Status'), {
            'fields': ('is_processed', 'processed_at')
        }),
        (_('Metadata'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(EmployeeDocument)
class EmployeeDocumentAdmin(admin.ModelAdmin):
    list_display = ['employee', 'name', 'document_type', 'expiry_date', 'is_active', 'created_at']
    list_filter = ['document_type', 'is_active', 'expiry_date']
    search_fields = ['name', 'description', 'employee__user__first_name', 'employee__user__last_name']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(EmployeeHistory)
class EmployeeHistoryAdmin(admin.ModelAdmin):
    list_display = ['employee', 'change_type', 'effective_date', 'old_job_title', 'new_job_title', 'changed_by']
    list_filter = ['change_type', 'effective_date']
    search_fields = [
        'employee__user__first_name', 'employee__user__last_name',
        'old_job_title', 'new_job_title', 'reason'
    ]
    ordering = ['-effective_date', '-created_at']
    readonly_fields = ['created_at']


@admin.register(TaxTable)
class TaxTableAdmin(admin.ModelAdmin):
    list_display = ['tax_type', 'year', 'month', 'min_value', 'max_value', 'rate', 'deduction', 'is_active']
    list_filter = ['tax_type', 'year', 'is_active']
    search_fields = ['tax_type', 'year']
    ordering = ['tax_type', 'year', 'min_value']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(HRNotification)
class HRNotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'employee', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['title', 'message', 'employee__user__first_name', 'employee__user__last_name']
    ordering = ['-created_at']
    readonly_fields = ['created_at']


@admin.register(BankAccount)
class BankAccountAdmin(admin.ModelAdmin):
    list_display = ['employee', 'bank_name', 'account_number', 'is_primary', 'is_active']
    list_filter = ['is_primary', 'is_active', 'account_type']
    search_fields = ['bank_name', 'account_number', 'pix_key', 'employee__user__first_name', 'employee__user__last_name']
    ordering = ['-is_primary', 'bank_name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Dependent)
class DependentAdmin(admin.ModelAdmin):
    list_display = ['name', 'employee', 'relationship', 'date_of_birth', 'is_tax_dependent', 'is_active']
    list_filter = ['relationship', 'is_tax_dependent', 'is_active']
    search_fields = ['name', 'cpf', 'ssn', 'employee__user__first_name', 'employee__user__last_name']
    ordering = ['employee', 'relationship', 'name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ['employee', 'level', 'institution', 'course', 'graduation_year', 'is_completed']
    list_filter = ['level', 'is_completed']
    search_fields = ['institution', 'course', 'employee__user__first_name', 'employee__user__last_name']
    ordering = ['-end_date', '-graduation_year', 'level']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(WorkExperience)
class WorkExperienceAdmin(admin.ModelAdmin):
    list_display = ['employee', 'company_name', 'job_title', 'start_date', 'end_date', 'is_current']
    list_filter = ['is_current']
    search_fields = ['company_name', 'job_title', 'employee__user__first_name', 'employee__user__last_name']
    ordering = ['-start_date']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ['contract_number', 'employee', 'contract_type', 'start_date', 'end_date', 'status', 'generated_at']
    list_filter = ['contract_type', 'status', 'start_date']
    search_fields = ['contract_number', 'notes', 'employee__user__first_name', 'employee__user__last_name']
    ordering = ['-created_at']
    readonly_fields = ['contract_number', 'created_at', 'updated_at', 'generated_at']
    
    fieldsets = (
        (_('Contract Information'), {
            'fields': ('contract_number', 'employee', 'contract_type', 'status')
        }),
        (_('Dates'), {
            'fields': ('start_date', 'end_date', 'signature_date')
        }),
        (_('Files'), {
            'fields': ('pdf_file', 'generated_at')
        }),
        (_('Additional Data'), {
            'fields': ('contract_data', 'notes'),
            'classes': ('collapse',)
        }),
        (_('Metadata'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

