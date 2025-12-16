const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Categoria = sequelize.define('Categoria', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  img: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'categorias',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})

module.exports = Categoria
