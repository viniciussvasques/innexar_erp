## 🟡 Em Progresso
- [ ] Detalhamento do backlog técnico (priorização Sprint 0)
- [ ] Definição de variáveis de ambiente/secrets padrão para novos tenants

## ✅ Concluído
- [x] Documento de visão geral do projeto (`DOCUMENTO_IDEA_PROJETO.md`) – 09/11/2025
- [x] Regras de desenvolvimento consolidadas (`REGRAS_DESENVOLVIMENTO.md`) – 09/11/2025
- [x] Estrutura inicial do monorepo criada (`innexar/`) – 09/11/2025
- [x] Dockerfile e stacks base por tenant (`docker/images/frappe`, `docker/compose/tenant-*`) – 09/11/2025
- [x] Container tenant1 com site `tenant1.local` provisionado + apps `erpnext` e `innexar_core` instaladas – 09/11/2025

---

## Plano de Ação Inicial (Sprint 0)

1. **Preparar repositório base**
   - Criar estrutura de pastas `innexar/frappe`, `innexar/erpnext`, `innexar/apps/innexar_core`, `innexar/images`, `innexar/sites`, `innexar/docker`. ✅
   - Adicionar arquivos README/PLACEHOLDER quando necessário para garantir versionamento. ✅
   - Configurar `.gitignore` alinhado com Frappe/ERPNext. ✅

2. **Documentar regras e padrões**
   - Consolidar regras de desenvolvimento alinhadas à documentação oficial do Frappe Framework v15 e ERPNext v15. ✅
   - Descrever convenções de código, estilos de commits, requisitos de testes e checklist de revisão dupla. ✅
   - Referenciar links oficiais para consulta rápida. ✅

3. **Preparar automação de build**
   - Especificar Dockerfiles customizados (framework/app) e dependências mínimas. ✅
   - Definir estratégia de build de assets (`yarn install && yarn build`) para `frappe`, `erpnext` e `innexar`. ✅
   - Planejar scripts para provisionamento (`frappe --site ...`) e integrações futuras. 🔜

4. **Provisionamento de tenants**
   - Estruturar diretório `docker/compose` por tenant. ✅
   - Mapear variáveis de ambiente padrão (portas, senhas, domínios locais). 🔜
   - Criar fluxo inicial de criação de sites com instalação dos apps. ✅ (tenant1.local)

5. **Implementar modelo de planos**
   - Criar DocTypes (`Innexar Subscription Plan`, `Innexar Tenant`, `Innexar Feature Flag`).
   - Implementar APIs de provisionamento e `plan_manager`.
   - Definir processos de testes automatizados para planos/módulos.

---

## Próximos Passos Imediatos
- Detalhar backlog técnico (histórias, estimativas e prioridades de Sprint 0).
- Definir variáveis de ambiente padrão e secrets necessários para provisionamento dos tenants (aproveitar `common_site_config.json` criado como base).
- Especificar o modelo inicial dos DocTypes de planos e tenants antes da implementação.
- Replicar processo de provisionamento para `tenant2.local` após validação do fluxo.

---

## Referências Rápidas
- [Frappe Framework Docs](https://frappeframework.com/docs)
- [ERPNext Developer Guide](https://docs.erpnext.com/docs/v15/manual/en/developer-guide)
- [Frappe API Reference](https://frappeframework.com/docs/user/en/api)
- [Frappe Forum](https://discuss.frappe.io/)

