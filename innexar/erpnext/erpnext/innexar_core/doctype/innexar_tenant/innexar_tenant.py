# Copyright (c) 2025, Innexar and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import today, add_months, add_years


class InnexarTenant(Document):
	def validate(self):
		"""Validações do tenant."""
		self.validate_tenant_name()
		self.validate_subscription()
		self.set_site_url()
		self.set_database_name()
	
	def validate_tenant_name(self):
		"""Valida nome do tenant (deve ser válido para URL)."""
		import re
		if not re.match(r'^[a-z0-9][a-z0-9-]*[a-z0-9]$', self.tenant_name):
			frappe.throw(_("Tenant name must contain only lowercase letters, numbers, and hyphens"))
		
		if len(self.tenant_name) < 3:
			frappe.throw(_("Tenant name must be at least 3 characters long"))
		
		if len(self.tenant_name) > 50:
			frappe.throw(_("Tenant name cannot exceed 50 characters"))
	
	def validate_subscription(self):
		"""Valida dados da assinatura."""
		if not self.subscription_plan:
			frappe.throw(_("Subscription plan is required"))
		
		# Definir datas de assinatura se não estiverem definidas
		if not self.subscription_start_date:
			self.subscription_start_date = today()
		
		if not self.subscription_end_date and self.billing_cycle:
			if self.billing_cycle == "Annual":
				self.subscription_end_date = add_years(self.subscription_start_date, 1)
			else:
				self.subscription_end_date = add_months(self.subscription_start_date, 1)
	
	def set_site_url(self):
		"""Define URL do site baseada no nome do tenant."""
		if not self.site_url:
			self.site_url = f"{self.tenant_name}.local"
	
	def set_database_name(self):
		"""Define nome do banco de dados."""
		if not self.database_name:
			self.database_name = f"tenant_{self.tenant_name}"
	
	def get_plan_limits(self):
		"""Retorna limites do plano atual."""
		if not self.subscription_plan:
			return {}
		
		plan = frappe.get_doc("Innexar Subscription Plan", self.subscription_plan)
		return plan.get_plan_limits()
	
	def check_usage_limits(self):
		"""Verifica se o tenant está dentro dos limites."""
		limits = self.get_plan_limits()
		violations = []
		
		if self.current_users > limits.get("max_users", 0):
			violations.append(f"Users: {self.current_users}/{limits.get('max_users')}")
		
		if self.current_storage_gb > limits.get("max_storage_gb", 0):
			violations.append(f"Storage: {self.current_storage_gb}GB/{limits.get('max_storage_gb')}GB")
		
		if self.current_api_calls_this_month > limits.get("max_api_calls_per_month", 0):
			violations.append(f"API Calls: {self.current_api_calls_this_month}/{limits.get('max_api_calls_per_month')}")
		
		return violations
	
	def is_subscription_active(self):
		"""Verifica se a assinatura está ativa."""
		if self.status != "Active":
			return False
		
		if self.subscription_end_date and self.subscription_end_date < today():
			return False
		
		return True
	
	def suspend_tenant(self, reason=""):
		"""Suspende o tenant."""
		self.status = "Suspended"
		if reason:
			self.notes = f"{self.notes or ''}\n[{frappe.utils.now()}] Suspended: {reason}"
		self.save()
	
	def activate_tenant(self):
		"""Ativa o tenant."""
		self.status = "Active"
		self.notes = f"{self.notes or ''}\n[{frappe.utils.now()}] Activated"
		self.save()
	
	def update_usage_stats(self, users=None, storage_gb=None, api_calls=None):
		"""Atualiza estatísticas de uso."""
		if users is not None:
			self.current_users = users
		
		if storage_gb is not None:
			self.current_storage_gb = storage_gb
		
		if api_calls is not None:
			self.current_api_calls_this_month = api_calls
		
		self.last_activity_date = frappe.utils.now()
		self.save()
		
		# Verificar limites após atualização
		violations = self.check_usage_limits()
		if violations:
			frappe.log_error(
				f"Tenant {self.tenant_name} exceeded limits: {', '.join(violations)}",
				"Tenant Limit Violation"
			)
