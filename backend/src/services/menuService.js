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
      console.error('Erro ao buscar menu do banco de dados:', error)
      console.error('Stack trace:', error.stack)
      // Retornar dados mockados se o banco não estiver disponível
      return this.getMockMenu()
    }
  }

  getMockMenu() {
    return [
      {
        id: 'cat1',
        titulo: 'Bebidas',
        img: null,
        ativo: true,
        itens: [
          { id: 1, nome: 'Coca-Cola 350ml', preco: 5.00, desc: 'Refrigerante gelado', ativo: true },
          { id: 2, nome: 'Água Mineral', preco: 3.00, desc: 'Água sem gás', ativo: true },
          { id: 3, nome: 'Suco de Laranja', preco: 6.00, desc: 'Suco natural', ativo: true }
        ]
      },
      {
        id: 'cat2',
        titulo: 'Lanches',
        img: null,
        ativo: true,
        itens: [
          { id: 4, nome: 'Hambúrguer', preco: 15.00, desc: 'Hambúrguer artesanal', ativo: true },
          { id: 5, nome: 'Batata Frita', preco: 8.00, desc: 'Porção média', ativo: true },
          { id: 6, nome: 'Pastel', preco: 7.00, desc: 'Pastel frito', ativo: true }
        ]
      },
      {
        id: 'cat3',
        titulo: 'Doces',
        img: null,
        ativo: true,
        itens: [
          { id: 7, nome: 'Brigadeiro', preco: 2.50, desc: 'Brigadeiro gourmet', ativo: true },
          { id: 8, nome: 'Brownie', preco: 6.00, desc: 'Brownie com chocolate', ativo: true }
        ]
      }
    ]
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
