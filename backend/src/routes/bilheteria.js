const express = require('express')
const router = express.Router()
const bilheteriaService = require('../services/bilheteriaService')

/**
 * @swagger
 * /api/bilheteria/config:
 *   get:
 *     summary: Retorna configurações de preços da bilheteria
 *     tags: [Bilheteria]
 *     responses:
 *       200:
 *         description: Configurações retornadas
 */
router.get('/config', async (req, res) => {
  try {
    const config = await bilheteriaService.getConfig()
    res.json(config)
  } catch (error) {
    console.error('[API] Erro ao buscar configurações da bilheteria:', error)
    res.json({})
  }
})

/**
 * @swagger
 * /api/bilheteria/config:
 *   post:
 *     summary: Salva configurações de preços
 *     tags: [Bilheteria]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               precoNormal:
 *                 type: number
 *               precoMeio:
 *                 type: number
 *               precoPassaporte:
 *                 type: number
 *     responses:
 *       200:
 *         description: Configurações salvas com sucesso
 */
router.post('/config', async (req, res) => {
  try {
    const config = await bilheteriaService.saveConfig(req.body)
    res.json({ success: true, config })
  } catch (error) {
    console.error('[API] Erro ao salvar configurações:', error)
    res.status(500).json({ success: false, message: 'Erro ao salvar configurações' })
  }
})

/**
 * @swagger
 * /api/bilheteria/processar-pagamento:
 *   post:
 *     summary: Processa pagamento de ingressos (simulado)
 *     tags: [Bilheteria]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               valor:
 *                 type: number
 *               tipos:
 *                 type: array
 *               formaPagamento:
 *                 type: string
 *                 enum: [dinheiro, pix, credito, debito]
 *     responses:
 *       200:
 *         description: Pagamento processado
 *       400:
 *         description: Dados inválidos
 */
router.post('/processar-pagamento', async (req, res) => {
  try {
    const { valor, formaPagamento } = req.body

    if (!valor || valor <= 0) {
      return res.status(400).json({ success: false, message: 'Valor inválido' })
    }

    if (!formaPagamento || !['dinheiro', 'pix', 'credito', 'debito'].includes(formaPagamento)) {
      return res.status(400).json({ success: false, message: 'Forma de pagamento inválida' })
    }

    const formaNome = {
      dinheiro: 'Dinheiro',
      pix: 'PIX',
      credito: 'Cartão de Crédito',
      debito: 'Cartão de Débito'
    }

    console.log(`[Pagamento] Processando ${formaNome[formaPagamento]} de R$ ${valor.toFixed(2)}`)

    if (formaPagamento === 'dinheiro') {
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log(`[Pagamento] ✅ Pagamento em dinheiro confirmado: R$ ${valor.toFixed(2)}`)
      res.json({
        success: true,
        message: 'Pagamento em dinheiro confirmado',
        valor,
        formaPagamento,
        transacaoId: `DIN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        data: new Date().toISOString()
      })
    } else if (formaPagamento === 'pix') {
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000))
      const aprovado = Math.random() > 0.02

      if (aprovado) {
        console.log(`[Pagamento] ✅ Pagamento PIX confirmado: R$ ${valor.toFixed(2)}`)
        res.json({
          success: true,
          message: 'Pagamento PIX confirmado',
          valor,
          formaPagamento,
          transacaoId: `PIX${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          data: new Date().toISOString()
        })
      } else {
        console.log(`[Pagamento] ❌ Pagamento PIX não confirmado: R$ ${valor.toFixed(2)}`)
        res.json({
          success: false,
          message: 'Pagamento PIX não confirmado. Verifique o status da transação.',
          valor
        })
      }
    } else if (formaPagamento === 'credito' || formaPagamento === 'debito') {
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))
      const aprovado = Math.random() > 0.05

      if (aprovado) {
        console.log(`[Pagamento] ✅ Pagamento no ${formaNome[formaPagamento]} aprovado: R$ ${valor.toFixed(2)}`)
        res.json({
          success: true,
          message: `Pagamento no ${formaNome[formaPagamento]} aprovado`,
          valor,
          formaPagamento,
          transacaoId: `${formaPagamento.toUpperCase()}${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          data: new Date().toISOString()
        })
      } else {
        console.log(`[Pagamento] ❌ Pagamento no ${formaNome[formaPagamento]} negado: R$ ${valor.toFixed(2)}`)
        res.json({
          success: false,
          message: `Pagamento no ${formaNome[formaPagamento]} negado. Tente novamente ou use outro cartão.`,
          valor
        })
      }
    }
  } catch (error) {
    console.error('[API] Erro ao processar pagamento:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao processar pagamento: ' + error.message
    })
  }
})

/**
 * @swagger
 * /api/bilheteria/vender:
 *   post:
 *     summary: Registra venda de ingressos
 *     tags: [Bilheteria]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [normal, meio, passaporte]
 *               quantidade:
 *                 type: number
 *     responses:
 *       200:
 *         description: Ingressos vendidos com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/vender', async (req, res) => {
  console.log('[API] POST /api/bilheteria/vender - Requisição recebida')
  console.log('[API] Body:', req.body)
  try {
    const { tipo, quantidade } = req.body

    if (!tipo || !['normal', 'meio', 'passaporte'].includes(tipo)) {
      return res.status(400).json({ success: false, message: 'Tipo de ingresso inválido' })
    }

    if (!quantidade || quantidade < 1) {
      return res.status(400).json({ success: false, message: 'Quantidade inválida' })
    }

    const resultado = await bilheteriaService.venderIngressos(tipo, quantidade)

    res.json({
      success: true,
      ingressos: resultado.ingressos,
      total: resultado.total
    })
  } catch (error) {
    console.error('[API] Erro ao vender ingressos:', error)
    if (error.message.includes('Preço não configurado')) {
      return res.status(400).json({ success: false, message: error.message })
    }
    res.status(500).json({ success: false, message: 'Erro ao processar venda: ' + error.message })
  }
})

/**
 * @swagger
 * /api/bilheteria/ingressos:
 *   get:
 *     summary: Lista ingressos vendidos (últimos 100)
 *     tags: [Bilheteria]
 *     responses:
 *       200:
 *         description: Lista de ingressos
 */
router.get('/ingressos', async (req, res) => {
  try {
    const ingressos = await bilheteriaService.getIngressos(100)
    res.json(ingressos)
  } catch (error) {
    console.error('[API] Erro ao buscar ingressos:', error)
    res.status(500).json({ success: false, message: 'Erro ao buscar ingressos' })
  }
})

/**
 * @swagger
 * /api/bilheteria/liberar:
 *   post:
 *     summary: Libera entrada de um ingresso
 *     tags: [Bilheteria]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Entrada liberada com sucesso
 *       400:
 *         description: Ingresso já utilizado ou código inválido
 *       404:
 *         description: Ingresso não encontrado
 */
router.post('/liberar', async (req, res) => {
  try {
    const { codigo } = req.body

    if (!codigo) {
      return res.status(400).json({ success: false, message: 'Código do ingresso não informado' })
    }

    const ingresso = await bilheteriaService.liberarIngresso(codigo)

    res.json({ success: true, ingresso })
  } catch (error) {
    console.error('[API] Erro ao liberar entrada:', error)
    if (error.message === 'Ingresso não encontrado') {
      return res.status(404).json({ success: false, message: error.message })
    }
    if (error.message === 'Ingresso já foi utilizado') {
      return res.status(400).json({ success: false, message: error.message })
    }
    res.status(500).json({ success: false, message: 'Erro ao liberar entrada: ' + error.message })
  }
})

module.exports = router
