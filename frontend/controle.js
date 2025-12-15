// Script da página de controle e relatórios

// API_BASE_URL já está definido em api.js

// Função auxiliar para formatar preço
function formatPrice(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
}

// Função auxiliar para formatar data
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

// Função para fazer requisições
async function apiRequestSimple(endpoint) {
  try {
    console.log('[Controle] Buscando:', endpoint);
    const url = `${window.location.origin}/api${endpoint}`;
    console.log('[Controle] URL completa:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('[Controle] Resposta recebida:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Controle] Erro na resposta:', response.status, errorText);
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('[Controle] Dados recebidos:', data);
    return data;
  } catch (error) {
    console.error(`[Controle] Erro ao buscar ${endpoint}:`, error);
    throw error;
  }
}

// Função para alternar entre tabs
function showTab(tabName) {
  // Remover active de todas as tabs
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  // Adicionar active na tab selecionada
  event.target.classList.add('active');
  document.getElementById(`tab-${tabName}`).classList.add('active');
  
  // Carregar dados da tab
  loadTabData(tabName);
}

// Carregar dados da tab
async function loadTabData(tabName) {
  switch(tabName) {
    case 'dashboard':
      await loadDashboard();
      break;
    case 'logs':
      await loadLogs();
      break;
    case 'cartoes':
      await loadRelatorioCartoes();
      break;
    case 'vendas':
      await loadRelatorioVendas();
      break;
    case 'estoque':
      await loadRelatorioEstoque();
      break;
    case 'eventos':
      await loadRelatorioEventos();
      break;
    case 'ingressos':
      await loadRelatorioIngressos();
      break;
  }
}

// Carregar dashboard
async function loadDashboard() {
  try {
    console.log('[Controle] Iniciando carregamento do dashboard...');
    const data = await apiRequestSimple('/controle/dashboard');
    console.log('[Controle] Dashboard carregado com sucesso:', data);
    
    if (!data) {
      throw new Error('Dados não recebidos do servidor');
    }
    
    // Atualizar estatísticas
    const statTotalCartoes = document.getElementById('stat-total-cartoes');
    if (!statTotalCartoes) {
      console.error('[Controle] Elemento stat-total-cartoes não encontrado');
      return;
    }
    
    statTotalCartoes.textContent = data.cartoes?.total || 0;
    const statCartoesAtivos = document.getElementById('stat-cartoes-ativos');
    if (statCartoesAtivos) statCartoesAtivos.textContent = `${data.cartoes?.ativos || 0} ativos`;
    
    const statSaldoTotal = document.getElementById('stat-saldo-total');
    if (statSaldoTotal) statSaldoTotal.textContent = formatPrice(data.saldo?.total || 0);
    
    const statSaldoMedio = document.getElementById('stat-saldo-medio');
    if (statSaldoMedio) statSaldoMedio.textContent = `Média: ${formatPrice(data.saldo?.medio || 0)}`;
    
    const statVendasHoje = document.getElementById('stat-vendas-hoje');
    if (statVendasHoje) statVendasHoje.textContent = formatPrice(data.vendas?.hoje || 0);
    
    const statVendasMes = document.getElementById('stat-vendas-mes');
    if (statVendasMes) statVendasMes.textContent = `Mês: ${formatPrice(data.vendas?.mes || 0)}`;
    
    const statEventosAtivos = document.getElementById('stat-eventos-ativos');
    if (statEventosAtivos) statEventosAtivos.textContent = data.eventos?.ativos || 0;
    
    const statEventosTotal = document.getElementById('stat-eventos-total');
    if (statEventosTotal) statEventosTotal.textContent = `${data.eventos?.total || 0} total`;
    
    const statItensEstoque = document.getElementById('stat-itens-estoque');
    if (statItensEstoque) statItensEstoque.textContent = data.estoque?.itens || 0;
    
    const statEstoqueBaixo = document.getElementById('stat-estoque-baixo');
    if (statEstoqueBaixo) statEstoqueBaixo.textContent = `${data.estoque?.baixo || 0} com estoque baixo`;
    
    const statTransacoesHoje = document.getElementById('stat-transacoes-hoje');
    if (statTransacoesHoje) statTransacoesHoje.textContent = data.transacoes?.hoje || 0;
    
    const statTransacoesMes = document.getElementById('stat-transacoes-mes');
    if (statTransacoesMes) statTransacoesMes.textContent = `${data.transacoes?.mes || 0} no mês`;
    
    // Resumo geral
    const resumoHtml = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
        <div style="padding: 16px; background: #0d1423; border-radius: 12px; border: 1px solid #1f2937;">
          <div style="font-size: 12px; color: var(--muted); margin-bottom: 8px;">Cartões</div>
          <div style="font-size: 20px; font-weight: 700;">${data.cartoes.total} cartões cadastrados</div>
          <div style="font-size: 13px; color: var(--accent); margin-top: 4px;">${data.cartoes.ativos} ativos</div>
        </div>
        <div style="padding: 16px; background: #0d1423; border-radius: 12px; border: 1px solid #1f2937;">
          <div style="font-size: 12px; color: var(--muted); margin-bottom: 8px;">Financeiro</div>
          <div style="font-size: 20px; font-weight: 700;">${formatPrice(data.saldo.total)} em saldo</div>
          <div style="font-size: 13px; color: var(--accent); margin-top: 4px;">${formatPrice(data.vendas.mes)} vendas no mês</div>
        </div>
        <div style="padding: 16px; background: #0d1423; border-radius: 12px; border: 1px solid #1f2937;">
          <div style="font-size: 12px; color: var(--muted); margin-bottom: 8px;">Atividades</div>
          <div style="font-size: 20px; font-weight: 700;">${data.transacoes.mes} transações no mês</div>
          <div style="font-size: 13px; color: var(--accent); margin-top: 4px;">${data.eventos.ativos} eventos ativos</div>
        </div>
        <div style="padding: 16px; background: #0d1423; border-radius: 12px; border: 1px solid #1f2937;">
          <div style="font-size: 12px; color: var(--muted); margin-bottom: 8px;">🎟️ Ingressos</div>
          <div style="font-size: 20px; font-weight: 700;">${formatPrice(data.ingressos?.hoje?.valor || 0)}</div>
          <div style="font-size: 13px; color: var(--accent); margin-top: 4px;">Total de ingressos vendidos hoje</div>
          <div style="font-size: 11px; color: var(--muted); margin-top: 8px; padding-top: 8px; border-top: 1px solid #1f2937;">
            ${formatPrice(data.ingressos?.mes?.valor || 0)} no mês
          </div>
        </div>
      </div>
    `;
    const resumoGeral = document.getElementById('resumo-geral');
    if (resumoGeral) {
      resumoGeral.innerHTML = resumoHtml;
    } else {
      console.error('[Controle] Elemento resumo-geral não encontrado');
    }
    console.log('[Controle] Dashboard atualizado com sucesso');
  } catch (error) {
    console.error('[Controle] Erro ao carregar dashboard:', error);
    const resumoGeral = document.getElementById('resumo-geral');
    if (resumoGeral) {
      let errorMsg = 'Erro ao carregar dados';
      if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION')) {
        errorMsg = 'Servidor não está respondendo. Verifique se o servidor está rodando.';
      } else {
        errorMsg = `Erro: ${error.message}`;
      }
      resumoGeral.innerHTML = `<div class="empty-state">${errorMsg}<br><small>Recarregue a página ou verifique o console</small></div>`;
    }
  }
}

// Carregar logs
async function loadLogs() {
  try {
    const logs = await apiRequestSimple('/controle/logs');
    const container = document.getElementById('logs-container');
    
    if (logs.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhum log encontrado</div>';
      return;
    }
    
    const logsHtml = logs.map(log => {
      const time = formatDate(log.time);
      return `
        <div class="log-item">
          <div class="log-time">${time}</div>
          <span class="log-type ${log.type}">${log.type}</span>
          <div class="log-message">${log.message}</div>
        </div>
      `;
    }).join('');
    
    container.innerHTML = logsHtml;
  } catch (error) {
    console.error('[Controle] Erro ao carregar logs:', error);
    const container = document.getElementById('logs-container');
    if (container) {
      let errorMsg = 'Erro ao carregar logs';
      if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION')) {
        errorMsg = 'Servidor não está respondendo. Verifique se o servidor está rodando.';
      }
      container.innerHTML = `<div class="empty-state">${errorMsg}</div>`;
    }
  }
}

// Carregar relatório de cartões
async function loadRelatorioCartoes() {
  try {
    const relatorio = await apiRequestSimple('/controle/relatorio/cartoes');
    const tbody = document.querySelector('#table-cartoes tbody');
    
    if (relatorio.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhum cartão encontrado</td></tr>';
      return;
    }
    
    const rows = relatorio.map(c => `
      <tr>
        <td>${c.numero}</td>
        <td>${c.nome || '-'}</td>
        <td>${formatPrice(c.saldo)}</td>
        <td><span class="badge ${c.status === 'Ativo' ? 'badge-success' : 'badge-danger'}">${c.status}</span></td>
        <td>${c.transacoes}</td>
        <td>${formatDate(c.ultimaAtividade)}</td>
      </tr>
    `).join('');
    
    tbody.innerHTML = rows;
  } catch (error) {
    console.error('[Controle] Erro ao carregar relatório de cartões:', error);
    const tbody = document.querySelector('#table-cartoes tbody');
    if (tbody) {
      let errorMsg = 'Erro ao carregar dados';
      if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION')) {
        errorMsg = 'Servidor não está respondendo';
      }
      tbody.innerHTML = `<tr><td colspan="6" class="empty-state">${errorMsg}</td></tr>`;
    }
  }
}

// Carregar relatório de vendas
async function loadRelatorioVendas() {
  try {
    const relatorio = await apiRequestSimple('/controle/relatorio/vendas');
    const tbody = document.querySelector('#table-vendas tbody');
    
    if (relatorio.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhuma venda encontrada</td></tr>';
      return;
    }
    
    const rows = relatorio.map(v => `
      <tr>
        <td>${formatDate(v.data)}</td>
        <td>${v.cartao}</td>
        <td>${formatPrice(v.valor)}</td>
        <td>${v.itens}</td>
        <td><span class="badge badge-info">${v.tipo}</span></td>
      </tr>
    `).join('');
    
    tbody.innerHTML = rows;
  } catch (error) {
    console.error('[Controle] Erro ao carregar relatório de vendas:', error);
    const tbody = document.querySelector('#table-vendas tbody');
    if (tbody) {
      let errorMsg = 'Erro ao carregar dados';
      if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION')) {
        errorMsg = 'Servidor não está respondendo';
      }
      tbody.innerHTML = `<tr><td colspan="5" class="empty-state">${errorMsg}</td></tr>`;
    }
  }
}

// Carregar relatório de estoque
async function loadRelatorioEstoque() {
  try {
    const relatorio = await apiRequestSimple('/controle/relatorio/estoque');
    const tbody = document.querySelector('#table-estoque tbody');
    
    if (relatorio.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Nenhum item em estoque</td></tr>';
      return;
    }
    
    const rows = relatorio.map(e => {
      let badgeClass = 'badge-success';
      if (e.status === 'Esgotado') badgeClass = 'badge-danger';
      else if (e.status === 'Baixo') badgeClass = 'badge-warning';
      
      return `
        <tr>
          <td>${e.produto}</td>
          <td>${e.quantidade}</td>
          <td><span class="badge ${badgeClass}">${e.status}</span></td>
          <td>${formatDate(e.ultimaMovimentacao)}</td>
        </tr>
      `;
    }).join('');
    
    tbody.innerHTML = rows;
  } catch (error) {
    console.error('[Controle] Erro ao carregar relatório de estoque:', error);
    const tbody = document.querySelector('#table-estoque tbody');
    if (tbody) {
      let errorMsg = 'Erro ao carregar dados';
      if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION')) {
        errorMsg = 'Servidor não está respondendo';
      }
      tbody.innerHTML = `<tr><td colspan="4" class="empty-state">${errorMsg}</td></tr>`;
    }
  }
}

// Carregar relatório de ingressos
async function loadRelatorioIngressos() {
  try {
    const ingressos = await apiRequestSimple('/bilheteria/ingressos');
    const hojeStr = new Date().toISOString().split('T')[0];
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);
    const inicioMesStr = inicioMes.toISOString().split('T')[0];
    
    // Filtrar ingressos de hoje e do mês
    const ingressosHoje = ingressos.filter(i => {
      const dataIngressoStr = i.dataVendaDate || (i.dataVenda ? i.dataVenda.split('T')[0] : null);
      return dataIngressoStr === hojeStr;
    });
    
    const ingressosMes = ingressos.filter(i => {
      const dataIngressoStr = i.dataVendaDate || (i.dataVenda ? i.dataVenda.split('T')[0] : null);
      return dataIngressoStr && dataIngressoStr >= inicioMesStr;
    });
    
    // Calcular valores
    const valorHoje = ingressosHoje.reduce((sum, i) => sum + (parseFloat(i.valor) || 0), 0);
    const valorMes = ingressosMes.reduce((sum, i) => sum + (parseFloat(i.valor) || 0), 0);
    
    // Atualizar estatísticas
    const statIngressosHoje = document.getElementById('stat-ingressos-hoje');
    if (statIngressosHoje) statIngressosHoje.textContent = formatPrice(valorHoje);
    
    const statIngressosHojeQtd = document.getElementById('stat-ingressos-hoje-qtd');
    if (statIngressosHojeQtd) statIngressosHojeQtd.textContent = `${ingressosHoje.length} ingressos`;
    
    const statIngressosMes = document.getElementById('stat-ingressos-mes');
    if (statIngressosMes) statIngressosMes.textContent = formatPrice(valorMes);
    
    const statIngressosMesQtd = document.getElementById('stat-ingressos-mes-qtd');
    if (statIngressosMesQtd) statIngressosMesQtd.textContent = `${ingressosMes.length} ingressos`;
    
    const statIngressosTotal = document.getElementById('stat-ingressos-total');
    if (statIngressosTotal) statIngressosTotal.textContent = ingressos.length;
    
    // Atualizar tabela
    const tbody = document.querySelector('#table-ingressos tbody');
    if (!tbody) return;
    
    if (ingressos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhum ingresso encontrado</td></tr>';
      return;
    }
    
    const tipoNome = {
      normal: 'Normal',
      meio: 'Meio',
      passaporte: 'Passaporte'
    };
    
    const rows = ingressos.slice(0, 100).map(i => {
      const dataIngressoStr = i.dataVendaDate || (i.dataVenda ? i.dataVenda.split('T')[0] : '');
      const hora = i.dataVenda ? i.dataVenda.split('T')[1]?.substring(0, 5) || '' : '';
      const dataFormatada = dataIngressoStr ? `${dataIngressoStr.split('-').reverse().join('/')} ${hora}` : '-';
      
      return `
        <tr>
          <td>${i.codigo || '-'}</td>
          <td>${tipoNome[i.tipo] || i.tipo || '-'}</td>
          <td>${formatPrice(i.valor || 0)}</td>
          <td>${dataFormatada}</td>
          <td><span class="badge ${i.liberado ? 'badge-success' : 'badge-warning'}">${i.liberado ? 'Liberado' : 'Pendente'}</span></td>
        </tr>
      `;
    }).join('');
    
    tbody.innerHTML = rows;
  } catch (error) {
    console.error('[Controle] Erro ao carregar relatório de ingressos:', error);
    const tbody = document.querySelector('#table-ingressos tbody');
    if (tbody) {
      let errorMsg = 'Erro ao carregar dados';
      if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION')) {
        errorMsg = 'Servidor não está respondendo';
      }
      tbody.innerHTML = `<tr><td colspan="5" class="empty-state">${errorMsg}</td></tr>`;
    }
  }
}

// Carregar relatório de eventos
async function loadRelatorioEventos() {
  try {
    const relatorio = await apiRequestSimple('/controle/relatorio/eventos');
    const tbody = document.querySelector('#table-eventos tbody');
    
    if (relatorio.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhum evento encontrado</td></tr>';
      return;
    }
    
    const rows = relatorio.map(e => {
      let badgeClass = 'badge-info';
      if (e.status === 'Finalizado') badgeClass = 'badge-success';
      else if (e.status === 'Em Andamento') badgeClass = 'badge-warning';
      
      return `
        <tr>
          <td>${e.nome}</td>
          <td>${formatDate(e.data)}</td>
          <td><span class="badge ${badgeClass}">${e.status}</span></td>
          <td>${e.bebidas}</td>
          <td>${e.consumo}</td>
        </tr>
      `;
    }).join('');
    
    tbody.innerHTML = rows;
  } catch (error) {
    console.error('[Controle] Erro ao carregar relatório de eventos:', error);
    const tbody = document.querySelector('#table-eventos tbody');
    if (tbody) {
      let errorMsg = 'Erro ao carregar dados';
      if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION')) {
        errorMsg = 'Servidor não está respondendo';
      }
      tbody.innerHTML = `<tr><td colspan="5" class="empty-state">${errorMsg}</td></tr>`;
    }
  }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
});

