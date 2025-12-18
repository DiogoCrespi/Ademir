const express = require('express');
const { readDataFile, writeDataFile } = require('../dataStore');

const router = express.Router();

// Normaliza dados antigos (array de categorias com itens) para o formato novo { categorias, itens }
function normalizeMenu(data) {
  // Caso já esteja no formato novo
  if (data && data.categorias && data.itens) {
    return data;
  }

  const legacy = Array.isArray(data) ? data : [];
  const categorias = legacy.map(cat => ({
    id: cat.id,
    titulo: cat.titulo,
    img: cat.img,
    ativo: cat.ativo !== false, // default true
  }));

  const itens = legacy.flatMap(cat =>
    (cat.itens || []).map((item, idx) => ({
      id: item.id || `${cat.id}-${idx}`,
      nome: item.nome,
      preco: parseFloat(String(item.preco || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0,
      desc: item.desc || '',
      ativo: item.ativo !== false,
      categoriaId: cat.id,
    }))
  );

  return { categorias, itens };
}

function getDefaultMenu() {
  const legacy = [
    {
      id: "refrigerantes",
      titulo: "Refrigerantes",
      img: "https://i.ibb.co/8DWyqRjT/refrigerante.png",
      itens: [
        { nome: "Coca-Cola Lata", preco: "6.00", desc: "350ml" },
        { nome: "Guaraná Lata", preco: "5.50", desc: "350ml" },
        { nome: "Sprite Lata", preco: "5.50", desc: "350ml" }
      ]
    },
    {
      id: "porcoes",
      titulo: "Porções",
      img: "https://i.ibb.co/qFxWFY7Y/porcao.png",
      itens: [
        { nome: "Batata Frita", preco: "24.00", desc: "500g crocante" },
        { nome: "Iscas de Frango", preco: "32.00", desc: "500g com molho" },
        { nome: "Anéis de Cebola", preco: "22.00", desc: "Porção média" }
      ]
    },
    {
      id: "hamburguer",
      titulo: "Hambúrguer",
      img: "https://i.ibb.co/sphwvfNN/hamburguer.png",
      itens: [
        { nome: "Clássico", preco: "28.00", desc: "Blend 160g, queijo, salada" },
        { nome: "Cheddar Bacon", preco: "32.00", desc: "Cheddar cremoso e bacon" },
        { nome: "Veggie", preco: "29.00", desc: "Grão-de-bico, maionese verde" }
      ]
    },
    {
      id: "cerveja",
      titulo: "Cerveja",
      img: "https://i.ibb.co/4RnJX9Kn/cerveja.png",
      itens: [
        { nome: "Heineken 330ml", preco: "14.00", desc: "Long neck" },
        { nome: "Stella 330ml", preco: "12.00", desc: "Long neck" },
        { nome: "Original 600ml", preco: "18.00", desc: "Garrafa" }
      ]
    },
    {
      id: "chop",
      titulo: "Chop",
      img: "https://i.ibb.co/7dvx8jzP/chopp.png",
      itens: [
        { nome: "Pilsen 300ml", preco: "8.00", desc: "Taça" },
        { nome: "Pilsen 500ml", preco: "12.00", desc: "Caneca" },
        { nome: "IPA 500ml", preco: "16.00", desc: "Caneca" }
      ]
    }
  ];

  return normalizeMenu(legacy);
}

router.get('/menu', (req, res) => {
  try {
    const raw = readDataFile('menu.json', getDefaultMenu());
    const menu = normalizeMenu(raw);
    res.json(menu);
  } catch (error) {
    console.error('Erro ao ler menu:', error);
    res.status(500).json({ error: 'Erro ao carregar menu' });
  }
});

router.post('/menu', (req, res) => {
  const menu = normalizeMenu(req.body || {});
  if (writeDataFile('menu.json', menu)) {
    res.json({ success: true, message: 'Menu atualizado com sucesso' });
  } else {
    res.status(500).json({ success: false, message: 'Erro ao salvar menu' });
  }
});

module.exports = router;


