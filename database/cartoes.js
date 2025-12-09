// Módulo de gerenciamento de cartões
const db = require('./db');

class CartoesService {
  // Gerar próximo número de cartão automaticamente
  async gerarProximoNumero() {
    return new Promise((resolve, reject) => {
      // Buscar o maior número que começa com 2500
      db.db.get(
        `SELECT numero FROM cartoes 
         WHERE numero LIKE '2500%' 
         ORDER BY CAST(SUBSTR(numero, 5) AS INTEGER) DESC 
         LIMIT 1`,
        (err, row) => {
          if (err) return reject(err);
          
          if (!row) {
            // Primeiro cartão
            return resolve('25001000');
          }
          
          // Extrair o número após 2500
          const ultimoNumero = parseInt(row.numero.substring(4)) || 999;
          const proximoNumero = ultimoNumero + 1;
          
          resolve(`2500${proximoNumero.toString().padStart(4, '0')}`);
        }
      );
    });
  }

  // Criar novo cartão (com número automático se não fornecido)
  async criarCartao(nome, documento, saldoInicial = 0, numero = null) {
    // Se não fornecer número, gerar automaticamente
    if (!numero) {
      numero = await this.gerarProximoNumero();
    }
    
    return new Promise((resolve, reject) => {
      db.db.run(
        'INSERT INTO cartoes (numero, nome, documento, saldo) VALUES (?, ?, ?, ?)',
        [numero, nome, documento || null, saldoInicial],
        function(err) {
          if (err) {
            if (err.message.includes('UNIQUE')) {
              return reject(new Error('Cartão com este número já existe'));
            }
            return reject(err);
          }
          
          const cartaoId = this.lastID;
          
          // Se houver saldo inicial, criar transação de entrada
          if (saldoInicial > 0) {
            this.registrarTransacao(cartaoId, 'entrada', saldoInicial, 'Saldo inicial')
              .then(() => resolve({ id: cartaoId, numero }))
              .catch(reject);
          } else {
            resolve({ id: cartaoId, numero });
          }
        }.bind(this)
      );
    });
  }

  // Buscar cartão por número
  async buscarCartaoPorNumero(numero) {
    return new Promise((resolve, reject) => {
      db.db.get(
        'SELECT * FROM cartoes WHERE numero = ? AND ativo = 1',
        [numero],
        (err, row) => {
          if (err) return reject(err);
          resolve(row);
        }
      );
    });
  }

  // Buscar cartão por ID
  async buscarCartaoPorId(id) {
    return new Promise((resolve, reject) => {
      db.db.get(
        'SELECT * FROM cartoes WHERE id = ?',
        [id],
        (err, row) => {
          if (err) return reject(err);
          resolve(row);
        }
      );
    });
  }

  // Listar todos os cartões
  async listarCartoes(filtro = null) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM cartoes WHERE 1=1';
      const params = [];
      
      if (filtro) {
        query += ' AND (numero LIKE ? OR nome LIKE ? OR documento LIKE ?)';
        const busca = `%${filtro}%`;
        params.push(busca, busca, busca);
      }
      
      query += ' ORDER BY created_at DESC';
      
      db.db.all(query, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  // Atualizar dados do cartão
  async atualizarCartao(id, dados) {
    return new Promise((resolve, reject) => {
      const campos = [];
      const valores = [];
      
      if (dados.nome !== undefined) {
        campos.push('nome = ?');
        valores.push(dados.nome);
      }
      if (dados.documento !== undefined) {
        campos.push('documento = ?');
        valores.push(dados.documento);
      }
      if (dados.ativo !== undefined) {
        campos.push('ativo = ?');
        valores.push(dados.ativo);
      }
      
      if (campos.length === 0) {
        return resolve();
      }
      
      campos.push('updated_at = CURRENT_TIMESTAMP');
      valores.push(id);
      
      const query = `UPDATE cartoes SET ${campos.join(', ')} WHERE id = ?`;
      
      db.db.run(query, valores, function(err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  }

  // Recarregar saldo do cartão
  async recarregarCartao(cartaoId, valor, descricao = 'Recarga de saldo') {
    return new Promise((resolve, reject) => {
      if (valor <= 0) {
        return reject(new Error('Valor deve ser maior que zero'));
      }
      
      // Atualizar saldo
      db.db.run(
        'UPDATE cartoes SET saldo = saldo + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [valor, cartaoId],
        function(err) {
          if (err) return reject(err);
          
          // Registrar transação
          this.registrarTransacao(cartaoId, 'entrada', valor, descricao)
            .then(() => resolve(this.changes))
            .catch(reject);
        }.bind(this)
      );
    });
  }

  // Registrar transação
  async registrarTransacao(cartaoId, tipo, valor, descricao = null, vendaId = null) {
    return new Promise((resolve, reject) => {
      db.db.run(
        'INSERT INTO transacoes (cartao_id, tipo, valor, descricao, venda_id) VALUES (?, ?, ?, ?, ?)',
        [cartaoId, tipo, valor, descricao, vendaId],
        function(err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });
  }

  // Debitar do cartão (usado em compras)
  async debitarCartao(cartaoId, valor, vendaId, descricao = 'Compra') {
    return new Promise((resolve, reject) => {
      if (valor <= 0) {
        return reject(new Error('Valor deve ser maior que zero'));
      }
      
      // Verificar saldo
      db.db.get(
        'SELECT saldo FROM cartoes WHERE id = ?',
        [cartaoId],
        (err, cartao) => {
          if (err) return reject(err);
          if (!cartao) return reject(new Error('Cartão não encontrado'));
          
          if (cartao.saldo < valor) {
            return reject(new Error('Saldo insuficiente'));
          }
          
          // Atualizar saldo
          db.db.run(
            'UPDATE cartoes SET saldo = saldo - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [valor, cartaoId],
            function(err) {
              if (err) return reject(err);
              
              // Registrar transação
              this.registrarTransacao(cartaoId, 'saida', valor, descricao, vendaId)
                .then(() => resolve(cartao.saldo - valor))
                .catch(reject);
            }.bind(this)
          );
        }
      );
    });
  }

  // Obter histórico de transações do cartão
  async getHistoricoCartao(cartaoId, limite = 50) {
    return new Promise((resolve, reject) => {
      db.db.all(
        `SELECT t.*, v.mesa, v.total as venda_total 
         FROM transacoes t 
         LEFT JOIN vendas v ON t.venda_id = v.id 
         WHERE t.cartao_id = ? 
         ORDER BY t.created_at DESC 
         LIMIT ?`,
        [cartaoId, limite],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }

  // Obter saldo atual do cartão
  async getSaldoCartao(cartaoId) {
    return new Promise((resolve, reject) => {
      db.db.get(
        'SELECT saldo FROM cartoes WHERE id = ?',
        [cartaoId],
        (err, row) => {
          if (err) return reject(err);
          resolve(row ? row.saldo : 0);
        }
      );
    });
  }

  // Obter relatório de movimentações (entradas e saídas)
  async getRelatorioMovimentacoes(dataInicio = null, dataFim = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT 
          tipo,
          SUM(valor) as total,
          COUNT(*) as quantidade
        FROM transacoes
        WHERE 1=1
      `;
      const params = [];
      
      if (dataInicio) {
        query += ' AND DATE(created_at) >= ?';
        params.push(dataInicio);
      }
      if (dataFim) {
        query += ' AND DATE(created_at) <= ?';
        params.push(dataFim);
      }
      
      query += ' GROUP BY tipo';
      
      db.db.all(query, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
}

module.exports = new CartoesService();

