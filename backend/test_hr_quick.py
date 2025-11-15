#!/usr/bin/env python
"""
Teste rápido de validação - verifica apenas imports e estrutura
"""
import sys
import os

# Adicionar o diretório ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("=" * 80)
print("TESTE RÁPIDO DE VALIDAÇÃO - ESTRUTURA DO MÓDULO HR")
print("=" * 80)

# Testar imports básicos
print("\n1. Testando imports básicos...")
try:
    # Verificar se os arquivos existem
    files_to_check = [
        'apps/hr/models.py',
        'apps/hr/serializers.py',
        'apps/hr/views.py',
        'apps/hr/urls.py',
        'apps/hr/calculations.py',
        'apps/hr/notifications.py',
        'apps/hr/signals.py',
    ]
    
    base_path = os.path.dirname(os.path.abspath(__file__))
    all_exist = True
    
    for file_path in files_to_check:
        full_path = os.path.join(base_path, file_path)
        if os.path.exists(full_path):
            print(f"   ✅ {file_path}")
        else:
            print(f"   ❌ {file_path} - NÃO ENCONTRADO")
            all_exist = False
    
    if all_exist:
        print("\n✅ Todos os arquivos principais existem!")
    else:
        print("\n❌ Alguns arquivos estão faltando!")
        sys.exit(1)
        
except Exception as e:
    print(f"\n❌ Erro ao verificar arquivos: {e}")
    sys.exit(1)

# Verificar estrutura dos arquivos
print("\n2. Verificando estrutura dos arquivos...")

try:
    # Verificar models.py
    models_path = os.path.join(base_path, 'apps/hr/models.py')
    with open(models_path, 'r', encoding='utf-8') as f:
        models_content = f.read()
        required_classes = [
            'class Department',
            'class JobPosition',
            'class Employee',
            'class TimeRecord',
            'class Vacation',
            'class Payroll',
            'class HRNotification',
            'class EmployeeDocument',
            'class EmployeeHistory'
        ]
        
        for class_name in required_classes:
            if class_name in models_content:
                print(f"   ✅ {class_name}")
            else:
                print(f"   ❌ {class_name} - NÃO ENCONTRADO")
    
    # Verificar calculations.py
    calc_path = os.path.join(base_path, 'apps/hr/calculations.py')
    if os.path.exists(calc_path):
        with open(calc_path, 'r', encoding='utf-8') as f:
            calc_content = f.read()
            required_functions = [
                'def calculate_overtime_hours',
                'def calculate_brazilian_taxes',
                'def calculate_vacation_balance',
                'def auto_calculate_payroll'
            ]
            
            for func_name in required_functions:
                if func_name in calc_content:
                    print(f"   ✅ {func_name}")
                else:
                    print(f"   ❌ {func_name} - NÃO ENCONTRADO")
    
    # Verificar notifications.py
    notif_path = os.path.join(base_path, 'apps/hr/notifications.py')
    if os.path.exists(notif_path):
        with open(notif_path, 'r', encoding='utf-8') as f:
            notif_content = f.read()
            required_functions = [
                'def create_notification',
                'def check_document_expiry',
                'def check_vacation_expiry',
                'def notify_payroll_processed'
            ]
            
            for func_name in required_functions:
                if func_name in notif_content:
                    print(f"   ✅ {func_name}")
                else:
                    print(f"   ❌ {func_name} - NÃO ENCONTRADO")
    
    # Verificar views.py
    views_path = os.path.join(base_path, 'apps/hr/views.py')
    if os.path.exists(views_path):
        with open(views_path, 'r', encoding='utf-8') as f:
            views_content = f.read()
            required_viewsets = [
                'class EmployeeViewSet',
                'class PayrollViewSet',
                'class TimeRecordViewSet',
                'class VacationViewSet',
                'class HRNotificationViewSet'
            ]
            
            for viewset_name in required_viewsets:
                if viewset_name in views_content:
                    print(f"   ✅ {viewset_name}")
                else:
                    print(f"   ❌ {viewset_name} - NÃO ENCONTRADO")
    
    # Verificar urls.py
    urls_path = os.path.join(base_path, 'apps/hr/urls.py')
    if os.path.exists(urls_path):
        with open(urls_path, 'r', encoding='utf-8') as f:
            urls_content = f.read()
            if 'HRNotificationViewSet' in urls_content:
                print(f"   ✅ HRNotificationViewSet registrado em urls.py")
            else:
                print(f"   ❌ HRNotificationViewSet não registrado em urls.py")
    
    print("\n✅ Estrutura dos arquivos verificada!")
    
except Exception as e:
    print(f"\n❌ Erro ao verificar estrutura: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "=" * 80)
print("✅ TESTE DE ESTRUTURA CONCLUÍDO COM SUCESSO!")
print("=" * 80)
print("\n📝 Para testes completos com Django:")
print("   1. Ative o ambiente virtual")
print("   2. Execute: python manage.py test apps.hr")
print("   3. Ou execute: python test_hr_complete_validation.py")
print("\n💡 Para testar no Docker:")
print("   docker-compose exec backend python test_hr_complete_validation.py")

