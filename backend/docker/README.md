# Docker Setup - Backend Ademir

## Requisitos

- Docker
- Docker Compose

## Execução

### Subir todos os serviços (Backend + PostgreSQL)

```bash
cd docker
docker-compose up -d
```

### Ver logs

```bash
docker-compose logs -f
```

### Parar serviços

```bash
docker-compose down
```

### Parar e remover volumes (apaga dados do banco)

```bash
docker-compose down -v
```

## Serviços

### Backend
- **Porta**: 3100
- **URL**: http://localhost:3100
- **API Docs**: http://localhost:3100/api-docs
- **Health Check**: http://localhost:3100/health

### PostgreSQL
- **Porta**: 5432
- **Database**: ademir
- **User**: ademir
- **Password**: ademir123

## Conexão com Banco

Para conectar ao banco de dados:

```bash
# De dentro do container
docker exec -it ademir-postgres psql -U ademir -d ademir

# Ou usando cliente externo
psql -h localhost -p 5432 -U ademir -d ademir
```

## Variáveis de Ambiente

Copie `.env.example` para `.env` e ajuste conforme necessário:

```bash
cp .env.example .env
```

## Notas

- Os dados do PostgreSQL são persistidos no volume `postgres_data`
- Os dados JSON do backend são mapeados de `../data` para `/app/data` no container
- O backend aguarda o PostgreSQL estar saudável antes de iniciar (healthcheck)

