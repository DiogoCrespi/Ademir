const { Evento } = require('../models')

class EventoService {
  async getAllEventos() {
    try {
      const eventos = await Evento.findAll({
        order: [['data_criacao', 'DESC']]
      })

      return eventos.map(e => ({
        id: e.id,
        nome: e.nome,
        data: e.data,
        descricao: e.descricao,
        finalizado: e.finalizado,
        dataCriacao: e.data_criacao,
        dataFinalizacao: e.data_finalizacao,
        itens: e.itens
      }))
    } catch (error) {
      console.error('Erro ao buscar eventos do banco de dados:', error.message)
      return []
    }
  }

  async saveEventos(eventosData) {
    const transaction = await Evento.sequelize.transaction()

    try {
      for (const eventoData of eventosData) {
        await Evento.upsert({
          id: eventoData.id,
          nome: eventoData.nome,
          data: eventoData.data,
          descricao: eventoData.descricao || null,
          finalizado: eventoData.finalizado || false,
          data_finalizacao: eventoData.dataFinalizacao || null,
          itens: eventoData.itens || null,
          data_criacao: eventoData.dataCriacao || eventoData.created_at || eventoData.data || new Date()
        }, { transaction })
      }

      await transaction.commit()
      return true
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }
}

module.exports = new EventoService()
