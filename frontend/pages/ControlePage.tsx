
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DashboardStats, AppLog } from '../types';
// Added ChevronRight icon to the imports
import { 
  BarChart3, 
  CreditCard, 
  Package, 
  Ticket, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  FileText,
  Clock,
  Activity,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const ControlePage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [logs, setLogs] = useState<AppLog[]>([]);
  const [activeTab, setActiveTab] = useState<'dash' | 'logs' | 'relatorios'>('dash');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const dashboardData = await api.getDashboard();
      const logsData = await api.getLogs();
      setStats(dashboardData);
      setLogs(logsData);
    } catch (error) {
      console.error('Error fetching dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin h-12 w-12 border-4 border-[#00C3F2] border-t-transparent rounded-full"></div></div>;

  const summaryCards = [
    { label: 'Saldo em Cartões', value: `R$ ${stats?.cartoes.saldoTotal.toFixed(2)}`, sub: `${stats?.cartoes.ativos} cartões ativos`, icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Vendas Hoje', value: `R$ ${stats?.vendas.hoje.toFixed(2)}`, sub: `${stats?.transacoes.hoje} transações`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Estoque Baixo', value: stats?.estoque.baixoEstoque, sub: `De ${stats?.estoque.totalItens} itens totais`, icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Ingressos Vendidos', value: stats?.ingressos.total, sub: `Total arrecadado: R$ 0,00`, icon: Ticket, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  // Dummy chart data
  const chartData = [
    { name: 'Seg', valor: 450 },
    { name: 'Ter', valor: 680 },
    { name: 'Qua', valor: 320 },
    { name: 'Qui', valor: 850 },
    { name: 'Sex', valor: 1200 },
    { name: 'Sáb', valor: 2100 },
    { name: 'Dom', valor: 1800 },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Controle & Dashboard</h2>
          <p className="text-gray-500">Acompanhe métricas, logs e relatórios em tempo real.</p>
        </div>
        <div className="flex p-1 bg-gray-100 rounded-xl">
          <button 
            onClick={() => setActiveTab('dash')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'dash' ? 'bg-white shadow text-[#00C3F2]' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            Métricas
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'logs' ? 'bg-white shadow text-[#00C3F2]' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            Logs
          </button>
          <button 
            onClick={() => setActiveTab('relatorios')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'relatorios' ? 'bg-white shadow text-[#00C3F2]' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            Relatórios
          </button>
        </div>
      </div>

      {activeTab === 'dash' && (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {summaryCards.map((card, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${card.bg} ${card.color}`}>
                    <card.icon size={24} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tempo Real</span>
                </div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">{card.label}</h3>
                <p className="text-2xl font-black text-[#1F1F1F] mb-1">{card.value}</p>
                <p className="text-xs text-gray-400">{card.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sales Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-[#00C3F2] rounded-xl">
                    <Activity size={20} />
                  </div>
                  <h3 className="font-bold">Desempenho Semanal</h3>
                </div>
                <select className="bg-gray-50 border-0 text-xs font-bold rounded-lg px-2 py-1 outline-none">
                  <option>Vendas (R$)</option>
                  <option>Ingressos (Uni)</option>
                </select>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#94a3b8' }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#94a3b8' }} 
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="valor" radius={[6, 6, 0, 0]} barSize={32}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 5 ? '#00C3F2' : '#e2e8f0'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Activity */}
            <div className="bg-[#1F1F1F] text-white p-6 rounded-3xl shadow-xl flex flex-col">
              <h3 className="font-bold mb-6 flex items-center gap-2">
                <Clock size={20} className="text-[#00C3F2]" /> Atividade Recente
              </h3>
              <div className="space-y-6 flex-1 overflow-y-auto max-h-[250px] pr-2 scrollbar-hide">
                {logs.slice(0, 5).map(log => (
                  <div key={log.id} className="flex gap-4 group">
                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                      log.tipo === 'success' ? 'bg-green-400' : log.tipo === 'warning' ? 'bg-orange-400' : 'bg-[#00C3F2]'
                    } shadow-[0_0_8px_rgba(0,195,242,0.5)]`}></div>
                    <div>
                      <p className="text-xs font-medium text-gray-100 mb-0.5">{log.mensagem}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{new Date(log.data).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setActiveTab('logs')}
                className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-colors border border-white/10"
              >
                Ver todos os logs
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <FileText size={20} className="text-gray-400" /> Logs do Sistema
            </h3>
            <button className="text-[#00C3F2] text-sm font-bold hover:underline" onClick={loadDashboard}>Atualizar</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Data/Hora</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Mensagem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">{new Date(log.data).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        log.tipo === 'success' ? 'bg-green-100 text-green-700' : 
                        log.tipo === 'warning' ? 'bg-orange-100 text-orange-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {log.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{log.mensagem}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'relatorios' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {['Cartões', 'Vendas', 'Estoque', 'Eventos', 'Ingressos'].map(rel => (
            <button key={rel} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:border-[#00C3F2] transition-all group text-left">
              <div className="w-12 h-12 bg-gray-50 group-hover:bg-[#00C3F2] group-hover:text-white rounded-2xl flex items-center justify-center mb-6 transition-all text-gray-400">
                <FileText size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">Relatório de {rel}</h3>
              <p className="text-sm text-gray-500 mb-6">Gere um documento detalhado de movimentações e saldos de {rel.toLowerCase()}.</p>
              <div className="flex items-center gap-2 text-[#00C3F2] text-sm font-bold group-hover:gap-4 transition-all">
                Exportar CSV <ChevronRight size={16} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ControlePage;
