
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TicketConfig, Ticket } from '../types';
// Added Minus, Plus, and Clock icons to the imports
import { Ticket as TicketIcon, CreditCard, Banknote, QrCode, Smartphone, X, Check, History, Settings, Minus, Plus, Clock } from 'lucide-react';

const BilheteriaPage: React.FC = () => {
  // FIXED: corrected meiot to meio
  const [config, setConfig] = useState<TicketConfig>({ normal: 0, meio: 0, passaporte: 0 });
  const [selectedTickets, setSelectedTickets] = useState<{ type: keyof TicketConfig, qty: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'pix' | 'credito' | 'debito' | null>(null);
  const [ticketsSold, setTicketsSold] = useState<Ticket[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const configData = await api.getTicketConfig();
      const soldData = await api.getTickets();

      // Normaliza para as chaves esperadas pelo front (normal/meio/passaporte)
      const normalizedConfig: TicketConfig = {
        normal: parseFloat(configData?.precoNormal ?? configData?.normal ?? 0) || 0,
        meio: parseFloat(configData?.precoMeio ?? configData?.meio ?? 0) || 0,
        passaporte: parseFloat(configData?.precoPassaporte ?? configData?.passaporte ?? 0) || 0,
      };

      setConfig(normalizedConfig);
      setTicketsSold(
        (soldData || []).map(t => ({
          ...t,
          valor: typeof t.valor === 'number' ? t.valor : parseFloat(t.valor ?? 0) || 0,
          formaPagamento: t.formaPagamento || t.forma_pagamento || '',
        }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketQty = (type: keyof TicketConfig, delta: number) => {
    const existing = selectedTickets.find(t => t.type === type);
    if (existing) {
      const newQty = Math.max(0, existing.qty + delta);
      if (newQty === 0) {
        setSelectedTickets(selectedTickets.filter(t => t.type !== type));
      } else {
        setSelectedTickets(selectedTickets.map(t => t.type === type ? { ...t, qty: newQty } : t));
      }
    } else if (delta > 0) {
      setSelectedTickets([...selectedTickets, { type, qty: delta }]);
    }
  };

  const total = selectedTickets.reduce((acc, curr) => acc + (config[curr.type] * curr.qty), 0);

  const handleSell = async () => {
    if (selectedTickets.length === 0 || !paymentMethod) return;
    setStatus('processing');
    try {
      const payRes = await api.processPayment({ valor: total, formaPagamento: paymentMethod, tipos: selectedTickets });
      if (payRes.success) {
        for (const t of selectedTickets) {
          await api.sellTicket({ tipo: t.type, quantidade: t.qty, formaPagamento: paymentMethod });
        }
        setStatus('success');
        setSelectedTickets([]);
        setPaymentMethod(null);
        setTimeout(() => setStatus('idle'), 3000);
        loadData();
      }
    } catch (err) {
      alert('Erro ao processar venda.');
      setStatus('idle');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin h-10 w-10 border-2 border-[#00C3F2] border-t-transparent rounded-full"></div></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      {/* Sales Control */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Venda de Ingressos</h2>
            <p className="text-gray-500">Selecione os tipos de entrada e processar pagamento.</p>
          </div>
          <button 
            onClick={() => setShowConfig(true)}
            className="p-3 bg-gray-100 text-gray-600 hover:bg-[#00C3F2] hover:text-white rounded-2xl transition-all"
          >
            <Settings size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {(['normal', 'meio', 'passaporte'] as (keyof TicketConfig)[]).map(type => (
            <div key={type} className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl ${type === 'passaporte' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-[#00C3F2]'}`}>
                  <TicketIcon size={24} />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{type}</span>
              </div>
              <h3 className="font-bold text-lg mb-4 capitalize">Ingresso {type}</h3>
              <p className="text-2xl font-black text-[#1F1F1F] mb-6">R$ {config[type].toFixed(2)}</p>
              
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded-2xl">
                <button 
                  onClick={() => updateTicketQty(type, -1)}
                  className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="font-bold text-lg">
                  {selectedTickets.find(t => t.type === type)?.qty || 0}
                </span>
                <button 
                  onClick={() => updateTicketQty(type, 1)}
                  className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-green-50 hover:text-green-500 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold mb-6">Forma de Pagamento</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { id: 'dinheiro', label: 'Dinheiro', icon: Banknote, color: 'hover:border-green-500 hover:bg-green-50' },
              { id: 'pix', label: 'Pix', icon: QrCode, color: 'hover:border-[#00C3F2] hover:bg-blue-50' },
              { id: 'credito', label: 'Crédito', icon: CreditCard, color: 'hover:border-purple-500 hover:bg-purple-50' },
              { id: 'debito', label: 'Débito', icon: Smartphone, color: 'hover:border-orange-500 hover:bg-orange-50' },
            ].map(method => (
              <button 
                key={method.id}
                onClick={() => setPaymentMethod(method.id as any)}
                className={`flex flex-col items-center justify-center p-6 border-2 rounded-3xl transition-all gap-3 ${paymentMethod === method.id ? 'border-[#00C3F2] bg-blue-50' : 'border-gray-50 ' + method.color}`}
              >
                <method.icon size={28} className={paymentMethod === method.id ? 'text-[#00C3F2]' : 'text-gray-300'} />
                <span className={`text-xs font-bold uppercase ${paymentMethod === method.id ? 'text-[#00C3F2]' : 'text-gray-400'}`}>{method.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Sidebar */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-[#1F1F1F] text-white p-8 rounded-3xl shadow-xl space-y-6">
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
            <h3 className="font-bold text-lg">Resumo de Venda</h3>
            <History size={20} className="text-gray-500" />
          </div>
          
          <div className="space-y-4 min-h-[150px]">
            {selectedTickets.length === 0 ? (
              <p className="text-gray-500 text-center py-10 italic">Nenhum ingresso selecionado.</p>
            ) : (
              selectedTickets.map(t => (
                <div key={t.type} className="flex justify-between items-center group">
                  <div>
                    <p className="capitalize font-bold text-sm">Ingresso {t.type}</p>
                    <p className="text-xs text-gray-500">{t.qty}x R$ {config[t.type].toFixed(2)}</p>
                  </div>
                  <span className="font-bold">R$ {(t.qty * config[t.type]).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>

          <div className="pt-6 border-t border-white/10 space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Total Geral</span>
              <span className="text-3xl font-black text-[#00C3F2]">R$ {total.toFixed(2)}</span>
            </div>

            <button 
              disabled={selectedTickets.length === 0 || !paymentMethod || status === 'processing'}
              onClick={handleSell}
              className={`w-full py-5 rounded-2xl font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-3 ${
                status === 'success' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-[#00C3F2] hover:bg-[#00a0c7] disabled:bg-white/5 disabled:text-gray-600 text-white'
              }`}
            >
              {status === 'processing' ? <div className="animate-spin h-6 w-6 border-4 border-white/20 border-t-white rounded-full"></div> : 
               status === 'success' ? <><Check size={28} /> VENDIDO!</> : 
               'CONFIRMAR VENDA'}
            </button>
          </div>
        </div>

        {/* Recent Tickets Sold */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col max-h-[400px]">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Clock size={18} className="text-[#00C3F2]" /> Últimas Vendas
          </h3>
          <div className="space-y-4 overflow-y-auto pr-2 scrollbar-hide">
            {ticketsSold.slice(0, 5).map(ticket => (
              <div key={ticket.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                <div className={`p-2 rounded-xl bg-white text-${ticket.liberado ? 'gray' : 'blue'}-400 shadow-sm`}>
                  <TicketIcon size={16} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold truncate">#{ticket.codigo}</p>
                  <p className="text-[10px] text-gray-400 capitalize">{ticket.tipo} • {ticket.formaPagamento}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold">R$ {ticket.valor.toFixed(2)}</p>
                  <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${ticket.liberado ? 'bg-gray-200 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                    {ticket.liberado ? 'Utilizado' : 'Ativo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Config Modal */}
      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold">Preços Bilheteria</h3>
              <button onClick={() => setShowConfig(false)}><X size={20} /></button>
            </div>
            <div className="p-8 space-y-4">
              {['normal', 'meio', 'passaporte'].map(type => (
                <div key={type}>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Preço Ingresso {type}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                    <input 
                      type="number"
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#00C3F2] font-black text-2xl" 
                      value={config[type as keyof TicketConfig]}
                      onChange={e => setConfig({...config, [type]: Number(e.target.value)})}
                    />
                  </div>
                </div>
              ))}
              <button 
                onClick={async () => {
                  await api.saveTicketConfig(config);
                  setShowConfig(false);
                }}
                className="w-full py-4 bg-[#00C3F2] text-white rounded-2xl font-bold shadow-lg shadow-blue-100 mt-6"
              >
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BilheteriaPage;
