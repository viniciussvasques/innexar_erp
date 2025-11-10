from frappe import _


def get_data():
	return [
		{
			"module_name": "Innexar Core",
			"category": "Administration",
			"label": _("Innexar Core"),
			"color": "#3498db",
			"icon": "fa fa-cloud",
			"type": "module",
			"description": _("Multi-tenant management and subscription plans")
		}
	]
