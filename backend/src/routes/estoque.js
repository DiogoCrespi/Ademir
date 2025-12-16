const express = require('express')
const router = express.Router()
const estoqueService = require('../services/estoqueService')

/**
 * @swagger
 * /api/estoque:
 *   get:
 *     summary: Retorna o estoque completo
 *     tags: [Estoque]
 *     responses:
 *       200:
 *         description: Estoque retornado com sucesso
 */
router.get('/', async (req, res) => {
  try {
    const estoque = await estoqueService.getEstoque()
    res.json(estoque)
  } catch (error) {
    console.error('Erro ao ler estoque:', error)
    res.status(500).json({ error: 'Erro ao carregar estoque' })
  }
})

/**
 * @swagger
 * /api/estoque:
 *   post:
 *     summary: Salva/atualiza o estoque completo
 *     tags: [Estoque]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Estoque atualizado com sucesso
 */
router.post('/', async (req, res) => {
  try {
    const estoque = req.body
    await estoqueService.saveEstoque(estoque)
    res.json({ success: true, message: 'Estoque atualizado com sucesso' })
  } catch (error) {
    console.error('Erro ao salvar estoque:', error)
    res.status(500).json({ success: false, message: 'Erro ao salvar estoque' })
  }
})

/**
 * @swagger
 * /api/estoque/historico:
 *   get:
 *     summary: Retorna histórico de movimentações
 *     tags: [Estoque]
 *     responses:
 *       200:
 *         description: Histórico retornado com sucesso
 */
router.get('/historico', async (req, res) => {
  try {
    const historico = await estoqueService.getHistorico()
    res.json(historico)
  } catch (error) {
    console.error('Erro ao ler histórico:', error)
    res.status(500).json({ error: 'Erro ao carregar histórico' })
  }
})

/**
 * @swagger
 * /api/estoque/historico:
 *   post:
 *     summary: Salva/atualiza histórico de movimentações
 *     tags: [Estoque]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *     responses:
 *       200:
 *         description: Histórico atualizado com sucesso
 */
router.post('/historico', async (req, res) => {
  try {
    const historico = req.body
    await estoqueService.saveHistorico(historico)
    res.json({ success: true, message: 'Histórico atualizado com sucesso' })
  } catch (error) {
    console.error('Erro ao salvar histórico:', error)
    res.status(500).json({ success: false, message: 'Erro ao salvar histórico' })
  }
})

/**
 * @swagger
 * /api/estoque/verificar/{produtoNome}:
 *   get:
 *     summary: Verifica disponibilidade de um produto
 *     tags: [Estoque]
 *     parameters:
 *       - in: path
 *         name: produtoNome
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Informações de disponibilidade
 */
router.get('/verificar/:produtoNome', async (req, res) => {
  try {
    const produtoNome = decodeURIComponent(req.params.produtoNome)
    const resultado = await estoqueService.verificarProduto(produtoNome)
    res.json(resultado)
  } catch (error) {
    console.error('Erro ao verificar produto:', error)
    res.status(500).json({ error: 'Erro ao verificar produto' })
  }
})

/**
 * @swagger
 * /api/estoque/reduzir:
 *   post:
 *     summary: Reduz quantidade do estoque (venda)
 *     tags: [Estoque]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               produtoNome:
 *                 type: string
 *               quantidade:
 *                 type: number
 *     responses:
 *       200:
 *         description: Estoque reduzido com sucesso
 *       400:
 *         description: Estoque insuficiente
 *       404:
 *         description: Produto não encontrado
 */
router.post('/reduzir', async (req, res) => {
  try {
    const { produtoNome, quantidade } = req.body
    const produto = await estoqueService.reduzirEstoque(produtoNome, quantidade)
    res.json({ success: true, produto })
  } catch (error) {
    console.error('Erro ao reduzir estoque:', error)
    if (error.message === 'Produto não encontrado') {
      return res.status(404).json({ success: false, message: error.message })
    }
    if (error.message === 'Estoque insuficiente') {
      return res.status(400).json({ success: false, message: error.message })
    }
    res.status(500).json({ success: false, message: 'Erro ao atualizar estoque' })
  }
})

module.exports = router
