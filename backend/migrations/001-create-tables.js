const { sequelize } = require('../src/config/database');

async function up() {
  const queryInterface = sequelize.getQueryInterface();

  // Criar extensão para UUID se necessário
  await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

  // Tabela categorias
  await queryInterface.createTable('categorias', {
    id: {
      type: 'VARCHAR(255)',
      primaryKey: true,
      allowNull: false
    },
    titulo: {
      type: 'VARCHAR(255)',
      allowNull: false
    },
    img: {
      type: 'TEXT',
      allowNull: true
    },
    ativo: {
      type: 'BOOLEAN',
      defaultValue: true
    },
    created_at: {
      type: 'TIMESTAMP',
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: 'TIMESTAMP',
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  });

  // Tabela itens_menu
  await queryInterface.createTable('itens_menu', {
    id: {
      type: 'BIGINT',
      primaryKey: true,
      allowNull: false
    },
    categoria_id: {
      type: 'VARCHAR(255)',
      allowNull: false,
      references: {
        model: 'categorias',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    nome: {
      type: 'VARCHAR(255)',
      allowNull: false
    },
    preco: {
      type: 'VARCHAR(50)',
      allowNull: false
    },
    desc: {
      type: 'TEXT',
      allowNull: true
    },
    ativo: {
      type: 'BOOLEAN',
      defaultValue: true
    },
    created_at: {
      type: 'TIMESTAMP',
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: 'TIMESTAMP',
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  });

  // Tabela cartoes
  await queryInterface.createTable('cartoes', {
    id: {
      type: 'BIGINT',
      primaryKey: true,
      allowNull: false
    },
    numero: {
      type: 'VARCHAR(50)',
      allowNull: false,
      unique: true
    },
    nome: {
      type: 'VARCHAR(255)',
      allowNull: false
    },
    documento: {
      type: 'VARCHAR(50)',
      allowNull: true
    },
    saldo: {
      type: 'DECIMAL(15, 2)',
      allowNull: false,
      defaultValue: 0
    },
    ativo: {
      type: 'BOOLEAN',
      defaultValue: true
    },
    created_at: {
      type: 'TIMESTAMP',
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: 'TIMESTAMP',
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  });

  // Criar ENUM para tipo de transação
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE tipo_transacao AS ENUM ('compra', 'recarga', 'estorno');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Tabela transacoes
  await queryInterface.sequelize.query(`
    CREATE TABLE IF NOT EXISTS transacoes (
      id BIGINT PRIMARY KEY,
      cartao_id BIGINT NOT NULL REFERENCES cartoes(id) ON DELETE CASCADE ON UPDATE CASCADE,
      cartao_numero VARCHAR(50),
      tipo tipo_transacao NOT NULL,
      valor DECIMAL(15, 2) NOT NULL,
      saldo_anterior DECIMAL(15, 2) NOT NULL,
      saldo_atual DECIMAL(15, 2) NOT NULL,
      descricao TEXT,
      estornado BOOLEAN DEFAULT false,
      data_estorno TIMESTAMP,
      itens JSONB,
      transacoes_estornadas BIGINT[],
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Criar ENUM para local de estoque
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE local_estoque AS ENUM ('geladeiras', 'cameraFria');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Tabela produtos_estoque
  await queryInterface.sequelize.query(`
    CREATE TABLE IF NOT EXISTS produtos_estoque (
      id BIGINT PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      categoria VARCHAR(255),
      quantidade INTEGER NOT NULL DEFAULT 0,
      valor_unitario DECIMAL(10, 2) NOT NULL DEFAULT 0,
      estoque_minimo INTEGER NOT NULL DEFAULT 0,
      local local_estoque NOT NULL,
      observacao TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Criar ENUM para tipo de movimentação
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE tipo_movimentacao AS ENUM ('entrada', 'saida');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Tabela movimentacoes_estoque
  await queryInterface.sequelize.query(`
    CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
      id BIGINT PRIMARY KEY,
      produto_id BIGINT NOT NULL REFERENCES produtos_estoque(id) ON DELETE CASCADE ON UPDATE CASCADE,
      produto_nome VARCHAR(255) NOT NULL,
      tipo tipo_movimentacao NOT NULL,
      quantidade INTEGER NOT NULL,
      valor_unitario DECIMAL(10, 2) NOT NULL DEFAULT 0,
      total DECIMAL(10, 2) NOT NULL DEFAULT 0,
      observacao TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Tabela eventos
  await queryInterface.createTable('eventos', {
    id: {
      type: 'BIGINT',
      primaryKey: true,
      allowNull: false
    },
    nome: {
      type: 'VARCHAR(255)',
      allowNull: false
    },
    data: {
      type: 'DATE',
      allowNull: false
    },
    descricao: {
      type: 'TEXT',
      allowNull: true
    },
    finalizado: {
      type: 'BOOLEAN',
      defaultValue: false
    },
    data_finalizacao: {
      type: 'TIMESTAMP',
      allowNull: true
    },
    itens: {
      type: 'JSONB',
      allowNull: true
    },
    data_criacao: {
      type: 'TIMESTAMP',
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  });

  // Criar ENUM para tipo de ingresso
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE tipo_ingresso AS ENUM ('normal', 'meio', 'passaporte');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Tabela ingressos
  await queryInterface.sequelize.query(`
    CREATE TABLE IF NOT EXISTS ingressos (
      id BIGINT PRIMARY KEY,
      codigo VARCHAR(50) NOT NULL UNIQUE,
      tipo tipo_ingresso NOT NULL,
      valor DECIMAL(10, 2) NOT NULL,
      data_venda TIMESTAMP NOT NULL,
      data_venda_date DATE NOT NULL,
      liberado BOOLEAN DEFAULT false,
      data_liberacao TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Tabela config_bilheteria
  await queryInterface.createTable('config_bilheteria', {
    id: {
      type: 'BIGINT',
      primaryKey: true,
      autoIncrement: true
    },
    chave: {
      type: 'VARCHAR(50)',
      allowNull: false,
      unique: true
    },
    valor: {
      type: 'DECIMAL(10, 2)',
      allowNull: false
    },
    updated_at: {
      type: 'TIMESTAMP',
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  });

  // Criar índices (se não existirem)
  try {
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS cartoes_numero_idx ON cartoes(numero);
      CREATE UNIQUE INDEX IF NOT EXISTS ingressos_codigo_idx ON ingressos(codigo);
      CREATE INDEX IF NOT EXISTS transacoes_cartao_id_created_at_idx ON transacoes(cartao_id, created_at);
      CREATE INDEX IF NOT EXISTS movimentacoes_produto_id_created_at_idx ON movimentacoes_estoque(produto_id, created_at);
      CREATE UNIQUE INDEX IF NOT EXISTS config_bilheteria_chave_idx ON config_bilheteria(chave);
    `);
  } catch (error) {
    // Ignorar erros de índices já existentes
    if (!error.message.includes('already exists')) {
      throw error;
    }
  }
}

async function down() {
  const queryInterface = sequelize.getQueryInterface();
  
  await queryInterface.dropTable('movimentacoes_estoque');
  await queryInterface.dropTable('produtos_estoque');
  await queryInterface.dropTable('transacoes');
  await queryInterface.dropTable('itens_menu');
  await queryInterface.dropTable('ingressos');
  await queryInterface.dropTable('eventos');
  await queryInterface.dropTable('config_bilheteria');
  await queryInterface.dropTable('categorias');
  await queryInterface.dropTable('cartoes');
}

module.exports = { up, down };

