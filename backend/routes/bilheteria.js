const express = require('express');
const { readDataFile, writeDataFile } = require('../dataStore');

const router = express.Router();

// GET /api/bilheteria/config
router.get('/bilheteria/config', (req, res) => {
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

// POST /api/bilheteria/config
router.post('/bilheteria/config', (req, res) => {
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

// POST /api/bilheteria/processar-pagamento
router.post('/bilheteria/processar-pagamento', async (req, res) => {
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
    
    if (formaPagamento === 'dinheiro') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`[Pagamento] ✅ Pagamento em dinheiro confirmado: R$ ${valor.toFixed(2)}`);
      return res.json({
        success: true,
        message: 'Pagamento em dinheiro confirmado',
        valor: valor,
        formaPagamento: formaPagamento,
        transacaoId: `DIN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        data: new Date().toISOString()
      });
    }
    
    if (formaPagamento === 'pix') {
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
      const aprovado = Math.random() > 0.02; // 98% de aprovação
      
      if (aprovado) {
        console.log(`[Pagamento] ✅ Pagamento PIX confirmado: R$ ${valor.toFixed(2)}`);
        return res.json({
          success: true,
          message: 'Pagamento PIX confirmado',
          valor: valor,
          formaPagamento: formaPagamento,
          transacaoId: `PIX${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          data: new Date().toISOString()
        });
      }
      
      console.log(`[Pagamento] ❌ Pagamento PIX não confirmado: R$ ${valor.toFixed(2)}`);
      return res.json({
        success: false,
        message: 'Pagamento PIX não confirmado. Verifique o status da transação.',
        valor: valor
      });
    }
    
    // Cartão (crédito/débito) - simulação
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    const aprovado = Math.random() > 0.05;
    
    if (aprovado) {
      console.log(`[Pagamento] ✅ Pagamento no ${formaNome[formaPagamento]} aprovado: R$ ${valor.toFixed(2)}`);
      return res.json({
        success: true,
        message: `Pagamento no ${formaNome[formaPagamento]} aprovado`,
        valor: valor,
        formaPagamento: formaPagamento,
        transacaoId: `${formaPagamento.toUpperCase()}${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        data: new Date().toISOString()
      });
    }
    
    console.log(`[Pagamento] ❌ Pagamento no ${formaNome[formaPagamento]} negado: R$ ${valor.toFixed(2)}`);
    return res.json({
      success: false,
      message: `Pagamento no ${formaNome[formaPagamento]} negado. Tente novamente ou use outro cartão.`,
      valor: valor
    });
    
  } catch (error) {
    console.error('[API] Erro ao processar pagamento:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao processar pagamento: ' + error.message 
    });
  }
});

// POST /api/bilheteria/vender
router.post('/bilheteria/vender', (req, res) => {
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
        dataVendaDate: dataVendaDate,
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

// GET /api/bilheteria/ingressos
router.get('/bilheteria/ingressos', (req, res) => {
  try {
    const ingressos = readDataFile('bilheteria-ingressos.json', []);
    ingressos.sort((a, b) => new Date(b.dataVenda) - new Date(a.dataVenda));
    res.json(ingressos.slice(0, 100));
  } catch (error) {
    console.error('[API] Erro ao buscar ingressos:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar ingressos' });
  }
});

// POST /api/bilheteria/liberar
router.post('/bilheteria/liberar', (req, res) => {
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

module.exports = router;


