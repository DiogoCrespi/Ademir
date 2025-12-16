# Models

Esta pasta contém os modelos de dados do sistema.

## Status

**Atual**: Modelos ainda não implementados (dados em JSON)

**Futuro**: Modelos para ORM (Sequelize, TypeORM, ou Prisma) quando migrar para banco de dados.

## Estrutura Proposta

Quando implementar banco de dados, criar modelos para:

- `Categoria.js` - Categorias do menu
- `ItemMenu.js` - Itens do menu
- `Cartao.js` - Cartões
- `Transacao.js` - Transações de cartões
- `ProdutoEstoque.js` - Produtos em estoque
- `MovimentacaoEstoque.js` - Movimentações de estoque
- `Evento.js` - Eventos
- `ItemEvento.js` - Itens de eventos
- `Ingresso.js` - Ingressos
- `ConfigBilheteria.js` - Configurações da bilheteria

Ver `../docs/migracao-db.md` para detalhes do modelo de dados.

