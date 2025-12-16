const swaggerJsdoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Ademir - Sistema de Vendas e Controle',
      version: '1.0.0',
      description: 'API REST para sistema de vendas, controle de estoque, cartões, eventos e bilheteria',
      contact: {
        name: 'Backend Team'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3100}`,
        description: 'Servidor de desenvolvimento'
      }
    ],
    tags: [
      { name: 'Menu', description: 'Gerenciamento de menu e categorias' },
      { name: 'Cartões', description: 'Gerenciamento de cartões e transações' },
      { name: 'Estoque', description: 'Controle de estoque e movimentações' },
      { name: 'Eventos', description: 'Gerenciamento de eventos' },
      { name: 'Bilheteria', description: 'Venda e controle de ingressos' },
      { name: 'Controle', description: 'Dashboard e relatórios' }
    ]
  },
  apis: ['./src/routes/*.js'] // Caminho para os arquivos com anotações Swagger
}

const swaggerSpec = swaggerJsdoc(options)

module.exports = swaggerSpec
