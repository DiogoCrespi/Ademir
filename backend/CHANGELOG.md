# Changelog - Reestruturação do Backend

## [1.0.0] - 2025-12-16

### Adicionado
- Estrutura modular de pastas (`src/controllers`, `src/routes`, `src/services`, etc.)
- Rotas separadas por módulo (menu, cartões, estoque, eventos, bilheteria, controle)
- Documentação Swagger em `/api-docs`
- Dockerfile e docker-compose.yml para containerização
- Catálogo completo de funcionalidades em `docs/funcionalidades.md`
- Plano de migração para banco de dados em `docs/migracao-db.md`
- Serviço de imagens preparado (estrutura vazia para implementação futura)
- Utilitário `fileStorage.js` para abstração de leitura/escrita de JSON
- README.md com instruções de uso
- package.json isolado do backend

### Removido
- Dados mockados (getDefaultMenu, valores padrão hardcoded)
- Serviço de arquivos estáticos do frontend (backend isolado)
- Dependências do frontend no package.json do backend

### Modificado
- `server.js` movido para `src/server.js` e refatorado
- Todas as rotas extraídas para módulos separados
- Funções auxiliares movidas para `src/utils/fileStorage.js`
- Configurações de bilheteria não retornam mais valores padrão mockados

### Preparado para Futuro
- Estrutura de modelos em `src/models/` (README explicativo)
- Pasta `migrations/` para scripts de migração
- Serviço de imagens com TODOs para implementação
- Documentação de migração para banco de dados

### Notas
- Backend completamente isolado do frontend
- Compatibilidade mantida com frontend atual
- Todas as rotas funcionam exatamente como antes
- Swagger documenta todas as 30 rotas da API

