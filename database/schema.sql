-- Schema do banco de dados para o sistema de vendas

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categorias (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    img TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens/produtos
CREATE TABLE IF NOT EXISTS itens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria_id TEXT NOT NULL,
    nome TEXT NOT NULL,
    preco REAL NOT NULL,
    descricao TEXT,
    ativo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS vendas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mesa TEXT,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pendente', -- pendente, concluida, cancelada
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens da venda (detalhes)
CREATE TABLE IF NOT EXISTS itens_venda (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venda_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    item_nome TEXT NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    preco_unitario REAL NOT NULL,
    subtotal REAL NOT NULL,
    observacao TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venda_id) REFERENCES vendas(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES itens(id)
);

-- Tabela de cartões
CREATE TABLE IF NOT EXISTS cartoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    documento TEXT,
    saldo REAL DEFAULT 0.0,
    ativo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de transações (entradas e saídas dos cartões)
CREATE TABLE IF NOT EXISTS transacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cartao_id INTEGER NOT NULL,
    tipo TEXT NOT NULL, -- entrada (recarga), saida (compra)
    valor REAL NOT NULL,
    descricao TEXT,
    venda_id INTEGER, -- NULL para recargas, preenchido para compras
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cartao_id) REFERENCES cartoes(id) ON DELETE CASCADE,
    FOREIGN KEY (venda_id) REFERENCES vendas(id) ON DELETE SET NULL
);

-- Tabela de pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venda_id INTEGER NOT NULL,
    cartao_id INTEGER, -- Referência ao cartão usado
    metodo TEXT NOT NULL, -- pinpad, cartao_digitado
    numero_cartao TEXT,
    nome_portador TEXT,
    saldo_antes REAL,
    saldo_depois REAL,
    horario TEXT,
    valor REAL NOT NULL,
    status TEXT DEFAULT 'pendente', -- pendente, aprovado, recusado
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venda_id) REFERENCES vendas(id) ON DELETE CASCADE,
    FOREIGN KEY (cartao_id) REFERENCES cartoes(id) ON DELETE SET NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_itens_categoria ON itens(categoria_id);
CREATE INDEX IF NOT EXISTS idx_itens_venda_venda ON itens_venda(venda_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_venda ON pagamentos(venda_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_cartao ON pagamentos(cartao_id);
CREATE INDEX IF NOT EXISTS idx_vendas_data ON vendas(created_at);
CREATE INDEX IF NOT EXISTS idx_vendas_status ON vendas(status);
CREATE INDEX IF NOT EXISTS idx_cartoes_numero ON cartoes(numero);
CREATE INDEX IF NOT EXISTS idx_transacoes_cartao ON transacoes(cartao_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON transacoes(created_at);

