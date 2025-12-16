# Plano de Migração para Banco de Dados

Este documento descreve o plano de migração dos dados atualmente armazenados em arquivos JSON para um banco de dados relacional.

## Objetivo

Migrar toda a persistência de dados de arquivos JSON para um banco de dados, mantendo compatibilidade com o frontend atual e melhorando performance, segurança e escalabilidade.

## Estrutura de Dados Atual

### Arquivos JSON

1. **menu.json** - Categorias e itens do menu
2. **cartoes.json** - Cartões cadastrados
3. **cartoes-transacoes.json** - Histórico de transações
4. **estoque.json** - Estoque (geladeiras e câmera fria)
5. **estoque-historico.json** - Histórico de movimentações
6. **eventos.json** - Eventos cadastrados
7. **bilheteria-ingressos.json** - Ingressos vendidos
8. **bilheteria-config.json** - Configurações de preços

## Modelo de Dados Proposto

### Tabelas Principais

#### 1. categorias
```sql
- id (PK, BIGINT)
- titulo (VARCHAR)
- img_url (VARCHAR, nullable)
- ativo (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 2. itens_menu
```sql
- id (PK, BIGINT)
- categoria_id (FK, BIGINT)
- nome (VARCHAR)
- preco (DECIMAL)
- descricao (TEXT, nullable)
- ativo (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 3. cartoes
```sql
- id (PK, BIGINT)
- numero (VARCHAR, UNIQUE)
- nome (VARCHAR)
- documento (VARCHAR, nullable)
- saldo (DECIMAL)
- ativo (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 4. transacoes
```sql
- id (PK, BIGINT)
- cartao_id (FK, BIGINT)
- tipo (ENUM: 'compra', 'recarga', 'estorno')
- valor (DECIMAL)
- saldo_anterior (DECIMAL)
- saldo_atual (DECIMAL)
- descricao (TEXT, nullable)
- estornado (BOOLEAN, default false)
- data_estorno (TIMESTAMP, nullable)
- created_at (TIMESTAMP)
```

#### 5. itens_transacao
```sql
- id (PK, BIGINT)
- transacao_id (FK, BIGINT)
- produto_nome (VARCHAR)
- quantidade (INTEGER)
- preco (DECIMAL)
- total (DECIMAL)
```

#### 6. produtos_estoque
```sql
- id (PK, BIGINT)
- nome (VARCHAR)
- categoria (VARCHAR)
- quantidade (INTEGER)
- valor_unitario (DECIMAL)
- estoque_minimo (INTEGER)
- local (ENUM: 'geladeiras', 'cameraFria')
- observacao (TEXT, nullable)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 7. movimentacoes_estoque
```sql
- id (PK, BIGINT)
- produto_id (FK, BIGINT)
- tipo (ENUM: 'entrada', 'saida')
- quantidade (INTEGER)
- valor_unitario (DECIMAL)
- total (DECIMAL)
- observacao (TEXT, nullable)
- created_at (TIMESTAMP)
```

#### 8. eventos
```sql
- id (PK, BIGINT)
- nome (VARCHAR)
- data (DATE)
- descricao (TEXT, nullable)
- finalizado (BOOLEAN, default false)
- data_criacao (TIMESTAMP)
- data_finalizacao (TIMESTAMP, nullable)
```

#### 9. itens_evento
```sql
- id (PK, BIGINT)
- evento_id (FK, BIGINT)
- produto_id (FK, BIGINT)
- quantidade_inicial (INTEGER)
- quantidade_atual (INTEGER)
- quantidade_fisica_restante (INTEGER)
- quantidade_consumida (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 10. reposicoes_evento
```sql
- id (PK, BIGINT)
- item_evento_id (FK, BIGINT)
- quantidade (INTEGER)
- created_at (TIMESTAMP)
```

#### 11. ingressos
```sql
- id (PK, BIGINT)
- codigo (VARCHAR, UNIQUE)
- tipo (ENUM: 'normal', 'meio', 'passaporte')
- valor (DECIMAL)
- data_venda (TIMESTAMP)
- data_venda_date (DATE)
- liberado (BOOLEAN, default false)
- data_liberacao (TIMESTAMP, nullable)
- created_at (TIMESTAMP)
```

#### 12. config_bilheteria
```sql
- id (PK, BIGINT)
- chave (VARCHAR, UNIQUE)
- valor (DECIMAL)
- updated_at (TIMESTAMP)
```

## Estratégia de Migração

### Fase 1: Preparação
1. Criar modelos de dados em `backend/src/models/`
2. Configurar ORM (Sequelize, TypeORM, ou Prisma)
3. Criar migrations
4. Configurar conexão com banco de dados

### Fase 2: Implementação Dual-Write
1. Manter leitura de JSON
2. Implementar escrita simultânea em JSON e DB
3. Validar integridade dos dados

### Fase 3: Migração de Dados
1. Script de migração para ler JSONs e inserir no DB
2. Validação de dados migrados
3. Backup dos arquivos JSON originais

### Fase 4: Transição Completa
1. Alterar leitura para DB
2. Remover escrita em JSON
3. Manter JSON apenas como backup

### Fase 5: Limpeza
1. Remover código de leitura/escrita de JSON
2. Remover arquivos JSON (após período de backup)
3. Documentar novo modelo de dados

## Considerações Técnicas

### Banco de Dados Recomendado
- **PostgreSQL** (recomendado para produção)
- **MySQL/MariaDB** (alternativa)
- **SQLite** (apenas para desenvolvimento/testes)

### ORM/Query Builder
- **Sequelize** (mais popular no ecossistema Node.js)
- **TypeORM** (se usar TypeScript)
- **Prisma** (moderno, type-safe)

### Índices Necessários
- `cartoes.numero` (UNIQUE)
- `ingressos.codigo` (UNIQUE)
- `transacoes.cartao_id` + `created_at`
- `movimentacoes_estoque.produto_id` + `created_at`
- `itens_evento.evento_id`

### Constraints
- Foreign keys em todas as relações
- Check constraints para valores válidos
- Unique constraints onde necessário

## Scripts de Migração

### Exemplo de Script de Migração

```javascript
// backend/migrations/migrate-json-to-db.js
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../src/models');

async function migrateCartoes() {
  const cartoes = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/cartoes.json'), 'utf8')
  );
  
  for (const cartao of cartoes) {
    await Cartao.create({
      id: cartao.id,
      numero: cartao.numero,
      nome: cartao.nome,
      documento: cartao.documento,
      saldo: cartao.saldo,
      ativo: cartao.ativo === 1 || cartao.ativo === true,
      created_at: cartao.created_at || new Date()
    });
  }
}

// Repetir para cada entidade...
```

## Rollback Plan

Em caso de problemas:
1. Reverter código para versão anterior
2. Restaurar arquivos JSON do backup
3. Validar integridade dos dados
4. Documentar problemas encontrados

## Timeline Estimado

- **Fase 1**: 1-2 semanas
- **Fase 2**: 1 semana
- **Fase 3**: 2-3 dias
- **Fase 4**: 1 semana
- **Fase 5**: 2-3 dias

**Total estimado**: 4-5 semanas

## Notas Importantes

- Manter compatibilidade total com frontend durante migração
- Testes extensivos em ambiente de desenvolvimento
- Backup completo antes de iniciar migração
- Monitoramento de performance após migração
- Documentação atualizada após conclusão

---

**Status**: Planejado  
**Última atualização**: 2025-12-16

