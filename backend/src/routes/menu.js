const express = require('express')
const router = express.Router()
const menuService = require('../services/menuService')

/**
 * @swagger
 * /api/menu:
 *   get:
 *     summary: Retorna o menu completo
 *     tags: [Menu]
 *     responses:
 *       200:
 *         description: Menu retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   titulo:
 *                     type: string
 *                   img:
 *                     type: string
 *                   ativo:
 *                     type: boolean
 *                   itens:
 *                     type: array
 */
router.get('/', async (req, res) => {
  try {
    const menu = await menuService.getMenu()
    res.json(menu)
  } catch (error) {
    console.error('Erro ao ler menu:', error)
    res.status(500).json({ error: 'Erro ao carregar menu' })
  }
})

/**
 * @swagger
 * /api/menu:
 *   post:
 *     summary: Salva/atualiza o menu completo
 *     tags: [Menu]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *     responses:
 *       200:
 *         description: Menu atualizado com sucesso
 *       500:
 *         description: Erro ao salvar menu
 */
router.post('/', async (req, res) => {
  try {
    const menu = req.body
    await menuService.saveMenu(menu)
    res.json({ success: true, message: 'Menu atualizado com sucesso' })
  } catch (error) {
    console.error('Erro ao salvar menu:', error)
    res.status(500).json({ success: false, message: 'Erro ao salvar menu' })
  }
})

module.exports = router
