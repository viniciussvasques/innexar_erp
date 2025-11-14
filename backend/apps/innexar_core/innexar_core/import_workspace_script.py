import frappe
import json
import os

def import_workspace():
    """Import Innexar Admin workspace from JSON file"""
    
    workspace_path = os.path.join(
        frappe.get_app_path('innexar_core'),
        'innexar_erp',
        'workspace',
        'innexar_admin.json'
    )
    
    with open(workspace_path, 'r') as f:
        data = json.load(f)
    
    # Check if workspace already exists
    if frappe.db.exists('Workspace', 'Innexar Admin'):
        print("Workspace 'Innexar Admin' already exists. Deleting old version...")
        frappe.delete_doc('Workspace', 'Innexar Admin', force=1)
    
    # Create new workspace (without validation of links)
    print("Creating new Workspace 'Innexar Admin'...")
    doc = frappe.get_doc(data)
    doc.flags.ignore_links = True  # Skip link validation
    doc.insert(ignore_permissions=True)
    
    frappe.db.commit()
    print("✓ Workspace 'Innexar Admin' imported successfully!")
    print(f"  Access at: http://localhost:8080/app/innexar-admin")
    
    return doc.name

def import_page():
    """Import Tenant Dashboard page from JSON file"""
    
    page_path = os.path.join(
        frappe.get_app_path('innexar_core'),
        'innexar_erp',
        'page',
        'tenant_dashboard',
        'tenant_dashboard.json'
    )
    
    with open(page_path, 'r') as f:
        data = json.load(f)
    
    # Check if page already exists
    if frappe.db.exists('Page', 'tenant-dashboard'):
        print("Page 'tenant-dashboard' already exists. Deleting old version...")
        frappe.delete_doc('Page', 'tenant-dashboard', force=1)
    
    # Create new page
    print("Creating new Page 'tenant-dashboard'...")
    doc = frappe.get_doc(data)
    doc.insert(ignore_permissions=True)
    
    frappe.db.commit()
    print("✓ Page 'tenant-dashboard' imported successfully!")
    print(f"  Access at: http://localhost:8080/app/tenant-dashboard")
    
    return doc.name
