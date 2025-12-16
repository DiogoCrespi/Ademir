---
name: Limpeza backend e remoção de legado
overview: Isolar o backend em estrutura independente com Docker, catalogar todas as funcionalidades existentes, preparar migração de JSON para banco de dados, remover dados mockados, e configurar Swagger para documentação da API.
todos:
  - id: validate-stack
    content: Validar containers, health e logs de migração
    status: completed
  - id: remove-legacy-db
    content: Remover pasta C:\Nestjs\Ademir\database
    status: completed
    dependencies:
      - validate-stack
  - id: remove-json
    content: Remover backend/data e refs a fileStorage/mocks
    status: completed
    dependencies:
      - validate-stack
  - id: update-docs
    content: Ajustar README/docker-compose para cenário sem JSON
    status: completed
    dependencies:
      - remove-json
  - id: lint-test
    content: Rodar lint e testes rápidos API/menu/api-docs
    status: completed
    dependencies:
      - update-docs
---

# Limpeza e validação backend

## Objetivo

Validar a stack backend (migrations já executadas) e remover arquivos/legados não usados (incluindo `C:\Nestjs\Ademir\database` e dados JSON), ajustando código para não depender mais de mocks.

## Plano

1) **Validar stack e saúde**

- Checar containers `ademir-backend`, `ademir-postgres`, rede `backend-network`, endpoints `/health` e `/api-docs`.
- Verificar logs de migração concluída.

2) **Remover legado de banco antigo**

- Deletar pasta `C:\Nestjs\Ademir\database` (scripts antigos).

3) **Remover dados JSON e referências**

- Remover `backend/data` JSONs.
- Remover utilitário `src/utils/fileStorage.js` e importações.
- Garantir que rotas/serviços não dependem de JSON; se restar fallback, eliminar.

4) **Atualizar Docker/README**

- Conferir `backend/docker/docker-compose.yml` e `frontend/docker-compose.yml` após rename da stack.
- Atualizar `backend/README.md` anotando remoção de JSON/legado e dependência apenas de Postgres.

5) **Sanear código e lint**

- Passar lint `npm run lint` no backend.
- Ajustar eventuais warnings/remover código morto.

6) **Testes rápidos**

- `curl` para `/api/menu` e `/api-docs` pelo backend e via frontend proxy.
- Verificar containers e rede (`docker ps`, `docker network ls`).