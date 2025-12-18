
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StockItem, StockHistory } from '../types';
import { Package, History, ArrowRightLeft, Plus, Minus, Search, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

const AdminEstoquePage: React.FC = () => {
  const [stock, setStock] = useState<{ geladeiras: StockItem[]; cameraFria: StockItem[] }>({ geladeiras: [], cameraFria: [] });
  const [history, setHistory] = useState<StockHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'geladeiras' | 'cameraFria' | 'historico'>('geladeiras');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const stockData = await api.getStock();
      const historyData = await api.getStockHistory();
      setStock(stockData);
      setHistory(historyData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (item: StockItem, qty: number, type: 'entrada' | 'saida') => {
    try {
      if (type === 'saida' && item.quantidade < qty) {
        alert('Estoque insuficiente!');
        return;
      }

      const updatedQty = type === 'entrada' ? item.quantidade + qty : item.quantidade - qty;
      const updatedStock = { ...stock };
      const local = item.local === 'geladeiras' ? 'geladeiras' : 'cameraFria';
      
      updatedStock[local] = updatedStock[local].map(i => i.id === item.id ? { ...i, quantidade: updatedQty } : i);
      
      await api.saveStock(updatedStock);
      
      const newHistory: StockHistory = {
        id: Date.now().toString(),
        data: new Date().toISOString(),
        tipo: type,
        local: item.local,
        produto: item.nome,
        quantidade: qty,
        valorUnitario: item.valorUnitario,
        total: qty * item.valorUnitario,
        observacao: `${type === 'entrada' ? 'Entrada' : 'Saída'} manual via admin`
      };
      
      await api.saveStockHistory([...history, newHistory]);
      loadData();
    } catch (err) {
      alert('Erro ao atualizar estoque.');
    }
  };

  const safeIncludes = (text: string | undefined, term: string) =>
    (text || '').toLowerCase().includes(term.toLowerCase());

  const filteredItems = activeTab === 'historico' 
    ? history.filter(h => safeIncludes(h.produto, search))
    : stock[activeTab].filter(i => safeIncludes(i.nome, search));

  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C3F2]"></div></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Estoque</h2>
          <p className="text-gray-500">Controle entradas, saídas e movimentações entre setores.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button onClick={() => setActiveTab('geladeiras')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'geladeiras' ? 'bg-white shadow text-[#00C3F2]' : 'text-gray-500'}`}>Geladeiras</button>
          <button onClick={() => setActiveTab('cameraFria')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'cameraFria' ? 'bg-white shadow text-[#00C3F2]' : 'text-gray-500'}`}>Câmara Fria</button>
          <button onClick={() => setActiveTab('historico')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'historico' ? 'bg-white shadow text-[#00C3F2]' : 'text-gray-500'}`}>Histórico</button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Filtrar por nome do produto..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 shadow-sm rounded-2xl outline-none focus:ring-2 focus:ring-[#00C3F2]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {activeTab !== 'historico' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(filteredItems as StockItem[]).map(item => (
            <div key={item.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${item.quantidade <= item.estoqueMinimo ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-[#00C3F2]'}`}>
                  <Package size={24} />
                </div>
                {item.quantidade <= item.estoqueMinimo && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full animate-pulse">
                    <AlertTriangle size={12} /> ESTOQUE BAIXO
                  </div>
                )}
              </div>
              <h3 className="font-bold text-lg mb-1 truncate">{item.nome}</h3>
              <p className="text-xs text-gray-400 mb-4">{item.categoria}</p>
              
              <div className="flex items-end justify-between mb-6">
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-[#1F1F1F]">{item.quantidade}</span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Unidades em Stock</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">V. Unitário</p>
                  <p className="font-bold">R$ {item.valorUnitario.toFixed(2)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleUpdateStock(item, 1, 'entrada')}
                  className="py-2.5 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={14} /> Entrada
                </button>
                <button 
                  onClick={() => handleUpdateStock(item, 1, 'saida')}
                  className="py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Minus size={14} /> Saída
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">Data/Hora</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Local</th>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">Qtd</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {(filteredItems as StockHistory[]).map(h => (
                <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-400 font-mono text-xs">{new Date(h.data || Date.now()).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${h.tipo === 'entrada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {h.tipo === 'entrada' ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {h.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 capitalize text-gray-500">{h.local.replace(/([A-Z])/g, ' $1')}</td>
                  <td className="px-6 py-4 font-bold">{h.produto}</td>
                  <td className="px-6 py-4">{h.quantidade}</td>
                  <td className="px-6 py-4 text-gray-400">R$ {(h.valorUnitario ?? 0).toFixed(2)}</td>
                  <td className="px-6 py-4 font-bold text-[#00C3F2]">R$ {(h.total ?? 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminEstoquePage;
