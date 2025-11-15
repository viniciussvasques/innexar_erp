"""
Sistema de Geração Automática de Contratos de Trabalho
Suporta: W2, 1099, CLT, PJ, LLC, S-Corp, C-Corp, Partnership, Intern, Temporary
"""
from io import BytesIO
from datetime import date, datetime
from decimal import Decimal
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
import os


def get_employee_full_name(employee):
    """Retorna o nome completo do funcionário"""
    if employee.user:
        return employee.user.get_full_name() or employee.user.email
    return employee.employee_number


def get_employee_address(employee):
    """Retorna o endereço formatado do funcionário"""
    parts = []
    if employee.address:
        parts.append(employee.address)
    if employee.city:
        parts.append(employee.city)
    if employee.state:
        parts.append(employee.state)
    if employee.zip_code:
        parts.append(employee.zip_code)
    if employee.country:
        parts.append(employee.country)
    return ", ".join(parts) if parts else ""


def get_company_info():
    """Retorna informações da empresa (tenant) - pode ser configurado"""
    # TODO: Integrar com modelo Tenant para pegar dados da empresa
    return {
        'name': 'Innexar ERP',
        'address': '123 Business Street',
        'city': 'City',
        'state': 'State',
        'zip_code': '12345',
        'country': 'USA',
        'phone': '+1 (555) 123-4567',
        'email': 'hr@innexar.app',
    }


def generate_w2_contract(employee, contract_data=None):
    """Gera contrato W2 (Employee Contract - USA)"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    story = []
    
    # Estilos
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=12,
        spaceBefore=12
    )
    normal_style = styles['Normal']
    normal_style.fontSize = 11
    normal_style.leading = 14
    
    # Cabeçalho
    company_info = get_company_info()
    story.append(Paragraph(f"<b>{company_info['name']}</b>", title_style))
    story.append(Paragraph(f"{company_info['address']}, {company_info['city']}, {company_info['state']} {company_info['zip_code']}", normal_style))
    story.append(Paragraph(f"Phone: {company_info['phone']} | Email: {company_info['email']}", normal_style))
    story.append(Spacer(1, 0.3*inch))
    
    # Título
    story.append(Paragraph("<b>EMPLOYMENT AGREEMENT</b>", title_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Informações do funcionário
    employee_name = get_employee_full_name(employee)
    employee_address = get_employee_address(employee)
    
    # Data
    today = date.today()
    story.append(Paragraph(f"<b>Date:</b> {today.strftime('%B %d, %Y')}", normal_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Partes
    story.append(Paragraph("<b>PARTIES:</b>", heading_style))
    story.append(Paragraph(f"This Employment Agreement (\"Agreement\") is entered into on {today.strftime('%B %d, %Y')} between:", normal_style))
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph(f"<b>Employer:</b> {company_info['name']}, located at {company_info['address']}, {company_info['city']}, {company_info['state']} {company_info['zip_code']}", normal_style))
    story.append(Paragraph(f"<b>Employee:</b> {employee_name}, located at {employee_address}", normal_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Termos
    story.append(Paragraph("<b>TERMS AND CONDITIONS:</b>", heading_style))
    
    # 1. Position
    job_title = employee.job_position.name if employee.job_position else employee.job_title
    story.append(Paragraph(f"<b>1. Position:</b> Employee shall serve as {job_title}.", normal_style))
    story.append(Spacer(1, 0.1*inch))
    
    # 2. Start Date
    start_date = contract_data.get('start_date', employee.hire_date) if contract_data else employee.hire_date
    story.append(Paragraph(f"<b>2. Start Date:</b> {start_date.strftime('%B %d, %Y')}", normal_style))
    story.append(Spacer(1, 0.1*inch))
    
    # 3. Compensation
    base_salary = contract_data.get('base_salary', employee.base_salary) if contract_data else employee.base_salary
    story.append(Paragraph(f"<b>3. Compensation:</b> Employee shall receive a base salary of ${base_salary:,.2f} per year, payable in accordance with the Company's standard payroll practices.", normal_style))
    story.append(Spacer(1, 0.1*inch))
    
    # 4. Benefits
    story.append(Paragraph("<b>4. Benefits:</b> Employee shall be eligible to participate in the Company's benefit plans, subject to the terms and conditions of such plans.", normal_style))
    story.append(Spacer(1, 0.1*inch))
    
    # 5. At-Will Employment
    story.append(Paragraph("<b>5. At-Will Employment:</b> This Agreement does not constitute a guarantee of employment for any specific duration. Employment is at-will and may be terminated by either party at any time, with or without cause or notice.", normal_style))
    story.append(Spacer(1, 0.1*inch))
    
    # 6. Confidentiality
    story.append(Paragraph("<b>6. Confidentiality:</b> Employee agrees to maintain the confidentiality of all proprietary and confidential information of the Company.", normal_style))
    story.append(Spacer(1, 0.1*inch))
    
    # Assinaturas
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph("<b>IN WITNESS WHEREOF</b>, the parties have executed this Agreement as of the date first written above.", normal_style))
    story.append(Spacer(1, 0.3*inch))
    
    # Tabela de assinaturas
    signature_data = [
        ['', ''],
        ['_________________________', '_________________________'],
        [f"{company_info['name']}", employee_name],
        ['Employer', 'Employee'],
    ]
    signature_table = Table(signature_data, colWidths=[3.5*inch, 3.5*inch])
    signature_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(signature_table)
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer


def generate_1099_contract(employee, contract_data=None):
    """Gera contrato 1099 (Independent Contractor Agreement - USA)"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    story = []
    
    # Estilos
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=12,
        spaceBefore=12
    )
    normal_style = styles['Normal']
    normal_style.fontSize = 11
    normal_style.leading = 14
    
    # Cabeçalho
    company_info = get_company_info()
    story.append(Paragraph(f"<b>{company_info['name']}</b>", title_style))
    story.append(Spacer(1, 0.3*inch))
    
    # Título
    story.append(Paragraph("<b>INDEPENDENT CONTRACTOR AGREEMENT</b>", title_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Informações
    employee_name = get_employee_full_name(employee)
    today = date.today()
    start_date = contract_data.get('start_date', employee.hire_date) if contract_data else employee.hire_date
    base_salary = contract_data.get('base_salary', employee.base_salary) if contract_data else employee.base_salary
    
    story.append(Paragraph(f"<b>Date:</b> {today.strftime('%B %d, %Y')}", normal_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("<b>PARTIES:</b>", heading_style))
    story.append(Paragraph(f"This Independent Contractor Agreement (\"Agreement\") is entered into on {today.strftime('%B %d, %Y')} between:", normal_style))
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph(f"<b>Company:</b> {company_info['name']}", normal_style))
    story.append(Paragraph(f"<b>Contractor:</b> {employee_name}", normal_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("<b>TERMS:</b>", heading_style))
    story.append(Paragraph(f"<b>1. Services:</b> Contractor agrees to provide services as {employee.job_title or 'Independent Contractor'}.", normal_style))
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph(f"<b>2. Compensation:</b> Contractor shall receive ${base_salary:,.2f} per {contract_data.get('payment_period', 'month') if contract_data else 'month'}.", normal_style))
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph("<b>3. Independent Contractor Status:</b> Contractor is an independent contractor and not an employee. Contractor is responsible for all taxes.", normal_style))
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph("<b>4. Term:</b> This Agreement shall commence on the start date and continue until terminated by either party.", normal_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Assinaturas
    signature_data = [
        ['', ''],
        ['_________________________', '_________________________'],
        [company_info['name'], employee_name],
        ['Company', 'Contractor'],
    ]
    signature_table = Table(signature_data, colWidths=[3.5*inch, 3.5*inch])
    signature_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(signature_table)
    
    doc.build(story)
    buffer.seek(0)
    return buffer


def generate_clt_contract(employee, contract_data=None):
    """Gera contrato CLT (Consolidação das Leis do Trabalho - Brasil)"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    story = []
    
    # Estilos
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=12,
        spaceBefore=12
    )
    normal_style = styles['Normal']
    normal_style.fontSize = 11
    normal_style.leading = 14
    
    # Cabeçalho
    company_info = get_company_info()
    story.append(Paragraph(f"<b>{company_info['name']}</b>", title_style))
    story.append(Spacer(1, 0.3*inch))
    
    # Título
    story.append(Paragraph("<b>CONTRATO DE TRABALHO - CLT</b>", title_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Informações
    employee_name = get_employee_full_name(employee)
    today = date.today()
    start_date = contract_data.get('start_date', employee.hire_date) if contract_data else employee.hire_date
    base_salary = contract_data.get('base_salary', employee.base_salary) if contract_data else employee.base_salary
    
    story.append(Paragraph(f"<b>Data:</b> {today.strftime('%d de %B de %Y')}", normal_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("<b>PARTES:</b>", heading_style))
    story.append(Paragraph(f"<b>Empregador:</b> {company_info['name']}, CNPJ: [CNPJ], situado em {company_info['address']}, {company_info['city']} - {company_info['state']}, CEP {company_info['zip_code']}.", normal_style))
    story.append(Paragraph(f"<b>Empregado:</b> {employee_name}, CPF: {employee.cpf or '[CPF]'}, residente em {get_employee_address(employee)}.", normal_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("<b>CLÁUSULAS:</b>", heading_style))
    job_title = employee.job_position.name if employee.job_position else employee.job_title
    story.append(Paragraph(f"<b>1. FUNÇÃO:</b> O empregado será admitido para exercer a função de {job_title}.", normal_style))
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph(f"<b>2. DATA DE ADMISSÃO:</b> {start_date.strftime('%d de %B de %Y')}.", normal_style))
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph(f"<b>3. REMUNERAÇÃO:</b> O salário mensal será de R$ {base_salary:,.2f}, pago até o 5º dia útil do mês subsequente.", normal_style))
    story.append(Spacer(1, 0.1*inch))
    weekly_hours = employee.weekly_hours or 44
    story.append(Paragraph(f"<b>4. JORNADA DE TRABALHO:</b> {weekly_hours} horas semanais.", normal_style))
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph("<b>5. PERÍODO DE EXPERIÊNCIA:</b> 90 (noventa) dias, podendo ser prorrogado por igual período.", normal_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Assinaturas
    signature_data = [
        ['', ''],
        ['_________________________', '_________________________'],
        [company_info['name'], employee_name],
        ['Empregador', 'Empregado'],
    ]
    signature_table = Table(signature_data, colWidths=[3.5*inch, 3.5*inch])
    signature_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(signature_table)
    
    doc.build(story)
    buffer.seek(0)
    return buffer


def generate_pj_contract(employee, contract_data=None):
    """Gera contrato PJ (Pessoa Jurídica - Brasil)"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    story = []
    
    # Estilos
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=12,
        spaceBefore=12
    )
    normal_style = styles['Normal']
    normal_style.fontSize = 11
    normal_style.leading = 14
    
    # Cabeçalho
    company_info = get_company_info()
    story.append(Paragraph(f"<b>{company_info['name']}</b>", title_style))
    story.append(Spacer(1, 0.3*inch))
    
    # Título
    story.append(Paragraph("<b>CONTRATO DE PRESTAÇÃO DE SERVIÇOS - PJ</b>", title_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Informações
    employee_name = get_employee_full_name(employee)
    today = date.today()
    start_date = contract_data.get('start_date', employee.hire_date) if contract_data else employee.hire_date
    base_salary = contract_data.get('base_salary', employee.base_salary) if contract_data else employee.base_salary
    
    # Se contratado via empresa, usar dados da empresa
    if employee.company:
        contractor_name = employee.company.legal_name
        contractor_doc = f"CNPJ: {employee.company.ein}"
    else:
        contractor_name = employee_name
        contractor_doc = f"CPF: {employee.cpf or '[CPF]'}"
    
    story.append(Paragraph(f"<b>Data:</b> {today.strftime('%d de %B de %Y')}", normal_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("<b>PARTES:</b>", heading_style))
    story.append(Paragraph(f"<b>Contratante:</b> {company_info['name']}, CNPJ: [CNPJ].", normal_style))
    story.append(Paragraph(f"<b>Contratado:</b> {contractor_name}, {contractor_doc}.", normal_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("<b>CLÁUSULAS:</b>", heading_style))
    job_title = employee.job_position.name if employee.job_position else employee.job_title
    story.append(Paragraph(f"<b>1. OBJETO:</b> Prestação de serviços de {job_title}.", normal_style))
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph(f"<b>2. VALOR:</b> R$ {base_salary:,.2f} mensais.", normal_style))
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph("<b>3. PAGAMENTO:</b> Até o 5º dia útil do mês subsequente.", normal_style))
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph("<b>4. RESPONSABILIDADES:</b> O contratado é responsável por todos os impostos e encargos.", normal_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Assinaturas
    signature_data = [
        ['', ''],
        ['_________________________', '_________________________'],
        [company_info['name'], contractor_name],
        ['Contratante', 'Contratado'],
    ]
    signature_table = Table(signature_data, colWidths=[3.5*inch, 3.5*inch])
    signature_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(signature_table)
    
    doc.build(story)
    buffer.seek(0)
    return buffer


def generate_contract_pdf(employee, contract_type, contract_data=None):
    """
    Gera PDF do contrato baseado no tipo
    
    Args:
        employee: Instância do modelo Employee
        contract_type: Tipo de contrato (w2_employee, 1099_contractor, clt, pj, etc.)
        contract_data: Dicionário com dados adicionais do contrato
    
    Returns:
        BytesIO buffer com o PDF gerado
    """
    contract_generators = {
        'w2_employee': generate_w2_contract,
        '1099_contractor': generate_1099_contract,
        'clt': generate_clt_contract,
        'pj': generate_pj_contract,
        # Adicionar outros tipos conforme necessário
    }
    
    generator = contract_generators.get(contract_type)
    if not generator:
        # Fallback para W2 se tipo não encontrado
        generator = generate_w2_contract
    
    return generator(employee, contract_data)

