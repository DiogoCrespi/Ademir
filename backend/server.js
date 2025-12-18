const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const menuRoutes = require('./routes/menu');
const cartoesRoutes = require('./routes/cartoes');
const estoqueRoutes = require('./routes/estoque');
const eventosRoutes = require('./routes/eventos');
const bilheteriaRoutes = require('./routes/bilheteria');
const controleRoutes = require('./routes/controle');

const app = express();
// Porta padrão para o backend; pode ser sobrescrita por PORT
const PORT = process.env.PORT || 3101;

// Middlewares básicos
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Swagger UI em /api/docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Montar rotas da API (backend é API pura, sem servir frontend)
app.use('/api', menuRoutes);
app.use('/api', cartoesRoutes);
app.use('/api', estoqueRoutes);
app.use('/api', eventosRoutes);
app.use('/api', bilheteriaRoutes);
app.use('/api', controleRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`API disponível em http://localhost:${PORT}/api`);
});


