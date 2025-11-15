from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class HrConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.hr'
    verbose_name = _('Human Resources')
    
    def ready(self):
        """Import signals when app is ready"""
        import apps.hr.signals  # noqa

