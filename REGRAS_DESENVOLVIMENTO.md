## Regras de Desenvolvimento Innexar ERP

> Baseadas na documentação oficial do [Frappe Framework v15](https://frappeframework.com/docs) e do [ERPNext v15](https://docs.erpnext.com/docs/v15/manual/en/developer-guide)

---

### 1. Princípios Gerais
- Seguir estritamente as convenções do Frappe para nomenclatura, estrutura de arquivos e padrões de importação.
- Nenhum acesso direto a SQL: utilizar sempre a API ORM (`frappe.get_all`, `frappe.db.get_value`, etc.).
- Toda string visível ao usuário deve usar `_()` para permitir tradução.
- Utilizar `frappe.throw()` para validações e `frappe.log_error()` para erros de sistema.
- Nunca compartilhar dados entre tenants nem executar operações fora do contexto do site atual.

### 2. Estrutura de Código e Nomenclatura
- DocTypes em PascalCase com espaços (ex.: `Innexar Subscription Plan`).
- Arquivos Python e JavaScript em `snake_case`.
- Classes em PascalCase (`class InnexarSubscription(Document)`).
- Funções, métodos e campos de banco em `snake_case`.
- Organizar imports em blocos: biblioteca padrão → terceiros → frappe → erpnext → local.

### 3. Fluxo de Desenvolvimento
1. Criar/atualizar tarefa no backlog (PROJECT_CONTEXT.md).
2. Implementar funcionalidade seguindo as convenções acima.
3. **Revisar o código duas vezes:**
   - Revisão 1: lógica, sintaxe, cobertura de casos.
   - Revisão 2: segurança, limites multi-tenant, performance, traduções.
4. Executar testes relevantes (unitários e/ou integrações via `bench --site ... run-tests`).
5. Atualizar documentação (`PROJECT_CONTEXT.md`, guias técnicos).
6. Preparar commit com mensagem padrão (`feat:`, `fix:`, `docs:`, `refactor:`, etc.).

### 4. Regras Específicas para DocTypes
- Sempre gerar quatro arquivos: `.json`, `.py`, `.js`, `test_*.py`.
- Configurar permissões padrão (System Manager) e campos obrigatórios.
- Utilizar descrições, ajuda contextual e tooltips.
- Para child tables, definir `in_list_view`, `reqd` e índice de coluna conforme necessidade.
- Incluir testes unitários no arquivo `test_*.py` utilizando `frappe.get_doc` e `frappe.db.rollback()` em `tearDown`.

### 5. APIs e Serviços
- Decorar com `@frappe.whitelist()`. Usar `allow_guest=True` apenas quando for público.
- Validar todas as entradas (`frappe.utils.validate_email_address`, `cint`, `flt`, etc.).
- Retornar dicionários estruturados (`{"status": "success", ...}`).
- Enfileirar tarefas longas com `frappe.enqueue`.
- Registrar erros com contexto (`frappe.log_error(frappe.get_traceback(), "Título")`).

### 6. Interfaces (JS/Frontend)
- Utilizar `frappe.ui.form.on` para scripts de formulário.
- Usar `frappe.call` para invocar métodos whitelisted, com tratamento de erro (`if (r.exc) return;`).
- Adotar componentes Bootstrap 4 e obedecer às referências de design do Frappe.
- Preferir `frappe.show_alert` e `frappe.msgprint` para feedback ao usuário.
- Respeitar preferência de UI profissional e personalização via `innexar/public/css`.

### 7. Builds e Infraestrutura
- Executar `yarn install && yarn build` em `frappe`, `erpnext` e `innexar` após alterações de assets.
- Atualizar Dockerfiles quando dependências mudarem; manter imagens reproduzíveis.
- Reiniciar containers específicos (`docker compose restart backend`) depois de rebuilds.
- Configurar volumes para `sites/tenantX.local` garantindo persistência de dados.
- Documentar qualquer alteração em scripts de provisão (Docker Compose, helpers CLI).

### 8. Segurança e Limites
- Aplicar feature flags (`Innexar Feature Flag`) para recursos condicionais.
- Antes de executar método protegido, validar se o recurso pertence ao plano do tenant.
- Aplicar limites (`max_users`, `max_storage_gb`, `rate_limit_api`) via `System Settings` e DocTypes específicos.
- Auditar logs e erros periodicamente (Error Log e logger customizado).

### 9. Testes e Qualidade
- Testes obrigatórios para DocTypes críticos, APIs de provisionamento e `plan_manager`.
- Utilizar `bench --site <tenant> run-tests --app innexar` localmente antes de merge.
- Incluir cenários multi-tenant (troca de contexto `frappe.init(site)`).
- Documentar lacunas ou riscos quando testes automatizados não forem possíveis.

### 10. Documentação e Comunicação
- Manter `PROJECT_CONTEXT.md` atualizado ao final de cada tarefa significativa.
- Registrar decisões importantes em `DECISAO_FINAL_ERP.md` (quando disponível).
- Adicionar guias e tutoriais em `DOCUMENTACAO_COMPLETA.md` conforme features forem concluídas.
- Referenciar sempre a documentação oficial nas justificativas de decisões técnicas.

---

Seguir estas regras garante alinhamento com as melhores práticas do Frappe/ERPNext, respeitando a arquitetura multi-tenant e os objetivos do Innexar ERP. Qualquer dúvida deve ser sanada consultando primeiro a documentação oficial e registrando a decisão nas documentações internas do projeto.

