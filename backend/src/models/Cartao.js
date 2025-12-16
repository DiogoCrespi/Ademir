const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Cartao = sequelize.define('Cartao', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true
  },
  numero: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  documento: {
    type: DataTypes.STRING,
    allowNull: true
  },
  saldo: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'cartoes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})

module.exports = Cartao
