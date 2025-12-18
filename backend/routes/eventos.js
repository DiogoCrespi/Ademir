const express = require('express');
const { readDataFile, writeDataFile } = require('../dataStore');

const router = express.Router();

router.get('/eventos', (req, res) => {
  try {
    const eventos = readDataFile('eventos.json', []);
    res.json(eventos);
  } catch (error) {
    console.error('Erro ao ler eventos:', error);
    res.status(500).json({ error: 'Erro ao carregar eventos' });
  }
});

router.post('/eventos', (req, res) => {
  try {
    const eventos = req.body;
    console.log('[API] POST /api/eventos - Salvando eventos:', Array.isArray(eventos) ? eventos.length : 'não é array');
    if (writeDataFile('eventos.json', eventos)) {
      console.log('[API] ✅ Eventos salvos com sucesso');
      res.json({ success: true, message: 'Eventos atualizados com sucesso' });
    } else {
      console.error('[API] ❌ Erro ao escrever arquivo eventos.json');
      res.status(500).json({ success: false, message: 'Erro ao salvar eventos' });
    }
  } catch (error) {
    console.error('[API] ❌ Erro ao salvar eventos:', error);
    res.status(500).json({ success: false, message: 'Erro ao salvar eventos: ' + error.message });
  }
});

module.exports = router;


