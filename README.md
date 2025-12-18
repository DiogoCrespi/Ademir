# Sistema Ademir - Vendas e Controle de Estoque

Sistema completo de vendas com controle de estoque, cartões, gestão de menu, eventos e bilheteria.

## 🚀 Características

- ✅ **Backend REST API** com Node.js e Express
- ✅ **Banco de Dados PostgreSQL** com Sequelize ORM
- ✅ **Frontend** separado com HTML, CSS e JavaScript
- ✅ **Docker** configurado para desenvolvimento e produção
- ✅ **Swagger** para documentação automática da API
- ✅ **Módulos organizados**: Menu, Cartões, Estoque, Eventos, Bilheteria e Controle

## 📁 Estrutura do Projeto

```
.
├── frontend/              # Interface do usuário
│   ├── index.html         # Página principal de vendas
│   ├── admin.html         # Painel administrativo
│   ├── admin-itens.html   # Gerenciamento de itens do menu
│   ├── admin-eventos.html # Gerenciamento de eventos
│   ├── estoque.html       # Controle de estoque
│   ├── bilheteria.html    # Sistema de bilheteria
│   ├── controle.html      # Dashboard e relatórios
│   ├── api.js             # Helper para comunicação com API
│   ├── Dockerfile         # Container Nginx para frontend
│   └── docker-compose.yml # Orquestração do frontend
│
├── backend/               # API Backend
│   ├── src/
│   │   ├── config/        # Configurações (database, swagger)
│   │   ├── models/        # Modelos Sequelize (PostgreSQL)
│   │   ├── routes/        # Rotas da API
│   │   ├── services/      # Lógica de negócio
│   │   └── server.js      # Entry point do servidor
│   ├── migrations/        # Scripts de migração
│   ├── docker/            # Configuração Docker do backend
│   ├── docs/              # Documentação técnica
│   └── package.json
│
└── package.json           # Configuração raiz
```

## 🛠️ Tecnologias

### Backend
- **Node.js** (>=18.0.0)
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **Sequelize** - ORM para PostgreSQL
- **Swagger** - Documentação da API
- **CORS** - Cross-Origin Resource Sharing

### Frontend
- **HTML5/CSS3/JavaScript** (Vanilla)
- **Nginx** - Servidor web e proxy reverso

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers

## 📦 Instalação

### Opção 1: Docker (Recomendado)

#### Backend + PostgreSQL

```bash
# Criar a rede Docker (apenas na primeira vez)
docker network create backend-network

# Subir backend e PostgreSQL
cd backend/docker
docker-compose up -d --build
```

O backend estará disponível em: `http://localhost:3100`

#### Frontend

```bash
cd frontend
docker-compose up -d --build
```

O frontend estará disponível em: `http://localhost:3000`

### Opção 2: Instalação Local

#### Pré-requisitos
- Node.js >= 18.0.0
- PostgreSQL >= 12
- npm >= 9.0.0

#### Backend

```bash
cd backend
npm install
```

Configure as variáveis de ambiente (crie um arquivo `.env`):

```env
PORT=3100
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ademir
DB_USER=ademir
DB_PASSWORD=ademir123
```

Execute as migrações:

```bash
npm run migrate
```

Inicie o servidor:

```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start
```

#### Frontend

O frontend pode ser servido por qualquer servidor web estático. Para desenvolvimento, você pode usar:

```bash
# Com Python
python -m http.server 3000

# Com Node.js (http-server)
npx http-server -p 3000
```

## 🌐 Acessos

### Desenvolvimento Local
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3100
- **Swagger Docs**: http://localhost:3100/api-docs
- **Health Check**: http://localhost:3100/health

### Docker
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3100
- **Swagger Docs**: http://localhost:3000/api-docs (via proxy) ou http://localhost:3100/api-docs
- **PostgreSQL**: localhost:5432

## 📚 API Endpoints

A documentação completa da API está disponível via Swagger em `/api-docs`.

### Principais Endpoints

#### Menu
- `GET /api/menu` - Obter menu completo
- `POST /api/menu` - Salvar/atualizar menu

#### Cartões
- `GET /api/cartoes` - Listar todos os cartões
- `POST /api/cartoes` - Salvar lista de cartões
- `GET /api/cartoes/:numero` - Buscar cartão por número
- `POST /api/cartoes/:id/debitar` - Debitar valor do cartão
- `POST /api/cartoes/:id/recarregar` - Recarregar saldo
- `GET /api/cartoes/:id/transacoes` - Listar transações do cartão
- `POST /api/cartoes/:id/estornar` - Estornar transações

#### Estoque
- `GET /api/estoque` - Obter estoque completo
- `POST /api/estoque` - Salvar/atualizar estoque
- `GET /api/estoque/historico` - Obter histórico de movimentações
- `GET /api/estoque/verificar/:produtoNome` - Verificar disponibilidade
- `POST /api/estoque/reduzir` - Reduzir estoque (venda)

#### Eventos
- `GET /api/eventos` - Listar todos os eventos
- `POST /api/eventos` - Salvar/atualizar eventos

#### Bilheteria
- `GET /api/bilheteria/config` - Obter configurações de preços
- `POST /api/bilheteria/config` - Salvar configurações
- `POST /api/bilheteria/processar-pagamento` - Processar pagamento
- `POST /api/bilheteria/vender` - Registrar venda de ingressos
- `GET /api/bilheteria/ingressos` - Listar ingressos vendidos
- `POST /api/bilheteria/liberar` - Liberar entrada de ingresso

#### Controle e Relatórios
- `GET /api/controle/dashboard` - Dashboard com estatísticas
- `GET /api/controle/logs` - Logs de atividades
- `GET /api/controle/relatorio/cartoes` - Relatório de cartões
- `GET /api/controle/relatorio/vendas` - Relatório de vendas
- `GET /api/controle/relatorio/estoque` - Relatório de estoque
- `GET /api/controle/relatorio/eventos` - Relatório de eventos

## 🗄️ Banco de Dados

O sistema utiliza **PostgreSQL** com as seguintes tabelas:

- `categorias` - Categorias do menu
- `itens_menu` - Itens do menu
- `cartoes` - Cartões de clientes
- `transacoes` - Transações dos cartões
- `produtos_estoque` - Produtos em estoque
- `movimentacoes_estoque` - Histórico de movimentações
- `eventos` - Eventos cadastrados
- `ingressos` - Ingressos vendidos
- `config_bilheteria` - Configurações da bilheteria

As migrações são executadas automaticamente ao iniciar o container Docker ou manualmente com:

```bash
cd backend
npm run migrate
```

## 🐳 Docker

### Comandos Úteis

```bash
# Ver logs do backend
cd backend/docker
docker-compose logs -f backend

# Ver logs do frontend
cd frontend
docker-compose logs -f frontend

# Parar serviços
docker-compose down

# Parar e remover volumes (apaga dados do banco)
docker-compose down -v

# Reconstruir containers
docker-compose up -d --build
```

### Rede Docker

O frontend e backend se comunicam através da rede Docker `backend-network` (nome efetivo: `docker_backend-network`).

## 📖 Documentação Adicional

- [Backend README](./backend/README.md) - Documentação detalhada do backend
- [Funcionalidades](./backend/docs/funcionalidades.md) - Catálogo completo de funcionalidades
- [Migração DB](./backend/docs/migracao-db.md) - Detalhes da migração para PostgreSQL
- [Frontend README](./frontend/README.md) - Documentação do frontend

## 🔧 Scripts Disponíveis

### Raiz do Projeto
- `npm start` - Inicia o backend
- `npm run dev` - Inicia o backend em modo desenvolvimento (com auto-reload)

### Backend
- `npm start` - Inicia o servidor
- `npm run dev` - Modo desenvolvimento com nodemon
- `npm run migrate` - Executa migrações do banco de dados
- `npm run lint` - Executa ESLint
- `npm run lint:fix` - Corrige problemas do ESLint

## 📝 Notas Importantes

- ✅ **Migração concluída**: Todos os dados foram migrados de JSON para PostgreSQL
- ✅ **Swagger configurado**: Documentação automática disponível em `/api-docs`
- ✅ **Docker ready**: Sistema completo containerizado e pronto para produção
- ✅ **CORS habilitado**: API acessível de qualquer origem
- ✅ **Transações garantidas**: Sequelize garante consistência dos dados

## 🚧 Funcionalidades Futuras

- [ ] Upload de imagens para categorias e produtos
- [ ] Autenticação e autorização de usuários
- [ ] Cache para consultas frequentes
- [ ] Paginação nas listagens
- [ ] Exportação de relatórios em PDF/Excel
- [ ] Integração com APIs de pagamento reais

## 📄 Licença

ISC

---

**Versão:** 1.0.0  
**Última atualização:** 2025-12-16
