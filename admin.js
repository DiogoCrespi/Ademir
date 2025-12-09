// Script da página de administração de cartões
// Nota: Este código é para demonstração. Em produção, você precisaria de um backend
// para conectar com o banco de dados SQLite

let cartoes = [];
let cartaoEditando = null;
let saldosAnteriores = {}; // Armazenar saldos anteriores para detectar mudanças

const cartoesGrid = document.getElementById('cartoesGrid');
const searchInput = document.getElementById('searchInput');
const btnNovoCartao = document.getElementById('btnNovoCartao');
const modalCartao = document.getElementById('modalCartao');
const modalCartaoTitle = document.getElementById('modalCartaoTitle');
const modalCartaoClose = document.getElementById('modalCartaoClose');
const modalCartaoCancel = document.getElementById('modalCartaoCancel');
const modalCartaoSave = document.getElementById('modalCartaoSave');
const cartaoNumero = document.getElementById('cartaoNumero');
const cartaoNome = document.getElementById('cartaoNome');
const cartaoDocumento = document.getElementById('cartaoDocumento');
const cartaoSaldoInicial = document.getElementById('cartaoSaldoInicial');
const modalRecarga = document.getElementById('modalRecarga');
const modalRecargaClose = document.getElementById('modalRecargaClose');
const modalRecargaCancel = document.getElementById('modalRecargaCancel');
const modalRecargaConfirm = document.getElementById('modalRecargaConfirm');
const recargaCartaoInfo = document.getElementById('recargaCartaoInfo');
const recargaSaldoAtual = document.getElementById('recargaSaldoAtual');
const recargaValor = document.getElementById('recargaValor');
const recargaDescricao = document.getElementById('recargaDescricao');
const toast = document.getElementById('toast');
const btnRelatorio = document.getElementById('btnRelatorio');
const modalRelatorio = document.getElementById('modalRelatorio');
const modalRelatorioClose = document.getElementById('modalRelatorioClose');
const modalRelatorioFechar = document.getElementById('modalRelatorioFechar');
const relatorioContent = document.getElementById('relatorioContent');

let cartaoRecarregando = null;

// Funções auxiliares
function formatPrice(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function showToast(message, duracao = 3000) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, duracao);
}

// Gerar próximo número de cartão
function gerarProximoNumero() {
  if (cartoes.length === 0) {
    return '25001000';
  }
  
  // Buscar o maior número que começa com 2500
  const numeros = cartoes
    .map(c => c.numero)
    .filter(n => n.startsWith('2500'))
    .map(n => {
      const num = parseInt(n.substring(4));
      return isNaN(num) ? 0 : num;
    });
  
  const ultimoNumero = numeros.length > 0 ? Math.max(...numeros) : 999;
  const proximoNumero = ultimoNumero + 1;
  
  return `2500${proximoNumero.toString().padStart(4, '0')}`;
}

// Carregar cartões (simulado - em produção viria do backend)
function loadCartoes() {
  // Simulação - em produção, fazer requisição ao backend
  // fetch('/api/cartoes').then(r => r.json()).then(data => { ... })
  
  // Dados de exemplo
  cartoes = JSON.parse(localStorage.getItem('cartoes') || '[]');
  
  // Inicializar saldos anteriores
  cartoes.forEach(cartao => {
    saldosAnteriores[cartao.id] = cartao.saldo;
  });
  
  renderCartoes();
}

// Verificar mudanças nos saldos
function verificarMudancasSaldos() {
  try {
    const cartoesRaw = localStorage.getItem('cartoes');
    if (!cartoesRaw) return;
    
    const cartoesAtuais = JSON.parse(cartoesRaw);
    if (!Array.isArray(cartoesAtuais)) return;
    
    // Comparar cada cartão
    cartoesAtuais.forEach(cartao => {
      const saldoAnterior = saldosAnteriores[cartao.id];
      const saldoAtual = parseFloat(cartao.saldo) || 0;
      
      // Se o saldo mudou e não foi uma mudança que nós mesmos fizemos
      if (saldoAnterior !== undefined && Math.abs(saldoAnterior - saldoAtual) > 0.01) {
        const diferenca = saldoAtual - saldoAnterior;
        const tipo = diferenca > 0 ? 'recarga' : 'compra';
        const valor = Math.abs(diferenca);
        
        // Só mostrar notificação se a diferença for significativa (maior que 0.01)
        if (valor > 0.01) {
          if (tipo === 'compra') {
            showToast(`💳 Cartão ${cartao.numero}: Compra de ${formatPrice(valor)}. Saldo: ${formatPrice(saldoAnterior)} → ${formatPrice(saldoAtual)}`, 5000);
          } else {
            showToast(`💰 Cartão ${cartao.numero}: Recarga de ${formatPrice(valor)}. Saldo: ${formatPrice(saldoAnterior)} → ${formatPrice(saldoAtual)}`, 5000);
          }
        }
        
        // Atualizar saldo anterior
        saldosAnteriores[cartao.id] = saldoAtual;
      } else if (saldoAnterior === undefined) {
        // Novo cartão - apenas registrar o saldo
        saldosAnteriores[cartao.id] = saldoAtual;
      }
    });
    
    // Atualizar lista se houver mudanças estruturais
    const cartoesAtuaisStr = JSON.stringify(cartoesAtuais);
    const cartoesAtuaisStrOrdenado = JSON.stringify(cartoesAtuais.sort((a, b) => a.id - b.id));
    const cartoesStr = JSON.stringify(cartoes.sort((a, b) => a.id - b.id));
    
    if (cartoesAtuaisStrOrdenado !== cartoesStr) {
      cartoes = cartoesAtuais;
      renderCartoes(searchInput.value);
    }
    
    // Verificar se algum cartão foi removido
    Object.keys(saldosAnteriores).forEach(id => {
      if (!cartoesAtuais.find(c => String(c.id) === String(id))) {
        delete saldosAnteriores[id];
      }
    });
  } catch (error) {
    console.error('Erro ao verificar mudanças nos saldos:', error);
  }
}

function saveCartoes() {
  localStorage.setItem('cartoes', JSON.stringify(cartoes));
}

function renderCartoes(filtro = '') {
  cartoesGrid.innerHTML = '';
  
  let cartoesFiltrados = cartoes;
  
  if (filtro) {
    const busca = filtro.toLowerCase();
    cartoesFiltrados = cartoes.filter(c => 
      c.numero.toLowerCase().includes(busca) ||
      c.nome.toLowerCase().includes(busca) ||
      (c.documento && c.documento.toLowerCase().includes(busca))
    );
  }
  
  if (cartoesFiltrados.length === 0) {
    cartoesGrid.innerHTML = '<div class="empty-state">Nenhum cartão encontrado</div>';
    return;
  }
  
  cartoesFiltrados.forEach(cartao => {
    const card = document.createElement('div');
    card.className = 'card-item';
    card.innerHTML = `
      <div class="card-header">
        <div class="card-number">${cartao.numero}</div>
        <span class="card-status ${cartao.ativo ? 'status-ativo' : 'status-inativo'}">
          ${cartao.ativo ? 'Ativo' : 'Inativo'}
        </span>
      </div>
      <div class="card-info">
        <div class="card-info-item"><strong>Nome:</strong> ${cartao.nome}</div>
        ${cartao.documento ? `<div class="card-info-item"><strong>Documento:</strong> ${cartao.documento}</div>` : ''}
        <div class="card-info-item"><strong>Saldo:</strong> ${formatPrice(cartao.saldo)}</div>
      </div>
      <div class="card-actions">
        <button class="btn-small accent" onclick="recarregarCartao(${cartao.id})">Recarregar</button>
        <button class="btn-small" onclick="editarCartao(${cartao.id})">Editar</button>
        <button class="btn-small" onclick="toggleCartao(${cartao.id})" style="color: ${cartao.ativo ? 'var(--danger)' : 'var(--accent)'}">
          ${cartao.ativo ? 'Desativar' : 'Ativar'}
        </button>
      </div>
    `;
    cartoesGrid.appendChild(card);
  });
}

// Abrir modal de novo cartão
function novoCartao() {
  cartaoEditando = null;
  modalCartaoTitle.textContent = 'Novo Cartão';
  cartaoNumero.value = gerarProximoNumero();
  cartaoNome.value = '';
  cartaoDocumento.value = '';
  cartaoSaldoInicial.value = '';
  cartaoNumero.disabled = true;
  cartaoNumero.style.background = '#0a0f1a';
  cartaoNumero.style.cursor = 'not-allowed';
  modalCartao.classList.add('open');
}

// Editar cartão
function editarCartao(id) {
  const cartao = cartoes.find(c => c.id === id);
  if (!cartao) return;
  
  cartaoEditando = cartao;
  modalCartaoTitle.textContent = 'Editar Cartão';
  cartaoNumero.value = cartao.numero;
  cartaoNome.value = cartao.nome;
  cartaoDocumento.value = cartao.documento || '';
  cartaoSaldoInicial.value = '';
  cartaoNumero.disabled = true;
  cartaoNumero.style.background = '#0a0f1a';
  cartaoNumero.style.cursor = 'not-allowed';
  modalCartao.classList.add('open');
}

// Salvar cartão
function salvarCartao() {
  const numero = cartaoNumero.value.trim();
  const nome = cartaoNome.value.trim();
  const documento = cartaoDocumento.value.trim();
  const saldoInicial = parseFloat(cartaoSaldoInicial.value) || 0;
  
  if (!nome) {
    showToast('Preencha o nome do cartão');
    return;
  }
  
  if (cartaoEditando) {
    // Editar
    cartaoEditando.nome = nome;
    cartaoEditando.documento = documento || null;
    showToast('Cartão atualizado com sucesso');
  } else {
    // Novo - número já foi gerado automaticamente
    if (cartoes.find(c => c.numero === numero)) {
      showToast('Cartão com este número já existe');
      return;
    }
    
    const novoCartao = {
      id: Date.now(),
      numero,
      nome,
      documento: documento || null,
      saldo: saldoInicial,
      ativo: 1,
      created_at: new Date().toISOString()
    };
    
    cartoes.push(novoCartao);
    showToast(`Cartão ${numero} criado com sucesso`);
  }
  
  saveCartoes();
  renderCartoes(searchInput.value);
  fecharModalCartao();
}

// Recarregar cartão
function recarregarCartao(id) {
  const cartao = cartoes.find(c => c.id === id);
  if (!cartao) return;
  
  cartaoRecarregando = cartao;
  recargaCartaoInfo.value = `${cartao.numero} - ${cartao.nome}`;
  recargaSaldoAtual.value = formatPrice(cartao.saldo);
  recargaValor.value = '';
  recargaDescricao.value = '';
  modalRecarga.classList.add('open');
}

function confirmarRecarga() {
  const valor = parseFloat(recargaValor.value);
  const descricao = recargaDescricao.value.trim();
  
  if (!valor || valor <= 0) {
    showToast('Informe um valor válido');
    return;
  }
  
  if (!cartaoRecarregando) return;
  
  recargaEmAndamento = true;
  
  const saldoAnterior = cartaoRecarregando.saldo;
  cartaoRecarregando.saldo += valor;
  saldosAnteriores[cartaoRecarregando.id] = cartaoRecarregando.saldo;
  
  saveCartoes();
  renderCartoes(searchInput.value);
  
  const saldoAtual = cartaoRecarregando.saldo;
  showToast(`💰 Recarga de ${formatPrice(valor)} realizada! Saldo: ${formatPrice(saldoAnterior)} → ${formatPrice(saldoAtual)}`, 4000);
  fecharModalRecarga();
  
  // Liberar flag após um tempo
  setTimeout(() => {
    recargaEmAndamento = false;
  }, 2000);
}

// Toggle ativo/inativo
function toggleCartao(id) {
  const cartao = cartoes.find(c => c.id === id);
  if (!cartao) return;
  
  cartao.ativo = cartao.ativo ? 0 : 1;
  saveCartoes();
  renderCartoes(searchInput.value);
  showToast(`Cartão ${cartao.ativo ? 'ativado' : 'desativado'}`);
}

// Fechar modais
function fecharModalCartao() {
  modalCartao.classList.remove('open');
  cartaoEditando = null;
}

function fecharModalRecarga() {
  modalRecarga.classList.remove('open');
  cartaoRecarregando = null;
}

// Gerar relatório
function gerarRelatorio() {
  const cartoesAtuais = JSON.parse(localStorage.getItem('cartoes') || '[]');
  
  // Calcular estatísticas
  const totalCartoes = cartoesAtuais.length;
  const cartoesAtivos = cartoesAtuais.filter(c => c.ativo).length;
  const cartoesInativos = totalCartoes - cartoesAtivos;
  
  // Calcular saldos
  const saldoTotal = cartoesAtuais.reduce((sum, c) => sum + (parseFloat(c.saldo) || 0), 0);
  const saldoMedio = totalCartoes > 0 ? saldoTotal / totalCartoes : 0;
  
  // Cartões com maior e menor saldo
  const cartoesOrdenados = [...cartoesAtuais].sort((a, b) => (parseFloat(b.saldo) || 0) - (parseFloat(a.saldo) || 0));
  
  // Gerar HTML do relatório
  let html = `
    <div class="relatorio-section">
      <h3>📊 Resumo Geral</h3>
      <div class="relatorio-grid">
        <div class="relatorio-item">
          <div class="relatorio-item-label">Total de Cartões</div>
          <div class="relatorio-item-value">${totalCartoes}</div>
        </div>
        <div class="relatorio-item">
          <div class="relatorio-item-label">Cartões Ativos</div>
          <div class="relatorio-item-value positive">${cartoesAtivos}</div>
        </div>
        <div class="relatorio-item">
          <div class="relatorio-item-label">Cartões Inativos</div>
          <div class="relatorio-item-value negative">${cartoesInativos}</div>
        </div>
        <div class="relatorio-item">
          <div class="relatorio-item-label">Saldo Total</div>
          <div class="relatorio-item-value positive">${formatPrice(saldoTotal)}</div>
        </div>
        <div class="relatorio-item">
          <div class="relatorio-item-label">Saldo Médio</div>
          <div class="relatorio-item-value">${formatPrice(saldoMedio)}</div>
        </div>
      </div>
    </div>

    <div class="relatorio-section">
      <h3>💳 Top 10 Cartões com Maior Saldo</h3>
      <table class="relatorio-table">
        <thead>
          <tr>
            <th>Número</th>
            <th>Nome</th>
            <th>Saldo</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${cartoesOrdenados.slice(0, 10).map(c => `
            <tr>
              <td>${c.numero}</td>
              <td>${c.nome}</td>
              <td class="relatorio-item-value ${parseFloat(c.saldo) > 0 ? 'positive' : ''}">${formatPrice(parseFloat(c.saldo) || 0)}</td>
              <td>${c.ativo ? '<span style="color: var(--accent);">Ativo</span>' : '<span style="color: var(--danger);">Inativo</span>'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="relatorio-section">
      <h3>📋 Lista Completa de Cartões</h3>
      <table class="relatorio-table">
        <thead>
          <tr>
            <th>Número</th>
            <th>Nome</th>
            <th>Documento</th>
            <th>Saldo</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${cartoesAtuais.length > 0 ? cartoesAtuais.map(c => `
            <tr>
              <td>${c.numero}</td>
              <td>${c.nome}</td>
              <td>${c.documento || '-'}</td>
              <td class="relatorio-item-value ${parseFloat(c.saldo) > 0 ? 'positive' : ''}">${formatPrice(parseFloat(c.saldo) || 0)}</td>
              <td>${c.ativo ? '<span style="color: var(--accent);">Ativo</span>' : '<span style="color: var(--danger);">Inativo</span>'}</td>
            </tr>
          `).join('') : '<tr><td colspan="5" style="text-align: center; color: var(--muted);">Nenhum cartão cadastrado</td></tr>'}
        </tbody>
      </table>
    </div>

    <div class="relatorio-section">
      <p style="margin: 0; font-size: 12px; color: var(--muted);">
        Relatório gerado em ${new Date().toLocaleString('pt-BR')}
      </p>
    </div>
  `;
  
  relatorioContent.innerHTML = html;
  modalRelatorio.classList.add('open');
}

function fecharModalRelatorio() {
  modalRelatorio.classList.remove('open');
}

// Event listeners
btnNovoCartao.addEventListener('click', novoCartao);
btnRelatorio.addEventListener('click', gerarRelatorio);
modalCartaoClose.addEventListener('click', fecharModalCartao);
modalCartaoCancel.addEventListener('click', fecharModalCartao);
modalCartaoSave.addEventListener('click', salvarCartao);
modalRecargaClose.addEventListener('click', fecharModalRecarga);
modalRecargaCancel.addEventListener('click', fecharModalRecarga);
modalRecargaConfirm.addEventListener('click', confirmarRecarga);
modalRelatorioClose.addEventListener('click', fecharModalRelatorio);
modalRelatorioFechar.addEventListener('click', fecharModalRelatorio);

searchInput.addEventListener('input', (e) => {
  renderCartoes(e.target.value);
});

// Fechar modal ao clicar fora
modalCartao.addEventListener('click', (e) => {
  if (e.target === modalCartao) fecharModalCartao();
});

modalRecarga.addEventListener('click', (e) => {
  if (e.target === modalRecarga) fecharModalRecarga();
});

modalRelatorio.addEventListener('click', (e) => {
  if (e.target === modalRelatorio) fecharModalRelatorio();
});

// Expor funções globalmente para uso nos botões
window.recarregarCartao = recarregarCartao;
window.editarCartao = editarCartao;
window.toggleCartao = toggleCartao;

// Carregar dados ao iniciar
loadCartoes();

// Flag para evitar notificações duplicadas durante recarga
let recargaEmAndamento = false;

// Monitorar mudanças no localStorage (para detectar compras de outras abas/páginas)
let intervaloVerificacao = setInterval(() => {
  if (!recargaEmAndamento) {
    verificarMudancasSaldos();
  }
}, 1500); // Verificar a cada 1.5 segundos

// Também verificar quando a janela recebe foco
window.addEventListener('focus', () => {
  verificarMudancasSaldos();
});

// Verificar mudanças no localStorage (evento customizado - funciona entre abas)
window.addEventListener('storage', (e) => {
  if (e.key === 'cartoes') {
    verificarMudancasSaldos();
  }
});

// Interceptar mudanças no localStorage da mesma aba usando Proxy ou override
(function() {
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    if (key === 'cartoes' && !recargaEmAndamento) {
      // Aguardar um pouco para garantir que a mudança foi aplicada
      setTimeout(() => {
        verificarMudancasSaldos();
      }, 100);
    }
    return originalSetItem.apply(this, arguments);
  };
})();

