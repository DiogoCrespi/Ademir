---
name: Organização e Limpeza do Projeto
overview: Organizar e limpar o projeto movendo arquivos para pastas apropriadas, excluindo arquivos temporários e desnecessários, e mantendo a estrutura funcional da aplicação.
todos:
  - id: create-dirs
    content: "Criar estrutura de pastas necessárias: backend/scripts/test/, backend/test/fixtures/, docs/temp/"
    status: completed
  - id: move-docs-root
    content: Mover arquivos .md da raiz para docs/ (DEPLOY_README.md, DEPLOYMENT_SUCCESS.md, etc)
    status: completed
  - id: move-docs-backend
    content: Mover arquivos .md do backend/ para docs/ (README_REDIS.md, SCHEMAS_VERIFICATION_REPORT.md, etc)
    status: completed
  - id: move-test-scripts
    content: Mover scripts de teste do backend/ para backend/scripts/test/ (test-*.js, test-*.ps1)
    status: completed
  - id: move-test-data
    content: Mover test-patrimonio-data.json para backend/test/fixtures/
    status: completed
  - id: move-temp-hash
    content: Mover ou excluir temp-hash.js da raiz
    status: completed
  - id: delete-dist
    content: Excluir pastas dist/ (raiz e backend) - são builds gerados
    status: completed
  - id: delete-coverage
    content: Excluir pastas coverage/ (raiz e backend) - são relatórios gerados
    status: completed
  - id: delete-txt-files
    content: Excluir arquivos .txt temporários (backend-with-db.txt, schemas-verification-report.txt, etc)
    status: completed
  - id: clean-logs
    content: Limpar arquivos .log (manter estrutura de pastas)
    status: completed
  - id: check-init-db
    content: Verificar e mover/excluir backend/init-db.sql se necessário
    status: completed
  - id: verify-references
    content: Verificar se não há referências quebradas após as mudanças
    status: completed
---

# Plano de Organização e Limpeza do Projeto

## Objetivo

Organizar a estrutura do projeto movendo arquivos para pastas corretas, excluindo arquivos temporários e desnecessários, sem quebrar a aplicação.

## Estrutura de Pastas Alvo

### 1. Documentação (`docs/`)

- Mover todos os arquivos `.md` da raiz para `docs/`
- Mover arquivos `.md` duplicados ou desnecessários do `backend/` para `docs/`

### 2. Scripts (`scripts/`)

- Mover scripts de teste temporários para `backend/scripts/test/` ou `backend/test/scripts/`
- Manter scripts funcionais em `backend/scripts/` ou `scripts/` (raiz)

### 3. Arquivos Temporários e de Build

- Excluir pastas `dist/` (raiz e backend) - já estão no .gitignore
- Excluir pastas `coverage/` (raiz e backend) - já estão no .gitignore
- Excluir arquivos `.txt` temporários
- Limpar arquivos de log (manter estrutura de logs)

## Ações Detalhadas

### Fase 1: Organização de Documentação

**Mover da raiz para `docs/`:**

- `DEPLOY_README.md` → `docs/DEPLOY_README.md`
- `DEPLOYMENT_SUCCESS.md` → `docs/DEPLOYMENT_SUCCESS.md`
- `DEPLOYMENT_SUMMARY.md` → `docs/DEPLOYMENT_SUMMARY.md`
- `QUICK_COMMANDS.md` → `docs/QUICK_COMMANDS.md`

**Mover do `backend/` para `docs/`:**

- `backend/README_REDIS.md` → `docs/README_REDIS.md`
- `backend/REDIS_CONFIGURATION_SUMMARY.md` → `docs/REDIS_CONFIGURATION_SUMMARY.md`
- `backend/SCHEMAS_VERIFICATION_REPORT.md` → `docs/SCHEMAS_VERIFICATION_REPORT.md`
- `backend/README.md` → `docs/BACKEND_README.md` (renomear para evitar conflito)

**Consolidar documentação duplicada:**

- Verificar e remover duplicatas em `backend/docs/` e `docs/`

### Fase 2: Organização de Scripts e Testes

**Mover scripts de teste do `backend/` para `backend/scripts/test/`:**

- `backend/test-audit-endpoints.js` → `backend/scripts/test/test-audit-endpoints.js`
- `backend/test-patrimonio-endpoints.js` → `backend/scripts/test/test-patrimonio-endpoints.js`
- `backend/test-swagger-auth.js` → `backend/scripts/test/test-swagger-auth.js`
- `backend/test-swagger-endpoints.ps1` → `backend/scripts/test/test-swagger-endpoints.ps1`
- `backend/test-swagger-simple.ps1` → `backend/scripts/test/test-swagger-simple.ps1`

**Mover arquivo de dados de teste:**

- `backend/test-patrimonio-data.json` → `backend/test/fixtures/test-patrimonio-data.json`

**Arquivo temporário na raiz:**

- `temp-hash.js` → `backend/scripts/test/temp-hash.js` ou excluir se não for necessário

**Scripts de teste em `backend/scripts/` (manter organizados):**

- Manter scripts funcionais como estão
- Documentar scripts em `backend/scripts/README.md`

### Fase 3: Limpeza de Arquivos Temporários

**Excluir pastas de build (já no .gitignore):**

- `dist/` (raiz) - pasta de build gerada
- `backend/dist/` - pasta de build gerada
- `coverage/` (raiz) - relatórios de coverage gerados
- `backend/coverage/` - relatórios de coverage gerados

**Excluir arquivos `.txt` temporários:**

- `backend/backend-with-db.txt`
- `backend/schemas-verification-report.txt`
- `backend/packages/patrimonio-service/test-output.txt`
- `frontend/lint-errors.txt`

**Limpar logs (manter estrutura, mas arquivos vazios):**

- `logs/*.log` - podem ser limpos mas estrutura mantida
- `backend/logs/*.log` - podem ser limpos mas estrutura mantida

### Fase 4: Organização de Arquivos Específicos

**Arquivo `backend/init-db.sql`:**

- Verificar se é necessário ou se pode ser movido para `postgres-init/` ou excluído

**Pasta `uploads/`:**

- Manter estrutura atual
- Os arquivos dentro podem ser limpos mas a estrutura deve ser mantida

**Frontend:**

- Limpar `frontend/dist/` (build gerado)
- Limpar `frontend/lint-errors.txt`

### Fase 5: Verificação Final

**Manter arquivos importantes:**

- Todos os arquivos de configuração (`.json`, `.yml`, `.env.example`)
- Todos os Dockerfiles e docker-compose
- Todos os scripts funcionais
- Estrutura de pastas `src/`, `test/`, `packages/`

**Verificar dependências:**

- Verificar se nenhum script ou documentação faz referência a caminhos absolutos dos arquivos movidos
- Atualizar referências se necessário

## Arquivos que NÃO devem ser modificados

- Qualquer arquivo em `src/`
- Qualquer arquivo em `packages/*/src/`
- Arquivos de configuração: `package.json`, `tsconfig.json`, `nest-cli.json`
- Dockerfiles e docker-compose files
- Arquivos `.env.example` e `env.prod.example`
- Estrutura de testes em `test/` e `packages/*/test/`
- Scripts funcionais que são referenciados por package.json

## Ordem de Execução

1. Criar estrutura de pastas necessárias
2. Mover documentação
3. Mover scripts de teste
4. Excluir arquivos temporários e pastas de build
5. Limpar arquivos de log (opcional)
6. Verificar se não quebrou nada