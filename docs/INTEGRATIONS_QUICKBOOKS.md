# Integração QuickBooks Online

## 📋 Visão Geral

A integração com QuickBooks Online permite sincronizar dados financeiros entre o Innexar ERP e o QuickBooks, incluindo:
- **Clientes** (Customers)
- **Faturas** (Invoices)
- **Pagamentos** (Payments)
- **Itens/Produtos** (Items)
- **Funcionários** (Employees - opcional)

## 🔧 Configuração

### 1. Criar App no QuickBooks Developer

1. Acesse [QuickBooks Developer](https://developer.intuit.com/)
2. Crie uma conta ou faça login
3. Crie um novo app:
   - **App Name**: Innexar ERP
   - **Environment**: Sandbox (para testes) ou Production
   - **Scopes**: `com.intuit.quickbooks.accounting`
   - **Redirect URI**: `http://localhost:3000/settings?tab=integrations` (dev) ou sua URL de produção

4. Anote as credenciais:
   - **Client ID** (App ID)
   - **Client Secret**

### 2. Configurar Variáveis de Ambiente

Adicione ao arquivo `.env`:

```env
# QuickBooks OAuth
QUICKBOOKS_CLIENT_ID=seu_client_id_aqui
QUICKBOOKS_CLIENT_SECRET=seu_client_secret_aqui
QUICKBOOKS_REDIRECT_URI=http://localhost:3000/settings?tab=integrations
QUICKBOOKS_SANDBOX=True  # True para sandbox, False para produção
```

### 3. Configurar Redirect URI no Frontend

O QuickBooks redireciona para a URL configurada após autorização. Certifique-se de que:
- A URL está registrada no QuickBooks Developer
- A URL corresponde exatamente (incluindo protocolo, porta, etc.)

## 🚀 Como Usar

### Conectar QuickBooks

1. Acesse **Settings → Integrations**
2. Clique em **"Connect QuickBooks"**
3. Você será redirecionado para o QuickBooks para autorizar
4. Após autorizar, você será redirecionado de volta
5. A conexão será estabelecida automaticamente

### Configurar Sincronização

Após conectar, você pode configurar:

- **O que sincronizar**: Clientes, Faturas, Pagamentos, Itens, Funcionários
- **Direção**: 
  - Innexar → QuickBooks
  - QuickBooks → Innexar
  - Bidirecional (ambos os lados)
- **Sincronização Automática**: Ativar/desativar e definir intervalo

### Sincronização Manual

- Use o botão **"Sync"** na lista de integrações para sincronizar manualmente

## 📊 Estrutura de Dados

### Modelos Criados

1. **Integration**: Modelo base para todas as integrações
   - Tipo de integração
   - Status (active, inactive, error, expired)
   - Configurações (JSON)
   - Logs de sincronização

2. **QuickBooksIntegration**: Dados específicos do QuickBooks
   - OAuth tokens (access_token, refresh_token)
   - Realm ID (ID da empresa no QuickBooks)
   - Configurações de sincronização
   - Direção de sincronização

3. **IntegrationLog**: Logs de atividades
   - Tipo (sync, auth, error, webhook, manual)
   - Mensagem e detalhes
   - Status de sucesso/falha

## 🔐 Segurança

- Tokens OAuth são armazenados de forma segura no banco de dados
- Tokens são automaticamente renovados quando expiram
- Cada tenant tem suas próprias integrações isoladas (multi-tenancy)

## 🔄 Próximos Passos

### Implementação de Sincronização

A estrutura está pronta, mas as funções de sincronização ainda precisam ser implementadas:

1. **sync_customers()**: Sincronizar clientes
2. **sync_invoices()**: Sincronizar faturas
3. **sync_payments()**: Sincronizar pagamentos
4. **sync_items()**: Sincronizar produtos/serviços
5. **sync_employees()**: Sincronizar funcionários (HR)

### Melhorias Futuras

- [ ] Webhooks do QuickBooks para sincronização em tempo real
- [ ] Mapeamento de campos customizados
- [ ] Resolução de conflitos (quando dados diferem)
- [ ] Histórico de sincronizações
- [ ] Dashboard de status de sincronização
- [ ] Notificações de erros de sincronização

## 📝 API Endpoints

### Integrations
- `GET /api/v1/integrations/integrations/` - Listar integrações
- `POST /api/v1/integrations/integrations/` - Criar integração
- `GET /api/v1/integrations/integrations/{id}/` - Detalhes
- `PATCH /api/v1/integrations/integrations/{id}/` - Atualizar
- `POST /api/v1/integrations/integrations/{id}/activate/` - Ativar
- `POST /api/v1/integrations/integrations/{id}/deactivate/` - Desativar
- `POST /api/v1/integrations/integrations/{id}/sync/` - Sincronizar manualmente

### QuickBooks
- `GET /api/v1/integrations/quickbooks/oauth_url/` - Obter URL de OAuth
- `POST /api/v1/integrations/quickbooks/oauth_callback/` - Callback OAuth
- `GET /api/v1/integrations/quickbooks/` - Listar integrações QuickBooks
- `GET /api/v1/integrations/quickbooks/{id}/` - Detalhes
- `PATCH /api/v1/integrations/quickbooks/{id}/` - Atualizar configurações
- `POST /api/v1/integrations/quickbooks/{id}/refresh_token/` - Renovar token
- `GET /api/v1/integrations/quickbooks/{id}/test_connection/` - Testar conexão

### Logs
- `GET /api/v1/integrations/logs/` - Listar logs
- `GET /api/v1/integrations/logs/?integration_id={id}` - Logs de uma integração

## 🐛 Troubleshooting

### Token Expirado
- O sistema tenta renovar automaticamente
- Se falhar, use o botão "Refresh Token" na interface

### Erro de Conexão
- Verifique se as credenciais estão corretas
- Verifique se o Redirect URI está configurado corretamente
- Verifique se está usando Sandbox ou Production conforme configurado

### Sincronização Falhando
- Verifique os logs em `GET /api/v1/integrations/logs/`
- Verifique se os tokens estão válidos
- Verifique permissões no QuickBooks

