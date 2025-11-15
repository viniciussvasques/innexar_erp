"""
Test script for new HR models
"""
import os
import django
import sys

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django_tenants.utils import schema_context
from apps.hr.models import (
    Department, JobPosition, Employee, BankAccount, Dependent,
    Education, WorkExperience, Contract
)
from apps.users.models import User
from decimal import Decimal
from datetime import date, timedelta


def test_new_models():
    """Test new HR models"""
    print("=" * 60)
    print("Testing New HR Models")
    print("=" * 60)
    
    # Get first tenant schema
    from django_tenants.utils import get_tenant_model
    Tenant = get_tenant_model()
    tenant = Tenant.objects.first()
    
    if not tenant:
        print("❌ No tenant found. Please create a tenant first.")
        return
    
    print(f"\n📋 Testing in schema: {tenant.schema_name}")
    
    with schema_context(tenant.schema_name):
        # Test 1: Create Department
        print("\n1️⃣ Testing Department creation...")
        dept, created = Department.objects.get_or_create(
            code='IT',
            defaults={'name': 'Information Technology', 'description': 'IT Department'}
        )
        print(f"   {'✅ Created' if created else '✅ Exists'}: {dept}")
        
        # Test 2: Create JobPosition
        print("\n2️⃣ Testing JobPosition creation...")
        job_pos, created = JobPosition.objects.get_or_create(
            code='DEV-JR',
            defaults={
                'name': 'Junior Developer',
                'department': dept,
                'level': 'junior',
                'salary_min': Decimal('50000.00'),
                'salary_max': Decimal('70000.00'),
                'description': 'Junior software developer position',
                'requirements': 'Bachelor degree in Computer Science',
                'responsibilities': 'Develop and maintain software applications'
            }
        )
        print(f"   {'✅ Created' if created else '✅ Exists'}: {job_pos}")
        
        # Test 3: Get or create test user
        print("\n3️⃣ Testing User/Employee creation...")
        user, created = User.objects.get_or_create(
            email='test.employee@example.com',
            defaults={
                'first_name': 'Test',
                'last_name': 'Employee',
                'is_active': True
            }
        )
        print(f"   {'✅ Created' if created else '✅ Exists'}: {user}")
        
        # Test 4: Create Employee with new fields
        print("\n4️⃣ Testing Employee with new fields...")
        employee, created = Employee.objects.get_or_create(
            employee_number='TEST-001',
            defaults={
                'user': user,
                'job_position': job_pos,
                'job_title': 'Junior Developer',
                'department': dept,
                'hire_date': date.today(),
                'base_salary': Decimal('60000.00'),
                'gender': 'male',
                'marital_status': 'single',
                'nationality': 'Brasileiro',
                'work_shift': 'full_time',
                'weekly_hours': Decimal('40.00'),
                'probation_period_days': 90,
            }
        )
        print(f"   {'✅ Created' if created else '✅ Exists'}: {employee}")
        print(f"   - Job Position: {employee.job_position}")
        print(f"   - Gender: {employee.get_gender_display()}")
        print(f"   - Work Shift: {employee.get_work_shift_display()}")
        
        # Test 5: Create BankAccount
        print("\n5️⃣ Testing BankAccount creation...")
        bank_account, created = BankAccount.objects.get_or_create(
            employee=employee,
            account_number='12345-6',
            defaults={
                'bank_name': 'Test Bank',
                'agency': '0001',
                'account_type': 'checking',
                'is_primary': True,
                'pix_key': 'test@example.com',
                'pix_key_type': 'email'
            }
        )
        print(f"   {'✅ Created' if created else '✅ Exists'}: {bank_account}")
        
        # Test 6: Create Dependent
        print("\n6️⃣ Testing Dependent creation...")
        dependent, created = Dependent.objects.get_or_create(
            employee=employee,
            name='Test Dependent',
            defaults={
                'date_of_birth': date(2010, 1, 1),
                'relationship': 'son',
                'is_tax_dependent': True
            }
        )
        print(f"   {'✅ Created' if created else '✅ Exists'}: {dependent}")
        
        # Test 7: Create Education
        print("\n7️⃣ Testing Education creation...")
        education, created = Education.objects.get_or_create(
            employee=employee,
            institution='Test University',
            defaults={
                'level': 'bachelor',
                'course': 'Computer Science',
                'graduation_year': 2020,
                'is_completed': True
            }
        )
        print(f"   {'✅ Created' if created else '✅ Exists'}: {education}")
        
        # Test 8: Create WorkExperience
        print("\n8️⃣ Testing WorkExperience creation...")
        work_exp, created = WorkExperience.objects.get_or_create(
            employee=employee,
            company_name='Previous Company',
            defaults={
                'job_title': 'Intern',
                'start_date': date(2019, 1, 1),
                'end_date': date(2019, 12, 31),
                'is_current': False
            }
        )
        print(f"   {'✅ Created' if created else '✅ Exists'}: {work_exp}")
        
        # Test 9: Create Contract
        print("\n9️⃣ Testing Contract creation...")
        contract, created = Contract.objects.get_or_create(
            employee=employee,
            contract_type='w2_employee',
            start_date=employee.hire_date,
            defaults={
                'status': 'draft',
                'contract_data': {'test': 'data'}
            }
        )
        print(f"   {'✅ Created' if created else '✅ Exists'}: {contract}")
        print(f"   - Contract Number: {contract.contract_number}")
        print(f"   - Status: {contract.get_status_display()}")
        
        # Test 10: Verify relationships
        print("\n🔟 Testing relationships...")
        print(f"   - Employee has {employee.bank_accounts.count()} bank account(s)")
        print(f"   - Employee has {employee.dependents.count()} dependent(s)")
        print(f"   - Employee has {employee.educations.count()} education record(s)")
        print(f"   - Employee has {employee.work_experiences.count()} work experience(s)")
        print(f"   - Employee has {employee.contracts.count()} contract(s)")
        print(f"   - JobPosition has {job_pos.employees.count()} employee(s)")
        
        print("\n" + "=" * 60)
        print("✅ All tests passed!")
        print("=" * 60)


if __name__ == '__main__':
    try:
        test_new_models()
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

