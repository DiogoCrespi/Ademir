const express = require('express');
const { readDataFile, writeDataFile } = require('../dataStore');

const router = express.Router();

// GET /api/cartoes
router.get('/cartoes', (req, res) => {
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

// POST /api/cartoes
router.post('/cartoes', (req, res) => {
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

// GET /api/cartoes/:numero
router.get('/cartoes/:numero', (req, res) => {
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

// POST /api/cartoes/:id/debitar
router.post('/cartoes/:id/debitar', (req, res) => {
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

// POST /api/cartoes/:id/recarregar
router.post('/cartoes/:id/recarregar', (req, res) => {
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

// GET /api/cartoes/:id/transacoes
router.get('/cartoes/:id/transacoes', (req, res) => {
  try {
    const cartaoIdParam = req.params.id;
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

// POST /api/cartoes/:id/estornar
router.post('/cartoes/:id/estornar', (req, res) => {
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

module.exports = router;


