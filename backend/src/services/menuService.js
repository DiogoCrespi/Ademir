const { Categoria, ItemMenu } = require('../models')

class MenuService {
  async getMenu() {
    try {
      const categorias = await Categoria.findAll({
        include: [{
          model: ItemMenu,
          as: 'itens',
          required: false
        }],
        where: { ativo: true },
        order: [['created_at', 'ASC']]
      })

      return categorias.map(cat => ({
        id: cat.id,
        titulo: cat.titulo,
        img: cat.img,
        ativo: cat.ativo,
        itens: cat.itens
          ? cat.itens
            .filter(item => item.ativo)
            .map(item => ({
              id: item.id,
              nome: item.nome,
              preco: item.preco,
              desc: item.desc,
              ativo: item.ativo
            }))
          : []
      }))
    } catch (error) {
      console.error('Erro ao buscar menu do banco de dados:', error.message)
      // Retornar array vazio se o banco não estiver disponível
      return []
    }
  }

  async saveMenu(menuData) {
    const transaction = await Categoria.sequelize.transaction()

    try {
      // Limpar dados antigos (opcional - ou fazer update)
      // Por enquanto vamos fazer upsert

      for (const categoriaData of menuData) {
        await Categoria.upsert({
          id: categoriaData.id,
          titulo: categoriaData.titulo,
          img: categoriaData.img || null,
          ativo: categoriaData.ativo !== undefined ? categoriaData.ativo : true
        }, { transaction })

        if (categoriaData.itens && Array.isArray(categoriaData.itens)) {
          for (const itemData of categoriaData.itens) {
            let itemId = itemData.id
            if (itemId && typeof itemId === 'number' && itemId % 1 !== 0) {
              itemId = Math.floor(itemId)
            }
            if (!itemId || itemId <= 0) {
              itemId = Date.now() + Math.floor(Math.random() * 1000)
            }

            await ItemMenu.upsert({
              id: itemId,
              categoria_id: categoriaData.id,
              nome: itemData.nome,
              preco: itemData.preco,
              desc: itemData.desc || null,
              ativo: itemData.ativo !== undefined ? itemData.ativo : true
            }, { transaction })
          }
        }
      }

      await transaction.commit()
      return true
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }
}

module.exports = new MenuService()
