"""
Django signals for HR module
"""
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Employee, EmployeeHistory, Vacation, Payroll
from .notifications import notify_payroll_processed, notify_vacation_request


@receiver(pre_save, sender=Employee)
def track_employee_changes(sender, instance, **kwargs):
    """
    Track changes to Employee model before saving
    Store old values in instance._old_values for use in post_save
    """
    if instance.pk:  # Only for updates, not new instances
        try:
            old_instance = Employee.objects.get(pk=instance.pk)
            instance._old_values = {
                'job_title': old_instance.job_title,
                'job_position': old_instance.job_position_id,
                'department': old_instance.department_id,
                'base_salary': old_instance.base_salary,
                'status': old_instance.status,
                'supervisor': old_instance.supervisor_id,
            }
        except Employee.DoesNotExist:
            instance._old_values = {}


@receiver(post_save, sender=Employee)
def create_employee_history(sender, instance, created, **kwargs):
    """
    Create EmployeeHistory records when Employee is updated
    """
    if created:
        # For new employees, create initial history entry
        EmployeeHistory.objects.create(
            employee=instance,
            change_type='position',
            old_job_title='',
            new_job_title=instance.job_title or '',
            new_department=instance.department,
            new_salary=instance.base_salary,
            effective_date=instance.hire_date or timezone.now().date(),
            notes='Initial employee registration',
            changed_by=None,  # Can be set if request.user is available
        )
        return
    
    # For updates, check what changed
    if not hasattr(instance, '_old_values'):
        return
    
    old_values = instance._old_values
    
    # Track position/job changes
    if (old_values.get('job_title') != instance.job_title or 
        old_values.get('job_position') != instance.job_position_id):
        change_type = 'position'
        if old_values.get('job_position') != instance.job_position_id:
            # Check if it's a promotion (could be enhanced with level comparison)
            change_type = 'promotion'
        
        # Get old department if exists
        old_dept_id = old_values.get('department')
        old_dept = None
        if old_dept_id:
            try:
                from .models import Department
                old_dept = Department.objects.get(pk=old_dept_id)
            except Department.DoesNotExist:
                pass
        
        EmployeeHistory.objects.create(
            employee=instance,
            change_type=change_type,
            old_job_title=old_values.get('job_title', ''),
            new_job_title=instance.job_title or '',
            old_department=old_dept,
            new_department=instance.department,
            effective_date=timezone.now().date(),
            notes=f'Job title changed from "{old_values.get("job_title", "")}" to "{instance.job_title or ""}"',
            changed_by=None,
        )
    
    # Track salary changes
    if old_values.get('base_salary') != instance.base_salary:
        old_salary = old_values.get('base_salary')
        new_salary = instance.base_salary
        
        EmployeeHistory.objects.create(
            employee=instance,
            change_type='salary',
            old_salary=old_salary,
            new_salary=new_salary,
            effective_date=timezone.now().date(),
            notes=f'Salary changed from {old_salary} to {new_salary}',
            changed_by=None,
        )
    
    # Track department changes
    if old_values.get('department') != instance.department_id:
        # Get old department if exists
        old_dept_id = old_values.get('department')
        old_dept = None
        if old_dept_id:
            try:
                from .models import Department
                old_dept = Department.objects.get(pk=old_dept_id)
            except Department.DoesNotExist:
                pass
        
        EmployeeHistory.objects.create(
            employee=instance,
            change_type='department',
            old_department=old_dept,
            new_department=instance.department,
            effective_date=timezone.now().date(),
            notes=f'Department changed',
            changed_by=None,
        )
    
    # Track status changes (could indicate termination, leave, etc.)
    if old_values.get('status') != instance.status:
        EmployeeHistory.objects.create(
            employee=instance,
            change_type='transfer',  # Using transfer as generic status change
            effective_date=timezone.now().date(),
            notes=f'Status changed from {old_values.get("status")} to {instance.status}',
            changed_by=None,
        )


@receiver(post_save, sender=Vacation)
def handle_vacation_created(sender, instance, created, **kwargs):
    """
    Cria notificação quando uma solicitação de férias é criada
    """
    if created and instance.status == 'requested':
        notify_vacation_request(instance.employee, instance)


@receiver(post_save, sender=Payroll)
def handle_payroll_processed(sender, instance, created, **kwargs):
    """
    Cria notificação quando uma folha de pagamento é processada
    """
    if instance.is_processed and instance.processed_at:
        # Verificar se já foi notificado (evitar duplicatas)
        from .models import HRNotification
        existing_notification = HRNotification.objects.filter(
            employee=instance.employee,
            notification_type='payroll_processed',
            title__icontains=f"{instance.month:02d}/{instance.year}",
            created_at__gte=instance.processed_at
        ).first()
        
        if not existing_notification:
            notify_payroll_processed(instance.employee, instance)

