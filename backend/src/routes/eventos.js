const express = require('express')
const router = express.Router()
const eventoService = require('../services/eventoService')

/**
 * @swagger
 * /api/eventos:
 *   get:
 *     summary: Lista todos os eventos
 *     tags: [Eventos]
 *     responses:
 *       200:
 *         description: Lista de eventos
 */
router.get('/', async (req, res) => {
  try {
    const eventos = await eventoService.getAllEventos()
    res.json(eventos)
  } catch (error) {
    console.error('Erro ao ler eventos:', error)
    res.status(500).json({ error: 'Erro ao carregar eventos' })
  }
})

/**
 * @swagger
 * /api/eventos:
 *   post:
 *     summary: Salva/atualiza lista de eventos
 *     tags: [Eventos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *     responses:
 *       200:
 *         description: Eventos atualizados com sucesso
 */
router.post('/', async (req, res) => {
  try {
    const eventos = req.body
    console.log('[API] POST /api/eventos - Salvando eventos:', Array.isArray(eventos) ? eventos.length : 'não é array')
    await eventoService.saveEventos(eventos)
    console.log('[API] ✅ Eventos salvos com sucesso')
    res.json({ success: true, message: 'Eventos atualizados com sucesso' })
  } catch (error) {
    console.error('[API] ❌ Erro ao salvar eventos:', error)
    res.status(500).json({ success: false, message: 'Erro ao salvar eventos: ' + error.message })
  }
})

module.exports = router
