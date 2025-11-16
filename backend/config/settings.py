"""
Django settings for Innexar ERP - Multi-tenant SaaS
"""
import os
from pathlib import Path
import environ

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# Environment variables
env = environ.Env(
    DEBUG=(bool, False)
)
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env('DEBUG')

# Frontend URL (for password reset emails, etc)
FRONTEND_URL = env('FRONTEND_URL', default='http://localhost:3000')

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=[
    'localhost',
    '127.0.0.1',
    '.localhost',           # Wildcard para *.localhost (dev)
    'innexar.app',          # Domínio principal
    '.innexar.app',         # Wildcard para *.innexar.app (tenants + admin)
])

# Application definition
SHARED_APPS = [
    'django_tenants',  # Must be first
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.admin',
    
    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',  # Token blacklist for logout
    'corsheaders',
    'drf_spectacular',
    'djstripe',
    'django_celery_beat',
    'django_celery_results',
    'rosetta',              # Translation interface
    'modeltranslation',     # Model field translations,
    
    # Shared apps (available to all tenants)
    'apps.tenants',
    'apps.users',
    'apps.admin_api',  # Admin panel API
]

TENANT_APPS = [
    # Tenant-specific apps
    'django.contrib.contenttypes',
    'apps.integrations',  # Integrations app,
    'django.contrib.auth',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.admin',
    
    'apps.crm',            # CRM module
    'apps.subscriptions',
    'apps.customers',
    'apps.invoices',
    'apps.hr',             # HR (Human Resources) module
    'apps.analytics',      # Analytics & Reports module
]

INSTALLED_APPS = list(SHARED_APPS) + [
    app for app in TENANT_APPS if app not in SHARED_APPS
]

MIDDLEWARE = [
    'apps.tenants.middleware.CustomTenantMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',  # i18n
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django_tenants.postgresql_backend',
        'NAME': env('POSTGRES_DB', default='innexar_erp'),
        'USER': env('POSTGRES_USER', default='innexar'),
        'PASSWORD': env('POSTGRES_PASSWORD', default='innexar2024'),
        'HOST': env('POSTGRES_HOST', default='db'),
        'PORT': env('POSTGRES_PORT', default='5432'),
    }
}

DATABASE_ROUTERS = (
    'django_tenants.routers.TenantSyncRouter',
)

# Tenant Model
TENANT_MODEL = "tenants.Tenant"
TENANT_DOMAIN_MODEL = "tenants.Domain"

# Custom User Model
AUTH_USER_MODEL = 'users.User'

# Public schema settings
PUBLIC_SCHEMA_URLCONF = 'config.urls_public'  # innexar.app (landing page)
# TODO: Create 'config.urls_admin' for admin.innexar.app (super admin panel)

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
from django.utils.translation import gettext_lazy as _

LANGUAGE_CODE = 'en'  # Idioma padrão

LANGUAGES = [
    ('en', _('English')),
    ('pt-br', _('Português (Brasil)')),
    ('es', _('Español')),
]

LOCALE_PATHS = [
    BASE_DIR / 'locale',
]

TIME_ZONE = 'America/New_York'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
}

# JWT Settings
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}

# CORS
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[
    # Development
    'http://localhost:3000',
    'http://localhost:3001',  # Admin Panel
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    # Production
    'https://innexar.app',
    'https://admin.innexar.app',
    'https://api.innexar.app',
])

# CORS: Allow all tenant subdomains in production
CORS_ALLOWED_ORIGIN_REGEXES = [
    r'^https://.*\.innexar\.app$',  # *.innexar.app
]

CORS_ALLOW_CREDENTIALS = True

# CORS: Allow custom headers for tenant identification
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-dts-schema',  # Custom header for tenant schema identification
]

# Celery
CELERY_BROKER_URL = env('CELERY_BROKER_URL', default='redis://redis:6379/0')
CELERY_RESULT_BACKEND = env('CELERY_RESULT_BACKEND', default='redis://redis:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE

# Stripe
STRIPE_LIVE_SECRET_KEY = env('STRIPE_SECRET_KEY', default='')
STRIPE_LIVE_PUBLIC_KEY = env('STRIPE_PUBLISHABLE_KEY', default='')
STRIPE_TEST_SECRET_KEY = env('STRIPE_SECRET_KEY', default='')
STRIPE_TEST_PUBLIC_KEY = env('STRIPE_PUBLISHABLE_KEY', default='')
STRIPE_LIVE_MODE = not DEBUG
DJSTRIPE_WEBHOOK_SECRET = env('STRIPE_WEBHOOK_SECRET', default='')
DJSTRIPE_FOREIGN_KEY_TO_FIELD = 'id'

# Email
EMAIL_BACKEND = 'anymail.backends.resend.EmailBackend'
ANYMAIL = {
    'RESEND_API_KEY': env('RESEND_API_KEY', default=''),
}
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default='noreply@innexar.com')

# QuickBooks Integration
QUICKBOOKS_CLIENT_ID = env('QUICKBOOKS_CLIENT_ID', default='')
QUICKBOOKS_CLIENT_SECRET = env('QUICKBOOKS_CLIENT_SECRET', default='')
QUICKBOOKS_REDIRECT_URI = env('QUICKBOOKS_REDIRECT_URI', default='http://localhost:3000/settings?tab=integrations')
QUICKBOOKS_SANDBOX = env('QUICKBOOKS_SANDBOX', default=True)

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}
