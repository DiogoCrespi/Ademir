# Backend API - Sistema Ademir

Backend isolado para o sistema de vendas e controle de estoque.

## Estrutura

```
backend/
├── src/
│   ├── config/         # Configurações (Swagger, etc)
│   ├── controllers/    # Controllers (futuro)
│   ├── middleware/     # Middlewares customizados
│   ├── models/         # Modelos de dados (preparação para DB)
│   ├── routes/         # Rotas da API
│   ├── services/       # Lógica de negócio
│   ├── utils/          # Funções auxiliares
│   └── server.js       # Entry point
├── data/               # Dados JSON (temporário)
├── docs/               # Documentação
├── docker/             # Configuração Docker
├── migrations/         # Scripts de migração (futuro)
└── package.json
```

## Instalação

```bash
cd backend
npm install
```

## Execução

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## Docker

### Subir stack (backend + postgres) com migrations automáticas
1) Criar a rede (apenas se não existir):
```bash
docker network create backend-network
```
2) Subir o backend (executa `npm run migrate` antes de iniciar):
```bash
cd backend/docker
docker-compose up -d --build
```
   - Porta backend: `3100`
   - Swagger: `http://localhost:3100/api-docs`
   - Rede Docker: `backend-network` (nome efetivo: `docker_backend-network`)

### Frontend (container separado)
No diretório `frontend/`:
```bash
cd frontend
docker-compose up -d --build
```
   - Porta frontend: `3000`
   - Proxy para API: `/api/*` → `backend:3100`
   - Swagger via proxy: `http://localhost:3000/api-docs`

## Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
PORT=3100
NODE_ENV=development
```

## API Endpoints

### Documentação Swagger
Acesse `http://localhost:3100/api-docs` para ver a documentação completa da API.

### Principais Endpoints

- **Menu**: `/api/menu`
- **Cartões**: `/api/cartoes`
- **Estoque**: `/api/estoque`
- **Eventos**: `/api/eventos`
- **Bilheteria**: `/api/bilheteria`
- **Controle**: `/api/controle`

## Documentação

- [Catálogo de Funcionalidades](./docs/funcionalidades.md)
- [Plano de Migração para Banco de Dados](./docs/migracao-db.md)

## Notas

- Migrations rodam automaticamente no start do container backend (`npm run migrate && node src/server.js`).
- Dados migrados do JSON para PostgreSQL (menu, cartões, transações, estoque, movimentações, eventos, ingressos). Pastas/arquivos JSON foram removidos.
- Swagger configurado para documentação automática (`/api-docs`).
- Frontend consome a API do backend; não há persistência em JSON no backend (mocks removidos).

