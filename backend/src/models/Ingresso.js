const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Ingresso = sequelize.define('Ingresso', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true
  },
  codigo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  tipo: {
    type: DataTypes.ENUM('normal', 'meio', 'passaporte'),
    allowNull: false
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  data_venda: {
    type: DataTypes.DATE,
    allowNull: false
  },
  data_venda_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  liberado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  data_liberacao: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'ingressos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
})

module.exports = Ingresso
