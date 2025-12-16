const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Evento = sequelize.define('Evento', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  data: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  finalizado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  data_finalizacao: {
    type: DataTypes.DATE,
    allowNull: true
  },
  itens: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'eventos',
  timestamps: true,
  createdAt: 'data_criacao',
  updatedAt: false
})

module.exports = Evento
