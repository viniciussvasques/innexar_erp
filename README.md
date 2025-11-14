# Innexar ERP - Multi-tenant SaaS Platform

Modern ERP system built with **Django 5.0** and **django-tenants** for true multi-tenancy.

## 📁 Project Structure

```
innexar_erp/
├── backend/          # Django backend API
├── frontend/         # Next.js frontend application
├── admin-panel/      # Next.js admin panel
└── docs/            # Documentation
```

## 🛠 Tech Stack

- **Backend**: Django 5.0 + Django REST Framework
- **Frontend**: Next.js (TypeScript)
- **Admin Panel**: Next.js (TypeScript)
- **Multi-tenancy**: django-tenants (PostgreSQL schemas)
- **Database**: PostgreSQL 16
- **Cache/Queue**: Redis 7
- **Tasks**: Celery + Beat
- **Payments**: Stripe + dj-stripe
- **Email**: Resend (via django-anymail)

## 🚀 Quick Start

```powershell
# Start services
docker-compose up -d

# Create public schema
docker-compose exec web python manage.py migrate_schemas --shared

# Create superuser
docker-compose exec web python manage.py createsuperuser

# Access: http://localhost:8000/api/docs/
```

## 🔄 CI/CD

O projeto possui CI/CD automático configurado com GitHub Actions:

- ✅ **Backend CI**: Testes Django, linting, migrations
- ✅ **Frontend CI**: Build Next.js, testes, type-check
- ✅ **Admin Panel CI**: Build Next.js, linting
- ✅ **Deploy**: Deploy automático na branch `main`

### Configuração Inicial

```powershell
# Execute o script de setup
.\setup-git.ps1

# Ou configure manualmente (veja .github/SETUP_CI.md)
```

Veja a documentação completa em [.github/SETUP_CI.md](.github/SETUP_CI.md)

## 📚 Documentação

See detailed docs in **docs/** folder.
