const { Cartao, Transacao } = require('../models')
const { Op } = require('sequelize')

class CartaoService {
  async getAllCartoes() {
    try {
      return await Cartao.findAll({
        order: [['created_at', 'DESC']]
      })
    } catch (error) {
      console.error('Erro ao buscar cartões do banco de dados:', error.message)
      return []
    }
  }

  async saveCartoes(cartoesData) {
    const transaction = await Cartao.sequelize.transaction()

    try {
      for (const cartaoData of cartoesData) {
        await Cartao.upsert({
          id: cartaoData.id,
          numero: String(cartaoData.numero),
          nome: cartaoData.nome,
          documento: cartaoData.documento || null,
          saldo: parseFloat(cartaoData.saldo) || 0,
          ativo: cartaoData.ativo === 1 || cartaoData.ativo === true || cartaoData.ativo === undefined
        }, { transaction })
      }

      await transaction.commit()
      return true
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async findCartaoByNumero(numero) {
    const numeroLimpo = numero.replace(/\s/g, '').trim()

    // Busca exata
    let cartao = await Cartao.findOne({
      where: {
        numero: numeroLimpo
      }
    })

    // Se não encontrar, busca pelos últimos 4 dígitos
    if (!cartao && numeroLimpo.length >= 4) {
      const ultimosDigitos = numeroLimpo.slice(-4)
      cartao = await Cartao.findOne({
        where: {
          numero: { [Op.like]: `%${ultimosDigitos}` }
        }
      })
    }

    return cartao
  }

  async debitarCartao(cartaoId, valor, itens) {
    const transaction = await Cartao.sequelize.transaction()

    try {
      const cartao = await Cartao.findByPk(cartaoId, { transaction })

      if (!cartao) {
        throw new Error('Cartão não encontrado')
      }

      if (cartao.saldo < valor) {
        throw new Error('Saldo insuficiente')
      }

      const saldoAnterior = parseFloat(cartao.saldo)
      cartao.saldo = Math.round((saldoAnterior - valor) * 100) / 100
      await cartao.save({ transaction })

      // Registrar transação
      await Transacao.create({
        id: Date.now(),
        cartao_id: cartao.id,
        cartao_numero: cartao.numero,
        tipo: 'compra',
        valor,
        saldo_anterior: saldoAnterior,
        saldo_atual: cartao.saldo,
        descricao: `Compra de ${itens ? itens.length : 0} item(ns)`,
        itens: itens || null,
        created_at: new Date()
      }, { transaction })

      await transaction.commit()
      return cartao
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async recarregarCartao(cartaoId, valor, descricao) {
    const transaction = await Cartao.sequelize.transaction()

    try {
      const cartao = await Cartao.findByPk(cartaoId, { transaction })

      if (!cartao) {
        throw new Error('Cartão não encontrado')
      }

      const saldoAnterior = parseFloat(cartao.saldo)
      cartao.saldo = Math.round((saldoAnterior + parseFloat(valor)) * 100) / 100
      await cartao.save({ transaction })

      // Registrar transação
      await Transacao.create({
        id: Date.now(),
        cartao_id: cartao.id,
        cartao_numero: cartao.numero,
        tipo: 'recarga',
        valor: parseFloat(valor) || 0,
        saldo_anterior: saldoAnterior,
        saldo_atual: cartao.saldo,
        descricao: descricao || 'Recarga de saldo',
        created_at: new Date()
      }, { transaction })

      await transaction.commit()
      return cartao
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async getTransacoes(cartaoId) {
    const id = typeof cartaoId === 'string' ? parseInt(cartaoId, 10) : cartaoId

    return await Transacao.findAll({
      where: { cartao_id: id },
      order: [['created_at', 'DESC']]
    })
  }

  async estornarTransacoes(cartaoId, transacoesIds) {
    const transaction = await Cartao.sequelize.transaction()

    try {
      const cartao = await Cartao.findByPk(cartaoId, { transaction })

      if (!cartao) {
        throw new Error('Cartão não encontrado')
      }

      const id = typeof cartaoId === 'string' ? parseInt(cartaoId, 10) : cartaoId
      const transacoesParaEstornar = await Transacao.findAll({
        where: {
          id: { [Op.in]: transacoesIds },
          cartao_id: id,
          tipo: 'compra',
          estornado: false
        },
        transaction
      })

      if (transacoesParaEstornar.length === 0) {
        throw new Error('Nenhuma transação válida encontrada para estorno')
      }

      const valorTotalEstorno = transacoesParaEstornar.reduce((sum, t) =>
        sum + parseFloat(t.valor), 0
      )

      const saldoAnterior = parseFloat(cartao.saldo)
      cartao.saldo = Math.round((saldoAnterior + valorTotalEstorno) * 100) / 100
      await cartao.save({ transaction })

      // Marcar transações como estornadas
      await Transacao.update(
        {
          estornado: true,
          data_estorno: new Date()
        },
        {
          where: { id: { [Op.in]: transacoesIds } },
          transaction
        }
      )

      // Criar transação de estorno
      await Transacao.create({
        id: Date.now(),
        cartao_id: cartao.id,
        cartao_numero: cartao.numero,
        tipo: 'estorno',
        valor: valorTotalEstorno,
        saldo_anterior: saldoAnterior,
        saldo_atual: cartao.saldo,
        descricao: `Estorno de ${transacoesParaEstornar.length} transação(ões)`,
        transacoes_estornadas: transacoesIds,
        created_at: new Date()
      }, { transaction })

      await transaction.commit()

      return {
        cartao,
        valorEstornado: valorTotalEstorno,
        transacoesEstornadas: transacoesParaEstornar.length
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }
}

module.exports = new CartaoService()
