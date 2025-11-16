from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.translation import gettext_lazy as _
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from .models import (
    Department, Company, Employee, Benefit, EmployeeBenefit,
    TimeRecord, Vacation, PerformanceReview, Training, EmployeeTraining,
    JobOpening, Candidate, Payroll, JobPosition, BankAccount, Dependent,
    Education, WorkExperience, Contract, EmployeeDocument, EmployeeHistory,
    HRNotification
)
from .serializers import (
    DepartmentSerializer, CompanySerializer, EmployeeSerializer,
    BenefitSerializer, EmployeeBenefitSerializer, TimeRecordSerializer,
    VacationSerializer, PerformanceReviewSerializer, TrainingSerializer,
    EmployeeTrainingSerializer, JobOpeningSerializer, CandidateSerializer,
    PayrollSerializer, JobPositionSerializer, BankAccountSerializer,
    DependentSerializer, EducationSerializer, WorkExperienceSerializer,
    ContractSerializer, EmployeeDocumentSerializer, EmployeeHistorySerializer,
    HRNotificationSerializer
)
from apps.users.permissions import HasModulePermission
from .notifications import (
    check_document_expiry,
    check_vacation_expiry,
    check_pending_time_records,
    run_all_notification_checks,
)
from .helpers import (
    get_language_from_request,
    get_departments_with_fallback,
    get_job_positions_with_fallback,
    get_benefits_with_fallback,
)


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Department management
    Uses hardcoded data as fallback if database is empty
    """
    queryset = Department.objects.select_related('manager__user').all()
    serializer_class = DepartmentSerializer
    permission_classes = [HasModulePermission]
    required_module = 'hr'
    required_level = 'view'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'code', 'description']
    filterset_fields = ['is_active', 'manager']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def list(self, request, *args, **kwargs):
        """List departments with fallback to hardcoded data"""
        # Try to get from database first
        try:
            response = super().list(request, *args, **kwargs)
            # If we have results, return them
            if response.data.get('results') or response.data.get('count', 0) > 0:
                return response
        except Exception:
            # Database error, will use fallback
            pass
        
        # Fallback to hardcoded data
        lang = get_language_from_request(request)
        active_only = request.query_params.get('active_only') == 'true'
        departments = get_departments_with_fallback(lang, active_only)
        
        # Convert to serializer format
        from rest_framework.pagination import PageNumberPagination
        paginator = PageNumberPagination()
        paginator.page_size = request.query_params.get('page_size', 100)
        
        page = paginator.paginate_queryset(departments, request)
        if page is not None:
            # Serialize hardcoded data
            serialized = []
            for dept in page:
                serialized.append({
                    'id': dept.get('id'),
                    'code': dept['code'],
                    'name': dept['name'],
                    'description': dept['description'],
                    'is_active': dept['is_active'],
                    'manager': None,
                    'created_at': None,
                    'updated_at': None,
                })
            return paginator.get_paginated_response(serialized)
        
        # No pagination
        serialized = [
            {
                'id': dept.get('id'),
                'code': dept['code'],
                'name': dept['name'],
                'description': dept['description'],
                'is_active': dept['is_active'],
                'manager': None,
                'created_at': None,
                'updated_at': None,
            }
            for dept in departments
        ]
        return Response({
            'count': len(serialized),
            'next': None,
            'previous': None,
            'results': serialized
        })


class JobPositionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Job Position management
    Uses hardcoded data as fallback if database is empty
    """
    queryset = JobPosition.objects.select_related('department').all()
    serializer_class = JobPositionSerializer
    permission_classes = [HasModulePermission]
    required_module = 'hr'
    required_level = 'view'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['code', 'name', 'description']
    filterset_fields = ['department', 'level', 'is_active']
    ordering_fields = ['code', 'name', 'level', 'created_at']
    ordering = ['department', 'level', 'name']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.query_params.get('active_only') == 'true':
            queryset = queryset.filter(is_active=True)
        return queryset
    
    def list(self, request, *args, **kwargs):
        """List job positions with fallback to hardcoded data"""
        # Try to get from database first
        try:
            response = super().list(request, *args, **kwargs)
            # If we have results, return them
            if response.data.get('results') or response.data.get('count', 0) > 0:
                return response
        except Exception:
            # Database error, will use fallback
            pass
        
        # Fallback to hardcoded data
        lang = get_language_from_request(request)
        active_only = request.query_params.get('active_only') == 'true'
        department_id = request.query_params.get('department')
        dept_id = int(department_id) if department_id else None
        
        positions = get_job_positions_with_fallback(lang, dept_id, active_only)
        
        # Convert to serializer format
        from rest_framework.pagination import PageNumberPagination
        paginator = PageNumberPagination()
        paginator.page_size = request.query_params.get('page_size', 100)
        
        page = paginator.paginate_queryset(positions, request)
        if page is not None:
            serialized = []
            for pos in page:
                serialized.append({
                    'id': pos.get('id'),
                    'code': pos['code'],
                    'name': pos['name'],
                    'department': pos.get('department_id'),
                    'department_id': pos.get('department_id'),
                    'level': pos['level'],
                    'is_active': pos['is_active'],
                    'salary_min': None,
                    'salary_max': None,
                    'description': '',
                    'requirements': '',
                    'responsibilities': '',
                    'created_at': None,
                    'updated_at': None,
                })
            return paginator.get_paginated_response(serialized)
        
        # No pagination
        serialized = [
            {
                'id': pos.get('id'),
                'code': pos['code'],
                'name': pos['name'],
                'department': pos.get('department_id'),
                'department_id': pos.get('department_id'),
                'level': pos['level'],
                'is_active': pos['is_active'],
                'salary_min': None,
                'salary_max': None,
                'description': '',
                'requirements': '',
                'responsibilities': '',
                'created_at': None,
                'updated_at': None,
            }
            for pos in positions
        ]
        return Response({
            'count': len(serialized),
            'next': None,
            'previous': None,
            'results': serialized
        })


class CompanyViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Company management
    """
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [HasModulePermission]
    required_module = 'hr'
    required_level = 'view'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['legal_name', 'trade_name', 'tax_id', 'registration_number']
    filterset_fields = ['company_type', 'is_active']
    ordering_fields = ['legal_name', 'created_at']
    ordering = ['legal_name']


class EmployeeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Employee management
    """
    queryset = Employee.objects.select_related(
        'user', 'department', 'supervisor__user', 'job_position', 'company'
    ).all()
    serializer_class = EmployeeSerializer
    permission_classes = [HasModulePermission]
    required_module = 'hr'
    required_level = 'view'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = [
        'employee_number', 'user__first_name', 'user__last_name',
        'user__email', 'job_title', 'cpf', 'ssn'
    ]
    filterset_fields = [
        'department', 'status', 'hire_type', 'contract_type',
        'job_position', 'supervisor', 'company'
    ]
    ordering_fields = ['employee_number', 'hire_date', 'created_at']
    ordering = ['employee_number']
    
    @action(detail=False, methods=['get'])
    def by_user(self, request):
        """Get employee by user ID"""
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {'error': _('user_id is required')},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            employee = Employee.objects.select_related('user', 'department', 'job_position', 'supervisor__user').get(user_id=user_id)
            serializer = self.get_serializer(employee)
            return Response(serializer.data)
        except Employee.DoesNotExist:
            return Response(
                {'error': _('Employee not found')},
                status=status.HTTP_404_NOT_FOUND
            )


class BankAccountViewSet(viewsets.ModelViewSet):
    """ViewSet for Bank Account management"""
    queryset = BankAccount.objects.select_related('employee__user').all()
    serializer_class = BankAccountSerializer
    permission_classes = [HasModulePermission]
    required_module = 'hr'
    required_level = 'view'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['employee', 'account_type', 'is_primary']
    search_fields = ['bank_name', 'account_number', 'pix_key']
    ordering_fields = ['created_at']
    ordering = ['-created_at']


class DependentViewSet(viewsets.ModelViewSet):
    """ViewSet for Dependent management"""
    queryset = Dependent.objects.select_related('employee__user').all()
    serializer_class = DependentSerializer
    permission_classes = [HasModulePermission]
    required_module = 'hr'
    required_level = 'view'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['employee', 'relationship', 'is_tax_dependent']
    search_fields = ['name', 'cpf', 'ssn']
    ordering_fields = ['created_at']
    ordering = ['-created_at']


class EducationViewSet(viewsets.ModelViewSet):
    """ViewSet for Education management"""
    queryset = Education.objects.select_related('employee__user').all()
    serializer_class = EducationSerializer
    permission_classes = [HasModulePermission]
    required_module = 'hr'
    required_level = 'view'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['employee', 'level', 'is_completed']
    search_fields = ['institution', 'course']
    ordering_fields = ['start_date', 'end_date', 'created_at']
    ordering = ['-start_date']


class WorkExperienceViewSet(viewsets.ModelViewSet):
    """ViewSet for Work Experience management"""
    queryset = WorkExperience.objects.select_related('employee__user').all()
    serializer_class = WorkExperienceSerializer
    permission_classes = [HasModulePermission]
    required_module = 'hr'
    required_level = 'view'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['employee', 'is_current']
    search_fields = ['company_name', 'job_title']
    ordering_fields = ['start_date', 'end_date', 'created_at']
    ordering = ['-start_date']


class ContractViewSet(viewsets.ModelViewSet):
    """ViewSet for Contract management"""
    queryset = Contract.objects.select_related('employee__user').all()
    serializer_class = ContractSerializer
    permission_classes = [HasModulePermission]
    required_module = 'hr'
    required_level = 'view'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['employee', 'contract_type', 'status']
    search_fields = ['contract_number', 'notes']
    ordering_fields = ['start_date', 'end_date', 'created_at']
    ordering = ['-start_date']
    
    @action(detail=True, methods=['post'])
    def generate_pdf(self, request, pk=None):
        """Generate PDF for contract"""
        contract = self.get_object()
        try:
            from .contracts import generate_contract_pdf
            pdf_file = generate_contract_pdf(contract.employee, contract.contract_type, contract_data=contract.contract_data)
            contract.pdf_file = pdf_file
            contract.save()
            serializer = self.get_serializer(contract)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def generate_for_employee(self, request):
        """Generate contract for employee"""
        employee_id = request.data.get('employee_id')
        contract_type = request.data.get('contract_type')
        
        if not all([employee_id, contract_type]):
            return Response(
                {'error': _('employee_id and contract_type are required')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            employee = Employee.objects.get(id=employee_id)
            from .contracts import generate_contract_pdf
            
            contract = Contract.objects.create(
                employee=employee,
                contract_type=contract_type,
                start_date=request.data.get('start_date') or timezone.now().date(),
                end_date=request.data.get('end_date'),
                notes=request.data.get('notes', ''),
            )
            
            pdf_file = generate_contract_pdf(employee, contract_type, contract_data=request.data.get('contract_data'))
            contract.pdf_file = pdf_file
            contract.save()
            
            serializer = self.get_serializer(contract)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Employee.DoesNotExist:
            return Response(
                {'error': _('Employee not found')},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class EmployeeDocumentViewSet(viewsets.ModelViewSet):
    """ViewSet for Employee Document management"""
    queryset = EmployeeDocument.objects.select_related('employee__user').all()
    serializer_class = EmployeeDocumentSerializer
    permission_classes = [HasModulePermission]
    required_module = 'hr'
    required_level = 'view'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    filterset_fields = ['employee', 'document_type', 'is_active']
    ordering_fields = ['expiry_date', 'created_at']
    ordering = ['-created_at']
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download document file"""
        document = self.get_object()
        if not document.file:
            return Response(
                {'error': _('Document file not found')},
                status=status.HTTP_404_NOT_FOUND
            )
        
        from django.http import FileResponse
        return FileResponse(
            document.file.open('rb'),
            as_attachment=True,
            filename=document.file.name.split('/')[-1]
        )
    
    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        """Get documents expiring soon"""
        days = int(request.query_params.get('days', 30))
        from datetime import date, timedelta
        expiry_date = date.today() + timedelta(days=days)
        
        documents = self.get_queryset().filter(
            expiry_date__lte=expiry_date,
            expiry_date__gte=date.today(),
            is_active=True
        )
        serializer = self.get_serializer(documents, many=True)
        return Response(serializer.data)


class EmployeeHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Employee History (read-only)"""
    queryset = EmployeeHistory.objects.select_related(
        'employee__user', 'old_department', 'new_department', 'changed_by'
    ).all()
    serializer_class = EmployeeHistorySerializer
    permission_classes = [HasModulePermission]
    required_module = 'hr'
    required_level = 'view'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['employee', 'change_type']
    search_fields = ['old_job_title', 'new_job_title', 'reason', 'notes']
    ordering_fields = ['effective_date', 'created_at']
    ordering = ['-effective_date', '-created_at']


class BenefitViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Benefit management
    Uses hardcoded data as fallback if database is empty
    """
    queryset = Benefit.objects.all()
    serializer_class = BenefitSerializer
    permission_classes = [HasModulePermission]
    required_module = 'hr'
    required_level = 'view'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    filterset_fields = ['benefit_type', 'is_active']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def list(self, request, *args, **kwargs):
        """List benefits with fallback to hardcoded data"""
        # Try to get from database first
        try:
            response = super().list(request, *args, **kwargs)
            # If we have results, return them
            if response.data.get('results') or response.data.get('count', 0) > 0:
                return response
        except Exception:
            # Database error, will use fallback
            pass
        
        # Fallback to hardcoded data
        # Try to get from tenant settings first
        from .helpers import get_tenant_settings
        settings = get_tenant_settings(request)
        
        if settings:
            lang = settings.get('language', get_language_from_request(request))
            country = settings.get('country', 'BR')
        else:
            lang = get_language_from_request(request)
            country = 'BR'
        
        active_only = request.query_params.get('active_only') == 'true'
        
        benefits = get_benefits_with_fallback(lang, country, active_only)
        
        # Convert to serializer format
        from rest_framework.pagination import PageNumberPagination
        paginator = PageNumberPagination()
        paginator.page_size = request.query_params.get('page_size', 100)
        
        page = paginator.paginate_queryset(benefits, request)
        if page is not None:
            serialized = []
            for benefit in page:
                serialized.append({
                    'id': benefit.get('id'),
                    'name': benefit['name'],
                    'benefit_type': benefit['benefit_type'],
                    'description': benefit['description'],
                    'value': benefit.get('value'),
                    'limit': benefit.get('limit'),
                    'is_active': benefit['is_active'],
                    'created_at': None,
                    'updated_at': None,
                })
            return paginator.get_paginated_response(serialized)
        
        # No pagination
        serialized = [
            {
                'id': benefit.get('id'),
                'name': benefit['name'],
                'benefit_type': benefit['benefit_type'],
                'description': benefit['description'],
                'value': benefit.get('value'),
                'limit': benefit.get('limit'),
                'is_active': benefit['is_active'],
                'created_at': None,
                'updated_at': None,
            }
            for benefit in benefits
        ]
        return Response({
            'count': len(serialized),
            'next': None,
            'previous': None,
            'results': serialized
        })


class EmployeeBenefitViewSet(viewsets.ModelViewSet):
    """ViewSet for Employee Benefit management"""
    queryset = EmployeeBenefit.objects.select_related('employee__user', 'benefit').all()
    serializer_class = EmployeeBenefitSerializer
    permission_classes = [HasModulePermission]
    required_module = 'hr'
    required_level = 'view'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['employee', 'benefit', 'status']
    search_fields = ['benefit__name']
    ordering_fields = ['start_date', 'end_date', 'created_at']
    ordering = ['-start_date']


class TimeRecordViewSet(viewsets.ModelViewSet):
    """ViewSet for Time Record management"""
    queryset = TimeRecord.objects.select_related('employee__user', 'approved_by').all()
    serializer_class = TimeRecordSerializer
    permission_classes = [HasModulePermission]
    required_module = 'hr'
    required_level = 'view'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['employee', 'record_type', 'is_approved', 'record_date']
    search_fields = ['employee__user__first_name', 'employee__user__last_name', 'justification']
    ordering_fields = ['record_date', 'record_time', 'created_at']
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a time record"""
        time_record = self.get_object()
        time_record.is_approved = True
        time_record.approved_by = request.user
        time_record.approved_at = timezone.now()
        time_record.save()
        serializer = self.get_serializer(time_record)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def calculate_hours(self, request):
        """
        Calculate work hours and overtime for an employee in a period
        """
        employee_id = request.query_params.get('employee_id')
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        
        if not all([employee_id, year, month]):
            return Response(
                {'error': _('employee_id, year, and month are required')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            employee = Employee.objects.get(id=employee_id)
            from .calculations import calculate_overtime_hours
            
            result = calculate_overtime_hours(employee, int(year), int(month))
            return Response(result, status=status.HTTP_200_OK)
        except Employee.DoesNotExist:
            return Response(
                {'error': _('Employee not found')},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VacationViewSet(viewsets.ModelViewSet):
    """ViewSet for Vacation management"""
    queryset = Vacation.objects.select_related('employee__user', 'approved_by').all()
    serializer_class = VacationSerializer
    permission_classes = [HasModulePermission]
    required_module = 'hr'
    required_level = 'view'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['employee', 'status']
    search_fields = ['employee__user__first_name', 'employee__user__last_name', 'rejection_reason']
    ordering_fields = ['start_date', 'requested_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a vacation request"""
        vacation = self.get_object()
        if vacation.status != 'requested':
            return Response(
                {'error': _('Only requested vacations can be approved')},
                status=status.HTTP_400_BAD_REQUEST
            )
        vacation.status = 'approved'
        vacation.approved_by = request.user
        vacation.approved_at = timezone.now()
        vacation.save()
        serializer = self.get_serializer(vacation)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a vacation request"""
        vacation = self.get_object()
        if vacation.status != 'requested':
            return Response(
                {'error': _('Only requested vacations can be rejected')},
                status=status.HTTP_400_BAD_REQUEST
            )
        rejection_reason = request.data.get('rejection_reason', '')
        vacation.status = 'rejected'
        vacation.approved_by = request.user
        vacation.approved_at = timezone.now()
        vacation.rejection_reason = rejection_reason
        vacation.save()
        serializer = self.get_serializer(vacation)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def balance(self, request):
        """
        Get vacation balance for an employee
        """
        employee_id = request.query_params.get('employee_id')
        as_of_date = request.query_params.get('as_of_date')
        
        if not employee_id:
            return Response(
                {'error': _('employee_id is required')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            employee = Employee.objects.get(id=employee_id)
            from .calculations import calculate_vacation_balance
            from datetime import datetime
            
            date_obj = None
            if as_of_date:
                try:
                    date_obj = datetime.strptime(as_of_date, '%Y-%m-%d').date()
                except ValueError:
                    return Response(
                        {'error': _('Invalid date format. Use YYYY-MM-DD')},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            result = calculate_vacation_balance(employee, date_obj)
            return Response(result, status=status.HTTP_200_OK)
        except Employee.DoesNotExist:
            return Response(
                {'error': _('Employee not found')},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PerformanceReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for Performance Review management"""
    queryset = PerformanceReview.objects.select_related(
        'employee__user', 'reviewer__user'
    ).all()
    serializer_class = PerformanceReviewSerializer
    permission_classes = [HasModulePermission]
    required_module = 'hr'
    required_level = 'view'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['employee', 'reviewer', 'status']
    search_fields = ['employee__user__first_name', 'employee__user__last_name']
    ordering_fields = ['review_date', 'created_at']
    ordering = ['-review_date']


class TrainingViewSet(viewsets.ModelViewSet):
    """ViewSet for Training management"""
    queryset = Training.objects.all()
    serializer_class = TrainingSerializer
    permission_classes = [HasModulePermission]
    required_module = 'hr'
    required_level = 'view'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'description', 'provider']
    filterset_fields = ['training_type', 'is_active']
    ordering_fields = ['start_date', 'end_date', 'created_at']
    ordering = ['-start_date']


class EmployeeTrainingViewSet(viewsets.ModelViewSet):
    """ViewSet for Employee Training management"""
    queryset = EmployeeTraining.objects.select_related('employee__user', 'training').all()
    serializer_class = EmployeeTrainingSerializer
    permission_classes = [HasModulePermission]
    required_module = 'hr'
    required_level = 'view'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['employee', 'training', 'status']
    search_fields = ['training__name', 'employee__user__first_name']
    ordering_fields = ['enrollment_date', 'completion_date', 'created_at']
    ordering = ['-enrollment_date']
    
    @action(detail=False, methods=['post'])
    def enroll(self, request):
        """Enroll employee in training"""
        employee_id = request.data.get('employee_id')
        training_id = request.data.get('training_id')
        
        if not all([employee_id, training_id]):
            return Response(
                {'error': _('employee_id and training_id are required')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            employee = Employee.objects.get(id=employee_id)
            training = Training.objects.get(id=training_id)
            
            employee_training, created = EmployeeTraining.objects.get_or_create(
                employee=employee,
                training=training,
                defaults={'status': 'enrolled'}
            )
            
            serializer = self.get_serializer(employee_training)
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        except (Employee.DoesNotExist, Training.DoesNotExist) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )


class JobOpeningViewSet(viewsets.ModelViewSet):
    """ViewSet for Job Opening management"""
    queryset = JobOpening.objects.select_related('department').all()
    serializer_class = JobOpeningSerializer
    permission_classes = [HasModulePermission]
    required_module = 'hr'
    required_level = 'view'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['title', 'description', 'requirements']
    filterset_fields = ['department', 'status']
    ordering_fields = ['posted_date', 'closing_date', 'created_at']
    ordering = ['-posted_date']


class CandidateViewSet(viewsets.ModelViewSet):
    """ViewSet for Candidate management"""
    queryset = Candidate.objects.select_related('job_opening').all()
    serializer_class = CandidateSerializer
    permission_classes = [HasModulePermission]
    required_module = 'hr'
    required_level = 'view'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['job_opening', 'status']
    search_fields = ['first_name', 'last_name', 'email', 'phone']
    ordering_fields = ['applied_at', 'updated_at']
    ordering = ['-applied_at']


class PayrollViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Payroll (read-only, processing via action)"""
    queryset = Payroll.objects.select_related('employee__user').all()
    serializer_class = PayrollSerializer
    permission_classes = [HasModulePermission]
    required_module = 'hr'
    required_level = 'view'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['employee', 'month', 'year', 'is_processed']
    search_fields = ['employee__user__first_name', 'employee__user__last_name', 'payroll_number']
    ordering_fields = ['year', 'month', 'created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        employee_id = self.request.query_params.get('employee_id')
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        month = self.request.query_params.get('month')
        if month:
            queryset = queryset.filter(month=month)
        year = self.request.query_params.get('year')
        if year:
            queryset = queryset.filter(year=year)
        return queryset
    
    @action(detail=False, methods=['post'])
    def process(self, request):
        """Process payroll for employees with automatic calculations"""
        employee_ids = request.data.get('employee_ids', [])
        month = request.data.get('month')
        year = request.data.get('year')
        
        if not all([month, year]):
            return Response(
                {'error': _('month and year are required')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not employee_ids:
            return Response(
                {'error': _('employee_ids is required')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from .calculations import auto_calculate_payroll
        
        processed_payrolls = []
        errors = []
        
        for employee_id in employee_ids:
            try:
                employee = Employee.objects.get(id=employee_id)
                
                # Check if payroll already exists
                payroll, created = Payroll.objects.get_or_create(
                    employee=employee,
                    month=month,
                    year=year,
                    defaults={
                        'base_salary': employee.base_salary,
                        'is_processed': False,  # Will be set to True after calculation
                    }
                )
                
                # Auto-calcular todos os valores
                payroll = auto_calculate_payroll(payroll)
                payroll.is_processed = True
                payroll.processed_at = timezone.now()
                payroll.save()
                
                processed_payrolls.append(PayrollSerializer(payroll, context={'request': request}).data)
            except Employee.DoesNotExist:
                errors.append(f'Employee {employee_id} not found')
            except Exception as e:
                errors.append(f'Error processing payroll for employee {employee_id}: {str(e)}')
        
        return Response({
            'processed': processed_payrolls,
            'errors': errors
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def recalculate(self, request, pk=None):
        """Recalculate payroll values"""
        payroll = self.get_object()
        
        try:
            payroll = payroll.recalculate()
            payroll.save()
            serializer = self.get_serializer(payroll)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class HRNotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for HR Notifications"""
    queryset = HRNotification.objects.select_related('employee__user').all()
    serializer_class = HRNotificationSerializer
    permission_classes = [HasModulePermission]
    required_module = 'hr'
    required_level = 'view'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['employee', 'notification_type', 'is_read']
    search_fields = ['title', 'message']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Filtrar por funcionário logado se não for admin
        if not self.request.user.is_staff:
            employee = Employee.objects.filter(user=self.request.user).first()
            if employee:
                queryset = queryset.filter(employee=employee)
        return queryset
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read for current employee"""
        employee = Employee.objects.filter(user=request.user).first()
        if employee:
            HRNotification.objects.filter(
                employee=employee,
                is_read=False
            ).update(is_read=True, read_at=timezone.now())
            return Response({'message': _('All notifications marked as read')})
        return Response(
            {'error': _('Employee not found')},
            status=status.HTTP_404_NOT_FOUND
        )
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications"""
        employee = Employee.objects.filter(user=request.user).first()
        if employee:
            count = HRNotification.objects.filter(
                employee=employee,
                is_read=False
            ).count()
            return Response({'count': count})
        return Response({'count': 0})
    
    @action(detail=False, methods=['post'])
    def run_checks(self, request):
        """Run all notification checks (admin only)"""
        if not request.user.is_staff:
            return Response(
                {'error': _('Permission denied')},
                status=status.HTTP_403_FORBIDDEN
            )
        
        results = run_all_notification_checks()
        return Response(results, status=status.HTTP_200_OK)
