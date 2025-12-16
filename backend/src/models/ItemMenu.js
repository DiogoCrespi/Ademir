const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const ItemMenu = sequelize.define('ItemMenu', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true
  },
  categoria_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'categorias',
      key: 'id'
    }
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  preco: {
    type: DataTypes.STRING,
    allowNull: false
  },
  desc: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'itens_menu',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})

module.exports = ItemMenu
