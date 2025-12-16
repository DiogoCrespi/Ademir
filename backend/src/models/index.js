const Categoria = require('./Categoria')
const ItemMenu = require('./ItemMenu')
const Cartao = require('./Cartao')
const Transacao = require('./Transacao')
const ProdutoEstoque = require('./ProdutoEstoque')
const MovimentacaoEstoque = require('./MovimentacaoEstoque')
const Evento = require('./Evento')
const Ingresso = require('./Ingresso')
const ConfigBilheteria = require('./ConfigBilheteria')

// Definir relacionamentos
Categoria.hasMany(ItemMenu, { foreignKey: 'categoria_id', as: 'itens' })
ItemMenu.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria' })

Cartao.hasMany(Transacao, { foreignKey: 'cartao_id', as: 'transacoes' })
Transacao.belongsTo(Cartao, { foreignKey: 'cartao_id', as: 'cartao' })

ProdutoEstoque.hasMany(MovimentacaoEstoque, { foreignKey: 'produto_id', as: 'movimentacoes' })
MovimentacaoEstoque.belongsTo(ProdutoEstoque, { foreignKey: 'produto_id', as: 'produto' })

module.exports = {
  Categoria,
  ItemMenu,
  Cartao,
  Transacao,
  ProdutoEstoque,
  MovimentacaoEstoque,
  Evento,
  Ingresso,
  ConfigBilheteria
}
