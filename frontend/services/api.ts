
/**
 * Senior FE Implementation Note:
 * This service handles all HTTP requests using fetch. 
 * Improved error handling to provide clearer feedback for backend connection issues.
 */

const BASE_URL = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    
    if (!response.ok) {
      let errorMessage = `Erro ${response.status}: ${response.statusText}`;
      try {
        // Try to parse error message from JSON response
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Response is not JSON (e.g., 404 HTML page)
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
    }
    throw error;
  }
}

export const api = {
  // Menu
  getMenu: () => request<{ categorias: any[]; itens: any[] }>('/menu'),
  saveMenu: (data: any) => request('/menu', { method: 'POST', body: JSON.stringify(data) }),

  // Cards
  getCards: () => request<any[]>('/cartoes'),
  getCardByNumber: (num: string) => request<any>(`/cartoes/${num}`),
  saveCards: (data: any[]) => request('/cartoes', { method: 'POST', body: JSON.stringify(data) }),
  debitCard: (id: string, data: any) => request(`/cartoes/${id}/debitar`, { method: 'POST', body: JSON.stringify(data) }),
  rechargeCard: (id: string, data: any) => request(`/cartoes/${id}/recarregar`, { method: 'POST', body: JSON.stringify(data) }),
  getTransactions: (id: string) => request<any[]>(`/cartoes/${id}/transacoes`),
  refundTransactions: (id: string, ids: string[]) => request(`/cartoes/${id}/estornar`, { method: 'POST', body: JSON.stringify({ transacoesIds: ids }) }),

  // Inventory
  getStock: () => request<{ geladeiras: any[]; cameraFria: any[] }>('/estoque'),
  saveStock: (data: any) => request('/estoque', { method: 'POST', body: JSON.stringify(data) }),
  getStockHistory: () => request<any[]>('/estoque/historico'),
  saveStockHistory: (data: any[]) => request('/estoque/historico', { method: 'POST', body: JSON.stringify(data) }),
  checkStock: (name: string) => request<any>(`/estoque/verificar/${encodeURIComponent(name)}`),
  // FIXED: Changed endpoint from /estoque/reduce to /estoque/reduzir as per backend specs
  reduceStock: (data: { produtoNome: string; quantidade: number }) => request('/estoque/reduzir', { method: 'POST', body: JSON.stringify(data) }),

  // Events
  getEvents: () => request<any[]>('/eventos'),
  saveEvents: (data: any[]) => request('/eventos', { method: 'POST', body: JSON.stringify(data) }),

  // Ticketing
  getTicketConfig: () => request<any>('/bilheteria/config'),
  saveTicketConfig: (data: any) => request('/bilheteria/config', { method: 'POST', body: JSON.stringify(data) }),
  processPayment: (data: any) => request<{ success: boolean }>('/bilheteria/processar-pagamento', { method: 'POST', body: JSON.stringify(data) }),
  sellTicket: (data: any) => request('/bilheteria/vender', { method: 'POST', body: JSON.stringify(data) }),
  getTickets: () => request<any[]>('/bilheteria/ingressos'),
  releaseTicket: (data: { codigo: string }) => request('/bilheteria/liberar', { method: 'POST', body: JSON.stringify(data) }),

  // Control
  getDashboard: () => request<any>('/controle/dashboard'),
  getLogs: () => request<any[]>('/controle/logs'),
  getReport: (type: string) => request<any[]>(`/controle/relatorio/${type}`),
};
