const fs = require('fs');
const path = require('path');
const { sequelize, testConnection } = require('../src/config/database');
const {
  Categoria,
  ItemMenu,
  Cartao,
  Transacao,
  ProdutoEstoque,
  MovimentacaoEstoque,
  Evento,
  Ingresso,
  ConfigBilheteria
} = require('../src/models');

const DATA_DIR = path.join(__dirname, '../data');

async function migrateMenu() {
  console.log('📦 Migrando Menu...');
  try {
    const menuPath = path.join(DATA_DIR, 'menu.json');
    if (!fs.existsSync(menuPath)) {
      console.log('  ⚠️  Arquivo menu.json não encontrado, pulando...');
      return;
    }

    const menu = JSON.parse(fs.readFileSync(menuPath, 'utf8'));
    
    for (const categoria of menu) {
      await Categoria.upsert({
        id: categoria.id,
        titulo: categoria.titulo,
        img: categoria.img || null,
        ativo: categoria.ativo !== undefined ? categoria.ativo : true
      });

      if (categoria.itens && Array.isArray(categoria.itens)) {
        for (const item of categoria.itens) {
          // Converter ID decimal para inteiro ou gerar novo ID
          let itemId = item.id;
          if (itemId && typeof itemId === 'number' && itemId % 1 !== 0) {
            // Se for decimal, usar apenas a parte inteira
            itemId = Math.floor(itemId);
          }
          if (!itemId || itemId <= 0) {
            itemId = Date.now() + Math.floor(Math.random() * 1000);
          }
          
          await ItemMenu.upsert({
            id: itemId,
            categoria_id: categoria.id,
            nome: item.nome,
            preco: item.preco,
            desc: item.desc || null,
            ativo: item.ativo !== undefined ? item.ativo : true
          });
        }
      }
    }
    console.log('  ✅ Menu migrado com sucesso');
  } catch (error) {
    console.error('  ❌ Erro ao migrar menu:', error.message);
  }
}

async function migrateCartoes() {
  console.log('💳 Migrando Cartões...');
  try {
    const cartoesPath = path.join(DATA_DIR, 'cartoes.json');
    if (!fs.existsSync(cartoesPath)) {
      console.log('  ⚠️  Arquivo cartoes.json não encontrado, pulando...');
      return;
    }

    const cartoes = JSON.parse(fs.readFileSync(cartoesPath, 'utf8'));
    
    for (const cartao of cartoes) {
      await Cartao.upsert({
        id: cartao.id,
        numero: String(cartao.numero),
        nome: cartao.nome,
        documento: cartao.documento || null,
        saldo: parseFloat(cartao.saldo) || 0,
        ativo: cartao.ativo === 1 || cartao.ativo === true || cartao.ativo === undefined
      });
    }
    console.log(`  ✅ ${cartoes.length} cartões migrados com sucesso`);
  } catch (error) {
    console.error('  ❌ Erro ao migrar cartões:', error.message);
  }
}

async function migrateTransacoes() {
  console.log('💸 Migrando Transações...');
  try {
    const transacoesPath = path.join(DATA_DIR, 'cartoes-transacoes.json');
    if (!fs.existsSync(transacoesPath)) {
      console.log('  ⚠️  Arquivo cartoes-transacoes.json não encontrado, pulando...');
      return;
    }

    const transacoes = JSON.parse(fs.readFileSync(transacoesPath, 'utf8'));
    
    for (const transacao of transacoes) {
      await Transacao.upsert({
        id: transacao.id,
        cartao_id: transacao.cartaoId,
        cartao_numero: transacao.cartaoNumero || null,
        tipo: transacao.tipo,
        valor: parseFloat(transacao.valor) || 0,
        saldo_anterior: parseFloat(transacao.saldoAnterior) || 0,
        saldo_atual: parseFloat(transacao.saldoAtual) || 0,
        descricao: transacao.descricao || null,
        estornado: transacao.estornado || false,
        data_estorno: transacao.dataEstorno || null,
        itens: transacao.itens || null,
        transacoes_estornadas: transacao.transacoesEstornadas || null,
        created_at: transacao.data || new Date()
      });
    }
    console.log(`  ✅ ${transacoes.length} transações migradas com sucesso`);
  } catch (error) {
    console.error('  ❌ Erro ao migrar transações:', error.message);
  }
}

async function migrateEstoque() {
  console.log('📦 Migrando Estoque...');
  try {
    const estoquePath = path.join(DATA_DIR, 'estoque.json');
    if (!fs.existsSync(estoquePath)) {
      console.log('  ⚠️  Arquivo estoque.json não encontrado, pulando...');
      return;
    }

    const estoque = JSON.parse(fs.readFileSync(estoquePath, 'utf8'));
    const produtos = [];
    
    if (estoque.geladeiras && Array.isArray(estoque.geladeiras)) {
      produtos.push(...estoque.geladeiras.map(p => ({ ...p, local: 'geladeiras' })));
    }
    if (estoque.cameraFria && Array.isArray(estoque.cameraFria)) {
      produtos.push(...estoque.cameraFria.map(p => ({ ...p, local: 'cameraFria' })));
    }
    
    for (const produto of produtos) {
      await ProdutoEstoque.upsert({
        id: produto.id,
        nome: produto.nome,
        categoria: produto.categoria || null,
        quantidade: parseInt(produto.quantidade) || 0,
        valor_unitario: parseFloat(produto.valorUnitario) || 0,
        estoque_minimo: parseInt(produto.estoqueMinimo) || 0,
        local: produto.local || 'geladeiras',
        observacao: produto.observacao || null,
        created_at: produto.createdAt || new Date(),
        updated_at: produto.updatedAt || new Date()
      });
    }
    console.log(`  ✅ ${produtos.length} produtos migrados com sucesso`);
  } catch (error) {
    console.error('  ❌ Erro ao migrar estoque:', error.message);
  }
}

async function migrateMovimentacoesEstoque() {
  console.log('📊 Migrando Movimentações de Estoque...');
  try {
    const historicoPath = path.join(DATA_DIR, 'estoque-historico.json');
    if (!fs.existsSync(historicoPath)) {
      console.log('  ⚠️  Arquivo estoque-historico.json não encontrado, pulando...');
      return;
    }

    const historico = JSON.parse(fs.readFileSync(historicoPath, 'utf8'));
    
    for (const mov of historico) {
      // Buscar produto pelo nome para obter o ID
      const produto = await ProdutoEstoque.findOne({ where: { nome: mov.produtoNome || mov.produto } });
      
      if (produto) {
        await MovimentacaoEstoque.upsert({
          id: mov.id,
          produto_id: produto.id,
          produto_nome: mov.produtoNome || mov.produto,
          tipo: mov.tipo === 'saida' ? 'saida' : 'entrada',
          quantidade: parseInt(mov.quantidade) || 0,
          valor_unitario: parseFloat(mov.valorUnitario) || 0,
          total: parseFloat(mov.total) || 0,
          observacao: mov.observacao || null,
          created_at: mov.data || mov.timestamp || new Date()
        });
      }
    }
    console.log(`  ✅ ${historico.length} movimentações migradas com sucesso`);
  } catch (error) {
    console.error('  ❌ Erro ao migrar movimentações:', error.message);
  }
}

async function migrateEventos() {
  console.log('🎉 Migrando Eventos...');
  try {
    const eventosPath = path.join(DATA_DIR, 'eventos.json');
    if (!fs.existsSync(eventosPath)) {
      console.log('  ⚠️  Arquivo eventos.json não encontrado, pulando...');
      return;
    }

    const eventos = JSON.parse(fs.readFileSync(eventosPath, 'utf8'));
    
    for (const evento of eventos) {
      await Evento.upsert({
        id: evento.id,
        nome: evento.nome,
        data: evento.data,
        descricao: evento.descricao || null,
        finalizado: evento.finalizado || false,
        data_finalizacao: evento.dataFinalizacao || null,
        itens: evento.itens || null,
        data_criacao: evento.dataCriacao || evento.created_at || evento.data || new Date()
      });
    }
    console.log(`  ✅ ${eventos.length} eventos migrados com sucesso`);
  } catch (error) {
    console.error('  ❌ Erro ao migrar eventos:', error.message);
  }
}

async function migrateIngressos() {
  console.log('🎫 Migrando Ingressos...');
  try {
    const ingressosPath = path.join(DATA_DIR, 'bilheteria-ingressos.json');
    if (!fs.existsSync(ingressosPath)) {
      console.log('  ⚠️  Arquivo bilheteria-ingressos.json não encontrado, pulando...');
      return;
    }

    const ingressos = JSON.parse(fs.readFileSync(ingressosPath, 'utf8'));
    
    for (const ingresso of ingressos) {
      let dataVendaDate = ingresso.dataVendaDate;
      if (!dataVendaDate && ingresso.dataVenda) {
        dataVendaDate = ingresso.dataVenda.split('T')[0];
      }
      
      await Ingresso.upsert({
        id: ingresso.id,
        codigo: ingresso.codigo,
        tipo: ingresso.tipo,
        valor: parseFloat(ingresso.valor) || 0,
        data_venda: ingresso.dataVenda || new Date(),
        data_venda_date: dataVendaDate || new Date().toISOString().split('T')[0],
        liberado: ingresso.liberado || false,
        data_liberacao: ingresso.dataLiberacao || null
      });
    }
    console.log(`  ✅ ${ingressos.length} ingressos migrados com sucesso`);
  } catch (error) {
    console.error('  ❌ Erro ao migrar ingressos:', error.message);
  }
}

async function migrateConfigBilheteria() {
  console.log('⚙️  Migrando Configurações da Bilheteria...');
  try {
    const configPath = path.join(DATA_DIR, 'bilheteria-config.json');
    if (!fs.existsSync(configPath)) {
      console.log('  ⚠️  Arquivo bilheteria-config.json não encontrado, pulando...');
      return;
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    await ConfigBilheteria.upsert({
      chave: 'precoNormal',
      valor: parseFloat(config.precoNormal) || 0
    });
    
    await ConfigBilheteria.upsert({
      chave: 'precoMeio',
      valor: parseFloat(config.precoMeio) || 0
    });
    
    await ConfigBilheteria.upsert({
      chave: 'precoPassaporte',
      valor: parseFloat(config.precoPassaporte) || 0
    });
    
    console.log('  ✅ Configurações migradas com sucesso');
  } catch (error) {
    console.error('  ❌ Erro ao migrar configurações:', error.message);
  }
}

async function runMigration() {
  console.log('🚀 Iniciando migração de dados JSON para PostgreSQL...\n');
  
  // Testar conexão
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Não foi possível conectar ao banco de dados. Abortando migração.');
    process.exit(1);
  }

  try {
    // Executar migrations para criar tabelas (se não existirem)
    console.log('📋 Verificando/Criando tabelas no banco de dados...\n');
    try {
      const { up } = require('./001-create-tables');
      await up();
      console.log('✅ Tabelas verificadas/criadas com sucesso\n');
    } catch (error) {
      if (error.message.includes('already exists') || error.parent?.code === '42P07') {
        console.log('⚠️  Tabelas já existem, continuando migração de dados...\n');
      } else {
        throw error;
      }
    }

    // Migrar dados
    await migrateMenu();
    await migrateCartoes();
    await migrateTransacoes();
    await migrateEstoque();
    await migrateMovimentacoesEstoque();
    await migrateEventos();
    await migrateIngressos();
    await migrateConfigBilheteria();

    console.log('\n✅ Migração concluída com sucesso!');
  } catch (error) {
    console.error('\n❌ Erro durante migração:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('✨ Processo finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };

