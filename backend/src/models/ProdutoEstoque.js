const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const ProdutoEstoque = sequelize.define('ProdutoEstoque', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: true
  },
  quantidade: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  valor_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  estoque_minimo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  local: {
    type: DataTypes.ENUM('geladeiras', 'cameraFria'),
    allowNull: false
  },
  observacao: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'produtos_estoque',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})

module.exports = ProdutoEstoque
