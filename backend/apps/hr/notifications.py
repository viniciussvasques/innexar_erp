"""
Sistema de notificações automáticas para o módulo HR
"""
from django.utils import timezone
from datetime import date, timedelta
from .models import HRNotification, Employee, EmployeeDocument, Vacation, TimeRecord, Payroll


def create_notification(employee, notification_type, title, message, action_url=None):
    """
    Cria uma notificação para um funcionário
    
    Args:
        employee: Instância do Employee (pode ser None para notificações gerais)
        notification_type: Tipo da notificação
        title: Título da notificação
        message: Mensagem da notificação
        action_url: URL opcional para ação
    
    Returns:
        HRNotification criada
    """
    notification = HRNotification.objects.create(
        employee=employee,
        notification_type=notification_type,
        title=title,
        message=message,
        action_url=action_url or '',
    )
    return notification


def check_document_expiry():
    """
    Verifica documentos próximos ao vencimento e cria notificações
    Verifica documentos que vencem nos próximos 30 dias
    """
    today = date.today()
    expiry_threshold = today + timedelta(days=30)
    
    expiring_documents = EmployeeDocument.objects.filter(
        expiry_date__lte=expiry_threshold,
        expiry_date__gte=today,
        is_active=True
    ).select_related('employee')
    
    notifications_created = 0
    
    for document in expiring_documents:
        days_until_expiry = (document.expiry_date - today).days
        
        if days_until_expiry <= 7:
            title = f"Documento vencendo em {days_until_expiry} dias"
            message = f"O documento '{document.name}' ({document.get_document_type_display()}) vence em {days_until_expiry} dias."
        else:
            title = f"Documento próximo ao vencimento"
            message = f"O documento '{document.name}' ({document.get_document_type_display()}) vence em {days_until_expiry} dias."
        
        action_url = f"/hr/employees/{document.employee.id}/documents"
        
        create_notification(
            employee=document.employee,
            notification_type='document_expiring',
            title=title,
            message=message,
            action_url=action_url
        )
        notifications_created += 1
    
    return notifications_created


def check_vacation_expiry():
    """
    Verifica férias próximas ao vencimento e cria notificações
    """
    from .calculations import calculate_vacation_balance
    
    today = date.today()
    employees = Employee.objects.filter(
        status='active',
        hire_date__isnull=False
    ).select_related('user')
    
    notifications_created = 0
    
    for employee in employees:
        balance_data = calculate_vacation_balance(employee, today)
        
        # Verificar se há férias próximas ao vencimento
        if balance_data['next_expiry']:
            days_until_expiry = (balance_data['next_expiry'] - today).days
            
            if days_until_expiry <= 30:
                if days_until_expiry <= 7:
                    title = f"Férias vencendo em {days_until_expiry} dias"
                    message = f"Você tem {balance_data['balance_days']} dias de férias disponíveis que vencem em {days_until_expiry} dias."
                else:
                    title = f"Férias próximas ao vencimento"
                    message = f"Você tem {balance_data['balance_days']} dias de férias disponíveis que vencem em {days_until_expiry} dias."
                
                action_url = f"/hr/vacations?employee_id={employee.id}"
                
                create_notification(
                    employee=employee,
                    notification_type='vacation_expiring',
                    title=title,
                    message=message,
                    action_url=action_url
                )
                notifications_created += 1
        
        # Verificar se o saldo está baixo
        if balance_data['balance_days'] > 0 and balance_data['balance_days'] <= 5:
            title = "Saldo de férias baixo"
            message = f"Você tem apenas {balance_data['balance_days']} dias de férias disponíveis."
            
            action_url = f"/hr/vacations?employee_id={employee.id}"
            
            create_notification(
                employee=employee,
                notification_type='vacation_balance_low',
                title=title,
                message=message,
                action_url=action_url
            )
            notifications_created += 1
    
    return notifications_created


def check_pending_time_records():
    """
    Verifica registros de ponto pendentes de aprovação e cria notificações para gestores
    """
    # Buscar registros pendentes dos últimos 7 dias
    today = date.today()
    week_ago = today - timedelta(days=7)
    
    pending_records = TimeRecord.objects.filter(
        is_approved=False,
        record_date__gte=week_ago
    ).select_related('employee__user', 'employee__supervisor__user')
    
    notifications_created = 0
    supervisors_notified = set()
    
    for record in pending_records:
        # Notificar supervisor do funcionário
        if record.employee.supervisor and record.employee.supervisor.user:
            supervisor_id = record.employee.supervisor.id
            
            if supervisor_id not in supervisors_notified:
                # Contar registros pendentes deste supervisor
                pending_count = TimeRecord.objects.filter(
                    employee__supervisor=record.employee.supervisor,
                    is_approved=False,
                    record_date__gte=week_ago
                ).count()
                
                title = f"{pending_count} registro(s) de ponto pendente(s)"
                message = f"Você tem {pending_count} registro(s) de ponto pendente(s) de aprovação."
                action_url = "/hr/time-records?status=pending"
                
                create_notification(
                    employee=record.employee.supervisor,
                    notification_type='time_record_pending',
                    title=title,
                    message=message,
                    action_url=action_url
                )
                
                supervisors_notified.add(supervisor_id)
                notifications_created += 1
    
    return notifications_created


def notify_payroll_processed(employee, payroll):
    """
    Cria notificação quando uma folha de pagamento é processada
    
    Args:
        employee: Instância do Employee
        payroll: Instância do Payroll processada
    """
    title = f"Folha de pagamento processada - {payroll.month:02d}/{payroll.year}"
    message = f"Sua folha de pagamento do mês {payroll.month:02d}/{payroll.year} foi processada. Salário líquido: R$ {payroll.net_salary:,.2f}"
    action_url = f"/hr/payroll/{payroll.id}"
    
    return create_notification(
        employee=employee,
        notification_type='payroll_processed',
        title=title,
        message=message,
        action_url=action_url
    )


def notify_vacation_request(employee, vacation):
    """
    Cria notificação quando uma solicitação de férias é feita (para o supervisor)
    
    Args:
        employee: Instância do Employee que solicitou
        vacation: Instância do Vacation
    """
    if employee.supervisor and employee.supervisor.user:
        title = f"Solicitação de férias - {employee.user.get_full_name() if employee.user else employee.employee_number}"
        message = f"{employee.user.get_full_name() if employee.user else employee.employee_number} solicitou {vacation.days} dias de férias de {vacation.start_date} a {vacation.end_date}."
        action_url = f"/hr/vacations/{vacation.id}"
        
        return create_notification(
            employee=employee.supervisor,
            notification_type='vacation_request',
            title=title,
            message=message,
            action_url=action_url
        )
    
    return None


def run_all_notification_checks():
    """
    Executa todas as verificações de notificações
    Útil para ser chamada por um cron job ou task periódica
    """
    results = {
        'documents': check_document_expiry(),
        'vacations': check_vacation_expiry(),
        'time_records': check_pending_time_records(),
    }
    
    return results

