const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const MovimentacaoEstoque = sequelize.define('MovimentacaoEstoque', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true
  },
  produto_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'produtos_estoque',
      key: 'id'
    }
  },
  produto_nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('entrada', 'saida'),
    allowNull: false
  },
  quantidade: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  valor_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  observacao: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'movimentacoes_estoque',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
})

module.exports = MovimentacaoEstoque
