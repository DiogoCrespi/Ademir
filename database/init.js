// Script para inicializar o banco de dados SQLite
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'vendas.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Dados iniciais
const initialData = {
  categorias: [
    { id: "refrigerantes", titulo: "Refrigerantes", img: "./refrigerante.png" },
    { id: "porcoes", titulo: "Porções", img: "./porção.png" },
    { id: "hamburguer", titulo: "Hambúrguer", img: "./hamburguer.png" },
    { id: "cerveja", titulo: "Cerveja", img: "./cerveja.png" },
    { id: "chop", titulo: "Chop", img: "./chopp.png" }
  ],
  itens: [
    // Refrigerantes
    { categoria_id: "refrigerantes", nome: "Coca-Cola Lata", preco: 6.00, descricao: "350ml" },
    { categoria_id: "refrigerantes", nome: "Guaraná Lata", preco: 5.50, descricao: "350ml" },
    { categoria_id: "refrigerantes", nome: "Sprite Lata", preco: 5.50, descricao: "350ml" },
    // Porções
    { categoria_id: "porcoes", nome: "Batata Frita", preco: 24.00, descricao: "500g crocante" },
    { categoria_id: "porcoes", nome: "Iscas de Frango", preco: 32.00, descricao: "500g com molho" },
    { categoria_id: "porcoes", nome: "Anéis de Cebola", preco: 22.00, descricao: "Porção média" },
    // Hambúrguer
    { categoria_id: "hamburguer", nome: "Clássico", preco: 28.00, descricao: "Blend 160g, queijo, salada" },
    { categoria_id: "hamburguer", nome: "Cheddar Bacon", preco: 32.00, descricao: "Cheddar cremoso e bacon" },
    { categoria_id: "hamburguer", nome: "Veggie", preco: 29.00, descricao: "Grão-de-bico, maionese verde" },
    // Cerveja
    { categoria_id: "cerveja", nome: "Heineken 330ml", preco: 14.00, descricao: "Long neck" },
    { categoria_id: "cerveja", nome: "Stella 330ml", preco: 12.00, descricao: "Long neck" },
    { categoria_id: "cerveja", nome: "Original 600ml", preco: 18.00, descricao: "Garrafa" },
    // Chop
    { categoria_id: "chop", nome: "Pilsen 300ml", preco: 8.00, descricao: "Taça" },
    { categoria_id: "chop", nome: "Pilsen 500ml", preco: 12.00, descricao: "Caneca" },
    { categoria_id: "chop", nome: "IPA 500ml", preco: 16.00, descricao: "Caneca" }
  ]
};

function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Erro ao conectar ao banco:', err);
        return reject(err);
      }
      console.log('Conectado ao banco de dados SQLite');
    });

    // Ler e executar schema
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    
    db.exec(schema, (err) => {
      if (err) {
        console.error('Erro ao criar schema:', err);
        return reject(err);
      }
      console.log('Schema criado com sucesso');
    });

    // Inserir dados iniciais
    db.serialize(() => {
      // Inserir categorias
      const stmtCategorias = db.prepare(`
        INSERT OR IGNORE INTO categorias (id, titulo, img) 
        VALUES (?, ?, ?)
      `);
      
      initialData.categorias.forEach(cat => {
        stmtCategorias.run(cat.id, cat.titulo, cat.img);
      });
      stmtCategorias.finalize();
      console.log('Categorias inseridas');

      // Inserir itens
      const stmtItens = db.prepare(`
        INSERT OR IGNORE INTO itens (categoria_id, nome, preco, descricao) 
        VALUES (?, ?, ?, ?)
      `);
      
      initialData.itens.forEach(item => {
        stmtItens.run(item.categoria_id, item.nome, item.preco, item.descricao);
      });
      stmtItens.finalize();
      console.log('Itens inseridos');
    });

    db.close((err) => {
      if (err) {
        console.error('Erro ao fechar banco:', err);
        return reject(err);
      }
      console.log('Banco de dados inicializado com sucesso!');
      resolve();
    });
  });
}

// Executar se chamado diretamente
if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { initDatabase, DB_PATH };

