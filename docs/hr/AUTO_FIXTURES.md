# Carregamento Automático de Fixtures para Novos Tenants

## ✅ Implementado

Foi implementado um sistema automático que carrega os dados de HR fixtures (departamentos, cargos e benefícios) automaticamente quando um novo tenant é criado.

## 🔧 Como Funciona

### 1. Signal Automático

Quando um novo tenant é criado, um signal (`post_save`) é disparado que:

1. **Aplica as migrations** no schema do novo tenant
2. **Verifica se as tabelas existem**
3. **Carrega os fixtures** automaticamente (padrão: Brasil/Português)

### 2. Arquivos Criados/Modificados

- **`backend/apps/tenants/signals.py`** - Signal que detecta criação de novos tenants
- **`backend/apps/tenants/apps.py`** - Registra o signal quando o app é carregado
- **`backend/apps/hr/fixtures.py`** - Função helper reutilizável para carregar fixtures
- **`backend/apps/hr/management/commands/load_hr_fixtures.py`** - Comando atualizado para usar a função helper

## 🚀 Comportamento

### Para Novos Tenants

Quando você cria um novo tenant (via API, shell, ou qualquer método):

```python
from apps.tenants.models import Tenant, Domain

tenant = Tenant.objects.create(
    name="Nova Empresa",
    schema_name="novaempresa",
    plan="professional"
)

Domain.objects.create(
    domain="novaempresa.localhost",
    tenant=tenant,
    is_primary=True
)
```

**Automaticamente:**
1. ✅ Migrations são aplicadas no schema do tenant
2. ✅ 18 departamentos são criados
3. ✅ ~80 cargos/funções são criados
4. ✅ 10 benefícios são criados
5. ✅ Tudo em Português (Brasil) por padrão

### Logs

O processo é logado automaticamente:
```
INFO: Setting up HR fixtures for new tenant: Nova Empresa (schema: novaempresa)
INFO: Applying migrations for tenant: novaempresa
INFO: ✓ Migrations applied for novaempresa
INFO: ✓ Creating departments...
INFO: ✓ Created department: Administração
...
INFO: ✓ HR fixtures loaded successfully for tenant: Nova Empresa
```

## 🔄 Carregamento Manual

Se por algum motivo o carregamento automático falhar, você pode carregar manualmente:

```bash
# Para um tenant específico
docker-compose exec web python manage.py load_hr_fixtures --schema=novaempresa --country=BR

# Para todos os tenants
docker-compose exec web python manage.py load_hr_fixtures --country=BR

# Limpar e recarregar
docker-compose exec web python manage.py load_hr_fixtures --clear --schema=novaempresa --country=BR
```

## ⚙️ Personalização

### Mudar País Padrão

Para mudar o país padrão dos fixtures automáticos, edite:

`backend/apps/tenants/signals.py` - linha 71:

```python
load_hr_fixtures_for_country(
    country_code='US',  # Mude de 'BR' para 'US', 'ES', etc.
    clear=False,
    output_callback=output_callback
)
```

### Desabilitar Carregamento Automático

Se quiser desabilitar o carregamento automático, comente o signal em:

`backend/apps/tenants/apps.py`:

```python
def ready(self):
    """Import signals when app is ready"""
    # import apps.tenants.signals  # noqa  # Desabilitado
    pass
```

## 📊 Dados Carregados Automaticamente

### Por Padrão (Brasil)
- **18 Departamentos** em Português
- **~80 Cargos/Funções** em Português
- **10 Benefícios** com valores em R$

### Outros Países
Para carregar dados de outros países, use o comando manual após criar o tenant:

```bash
# Estados Unidos (Inglês)
docker-compose exec web python manage.py load_hr_fixtures --schema=novaempresa --country=US

# Espanha (Espanhol)
docker-compose exec web python manage.py load_hr_fixtures --schema=novaempresa --country=ES
```

## ⚠️ Notas Importantes

1. **Migrations**: O signal tenta aplicar migrations automaticamente, mas se falhar, você precisará executar manualmente:
   ```bash
   docker-compose exec web python manage.py migrate_schemas --schema=nome_do_tenant
   ```

2. **Erros**: Se o carregamento automático falhar, o tenant ainda será criado. Os fixtures podem ser carregados depois manualmente.

3. **Performance**: O carregamento automático adiciona alguns segundos ao processo de criação do tenant, mas garante que os dados estejam prontos imediatamente.

4. **Logs**: Todos os processos são logados. Verifique os logs do Django para acompanhar o carregamento.

## 🎯 Resumo

✅ **Novos tenants** recebem automaticamente:
- 18 departamentos
- ~80 cargos/funções  
- 10 benefícios

✅ **Funciona** para tenants criados via:
- API REST
- Django shell
- Django admin
- Scripts Python

✅ **Fallback**: Se falhar, pode ser carregado manualmente com o comando `load_hr_fixtures`

