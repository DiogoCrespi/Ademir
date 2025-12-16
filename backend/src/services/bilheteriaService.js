const { Ingresso, ConfigBilheteria } = require('../models')
const { Op } = require('sequelize')

class BilheteriaService {
  async getConfig() {
    const configs = await ConfigBilheteria.findAll()
    const configObj = {}

    configs.forEach(c => {
      if (c.chave === 'precoNormal') configObj.precoNormal = parseFloat(c.valor)
      if (c.chave === 'precoMeio') configObj.precoMeio = parseFloat(c.valor)
      if (c.chave === 'precoPassaporte') configObj.precoPassaporte = parseFloat(c.valor)
    })

    return configObj
  }

  async saveConfig(configData) {
    const transaction = await ConfigBilheteria.sequelize.transaction()

    try {
      await ConfigBilheteria.upsert({
        chave: 'precoNormal',
        valor: parseFloat(configData.precoNormal || 0)
      }, { transaction })

      await ConfigBilheteria.upsert({
        chave: 'precoMeio',
        valor: parseFloat(configData.precoMeio || 0)
      }, { transaction })

      await ConfigBilheteria.upsert({
        chave: 'precoPassaporte',
        valor: parseFloat(configData.precoPassaporte || 0)
      }, { transaction })

      await transaction.commit()
      return await this.getConfig()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async venderIngressos(tipo, quantidade) {
    const transaction = await Ingresso.sequelize.transaction()

    try {
      const config = await this.getConfig()

      let preco = 0
      if (tipo === 'normal') {
        preco = parseFloat(config.precoNormal || 0)
      } else if (tipo === 'meio') {
        preco = parseFloat(config.precoMeio || 0)
      } else if (tipo === 'passaporte') {
        preco = parseFloat(config.precoPassaporte || 0)
      }

      if (preco <= 0) {
        throw new Error('Preço não configurado para este tipo de ingresso')
      }

      const agora = new Date()
      const dataVendaISO = agora.toISOString()
      const dataVendaDate = agora.toISOString().split('T')[0]
      const novosIngressos = []

      for (let i = 0; i < quantidade; i++) {
        const codigo = `ING${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`
        const ingresso = await Ingresso.create({
          id: Date.now() + i,
          codigo,
          tipo,
          valor: preco,
          data_venda: dataVendaISO,
          data_venda_date: dataVendaDate,
          liberado: false,
          data_liberacao: null
        }, { transaction })

        novosIngressos.push({
          id: ingresso.id,
          codigo: ingresso.codigo,
          tipo: ingresso.tipo,
          valor: parseFloat(ingresso.valor),
          dataVenda: ingresso.data_venda,
          dataVendaDate: ingresso.data_venda_date,
          liberado: ingresso.liberado,
          dataLiberacao: ingresso.data_liberacao
        })
      }

      await transaction.commit()

      return {
        ingressos: novosIngressos,
        total: preco * quantidade
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async getIngressos(limit = 100) {
    const ingressos = await Ingresso.findAll({
      order: [['data_venda', 'DESC']],
      limit
    })

    return ingressos.map(i => ({
      id: i.id,
      codigo: i.codigo,
      tipo: i.tipo,
      valor: parseFloat(i.valor),
      dataVenda: i.data_venda,
      dataVendaDate: i.data_venda_date,
      liberado: i.liberado,
      dataLiberacao: i.data_liberacao
    }))
  }

  async liberarIngresso(codigo) {
    const ingresso = await Ingresso.findOne({
      where: {
        codigo: codigo.toUpperCase()
      }
    })

    if (!ingresso) {
      throw new Error('Ingresso não encontrado')
    }

    if (ingresso.liberado) {
      throw new Error('Ingresso já foi utilizado')
    }

    ingresso.liberado = true
    ingresso.data_liberacao = new Date()
    await ingresso.save()

    return {
      id: ingresso.id,
      codigo: ingresso.codigo,
      tipo: ingresso.tipo,
      valor: parseFloat(ingresso.valor),
      dataVenda: ingresso.data_venda,
      dataVendaDate: ingresso.data_venda_date,
      liberado: ingresso.liberado,
      dataLiberacao: ingresso.data_liberacao
    }
  }
}

module.exports = new BilheteriaService()
