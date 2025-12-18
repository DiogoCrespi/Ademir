
export interface Category {
  id: string;
  titulo: string;
  img: string;
  ativo: boolean;
}

export interface MenuItem {
  id: string;
  nome: string;
  preco: number;
  desc: string;
  ativo: boolean;
  categoriaId: string;
}

export interface Card {
  id: string;
  numero: string;
  nome: string;
  documento: string;
  saldo: number;
  ativo: boolean;
}

export interface Transaction {
  id: string;
  data: string;
  tipo: 'compra' | 'recarga' | 'estorno';
  valor: number;
  saldoAnterior: number;
  saldoPosterior: number;
  descricao: string;
  estornada?: boolean;
}

export interface StockItem {
  id: string;
  nome: string;
  categoria: string;
  quantidade: number;
  valorUnitario: number;
  estoqueMinimo: number;
  observacao: string;
  local: 'geladeiras' | 'cameraFria';
}

export interface StockHistory {
  id: string;
  data: string;
  tipo: 'entrada' | 'saida' | 'transferencia';
  local: 'geladeiras' | 'cameraFria';
  produto: string;
  quantidade: number;
  valorUnitario: number;
  total: number;
  observacao: string;
}

export interface Event {
  id: string;
  nome: string;
  data: string;
  descricao: string;
  finalizado: boolean;
  dataFinalizacao?: string;
  itens?: {
    produtoId: string;
    nome: string;
    quantidadeInicial: number;
    quantidadeAtual: number;
    reposicoes: number;
    consumo: number;
  }[];
}

export interface TicketConfig {
  normal: number;
  meio: number;
  passaporte: number;
}

export interface Ticket {
  id: string;
  codigo: string;
  tipo: 'normal' | 'meio' | 'passaporte';
  valor: number;
  dataVenda: string;
  liberado: boolean;
  dataLiberacao?: string;
  formaPagamento: string;
}

export interface DashboardStats {
  cartoes: { total: number; ativos: number; saldoTotal: number; saldoMedio: number };
  vendas: { hoje: number; mes: number; total: number };
  transacoes: { hoje: number; mes: number };
  eventos: { total: number; ativos: number };
  estoque: { totalItens: number; baixoEstoque: number };
  ingressos: { hoje: number; mes: number; total: number };
}

export interface AppLog {
  id: string;
  data: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  mensagem: string;
}
