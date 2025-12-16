const { ProdutoEstoque, MovimentacaoEstoque } = require('../models')
const { Op } = require('sequelize')

class EstoqueService {
  async getEstoque() {
    try {
      const produtos = await ProdutoEstoque.findAll({
        order: [['created_at', 'ASC']]
      })

      const geladeiras = produtos.filter(p => p.local === 'geladeiras')
      const cameraFria = produtos.filter(p => p.local === 'cameraFria')

      return {
        geladeiras: geladeiras.map(p => ({
          id: p.id,
          nome: p.nome,
          categoria: p.categoria,
          quantidade: parseInt(p.quantidade),
          valorUnitario: parseFloat(p.valor_unitario),
          estoqueMinimo: parseInt(p.estoque_minimo),
          observacao: p.observacao,
          createdAt: p.created_at,
          updatedAt: p.updated_at
        })),
        cameraFria: cameraFria.map(p => ({
          id: p.id,
          nome: p.nome,
          categoria: p.categoria,
          quantidade: parseInt(p.quantidade),
          valorUnitario: parseFloat(p.valor_unitario),
          estoqueMinimo: parseInt(p.estoque_minimo),
          observacao: p.observacao,
          createdAt: p.created_at,
          updatedAt: p.updated_at
        }))
      }
    } catch (error) {
      console.error('Erro ao buscar estoque do banco de dados:', error.message)
      return this.getMockEstoque()
    }
  }

  getMockEstoque() {
    const hoje = new Date()
    return {
      geladeiras: [
        {
          id: 1,
          nome: 'Coca-Cola 350ml',
          categoria: 'Bebidas',
          quantidade: 50,
          valorUnitario: 3.50,
          estoqueMinimo: 10,
          observacao: 'Refrigerante gelado',
          createdAt: hoje,
          updatedAt: hoje
        },
        {
          id: 2,
          nome: 'Água Mineral',
          categoria: 'Bebidas',
          quantidade: 30,
          valorUnitario: 2.00,
          estoqueMinimo: 15,
          observacao: 'Água sem gás',
          createdAt: hoje,
          updatedAt: hoje
        },
        {
          id: 3,
          nome: 'Suco de Laranja',
          categoria: 'Bebidas',
          quantidade: 20,
          valorUnitario: 4.50,
          estoqueMinimo: 10,
          observacao: 'Suco natural',
          createdAt: hoje,
          updatedAt: hoje
        }
      ],
      cameraFria: [
        {
          id: 4,
          nome: 'Hambúrguer',
          categoria: 'Lanches',
          quantidade: 25,
          valorUnitario: 12.00,
          estoqueMinimo: 10,
          observacao: 'Hambúrguer artesanal',
          createdAt: hoje,
          updatedAt: hoje
        },
        {
          id: 5,
          nome: 'Batata Frita',
          categoria: 'Acompanhamentos',
          quantidade: 40,
          valorUnitario: 6.00,
          estoqueMinimo: 20,
          observacao: 'Porção média',
          createdAt: hoje,
          updatedAt: hoje
        }
      ]
    }
  }
  }

  async saveEstoque(estoqueData) {
    const transaction = await ProdutoEstoque.sequelize.transaction()

    try {
      const produtos = []

      if (estoqueData.geladeiras && Array.isArray(estoqueData.geladeiras)) {
        produtos.push(...estoqueData.geladeiras.map(p => ({ ...p, local: 'geladeiras' })))
      }
      if (estoqueData.cameraFria && Array.isArray(estoqueData.cameraFria)) {
        produtos.push(...estoqueData.cameraFria.map(p => ({ ...p, local: 'cameraFria' })))
      }

      for (const produtoData of produtos) {
        await ProdutoEstoque.upsert({
          id: produtoData.id,
          nome: produtoData.nome,
          categoria: produtoData.categoria || null,
          quantidade: parseInt(produtoData.quantidade) || 0,
          valor_unitario: parseFloat(produtoData.valorUnitario) || 0,
          estoque_minimo: parseInt(produtoData.estoqueMinimo) || 0,
          local: produtoData.local || 'geladeiras',
          observacao: produtoData.observacao || null,
          created_at: produtoData.createdAt || new Date(),
          updated_at: produtoData.updatedAt || new Date()
        }, { transaction })
      }

      await transaction.commit()
      return true
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async getHistorico() {
    const movimentacoes = await MovimentacaoEstoque.findAll({
      include: [{
        model: ProdutoEstoque,
        as: 'produto'
      }],
      order: [['created_at', 'DESC']],
      limit: 1000
    })

    return movimentacoes.map(m => ({
      id: m.id,
      data: m.created_at,
      tipo: m.tipo,
      local: m.produto ? m.produto.local : null,
      produtoId: m.produto_id,
      produtoNome: m.produto_nome,
      quantidade: parseInt(m.quantidade),
      valorUnitario: parseFloat(m.valor_unitario),
      total: parseFloat(m.total),
      observacao: m.observacao
    }))
  }

  async saveHistorico(historicoData) {
    const transaction = await MovimentacaoEstoque.sequelize.transaction()

    try {
      for (const movData of historicoData) {
        const produto = await ProdutoEstoque.findOne({
          where: { nome: movData.produtoNome || movData.produto },
          transaction
        })

        if (produto) {
          await MovimentacaoEstoque.upsert({
            id: movData.id,
            produto_id: produto.id,
            produto_nome: movData.produtoNome || movData.produto,
            tipo: movData.tipo === 'saida' ? 'saida' : 'entrada',
            quantidade: parseInt(movData.quantidade) || 0,
            valor_unitario: parseFloat(movData.valorUnitario) || 0,
            total: parseFloat(movData.total) || 0,
            observacao: movData.observacao || null,
            created_at: movData.data || movData.timestamp || new Date()
          }, { transaction })
        }
      }

      await transaction.commit()
      return true
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async verificarProduto(produtoNome) {
    const produto = await ProdutoEstoque.findOne({
      where: {
        nome: { [Op.iLike]: produtoNome }
      }
    })

    if (!produto) {
      return { disponivel: false, quantidade: 0 }
    }

    return {
      disponivel: produto.quantidade > 0,
      quantidade: parseInt(produto.quantidade)
    }
  }

  async reduzirEstoque(produtoNome, quantidade) {
    const transaction = await ProdutoEstoque.sequelize.transaction()

    try {
      const produto = await ProdutoEstoque.findOne({
        where: {
          nome: { [Op.iLike]: produtoNome }
        },
        transaction
      })

      if (!produto) {
        throw new Error('Produto não encontrado')
      }

      if (produto.quantidade < quantidade) {
        throw new Error('Estoque insuficiente')
      }

      produto.quantidade -= quantidade
      produto.updated_at = new Date()
      await produto.save({ transaction })

      // Registrar movimentação
      await MovimentacaoEstoque.create({
        id: Date.now(),
        produto_id: produto.id,
        produto_nome: produto.nome,
        tipo: 'saida',
        quantidade,
        valor_unitario: parseFloat(produto.valor_unitario),
        total: quantidade * parseFloat(produto.valor_unitario),
        observacao: 'Venda realizada',
        created_at: new Date()
      }, { transaction })

      await transaction.commit()

      return {
        id: produto.id,
        nome: produto.nome,
        categoria: produto.categoria,
        quantidade: parseInt(produto.quantidade),
        valorUnitario: parseFloat(produto.valor_unitario),
        estoqueMinimo: parseInt(produto.estoque_minimo),
        observacao: produto.observacao,
        createdAt: produto.created_at,
        updatedAt: produto.updated_at
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }
}

module.exports = new EstoqueService()
