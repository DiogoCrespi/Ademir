// Módulo de acesso ao banco de dados
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'vendas.db');

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('Erro ao conectar:', err);
          return reject(err);
        }
        resolve();
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();
      this.db.close((err) => {
        if (err) return reject(err);
        this.db = null;
        resolve();
      });
    });
  }

  // Categorias
  async getCategorias() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM categorias ORDER BY titulo', (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  // Itens
  async getItens(categoriaId = null) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM itens WHERE ativo = 1';
      const params = [];
      
      if (categoriaId) {
        query += ' AND categoria_id = ?';
        params.push(categoriaId);
      }
      
      query += ' ORDER BY nome';
      
      this.db.all(query, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  // Vendas
  async criarVenda(mesa, itens) {
    return new Promise((resolve, reject) => {
      const total = itens.reduce((sum, item) => sum + (item.preco * item.qty), 0);
      
      this.db.run(
        'INSERT INTO vendas (mesa, total, status) VALUES (?, ?, ?)',
        [mesa || null, total, 'pendente'],
        function(err) {
          if (err) return reject(err);
          const vendaId = this.lastID;
          
          // Inserir itens da venda
          const stmt = this.db.prepare(
            'INSERT INTO itens_venda (venda_id, item_id, item_nome, quantidade, preco_unitario, subtotal, observacao) VALUES (?, ?, ?, ?, ?, ?, ?)'
          );
          
          itens.forEach(item => {
            stmt.run(
              vendaId,
              item.id || null,
              item.nome,
              item.qty,
              item.preco,
              item.preco * item.qty,
              item.obs || null
            );
          });
          
          stmt.finalize((err) => {
            if (err) return reject(err);
            resolve(vendaId);
          });
        }.bind(this)
      );
    });
  }

  async registrarPagamento(vendaId, dadosPagamento) {
    return new Promise((resolve, reject) => {
      // Buscar valor da venda
      this.db.get('SELECT total FROM vendas WHERE id = ?', [vendaId], (err, venda) => {
        if (err) return reject(err);
        if (!venda) return reject(new Error('Venda não encontrada'));
        
        const valorVenda = venda.total;
        let saldoAntes = null;
        let saldoDepois = null;
        let cartaoId = null;
        
        // Se houver cartão, buscar saldo antes e depois
        if (dadosPagamento.cartao_id) {
          cartaoId = dadosPagamento.cartao_id;
          this.db.get('SELECT saldo FROM cartoes WHERE id = ?', [cartaoId], (err, cartao) => {
            if (err) return reject(err);
            saldoAntes = cartao.saldo;
            saldoDepois = cartao.saldo - valorVenda;
          });
        }
        
        this.db.run(
          `INSERT INTO pagamentos 
           (venda_id, cartao_id, metodo, numero_cartao, nome_portador, saldo_antes, saldo_depois, horario, valor, status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            vendaId,
            cartaoId,
            dadosPagamento.metodo || 'pinpad',
            dadosPagamento.numero_cartao || null,
            dadosPagamento.nome_portador || null,
            saldoAntes,
            saldoDepois,
            dadosPagamento.horario || null,
            valorVenda,
            'aprovado'
          ],
          function(err) {
            if (err) return reject(err);
            
            // Se houver cartão, debitar o valor
            if (cartaoId) {
              this.db.run(
                'UPDATE cartoes SET saldo = saldo - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [valorVenda, cartaoId],
                (err) => {
                  if (err) return reject(err);
                  
                  // Registrar transação de saída
                  this.db.run(
                    'INSERT INTO transacoes (cartao_id, tipo, valor, descricao, venda_id) VALUES (?, ?, ?, ?, ?)',
                    [cartaoId, 'saida', valorVenda, 'Compra', vendaId],
                    (err) => {
                      if (err) return reject(err);
                      
                      // Atualizar status da venda
                      this.db.run(
                        'UPDATE vendas SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                        ['concluida', vendaId],
                        (err) => {
                          if (err) return reject(err);
                          resolve(this.lastID);
                        }
                      );
                    }
                  );
                }
              );
            } else {
              // Atualizar status da venda
              this.db.run(
                'UPDATE vendas SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                ['concluida', vendaId],
                (err) => {
                  if (err) return reject(err);
                  resolve(this.lastID);
                }
              );
            }
          }.bind(this)
        );
      });
    });
  }

  async getVendas(dataInicio = null, dataFim = null) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM vendas WHERE 1=1';
      const params = [];
      
      if (dataInicio) {
        query += ' AND DATE(created_at) >= ?';
        params.push(dataInicio);
      }
      if (dataFim) {
        query += ' AND DATE(created_at) <= ?';
        params.push(dataFim);
      }
      
      query += ' ORDER BY created_at DESC';
      
      this.db.all(query, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  async getVendaCompleta(vendaId) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM vendas WHERE id = ?', [vendaId], (err, venda) => {
        if (err) return reject(err);
        if (!venda) return resolve(null);
        
        // Buscar itens da venda
        this.db.all('SELECT * FROM itens_venda WHERE venda_id = ?', [vendaId], (err, itens) => {
          if (err) return reject(err);
          
          // Buscar pagamento
          this.db.get('SELECT * FROM pagamentos WHERE venda_id = ?', [vendaId], (err, pagamento) => {
            if (err) return reject(err);
            
            resolve({
              ...venda,
              itens,
              pagamento
            });
          });
        });
      });
    });
  }
}

module.exports = new Database();

