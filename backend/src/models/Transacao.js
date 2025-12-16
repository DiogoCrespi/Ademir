const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Transacao = sequelize.define('Transacao', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true
  },
  cartao_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'cartoes',
      key: 'id'
    }
  },
  cartao_numero: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tipo: {
    type: DataTypes.ENUM('compra', 'recarga', 'estorno'),
    allowNull: false
  },
  valor: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  saldo_anterior: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  saldo_atual: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estornado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  data_estorno: {
    type: DataTypes.DATE,
    allowNull: true
  },
  itens: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  transacoes_estornadas: {
    type: DataTypes.ARRAY(DataTypes.BIGINT),
    allowNull: true
  }
}, {
  tableName: 'transacoes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
})

module.exports = Transacao
