# Frontend - Ademir Sistema

Frontend isolado em container Docker separado do backend.

## Estrutura

- `Dockerfile` - Configuração do container Nginx
- `docker-compose.yml` - Orquestração do frontend
- Arquivos HTML/JS do frontend

## Como usar

### Iniciar o frontend

```bash
cd frontend
docker-compose up -d --build
```

### Parar o frontend

```bash
cd frontend
docker-compose down
```

### Ver logs

```bash
cd frontend
docker-compose logs -f frontend
```

## Acesso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3100/api (via proxy do nginx)
- **Swagger Docs**: http://localhost:3000/api-docs (via proxy do nginx)

## Requisitos

- Backend deve estar rodando na rede `docker_ademir-network`
- Backend deve estar acessível como `backend:3100` na rede Docker

## Configuração

O nginx está configurado para:
- Servir arquivos estáticos do frontend
- Fazer proxy das requisições `/api/*` para o backend
- Suportar SPA (Single Page Application) com fallback para `index.html`

