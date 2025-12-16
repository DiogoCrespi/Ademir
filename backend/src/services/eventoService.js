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
      return this.getMockEventos()
    }
  }

  getMockEventos() {
    const hoje = new Date()
    const amanha = new Date(hoje)
    amanha.setDate(amanha.getDate() + 1)
    
    return [
      {
        id: 1,
        nome: 'Festival de Verão 2025',
        data: amanha.toISOString().split('T')[0],
        descricao: 'Grande evento de verão com música ao vivo',
        finalizado: false,
        dataCriacao: hoje.toISOString(),
        dataFinalizacao: null,
        itens: []
      },
      {
        id: 2,
        nome: 'Workshop de Culinária',
        data: hoje.toISOString().split('T')[0],
        descricao: 'Aprenda receitas deliciosas',
        finalizado: false,
        dataCriacao: hoje.toISOString(),
        dataFinalizacao: null,
        itens: []
      }
    ]
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
