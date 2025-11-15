from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'hr'

router = DefaultRouter()
router.register(r'departments', views.DepartmentViewSet, basename='department')
router.register(r'job-positions', views.JobPositionViewSet, basename='job-position')
router.register(r'companies', views.CompanyViewSet, basename='company')
router.register(r'employees', views.EmployeeViewSet, basename='employee')
router.register(r'bank-accounts', views.BankAccountViewSet, basename='bank-account')
router.register(r'dependents', views.DependentViewSet, basename='dependent')
router.register(r'educations', views.EducationViewSet, basename='education')
router.register(r'work-experiences', views.WorkExperienceViewSet, basename='work-experience')
router.register(r'contracts', views.ContractViewSet, basename='contract')
router.register(r'employee-documents', views.EmployeeDocumentViewSet, basename='employee-document')
router.register(r'employee-history', views.EmployeeHistoryViewSet, basename='employee-history')
router.register(r'benefits', views.BenefitViewSet, basename='benefit')
router.register(r'employee-benefits', views.EmployeeBenefitViewSet, basename='employee-benefit')
router.register(r'time-records', views.TimeRecordViewSet, basename='time-record')
router.register(r'vacations', views.VacationViewSet, basename='vacation')
router.register(r'performance-reviews', views.PerformanceReviewViewSet, basename='performance-review')
router.register(r'trainings', views.TrainingViewSet, basename='training')
router.register(r'employee-trainings', views.EmployeeTrainingViewSet, basename='employee-training')
router.register(r'job-openings', views.JobOpeningViewSet, basename='job-opening')
router.register(r'candidates', views.CandidateViewSet, basename='candidate')
router.register(r'payroll', views.PayrollViewSet, basename='payroll')
router.register(r'notifications', views.HRNotificationViewSet, basename='hr-notification')

urlpatterns = [
    path('', include(router.urls)),
]

