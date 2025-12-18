const express = require('express');
const { readDataFile, writeDataFile } = require('../dataStore');

const router = express.Router();

router.get('/estoque', (req, res) => {
  try {
    const estoque = readDataFile('estoque.json', { geladeiras: [], cameraFria: [] });

    // Normalizar itens para incluir campos esperados pelo front
    const normalize = (arr, local) => (arr || []).map(item => ({
      ...item,
      local,
      estoqueMinimo: item.estoqueMinimo ?? 5,
      categoria: item.categoria ?? (local === 'geladeiras' ? 'Bebidas' : 'Alimentos'),
      valorUnitario: typeof item.valorUnitario === 'number'
        ? item.valorUnitario
        : parseFloat(item.valorUnitario || 0) || 0,
      quantidade: typeof item.quantidade === 'number'
        ? item.quantidade
        : parseFloat(item.quantidade || 0) || 0,
    }));

    res.json({
      geladeiras: normalize(estoque.geladeiras, 'geladeiras'),
      cameraFria: normalize(estoque.cameraFria, 'cameraFria'),
    });
  } catch (error) {
    console.error('Erro ao ler estoque:', error);
    res.status(500).json({ error: 'Erro ao carregar estoque' });
  }
});

router.post('/estoque', (req, res) => {
  const estoque = req.body;
  if (writeDataFile('estoque.json', estoque)) {
    res.json({ success: true, message: 'Estoque atualizado com sucesso' });
  } else {
    res.status(500).json({ success: false, message: 'Erro ao salvar estoque' });
  }
});

router.get('/estoque/historico', (req, res) => {
  try {
    const historico = readDataFile('estoque-historico.json', []);
    res.json(historico);
  } catch (error) {
    console.error('Erro ao ler histórico:', error);
    res.status(500).json({ error: 'Erro ao carregar histórico' });
  }
});

router.post('/estoque/historico', (req, res) => {
  const historico = req.body;
  if (writeDataFile('estoque-historico.json', historico)) {
    res.json({ success: true, message: 'Histórico atualizado com sucesso' });
  } else {
    res.status(500).json({ success: false, message: 'Erro ao salvar histórico' });
  }
});

router.get('/estoque/verificar/:produtoNome', (req, res) => {
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

router.post('/estoque/reduzir', (req, res) => {
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

module.exports = router;


