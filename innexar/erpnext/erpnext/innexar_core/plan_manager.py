# Copyright (c) 2025, Innexar and contributors
# For license information, please see license.txt

import frappe
from frappe.utils import today, add_months, add_years, now
from frappe import _
import subprocess
import os


class PlanManager:
	"""Gerenciador central de planos e provisionamento de tenants."""
	
	def __init__(self):
		self.base_site = frappe.local.site
	
	def create_tenant(self, tenant_data):
		"""
		Cria um novo tenant com base nos dados fornecidos.
		
		Args:
			tenant_data (dict): {
				'tenant_name': 'empresa-abc',
				'company_name': 'Empresa ABC Ltda',
				'admin_email': 'admin@empresa-abc.com',
				'admin_name': 'João Silva',
				'subscription_plan': 'Professional',
				'billing_cycle': 'Monthly'
			}
		
		Returns:
			dict: Status da criação e dados do tenant
		"""
		try:
			# 1. Validar dados de entrada
			self._validate_tenant_data(tenant_data)
			
			# 2. Verificar se o tenant já existe
			if frappe.db.exists("Innexar Tenant", tenant_data['tenant_name']):
				frappe.throw(_("Tenant {0} already exists").format(tenant_data['tenant_name']))
			
			# 3. Criar registro do tenant
			tenant_doc = self._create_tenant_record(tenant_data)
			
			# 4. Provisionar site Frappe
			site_result = self._provision_frappe_site(tenant_doc)
			
			# 5. Aplicar plano e configurações
			self._apply_subscription_plan(tenant_doc)
			
			# 6. Configurar usuário administrador
			self._setup_tenant_admin(tenant_doc)
			
			# 7. Atualizar status
			tenant_doc.status = "Active"
			tenant_doc.save()
			
			frappe.log_error(
				f"Tenant {tenant_doc.tenant_name} created successfully",
				"Tenant Creation Success"
			)
			
			return {
				"status": "success",
				"tenant_name": tenant_doc.tenant_name,
				"site_url": tenant_doc.site_url,
				"admin_email": tenant_doc.admin_email,
				"message": _("Tenant created successfully")
			}
			
		except Exception as e:
			# Rollback em caso de erro
			if 'tenant_doc' in locals():
				tenant_doc.status = "Error"
				tenant_doc.notes = f"{tenant_doc.notes or ''}\n[{now()}] Error: {str(e)}"
				tenant_doc.save()
			
			frappe.log_error(
				f"Failed to create tenant {tenant_data.get('tenant_name', 'unknown')}: {str(e)}",
				"Tenant Creation Failed"
			)
			
			return {
				"status": "error",
				"message": str(e)
			}
	
	def _validate_tenant_data(self, data):
		"""Valida dados de entrada para criação do tenant."""
		required_fields = ['tenant_name', 'company_name', 'admin_email', 'admin_name', 'subscription_plan']
		
		for field in required_fields:
			if not data.get(field):
				frappe.throw(_("Field {0} is required").format(field))
		
		# Validar formato do email
		frappe.utils.validate_email_address(data['admin_email'])
		
		# Validar se o plano existe
		if not frappe.db.exists("Innexar Subscription Plan", data['subscription_plan']):
			frappe.throw(_("Subscription plan {0} does not exist").format(data['subscription_plan']))
	
	def _create_tenant_record(self, data):
		"""Cria o documento Innexar Tenant."""
		tenant_doc = frappe.get_doc({
			"doctype": "Innexar Tenant",
			"tenant_name": data['tenant_name'],
			"company_name": data['company_name'],
			"admin_email": data['admin_email'],
			"admin_name": data['admin_name'],
			"subscription_plan": data['subscription_plan'],
			"billing_cycle": data.get('billing_cycle', 'Monthly'),
			"status": "Provisioning",
			"created_date": today()
		})
		
		tenant_doc.insert()
		frappe.db.commit()
		
		return tenant_doc
	
	def _provision_frappe_site(self, tenant_doc):
		"""Provisiona um novo site Frappe para o tenant."""
		site_name = tenant_doc.site_url
		db_name = tenant_doc.database_name
		
		# Comando para criar o site
		cmd = [
			"python", "-m", "frappe.utils.bench_helper",
			"frappe", "new-site", site_name,
			"--db-host=mariadb",
			"--db-root-username=root",
			"--db-root-password=root",
			"--admin-password=admin123",
			f"--db-name={db_name}",
			"--mariadb-user-host-login-scope=%",
			"--force"
		]
		
		# Executar dentro do container (simulação - em produção seria via API Docker)
		# Por enquanto, registramos o comando que seria executado
		tenant_doc.notes = f"{tenant_doc.notes or ''}\n[{now()}] Site provision command: {' '.join(cmd)}"
		
		return {"status": "success", "site_name": site_name}
	
	def _apply_subscription_plan(self, tenant_doc):
		"""Aplica configurações do plano ao tenant."""
		plan = frappe.get_doc("Innexar Subscription Plan", tenant_doc.subscription_plan)
		
		# Definir datas de assinatura
		if not tenant_doc.subscription_start_date:
			tenant_doc.subscription_start_date = today()
		
		if not tenant_doc.subscription_end_date:
			if tenant_doc.billing_cycle == "Annual":
				tenant_doc.subscription_end_date = add_years(tenant_doc.subscription_start_date, 1)
			else:
				tenant_doc.subscription_end_date = add_months(tenant_doc.subscription_start_date, 1)
		
		# Aplicar limites do plano
		limits = plan.get_plan_limits()
		tenant_doc.notes = f"{tenant_doc.notes or ''}\n[{now()}] Applied plan limits: {limits}"
		
		# TODO: Aplicar feature flags e módulos habilitados no site do tenant
		# Isso seria feito via API do site remoto ou hooks
		
		tenant_doc.save()
	
	def _setup_tenant_admin(self, tenant_doc):
		"""Configura usuário administrador do tenant."""
		# TODO: Criar usuário no site do tenant via API
		# Por enquanto, apenas registramos a intenção
		tenant_doc.notes = f"{tenant_doc.notes or ''}\n[{now()}] Admin setup: {tenant_doc.admin_email}"
		tenant_doc.save()
	
	def suspend_tenant(self, tenant_name, reason=""):
		"""Suspende um tenant."""
		tenant = frappe.get_doc("Innexar Tenant", tenant_name)
		tenant.suspend_tenant(reason)
		
		# TODO: Desativar acesso ao site do tenant
		frappe.log_error(f"Tenant {tenant_name} suspended: {reason}", "Tenant Suspended")
		
		return {"status": "success", "message": _("Tenant suspended successfully")}
	
	def activate_tenant(self, tenant_name):
		"""Ativa um tenant suspenso."""
		tenant = frappe.get_doc("Innexar Tenant", tenant_name)
		tenant.activate_tenant()
		
		# TODO: Reativar acesso ao site do tenant
		frappe.log_error(f"Tenant {tenant_name} activated", "Tenant Activated")
		
		return {"status": "success", "message": _("Tenant activated successfully")}
	
	def upgrade_tenant_plan(self, tenant_name, new_plan_name):
		"""Faz upgrade do plano de um tenant."""
		tenant = frappe.get_doc("Innexar Tenant", tenant_name)
		new_plan = frappe.get_doc("Innexar Subscription Plan", new_plan_name)
		
		# Validar se pode fazer upgrade
		if not new_plan.can_upgrade_from(tenant.subscription_plan):
			frappe.throw(_("Cannot downgrade to plan {0}").format(new_plan_name))
		
		# Atualizar plano
		old_plan = tenant.subscription_plan
		tenant.subscription_plan = new_plan_name
		tenant.notes = f"{tenant.notes or ''}\n[{now()}] Plan upgraded from {old_plan} to {new_plan_name}"
		tenant.save()
		
		# Aplicar novas configurações
		self._apply_subscription_plan(tenant)
		
		frappe.log_error(f"Tenant {tenant_name} upgraded from {old_plan} to {new_plan_name}", "Plan Upgrade")
		
		return {"status": "success", "message": _("Plan upgraded successfully")}
	
	def check_all_tenant_limits(self):
		"""Verifica limites de todos os tenants ativos."""
		tenants = frappe.get_all("Innexar Tenant", 
			filters={"status": "Active"},
			fields=["name", "tenant_name", "subscription_plan"]
		)
		
		violations = []
		
		for tenant_data in tenants:
			tenant = frappe.get_doc("Innexar Tenant", tenant_data.name)
			tenant_violations = tenant.check_usage_limits()
			
			if tenant_violations:
				violations.append({
					"tenant": tenant.tenant_name,
					"violations": tenant_violations
				})
		
		return violations
	
	def get_tenant_usage_stats(self, tenant_name):
		"""Retorna estatísticas de uso de um tenant."""
		tenant = frappe.get_doc("Innexar Tenant", tenant_name)
		limits = tenant.get_plan_limits()
		
		return {
			"tenant_name": tenant.tenant_name,
			"plan": tenant.subscription_plan,
			"status": tenant.status,
			"usage": {
				"users": f"{tenant.current_users}/{limits.get('max_users', 0)}",
				"storage": f"{tenant.current_storage_gb}GB/{limits.get('max_storage_gb', 0)}GB",
				"api_calls": f"{tenant.current_api_calls_this_month}/{limits.get('max_api_calls_per_month', 0)}"
			},
			"subscription": {
				"start_date": tenant.subscription_start_date,
				"end_date": tenant.subscription_end_date,
				"is_active": tenant.is_subscription_active()
			}
		}
	
	def get_available_plans(self):
		"""Retorna lista de planos disponíveis."""
		plans = frappe.get_all("Innexar Subscription Plan",
			filters={"is_active": 1},
			fields=["name", "plan_name", "plan_type", "monthly_price", "annual_price", "currency"],
			order_by="monthly_price asc"
		)
		
		return plans


# Funções utilitárias para APIs
@frappe.whitelist()
def create_new_tenant(tenant_data):
	"""API para criar novo tenant."""
	if isinstance(tenant_data, str):
		import json
		tenant_data = json.loads(tenant_data)
	
	manager = PlanManager()
	return manager.create_tenant(tenant_data)


@frappe.whitelist()
def get_tenant_stats(tenant_name):
	"""API para obter estatísticas de um tenant."""
	manager = PlanManager()
	return manager.get_tenant_usage_stats(tenant_name)


@frappe.whitelist()
def upgrade_plan(tenant_name, new_plan):
	"""API para fazer upgrade de plano."""
	manager = PlanManager()
	return manager.upgrade_tenant_plan(tenant_name, new_plan)


@frappe.whitelist()
def get_plans():
	"""API para listar planos disponíveis."""
	manager = PlanManager()
	return manager.get_available_plans()
