# Copyright (c) 2025, Innexar and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class InnexarSubscriptionPlan(Document):
	def validate(self):
		"""Validações do plano de assinatura."""
		self.validate_pricing()
		self.validate_limits()
	
	def validate_pricing(self):
		"""Valida preços e moeda."""
		if self.monthly_price and self.monthly_price < 0:
			frappe.throw(_("Monthly price cannot be negative"))
		
		if self.annual_price and self.annual_price < 0:
			frappe.throw(_("Annual price cannot be negative"))
		
		# Validar desconto anual (deve ser menor que 12x mensal)
		if self.monthly_price and self.annual_price:
			yearly_from_monthly = self.monthly_price * 12
			if self.annual_price > yearly_from_monthly:
				frappe.throw(_("Annual price should not exceed 12x monthly price"))
	
	def validate_limits(self):
		"""Valida limites do plano."""
		if self.max_users <= 0:
			frappe.throw(_("Max users must be greater than 0"))
		
		if self.max_storage_gb <= 0:
			frappe.throw(_("Max storage must be greater than 0"))
		
		if self.max_api_calls_per_month <= 0:
			frappe.throw(_("Max API calls must be greater than 0"))
	
	def get_effective_price(self, billing_cycle=None):
		"""Retorna o preço efetivo baseado no ciclo de cobrança."""
		cycle = billing_cycle or self.billing_cycle
		
		if cycle == "Annual":
			return self.annual_price or 0
		else:
			return self.monthly_price or 0
	
	def can_upgrade_from(self, other_plan_name):
		"""Verifica se pode fazer upgrade de outro plano."""
		if not other_plan_name:
			return True
		
		other_plan = frappe.get_doc("Innexar Subscription Plan", other_plan_name)
		
		# Lógica simples: pode fazer upgrade se o preço for maior
		current_price = self.get_effective_price()
		other_price = other_plan.get_effective_price()
		
		return current_price >= other_price
	
	def get_plan_limits(self):
		"""Retorna dicionário com todos os limites do plano."""
		return {
			"max_users": self.max_users,
			"max_storage_gb": self.max_storage_gb,
			"max_api_calls_per_month": self.max_api_calls_per_month,
			"features": [f.feature_name for f in self.features_included],
			"modules": [m.module_name for m in self.modules_enabled]
		}
