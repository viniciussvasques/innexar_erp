"""
Django management command to create or update an admin user
Usage: python manage.py create_admin_user --email john@acme.com --password Test@123 --schema acme
"""
from django.core.management.base import BaseCommand
from django_tenants.utils import schema_context
from apps.users.models import User
from apps.tenants.models import Tenant


class Command(BaseCommand):
    help = 'Create or update an admin user with specified email and password'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            required=True,
            help='Email address of the user'
        )
        parser.add_argument(
            '--password',
            type=str,
            required=True,
            help='Password for the user'
        )
        parser.add_argument(
            '--schema',
            type=str,
            required=True,
            help='Tenant schema name (e.g., acme)'
        )
        parser.add_argument(
            '--first-name',
            type=str,
            default='',
            help='First name of the user'
        )
        parser.add_argument(
            '--last-name',
            type=str,
            default='',
            help='Last name of the user'
        )

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        schema_name = options['schema']
        first_name = options['first_name']
        last_name = options['last_name']

        # Check if tenant exists
        try:
            tenant = Tenant.objects.get(schema_name=schema_name)
            self.stdout.write(
                self.style.SUCCESS(f'✓ Tenant found: {tenant.name} (schema: {schema_name})')
            )
        except Tenant.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'✗ Tenant with schema "{schema_name}" not found')
            )
            return

        # Create or update user in tenant schema
        with schema_context(schema_name):
            try:
                user = User.objects.get(email=email)
                self.stdout.write(
                    self.style.WARNING(f'⚠️  User "{email}" already exists. Updating...')
                )
                
                # Update user
                user.set_password(password)
                user.is_staff = True
                user.is_superuser = True
                user.is_active = True
                
                if first_name:
                    user.first_name = first_name
                if last_name:
                    user.last_name = last_name
                
                user.save()
                
                self.stdout.write(
                    self.style.SUCCESS(f'✅ User updated successfully!')
                )
                self.stdout.write(f'   Email: {email}')
                self.stdout.write(f'   Password: {password}')
                self.stdout.write(f'   Is Staff: {user.is_staff}')
                self.stdout.write(f'   Is Superuser: {user.is_superuser}')
                
            except User.DoesNotExist:
                # Create new user
                username = email.split('@')[0]  # Use email prefix as username
                
                # Ensure username is unique
                base_username = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}_{counter}"
                    counter += 1
                
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=first_name or 'Admin',
                    last_name=last_name or 'User',
                    is_staff=True,
                    is_superuser=True,
                    is_active=True
                )
                
                self.stdout.write(
                    self.style.SUCCESS(f'✅ User created successfully!')
                )
                self.stdout.write(f'   Username: {username}')
                self.stdout.write(f'   Email: {email}')
                self.stdout.write(f'   Password: {password}')
                self.stdout.write(f'   Is Staff: {user.is_staff}')
                self.stdout.write(f'   Is Superuser: {user.is_superuser}')
            
            # Try to assign admin role if it exists
            try:
                from apps.users.models import Role
                admin_role = Role.objects.get(code='admin')
                user.roles.add(admin_role)
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Admin role assigned to user')
                )
            except Exception as e:
                self.stdout.write(
                    self.style.WARNING(f'⚠️  Could not assign admin role: {str(e)}')
                )
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('USER CREATED/UPDATED SUCCESSFULLY'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(f'Email: {email}')
        self.stdout.write(f'Password: {password}')
        self.stdout.write(f'Schema: {schema_name}')
        self.stdout.write(self.style.SUCCESS('=' * 60))

