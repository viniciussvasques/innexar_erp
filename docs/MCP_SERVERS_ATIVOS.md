# 🔌 Servidores MCP Ativos - Innexar ERP

**Data de Verificação:** 2025-01-27  
**Status:** Verificação Completa

---

## 📋 Servidores MCP Detectados

Com base nas ferramentas disponíveis no sistema, os seguintes servidores MCP estão configurados:

### 1. ✅ **mcp-auto-memory** (Sistema de Memória Automática)

**Status:** ⚠️ Configurado mas não respondendo

**Ferramentas Disponíveis:**

- `mcp_mcp-auto-memory_search_memory` - Busca semântica na memória do projeto
- `mcp_mcp-auto-memory_list_metadata` - Lista metadata completa do projeto
- `mcp_mcp-auto-memory_save_memory` - Salva manualmente um texto na memória

**Funcionalidades:**

- Busca semântica de memórias
- Listagem de metadados
- Salvamento manual de memórias
- Auto-save de conversas importantes

**Observação:**

- O servidor está configurado mas retorna "Tool desconhecida: undefined"
- Pode ser necessário verificar a configuração do servidor no Cursor
- As memórias estão sendo salvas manualmente em `docs/MEMORIAS_PROJETO.md`

---

### 2. ✅ **Playwright** (Automação de Navegador)

**Status:** ✅ Ativo e Funcional

**Ferramentas Disponíveis:**

#### Navegação

- `mcp_Playwright_browser_navigate` - Navegar para uma URL
- `mcp_Playwright_browser_navigate_back` - Voltar para página anterior
- `mcp_Playwright_browser_tabs` - Gerenciar abas (list, new, close, select)

#### Interação

- `mcp_Playwright_browser_click` - Clicar em elementos
- `mcp_Playwright_browser_type` - Digitar texto
- `mcp_Playwright_browser_press_key` - Pressionar teclas
- `mcp_Playwright_browser_hover` - Passar mouse sobre elemento
- `mcp_Playwright_browser_drag` - Arrastar e soltar
- `mcp_Playwright_browser_select_option` - Selecionar opção em dropdown

#### Formulários

- `mcp_Playwright_browser_fill_form` - Preencher múltiplos campos de formulário
- `mcp_Playwright_browser_file_upload` - Upload de arquivos

#### Captura e Análise

- `mcp_Playwright_browser_snapshot` - Capturar snapshot de acessibilidade
- `mcp_Playwright_browser_take_screenshot` - Tirar screenshot
- `mcp_Playwright_browser_evaluate` - Executar JavaScript na página

#### Monitoramento

- `mcp_Playwright_browser_console_messages` - Ver mensagens do console
- `mcp_Playwright_browser_network_requests` - Ver requisições de rede

#### Utilitários

- `mcp_Playwright_browser_wait_for` - Aguardar por texto ou tempo
- `mcp_Playwright_browser_run_code` - Executar código Playwright
- `mcp_Playwright_browser_resize` - Redimensionar janela
- `mcp_Playwright_browser_close` - Fechar página
- `mcp_Playwright_browser_handle_dialog` - Lidar com diálogos
- `mcp_Playwright_browser_install` - Instalar navegador

**Funcionalidades:**

- Automação de testes de interface
- Captura de screenshots
- Análise de acessibilidade
- Monitoramento de rede e console
- Preenchimento automático de formulários
- Navegação automatizada

**Uso Recomendado:**

- Testes E2E do frontend
- Validação de fluxos de usuário
- Captura de evidências de bugs
- Automação de tarefas repetitivas

---

## 📊 Resumo

| Servidor MCP        | Status         | Funcionalidades                      | Observações                       |
| ------------------- | -------------- | ------------------------------------ | --------------------------------- |
| **mcp-auto-memory** | ⚠️ Configurado | Memória semântica, busca, salvamento | Não está respondendo corretamente |
| **Playwright**      | ✅ Ativo       | Automação de navegador, testes E2E   | Totalmente funcional              |

---

## 🔧 Configuração

### Verificar Configuração no Cursor

Para verificar e configurar servidores MCP no Cursor:

1. Abra as configurações do Cursor
2. Procure por "MCP Servers" ou "Model Context Protocol"
3. Verifique se os servidores estão listados e ativos
4. Para `mcp-auto-memory`, verifique:
   - URL do servidor
   - Credenciais/autenticação
   - Status de conexão

### Solução de Problemas

#### mcp-auto-memory não responde:

1. Verificar se o servidor está rodando
2. Verificar configuração de URL/porta
3. Verificar logs de erro
4. Reiniciar o servidor MCP
5. Usar alternativa: salvar memórias em `docs/MEMORIAS_PROJETO.md`

#### Playwright não funciona:

1. Verificar se o navegador está instalado: `mcp_Playwright_browser_install`
2. Verificar permissões de acesso
3. Verificar se há erros no console

---

## 📝 Notas

- Os servidores MCP são configurados no Cursor IDE
- Cada servidor pode ter suas próprias configurações e requisitos
- Alguns servidores podem precisar de autenticação ou configuração adicional
- As ferramentas MCP são acessíveis através do assistente de IA do Cursor

---

**Última atualização:** 2025-01-27

