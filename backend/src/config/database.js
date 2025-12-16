const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(
  process.env.DB_NAME || 'ademir',
  process.env.DB_USER || 'ademir',
  process.env.DB_PASSWORD || 'ademir123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
)

// Testar conexão
async function testConnection() {
  try {
    await sequelize.authenticate()
    console.log('✅ Conexão com banco de dados estabelecida com sucesso.')
    return true
  } catch (error) {
    console.error('❌ Erro ao conectar com banco de dados:', error.message)
    return false
  }
}

module.exports = {
  sequelize,
  testConnection
}
