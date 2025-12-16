const { Cartao, Transacao, Evento, ProdutoEstoque, Ingresso, MovimentacaoEstoque } = require('../models')
const { Op } = require('sequelize')
const { Sequelize } = require('sequelize')

class ControleService {
  async getDashboard() {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

    // Cartões
    const cartoes = await Cartao.findAll()
    const cartoesAtivos = cartoes.filter(c => c.ativo).length
    const saldoTotal = cartoes.reduce((sum, c) => sum + parseFloat(c.saldo), 0)
    const saldoMedio = cartoes.length > 0 ? saldoTotal / cartoes.length : 0

    // Transações
    const transacoes = await Transacao.findAll({
      order: [['created_at', 'DESC']]
    })

    const transacoesHoje = transacoes.filter(t => {
      const data = new Date(t.created_at)
      return data >= hoje
    })

    const transacoesMes = transacoes.filter(t => {
      const data = new Date(t.created_at)
      return data >= inicioMes
    })

    const vendasHoje = transacoesHoje
      .filter(t => t.tipo === 'compra')
      .reduce((sum, t) => sum + parseFloat(t.valor), 0)

    const vendasMes = transacoesMes
      .filter(t => t.tipo === 'compra')
      .reduce((sum, t) => sum + parseFloat(t.valor), 0)

    // Eventos
    const eventos = await Evento.findAll()
    const eventosAtivos = eventos.filter(e => {
      const finalizado = e.finalizado
      return finalizado === false ||
             finalizado === null ||
             finalizado === undefined ||
             finalizado === 'false' ||
             finalizado === 0
    }).length

    // Estoque
    const produtos = await ProdutoEstoque.findAll()
    const itensEstoque = produtos.length
    const estoqueBaixo = produtos.filter(p => parseFloat(p.quantidade) < 10).length

    // Ingressos
    const hojeStr = new Date().toISOString().split('T')[0]
    const inicioMesStr = inicioMes.toISOString().split('T')[0]

    const ingressos = await Ingresso.findAll()

    const ingressosHoje = ingressos.filter(i => {
      const dataStr = i.data_venda_date || i.data_venda.toISOString().split('T')[0]
      return dataStr === hojeStr
    })

    const ingressosMes = ingressos.filter(i => {
      const dataStr = i.data_venda_date || i.data_venda.toISOString().split('T')[0]
      return dataStr >= inicioMesStr
    })

    const valorIngressosHoje = ingressosHoje.reduce((sum, i) =>
      sum + parseFloat(i.valor), 0
    )

    const valorIngressosMes = ingressosMes.reduce((sum, i) =>
      sum + parseFloat(i.valor), 0
    )

    return {
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
    }
  }

  async getLogs() {
    const transacoes = await Transacao.findAll({
      order: [['created_at', 'DESC']],
      limit: 100
    })

    const eventos = await Evento.findAll({
      order: [['data_criacao', 'DESC']],
      limit: 50
    })

    const movimentacoes = await MovimentacaoEstoque.findAll({
      order: [['created_at', 'DESC']],
      limit: 50
    })

    const logs = []

    transacoes.forEach(t => {
      logs.push({
        time: t.created_at,
        type: t.tipo === 'compra' ? 'info' : t.tipo === 'recarga' ? 'success' : 'warning',
        message: `${t.tipo === 'compra' ? 'Compra' : t.tipo === 'recarga' ? 'Recarga' : 'Estorno'} no cartão ${t.cartao_numero || t.cartao_id} - ${t.descricao || 'Sem descrição'} - Valor: R$ ${parseFloat(t.valor || 0).toFixed(2)}`
      })
    })

    eventos.forEach(e => {
      const isFinalizado = e.finalizado === true
      logs.push({
        time: e.data_criacao || new Date().toISOString(),
        type: isFinalizado ? 'success' : 'info',
        message: `Evento "${e.nome || 'Sem nome'}" - ${isFinalizado ? 'Finalizado' : 'Ativo'}`
      })
    })

    movimentacoes.forEach(m => {
      logs.push({
        time: m.created_at || new Date().toISOString(),
        type: m.tipo === 'saida' ? 'warning' : 'success',
        message: `Estoque: ${m.produto_nome} - ${m.tipo === 'saida' ? 'Saída' : 'Entrada'} - Quantidade: ${m.quantidade || 0}`
      })
    })

    logs.sort((a, b) => new Date(b.time) - new Date(a.time))

    return logs.slice(0, 200)
  }

  async getRelatorioCartoes() {
    const cartoes = await Cartao.findAll({
      include: [{
        model: Transacao,
        as: 'transacoes',
        required: false
      }]
    })

    return cartoes.map(cartao => {
      const transacoesCartao = cartao.transacoes || []
      const ultimaTransacao = transacoesCartao.length > 0
        ? transacoesCartao.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
        : null

      return {
        numero: cartao.numero,
        nome: cartao.nome,
        saldo: parseFloat(cartao.saldo || 0),
        status: cartao.ativo ? 'Ativo' : 'Inativo',
        transacoes: transacoesCartao.length,
        ultimaAtividade: ultimaTransacao ? ultimaTransacao.created_at : null
      }
    })
  }

  async getRelatorioVendas() {
    const transacoes = await Transacao.findAll({
      where: { tipo: 'compra' },
      include: [{
        model: Cartao,
        as: 'cartao',
        required: false
      }],
      order: [['created_at', 'DESC']],
      limit: 500
    })

    return transacoes.map(t => ({
      data: t.created_at,
      cartao: t.cartao ? t.cartao.numero : t.cartao_numero || t.cartao_id,
      valor: parseFloat(t.valor || 0),
      itens: t.itens ? t.itens.map(i => `${i.quantidade}x ${i.produtoNome || i.nome || 'Item'}`).join(', ') : 'Sem detalhes',
      tipo: 'Compra'
    }))
  }

  async getRelatorioEstoque() {
    const produtos = await ProdutoEstoque.findAll({
      include: [{
        model: MovimentacaoEstoque,
        as: 'movimentacoes',
        required: false
      }]
    })

    return produtos.map(item => {
      const movimentacoes = item.movimentacoes || []
      const ultimaMovimentacao = movimentacoes.length > 0
        ? movimentacoes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
        : null

      const quantidade = parseFloat(item.quantidade || 0)
      let status = 'Normal'
      if (quantidade === 0) status = 'Esgotado'
      else if (quantidade < 10) status = 'Baixo'

      return {
        produto: item.nome,
        quantidade,
        status,
        ultimaMovimentacao: ultimaMovimentacao ? ultimaMovimentacao.created_at : null
      }
    })
  }

  async getRelatorioEventos() {
    const eventos = await Evento.findAll({
      order: [['data_criacao', 'DESC']]
    })

    return eventos.map(evento => {
      const itens = evento.itens || []

      const totalItens = itens.reduce((sum, item) => {
        const qtd = parseInt(item.quantidadeInicial || 0)
        return sum + qtd
      }, 0)

      const consumoTotal = itens.reduce((sum, item) => {
        let consumido = 0
        const isFinalizado = evento.finalizado === true

        if (isFinalizado) {
          if (item.quantidadeConsumida !== undefined && item.quantidadeConsumida !== null) {
            consumido = parseInt(item.quantidadeConsumida || 0)
          } else {
            const inicial = parseInt(item.quantidadeInicial || 0)
            const reposicoes = (item.reposicoes || []).reduce((rSum, rep) => rSum + parseInt(rep.quantidade || 0), 0)
            const fisicaRestante = parseInt(item.quantidadeFisicaRestante || 0)
            consumido = (inicial + reposicoes) - fisicaRestante
            if (consumido < 0) consumido = 0
          }
        }

        return sum + consumido
      }, 0)

      let status = 'Ativo'
      if (evento.finalizado === true) {
        status = 'Finalizado'
      }

      return {
        nome: evento.nome || 'Sem nome',
        data: evento.data_criacao || evento.data || new Date().toISOString(),
        status,
        bebidas: totalItens,
        consumo: consumoTotal
      }
    })
  }
}

module.exports = new ControleService()
