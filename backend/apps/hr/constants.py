"""
HR Constants - Dados pré-definidos hardcoded
Estes dados estão sempre disponíveis, mesmo sem banco de dados
"""
from typing import Dict, List, Any

# ============================================================================
# DEPARTMENTS - Dados padrão de departamentos
# ============================================================================

DEPARTMENTS_PT: List[Dict[str, str]] = [
    {'code': 'ADM', 'name': 'Administração', 'description': 'Departamento de Administração e Gestão'},
    {'code': 'RH', 'name': 'Recursos Humanos', 'description': 'Departamento de Recursos Humanos'},
    {'code': 'TI', 'name': 'Tecnologia da Informação', 'description': 'Departamento de Tecnologia da Informação'},
    {'code': 'FIN', 'name': 'Financeiro', 'description': 'Departamento Financeiro'},
    {'code': 'VENDAS', 'name': 'Vendas', 'description': 'Departamento de Vendas'},
    {'code': 'MARKETING', 'name': 'Marketing', 'description': 'Departamento de Marketing'},
    {'code': 'OP', 'name': 'Operações', 'description': 'Departamento de Operações'},
    {'code': 'QUALIDADE', 'name': 'Qualidade', 'description': 'Departamento de Qualidade'},
    {'code': 'JURIDICO', 'name': 'Jurídico', 'description': 'Departamento Jurídico'},
    {'code': 'COMERCIAL', 'name': 'Comercial', 'description': 'Departamento Comercial'},
    {'code': 'ATENDIMENTO', 'name': 'Atendimento ao Cliente', 'description': 'Departamento de Atendimento ao Cliente'},
    {'code': 'LOGISTICA', 'name': 'Logística', 'description': 'Departamento de Logística'},
    {'code': 'PRODUCAO', 'name': 'Produção', 'description': 'Departamento de Produção'},
    {'code': 'ENGENHARIA', 'name': 'Engenharia', 'description': 'Departamento de Engenharia'},
    {'code': 'PESQUISA', 'name': 'Pesquisa e Desenvolvimento', 'description': 'Departamento de Pesquisa e Desenvolvimento'},
    {'code': 'COMPRAS', 'name': 'Compras', 'description': 'Departamento de Compras'},
    {'code': 'SEGURANCA', 'name': 'Segurança do Trabalho', 'description': 'Departamento de Segurança do Trabalho'},
    {'code': 'MEIO_AMBIENTE', 'name': 'Meio Ambiente', 'description': 'Departamento de Meio Ambiente'},
]

DEPARTMENTS_EN: List[Dict[str, str]] = [
    {'code': 'ADM', 'name': 'Administration', 'description': 'Administration and Management Department'},
    {'code': 'RH', 'name': 'Human Resources', 'description': 'Human Resources Department'},
    {'code': 'TI', 'name': 'Information Technology', 'description': 'Information Technology Department'},
    {'code': 'FIN', 'name': 'Finance', 'description': 'Finance Department'},
    {'code': 'VENDAS', 'name': 'Sales', 'description': 'Sales Department'},
    {'code': 'MARKETING', 'name': 'Marketing', 'description': 'Marketing Department'},
    {'code': 'OP', 'name': 'Operations', 'description': 'Operations Department'},
    {'code': 'QUALIDADE', 'name': 'Quality', 'description': 'Quality Department'},
    {'code': 'JURIDICO', 'name': 'Legal', 'description': 'Legal Department'},
    {'code': 'COMERCIAL', 'name': 'Commercial', 'description': 'Commercial Department'},
    {'code': 'ATENDIMENTO', 'name': 'Customer Service', 'description': 'Customer Service Department'},
    {'code': 'LOGISTICA', 'name': 'Logistics', 'description': 'Logistics Department'},
    {'code': 'PRODUCAO', 'name': 'Production', 'description': 'Production Department'},
    {'code': 'ENGENHARIA', 'name': 'Engineering', 'description': 'Engineering Department'},
    {'code': 'PESQUISA', 'name': 'Research & Development', 'description': 'Research & Development Department'},
    {'code': 'COMPRAS', 'name': 'Procurement', 'description': 'Procurement Department'},
    {'code': 'SEGURANCA', 'name': 'Occupational Safety', 'description': 'Occupational Safety Department'},
    {'code': 'MEIO_AMBIENTE', 'name': 'Environment', 'description': 'Environment Department'},
]

DEPARTMENTS_ES: List[Dict[str, str]] = [
    {'code': 'ADM', 'name': 'Administración', 'description': 'Departamento de Administración y Gestión'},
    {'code': 'RH', 'name': 'Recursos Humanos', 'description': 'Departamento de Recursos Humanos'},
    {'code': 'TI', 'name': 'Tecnología de la Información', 'description': 'Departamento de Tecnología de la Información'},
    {'code': 'FIN', 'name': 'Finanzas', 'description': 'Departamento Financiero'},
    {'code': 'VENDAS', 'name': 'Ventas', 'description': 'Departamento de Ventas'},
    {'code': 'MARKETING', 'name': 'Marketing', 'description': 'Departamento de Marketing'},
    {'code': 'OP', 'name': 'Operaciones', 'description': 'Departamento de Operaciones'},
    {'code': 'QUALIDADE', 'name': 'Calidad', 'description': 'Departamento de Calidad'},
    {'code': 'JURIDICO', 'name': 'Jurídico', 'description': 'Departamento Jurídico'},
    {'code': 'COMERCIAL', 'name': 'Comercial', 'description': 'Departamento Comercial'},
    {'code': 'ATENDIMENTO', 'name': 'Atención al Cliente', 'description': 'Departamento de Atención al Cliente'},
    {'code': 'LOGISTICA', 'name': 'Logística', 'description': 'Departamento de Logística'},
    {'code': 'PRODUCAO', 'name': 'Producción', 'description': 'Departamento de Producción'},
    {'code': 'ENGENHARIA', 'name': 'Ingeniería', 'description': 'Departamento de Ingeniería'},
    {'code': 'PESQUISA', 'name': 'Investigación y Desarrollo', 'description': 'Departamento de Investigación y Desarrollo'},
    {'code': 'COMPRAS', 'name': 'Compras', 'description': 'Departamento de Compras'},
    {'code': 'SEGURANCA', 'name': 'Seguridad Laboral', 'description': 'Departamento de Seguridad Laboral'},
    {'code': 'MEIO_AMBIENTE', 'name': 'Medio Ambiente', 'description': 'Departamento de Medio Ambiente'},
]

# ============================================================================
# JOB POSITIONS - Estrutura de cargos (mesmo código, nomes variam por idioma)
# ============================================================================

JOB_POSITIONS_STRUCTURE: List[Dict[str, str]] = [
    # Administração
    {'code': 'ADM-CEO', 'department': 'ADM', 'level': 'c_level'},
    {'code': 'ADM-DIR', 'department': 'ADM', 'level': 'director'},
    {'code': 'ADM-GER', 'department': 'ADM', 'level': 'manager'},
    {'code': 'ADM-ANAL', 'department': 'ADM', 'level': 'pleno'},
    {'code': 'ADM-ASS', 'department': 'ADM', 'level': 'junior'},
    {'code': 'ADM-RECEP', 'department': 'ADM', 'level': 'junior'},
    
    # Recursos Humanos
    {'code': 'RH-CHRO', 'department': 'RH', 'level': 'c_level'},
    {'code': 'RH-DIR', 'department': 'RH', 'level': 'director'},
    {'code': 'RH-GER', 'department': 'RH', 'level': 'manager'},
    {'code': 'RH-RECRUT', 'department': 'RH', 'level': 'pleno'},
    {'code': 'RH-ANAL', 'department': 'RH', 'level': 'pleno'},
    {'code': 'RH-PAYROLL', 'department': 'RH', 'level': 'pleno'},
    {'code': 'RH-ASS', 'department': 'RH', 'level': 'junior'},
    
    # Tecnologia da Informação
    {'code': 'TI-CTO', 'department': 'TI', 'level': 'c_level'},
    {'code': 'TI-DIR', 'department': 'TI', 'level': 'director'},
    {'code': 'TI-GER', 'department': 'TI', 'level': 'manager'},
    {'code': 'TI-LEAD', 'department': 'TI', 'level': 'lead'},
    {'code': 'TI-DEV-SEN', 'department': 'TI', 'level': 'senior'},
    {'code': 'TI-DEV-PLEN', 'department': 'TI', 'level': 'pleno'},
    {'code': 'TI-DEV-JR', 'department': 'TI', 'level': 'junior'},
    {'code': 'TI-DEV-EST', 'department': 'TI', 'level': 'intern'},
    {'code': 'TI-INFRA', 'department': 'TI', 'level': 'pleno'},
    {'code': 'TI-SUPPORT', 'department': 'TI', 'level': 'junior'},
    {'code': 'TI-DBA', 'department': 'TI', 'level': 'senior'},
    {'code': 'TI-DEVOPS', 'department': 'TI', 'level': 'senior'},
    {'code': 'TI-SECURITY', 'department': 'TI', 'level': 'senior'},
    {'code': 'TI-QA', 'department': 'TI', 'level': 'pleno'},
    {'code': 'TI-ARCHITECT', 'department': 'TI', 'level': 'senior'},
    
    # Financeiro
    {'code': 'FIN-CFO', 'department': 'FIN', 'level': 'c_level'},
    {'code': 'FIN-DIR', 'department': 'FIN', 'level': 'director'},
    {'code': 'FIN-GER', 'department': 'FIN', 'level': 'manager'},
    {'code': 'FIN-CONT', 'department': 'FIN', 'level': 'pleno'},
    {'code': 'FIN-ANAL', 'department': 'FIN', 'level': 'pleno'},
    {'code': 'FIN-AUDITOR', 'department': 'FIN', 'level': 'senior'},
    {'code': 'FIN-ASS', 'department': 'FIN', 'level': 'junior'},
    
    # Vendas
    {'code': 'VENDAS-CSO', 'department': 'VENDAS', 'level': 'c_level'},
    {'code': 'VENDAS-DIR', 'department': 'VENDAS', 'level': 'director'},
    {'code': 'VENDAS-GER', 'department': 'VENDAS', 'level': 'manager'},
    {'code': 'VENDAS-REP', 'department': 'VENDAS', 'level': 'pleno'},
    {'code': 'VENDAS-ASS', 'department': 'VENDAS', 'level': 'junior'},
    {'code': 'VENDAS-INTERN', 'department': 'VENDAS', 'level': 'intern'},
    
    # Marketing
    {'code': 'MARKETING-CMO', 'department': 'MARKETING', 'level': 'c_level'},
    {'code': 'MARKETING-DIR', 'department': 'MARKETING', 'level': 'director'},
    {'code': 'MARKETING-GER', 'department': 'MARKETING', 'level': 'manager'},
    {'code': 'MARKETING-ANAL', 'department': 'MARKETING', 'level': 'pleno'},
    {'code': 'MARKETING-DIGITAL', 'department': 'MARKETING', 'level': 'pleno'},
    {'code': 'MARKETING-CONTENT', 'department': 'MARKETING', 'level': 'pleno'},
    {'code': 'MARKETING-ASS', 'department': 'MARKETING', 'level': 'junior'},
    
    # Operações
    {'code': 'OP-COO', 'department': 'OP', 'level': 'c_level'},
    {'code': 'OP-DIR', 'department': 'OP', 'level': 'director'},
    {'code': 'OP-GER', 'department': 'OP', 'level': 'manager'},
    {'code': 'OP-SUP', 'department': 'OP', 'level': 'lead'},
    {'code': 'OP-ANAL', 'department': 'OP', 'level': 'pleno'},
    {'code': 'OP-OP', 'department': 'OP', 'level': 'junior'},
    
    # Qualidade
    {'code': 'QUALIDADE-GER', 'department': 'QUALIDADE', 'level': 'manager'},
    {'code': 'QUALIDADE-ANAL', 'department': 'QUALIDADE', 'level': 'pleno'},
    {'code': 'QUALIDADE-AUDITOR', 'department': 'QUALIDADE', 'level': 'senior'},
    {'code': 'QUALIDADE-INSP', 'department': 'QUALIDADE', 'level': 'junior'},
    
    # Jurídico
    {'code': 'JURIDICO-DIR', 'department': 'JURIDICO', 'level': 'director'},
    {'code': 'JURIDICO-ADV', 'department': 'JURIDICO', 'level': 'senior'},
    {'code': 'JURIDICO-ASS', 'department': 'JURIDICO', 'level': 'junior'},
    
    # Comercial
    {'code': 'COMERCIAL-DIR', 'department': 'COMERCIAL', 'level': 'director'},
    {'code': 'COMERCIAL-GER', 'department': 'COMERCIAL', 'level': 'manager'},
    {'code': 'COMERCIAL-ANAL', 'department': 'COMERCIAL', 'level': 'pleno'},
    
    # Atendimento ao Cliente
    {'code': 'ATENDIMENTO-GER', 'department': 'ATENDIMENTO', 'level': 'manager'},
    {'code': 'ATENDIMENTO-SUP', 'department': 'ATENDIMENTO', 'level': 'lead'},
    {'code': 'ATENDIMENTO-ATD', 'department': 'ATENDIMENTO', 'level': 'junior'},
    
    # Logística
    {'code': 'LOGISTICA-GER', 'department': 'LOGISTICA', 'level': 'manager'},
    {'code': 'LOGISTICA-ANAL', 'department': 'LOGISTICA', 'level': 'pleno'},
    {'code': 'LOGISTICA-OP', 'department': 'LOGISTICA', 'level': 'junior'},
    
    # Produção
    {'code': 'PRODUCAO-GER', 'department': 'PRODUCAO', 'level': 'manager'},
    {'code': 'PRODUCAO-SUP', 'department': 'PRODUCAO', 'level': 'lead'},
    {'code': 'PRODUCAO-OP', 'department': 'PRODUCAO', 'level': 'junior'},
    
    # Engenharia
    {'code': 'ENGENHARIA-DIR', 'department': 'ENGENHARIA', 'level': 'director'},
    {'code': 'ENGENHARIA-GER', 'department': 'ENGENHARIA', 'level': 'manager'},
    {'code': 'ENGENHARIA-ENG', 'department': 'ENGENHARIA', 'level': 'senior'},
    {'code': 'ENGENHARIA-ANAL', 'department': 'ENGENHARIA', 'level': 'pleno'},
]

# Nomes dos cargos por idioma
JOB_NAMES_PT: Dict[str, str] = {
    'ADM-CEO': 'CEO - Chief Executive Officer',
    'ADM-DIR': 'Diretor Administrativo',
    'ADM-GER': 'Gerente Administrativo',
    'ADM-ANAL': 'Analista Administrativo',
    'ADM-ASS': 'Assistente Administrativo',
    'ADM-RECEP': 'Recepcionista',
    'RH-CHRO': 'CHRO - Chief Human Resources Officer',
    'RH-DIR': 'Diretor de RH',
    'RH-GER': 'Gerente de RH',
    'RH-RECRUT': 'Recrutador',
    'RH-ANAL': 'Analista de RH',
    'RH-PAYROLL': 'Analista de Folha de Pagamento',
    'RH-ASS': 'Assistente de RH',
    'TI-CTO': 'CTO - Chief Technology Officer',
    'TI-DIR': 'Diretor de TI',
    'TI-GER': 'Gerente de TI',
    'TI-LEAD': 'Tech Lead',
    'TI-DEV-SEN': 'Desenvolvedor Sênior',
    'TI-DEV-PLEN': 'Desenvolvedor Pleno',
    'TI-DEV-JR': 'Desenvolvedor Júnior',
    'TI-DEV-EST': 'Desenvolvedor Estagiário',
    'TI-INFRA': 'Analista de Infraestrutura',
    'TI-SUPPORT': 'Suporte Técnico',
    'TI-DBA': 'DBA - Database Administrator',
    'TI-DEVOPS': 'DevOps Engineer',
    'TI-SECURITY': 'Especialista em Segurança',
    'TI-QA': 'Analista de Qualidade de Software',
    'TI-ARCHITECT': 'Arquiteto de Software',
    'FIN-CFO': 'CFO - Chief Financial Officer',
    'FIN-DIR': 'Diretor Financeiro',
    'FIN-GER': 'Gerente Financeiro',
    'FIN-CONT': 'Contador',
    'FIN-ANAL': 'Analista Financeiro',
    'FIN-AUDITOR': 'Auditor',
    'FIN-ASS': 'Assistente Financeiro',
    'VENDAS-CSO': 'CSO - Chief Sales Officer',
    'VENDAS-DIR': 'Diretor de Vendas',
    'VENDAS-GER': 'Gerente de Vendas',
    'VENDAS-REP': 'Representante de Vendas',
    'VENDAS-ASS': 'Assistente de Vendas',
    'VENDAS-INTERN': 'Estagiário de Vendas',
    'MARKETING-CMO': 'CMO - Chief Marketing Officer',
    'MARKETING-DIR': 'Diretor de Marketing',
    'MARKETING-GER': 'Gerente de Marketing',
    'MARKETING-ANAL': 'Analista de Marketing',
    'MARKETING-DIGITAL': 'Especialista em Marketing Digital',
    'MARKETING-CONTENT': 'Especialista em Conteúdo',
    'MARKETING-ASS': 'Assistente de Marketing',
    'OP-COO': 'COO - Chief Operating Officer',
    'OP-DIR': 'Diretor de Operações',
    'OP-GER': 'Gerente de Operações',
    'OP-SUP': 'Supervisor de Operações',
    'OP-ANAL': 'Analista de Operações',
    'OP-OP': 'Operador',
    'QUALIDADE-GER': 'Gerente de Qualidade',
    'QUALIDADE-ANAL': 'Analista de Qualidade',
    'QUALIDADE-AUDITOR': 'Auditor de Qualidade',
    'QUALIDADE-INSP': 'Inspetor de Qualidade',
    'JURIDICO-DIR': 'Diretor Jurídico',
    'JURIDICO-ADV': 'Advogado',
    'JURIDICO-ASS': 'Assistente Jurídico',
    'COMERCIAL-DIR': 'Diretor Comercial',
    'COMERCIAL-GER': 'Gerente Comercial',
    'COMERCIAL-ANAL': 'Analista Comercial',
    'ATENDIMENTO-GER': 'Gerente de Atendimento',
    'ATENDIMENTO-SUP': 'Supervisor de Atendimento',
    'ATENDIMENTO-ATD': 'Atendente',
    'LOGISTICA-GER': 'Gerente de Logística',
    'LOGISTICA-ANAL': 'Analista de Logística',
    'LOGISTICA-OP': 'Operador de Logística',
    'PRODUCAO-GER': 'Gerente de Produção',
    'PRODUCAO-SUP': 'Supervisor de Produção',
    'PRODUCAO-OP': 'Operador de Produção',
    'ENGENHARIA-DIR': 'Diretor de Engenharia',
    'ENGENHARIA-GER': 'Gerente de Engenharia',
    'ENGENHARIA-ENG': 'Engenheiro',
    'ENGENHARIA-ANAL': 'Analista de Engenharia',
}

JOB_NAMES_EN: Dict[str, str] = {
    'ADM-CEO': 'CEO - Chief Executive Officer',
    'ADM-DIR': 'Administrative Director',
    'ADM-GER': 'Administrative Manager',
    'ADM-ANAL': 'Administrative Analyst',
    'ADM-ASS': 'Administrative Assistant',
    'ADM-RECEP': 'Receptionist',
    'RH-CHRO': 'CHRO - Chief Human Resources Officer',
    'RH-DIR': 'HR Director',
    'RH-GER': 'HR Manager',
    'RH-RECRUT': 'Recruiter',
    'RH-ANAL': 'HR Analyst',
    'RH-PAYROLL': 'Payroll Analyst',
    'RH-ASS': 'HR Assistant',
    'TI-CTO': 'CTO - Chief Technology Officer',
    'TI-DIR': 'IT Director',
    'TI-GER': 'IT Manager',
    'TI-LEAD': 'Tech Lead',
    'TI-DEV-SEN': 'Senior Developer',
    'TI-DEV-PLEN': 'Mid-Level Developer',
    'TI-DEV-JR': 'Junior Developer',
    'TI-DEV-EST': 'Developer Intern',
    'TI-INFRA': 'Infrastructure Analyst',
    'TI-SUPPORT': 'Technical Support',
    'TI-DBA': 'DBA - Database Administrator',
    'TI-DEVOPS': 'DevOps Engineer',
    'TI-SECURITY': 'Security Specialist',
    'TI-QA': 'QA Analyst',
    'TI-ARCHITECT': 'Software Architect',
    'FIN-CFO': 'CFO - Chief Financial Officer',
    'FIN-DIR': 'Finance Director',
    'FIN-GER': 'Finance Manager',
    'FIN-CONT': 'Accountant',
    'FIN-ANAL': 'Financial Analyst',
    'FIN-AUDITOR': 'Auditor',
    'FIN-ASS': 'Finance Assistant',
    'VENDAS-CSO': 'CSO - Chief Sales Officer',
    'VENDAS-DIR': 'Sales Director',
    'VENDAS-GER': 'Sales Manager',
    'VENDAS-REP': 'Sales Representative',
    'VENDAS-ASS': 'Sales Assistant',
    'VENDAS-INTERN': 'Sales Intern',
    'MARKETING-CMO': 'CMO - Chief Marketing Officer',
    'MARKETING-DIR': 'Marketing Director',
    'MARKETING-GER': 'Marketing Manager',
    'MARKETING-ANAL': 'Marketing Analyst',
    'MARKETING-DIGITAL': 'Digital Marketing Specialist',
    'MARKETING-CONTENT': 'Content Specialist',
    'MARKETING-ASS': 'Marketing Assistant',
    'OP-COO': 'COO - Chief Operating Officer',
    'OP-DIR': 'Operations Director',
    'OP-GER': 'Operations Manager',
    'OP-SUP': 'Operations Supervisor',
    'OP-ANAL': 'Operations Analyst',
    'OP-OP': 'Operator',
    'QUALIDADE-GER': 'Quality Manager',
    'QUALIDADE-ANAL': 'Quality Analyst',
    'QUALIDADE-AUDITOR': 'Quality Auditor',
    'QUALIDADE-INSP': 'Quality Inspector',
    'JURIDICO-DIR': 'Legal Director',
    'JURIDICO-ADV': 'Attorney',
    'JURIDICO-ASS': 'Legal Assistant',
    'COMERCIAL-DIR': 'Commercial Director',
    'COMERCIAL-GER': 'Commercial Manager',
    'COMERCIAL-ANAL': 'Commercial Analyst',
    'ATENDIMENTO-GER': 'Customer Service Manager',
    'ATENDIMENTO-SUP': 'Customer Service Supervisor',
    'ATENDIMENTO-ATD': 'Customer Service Representative',
    'LOGISTICA-GER': 'Logistics Manager',
    'LOGISTICA-ANAL': 'Logistics Analyst',
    'LOGISTICA-OP': 'Logistics Operator',
    'PRODUCAO-GER': 'Production Manager',
    'PRODUCAO-SUP': 'Production Supervisor',
    'PRODUCAO-OP': 'Production Operator',
    'ENGENHARIA-DIR': 'Engineering Director',
    'ENGENHARIA-GER': 'Engineering Manager',
    'ENGENHARIA-ENG': 'Engineer',
    'ENGENHARIA-ANAL': 'Engineering Analyst',
}

JOB_NAMES_ES: Dict[str, str] = {
    'ADM-CEO': 'CEO - Director Ejecutivo',
    'ADM-DIR': 'Director Administrativo',
    'ADM-GER': 'Gerente Administrativo',
    'ADM-ANAL': 'Analista Administrativo',
    'ADM-ASS': 'Asistente Administrativo',
    'ADM-RECEP': 'Recepcionista',
    'RH-CHRO': 'CHRO - Director de Recursos Humanos',
    'RH-DIR': 'Director de RRHH',
    'RH-GER': 'Gerente de RRHH',
    'RH-RECRUT': 'Reclutador',
    'RH-ANAL': 'Analista de RRHH',
    'RH-PAYROLL': 'Analista de Nómina',
    'RH-ASS': 'Asistente de RRHH',
    'TI-CTO': 'CTO - Director de Tecnología',
    'TI-DIR': 'Director de TI',
    'TI-GER': 'Gerente de TI',
    'TI-LEAD': 'Tech Lead',
    'TI-DEV-SEN': 'Desarrollador Senior',
    'TI-DEV-PLEN': 'Desarrollador Semi-Senior',
    'TI-DEV-JR': 'Desarrollador Junior',
    'TI-DEV-EST': 'Desarrollador Pasante',
    'TI-INFRA': 'Analista de Infraestructura',
    'TI-SUPPORT': 'Soporte Técnico',
    'TI-DBA': 'DBA - Administrador de Base de Datos',
    'TI-DEVOPS': 'Ingeniero DevOps',
    'TI-SECURITY': 'Especialista en Seguridad',
    'TI-QA': 'Analista de Calidad de Software',
    'TI-ARCHITECT': 'Arquitecto de Software',
    'FIN-CFO': 'CFO - Director Financiero',
    'FIN-DIR': 'Director Financiero',
    'FIN-GER': 'Gerente Financiero',
    'FIN-CONT': 'Contador',
    'FIN-ANAL': 'Analista Financiero',
    'FIN-AUDITOR': 'Auditor',
    'FIN-ASS': 'Asistente Financiero',
    'VENDAS-CSO': 'CSO - Director de Ventas',
    'VENDAS-DIR': 'Director de Ventas',
    'VENDAS-GER': 'Gerente de Ventas',
    'VENDAS-REP': 'Representante de Ventas',
    'VENDAS-ASS': 'Asistente de Ventas',
    'VENDAS-INTERN': 'Pasante de Ventas',
    'MARKETING-CMO': 'CMO - Director de Marketing',
    'MARKETING-DIR': 'Director de Marketing',
    'MARKETING-GER': 'Gerente de Marketing',
    'MARKETING-ANAL': 'Analista de Marketing',
    'MARKETING-DIGITAL': 'Especialista en Marketing Digital',
    'MARKETING-CONTENT': 'Especialista en Contenido',
    'MARKETING-ASS': 'Asistente de Marketing',
    'OP-COO': 'COO - Director de Operaciones',
    'OP-DIR': 'Director de Operaciones',
    'OP-GER': 'Gerente de Operaciones',
    'OP-SUP': 'Supervisor de Operaciones',
    'OP-ANAL': 'Analista de Operaciones',
    'OP-OP': 'Operador',
    'QUALIDADE-GER': 'Gerente de Calidad',
    'QUALIDADE-ANAL': 'Analista de Calidad',
    'QUALIDADE-AUDITOR': 'Auditor de Calidad',
    'QUALIDADE-INSP': 'Inspector de Calidad',
    'JURIDICO-DIR': 'Director Jurídico',
    'JURIDICO-ADV': 'Abogado',
    'JURIDICO-ASS': 'Asistente Jurídico',
    'COMERCIAL-DIR': 'Director Comercial',
    'COMERCIAL-GER': 'Gerente Comercial',
    'COMERCIAL-ANAL': 'Analista Comercial',
    'ATENDIMENTO-GER': 'Gerente de Atención al Cliente',
    'ATENDIMENTO-SUP': 'Supervisor de Atención al Cliente',
    'ATENDIMENTO-ATD': 'Representante de Atención al Cliente',
    'LOGISTICA-GER': 'Gerente de Logística',
    'LOGISTICA-ANAL': 'Analista de Logística',
    'LOGISTICA-OP': 'Operador de Logística',
    'PRODUCAO-GER': 'Gerente de Producción',
    'PRODUCAO-SUP': 'Supervisor de Producción',
    'PRODUCAO-OP': 'Operador de Producción',
    'ENGENHARIA-DIR': 'Director de Ingeniería',
    'ENGENHARIA-GER': 'Gerente de Ingeniería',
    'ENGENHARIA-ENG': 'Ingeniero',
    'ENGENHARIA-ANAL': 'Analista de Ingeniería',
}

# ============================================================================
# BENEFITS - Benefícios padrão
# ============================================================================

BENEFITS_PT: List[Dict[str, Any]] = [
    {'name': 'Vale Alimentação', 'type': 'meal_voucher', 'desc': 'Vale alimentação para refeições', 'value_br': 500.00},
    {'name': 'Vale Refeição', 'type': 'food_voucher', 'desc': 'Vale refeição', 'value_br': 600.00},
    {'name': 'Vale Transporte', 'type': 'transportation', 'desc': 'Vale transporte', 'value_br': 300.00},
    {'name': 'Plano de Saúde', 'type': 'health_insurance', 'desc': 'Plano de saúde empresarial', 'value_br': None},
    {'name': 'Plano Odontológico', 'type': 'dental_insurance', 'desc': 'Plano odontológico', 'value_br': None},
    {'name': 'Seguro de Vida', 'type': 'life_insurance', 'desc': 'Seguro de vida em grupo', 'value_br': None},
    {'name': 'Auxílio Creche', 'type': 'daycare', 'desc': 'Auxílio creche para funcionários com filhos', 'value_br': 400.00},
    {'name': 'Gympass', 'type': 'gympass', 'desc': 'Acesso a academias através do Gympass', 'value_br': None},
    {'name': 'Auxílio Home Office', 'type': 'other', 'desc': 'Auxílio para despesas de home office', 'value_br': None},
    {'name': 'Participação nos Lucros', 'type': 'other', 'desc': 'Participação nos lucros da empresa', 'value_br': None},
]

BENEFITS_EN: List[Dict[str, Any]] = [
    {'name': 'Meal Voucher', 'type': 'meal_voucher', 'desc': 'Meal voucher for meals', 'value_us': 250.00},
    {'name': 'Food Voucher', 'type': 'food_voucher', 'desc': 'Food voucher', 'value_us': 300.00},
    {'name': 'Transportation', 'type': 'transportation', 'desc': 'Transportation allowance', 'value_us': 150.00},
    {'name': 'Health Insurance', 'type': 'health_insurance', 'desc': 'Company health insurance', 'value_us': None},
    {'name': 'Dental Insurance', 'type': 'dental_insurance', 'desc': 'Dental insurance plan', 'value_us': None},
    {'name': 'Life Insurance', 'type': 'life_insurance', 'desc': 'Group life insurance', 'value_us': None},
    {'name': 'Daycare Allowance', 'type': 'daycare', 'desc': 'Daycare allowance for employees with children', 'value_us': 500.00},
    {'name': 'Gympass', 'type': 'gympass', 'desc': 'Gym access through Gympass', 'value_us': None},
    {'name': 'Home Office Allowance', 'type': 'other', 'desc': 'Allowance for home office expenses', 'value_us': None},
    {'name': 'Profit Sharing', 'type': 'other', 'desc': 'Company profit sharing', 'value_us': None},
]

BENEFITS_ES: List[Dict[str, Any]] = [
    {'name': 'Vale de Comida', 'type': 'meal_voucher', 'desc': 'Vale de comida para comidas', 'value_es': 200.00},
    {'name': 'Vale de Alimentación', 'type': 'food_voucher', 'desc': 'Vale de alimentación', 'value_es': 250.00},
    {'name': 'Transporte', 'type': 'transportation', 'desc': 'Subsidio de transporte', 'value_es': 100.00},
    {'name': 'Seguro de Salud', 'type': 'health_insurance', 'desc': 'Seguro de salud empresarial', 'value_es': None},
    {'name': 'Seguro Dental', 'type': 'dental_insurance', 'desc': 'Plan de seguro dental', 'value_es': None},
    {'name': 'Seguro de Vida', 'type': 'life_insurance', 'desc': 'Seguro de vida grupal', 'value_es': None},
    {'name': 'Auxilio Guardería', 'type': 'daycare', 'desc': 'Auxilio guardería para empleados con hijos', 'value_es': 300.00},
    {'name': 'Gympass', 'type': 'gympass', 'desc': 'Acceso a gimnasios a través de Gympass', 'value_es': None},
    {'name': 'Auxilio Home Office', 'type': 'other', 'desc': 'Auxilio para gastos de home office', 'value_es': None},
    {'name': 'Participación en Utilidades', 'type': 'other', 'desc': 'Participación en utilidades de la empresa', 'value_es': None},
]

# ============================================================================
# Helper Functions
# ============================================================================

def get_departments(lang: str = 'pt') -> List[Dict[str, str]]:
    """Get departments by language"""
    if lang == 'en':
        return DEPARTMENTS_EN
    elif lang == 'es':
        return DEPARTMENTS_ES
    else:
        return DEPARTMENTS_PT


def get_job_positions(lang: str = 'pt') -> List[Dict[str, str]]:
    """Get job positions by language"""
    names_map = {
        'pt': JOB_NAMES_PT,
        'en': JOB_NAMES_EN,
        'es': JOB_NAMES_ES,
    }
    names = names_map.get(lang, JOB_NAMES_PT)
    
    return [
        {
            'code': job['code'],
            'name': names.get(job['code'], job['code']),
            'department': job['department'],
            'level': job['level'],
        }
        for job in JOB_POSITIONS_STRUCTURE
    ]


def get_benefits(lang: str = 'pt', country: str = 'BR') -> List[Dict[str, Any]]:
    """Get benefits by language and country"""
    benefits_map = {
        'pt': BENEFITS_PT,
        'en': BENEFITS_EN,
        'es': BENEFITS_ES,
    }
    benefits = benefits_map.get(lang, BENEFITS_PT)
    
    # Get value based on country
    value_key = f'value_{country.lower()}'
    
    result = []
    for benefit in benefits:
        value = benefit.get(value_key) or benefit.get('value_br') or benefit.get('value_us') or benefit.get('value_es')
        result.append({
            'name': benefit['name'],
            'benefit_type': benefit['type'],
            'description': benefit['desc'],
            'value': value,
            'limit': value,
        })
    
    return result

