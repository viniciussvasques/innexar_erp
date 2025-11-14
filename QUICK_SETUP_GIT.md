# 🚀 Setup Rápido - Git e CI/CD

## Passo 1: Configurar Repositório Git

```powershell
# Execute o script de setup (recomendado)
.\setup-git.ps1

# OU configure manualmente:
git init
git add .
git commit -m "Initial commit: Setup CI/CD"
git branch -M main
```

## Passo 2: Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Nome do repositório: `innexar_erp`
3. Deixe **público** ou **privado** (sua escolha)
4. **NÃO** marque "Initialize with README" (já temos um)
5. Clique em "Create repository"

## Passo 3: Conectar Repositório Local ao GitHub

```powershell
# Substitua SEU_USUARIO pelo seu usuário do GitHub
git remote add origin https://github.com/SEU_USUARIO/innexar_erp.git

# Fazer push inicial
git push -u origin main
```

## Passo 4: Configurar Token no GitHub

### Opção A: Usar o Token Fornecido

⚠️ **IMPORTANTE**: O token deve ser adicionado como **Secret** no GitHub, não commitado no código!

### Configurar Secret:

1. Vá para: `https://github.com/SEU_USUARIO/innexar_erp/settings/secrets/actions`
2. Clique em "New repository secret"
3. Configure:
   - **Name**: `GITHUB_TOKEN`
   - **Secret**: [Cole seu token aqui - não commite o token no código!]
4. Clique em "Add secret"

### Opção B: Criar Novo Token (Recomendado)

Se preferir criar um novo token:

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token" → "Generate new token (classic)"
3. Configure:
   - **Note**: `Innexar ERP CI/CD`
   - **Expiration**: Escolha uma data
   - **Scopes**: Marque:
     - ✅ `repo` (acesso completo)
     - ✅ `workflow` (atualizar workflows)
4. Gere e copie o token
5. Adicione como secret no repositório (mesmo processo acima)

## Passo 5: Verificar CI/CD

1. Faça um pequeno commit para testar:
```powershell
echo "# CI/CD Test" >> README.md
git add README.md
git commit -m "test: Trigger CI workflow"
git push
```

2. Vá para: `https://github.com/SEU_USUARIO/innexar_erp/actions`
3. Você deve ver os workflows rodando! ✅

## ✅ O que foi configurado:

### Workflows Criados:
- ✅ **Backend CI** - Testa Django, migrations, linting
- ✅ **Frontend CI** - Build e testes do Next.js
- ✅ **Admin Panel CI** - Build do admin panel
- ✅ **CI - Full Stack** - Executa todos em paralelo
- ✅ **Deploy** - Deploy automático na branch `main`
- ✅ **Dependabot** - Atualiza dependências automaticamente

### Templates Criados:
- ✅ Pull Request Template
- ✅ Bug Report Template
- ✅ Feature Request Template

## 🔒 Segurança

⚠️ **NUNCA** commite tokens ou secrets no código!

- Tokens devem estar apenas em **GitHub Secrets**
- Arquivos `.env` estão no `.gitignore`
- Use variáveis de ambiente para secrets

## 📚 Documentação Completa

Para mais detalhes, veja:
- [.github/SETUP_CI.md](.github/SETUP_CI.md) - Guia completo de CI/CD
- [docs/](docs/) - Documentação do projeto

## 🆘 Problemas?

### Workflow não roda
- Verifique se o remote está configurado: `git remote -v`
- Verifique se fez push: `git push -u origin main`
- Veja os logs em: `Actions` → `Workflow runs`

### Erro de autenticação
- Verifique se o secret `GITHUB_TOKEN` está configurado
- Verifique se o token tem permissões `repo` e `workflow`
- Gere um novo token se necessário

### Testes falhando
- Execute os testes localmente primeiro
- Verifique os logs do workflow
- Verifique se as dependências estão instaladas

## 🎉 Pronto!

Agora você tem:
- ✅ CI/CD automático configurado
- ✅ Testes rodando em cada push
- ✅ Deploy automático na branch main
- ✅ Atualizações automáticas de dependências

Toda vez que você fizer push, os workflows vão rodar automaticamente! 🚀

