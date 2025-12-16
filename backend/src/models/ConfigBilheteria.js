const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const ConfigBilheteria = sequelize.define('ConfigBilheteria', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  chave: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'config_bilheteria',
  timestamps: true,
  updatedAt: 'updated_at',
  createdAt: false
})

module.exports = ConfigBilheteria
