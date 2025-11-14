# Script de configuração inicial do Git para Innexar ERP
# Execute este script na raiz do projeto

Write-Host "🚀 Configurando Git para Innexar ERP..." -ForegroundColor Cyan

# Verificar se Git está instalado
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git não está instalado. Por favor, instale o Git primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se já é um repositório Git
if (Test-Path .git) {
    Write-Host "✅ Repositório Git já inicializado" -ForegroundColor Green
}
else {
    Write-Host "📦 Inicializando repositório Git..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Repositório inicializado" -ForegroundColor Green
}

# Verificar se há um remote configurado
$remote = git remote get-url origin 2>$null
if ($remote) {
    Write-Host "✅ Remote já configurado: $remote" -ForegroundColor Green
    Write-Host "💡 Para alterar o remote, use: git remote set-url origin <URL>" -ForegroundColor Yellow
}
else {
    Write-Host "📝 Configure o remote do GitHub:" -ForegroundColor Yellow
    Write-Host "   git remote add origin https://github.com/SEU_USUARIO/innexar_erp.git" -ForegroundColor Gray
    Write-Host "   ou" -ForegroundColor Gray
    Write-Host "   git remote add origin git@github.com:SEU_USUARIO/innexar_erp.git" -ForegroundColor Gray
}

# Verificar branch atual
$branch = git branch --show-current 2>$null
if ($branch) {
    Write-Host "✅ Branch atual: $branch" -ForegroundColor Green
}
else {
    Write-Host "📝 Criando branch main..." -ForegroundColor Yellow
    git checkout -b main
}

# Verificar se há arquivos para commit
$status = git status --porcelain
if ($status) {
    Write-Host "📝 Há arquivos não commitados. Deseja fazer commit inicial? (S/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq "S" -or $response -eq "s") {
        git add .
        git commit -m "chore: Initial commit with CI/CD setup"
        Write-Host "✅ Commit inicial criado" -ForegroundColor Green
    }
}
else {
    Write-Host "✅ Não há mudanças pendentes" -ForegroundColor Green
}

# Verificar se .gitignore existe
if (Test-Path .gitignore) {
    Write-Host "✅ .gitignore encontrado" -ForegroundColor Green
}
else {
    Write-Host "⚠️  .gitignore não encontrado. Criando..." -ForegroundColor Yellow
    @"
# Python
__pycache__/
*.py[cod]
venv/
.env

# Django
*.log
db.sqlite3
backend/staticfiles/
backend/media/
backend/celerybeat-schedule

# Node
node_modules/
.next/
out/
dist/
*.tsbuildinfo

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
"@ | Out-File -FilePath .gitignore -Encoding UTF8
    Write-Host "✅ .gitignore criado" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Configuração do Git concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Configure o remote do GitHub (se ainda não fez)" -ForegroundColor White
Write-Host "2. Adicione o token como secret no GitHub:" -ForegroundColor White
Write-Host "   https://github.com/SEU_USUARIO/innexar_erp/settings/secrets/actions" -ForegroundColor Gray
Write-Host "3. Faça push: git push -u origin main" -ForegroundColor White
Write-Host "4. Verifique os workflows em: https://github.com/SEU_USUARIO/innexar_erp/actions" -ForegroundColor White
Write-Host ""
Write-Host "📚 Veja .github/SETUP_CI.md para mais detalhes" -ForegroundColor Cyan

