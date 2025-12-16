// Script da página de bilheteria

let tiposSelecionados = {}; // { normal: quantidade, meio: quantidade, passaporte: quantidade }
let precos = {
  normal: 0,
  meio: 0,
  passaporte: 0
};
let formaPagamentoSelecionada = null; // 'dinheiro', 'pix', 'credito', 'debito'

// Função para fazer requisições
async function apiRequest(endpoint, options = {}) {
  try {
    const url = `${window.location.origin}/api${endpoint}`;
    console.log('[Bilheteria] Fazendo requisição:', url, options);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    console.log('[Bilheteria] Resposta recebida:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Bilheteria] Erro na resposta:', response.status, errorText);
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('[Bilheteria] Dados recebidos:', data);
    return data;
  } catch (error) {
    console.error(`[Bilheteria] Erro ao buscar ${endpoint}:`, error);
    throw error;
  }
}

// Funções auxiliares
function formatPrice(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Carregar configurações ao iniciar
document.addEventListener('DOMContentLoaded', async () => {
  await carregarConfiguracoes();
  await carregarIngressosVendidos();
  await atualizarTotalVendidoHoje();
  
  // Permitir seleção por número do teclado (teclado principal e numpad)
  document.addEventListener('keydown', (e) => {
    // Suporta tanto teclado principal quanto numpad
    const key = e.key;
    const code = e.code;
    
    // Enter - Confirmar venda
    if (key === 'Enter' && !e.target.matches('input, textarea')) {
      e.preventDefault();
      const btnVender = document.getElementById('btn-vender');
      if (btnVender && !btnVender.disabled) {
        processarVenda();
      }
      return;
    }
    
    // Backspace - Limpar venda
    if (key === 'Backspace' && !e.target.matches('input, textarea')) {
      e.preventDefault();
      limparVenda();
      return;
    }
    
    // Teclado principal (1, 2, 3) ou numpad (Numpad1, Numpad2, Numpad3)
    if (key === '1' || code === 'Numpad1' || code === 'Digit1') {
      e.preventDefault();
      selecionarTipo('normal', 1);
    } else if (key === '2' || code === 'Numpad2' || code === 'Digit2') {
      e.preventDefault();
      selecionarTipo('meio', 2);
    } else if (key === '3' || code === 'Numpad3' || code === 'Digit3') {
      e.preventDefault();
      selecionarTipo('passaporte', 3);
    }
  });
});

// Carregar configurações de preços
async function carregarConfiguracoes() {
  try {
    const config = await apiRequest('/bilheteria/config');
    if (config) {
      precos.normal = parseFloat(config.precoNormal || 0);
      precos.meio = parseFloat(config.precoMeio || 0);
      precos.passaporte = parseFloat(config.precoPassaporte || 0);
      
      document.getElementById('preco-normal').textContent = formatPrice(precos.normal);
      document.getElementById('preco-meio').textContent = formatPrice(precos.meio);
      document.getElementById('preco-passaporte').textContent = formatPrice(precos.passaporte);
    }
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    // Valores padrão
    precos.normal = 20;
    precos.meio = 10;
    precos.passaporte = 50;
    
    document.getElementById('preco-normal').textContent = formatPrice(precos.normal);
    document.getElementById('preco-meio').textContent = formatPrice(precos.meio);
    document.getElementById('preco-passaporte').textContent = formatPrice(precos.passaporte);
  }
}

// Selecionar tipo de ingresso (toggle - pode selecionar até 2 tipos)
function selecionarTipo(tipo, numero) {
  const btn = document.querySelector(`[data-tipo="${tipo}"]`);
  const isActive = btn.classList.contains('active');
  
  // Se já está selecionado, desmarcar
  if (isActive) {
    btn.classList.remove('active');
    delete tiposSelecionados[tipo];
    atualizarControlesQuantidade();
  } else {
    // Verificar se já tem 2 tipos selecionados
    const tiposAtivos = Object.keys(tiposSelecionados).length;
    if (tiposAtivos >= 2) {
      showToast('Você pode selecionar no máximo 2 tipos de ingresso');
      return;
    }
    
    // Adicionar seleção
    btn.classList.add('active');
    tiposSelecionados[tipo] = 1; // Quantidade padrão
    atualizarControlesQuantidade();
  }
  
  atualizarResumo();
}

// Alterar quantidade de um tipo específico
function alterarQuantidadeTipo(tipo, delta) {
  if (!tiposSelecionados[tipo]) return;
  
  let qtd = tiposSelecionados[tipo] + delta;
  if (qtd < 1) qtd = 1;
  tiposSelecionados[tipo] = qtd;
  
  const input = document.getElementById(`qtd-${tipo}`);
  if (input) input.value = qtd;
  
  atualizarResumo();
}

// Atualizar controles de quantidade baseado nos tipos selecionados
function atualizarControlesQuantidade() {
  const container = document.getElementById('quantidades-container');
  if (!container) return;
  
  const tipos = Object.keys(tiposSelecionados);
  
  if (tipos.length === 0) {
    container.innerHTML = '';
    return;
  }
  
  const tipoNome = {
    normal: 'Ingresso Normal',
    meio: 'Meio Ingresso',
    passaporte: 'Passaporte'
  };
  
  let html = '';
  tipos.forEach(tipo => {
    html += `
      <div class="field" style="margin-bottom: 12px;">
        <label>${tipoNome[tipo]}</label>
        <div class="quantidade-control">
          <button class="btn-qtd" onclick="alterarQuantidadeTipo('${tipo}', -1)">-</button>
          <input type="number" id="qtd-${tipo}" min="1" value="${tiposSelecionados[tipo]}" 
                 onchange="tiposSelecionados['${tipo}'] = parseInt(this.value) || 1; atualizarResumo()" />
          <button class="btn-qtd" onclick="alterarQuantidadeTipo('${tipo}', 1)">+</button>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// Selecionar forma de pagamento
function selecionarFormaPagamento(forma) {
  formaPagamentoSelecionada = forma;
  
  // Atualizar visual dos botões
  document.querySelectorAll('.forma-pagamento-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-forma="${forma}"]`).classList.add('active');
  
  // Habilitar botão de vender se tudo estiver selecionado
  atualizarEstadoBotaoVender();
}

// Atualizar estado do botão de vender
function atualizarEstadoBotaoVender() {
  const tipos = Object.keys(tiposSelecionados);
  const btnVender = document.getElementById('btn-vender');
  
  if (tipos.length > 0 && formaPagamentoSelecionada) {
    btnVender.disabled = false;
  } else {
    btnVender.disabled = true;
  }
}

// Atualizar resumo da venda
function atualizarResumo() {
  const tipos = Object.keys(tiposSelecionados);
  
  if (tipos.length === 0) {
    document.getElementById('resumo-venda').style.display = 'none';
    document.getElementById('forma-pagamento-container').style.display = 'none';
    formaPagamentoSelecionada = null;
    document.querySelectorAll('.forma-pagamento-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.getElementById('btn-vender').disabled = true;
    return;
  }
  
  // Mostrar seletor de forma de pagamento
  document.getElementById('forma-pagamento-container').style.display = 'block';
  
  const tipoNome = {
    normal: 'Ingresso Normal',
    meio: 'Meio Ingresso',
    passaporte: 'Passaporte'
  };
  
  let html = '';
  let total = 0;
  
  tipos.forEach(tipo => {
    const qtd = tiposSelecionados[tipo];
    const preco = precos[tipo] || 0;
    const subtotal = preco * qtd;
    total += subtotal;
    
    html += `
      <div class="resumo-item">
        <span>${tipoNome[tipo]}</span>
        <span>${qtd}x ${formatPrice(preco)} = ${formatPrice(subtotal)}</span>
      </div>
    `;
  });
  
  html += `
    <div class="resumo-total">
      <span>Total:</span>
      <span>${formatPrice(total)}</span>
    </div>
  `;
  
  document.getElementById('resumo-venda').innerHTML = html;
  document.getElementById('resumo-venda').style.display = 'block';
  atualizarEstadoBotaoVender();
}

// Processar venda
async function processarVenda() {
  const tipos = Object.keys(tiposSelecionados);
  
  if (tipos.length === 0) {
    showToast('Selecione pelo menos um tipo de ingresso');
    return;
  }
  
  if (!formaPagamentoSelecionada) {
    showToast('Selecione uma forma de pagamento');
    return;
  }
  
  // Calcular total
  let totalVendido = 0;
  tipos.forEach(tipo => {
    const quantidade = tiposSelecionados[tipo];
    const preco = precos[tipo] || 0;
    totalVendido += preco * quantidade;
  });
  
  // Abrir modal de pagamento
  abrirModalPagamento(totalVendido, formaPagamentoSelecionada);
  
  try {
    // Processar pagamento
    const resultadoPagamento = await apiRequest('/bilheteria/processar-pagamento', {
      method: 'POST',
      body: JSON.stringify({
        valor: totalVendido,
        formaPagamento: formaPagamentoSelecionada,
        tipos: tipos.map(tipo => ({
          tipo: tipo,
          quantidade: tiposSelecionados[tipo]
        }))
      })
    });
    
    if (resultadoPagamento.success) {
      // Pagamento aprovado - processar vendas
      atualizarStatusPagamento('Pagamento aprovado! Processando ingressos...', 'success');
      
      let totalIngressos = 0;
      
      for (const tipo of tipos) {
        const quantidade = tiposSelecionados[tipo];
        if (quantidade < 1) continue;
        
        const resultado = await apiRequest('/bilheteria/vender', {
          method: 'POST',
          body: JSON.stringify({
            tipo: tipo,
            quantidade: quantidade
          })
        });
        
        if (resultado.success) {
          totalIngressos += quantidade;
        } else {
          throw new Error(resultado.message || 'Erro ao processar venda');
        }
      }
      
      // Sucesso completo
      atualizarStatusPagamento('✅ Pagamento processado com sucesso!', 'success');
      document.getElementById('detalhesPagamento').textContent = `${totalIngressos} ingresso(s) vendido(s)`;
      document.getElementById('modalPagamentoFooter').style.display = 'flex';
      
      limparVenda();
      await carregarIngressosVendidos();
      await atualizarTotalVendidoHoje();
      
      // Fechar modal após 3 segundos
      setTimeout(() => {
        fecharModalPagamento();
      }, 3000);
      
    } else {
      // Pagamento negado
      atualizarStatusPagamento('❌ Pagamento negado', 'error');
      document.getElementById('detalhesPagamento').textContent = resultadoPagamento.message || 'Tente novamente';
      document.getElementById('modalPagamentoFooter').style.display = 'flex';
    }
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    atualizarStatusPagamento('❌ Erro ao processar pagamento', 'error');
    document.getElementById('detalhesPagamento').textContent = error.message || 'Tente novamente';
    document.getElementById('modalPagamentoFooter').style.display = 'flex';
  }
}

// Abrir modal de pagamento
function abrirModalPagamento(valor, formaPagamento) {
  const modal = document.getElementById('modalPagamento');
  const valorElement = document.getElementById('valorPagamento');
  const statusElement = document.getElementById('statusPagamento');
  const detalhesElement = document.getElementById('detalhesPagamento');
  const footer = document.getElementById('modalPagamentoFooter');
  const iconElement = document.querySelector('#modalPagamento .modal-body > div:first-child');
  const modalTitle = document.querySelector('#modalPagamento .modal-title');
  
  if (modal) {
    modal.style.display = 'flex';
    valorElement.textContent = formatPrice(valor);
    
    // Mensagens específicas por forma de pagamento
    const mensagens = {
      dinheiro: {
        titulo: '💵 Pagamento em Dinheiro',
        status: 'Aguardando confirmação...',
        detalhes: 'Confirme o recebimento do dinheiro'
      },
      pix: {
        titulo: '📱 Pagamento via PIX',
        status: 'Aguardando confirmação PIX...',
        detalhes: 'Aguarde a confirmação do pagamento PIX'
      },
      credito: {
        titulo: '💳 Pagamento no Crédito',
        status: 'Processando no cartão de crédito...',
        detalhes: 'Por favor, insira o cartão na maquininha'
      },
      debito: {
        titulo: '💳 Pagamento no Débito',
        status: 'Processando no cartão de débito...',
        detalhes: 'Por favor, insira o cartão na maquininha'
      }
    };
    
    const msg = mensagens[formaPagamento] || mensagens.credito;
    
    if (modalTitle) {
      modalTitle.textContent = msg.titulo;
    }
    statusElement.textContent = msg.status;
    statusElement.className = 'processando';
    detalhesElement.textContent = msg.detalhes;
    footer.style.display = 'none';
    
    // Atualizar ícone
    if (iconElement) {
      iconElement.textContent = formaPagamento === 'dinheiro' ? '💵' : formaPagamento === 'pix' ? '📱' : '💳';
      iconElement.className = 'processando';
    }
  }
}

// Atualizar status do pagamento
function atualizarStatusPagamento(mensagem, tipo) {
  const statusElement = document.getElementById('statusPagamento');
  const detalhesElement = document.getElementById('detalhesPagamento');
  const iconElement = document.querySelector('#modalPagamento .modal-body > div:first-child');
  
  if (statusElement) {
    statusElement.textContent = mensagem;
    statusElement.className = tipo === 'success' ? 'success' : tipo === 'error' ? 'error' : '';
  }
  
  // Atualizar ícone
  if (iconElement) {
    if (tipo === 'success') {
      iconElement.textContent = '✅';
      iconElement.className = 'success';
    } else if (tipo === 'error') {
      iconElement.textContent = '❌';
      iconElement.className = 'error';
    } else {
      iconElement.textContent = '⏳';
      iconElement.className = 'processando';
    }
  }
  
  if (tipo === 'success') {
    detalhesElement.textContent = 'Aguarde enquanto processamos os ingressos...';
  }
}

// Fechar modal de pagamento
function fecharModalPagamento() {
  const modal = document.getElementById('modalPagamento');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Limpar venda
function limparVenda() {
  tiposSelecionados = {};
  formaPagamentoSelecionada = null;
  document.querySelectorAll('.tipo-ingresso-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelectorAll('.forma-pagamento-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  atualizarControlesQuantidade();
  document.getElementById('resumo-venda').style.display = 'none';
  document.getElementById('forma-pagamento-container').style.display = 'none';
  document.getElementById('btn-vender').disabled = true;
}


// Atualizar total vendido hoje
async function atualizarTotalVendidoHoje() {
  try {
    const ingressos = await apiRequest('/bilheteria/ingressos');
    const hojeStr = new Date().toISOString().split('T')[0];
    
    const ingressosHoje = ingressos.filter(i => {
      const dataIngressoStr = i.dataVendaDate || (i.dataVenda ? i.dataVenda.split('T')[0] : null);
      return dataIngressoStr === hojeStr;
    });
    
    const total = ingressosHoje.reduce((sum, i) => sum + (parseFloat(i.valor) || 0), 0);
    
    const elemento = document.getElementById('totalVendidoHoje');
    if (elemento) {
      elemento.textContent = formatPrice(total);
    }
  } catch (error) {
    console.error('Erro ao atualizar total vendido hoje:', error);
  }
}

// Carregar ingressos vendidos
async function carregarIngressosVendidos() {
  try {
    const ingressos = await apiRequest('/bilheteria/ingressos');
    const container = document.getElementById('ingressos-vendidos');
    
    if (!ingressos || ingressos.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhum ingresso vendido ainda</div>';
      return;
    }
    
    const html = ingressos.map(ingresso => {
      const tipoNome = {
        normal: 'Ingresso Normal',
        meio: 'Meio Ingresso',
        passaporte: 'Passaporte'
      }[ingresso.tipo] || ingresso.tipo;
      
      const badgeClass = {
        normal: 'badge-normal',
        meio: 'badge-meio',
        passaporte: 'badge-passaporte'
      }[ingresso.tipo] || '';
      
      const liberadoClass = ingresso.liberado ? 'liberado' : '';
      const liberadoBadge = ingresso.liberado ? '<span class="badge badge-liberado">Liberado</span>' : '';
      
      return `
        <div class="ingresso-item ${liberadoClass}">
          <div>
            <div style="font-weight: 600; margin-bottom: 4px;">${ingresso.codigo}</div>
            <div style="font-size: 12px; color: var(--muted);">
              <span class="badge ${badgeClass}">${tipoNome}</span>
              ${liberadoBadge}
            </div>
            <div style="font-size: 11px; color: var(--muted); margin-top: 4px;">
              ${formatDate(ingresso.dataVenda)}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 700; color: var(--accent);">${formatPrice(ingresso.valor)}</div>
          </div>
        </div>
      `;
    }).join('');
    
    container.innerHTML = html;
  } catch (error) {
    console.error('Erro ao carregar ingressos:', error);
    document.getElementById('ingressos-vendidos').innerHTML = '<div class="empty-state">Erro ao carregar ingressos</div>';
  }
}

// Expor funções globalmente
window.selecionarTipo = selecionarTipo;
window.alterarQuantidadeTipo = alterarQuantidadeTipo;
window.selecionarFormaPagamento = selecionarFormaPagamento;
window.processarVenda = processarVenda;
window.limparVenda = limparVenda;
window.fecharModalPagamento = fecharModalPagamento;

