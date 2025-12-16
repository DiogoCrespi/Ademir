const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')
const { testConnection } = require('./config/database')

// Importar rotas
const menuRoutes = require('./routes/menu')
const cartoesRoutes = require('./routes/cartoes')
const estoqueRoutes = require('./routes/estoque')
const eventosRoutes = require('./routes/eventos')
const bilheteriaRoutes = require('./routes/bilheteria')
const controleRoutes = require('./routes/controle')
const docsRoutes = require('./routes/docs')

const app = express()
const PORT = process.env.PORT || 3100

// Middleware
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Rotas da API
app.use('/api/menu', menuRoutes)
app.use('/api/cartoes', cartoesRoutes)
app.use('/api/estoque', estoqueRoutes)
app.use('/api/eventos', eventosRoutes)
app.use('/api/bilheteria', bilheteriaRoutes)
app.use('/api/controle', controleRoutes)
app.use('/api-docs', docsRoutes)

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Servir arquivos estáticos do frontend
// Primeiro tenta ./frontend (produção/Azure), depois ../frontend (desenvolvimento local)
const frontendPath = path.join(__dirname, '../frontend')
const frontendPathDev = path.join(__dirname, '../../frontend')

let actualFrontendPath = frontendPath
if (!fs.existsSync(frontendPath) && fs.existsSync(frontendPathDev)) {
  actualFrontendPath = frontendPathDev
}

if (fs.existsSync(actualFrontendPath)) {
  app.use(express.static(actualFrontendPath))
}

// Rota catch-all para SPA - servir index.html para todas as rotas que não sejam API
app.get('*', (req, res, next) => {
  // Se for uma rota de API, não servir o frontend
  if (req.path.startsWith('/api') || req.path.startsWith('/api-docs')) {
    return next()
  }
  if (fs.existsSync(actualFrontendPath)) {
    res.sendFile(path.join(actualFrontendPath, 'index.html'))
  } else {
    next()
  }
})

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
  console.log(`API disponível em http://localhost:${PORT}/api`)
  console.log(`Documentação Swagger disponível em http://localhost:${PORT}/api-docs`)

  // Testar conexão com banco
  await testConnection()

  console.log('Rotas disponíveis:')
  console.log('  GET  /api/menu')
  console.log('  POST /api/menu')
  console.log('  GET  /api/cartoes')
  console.log('  POST /api/cartoes')
  console.log('  GET  /api/estoque')
  console.log('  POST /api/estoque')
  console.log('  GET  /api/eventos')
  console.log('  POST /api/eventos')
  console.log('  GET  /api/bilheteria/*')
  console.log('  GET  /api/controle/*')
  console.log('  GET  /api-docs')
})

module.exports = app
