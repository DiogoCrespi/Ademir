const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3100;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Diretório de dados
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Função auxiliar para ler dados
function readDataFile(filename, defaultValue = []) {
  const filepath = path.join(DATA_DIR, filename);
  try {
    if (fs.existsSync(filepath)) {
      const data = fs.readFileSync(filepath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Erro ao ler ${filename}:`, error);
  }
  return defaultValue;
}

// Função auxiliar para escrever dados
function writeDataFile(filename, data) {
  const filepath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Erro ao escrever ${filename}:`, error);
    return false;
  }
}

// ========== ROTAS API - MENU ==========
app.get('/api/menu', (req, res) => {
  try {
    const menu = readDataFile('menu.json', getDefaultMenu());
    res.json(menu);
  } catch (error) {
    console.error('Erro ao ler menu:', error);
    res.status(500).json({ error: 'Erro ao carregar menu' });
  }
});

app.post('/api/menu', (req, res) => {
  const menu = req.body;
  if (writeDataFile('menu.json', menu)) {
    res.json({ success: true, message: 'Menu atualizado com sucesso' });
  } else {
    res.status(500).json({ success: false, message: 'Erro ao salvar menu' });
  }
});

function getDefaultMenu() {
  return [
    {
      id: "refrigerantes",
      titulo: "Refrigerantes",
      img: "https://i.ibb.co/8DWyqRjT/refrigerante.png",
      itens: [
        { nome: "Coca-Cola Lata", preco: "R$ 6,00", desc: "350ml" },
        { nome: "Guaraná Lata", preco: "R$ 5,50", desc: "350ml" },
        { nome: "Sprite Lata", preco: "R$ 5,50", desc: "350ml" }
      ]
    },
    {
      id: "porcoes",
      titulo: "Porções",
      img: "https://i.ibb.co/qFxWFY7Y/porcao.png",
      itens: [
        { nome: "Batata Frita", preco: "R$ 24,00", desc: "500g crocante" },
        { nome: "Iscas de Frango", preco: "R$ 32,00", desc: "500g com molho" },
        { nome: "Anéis de Cebola", preco: "R$ 22,00", desc: "Porção média" }
      ]
    },
    {
      id: "hamburguer",
      titulo: "Hambúrguer",
      img: "https://i.ibb.co/sphwvfNN/hamburguer.png",
      itens: [
        { nome: "Clássico", preco: "R$ 28,00", desc: "Blend 160g, queijo, salada" },
        { nome: "Cheddar Bacon", preco: "R$ 32,00", desc: "Cheddar cremoso e bacon" },
        { nome: "Veggie", preco: "R$ 29,00", desc: "Grão-de-bico, maionese verde" }
      ]
    },
    {
      id: "cerveja",
      titulo: "Cerveja",
      img: "https://i.ibb.co/4RnJX9Kn/cerveja.png",
      itens: [
        { nome: "Heineken 330ml", preco: "R$ 14,00", desc: "Long neck" },
        { nome: "Stella 330ml", preco: "R$ 12,00", desc: "Long neck" },
        { nome: "Original 600ml", preco: "R$ 18,00", desc: "Garrafa" }
      ]
    },
    {
      id: "chop",
      titulo: "Chop",
      img: "https://i.ibb.co/7dvx8jzP/chopp.png",
      itens: [
        { nome: "Pilsen 300ml", preco: "R$ 8,00", desc: "Taça" },
        { nome: "Pilsen 500ml", preco: "R$ 12,00", desc: "Caneca" },
        { nome: "IPA 500ml", preco: "R$ 16,00", desc: "Caneca" }
      ]
    }
  ];
}

// ========== ROTAS API - CARTÕES ==========
app.get('/api/cartoes', (req, res) => {
  try {
    const cartoes = readDataFile('cartoes.json', []);
    console.log(`[API] GET /api/cartoes - Retornando ${cartoes.length} cartões`);
    if (cartoes.length > 0) {
      console.log(`[API] Primeiros cartões:`, cartoes.slice(0, 3).map(c => `${c.numero} - ${c.nome}`));
    }
    res.json(cartoes);
  } catch (error) {
    console.error('Erro ao ler cartões:', error);
    res.status(500).json({ error: 'Erro ao carregar cartões' });
  }
});

app.post('/api/cartoes', (req, res) => {
  try {
    const cartoes = req.body;
    console.log(`[API] POST /api/cartoes - Salvando ${Array.isArray(cartoes) ? cartoes.length : 0} cartões`);
    
    if (!Array.isArray(cartoes)) {
      return res.status(400).json({ success: false, message: 'Dados inválidos: esperado array de cartões' });
    }
    
    if (writeDataFile('cartoes.json', cartoes)) {
      console.log(`[API] ✅ Cartões salvos com sucesso`);
      res.json({ success: true, message: 'Cartões atualizados com sucesso' });
    } else {
      res.status(500).json({ success: false, message: 'Erro ao salvar cartões' });
    }
  } catch (error) {
    console.error('[API] Erro ao salvar cartões:', error);
    res.status(500).json({ success: false, message: 'Erro ao salvar cartões' });
  }
});

app.get('/api/cartoes/:numero', (req, res) => {
  try {
    const cartoes = readDataFile('cartoes.json', []);
    const numero = req.params.numero.replace(/\s/g, '').trim();
    
    console.log(`[API] Buscando cartão: "${numero}"`);
    console.log(`[API] Total de cartões: ${cartoes.length}`);
    if (cartoes.length > 0) {
      console.log(`[API] Primeiros números: ${cartoes.slice(0, 3).map(c => c.numero).join(', ')}`);
    }
    
    if (!numero || numero.length < 4) {
      return res.status(400).json({ success: false, message: 'Número de cartão inválido' });
    }
    
    // Buscar exato primeiro
    let cartao = cartoes.find(c => {
      if (!c || !c.numero) return false;
      const numCartao = String(c.numero).replace(/\s/g, '').trim();
      const match = numCartao === numero;
      if (match) {
        console.log(`[API] ✅ Encontrado por busca exata: ${numCartao}`);
      }
      return match;
    });
    
    // Se não encontrar, tentar busca parcial (últimos 4 dígitos)
    if (!cartao && numero.length >= 4) {
      const ultimosDigitos = numero.slice(-4);
      console.log(`[API] Tentando busca parcial com últimos 4 dígitos: ${ultimosDigitos}`);
      cartao = cartoes.find(c => {
        if (!c || !c.numero) return false;
        const numCartao = String(c.numero).replace(/\s/g, '').trim();
        const match = numCartao.endsWith(ultimosDigitos);
        if (match) {
          console.log(`[API] ✅ Encontrado por busca parcial: ${numCartao}`);
        }
        return match;
      });
    }
    
    if (cartao) {
      console.log(`[API] ✅ Cartão encontrado: ${cartao.numero} - ${cartao.nome}`);
      res.json(cartao);
    } else {
      console.log(`[API] ❌ Cartão não encontrado: ${numero}`);
      res.status(404).json({ success: false, message: 'Cartão não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao buscar cartão:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar cartão' });
  }
});

app.post('/api/cartoes/:id/debitar', (req, res) => {
  const { valor, itens } = req.body;
  const cartoes = readDataFile('cartoes.json', []);
  const cartaoIndex = cartoes.findIndex(c => c.id == req.params.id);
  
  if (cartaoIndex === -1) {
    return res.status(404).json({ success: false, message: 'Cartão não encontrado' });
  }
  
  const cartao = cartoes[cartaoIndex];
  if (cartao.saldo < valor) {
    return res.status(400).json({ success: false, message: 'Saldo insuficiente' });
  }
  
  const saldoAnterior = cartao.saldo;
  cartao.saldo -= valor;
  cartao.saldo = Math.round(cartao.saldo * 100) / 100;
  
  // Registrar transação no histórico
  try {
    const transacoes = readDataFile('cartoes-transacoes.json', []);
    transacoes.unshift({
      id: Date.now(),
      cartaoId: cartao.id,
      cartaoNumero: cartao.numero,
      tipo: 'compra',
      valor: valor,
      saldoAnterior: saldoAnterior,
      saldoAtual: cartao.saldo,
      data: new Date().toISOString(),
      itens: itens || [],
      descricao: `Compra de ${itens ? itens.length : 0} item(ns)`
    });
    
    // Manter apenas últimos 10000 registros
    if (transacoes.length > 10000) {
      transacoes.splice(10000);
    }
    
    const salvoCartoes = writeDataFile('cartoes.json', cartoes);
    const salvoTransacoes = writeDataFile('cartoes-transacoes.json', transacoes);
    
    if (salvoCartoes && salvoTransacoes) {
      res.json({ success: true, cartao });
    } else {
      console.error('[API] Erro ao salvar cartão ou transações');
      res.status(500).json({ success: false, message: 'Erro ao atualizar cartão' });
    }
  } catch (error) {
    console.error('[API] Erro ao registrar transação:', error);
    // Ainda assim, tentar salvar o cartão mesmo se falhar ao salvar transação
    if (writeDataFile('cartoes.json', cartoes)) {
      res.json({ success: true, cartao });
    } else {
      res.status(500).json({ success: false, message: 'Erro ao atualizar cartão' });
    }
  }
});

// Rota para registrar recarga
app.post('/api/cartoes/:id/recarregar', (req, res) => {
  const { valor, descricao } = req.body;
  const cartoes = readDataFile('cartoes.json', []);
  const cartaoIndex = cartoes.findIndex(c => c.id == req.params.id);
  
  if (cartaoIndex === -1) {
    return res.status(404).json({ success: false, message: 'Cartão não encontrado' });
  }
  
  const cartao = cartoes[cartaoIndex];
  const saldoAnterior = cartao.saldo;
  cartao.saldo += parseFloat(valor) || 0;
  cartao.saldo = Math.round(cartao.saldo * 100) / 100;
  
  // Registrar transação no histórico
  try {
    const transacoes = readDataFile('cartoes-transacoes.json', []);
    transacoes.unshift({
      id: Date.now(),
      cartaoId: cartao.id,
      cartaoNumero: cartao.numero,
      tipo: 'recarga',
      valor: parseFloat(valor) || 0,
      saldoAnterior: saldoAnterior,
      saldoAtual: cartao.saldo,
      data: new Date().toISOString(),
      descricao: descricao || 'Recarga de saldo'
    });
    
    // Manter apenas últimos 10000 registros
    if (transacoes.length > 10000) {
      transacoes.splice(10000);
    }
    
    const salvoCartoes = writeDataFile('cartoes.json', cartoes);
    const salvoTransacoes = writeDataFile('cartoes-transacoes.json', transacoes);
    
    if (salvoCartoes && salvoTransacoes) {
      res.json({ success: true, cartao });
    } else {
      console.error('[API] Erro ao salvar cartão ou transações');
      res.status(500).json({ success: false, message: 'Erro ao atualizar cartão' });
    }
  } catch (error) {
    console.error('[API] Erro ao registrar transação:', error);
    // Ainda assim, tentar salvar o cartão mesmo se falhar ao salvar transação
    if (writeDataFile('cartoes.json', cartoes)) {
      res.json({ success: true, cartao });
    } else {
      res.status(500).json({ success: false, message: 'Erro ao atualizar cartão' });
    }
  }
});

// Rota para buscar transações de um cartão
app.get('/api/cartoes/:id/transacoes', (req, res) => {
  try {
    const cartaoIdParam = req.params.id;
    // Tentar converter para número, mas também aceitar string
    const cartaoId = isNaN(cartaoIdParam) ? cartaoIdParam : parseInt(cartaoIdParam, 10);
    
    const transacoes = readDataFile('cartoes-transacoes.json', []);
    
    // Filtrar transações comparando IDs (tanto string quanto número)
    const transacoesCartao = transacoes.filter(t => {
      if (!t || !t.cartaoId) return false;
      const tId = typeof t.cartaoId === 'string' ? parseInt(t.cartaoId, 10) : t.cartaoId;
      const cId = typeof cartaoId === 'string' ? parseInt(cartaoId, 10) : cartaoId;
      return tId === cId || String(t.cartaoId) === String(cartaoId);
    });
    
    console.log(`[API] GET /api/cartoes/${cartaoIdParam}/transacoes - Encontradas ${transacoesCartao.length} transações`);
    res.json(transacoesCartao);
  } catch (error) {
    console.error('[API] Erro ao buscar transações:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar transações: ' + error.message });
  }
});

// Rota para estornar transações
app.post('/api/cartoes/:id/estornar', (req, res) => {
  console.log('[API] POST /api/cartoes/:id/estornar - Recebida requisição');
  console.log('[API] Params:', req.params);
  console.log('[API] Body:', req.body);
  
  try {
    const { transacoesIds } = req.body; // Array de IDs das transações a estornar
    const cartaoIdParam = req.params.id;
    const cartaoId = isNaN(cartaoIdParam) ? cartaoIdParam : parseInt(cartaoIdParam, 10);
    
    console.log('[API] Cartão ID:', cartaoId, 'Transações IDs:', transacoesIds);
    
    if (!Array.isArray(transacoesIds) || transacoesIds.length === 0) {
      console.log('[API] Erro: Nenhuma transação selecionada');
      return res.status(400).json({ success: false, message: 'Nenhuma transação selecionada para estorno' });
    }
    
    const cartoes = readDataFile('cartoes.json', []);
    const cartaoIndex = cartoes.findIndex(c => {
      const cId = typeof c.id === 'string' ? parseInt(c.id, 10) : c.id;
      const pId = typeof cartaoId === 'string' ? parseInt(cartaoId, 10) : cartaoId;
      return cId === pId;
    });
    
    if (cartaoIndex === -1) {
      return res.status(404).json({ success: false, message: 'Cartão não encontrado' });
    }
    
    const cartao = cartoes[cartaoIndex];
    const transacoes = readDataFile('cartoes-transacoes.json', []);
    
    // Buscar transações a estornar (apenas compras, não recargas)
    const transacoesParaEstornar = transacoes.filter(t => {
      const tId = typeof t.id === 'string' ? parseInt(t.id, 10) : t.id;
      const tCartaoId = typeof t.cartaoId === 'string' ? parseInt(t.cartaoId, 10) : t.cartaoId;
      const cId = typeof cartaoId === 'string' ? parseInt(cartaoId, 10) : cartaoId;
      return transacoesIds.includes(tId) && tCartaoId === cId && t.tipo === 'compra' && !t.estornado;
    });
    
    if (transacoesParaEstornar.length === 0) {
      return res.status(400).json({ success: false, message: 'Nenhuma transação válida encontrada para estorno' });
    }
    
    // Calcular valor total a estornar
    const valorTotalEstorno = transacoesParaEstornar.reduce((sum, t) => sum + (parseFloat(t.valor) || 0), 0);
    const saldoAnterior = cartao.saldo;
    cartao.saldo += valorTotalEstorno;
    cartao.saldo = Math.round(cartao.saldo * 100) / 100;
    
    // Marcar transações como estornadas
    transacoesParaEstornar.forEach(trans => {
      const index = transacoes.findIndex(t => {
        const tId = typeof t.id === 'string' ? parseInt(t.id, 10) : t.id;
        const transId = typeof trans.id === 'string' ? parseInt(trans.id, 10) : trans.id;
        return tId === transId;
      });
      if (index !== -1) {
        transacoes[index].estornado = true;
        transacoes[index].dataEstorno = new Date().toISOString();
      }
    });
    
    // Registrar transação de estorno
    transacoes.unshift({
      id: Date.now(),
      cartaoId: cartao.id,
      cartaoNumero: cartao.numero,
      tipo: 'estorno',
      valor: valorTotalEstorno,
      saldoAnterior: saldoAnterior,
      saldoAtual: cartao.saldo,
      data: new Date().toISOString(),
      descricao: `Estorno de ${transacoesParaEstornar.length} transação(ões)`,
      transacoesEstornadas: transacoesParaEstornar.map(t => t.id)
    });
    
    // Manter apenas últimos 10000 registros
    if (transacoes.length > 10000) {
      transacoes.splice(10000);
    }
    
    const salvoCartoes = writeDataFile('cartoes.json', cartoes);
    const salvoTransacoes = writeDataFile('cartoes-transacoes.json', transacoes);
    
    if (salvoCartoes && salvoTransacoes) {
      res.json({ 
        success: true, 
        cartao,
        valorEstornado: valorTotalEstorno,
        transacoesEstornadas: transacoesParaEstornar.length
      });
    } else {
      console.error('[API] Erro ao salvar cartão ou transações');
      res.status(500).json({ success: false, message: 'Erro ao processar estorno' });
    }
  } catch (error) {
    console.error('[API] Erro ao processar estorno:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar estorno: ' + error.message });
  }
});

// ========== ROTAS API - ESTOQUE ==========
app.get('/api/estoque', (req, res) => {
  try {
    const estoque = readDataFile('estoque.json', { geladeiras: [], cameraFria: [] });
    res.json(estoque);
  } catch (error) {
    console.error('Erro ao ler estoque:', error);
    res.status(500).json({ error: 'Erro ao carregar estoque' });
  }
});

app.post('/api/estoque', (req, res) => {
  const estoque = req.body;
  if (writeDataFile('estoque.json', estoque)) {
    res.json({ success: true, message: 'Estoque atualizado com sucesso' });
  } else {
    res.status(500).json({ success: false, message: 'Erro ao salvar estoque' });
  }
});

app.get('/api/estoque/historico', (req, res) => {
  try {
    const historico = readDataFile('estoque-historico.json', []);
    res.json(historico);
  } catch (error) {
    console.error('Erro ao ler histórico:', error);
    res.status(500).json({ error: 'Erro ao carregar histórico' });
  }
});

app.post('/api/estoque/historico', (req, res) => {
  const historico = req.body;
  if (writeDataFile('estoque-historico.json', historico)) {
    res.json({ success: true, message: 'Histórico atualizado com sucesso' });
  } else {
    res.status(500).json({ success: false, message: 'Erro ao salvar histórico' });
  }
});

app.get('/api/estoque/verificar/:produtoNome', (req, res) => {
  const estoque = readDataFile('estoque.json', { geladeiras: [], cameraFria: [] });
  const produtoNome = decodeURIComponent(req.params.produtoNome);
  
  const produto = estoque.geladeiras.find(p => 
    p && p.nome && p.nome.toLowerCase() === produtoNome.toLowerCase()
  );
  
  if (!produto) {
    return res.json({ disponivel: false, quantidade: 0 });
  }
  
  res.json({ disponivel: produto.quantidade > 0, quantidade: produto.quantidade || 0 });
});

// ========== ROTAS API - EVENTOS ==========
app.get('/api/eventos', (req, res) => {
  try {
    const eventos = readDataFile('eventos.json', []);
    res.json(eventos);
  } catch (error) {
    console.error('Erro ao ler eventos:', error);
    res.status(500).json({ error: 'Erro ao carregar eventos' });
  }
});

app.post('/api/eventos', (req, res) => {
  try {
    const eventos = req.body;
    console.log('[API] POST /api/eventos - Salvando eventos:', Array.isArray(eventos) ? eventos.length : 'não é array');
    if (writeDataFile('eventos.json', eventos)) {
      console.log('[API] ✅ Eventos salvos com sucesso');
      res.json({ success: true, message: 'Eventos atualizados com sucesso' });
    } else {
      console.error('[API] ❌ Erro ao escrever arquivo eventos.json');
      res.status(500).json({ success: false, message: 'Erro ao salvar eventos' });
    }
  } catch (error) {
    console.error('[API] ❌ Erro ao salvar eventos:', error);
    res.status(500).json({ success: false, message: 'Erro ao salvar eventos: ' + error.message });
  }
});

app.post('/api/estoque/reduzir', (req, res) => {
  const { produtoNome, quantidade } = req.body;
  const estoque = readDataFile('estoque.json', { geladeiras: [], cameraFria: [] });
  
  const produto = estoque.geladeiras.find(p => 
    p && p.nome && p.nome.toLowerCase() === produtoNome.toLowerCase()
  );
  
  if (!produto) {
    return res.status(404).json({ success: false, message: 'Produto não encontrado' });
  }
  
  if (produto.quantidade < quantidade) {
    return res.status(400).json({ success: false, message: 'Estoque insuficiente' });
  }
  
  produto.quantidade -= quantidade;
  produto.updatedAt = new Date().toISOString();
  
  // Registrar no histórico
  const historico = readDataFile('estoque-historico.json', []);
  historico.unshift({
    id: Date.now(),
    data: new Date().toISOString(),
    tipo: 'saida',
    local: 'geladeiras',
    produtoId: produto.id,
    produtoNome: produto.nome,
    quantidade: quantidade,
    valorUnitario: produto.valorUnitario || 0,
    total: quantidade * (produto.valorUnitario || 0),
    observacao: 'Venda realizada'
  });
  
  // Manter apenas últimos 1000 registros
  if (historico.length > 1000) {
    historico.splice(1000);
  }
  
  if (writeDataFile('estoque.json', estoque) && writeDataFile('estoque-historico.json', historico)) {
    res.json({ success: true, produto });
  } else {
    res.status(500).json({ success: false, message: 'Erro ao atualizar estoque' });
  }
});

// ========== ROTAS API - RELATÓRIOS E CONTROLE ==========

// Rota para dashboard/estatísticas gerais
app.get('/api/controle/dashboard', (req, res) => {
  console.log('[API] GET /api/controle/dashboard - Requisição recebida');
  try {
    const cartoes = readDataFile('cartoes.json', []);
    const transacoes = readDataFile('cartoes-transacoes.json', []);
    const eventos = readDataFile('eventos.json', []);
    const estoqueRaw = readDataFile('estoque.json', []);
    
    // Estoque pode ser um objeto { geladeiras: [], cameraFria: [] } ou um array []
    let estoque = [];
    if (Array.isArray(estoqueRaw)) {
      estoque = estoqueRaw;
    } else if (estoqueRaw && typeof estoqueRaw === 'object') {
      // Se for objeto, pegar todos os itens de todas as categorias
      estoque = [];
      if (estoqueRaw.geladeiras && Array.isArray(estoqueRaw.geladeiras)) {
        estoque = estoque.concat(estoqueRaw.geladeiras);
      }
      if (estoqueRaw.cameraFria && Array.isArray(estoqueRaw.cameraFria)) {
        estoque = estoque.concat(estoqueRaw.cameraFria);
      }
    }
    
    console.log('[API] Dados carregados:', {
      cartoes: cartoes.length,
      transacoes: transacoes.length,
      eventos: eventos.length,
      estoque: estoque.length
    });
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    // Estatísticas de cartões
    const cartoesAtivos = cartoes.filter(c => c.ativo).length;
    const saldoTotal = cartoes.reduce((sum, c) => sum + (parseFloat(c.saldo) || 0), 0);
    const saldoMedio = cartoes.length > 0 ? saldoTotal / cartoes.length : 0;
    
    // Estatísticas de transações
    const transacoesHoje = transacoes.filter(t => {
      const data = new Date(t.data);
      return data >= hoje;
    });
    const transacoesMes = transacoes.filter(t => {
      const data = new Date(t.data);
      return data >= inicioMes;
    });
    const vendasHoje = transacoesHoje
      .filter(t => t.tipo === 'compra')
      .reduce((sum, t) => sum + (parseFloat(t.valor) || 0), 0);
    const vendasMes = transacoesMes
      .filter(t => t.tipo === 'compra')
      .reduce((sum, t) => sum + (parseFloat(t.valor) || 0), 0);
    
    // Estatísticas de eventos
    // Eventos ativos são aqueles que não foram finalizados
    console.log('[API] Verificando eventos ativos...');
    eventos.forEach(e => {
      console.log(`[API] Evento: ${e.nome}, finalizado: ${JSON.stringify(e.finalizado)}, tipo: ${typeof e.finalizado}`);
    });
    const eventosAtivos = eventos.filter(e => {
      const finalizado = e.finalizado;
      const isAtivo = finalizado === false || 
                      finalizado === null || 
                      finalizado === undefined || 
                      finalizado === 'false' ||
                      finalizado === 0;
      console.log(`[API] Evento ${e.nome}: finalizado=${JSON.stringify(finalizado)}, isAtivo=${isAtivo}`);
      return isAtivo;
    }).length;
    console.log(`[API] Total de eventos ativos: ${eventosAtivos} de ${eventos.length}`);
    
    // Estatísticas de estoque
    const itensEstoque = estoque.length;
    const estoqueBaixo = estoque.filter(e => parseFloat(e.quantidade || 0) < 10).length;
    
    // Estatísticas de ingressos (bilheteria)
    let ingressos = readDataFile('bilheteria-ingressos.json', []);
    console.log(`[API] Total de ingressos carregados: ${ingressos.length}`);
    
    // Migrar ingressos antigos: adicionar dataVendaDate se não existir
    let ingressosAtualizados = false;
    ingressos = ingressos.map(i => {
      if (!i.dataVendaDate && i.dataVenda) {
        ingressosAtualizados = true;
        i.dataVendaDate = i.dataVenda.split('T')[0];
      }
      return i;
    });
    
    // Salvar se houver atualizações
    if (ingressosAtualizados) {
      writeDataFile('bilheteria-ingressos.json', ingressos);
      console.log(`[API] Ingressos migrados: adicionado campo dataVendaDate`);
    }
    
    if (ingressos.length > 0) {
      console.log(`[API] Primeiro ingresso exemplo:`, {
        id: ingressos[0].id,
        dataVenda: ingressos[0].dataVenda,
        dataVendaDate: ingressos[0].dataVendaDate,
        valor: ingressos[0].valor
      });
    }
    
    // Criar data de hoje sem hora (00:00:00)
    const hojeInicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    hojeInicio.setHours(0, 0, 0, 0);
    const hojeFim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    hojeFim.setHours(23, 59, 59, 999);
    
    console.log(`[API] Data de hoje (início): ${hojeInicio.toISOString()}`);
    console.log(`[API] Data de hoje (fim): ${hojeFim.toISOString()}`);
    console.log(`[API] Início do mês: ${inicioMes.toISOString()}`);
    
    // Obter data de hoje como string YYYY-MM-DD para comparação (usando UTC para consistência)
    const agora = new Date();
    const hojeStr = agora.toISOString().split('T')[0];
    console.log(`[API] Data de hoje (string): ${hojeStr}`);
    console.log(`[API] Data/hora atual: ${agora.toISOString()}`);
    
    const ingressosHoje = ingressos.filter(i => {
      // Usar dataVendaDate se existir, senão extrair de dataVenda
      let dataIngressoStr = null;
      
      if (i.dataVendaDate) {
        dataIngressoStr = i.dataVendaDate;
      } else if (i.dataVenda) {
        try {
          dataIngressoStr = i.dataVenda.split('T')[0];
        } catch (e) {
          console.error(`[API] Erro ao extrair data do ingresso ${i.id}:`, e);
          return false;
        }
      }
      
      if (!dataIngressoStr) {
        console.log(`[API] Ingresso ${i.id} sem data válida`);
        return false;
      }
      
      const isHoje = dataIngressoStr === hojeStr;
      if (isHoje) {
        console.log(`[API] ✅ Ingresso ${i.id} é de hoje: ${dataIngressoStr} (valor: ${i.valor})`);
      }
      return isHoje;
    });
    
    const inicioMesStr = inicioMes.toISOString().split('T')[0];
    console.log(`[API] Início do mês (string): ${inicioMesStr}`);
    
    const ingressosMes = ingressos.filter(i => {
      // Usar dataVendaDate se existir, senão extrair de dataVenda
      let dataIngressoStr = null;
      
      if (i.dataVendaDate) {
        dataIngressoStr = i.dataVendaDate;
      } else if (i.dataVenda) {
        try {
          dataIngressoStr = i.dataVenda.split('T')[0];
        } catch (e) {
          return false;
        }
      }
      
      if (!dataIngressoStr) return false;
      
      // Comparar strings YYYY-MM-DD
      return dataIngressoStr >= inicioMesStr;
    });
    
    console.log(`[API] Ingressos hoje: ${ingressosHoje.length}, Ingressos mês: ${ingressosMes.length}`);
    
    const valorIngressosHoje = ingressosHoje.reduce((sum, i) => {
      const valor = parseFloat(i.valor) || 0;
      console.log(`[API] Ingresso ${i.id}: valor = ${valor}`);
      return sum + valor;
    }, 0);
    const valorIngressosMes = ingressosMes.reduce((sum, i) => sum + (parseFloat(i.valor) || 0), 0);
    
    console.log(`[API] Valor ingressos hoje: R$ ${valorIngressosHoje.toFixed(2)}, Valor ingressos mês: R$ ${valorIngressosMes.toFixed(2)}`);
    
    const resultado = {
      cartoes: {
        total: cartoes.length,
        ativos: cartoesAtivos
      },
      saldo: {
        total: saldoTotal,
        medio: saldoMedio
      },
      vendas: {
        hoje: vendasHoje,
        mes: vendasMes
      },
      transacoes: {
        hoje: transacoesHoje.length,
        mes: transacoesMes.length
      },
      eventos: {
        ativos: eventosAtivos,
        total: eventos.length
      },
      estoque: {
        itens: itensEstoque,
        baixo: estoqueBaixo
      },
      ingressos: {
        hoje: {
          quantidade: ingressosHoje.length || 0,
          valor: valorIngressosHoje || 0
        },
        mes: {
          quantidade: ingressosMes.length || 0,
          valor: valorIngressosMes || 0
        },
        total: ingressos.length || 0
      }
    };
    
    console.log('[API] Dashboard gerado com sucesso');
    res.json(resultado);
  } catch (error) {
    console.error('[API] Erro ao gerar dashboard:', error);
    res.status(500).json({ success: false, message: 'Erro ao gerar dashboard: ' + error.message });
  }
});

// Rota para logs de atividades
app.get('/api/controle/logs', (req, res) => {
  console.log('[API] GET /api/controle/logs - Requisição recebida');
  try {
    const transacoes = readDataFile('cartoes-transacoes.json', []);
    const eventos = readDataFile('eventos.json', []);
    const estoqueHistorico = readDataFile('estoque-historico.json', []);
    
    const logs = [];
    
    // Logs de transações
    transacoes.slice(0, 100).forEach(t => {
      logs.push({
        time: t.data,
        type: t.tipo === 'compra' ? 'info' : t.tipo === 'recarga' ? 'success' : 'warning',
        message: `${t.tipo === 'compra' ? 'Compra' : t.tipo === 'recarga' ? 'Recarga' : 'Estorno'} no cartão ${t.cartaoNumero || t.cartaoId} - ${t.descricao || 'Sem descrição'} - Valor: R$ ${parseFloat(t.valor || 0).toFixed(2)}`
      });
    });
    
    // Logs de eventos
    eventos.slice(0, 50).forEach(e => {
      const isFinalizado = e.finalizado === true || e.finalizado === 'true';
      logs.push({
        time: e.dataCriacao || e.created_at || e.data || new Date().toISOString(),
        type: isFinalizado ? 'success' : 'info',
        message: `Evento "${e.nome || 'Sem nome'}" - ${isFinalizado ? 'Finalizado' : 'Ativo'}`
      });
    });
    
    // Logs de estoque
    estoqueHistorico.slice(0, 50).forEach(h => {
      logs.push({
        time: h.data || h.timestamp || new Date().toISOString(),
        type: parseFloat(h.quantidadeAnterior || 0) > parseFloat(h.quantidade || 0) ? 'warning' : 'success',
        message: `Estoque: ${h.produtoNome || h.produto} - ${h.tipo || 'Movimentação'} - Quantidade: ${h.quantidade || 0}`
      });
    });
    
    // Ordenar por data (mais recente primeiro)
    logs.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    // Limitar a 200 logs
    res.json(logs.slice(0, 200));
  } catch (error) {
    console.error('[API] Erro ao buscar logs:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar logs' });
  }
});

// Rota para relatório de cartões
app.get('/api/controle/relatorio/cartoes', (req, res) => {
  try {
    const cartoes = readDataFile('cartoes.json', []);
    const transacoes = readDataFile('cartoes-transacoes.json', []);
    
    const relatorio = cartoes.map(cartao => {
      const transacoesCartao = transacoes.filter(t => {
        const tId = typeof t.cartaoId === 'string' ? parseInt(t.cartaoId, 10) : t.cartaoId;
        const cId = typeof cartao.id === 'string' ? parseInt(cartao.id, 10) : cartao.id;
        return tId === cId;
      });
      
      const ultimaTransacao = transacoesCartao.length > 0 
        ? transacoesCartao.sort((a, b) => new Date(b.data) - new Date(a.data))[0]
        : null;
      
      return {
        numero: cartao.numero,
        nome: cartao.nome,
        saldo: parseFloat(cartao.saldo || 0),
        status: cartao.ativo ? 'Ativo' : 'Inativo',
        transacoes: transacoesCartao.length,
        ultimaAtividade: ultimaTransacao ? ultimaTransacao.data : null
      };
    });
    
    res.json(relatorio);
  } catch (error) {
    console.error('[API] Erro ao gerar relatório de cartões:', error);
    res.status(500).json({ success: false, message: 'Erro ao gerar relatório' });
  }
});

// Rota para relatório de vendas
app.get('/api/controle/relatorio/vendas', (req, res) => {
  try {
    const transacoes = readDataFile('cartoes-transacoes.json', []);
    const cartoes = readDataFile('cartoes.json', []);
    
    const vendas = transacoes
      .filter(t => t.tipo === 'compra')
      .map(t => {
        const cartao = cartoes.find(c => {
          const cId = typeof c.id === 'string' ? parseInt(c.id, 10) : c.id;
          const tId = typeof t.cartaoId === 'string' ? parseInt(t.cartaoId, 10) : t.cartaoId;
          return cId === tId;
        });
        
        return {
          data: t.data,
          cartao: cartao ? cartao.numero : t.cartaoNumero || t.cartaoId,
          valor: parseFloat(t.valor || 0),
          itens: t.itens ? t.itens.map(i => `${i.quantidade}x ${i.produtoNome || i.nome || 'Item'}`).join(', ') : 'Sem detalhes',
          tipo: 'Compra'
        };
      })
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .slice(0, 500); // Últimas 500 vendas
    
    res.json(vendas);
  } catch (error) {
    console.error('[API] Erro ao gerar relatório de vendas:', error);
    res.status(500).json({ success: false, message: 'Erro ao gerar relatório' });
  }
});

// Rota para relatório de estoque
app.get('/api/controle/relatorio/estoque', (req, res) => {
  try {
    const estoqueRaw = readDataFile('estoque.json', []);
    const historico = readDataFile('estoque-historico.json', []);
    
    // Estoque pode ser um objeto { geladeiras: [], cameraFria: [] } ou um array []
    let estoque = [];
    if (Array.isArray(estoqueRaw)) {
      estoque = estoqueRaw;
    } else if (estoqueRaw && typeof estoqueRaw === 'object') {
      // Se for objeto, pegar todos os itens de todas as categorias
      estoque = [];
      if (estoqueRaw.geladeiras && Array.isArray(estoqueRaw.geladeiras)) {
        estoque = estoque.concat(estoqueRaw.geladeiras);
      }
      if (estoqueRaw.cameraFria && Array.isArray(estoqueRaw.cameraFria)) {
        estoque = estoque.concat(estoqueRaw.cameraFria);
      }
    }
    
    const relatorio = estoque.map(item => {
      const movimentacoes = historico.filter(h => 
        (h.produtoNome || h.produto) === item.nome
      );
      const ultimaMovimentacao = movimentacoes.length > 0
        ? movimentacoes.sort((a, b) => new Date(b.data || b.timestamp || 0) - new Date(a.data || a.timestamp || 0))[0]
        : null;
      
      const quantidade = parseFloat(item.quantidade || 0);
      let status = 'Normal';
      if (quantidade === 0) status = 'Esgotado';
      else if (quantidade < 10) status = 'Baixo';
      
      return {
        produto: item.nome,
        quantidade: quantidade,
        status: status,
        ultimaMovimentacao: ultimaMovimentacao ? (ultimaMovimentacao.data || ultimaMovimentacao.timestamp) : null
      };
    });
    
    res.json(relatorio);
  } catch (error) {
    console.error('[API] Erro ao gerar relatório de estoque:', error);
    res.status(500).json({ success: false, message: 'Erro ao gerar relatório' });
  }
});

// Rota para relatório de eventos
app.get('/api/controle/relatorio/eventos', (req, res) => {
  console.log('[API] GET /api/controle/relatorio/eventos - Requisição recebida');
  try {
    const eventos = readDataFile('eventos.json', []);
    console.log('[API] Eventos carregados:', eventos.length);
    
    const relatorio = eventos.map(evento => {
      // Eventos usam 'itens' e não 'bebidas'
      const itens = evento.itens || [];
      console.log(`[API] Processando evento: ${evento.nome}, finalizado: ${evento.finalizado}, itens: ${itens.length}`);
      
      // Calcular total de itens (soma das quantidades iniciais)
      const totalItens = itens.reduce((sum, item) => {
        const qtd = parseInt(item.quantidadeInicial || 0);
        return sum + qtd;
      }, 0);
      console.log(`[API] Total de itens para ${evento.nome}: ${totalItens}`);
      
      // Calcular consumo total
      const consumoTotal = itens.reduce((sum, item) => {
        let consumido = 0;
        
        // Verificar se o evento foi finalizado
        const isFinalizado = evento.finalizado === true;
        console.log(`[API] Evento ${evento.nome} - finalizado: ${isFinalizado}, quantidadeConsumida: ${item.quantidadeConsumida}`);
        
        if (isFinalizado) {
          // Se tem quantidadeConsumida, usar ela
          if (item.quantidadeConsumida !== undefined && item.quantidadeConsumida !== null) {
            consumido = parseInt(item.quantidadeConsumida || 0);
          } else {
            // Calcular consumo: quantidade inicial + reposições - quantidade física restante
            const inicial = parseInt(item.quantidadeInicial || 0);
            const reposicoes = (item.reposicoes || []).reduce((rSum, rep) => rSum + parseInt(rep.quantidade || 0), 0);
            const fisicaRestante = parseInt(item.quantidadeFisicaRestante || 0);
            consumido = (inicial + reposicoes) - fisicaRestante;
            // Garantir que não seja negativo
            if (consumido < 0) consumido = 0;
          }
        }
        
        return sum + consumido;
      }, 0);
      console.log(`[API] Consumo total para ${evento.nome}: ${consumoTotal}`);
      
      // Determinar status baseado no campo 'finalizado'
      let status = 'Ativo';
      if (evento.finalizado === true) {
        status = 'Finalizado';
      }
      console.log(`[API] Status para ${evento.nome}: ${status}`);
      
      return {
        nome: evento.nome || 'Sem nome',
        data: evento.dataCriacao || evento.created_at || evento.data || new Date().toISOString(),
        status: status,
        bebidas: totalItens,
        consumo: consumoTotal
      };
    }).sort((a, b) => new Date(b.data) - new Date(a.data));
    
    console.log('[API] Relatório de eventos gerado:', JSON.stringify(relatorio, null, 2));
    res.json(relatorio);
  } catch (error) {
    console.error('[API] Erro ao gerar relatório de eventos:', error);
    res.status(500).json({ success: false, message: 'Erro ao gerar relatório: ' + error.message });
  }
});

// ========== ROTAS API - BILHETERIA ==========

// Rota para obter configurações da bilheteria
app.get('/api/bilheteria/config', (req, res) => {
  try {
    const config = readDataFile('bilheteria-config.json', {
      precoNormal: 20.00,
      precoMeio: 10.00,
      precoPassaporte: 50.00
    });
    res.json(config);
  } catch (error) {
    console.error('[API] Erro ao buscar configurações da bilheteria:', error);
    res.json({
      precoNormal: 20.00,
      precoMeio: 10.00,
      precoPassaporte: 50.00
    });
  }
});

// Rota para salvar configurações da bilheteria
app.post('/api/bilheteria/config', (req, res) => {
  try {
    const { precoNormal, precoMeio, precoPassaporte } = req.body;
    const config = {
      precoNormal: parseFloat(precoNormal || 20),
      precoMeio: parseFloat(precoMeio || 10),
      precoPassaporte: parseFloat(precoPassaporte || 50)
    };
    
    if (writeDataFile('bilheteria-config.json', config)) {
      res.json({ success: true, config });
    } else {
      res.status(500).json({ success: false, message: 'Erro ao salvar configurações' });
    }
  } catch (error) {
    console.error('[API] Erro ao salvar configurações:', error);
    res.status(500).json({ success: false, message: 'Erro ao salvar configurações' });
  }
});

// Rota para processar pagamento
app.post('/api/bilheteria/processar-pagamento', async (req, res) => {
  try {
    const { valor, tipos, formaPagamento } = req.body;
    
    if (!valor || valor <= 0) {
      return res.status(400).json({ success: false, message: 'Valor inválido' });
    }
    
    if (!formaPagamento || !['dinheiro', 'pix', 'credito', 'debito'].includes(formaPagamento)) {
      return res.status(400).json({ success: false, message: 'Forma de pagamento inválida' });
    }
    
    const formaNome = {
      dinheiro: 'Dinheiro',
      pix: 'PIX',
      credito: 'Cartão de Crédito',
      debito: 'Cartão de Débito'
    };
    
    console.log(`[Pagamento] Processando ${formaNome[formaPagamento]} de R$ ${valor.toFixed(2)}`);
    
    // Processar conforme a forma de pagamento
    if (formaPagamento === 'dinheiro') {
      // Dinheiro: aprovação imediata (confirmação manual)
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`[Pagamento] ✅ Pagamento em dinheiro confirmado: R$ ${valor.toFixed(2)}`);
      res.json({
        success: true,
        message: 'Pagamento em dinheiro confirmado',
        valor: valor,
        formaPagamento: formaPagamento,
        transacaoId: `DIN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        data: new Date().toISOString()
      });
      
    } else if (formaPagamento === 'pix') {
      // PIX: simular confirmação (normalmente seria via webhook da API do PIX)
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
      // PIX geralmente é aprovado rapidamente
      const aprovado = Math.random() > 0.02; // 98% de aprovação
      
      if (aprovado) {
        console.log(`[Pagamento] ✅ Pagamento PIX confirmado: R$ ${valor.toFixed(2)}`);
        res.json({
          success: true,
          message: 'Pagamento PIX confirmado',
          valor: valor,
          formaPagamento: formaPagamento,
          transacaoId: `PIX${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          data: new Date().toISOString()
        });
      } else {
        console.log(`[Pagamento] ❌ Pagamento PIX não confirmado: R$ ${valor.toFixed(2)}`);
        res.json({
          success: false,
          message: 'Pagamento PIX não confirmado. Verifique o status da transação.',
          valor: valor
        });
      }
      
    } else if (formaPagamento === 'credito' || formaPagamento === 'debito') {
      // Cartão: simular comunicação com maquininha
      // NOTA: Esta é uma simulação. Para integração real, você precisará:
      // 1. Instalar o SDK da maquininha (ex: Stone, PagSeguro, GetNet, etc)
      // 2. Configurar a conexão (USB, Serial, ou Rede)
      // 3. Enviar comandos específicos da maquininha
      
      // Exemplo de integração genérica (substitua pela biblioteca real):
      /*
      const maquininha = require('maquininha-sdk'); // Substitua pelo SDK real
      const resultado = await maquininha.processarPagamento({
        valor: valor,
        tipo: formaPagamento === 'credito' ? 'credito' : 'debito',
        parcelas: 1
      });
      */
      
      // Simulação: aguardar resposta da maquininha (2-5 segundos)
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      
      // Simulação: 95% de aprovação (para testes)
      const aprovado = Math.random() > 0.05;
      
      if (aprovado) {
        console.log(`[Pagamento] ✅ Pagamento no ${formaNome[formaPagamento]} aprovado: R$ ${valor.toFixed(2)}`);
        res.json({
          success: true,
          message: `Pagamento no ${formaNome[formaPagamento]} aprovado`,
          valor: valor,
          formaPagamento: formaPagamento,
          transacaoId: `${formaPagamento.toUpperCase()}${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          data: new Date().toISOString()
        });
      } else {
        console.log(`[Pagamento] ❌ Pagamento no ${formaNome[formaPagamento]} negado: R$ ${valor.toFixed(2)}`);
        res.json({
          success: false,
          message: `Pagamento no ${formaNome[formaPagamento]} negado. Tente novamente ou use outro cartão.`,
          valor: valor
        });
      }
    }
  } catch (error) {
    console.error('[API] Erro ao processar pagamento:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao processar pagamento: ' + error.message 
    });
  }
});

// Rota para vender ingressos
app.post('/api/bilheteria/vender', (req, res) => {
  console.log('[API] POST /api/bilheteria/vender - Requisição recebida');
  console.log('[API] Body:', req.body);
  try {
    const { tipo, quantidade } = req.body;
    
    if (!tipo || !['normal', 'meio', 'passaporte'].includes(tipo)) {
      return res.status(400).json({ success: false, message: 'Tipo de ingresso inválido' });
    }
    
    if (!quantidade || quantidade < 1) {
      return res.status(400).json({ success: false, message: 'Quantidade inválida' });
    }
    
    const config = readDataFile('bilheteria-config.json', {
      precoNormal: 20.00,
      precoMeio: 10.00,
      precoPassaporte: 50.00
    });
    
    let preco = 0;
    if (tipo === 'normal') {
      preco = parseFloat(config.precoNormal || 20);
    } else if (tipo === 'meio') {
      preco = parseFloat(config.precoMeio || 10);
    } else if (tipo === 'passaporte') {
      preco = parseFloat(config.precoPassaporte || 50);
    }
    
    const ingressos = readDataFile('bilheteria-ingressos.json', []);
    const novosIngressos = [];
    
    const agora = new Date();
    const dataVendaISO = agora.toISOString();
    const dataVendaDate = agora.toISOString().split('T')[0]; // YYYY-MM-DD
    
    for (let i = 0; i < quantidade; i++) {
      const codigo = `ING${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      novosIngressos.push({
        id: Date.now() + i,
        codigo: codigo,
        tipo: tipo,
        valor: preco,
        dataVenda: dataVendaISO,
        dataVendaDate: dataVendaDate, // Campo adicional para facilitar comparação
        liberado: false,
        dataLiberacao: null
      });
    }
    
    ingressos.push(...novosIngressos);
    
    // Manter apenas últimos 10000 ingressos
    if (ingressos.length > 10000) {
      ingressos.splice(0, ingressos.length - 10000);
    }
    
    if (writeDataFile('bilheteria-ingressos.json', ingressos)) {
      res.json({ 
        success: true, 
        ingressos: novosIngressos,
        total: preco * quantidade
      });
    } else {
      res.status(500).json({ success: false, message: 'Erro ao salvar ingressos' });
    }
  } catch (error) {
    console.error('[API] Erro ao vender ingressos:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar venda: ' + error.message });
  }
});

// Rota para listar ingressos vendidos
app.get('/api/bilheteria/ingressos', (req, res) => {
  try {
    const ingressos = readDataFile('bilheteria-ingressos.json', []);
    // Ordenar por data (mais recente primeiro)
    ingressos.sort((a, b) => new Date(b.dataVenda) - new Date(a.dataVenda));
    // Retornar últimos 100
    res.json(ingressos.slice(0, 100));
  } catch (error) {
    console.error('[API] Erro ao buscar ingressos:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar ingressos' });
  }
});

// Rota para liberar entrada
app.post('/api/bilheteria/liberar', (req, res) => {
  try {
    const { codigo } = req.body;
    
    if (!codigo) {
      return res.status(400).json({ success: false, message: 'Código do ingresso não informado' });
    }
    
    const ingressos = readDataFile('bilheteria-ingressos.json', []);
    const ingresso = ingressos.find(i => i.codigo === codigo.toUpperCase());
    
    if (!ingresso) {
      return res.status(404).json({ success: false, message: 'Ingresso não encontrado' });
    }
    
    if (ingresso.liberado) {
      return res.status(400).json({ success: false, message: 'Ingresso já foi utilizado' });
    }
    
    ingresso.liberado = true;
    ingresso.dataLiberacao = new Date().toISOString();
    
    if (writeDataFile('bilheteria-ingressos.json', ingressos)) {
      res.json({ success: true, ingresso });
    } else {
      res.status(500).json({ success: false, message: 'Erro ao atualizar ingresso' });
    }
  } catch (error) {
    console.error('[API] Erro ao liberar entrada:', error);
    res.status(500).json({ success: false, message: 'Erro ao liberar entrada: ' + error.message });
  }
});

// Rota para servir index.html em qualquer rota não-API
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`API disponível em http://localhost:${PORT}/api`);
  console.log('Rotas disponíveis:');
  console.log('  GET  /api/menu');
  console.log('  POST /api/menu');
  console.log('  GET  /api/cartoes');
  console.log('  POST /api/cartoes');
  console.log('  GET  /api/estoque');
  console.log('  POST /api/estoque');
  console.log('  GET  /api/eventos');
  console.log('  POST /api/eventos');
});

