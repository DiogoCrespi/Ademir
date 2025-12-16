const express = require('express')
const router = express.Router()
const controleService = require('../services/controleService')

/**
 * @swagger
 * /api/controle/dashboard:
 *   get:
 *     summary: Retorna estatísticas gerais do sistema
 *     tags: [Controle]
 *     responses:
 *       200:
 *         description: Dashboard com estatísticas
 */
router.get('/dashboard', async (req, res) => {
  console.log('[API] GET /api/controle/dashboard - Requisição recebida')
  try {
    const resultado = await controleService.getDashboard()
    console.log('[API] Dashboard gerado com sucesso')
    res.json(resultado)
  } catch (error) {
    console.error('[API] Erro ao gerar dashboard:', error)
    res.status(500).json({ success: false, message: 'Erro ao gerar dashboard: ' + error.message })
  }
})

/**
 * @swagger
 * /api/controle/logs:
 *   get:
 *     summary: Retorna logs de atividades do sistema
 *     tags: [Controle]
 *     responses:
 *       200:
 *         description: Lista de logs
 */
router.get('/logs', async (req, res) => {
  console.log('[API] GET /api/controle/logs - Requisição recebida')
  try {
    const logs = await controleService.getLogs()
    res.json(logs)
  } catch (error) {
    console.error('[API] Erro ao buscar logs:', error)
    res.status(500).json({ success: false, message: 'Erro ao buscar logs' })
  }
})

/**
 * @swagger
 * /api/controle/relatorio/cartoes:
 *   get:
 *     summary: Relatório detalhado de cartões
 *     tags: [Controle]
 *     responses:
 *       200:
 *         description: Relatório de cartões
 */
router.get('/relatorio/cartoes', async (req, res) => {
  try {
    const relatorio = await controleService.getRelatorioCartoes()
    res.json(relatorio)
  } catch (error) {
    console.error('[API] Erro ao gerar relatório de cartões:', error)
    res.status(500).json({ success: false, message: 'Erro ao gerar relatório' })
  }
})

/**
 * @swagger
 * /api/controle/relatorio/vendas:
 *   get:
 *     summary: Relatório de vendas realizadas
 *     tags: [Controle]
 *     responses:
 *       200:
 *         description: Relatório de vendas
 */
router.get('/relatorio/vendas', async (req, res) => {
  try {
    const vendas = await controleService.getRelatorioVendas()
    res.json(vendas)
  } catch (error) {
    console.error('[API] Erro ao gerar relatório de vendas:', error)
    res.status(500).json({ success: false, message: 'Erro ao gerar relatório' })
  }
})

/**
 * @swagger
 * /api/controle/relatorio/estoque:
 *   get:
 *     summary: Relatório de situação do estoque
 *     tags: [Controle]
 *     responses:
 *       200:
 *         description: Relatório de estoque
 */
router.get('/relatorio/estoque', async (req, res) => {
  try {
    const relatorio = await controleService.getRelatorioEstoque()
    res.json(relatorio)
  } catch (error) {
    console.error('[API] Erro ao gerar relatório de estoque:', error)
    res.status(500).json({ success: false, message: 'Erro ao gerar relatório' })
  }
})

/**
 * @swagger
 * /api/controle/relatorio/eventos:
 *   get:
 *     summary: Relatório de eventos
 *     tags: [Controle]
 *     responses:
 *       200:
 *         description: Relatório de eventos
 */
router.get('/relatorio/eventos', async (req, res) => {
  console.log('[API] GET /api/controle/relatorio/eventos - Requisição recebida')
  try {
    const relatorio = await controleService.getRelatorioEventos()
    res.json(relatorio)
  } catch (error) {
    console.error('[API] Erro ao gerar relatório de eventos:', error)
    res.status(500).json({ success: false, message: 'Erro ao gerar relatório: ' + error.message })
  }
})

module.exports = router
