const express = require('express');
const { readDataFile, writeDataFile } = require('../dataStore');

const router = express.Router();

// GET /api/controle/dashboard
router.get('/controle/dashboard', (req, res) => {
  console.log('[API] GET /api/controle/dashboard - Requisição recebida');
  try {
    const cartoes = readDataFile('cartoes.json', []);
    const transacoes = readDataFile('cartoes-transacoes.json', []);
    const eventos = readDataFile('eventos.json', []);
    const estoqueRaw = readDataFile('estoque.json', []);
    
    let estoque = [];
    if (Array.isArray(estoqueRaw)) {
      estoque = estoqueRaw;
    } else if (estoqueRaw && typeof estoqueRaw === 'object') {
      if (estoqueRaw.geladeiras && Array.isArray(estoqueRaw.geladeiras)) {
        estoque = estoque.concat(estoqueRaw.geladeiras);
      }
      if (estoqueRaw.cameraFria && Array.isArray(estoqueRaw.cameraFria)) {
        estoque = estoque.concat(estoqueRaw.cameraFria);
      }
    }
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    const cartoesAtivos = cartoes.filter(c => c.ativo).length;
    const saldoTotal = cartoes.reduce((sum, c) => sum + (parseFloat(c.saldo) || 0), 0);
    const saldoMedio = cartoes.length > 0 ? saldoTotal / cartoes.length : 0;
    
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
    
    const eventosAtivos = eventos.filter(e => {
      const finalizado = e.finalizado;
      return finalizado === false || finalizado === null || finalizado === undefined || finalizado === 'false' || finalizado === 0;
    }).length;
    
    const itensEstoque = estoque.length;
    const estoqueBaixo = estoque.filter(e => parseFloat(e.quantidade || 0) < 10).length;
    
    let ingressos = readDataFile('bilheteria-ingressos.json', []);
    let ingressosAtualizados = false;
    ingressos = ingressos.map(i => {
      if (!i.dataVendaDate && i.dataVenda) {
        ingressosAtualizados = true;
        i.dataVendaDate = i.dataVenda.split('T')[0];
      }
      return i;
    });
    if (ingressosAtualizados) {
      writeDataFile('bilheteria-ingressos.json', ingressos);
    }
    
    const agora = new Date();
    const hojeStr = agora.toISOString().split('T')[0];
    const ingressosHoje = ingressos.filter(i => {
      const dataIngressoStr = i.dataVendaDate || (i.dataVenda ? i.dataVenda.split('T')[0] : null);
      return dataIngressoStr === hojeStr;
    });
    
    const inicioMesStr = inicioMes.toISOString().split('T')[0];
    const ingressosMes = ingressos.filter(i => {
      const dataIngressoStr = i.dataVendaDate || (i.dataVenda ? i.dataVenda.split('T')[0] : null);
      if (!dataIngressoStr) return false;
      return dataIngressoStr >= inicioMesStr;
    });
    
    const valorIngressosHoje = ingressosHoje.reduce((sum, i) => sum + (parseFloat(i.valor) || 0), 0);
    const valorIngressosMes = ingressosMes.reduce((sum, i) => sum + (parseFloat(i.valor) || 0), 0);
    
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
    
    res.json(resultado);
  } catch (error) {
    console.error('[API] Erro ao gerar dashboard:', error);
    res.status(500).json({ success: false, message: 'Erro ao gerar dashboard: ' + error.message });
  }
});

// GET /api/controle/logs
router.get('/controle/logs', (req, res) => {
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
        message: `Evento \"${e.nome || 'Sem nome'}\" - ${isFinalizado ? 'Finalizado' : 'Ativo'}`
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
    
    logs.sort((a, b) => new Date(b.time) - new Date(a.time));
    res.json(logs.slice(0, 200));
  } catch (error) {
    console.error('[API] Erro ao buscar logs:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar logs' });
  }
});

// GET /api/controle/relatorio/:tipo
router.get('/controle/relatorio/:tipo', (req, res) => {
  const tipo = req.params.tipo;
  try {
    if (tipo === 'cartoes') {
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
      
      return res.json(relatorio);
    }
    
    if (tipo === 'vendas') {
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
        .slice(0, 500);
      
      return res.json(vendas);
    }
    
    if (tipo === 'estoque') {
      const estoqueRaw = readDataFile('estoque.json', []);
      const historico = readDataFile('estoque-historico.json', []);
      
      let estoque = [];
      if (Array.isArray(estoqueRaw)) {
        estoque = estoqueRaw;
      } else if (estoqueRaw && typeof estoqueRaw === 'object') {
        if (estoqueRaw.geladeiras && Array.isArray(estoqueRaw.geladeiras)) {
          estoque = estoqueRaw.geladeiras;
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
      
      return res.json(relatorio);
    }
    
    if (tipo === 'eventos') {
      const eventos = readDataFile('eventos.json', []);
      
      const relatorio = eventos.map(evento => {
        const itens = evento.itens || [];
        
        const totalItens = itens.reduce((sum, item) => {
          const qtd = parseInt(item.quantidadeInicial || 0);
          return sum + qtd;
        }, 0);
        
        const consumoTotal = itens.reduce((sum, item) => {
          let consumido = 0;
          const isFinalizado = evento.finalizado === true;
          
          if (isFinalizado) {
            if (item.quantidadeConsumida !== undefined && item.quantidadeConsumida !== null) {
              consumido = parseInt(item.quantidadeConsumida || 0);
            } else {
              const inicial = parseInt(item.quantidadeInicial || 0);
              const reposicoes = (item.reposicoes || []).reduce((rSum, rep) => rSum + parseInt(rep.quantidade || 0), 0);
              const fisicaRestante = parseInt(item.quantidadeFisicaRestante || 0);
              consumido = (inicial + reposicoes) - fisicaRestante;
              if (consumido < 0) consumido = 0;
            }
          }
          
          return sum + consumido;
        }, 0);
        
        let status = 'Ativo';
        if (evento.finalizado === true) {
          status = 'Finalizado';
        }
        
        return {
          nome: evento.nome || 'Sem nome',
          data: evento.dataCriacao || evento.created_at || evento.data || new Date().toISOString(),
          status: status,
          bebidas: totalItens,
          consumo: consumoTotal
        };
      }).sort((a, b) => new Date(b.data) - new Date(a.data));
      
      return res.json(relatorio);
    }
    
    return res.status(400).json({ success: false, message: 'Tipo de relatório inválido' });
  } catch (error) {
    console.error('[API] Erro ao gerar relatório:', error);
    res.status(500).json({ success: false, message: 'Erro ao gerar relatório' });
  }
});

module.exports = router;


