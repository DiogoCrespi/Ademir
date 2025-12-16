const express = require('express')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('../config/swagger')

const router = express.Router()

// Rota para servir a documentação Swagger
router.use('/', swaggerUi.serve)
router.get('/', swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Ademir - Documentação'
}))

module.exports = router
