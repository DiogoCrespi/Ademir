const express = require('express')
const router = express.Router()
const cartaoService = require('../services/cartaoService')

/**
 * @swagger
 * /api/cartoes:
 *   get:
 *     summary: Lista todos os cartões
 *     tags: [Cartões]
 *     responses:
 *       200:
 *         description: Lista de cartões
 */
router.get('/', async (req, res) => {
  try {
    const cartoes = await cartaoService.getAllCartoes()
    console.log(`[API] GET /api/cartoes - Retornando ${cartoes.length} cartões`)
    if (cartoes.length > 0) {
      console.log('[API] Primeiros cartões:', cartoes.slice(0, 3).map(c => `${c.numero} - ${c.nome}`))
    }
    res.json(cartoes.map(c => ({
      id: c.id,
      numero: c.numero,
      nome: c.nome,
      documento: c.documento,
      saldo: parseFloat(c.saldo),
      ativo: c.ativo ? 1 : 0,
      created_at: c.created_at
    })))
  } catch (error) {
    console.error('Erro ao ler cartões:', error)
    res.status(500).json({ error: 'Erro ao carregar cartões' })
  }
})

/**
 * @swagger
 * /api/cartoes:
 *   post:
 *     summary: Salva/atualiza lista de cartões
 *     tags: [Cartões]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *     responses:
 *       200:
 *         description: Cartões atualizados com sucesso
 */
router.post('/', async (req, res) => {
  try {
    const cartoes = req.body
    console.log(`[API] POST /api/cartoes - Salvando ${Array.isArray(cartoes) ? cartoes.length : 0} cartões`)

    if (!Array.isArray(cartoes)) {
      return res.status(400).json({ success: false, message: 'Dados inválidos: esperado array de cartões' })
    }

    await cartaoService.saveCartoes(cartoes)
    console.log('[API] ✅ Cartões salvos com sucesso')
    res.json({ success: true, message: 'Cartões atualizados com sucesso' })
  } catch (error) {
    console.error('[API] Erro ao salvar cartões:', error)
    res.status(500).json({ success: false, message: 'Erro ao salvar cartões' })
  }
})

/**
 * @swagger
 * /api/cartoes/{numero}:
 *   get:
 *     summary: Busca cartão por número
 *     tags: [Cartões]
 *     parameters:
 *       - in: path
 *         name: numero
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cartão encontrado
 *       404:
 *         description: Cartão não encontrado
 */
router.get('/:numero', async (req, res) => {
  try {
    const numero = req.params.numero.replace(/\s/g, '').trim()

    console.log(`[API] Buscando cartão: "${numero}"`)

    if (!numero || numero.length < 4) {
      return res.status(400).json({ success: false, message: 'Número de cartão inválido' })
    }

    const cartao = await cartaoService.findCartaoByNumero(numero)

    if (cartao) {
      console.log(`[API] ✅ Cartão encontrado: ${cartao.numero} - ${cartao.nome}`)
      res.json({
        id: cartao.id,
        numero: cartao.numero,
        nome: cartao.nome,
        documento: cartao.documento,
        saldo: parseFloat(cartao.saldo),
        ativo: cartao.ativo ? 1 : 0,
        created_at: cartao.created_at
      })
    } else {
      console.log(`[API] ❌ Cartão não encontrado: ${numero}`)
      res.status(404).json({ success: false, message: 'Cartão não encontrado' })
    }
  } catch (error) {
    console.error('Erro ao buscar cartão:', error)
    res.status(500).json({ success: false, message: 'Erro ao buscar cartão' })
  }
})

/**
 * @swagger
 * /api/cartoes/{id}/debitar:
 *   post:
 *     summary: Debita valor do cartão (compra)
 *     tags: [Cartões]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               valor:
 *                 type: number
 *               itens:
 *                 type: array
 *     responses:
 *       200:
 *         description: Débito realizado com sucesso
 *       400:
 *         description: Saldo insuficiente
 *       404:
 *         description: Cartão não encontrado
 */
router.post('/:id/debitar', async (req, res) => {
  try {
    const { valor, itens } = req.body
    const cartaoId = req.params.id

    const cartao = await cartaoService.debitarCartao(cartaoId, valor, itens)

    res.json({
      success: true,
      cartao: {
        id: cartao.id,
        numero: cartao.numero,
        nome: cartao.nome,
        documento: cartao.documento,
        saldo: parseFloat(cartao.saldo),
        ativo: cartao.ativo ? 1 : 0,
        created_at: cartao.created_at
      }
    })
  } catch (error) {
    console.error('[API] Erro ao debitar cartão:', error)
    if (error.message === 'Cartão não encontrado') {
      return res.status(404).json({ success: false, message: error.message })
    }
    if (error.message === 'Saldo insuficiente') {
      return res.status(400).json({ success: false, message: error.message })
    }
    res.status(500).json({ success: false, message: 'Erro ao atualizar cartão' })
  }
})

/**
 * @swagger
 * /api/cartoes/{id}/recarregar:
 *   post:
 *     summary: Recarrega saldo do cartão
 *     tags: [Cartões]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               valor:
 *                 type: number
 *               descricao:
 *                 type: string
 *     responses:
 *       200:
 *         description: Recarga realizada com sucesso
 *       404:
 *         description: Cartão não encontrado
 */
router.post('/:id/recarregar', async (req, res) => {
  try {
    const { valor, descricao } = req.body
    const cartaoId = req.params.id

    const cartao = await cartaoService.recarregarCartao(cartaoId, valor, descricao)

    res.json({
      success: true,
      cartao: {
        id: cartao.id,
        numero: cartao.numero,
        nome: cartao.nome,
        documento: cartao.documento,
        saldo: parseFloat(cartao.saldo),
        ativo: cartao.ativo ? 1 : 0,
        created_at: cartao.created_at
      }
    })
  } catch (error) {
    console.error('[API] Erro ao recarregar cartão:', error)
    if (error.message === 'Cartão não encontrado') {
      return res.status(404).json({ success: false, message: error.message })
    }
    res.status(500).json({ success: false, message: 'Erro ao atualizar cartão' })
  }
})

/**
 * @swagger
 * /api/cartoes/{id}/transacoes:
 *   get:
 *     summary: Lista transações de um cartão
 *     tags: [Cartões]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de transações
 */
router.get('/:id/transacoes', async (req, res) => {
  try {
    const cartaoId = req.params.id

    const transacoes = await cartaoService.getTransacoes(cartaoId)

    console.log(`[API] GET /api/cartoes/${cartaoId}/transacoes - Encontradas ${transacoes.length} transações`)
    res.json(transacoes.map(t => ({
      id: t.id,
      cartaoId: t.cartao_id,
      cartaoNumero: t.cartao_numero,
      tipo: t.tipo,
      valor: parseFloat(t.valor),
      saldoAnterior: parseFloat(t.saldo_anterior),
      saldoAtual: parseFloat(t.saldo_atual),
      data: t.created_at,
      itens: t.itens,
      descricao: t.descricao,
      estornado: t.estornado,
      dataEstorno: t.data_estorno,
      transacoesEstornadas: t.transacoes_estornadas
    })))
  } catch (error) {
    console.error('[API] Erro ao buscar transações:', error)
    res.status(500).json({ success: false, message: 'Erro ao buscar transações: ' + error.message })
  }
})

/**
 * @swagger
 * /api/cartoes/{id}/estornar:
 *   post:
 *     summary: Estorna transações de compra
 *     tags: [Cartões]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transacoesIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Estorno realizado com sucesso
 *       400:
 *         description: Nenhuma transação válida para estorno
 *       404:
 *         description: Cartão não encontrado
 */
router.post('/:id/estornar', async (req, res) => {
  console.log('[API] POST /api/cartoes/:id/estornar - Recebida requisição')
  console.log('[API] Params:', req.params)
  console.log('[API] Body:', req.body)

  try {
    const { transacoesIds } = req.body
    const cartaoId = req.params.id

    console.log('[API] Cartão ID:', cartaoId, 'Transações IDs:', transacoesIds)

    if (!Array.isArray(transacoesIds) || transacoesIds.length === 0) {
      console.log('[API] Erro: Nenhuma transação selecionada')
      return res.status(400).json({ success: false, message: 'Nenhuma transação selecionada para estorno' })
    }

    const resultado = await cartaoService.estornarTransacoes(cartaoId, transacoesIds)

    res.json({
      success: true,
      cartao: {
        id: resultado.cartao.id,
        numero: resultado.cartao.numero,
        nome: resultado.cartao.nome,
        documento: resultado.cartao.documento,
        saldo: parseFloat(resultado.cartao.saldo),
        ativo: resultado.cartao.ativo ? 1 : 0,
        created_at: resultado.cartao.created_at
      },
      valorEstornado: resultado.valorEstornado,
      transacoesEstornadas: resultado.transacoesEstornadas
    })
  } catch (error) {
    console.error('[API] Erro ao processar estorno:', error)
    if (error.message === 'Cartão não encontrado') {
      return res.status(404).json({ success: false, message: error.message })
    }
    if (error.message.includes('Nenhuma transação válida')) {
      return res.status(400).json({ success: false, message: error.message })
    }
    res.status(500).json({ success: false, message: 'Erro ao processar estorno: ' + error.message })
  }
})

module.exports = router
