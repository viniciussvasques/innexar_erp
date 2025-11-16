"""
Cálculos automáticos para o módulo HR
"""
from decimal import Decimal, ROUND_HALF_UP
from datetime import date, timedelta
from django.utils import timezone
from django.db.models import Sum, Q
from .models import TimeRecord, Payroll, Vacation, TaxTable, Employee


def calculate_overtime_hours(employee, year, month):
    """
    Calcula horas extras trabalhadas no mês
    
    Args:
        employee: Instância do Employee
        year: Ano
        month: Mês (1-12)
    
    Returns:
        dict com:
            - normal_hours: horas normais trabalhadas
            - overtime_hours: horas extras trabalhadas
            - overtime_value: valor das horas extras
    """
    # Calcular horas normais do mês
    normal_hours = TimeRecord.calculate_monthly_hours(employee, year, month)
    
    # Horas esperadas no mês (baseado na jornada do funcionário)
    # Cálculo correto: semanas no mês (~4.33) * horas semanais
    # Padrão: 220 horas/mês (44h/semana) ou 200h/mês (40h/semana)
    weekly_hours = Decimal(str(employee.weekly_hours)) if employee.weekly_hours else Decimal('44.00')
    # Média de semanas no mês: 365.25 dias / 12 meses / 7 dias = ~4.348 semanas
    weeks_per_month = Decimal('4.348')
    expected_monthly_hours = weekly_hours * weeks_per_month
    
    # Calcular horas extras
    overtime_hours = max(Decimal('0.00'), normal_hours - expected_monthly_hours)
    
    # Calcular valor das horas extras
    # Hora extra = 50% a mais da hora normal (Brasil) ou 1.5x (padrão)
    hourly_rate = employee.base_salary / expected_monthly_hours if expected_monthly_hours > 0 else Decimal('0.00')
    overtime_hourly_rate = hourly_rate * Decimal('1.5')  # 50% adicional
    overtime_value = overtime_hours * overtime_hourly_rate
    
    return {
        'normal_hours': normal_hours,
        'expected_hours': expected_monthly_hours,
        'overtime_hours': overtime_hours,
        'overtime_value': overtime_value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
    }


def calculate_brazilian_taxes(base_salary, year=None, month=None, dependents=0):
    """
    Calcula impostos brasileiros (INSS, IRRF, FGTS)
    
    Args:
        base_salary: Salário base
        year: Ano para buscar tabela de impostos (opcional)
        month: Mês (opcional)
        dependents: Número de dependentes
    
    Returns:
        dict com inss, irrf, fgts
    """
    if year is None:
        year = date.today().year
    if month is None:
        month = date.today().month
    
    base_salary = Decimal(str(base_salary))
    
    # INSS (desconto do funcionário)
    inss = TaxTable.calculate_inss(base_salary, year, month)
    
    # IRRF (desconto do funcionário)
    irrf = TaxTable.calculate_irrf(base_salary, year, month, dependents)
    
    # FGTS (8% do salário, pago pela empresa, não desconta do funcionário)
    fgts = base_salary * Decimal('0.08')
    
    return {
        'inss': inss.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
        'irrf': irrf.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
        'fgts': fgts.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
    }


def calculate_vacation_balance(employee, as_of_date=None):
    """
    Calcula saldo de férias do funcionário
    
    Args:
        employee: Instância do Employee
        as_of_date: Data de referência (padrão: hoje)
    
    Returns:
        dict com:
            - balance_days: dias de férias disponíveis
            - acquisition_periods: lista de períodos aquisitivos
            - next_expiry: próxima data de expiração
    """
    if as_of_date is None:
        as_of_date = date.today()
    
    if not employee.hire_date:
        return {
            'balance_days': 0,
            'acquisition_periods': [],
            'next_expiry': None,
        }
    
    # Calcular períodos aquisitivos
    hire_date = employee.hire_date
    periods = []
    current_period_start = hire_date
    
    while current_period_start <= as_of_date:
        period_end = current_period_start + timedelta(days=365)
        periods.append({
            'start': current_period_start,
            'end': period_end,
            'expiry': period_end + timedelta(days=365),  # Vence 1 ano após o fim do período
        })
        current_period_start = period_end
    
    # Calcular dias de férias disponíveis
    # Cada período aquisitivo dá direito a 30 dias de férias
    total_earned = len(periods) * 30
    
    # Subtrair férias já tiradas
    vacations_taken = Vacation.objects.filter(
        employee=employee,
        status__in=['taken', 'approved'],
        acquisition_period_start__lte=as_of_date
    ).aggregate(total_days=Sum('days'))['total_days'] or 0
    
    balance_days = total_earned - vacations_taken
    
    # Encontrar próxima data de expiração
    next_expiry = None
    for period in periods:
        if period['expiry'] > as_of_date:
            if next_expiry is None or period['expiry'] < next_expiry:
                next_expiry = period['expiry']
    
    return {
        'balance_days': max(0, balance_days),
        'acquisition_periods': periods,
        'next_expiry': next_expiry,
        'total_earned': total_earned,
        'taken': vacations_taken,
    }


def calculate_proportional_vacation(employee, termination_date):
    """
    Calcula férias proporcionais quando funcionário é demitido
    
    Args:
        employee: Instância do Employee
        termination_date: Data de demissão
    
    Returns:
        dict com dias proporcionais e valor
    """
    if not employee.hire_date:
        return {
            'proportional_days': 0,
            'proportional_value': Decimal('0.00'),
        }
    
    # Calcular meses trabalhados no período aquisitivo atual
    hire_date = employee.hire_date
    months_worked = (termination_date.year - hire_date.year) * 12 + (termination_date.month - hire_date.month)
    
    # Férias proporcionais: 30 dias / 12 meses * meses trabalhados
    proportional_days = (Decimal('30') / Decimal('12')) * Decimal(str(months_worked))
    proportional_days = proportional_days.quantize(Decimal('1'), rounding=ROUND_HALF_UP)
    
    # Valor proporcional
    daily_salary = employee.base_salary / Decimal('30')
    proportional_value = daily_salary * proportional_days
    
    return {
        'proportional_days': int(proportional_days),
        'proportional_value': proportional_value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
    }


def calculate_payroll_totals(payroll):
    """
    Calcula totais da folha de pagamento automaticamente
    
    Args:
        payroll: Instância do Payroll
    
    Returns:
        dict com total_earnings, total_deductions, net_salary
    """
    # Total de proventos
    total_earnings = (
        payroll.base_salary +
        payroll.commissions +
        payroll.overtime +
        payroll.bonuses +
        payroll.benefits_value
    )
    
    # Total de descontos
    # NOTA: FGTS não é descontado do funcionário, é pago pela empresa
    # O campo payroll.fgts armazena o valor que a empresa deve depositar
    total_deductions = (
        payroll.inss +
        payroll.irrf +
        # payroll.fgts removido - FGTS é obrigação da empresa, não desconto do funcionário
        payroll.transportation +
        payroll.meal_voucher +
        payroll.loans +
        payroll.advances +
        payroll.other_deductions
    )
    
    # Salário líquido
    net_salary = total_earnings - total_deductions
    
    return {
        'total_earnings': total_earnings.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
        'total_deductions': total_deductions.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
        'net_salary': net_salary.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
    }


def auto_calculate_payroll(payroll):
    """
    Calcula automaticamente todos os valores da folha de pagamento
    
    Args:
        payroll: Instância do Payroll (pode estar sem salvar ainda)
    
    Returns:
        Payroll atualizado com todos os cálculos
    """
    employee = payroll.employee
    
    # 1. Calcular horas extras do mês
    overtime_data = calculate_overtime_hours(employee, payroll.year, payroll.month)
    payroll.overtime = overtime_data['overtime_value']
    
    # 2. Calcular impostos brasileiros
    # Contar dependentes
    dependents_count = employee.dependents.filter(is_tax_dependent=True).count()
    
    # Base para cálculo de impostos = salário base + comissões + horas extras + bônus
    taxable_base = (
        payroll.base_salary +
        payroll.commissions +
        payroll.overtime +
        payroll.bonuses
    )
    
    taxes = calculate_brazilian_taxes(taxable_base, payroll.year, payroll.month, dependents_count)
    payroll.inss = taxes['inss']
    payroll.irrf = taxes['irrf']
    payroll.fgts = taxes['fgts']
    
    # 3. Calcular totais
    totals = calculate_payroll_totals(payroll)
    payroll.total_earnings = totals['total_earnings']
    payroll.total_deductions = totals['total_deductions']
    payroll.net_salary = totals['net_salary']
    
    return payroll

