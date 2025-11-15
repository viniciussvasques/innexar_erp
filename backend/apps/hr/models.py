"""
HR (Human Resources) models
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import FileExtensionValidator
from decimal import Decimal
from datetime import date, timedelta


class Department(models.Model):
    """Departamento"""
    
    name = models.CharField(max_length=100, unique=True, verbose_name=_('Name'))
    code = models.CharField(max_length=20, unique=True, verbose_name=_('Code'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    
    # Gerente
    manager = models.ForeignKey(
        'hr.Employee',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_departments',
        verbose_name=_('Manager')
    )
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name=_('Active'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created at'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated at'))
    
    class Meta:
        db_table = 'hr_departments'
        verbose_name = _('Department')
        verbose_name_plural = _('Departments')
        ordering = ['name']
    
    def __str__(self):
        return self.name


class JobPosition(models.Model):
    """Cargo/Posição de Trabalho"""
    
    LEVEL_CHOICES = [
        ('intern', _('Intern')),
        ('junior', _('Junior')),
        ('pleno', _('Mid-Level')),
        ('senior', _('Senior')),
        ('lead', _('Lead')),
        ('manager', _('Manager')),
        ('director', _('Director')),
        ('vp', _('Vice President')),
        ('c_level', _('C-Level')),
    ]
    
    # Identificação
    code = models.CharField(max_length=50, unique=True, verbose_name=_('Code'), help_text=_('Unique code (e.g., DEV-JR, SALES-MGR)'))
    name = models.CharField(max_length=200, verbose_name=_('Name'))
    department = models.ForeignKey(
        'hr.Department',
        on_delete=models.CASCADE,
        related_name='job_positions',
        verbose_name=_('Department')
    )
    
    # Nível hierárquico
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, verbose_name=_('Level'))
    
    # Faixa salarial
    salary_min = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Minimum Salary'),
        help_text=_('Minimum salary for this position')
    )
    salary_max = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Maximum Salary'),
        help_text=_('Maximum salary for this position')
    )
    
    # Descrição e requisitos
    description = models.TextField(blank=True, verbose_name=_('Description'))
    requirements = models.TextField(blank=True, verbose_name=_('Requirements'))
    responsibilities = models.TextField(blank=True, verbose_name=_('Responsibilities'))
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name=_('Active'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created at'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated at'))
    
    class Meta:
        db_table = 'hr_job_positions'
        verbose_name = _('Job Position')
        verbose_name_plural = _('Job Positions')
        ordering = ['department', 'level', 'name']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['department', 'is_active']),
            models.Index(fields=['level', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class Company(models.Model):
    """Empresa da Pessoa (LLC, S-Corp, etc.)"""
    
    TYPE_CHOICES = [
        ('llc', _('LLC (Limited Liability Company)')),
        ('s_corp', _('S-Corporation')),
        ('c_corp', _('C-Corporation')),
        ('partnership', _('Partnership')),
        ('sole_proprietorship', _('Sole Proprietorship')),
        ('other', _('Other')),
    ]
    
    # Dados da Empresa
    legal_name = models.CharField(max_length=255, verbose_name=_('Legal Name'))
    trade_name = models.CharField(max_length=255, blank=True, verbose_name=_('Trade Name'))
    company_type = models.CharField(max_length=30, choices=TYPE_CHOICES, verbose_name=_('Company Type'))
    
    # EIN (Employer Identification Number)
    ein = models.CharField(
        max_length=20,
        unique=True,
        verbose_name=_('EIN'),
        help_text=_('Employer Identification Number')
    )
    
    # Endereço
    address = models.TextField(verbose_name=_('Address'))
    city = models.CharField(max_length=100, verbose_name=_('City'))
    state = models.CharField(max_length=100, verbose_name=_('State'))
    zip_code = models.CharField(max_length=20, verbose_name=_('ZIP Code'))
    country = models.CharField(max_length=100, default='USA', verbose_name=_('Country'))
    
    # Contato
    phone = models.CharField(max_length=20, blank=True, verbose_name=_('Phone'))
    email = models.EmailField(blank=True, verbose_name=_('Email'))
    website = models.URLField(blank=True, verbose_name=_('Website'))
    
    # Proprietário (pessoa física)
    owner = models.ForeignKey(
        'hr.Employee',
        on_delete=models.CASCADE,
        related_name='owned_companies',
        verbose_name=_('Owner'),
        help_text=_('Physical person who owns this company')
    )
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name=_('Active'))
    
    # Metadados
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created at'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated at'))
    
    class Meta:
        db_table = 'hr_companies'
        verbose_name = _('Company')
        verbose_name_plural = _('Companies')
        ordering = ['legal_name']
        indexes = [
            models.Index(fields=['ein']),
            models.Index(fields=['owner', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.legal_name} ({self.ein})"


class Employee(models.Model):
    """Funcionário"""
    
    STATUS_CHOICES = [
        ('active', _('Active')),
        ('on_leave', _('On Leave')),
        ('terminated', _('Terminated')),
        ('resigned', _('Resigned')),
    ]
    
    CONTRACT_TYPE_CHOICES = [
        ('w2_employee', _('W2 Employee (Physical Person)')),
        ('1099_contractor', _('1099 Contractor (Company)')),
        ('llc', _('LLC')),
        ('s_corp', _('S-Corp')),
        ('c_corp', _('C-Corp')),
        ('partnership', _('Partnership')),
        ('clt', _('CLT (Brazil)')),
        ('pj', _('PJ (Brazil)')),
        ('intern', _('Intern')),
        ('temporary', _('Temporary')),
    ]
    
    HIRE_TYPE_CHOICES = [
        ('individual', _('Physical Person')),
        ('company', _('Via Company')),
    ]
    
    # Relacionamento com User (opcional - pode ser criado sem User inicialmente)
    user = models.OneToOneField(
        'users.User',
        on_delete=models.CASCADE,
        related_name='employee',
        null=True,
        blank=True,
        verbose_name=_('User')
    )
    
    # Dados Pessoais
    employee_number = models.CharField(max_length=20, unique=True, verbose_name=_('Employee Number'))
    date_of_birth = models.DateField(null=True, blank=True, verbose_name=_('Date of Birth'))
    cpf = models.CharField(max_length=14, blank=True, verbose_name=_('CPF'), help_text=_('Brazilian tax ID'))
    ssn = models.CharField(max_length=11, blank=True, verbose_name=_('SSN'), help_text=_('Social Security Number (USA)'))
    rg = models.CharField(max_length=20, blank=True, verbose_name=_('RG/ID'))
    
    GENDER_CHOICES = [
        ('male', _('Male')),
        ('female', _('Female')),
        ('other', _('Other')),
        ('prefer_not_to_say', _('Prefer not to say')),
    ]
    gender = models.CharField(max_length=20, blank=True, choices=GENDER_CHOICES, verbose_name=_('Gender'))
    
    MARITAL_STATUS_CHOICES = [
        ('single', _('Single')),
        ('married', _('Married')),
        ('divorced', _('Divorced')),
        ('widowed', _('Widowed')),
        ('common_law', _('Common Law Marriage')),
    ]
    marital_status = models.CharField(max_length=20, blank=True, choices=MARITAL_STATUS_CHOICES, verbose_name=_('Marital Status'))
    nationality = models.CharField(max_length=50, default='Brasileiro', verbose_name=_('Nationality'))
    
    # Foto do funcionário
    photo = models.ImageField(upload_to='hr/employee_photos/', null=True, blank=True, verbose_name=_('Photo'))
    
    # Compliance (opcional)
    ethnicity = models.CharField(max_length=50, blank=True, verbose_name=_('Ethnicity'), help_text=_('Optional, for compliance purposes'))
    has_disability = models.BooleanField(default=False, verbose_name=_('Has Disability'), help_text=_('Optional, for compliance purposes'))
    disability_description = models.TextField(blank=True, verbose_name=_('Disability Description'))
    
    # Endereço
    address = models.TextField(blank=True, verbose_name=_('Address'))
    city = models.CharField(max_length=100, blank=True, verbose_name=_('City'))
    state = models.CharField(max_length=100, blank=True, verbose_name=_('State'))
    zip_code = models.CharField(max_length=20, blank=True, verbose_name=_('ZIP Code'))
    country = models.CharField(max_length=100, default='Brasil', verbose_name=_('Country'))
    
    # Contatos de Emergência
    emergency_contact_name = models.CharField(max_length=255, blank=True, verbose_name=_('Emergency Contact Name'))
    emergency_contact_phone = models.CharField(max_length=20, blank=True, verbose_name=_('Emergency Contact Phone'))
    emergency_contact_relation = models.CharField(max_length=50, blank=True, verbose_name=_('Emergency Contact Relation'))
    
    # Dados Profissionais
    job_position = models.ForeignKey(
        'hr.JobPosition',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees',
        verbose_name=_('Job Position')
    )
    job_title = models.CharField(max_length=100, blank=True, verbose_name=_('Job Title'), help_text=_('Legacy field, use job_position instead'))
    department = models.ForeignKey(
        'hr.Department',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees',
        verbose_name=_('Department')
    )
    # TODO: Uncomment when warehouse module is created
    # warehouse = models.ForeignKey(
    #     'warehouse.Warehouse',
    #     on_delete=models.SET_NULL,
    #     null=True,
    #     blank=True,
    #     related_name='employees',
    #     verbose_name=_('Warehouse')
    # )
    supervisor = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subordinates',
        verbose_name=_('Supervisor')
    )
    
    # Contrato
    contract_type = models.CharField(
        max_length=20,
        choices=CONTRACT_TYPE_CHOICES,
        default='w2_employee',
        verbose_name=_('Contract Type')
    )
    hire_type = models.CharField(
        max_length=20,
        choices=HIRE_TYPE_CHOICES,
        default='individual',
        verbose_name=_('Hire Type')
    )
    
    # Empresa vinculada (se contratado via empresa)
    company = models.ForeignKey(
        'hr.Company',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees',
        verbose_name=_('Company'),
        help_text=_('Company of the person (if hired via company)')
    )
    
    hire_date = models.DateField(verbose_name=_('Hire Date'))
    termination_date = models.DateField(null=True, blank=True, verbose_name=_('Termination Date'))
    
    # Período de experiência
    probation_period_days = models.IntegerField(null=True, blank=True, default=90, verbose_name=_('Probation Period (days)'))
    probation_end_date = models.DateField(null=True, blank=True, verbose_name=_('Probation End Date'))
    
    # Jornada de trabalho
    WORK_SHIFT_CHOICES = [
        ('morning', _('Morning')),
        ('afternoon', _('Afternoon')),
        ('night', _('Night')),
        ('full_time', _('Full Time')),
        ('flexible', _('Flexible')),
    ]
    work_shift = models.CharField(max_length=20, blank=True, choices=WORK_SHIFT_CHOICES, verbose_name=_('Work Shift'))
    weekly_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, default=40, verbose_name=_('Weekly Hours'))
    work_schedule_start = models.TimeField(null=True, blank=True, verbose_name=_('Work Schedule Start'))
    work_schedule_end = models.TimeField(null=True, blank=True, verbose_name=_('Work Schedule End'))
    days_off = models.CharField(max_length=50, blank=True, verbose_name=_('Days Off'), help_text=_('e.g., Saturday, Sunday'))
    
    # Salário
    base_salary = models.DecimalField(max_digits=15, decimal_places=2, verbose_name=_('Base Salary'))
    commission_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        verbose_name=_('Commission (%)')
    )
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', verbose_name=_('Status'))
    
    # Metadados
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created at'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated at'))
    
    class Meta:
        db_table = 'hr_employees'
        verbose_name = _('Employee')
        verbose_name_plural = _('Employees')
        ordering = ['employee_number']  # Ordenar por employee_number já que user pode ser null
        indexes = [
            models.Index(fields=['employee_number']),
            models.Index(fields=['department', 'status']),
            # models.Index(fields=['warehouse', 'status']),  # TODO: Uncomment when warehouse module is created
            models.Index(fields=['hire_type', 'company']),
        ]
    
    def save(self, *args, **kwargs):
        # Gerar employee_number automaticamente se não existir
        if not self.employee_number:
            # Formato: EMP-000001
            last_employee = Employee.objects.order_by('-id').first()
            if last_employee and last_employee.employee_number:
                try:
                    last_number = int(last_employee.employee_number.split('-')[-1])
                    next_number = last_number + 1
                except (ValueError, IndexError):
                    next_number = 1
            else:
                next_number = 1
            self.employee_number = f"EMP-{next_number:06d}"
        super().save(*args, **kwargs)
    
    def get_vacation_balance(self, reference_date=None):
        """Calcula saldo de férias disponível"""
        if reference_date is None:
            reference_date = date.today()
        
        # Férias adquiridas (30 dias por período aquisitivo de 12 meses)
        # Simplificado: 1 dia por mês trabalhado
        months_worked = (reference_date.year - self.hire_date.year) * 12 + (reference_date.month - self.hire_date.month)
        if months_worked < 0:
            months_worked = 0
        
        # Dias adquiridos (máximo 30 por período)
        periods = months_worked // 12
        acquired_days = min(periods * 30, 30)  # Máximo 30 dias
        
        # Férias já tiradas
        taken_days = Vacation.objects.filter(
            employee=self,
            status__in=['approved', 'taken'],
            start_date__lte=reference_date
        ).aggregate(total=models.Sum('days'))['total'] or 0
        
        # Férias vendidas
        sold_days = Vacation.objects.filter(
            employee=self,
            status__in=['approved', 'taken'],
            sell_days__gt=0
        ).aggregate(total=models.Sum('sell_days'))['total'] or 0
        
        # Saldo disponível
        balance = acquired_days - taken_days - sold_days
        return max(0, balance)
    
    def __str__(self):
        if self.user:
            return f"{self.employee_number} - {self.user.get_full_name()}"
        return f"{self.employee_number}"


class BankAccount(models.Model):
    """Conta Bancária do Funcionário"""
    
    ACCOUNT_TYPE_CHOICES = [
        ('checking', _('Checking Account')),
        ('savings', _('Savings Account')),
    ]
    
    employee = models.ForeignKey(
        'hr.Employee',
        on_delete=models.CASCADE,
        related_name='bank_accounts',
        verbose_name=_('Employee')
    )
    
    # Dados bancários
    bank_name = models.CharField(max_length=100, verbose_name=_('Bank Name'))
    bank_code = models.CharField(max_length=20, blank=True, verbose_name=_('Bank Code'))
    agency = models.CharField(max_length=20, verbose_name=_('Agency'))
    account_number = models.CharField(max_length=50, verbose_name=_('Account Number'))
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPE_CHOICES, default='checking', verbose_name=_('Account Type'))
    
    # PIX (Brasil) ou Chave de Pagamento
    pix_key = models.CharField(max_length=255, blank=True, verbose_name=_('PIX Key'), help_text=_('PIX key (Brazil) or payment key'))
    pix_key_type = models.CharField(
        max_length=20,
        blank=True,
        choices=[
            ('cpf', 'CPF'),
            ('cnpj', 'CNPJ'),
            ('email', 'Email'),
            ('phone', 'Phone'),
            ('random', 'Random Key'),
        ],
        verbose_name=_('PIX Key Type')
    )
    
    # Status
    is_primary = models.BooleanField(default=False, verbose_name=_('Primary Account'))
    is_active = models.BooleanField(default=True, verbose_name=_('Active'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created at'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated at'))
    
    class Meta:
        db_table = 'hr_bank_accounts'
        verbose_name = _('Bank Account')
        verbose_name_plural = _('Bank Accounts')
        ordering = ['-is_primary', 'bank_name']
        indexes = [
            models.Index(fields=['employee', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.bank_name} - {self.account_number}"


class Dependent(models.Model):
    """Dependente do Funcionário"""
    
    RELATIONSHIP_CHOICES = [
        ('spouse', _('Spouse')),
        ('son', _('Son')),
        ('daughter', _('Daughter')),
        ('father', _('Father')),
        ('mother', _('Mother')),
        ('brother', _('Brother')),
        ('sister', _('Sister')),
        ('other', _('Other')),
    ]
    
    employee = models.ForeignKey(
        'hr.Employee',
        on_delete=models.CASCADE,
        related_name='dependents',
        verbose_name=_('Employee')
    )
    
    # Dados do dependente
    name = models.CharField(max_length=255, verbose_name=_('Name'))
    date_of_birth = models.DateField(verbose_name=_('Date of Birth'))
    cpf = models.CharField(max_length=14, blank=True, verbose_name=_('CPF'))
    ssn = models.CharField(max_length=11, blank=True, verbose_name=_('SSN'))
    relationship = models.CharField(max_length=20, choices=RELATIONSHIP_CHOICES, verbose_name=_('Relationship'))
    
    # Para fins de imposto de renda (Brasil) ou dependência (USA)
    is_tax_dependent = models.BooleanField(default=True, verbose_name=_('Tax Dependent'))
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name=_('Active'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created at'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated at'))
    
    class Meta:
        db_table = 'hr_dependents'
        verbose_name = _('Dependent')
        verbose_name_plural = _('Dependents')
        ordering = ['employee', 'relationship', 'name']
        indexes = [
            models.Index(fields=['employee', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_relationship_display()})"


class Education(models.Model):
    """Escolaridade do Funcionário"""
    
    LEVEL_CHOICES = [
        ('elementary', _('Elementary School')),
        ('middle', _('Middle School')),
        ('high_school', _('High School')),
        ('technical', _('Technical Course')),
        ('bachelor', _('Bachelor\'s Degree')),
        ('specialization', _('Specialization')),
        ('masters', _('Master\'s Degree')),
        ('phd', _('PhD')),
        ('post_phd', _('Post-Doctorate')),
    ]
    
    employee = models.ForeignKey(
        'hr.Employee',
        on_delete=models.CASCADE,
        related_name='educations',
        verbose_name=_('Employee')
    )
    
    # Dados da educação
    level = models.CharField(max_length=30, choices=LEVEL_CHOICES, verbose_name=_('Level'))
    institution = models.CharField(max_length=255, verbose_name=_('Institution'))
    course = models.CharField(max_length=255, blank=True, verbose_name=_('Course'))
    start_date = models.DateField(null=True, blank=True, verbose_name=_('Start Date'))
    end_date = models.DateField(null=True, blank=True, verbose_name=_('End Date'))
    is_completed = models.BooleanField(default=True, verbose_name=_('Completed'))
    graduation_year = models.IntegerField(null=True, blank=True, verbose_name=_('Graduation Year'))
    
    # Certificado/Diploma
    certificate_file = models.FileField(
        upload_to='hr/education_certificates/',
        null=True,
        blank=True,
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'jpg', 'jpeg', 'png'])],
        verbose_name=_('Certificate File')
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created at'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated at'))
    
    class Meta:
        db_table = 'hr_educations'
        verbose_name = _('Education')
        verbose_name_plural = _('Educations')
        ordering = ['-end_date', '-graduation_year', 'level']
        indexes = [
            models.Index(fields=['employee']),
        ]
    
    def __str__(self):
        return f"{self.get_level_display()} - {self.institution}"


class WorkExperience(models.Model):
    """Experiência Profissional Anterior do Funcionário"""
    
    employee = models.ForeignKey(
        'hr.Employee',
        on_delete=models.CASCADE,
        related_name='work_experiences',
        verbose_name=_('Employee')
    )
    
    # Dados da experiência
    company_name = models.CharField(max_length=255, verbose_name=_('Company Name'))
    job_title = models.CharField(max_length=200, verbose_name=_('Job Title'))
    start_date = models.DateField(verbose_name=_('Start Date'))
    end_date = models.DateField(null=True, blank=True, verbose_name=_('End Date'))
    is_current = models.BooleanField(default=False, verbose_name=_('Current Job'))
    
    # Descrição
    description = models.TextField(blank=True, verbose_name=_('Description'))
    responsibilities = models.TextField(blank=True, verbose_name=_('Responsibilities'))
    achievements = models.TextField(blank=True, verbose_name=_('Achievements'))
    
    # Referência
    reference_name = models.CharField(max_length=255, blank=True, verbose_name=_('Reference Name'))
    reference_phone = models.CharField(max_length=20, blank=True, verbose_name=_('Reference Phone'))
    reference_email = models.EmailField(blank=True, verbose_name=_('Reference Email'))
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created at'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated at'))
    
    class Meta:
        db_table = 'hr_work_experiences'
        verbose_name = _('Work Experience')
        verbose_name_plural = _('Work Experiences')
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['employee']),
        ]
    
    def __str__(self):
        return f"{self.company_name} - {self.job_title}"


class Benefit(models.Model):
    """Benefício"""
    
    TYPE_CHOICES = [
        ('meal_voucher', _('Meal Voucher')),
        ('food_voucher', _('Food Voucher')),
        ('transportation', _('Transportation Voucher')),
        ('health_insurance', _('Health Insurance')),
        ('dental_insurance', _('Dental Insurance')),
        ('life_insurance', _('Life Insurance')),
        ('daycare', _('Daycare Allowance')),
        ('gympass', _('Gympass')),
        ('other', _('Other')),
    ]
    
    name = models.CharField(max_length=100, verbose_name=_('Name'))
    benefit_type = models.CharField(max_length=30, choices=TYPE_CHOICES, verbose_name=_('Type'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    
    # Valor
    value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Value'),
        help_text=_('Default value for this benefit')
    )
    limit = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Limit'),
        help_text=_('Maximum value limit')
    )
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name=_('Active'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created at'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated at'))
    
    class Meta:
        db_table = 'hr_benefits'
        verbose_name = _('Benefit')
        verbose_name_plural = _('Benefits')
        ordering = ['name']
        indexes = [
            models.Index(fields=['benefit_type', 'is_active']),
        ]
    
    def __str__(self):
        return self.name


class EmployeeBenefit(models.Model):
    """Benefício do Funcionário"""
    
    employee = models.ForeignKey(
        'hr.Employee',
        on_delete=models.CASCADE,
        related_name='employee_benefits',
        verbose_name=_('Employee')
    )
    benefit = models.ForeignKey(
        'hr.Benefit',
        on_delete=models.CASCADE,
        related_name='employee_benefits',
        verbose_name=_('Benefit')
    )
    
    # Valor (pode ser diferente do padrão)
    value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Value'),
        help_text=_('Custom value for this employee (if different from default)')
    )
    
    # Datas
    start_date = models.DateField(verbose_name=_('Start Date'))
    end_date = models.DateField(null=True, blank=True, verbose_name=_('End Date'))
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name=_('Active'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created at'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated at'))
    
    class Meta:
        db_table = 'hr_employee_benefits'
        verbose_name = _('Employee Benefit')
        verbose_name_plural = _('Employee Benefits')
        unique_together = ['employee', 'benefit', 'start_date']
        indexes = [
            models.Index(fields=['employee', 'is_active']),
            models.Index(fields=['benefit', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.employee.user.get_full_name()} - {self.benefit.name}"


class TimeRecord(models.Model):
    """Registro de Ponto"""
    
    TYPE_CHOICES = [
        ('check_in', _('Check In')),
        ('check_out', _('Check Out')),
        ('lunch_in', _('Lunch In')),
        ('lunch_out', _('Lunch Out')),
        ('overtime_in', _('Overtime In')),
        ('overtime_out', _('Overtime Out')),
    ]
    
    employee = models.ForeignKey(
        'hr.Employee',
        on_delete=models.CASCADE,
        related_name='time_records',
        verbose_name=_('Employee')
    )
    record_type = models.CharField(max_length=20, choices=TYPE_CHOICES, verbose_name=_('Record Type'))
    record_date = models.DateField(verbose_name=_('Date'))
    record_time = models.TimeField(verbose_name=_('Time'))
    
    # Localização (se app mobile)
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        verbose_name=_('Latitude')
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        verbose_name=_('Longitude')
    )
    
    # Aprovação
    is_approved = models.BooleanField(default=False, verbose_name=_('Approved'))
    approved_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_time_records',
        verbose_name=_('Approved By')
    )
    approved_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Approved At'))
    
    # Justificativa (se atraso/falta)
    justification = models.TextField(blank=True, verbose_name=_('Justification'))
    
    # Metadados
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created at'))
    
    class Meta:
        db_table = 'hr_time_records'
        verbose_name = _('Time Record')
        verbose_name_plural = _('Time Records')
        ordering = ['-record_date', '-record_time']
        indexes = [
            models.Index(fields=['employee', 'record_date']),
            models.Index(fields=['record_date', 'is_approved']),
        ]
    
    def calculate_work_hours(self, date_filter=None):
        """Calcula horas trabalhadas para um dia específico"""
        if date_filter is None:
            date_filter = self.record_date
        
        # Buscar todos os registros do dia
        records = TimeRecord.objects.filter(
            employee=self.employee,
            record_date=date_filter,
            is_approved=True
        ).order_by('record_time')
        
        if records.count() < 2:
            return Decimal('0.00')
        
        # Calcular horas entre check_in e check_out
        check_in = None
        check_out = None
        lunch_in = None
        lunch_out = None
        
        for record in records:
            if record.record_type == 'check_in':
                check_in = record.record_time
            elif record.record_type == 'check_out':
                check_out = record.record_time
            elif record.record_type == 'lunch_in':
                lunch_in = record.record_time
            elif record.record_type == 'lunch_out':
                lunch_out = record.record_time
        
        if not check_in or not check_out:
            return Decimal('0.00')
        
        # Calcular diferença em horas
        from datetime import datetime, time
        
        check_in_dt = datetime.combine(date_filter, check_in)
        check_out_dt = datetime.combine(date_filter, check_out)
        
        total_minutes = (check_out_dt - check_in_dt).total_seconds() / 60
        
        # Descontar horário de almoço se existir
        if lunch_in and lunch_out:
            lunch_in_dt = datetime.combine(date_filter, lunch_in)
            lunch_out_dt = datetime.combine(date_filter, lunch_out)
            lunch_minutes = (lunch_out_dt - lunch_in_dt).total_seconds() / 60
            total_minutes -= lunch_minutes
        
        hours = Decimal(str(total_minutes / 60)).quantize(Decimal('0.01'))
        return max(Decimal('0.00'), hours)
    
    @classmethod
    def calculate_monthly_hours(cls, employee, year, month):
        """Calcula horas trabalhadas no mês"""
        from django.db.models import Sum
        from django.db.models.functions import Extract
        
        records = cls.objects.filter(
            employee=employee,
            record_date__year=year,
            record_date__month=month,
            is_approved=True
        )
        
        total_hours = Decimal('0.00')
        dates_processed = set()
        
        for record in records:
            if record.record_date not in dates_processed:
                hours = record.calculate_work_hours(record.record_date)
                total_hours += hours
                dates_processed.add(record.record_date)
        
        return total_hours
    
    def calculate_overtime_hours(self, date_filter=None):
        """
        Calcula horas extras para um dia específico
        Horas extras = horas trabalhadas além da jornada normal
        """
        from .calculations import calculate_overtime_hours
        
        if date_filter is None:
            date_filter = self.record_date
        
        normal_hours = self.calculate_work_hours(date_filter)
        
        # Jornada normal do funcionário (horas/dia)
        weekly_hours = Decimal(str(self.employee.weekly_hours)) if self.employee.weekly_hours else Decimal('44.00')
        daily_hours = weekly_hours / Decimal('5')  # 5 dias úteis
        
        overtime = max(Decimal('0.00'), normal_hours - daily_hours)
        
        return {
            'normal_hours': normal_hours,
            'daily_hours': daily_hours,
            'overtime_hours': overtime,
        }
    
    @classmethod
    def calculate_monthly_overtime(cls, employee, year, month):
        """
        Calcula horas extras do mês usando o módulo de cálculos
        """
        from .calculations import calculate_overtime_hours
        return calculate_overtime_hours(employee, year, month)
    
    def __str__(self):
        if self.employee.user:
            return f"{self.employee.user.get_full_name()} - {self.record_date} {self.record_time}"
        return f"{self.employee.employee_number} - {self.record_date} {self.record_time}"


class Vacation(models.Model):
    """Férias"""
    
    STATUS_CHOICES = [
        ('requested', _('Requested')),
        ('approved', _('Approved')),
        ('rejected', _('Rejected')),
        ('taken', _('Taken')),
        ('cancelled', _('Cancelled')),
    ]
    
    employee = models.ForeignKey(
        'hr.Employee',
        on_delete=models.CASCADE,
        related_name='vacations',
        verbose_name=_('Employee')
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='requested',
        verbose_name=_('Status')
    )
    
    # Período
    start_date = models.DateField(verbose_name=_('Start Date'))
    end_date = models.DateField(verbose_name=_('End Date'))
    days = models.IntegerField(verbose_name=_('Days'), help_text=_('Calculated number of days'))
    
    # Período Aquisitivo
    acquisition_period_start = models.DateField(verbose_name=_('Acquisition Period Start'))
    acquisition_period_end = models.DateField(verbose_name=_('Acquisition Period End'))
    
    # Abono
    sell_days = models.IntegerField(
        default=0,
        verbose_name=_('Sell Days'),
        help_text=_('Number of vacation days to sell')
    )
    cash_allowance = models.BooleanField(
        default=False,
        verbose_name=_('Cash Allowance'),
        help_text=_('Pecuniary allowance')
    )
    
    # Aprovação
    approved_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_vacations',
        verbose_name=_('Approved By')
    )
    approved_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Approved At'))
    rejection_reason = models.TextField(blank=True, verbose_name=_('Rejection Reason'))
    
    # Metadados
    requested_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Requested At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    def calculate_balance(self):
        """Calcula saldo de férias automaticamente usando o módulo de cálculos"""
        from .calculations import calculate_vacation_balance
        result = calculate_vacation_balance(self.employee, self.start_date)
        return result['balance_days']
    
    def save(self, *args, **kwargs):
        """
        Auto-calcula dias de férias antes de salvar
        """
        # Calcular número de dias automaticamente
        if self.start_date and self.end_date:
            delta = self.end_date - self.start_date
            # Adicionar 1 para incluir o dia inicial
            self.days = delta.days + 1
        elif not self.days:
            self.days = 0
        
        super().save(*args, **kwargs)
    
    class Meta:
        db_table = 'hr_vacations'
        verbose_name = _('Vacation')
        verbose_name_plural = _('Vacations')
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['employee', 'status']),
            models.Index(fields=['start_date', 'end_date']),
        ]
    
    def __str__(self):
        if self.employee.user:
            return f"{self.employee.user.get_full_name()} - {self.start_date} a {self.end_date}"
        return f"{self.employee.employee_number} - {self.start_date} a {self.end_date}"


class PerformanceReview(models.Model):
    """Avaliação de Desempenho"""
    
    STATUS_CHOICES = [
        ('draft', _('Draft')),
        ('in_progress', _('In Progress')),
        ('completed', _('Completed')),
        ('cancelled', _('Cancelled')),
    ]
    
    employee = models.ForeignKey(
        'hr.Employee',
        on_delete=models.CASCADE,
        related_name='performance_reviews',
        verbose_name=_('Employee')
    )
    reviewer = models.ForeignKey(
        'hr.Employee',
        on_delete=models.CASCADE,
        related_name='reviews_given',
        verbose_name=_('Reviewer')
    )
    
    # Período
    review_period_start = models.DateField(verbose_name=_('Review Period Start'))
    review_period_end = models.DateField(verbose_name=_('Review Period End'))
    review_date = models.DateField(verbose_name=_('Review Date'))
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name=_('Status')
    )
    
    # Critérios e Notas
    criteria_scores = models.JSONField(
        default=dict,
        verbose_name=_('Criteria Scores'),
        help_text=_('Dictionary with criterion as key and score as value')
    )
    overall_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Overall Score')
    )
    
    # Feedback
    strengths = models.TextField(blank=True, verbose_name=_('Strengths'))
    areas_for_improvement = models.TextField(blank=True, verbose_name=_('Areas for Improvement'))
    goals = models.TextField(blank=True, verbose_name=_('Goals'))
    development_plan = models.TextField(blank=True, verbose_name=_('Development Plan'))
    
    # Metadados
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created at'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated at'))
    
    class Meta:
        db_table = 'hr_performance_reviews'
        verbose_name = _('Performance Review')
        verbose_name_plural = _('Performance Reviews')
        ordering = ['-review_date']
        indexes = [
            models.Index(fields=['employee', 'status']),
            models.Index(fields=['reviewer', 'status']),
        ]
    
    def __str__(self):
        return f"{self.employee.user.get_full_name()} - {self.review_date}"


class Training(models.Model):
    """Treinamento"""
    
    name = models.CharField(max_length=255, verbose_name=_('Name'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    
    # Tipo
    training_type = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_('Type'),
        help_text=_('Internal, External, Online, etc.')
    )
    
    # Datas
    start_date = models.DateField(null=True, blank=True, verbose_name=_('Start Date'))
    end_date = models.DateField(null=True, blank=True, verbose_name=_('End Date'))
    duration_hours = models.IntegerField(null=True, blank=True, verbose_name=_('Duration (Hours)'))
    
    # Local
    location = models.CharField(max_length=255, blank=True, verbose_name=_('Location'))
    
    # Instrutor
    instructor = models.CharField(max_length=255, blank=True, verbose_name=_('Instructor'))
    
    # Certificação
    provides_certificate = models.BooleanField(default=False, verbose_name=_('Provides Certificate'))
    certificate_validity_months = models.IntegerField(
        null=True,
        blank=True,
        verbose_name=_('Certificate Validity (Months)')
    )
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name=_('Active'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created at'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated at'))
    
    class Meta:
        db_table = 'hr_trainings'
        verbose_name = _('Training')
        verbose_name_plural = _('Trainings')
        ordering = ['-start_date', 'name']
        indexes = [
            models.Index(fields=['is_active', 'start_date']),
        ]
    
    def __str__(self):
        return self.name


class EmployeeTraining(models.Model):
    """Treinamento do Funcionário"""
    
    STATUS_CHOICES = [
        ('enrolled', _('Enrolled')),
        ('in_progress', _('In Progress')),
        ('completed', _('Completed')),
        ('cancelled', _('Cancelled')),
    ]
    
    employee = models.ForeignKey(
        'hr.Employee',
        on_delete=models.CASCADE,
        related_name='trainings',
        verbose_name=_('Employee')
    )
    training = models.ForeignKey(
        'hr.Training',
        on_delete=models.CASCADE,
        related_name='employee_trainings',
        verbose_name=_('Training')
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='enrolled',
        verbose_name=_('Status')
    )
    
    # Datas
    enrollment_date = models.DateField(auto_now_add=True, verbose_name=_('Enrollment Date'))
    completion_date = models.DateField(null=True, blank=True, verbose_name=_('Completion Date'))
    
    # Notas
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Score')
    )
    
    # Certificado
    certificate_issued = models.BooleanField(default=False, verbose_name=_('Certificate Issued'))
    certificate_issued_date = models.DateField(null=True, blank=True, verbose_name=_('Certificate Issued Date'))
    certificate_expiry_date = models.DateField(null=True, blank=True, verbose_name=_('Certificate Expiry Date'))
    
    # Observações
    notes = models.TextField(blank=True, verbose_name=_('Notes'))
    
    # Metadados
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created at'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated at'))
    
    class Meta:
        db_table = 'hr_employee_trainings'
        verbose_name = _('Employee Training')
        verbose_name_plural = _('Employee Trainings')
        unique_together = ['employee', 'training']
        indexes = [
            models.Index(fields=['employee', 'status']),
            models.Index(fields=['training', 'status']),
        ]
    
    def __str__(self):
        return f"{self.employee.user.get_full_name()} - {self.training.name}"


class JobOpening(models.Model):
    """Vaga de Emprego"""
    
    STATUS_CHOICES = [
        ('open', _('Open')),
        ('closed', _('Closed')),
        ('cancelled', _('Cancelled')),
    ]
    
    title = models.CharField(max_length=255, verbose_name=_('Title'))
    department = models.ForeignKey(
        'hr.Department',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='job_openings',
        verbose_name=_('Department')
    )
    
    # Descrição
    description = models.TextField(verbose_name=_('Description'))
    requirements = models.TextField(blank=True, verbose_name=_('Requirements'))
    
    # Salário
    salary_min = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Minimum Salary')
    )
    salary_max = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Maximum Salary')
    )
    
    # Datas
    posted_date = models.DateField(auto_now_add=True, verbose_name=_('Posted Date'))
    closing_date = models.DateField(null=True, blank=True, verbose_name=_('Closing Date'))
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='open',
        verbose_name=_('Status')
    )
    
    # Metadados
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created at'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated at'))
    
    class Meta:
        db_table = 'hr_job_openings'
        verbose_name = _('Job Opening')
        verbose_name_plural = _('Job Openings')
        ordering = ['-posted_date']
        indexes = [
            models.Index(fields=['status', 'posted_date']),
            models.Index(fields=['department', 'status']),
        ]
    
    def __str__(self):
        return self.title


class Candidate(models.Model):
    """Candidato"""
    
    STATUS_CHOICES = [
        ('applied', _('Applied')),
        ('screening', _('Screening')),
        ('interview', _('Interview')),
        ('test', _('Test')),
        ('approved', _('Approved')),
        ('rejected', _('Rejected')),
        ('hired', _('Hired')),
    ]
    
    # Dados Pessoais
    first_name = models.CharField(max_length=100, verbose_name=_('First Name'))
    last_name = models.CharField(max_length=100, verbose_name=_('Last Name'))
    email = models.EmailField(verbose_name=_('Email'))
    phone = models.CharField(max_length=20, blank=True, verbose_name=_('Phone'))
    
    # Vaga
    job_opening = models.ForeignKey(
        'hr.JobOpening',
        on_delete=models.CASCADE,
        related_name='candidates',
        verbose_name=_('Job Opening')
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='applied',
        verbose_name=_('Status')
    )
    
    # Currículo
    resume = models.FileField(
        upload_to='resumes/',
        null=True,
        blank=True,
        verbose_name=_('Resume')
    )
    
    # Notas
    notes = models.TextField(blank=True, verbose_name=_('Notes'))
    
    # Metadados
    applied_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Applied At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        db_table = 'hr_candidates'
        verbose_name = _('Candidate')
        verbose_name_plural = _('Candidates')
        ordering = ['-applied_at']
        indexes = [
            models.Index(fields=['job_opening', 'status']),
            models.Index(fields=['status', 'applied_at']),
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.job_opening.title}"


class Payroll(models.Model):
    """Folha de Pagamento"""
    
    # Número da folha
    payroll_number = models.CharField(max_length=50, unique=True, verbose_name=_('Payroll Number'))
    
    # Período
    month = models.IntegerField(verbose_name=_('Month'), help_text=_('1-12'))
    year = models.IntegerField(verbose_name=_('Year'))
    
    # Funcionário
    employee = models.ForeignKey(
        'hr.Employee',
        on_delete=models.PROTECT,
        related_name='payrolls',
        verbose_name=_('Employee')
    )
    
    # Proventos
    base_salary = models.DecimalField(max_digits=15, decimal_places=2, verbose_name=_('Base Salary'))
    commissions = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name=_('Commissions')
    )
    overtime = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name=_('Overtime')
    )
    bonuses = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name=_('Bonuses')
    )
    benefits_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name=_('Benefits Value')
    )
    total_earnings = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        verbose_name=_('Total Earnings'),
        help_text=_('Calculated: base_salary + commissions + overtime + bonuses + benefits_value')
    )
    
    # Descontos
    inss = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name=_('INSS'))
    irrf = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name=_('IRRF'))
    fgts = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name=_('FGTS'))
    transportation = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name=_('Transportation')
    )
    meal_voucher = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name=_('Meal Voucher')
    )
    loans = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name=_('Loans'))
    advances = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name=_('Advances'))
    other_deductions = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name=_('Other Deductions')
    )
    total_deductions = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        verbose_name=_('Total Deductions'),
        help_text=_('Sum of all deductions')
    )
    
    # Total
    net_salary = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        verbose_name=_('Net Salary'),
        help_text=_('total_earnings - total_deductions')
    )
    
    # Status
    is_processed = models.BooleanField(default=False, verbose_name=_('Processed'))
    processed_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Processed At'))
    
    # Metadados
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created at'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated at'))
    
    class Meta:
        db_table = 'hr_payrolls'
        verbose_name = _('Payroll')
        verbose_name_plural = _('Payrolls')
        unique_together = ['employee', 'month', 'year']
        ordering = ['-year', '-month']
        indexes = [
            models.Index(fields=['employee', 'year', 'month']),
            models.Index(fields=['is_processed', 'year', 'month']),
        ]
    
    def save(self, *args, **kwargs):
        # Gerar payroll_number automaticamente se não existir
        if not self.payroll_number:
            # Formato: PAY-2024-11-EMP001
            self.payroll_number = f"PAY-{self.year}-{self.month:02d}-{self.employee.employee_number}"
        
        # Auto-calcular valores se não foram processados ainda
        if not self.is_processed or not self.pk:
            from .calculations import auto_calculate_payroll
            self = auto_calculate_payroll(self)
        else:
            # Recalcular totais mesmo se já processado (para garantir consistência)
            from .calculations import calculate_payroll_totals
            totals = calculate_payroll_totals(self)
            self.total_earnings = totals['total_earnings']
            self.total_deductions = totals['total_deductions']
            self.net_salary = totals['net_salary']
        
        super().save(*args, **kwargs)
    
    def recalculate(self):
        """
        Recalcula todos os valores da folha
        """
        from .calculations import auto_calculate_payroll
        return auto_calculate_payroll(self)
    
    def recalculate(self):
        """
        Recalcula todos os valores da folha
        """
        from .calculations import auto_calculate_payroll
        return auto_calculate_payroll(self)
    
    def __str__(self):
        if self.employee.user:
            return f"{self.payroll_number} - {self.employee.user.get_full_name()}"
        return f"{self.payroll_number} - {self.employee.employee_number}"


# Novos modelos para funcionalidades avançadas

class EmployeeDocument(models.Model):
    """Documento do Funcionário"""
    
    DOCUMENT_TYPE_CHOICES = [
        ('work_permit', _('Work Permit')),
        ('id_card', _('ID Card')),
        ('diploma', _('Diploma')),
        ('certificate', _('Certificate')),
        ('contract', _('Contract')),
        ('other', _('Other')),
    ]
    
    employee = models.ForeignKey(
        'hr.Employee',
        on_delete=models.CASCADE,
        related_name='documents',
        verbose_name=_('Employee')
    )
    
    document_type = models.CharField(
        max_length=30,
        choices=DOCUMENT_TYPE_CHOICES,
        verbose_name=_('Document Type')
    )
    
    name = models.CharField(max_length=255, verbose_name=_('Document Name'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    
    file = models.FileField(
        upload_to='employee_documents/%Y/%m/',
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'])],
        verbose_name=_('File')
    )
    
    expiry_date = models.DateField(null=True, blank=True, verbose_name=_('Expiry Date'))
    is_active = models.BooleanField(default=True, verbose_name=_('Active'))
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created at'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated at'))
    
    class Meta:
        db_table = 'hr_employee_documents'
        verbose_name = _('Employee Document')
        verbose_name_plural = _('Employee Documents')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['employee', 'document_type']),
            models.Index(fields=['expiry_date', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.employee.user.get_full_name()} - {self.name}"


class EmployeeHistory(models.Model):
    """Histórico de Cargos/Salários do Funcionário"""
    
    CHANGE_TYPE_CHOICES = [
        ('position', _('Position Change')),
        ('salary', _('Salary Change')),
        ('department', _('Department Change')),
        ('promotion', _('Promotion')),
        ('transfer', _('Transfer')),
    ]
    
    employee = models.ForeignKey(
        'hr.Employee',
        on_delete=models.CASCADE,
        related_name='history',
        verbose_name=_('Employee')
    )
    
    change_type = models.CharField(
        max_length=20,
        choices=CHANGE_TYPE_CHOICES,
        verbose_name=_('Change Type')
    )
    
    # Valores anteriores
    old_job_title = models.CharField(max_length=100, blank=True, verbose_name=_('Old Job Title'))
    old_department = models.ForeignKey(
        'hr.Department',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='old_employee_history',
        verbose_name=_('Old Department')
    )
    old_salary = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Old Salary')
    )
    
    # Valores novos
    new_job_title = models.CharField(max_length=100, blank=True, verbose_name=_('New Job Title'))
    new_department = models.ForeignKey(
        'hr.Department',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='new_employee_history',
        verbose_name=_('New Department')
    )
    new_salary = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('New Salary')
    )
    
    # Detalhes
    reason = models.TextField(blank=True, verbose_name=_('Reason'))
    notes = models.TextField(blank=True, verbose_name=_('Notes'))
    
    # Quem fez a mudança
    changed_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employee_history_changes',
        verbose_name=_('Changed By')
    )
    
    effective_date = models.DateField(verbose_name=_('Effective Date'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created at'))
    
    class Meta:
        db_table = 'hr_employee_history'
        verbose_name = _('Employee History')
        verbose_name_plural = _('Employee History')
        ordering = ['-effective_date', '-created_at']
        indexes = [
            models.Index(fields=['employee', 'change_type']),
            models.Index(fields=['effective_date']),
        ]
    
    def __str__(self):
        return f"{self.employee.user.get_full_name()} - {self.get_change_type_display()} - {self.effective_date}"


class TaxTable(models.Model):
    """Tabela de Impostos (INSS/IRRF)"""
    
    TAX_TYPE_CHOICES = [
        ('inss', _('INSS')),
        ('irrf', _('IRRF')),
    ]
    
    tax_type = models.CharField(
        max_length=10,
        choices=TAX_TYPE_CHOICES,
        verbose_name=_('Tax Type')
    )
    
    year = models.IntegerField(verbose_name=_('Year'))
    month = models.IntegerField(null=True, blank=True, verbose_name=_('Month'), help_text=_('Null for annual tables'))
    
    # Faixas de cálculo
    min_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        verbose_name=_('Min Value')
    )
    max_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Max Value'),
        help_text=_('Null for unlimited')
    )
    
    # Alíquota
    rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        verbose_name=_('Rate (%)')
    )
    
    # Dedução
    deduction = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name=_('Deduction')
    )
    
    is_active = models.BooleanField(default=True, verbose_name=_('Active'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created at'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated at'))
    
    class Meta:
        db_table = 'hr_tax_tables'
        verbose_name = _('Tax Table')
        verbose_name_plural = _('Tax Tables')
        ordering = ['tax_type', 'year', 'min_value']
        unique_together = [['tax_type', 'year', 'month', 'min_value']]
        indexes = [
            models.Index(fields=['tax_type', 'year', 'is_active']),
        ]
    
    @classmethod
    def calculate_inss(cls, base_value, year=None, month=None):
        """Calcula INSS baseado na tabela"""
        if year is None:
            year = date.today().year
        if month is None:
            month = date.today().month
        
        tables = cls.objects.filter(
            tax_type='inss',
            year=year,
            is_active=True
        ).order_by('min_value')
        
        total_inss = Decimal('0.00')
        remaining = base_value
        
        for table in tables:
            if remaining <= 0:
                break
            
            if table.max_value:
                taxable = min(remaining, table.max_value - table.min_value + Decimal('0.01'))
            else:
                taxable = remaining
            
            if taxable > 0:
                inss_value = (taxable * table.rate / 100) - table.deduction
                total_inss += max(Decimal('0.00'), inss_value)
                remaining -= taxable
        
        return min(total_inss, base_value * Decimal('0.11'))  # Teto INSS 11%
    
    @classmethod
    def calculate_irrf(cls, base_value, year=None, month=None, dependents=0):
        """Calcula IRRF baseado na tabela"""
        if year is None:
            year = date.today().year
        if month is None:
            month = date.today().month
        
        # Dedução por dependente (valor pode variar por ano)
        dependent_deduction = Decimal('189.59') * dependents  # Valor 2024
        taxable_base = base_value - dependent_deduction
        
        if taxable_base <= 0:
            return Decimal('0.00')
        
        tables = cls.objects.filter(
            tax_type='irrf',
            year=year,
            is_active=True
        ).order_by('min_value')
        
        for table in tables:
            if table.max_value:
                if table.min_value <= taxable_base <= table.max_value:
                    irrf = (taxable_base * table.rate / 100) - table.deduction
                    return max(Decimal('0.00'), irrf)
            else:
                if taxable_base >= table.min_value:
                    irrf = (taxable_base * table.rate / 100) - table.deduction
                    return max(Decimal('0.00'), irrf)
        
        return Decimal('0.00')
    
    def __str__(self):
        return f"{self.get_tax_type_display()} - {self.year} - {self.min_value} a {self.max_value or '∞'}"


class HRNotification(models.Model):
    """Notificação do Módulo HR"""
    
    NOTIFICATION_TYPE_CHOICES = [
        ('vacation_expiring', _('Vacation Expiring')),
        ('vacation_balance_low', _('Vacation Balance Low')),
        ('document_expiring', _('Document Expiring')),
        ('time_record_pending', _('Time Record Pending Approval')),
        ('vacation_request', _('Vacation Request')),
        ('payroll_processed', _('Payroll Processed')),
        ('other', _('Other')),
    ]
    
    employee = models.ForeignKey(
        'hr.Employee',
        on_delete=models.CASCADE,
        related_name='notifications',
        null=True,
        blank=True,
        verbose_name=_('Employee')
    )
    
    notification_type = models.CharField(
        max_length=30,
        choices=NOTIFICATION_TYPE_CHOICES,
        verbose_name=_('Type')
    )
    
    title = models.CharField(max_length=255, verbose_name=_('Title'))
    message = models.TextField(verbose_name=_('Message'))
    
    is_read = models.BooleanField(default=False, verbose_name=_('Read'))
    read_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Read At'))
    
    # Link para ação (opcional)
    action_url = models.CharField(max_length=500, blank=True, verbose_name=_('Action URL'))
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created at'))
    
    class Meta:
        db_table = 'hr_notifications'
        verbose_name = _('HR Notification')
        verbose_name_plural = _('HR Notifications')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['employee', 'is_read']),
            models.Index(fields=['notification_type', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.employee.user.get_full_name() if self.employee and self.employee.user else 'All'}"


class Contract(models.Model):
    """Contrato de Trabalho do Funcionário"""
    
    CONTRACT_TYPE_CHOICES = [
        ('w2_employee', _('W2 Employee Contract')),
        ('1099_contractor', _('1099 Contractor Agreement')),
        ('clt', _('CLT Contract (Brazil)')),
        ('pj', _('PJ Contract (Brazil)')),
        ('llc', _('LLC Service Agreement')),
        ('s_corp', _('S-Corp Service Agreement')),
        ('c_corp', _('C-Corp Service Agreement')),
        ('partnership', _('Partnership Agreement')),
        ('intern', _('Internship Agreement')),
        ('temporary', _('Temporary Work Agreement')),
    ]
    
    STATUS_CHOICES = [
        ('draft', _('Draft')),
        ('pending_signature', _('Pending Signature')),
        ('signed', _('Signed')),
        ('active', _('Active')),
        ('expired', _('Expired')),
        ('terminated', _('Terminated')),
    ]
    
    employee = models.ForeignKey(
        'hr.Employee',
        on_delete=models.CASCADE,
        related_name='contracts',
        verbose_name=_('Employee')
    )
    
    # Tipo de contrato
    contract_type = models.CharField(
        max_length=30,
        choices=CONTRACT_TYPE_CHOICES,
        verbose_name=_('Contract Type')
    )
    
    # Número do contrato
    contract_number = models.CharField(max_length=50, unique=True, verbose_name=_('Contract Number'))
    
    # Datas
    start_date = models.DateField(verbose_name=_('Start Date'))
    end_date = models.DateField(null=True, blank=True, verbose_name=_('End Date'), help_text=_('Leave blank for indefinite contracts'))
    signature_date = models.DateField(null=True, blank=True, verbose_name=_('Signature Date'))
    
    # Arquivo PDF gerado
    pdf_file = models.FileField(
        upload_to='hr/contracts/%Y/%m/',
        null=True,
        blank=True,
        verbose_name=_('PDF File')
    )
    
    # Status
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='draft', verbose_name=_('Status'))
    
    # Dados do contrato (JSON para flexibilidade)
    contract_data = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_('Contract Data'),
        help_text=_('Additional contract data in JSON format')
    )
    
    # Observações
    notes = models.TextField(blank=True, verbose_name=_('Notes'))
    
    # Metadados
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created at'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated at'))
    generated_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Generated at'))
    
    class Meta:
        db_table = 'hr_contracts'
        verbose_name = _('Contract')
        verbose_name_plural = _('Contracts')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['employee', 'status']),
            models.Index(fields=['contract_type', 'status']),
            models.Index(fields=['contract_number']),
        ]
    
    def save(self, *args, **kwargs):
        # Gerar contract_number automaticamente se não existir
        if not self.contract_number:
            # Formato: CONTRACT-EMP001-2024-001
            year = self.start_date.year if self.start_date else date.today().year
            last_contract = Contract.objects.filter(
                employee=self.employee,
                start_date__year=year
            ).order_by('-id').first()
            
            if last_contract and last_contract.contract_number:
                try:
                    last_number = int(last_contract.contract_number.split('-')[-1])
                    next_number = last_number + 1
                except (ValueError, IndexError):
                    next_number = 1
            else:
                next_number = 1
            
            self.contract_number = f"CONTRACT-{self.employee.employee_number}-{year}-{next_number:03d}"
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.contract_number} - {self.employee.employee_number}"

