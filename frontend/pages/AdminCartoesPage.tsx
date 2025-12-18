
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Card, Transaction } from '../types';
import { Search, Plus, Filter, MoreHorizontal, Eye, RefreshCw, Undo2, X, AlertCircle } from 'lucide-react';

const AdminCartoesPage: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState<Card | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<Card | null>(null);
  
  // Form States
  const [newCard, setNewCard] = useState({ nome: '', documento: '', saldo: 0 });
  const [rechargeAmount, setRechargeAmount] = useState(0);
  const [history, setHistory] = useState<Transaction[]>([]);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const data = await api.getCards();
      setCards(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async () => {
    try {
      const generatedNumber = '2500' + Math.floor(1000 + Math.random() * 9000);
      const payload = [...cards, { ...newCard, id: Date.now().toString(), numero: generatedNumber, ativo: true }];
      await api.saveCards(payload);
      setCards(payload);
      setShowAddModal(false);
      setNewCard({ nome: '', documento: '', saldo: 0 });
    } catch (err) {
      alert('Erro ao salvar cartão.');
    }
  };

  const handleRecharge = async () => {
    if (!showRechargeModal) return;
    try {
      await api.rechargeCard(showRechargeModal.id, { valor: rechargeAmount, descricao: 'Recarga administrativa' });
      await loadCards();
      setShowRechargeModal(null);
      setRechargeAmount(0);
    } catch (err) {
      alert('Erro ao recarregar.');
    }
  };

  const viewHistory = async (card: Card) => {
    setShowHistoryModal(card);
    try {
      const data = await api.getTransactions(card.id);
      setHistory(data);
    } catch (err) {
      alert('Erro ao carregar extrato.');
    }
  };

  const filteredCards = cards.filter(c => 
    c.nome.toLowerCase().includes(search.toLowerCase()) || 
    c.numero.includes(search) || 
    c.documento.includes(search)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Cartões</h2>
          <p className="text-gray-500">Visualize, recarregue e acompanhe extratos de clientes.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#00C3F2] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#00a0c7] transition-colors shadow-lg shadow-blue-100"
        >
          <Plus size={20} /> Novo Cartão
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por nome, número ou documento..."
              className="w-full pl-10 pr-4 py-2 border-0 bg-white shadow-sm ring-1 ring-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#00C3F2]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={18} className="text-gray-500" />
            </button>
            <button className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" onClick={loadCards}>
              <RefreshCw size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Cartão</th>
                <th className="px-6 py-4">Titular</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Saldo</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCards.map(card => (
                <tr key={card.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-semibold bg-gray-100 px-2 py-1 rounded">{card.numero}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#1F1F1F]">{card.nome}</span>
                      <span className="text-xs text-gray-400">{card.documento}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${card.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {card.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-[#00C3F2]">R$ {card.saldo.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => viewHistory(card)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="Ver Extrato">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => setShowRechargeModal(card)} className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors" title="Recarregar">
                        <Plus size={18} />
                      </button>
                      <button className="p-2 hover:bg-gray-100 text-gray-400 rounded-lg transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCards.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Nenhum cartão encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold">Novo Cartão Pré-pago</h3>
              <button onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <div className="p-8 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Nome do Titular</label>
                <input 
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#00C3F2]" 
                  value={newCard.nome}
                  onChange={e => setNewCard({...newCard, nome: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Documento (CPF/RG)</label>
                <input 
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#00C3F2]" 
                  value={newCard.documento}
                  onChange={e => setNewCard({...newCard, documento: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Saldo Inicial (Opcional)</label>
                <input 
                  type="number"
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#00C3F2]" 
                  value={newCard.saldo}
                  onChange={e => setNewCard({...newCard, saldo: Number(e.target.value)})}
                />
              </div>
              <button onClick={handleAddCard} className="w-full py-4 bg-[#00C3F2] text-white rounded-xl font-bold shadow-lg shadow-blue-100 mt-4">Criar Cartão</button>
            </div>
          </div>
        </div>
      )}

      {/* Recharge Modal */}
      {showRechargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b bg-green-50 flex justify-between items-center text-green-800">
              <h3 className="text-xl font-bold">Recarregar Cartão</h3>
              <button onClick={() => setShowRechargeModal(null)}><X size={20} /></button>
            </div>
            <div className="p-8 space-y-4">
              <div className="text-center p-4 bg-gray-50 rounded-2xl mb-4">
                <p className="text-sm text-gray-500">Cartão de</p>
                <p className="font-bold text-lg">{showRechargeModal.nome}</p>
                <p className="text-[#00C3F2] font-mono">{showRechargeModal.numero}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Valor da Recarga (R$)</label>
                <input 
                  type="number"
                  className="w-full p-4 border rounded-xl text-2xl font-bold text-center outline-none focus:ring-2 focus:ring-green-500" 
                  autoFocus
                  value={rechargeAmount}
                  onChange={e => setRechargeAmount(Number(e.target.value))}
                />
              </div>
              <button onClick={handleRecharge} className="w-full py-4 bg-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-100">Confirmar Recarga</button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
            <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Extrato do Cartão</h3>
                <p className="text-sm text-gray-500">{showHistoryModal.nome} • {showHistoryModal.numero}</p>
              </div>
              <button onClick={() => setShowHistoryModal(null)}><X size={20} /></button>
            </div>
            <div className="p-0 overflow-y-auto max-h-[60vh]">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white border-b border-gray-100 shadow-sm z-10">
                  <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Data/Hora</th>
                    <th className="px-6 py-4">Tipo</th>
                    <th className="px-6 py-4">Valor</th>
                    <th className="px-6 py-4">Descrição</th>
                    <th className="px-6 py-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history.map(tx => (
                    <tr key={tx.id} className={`${tx.estornada ? 'bg-red-50/30 line-through opacity-50' : ''}`}>
                      <td className="px-6 py-4 text-xs text-gray-500">{new Date(tx.data).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          tx.tipo === 'compra' ? 'bg-orange-100 text-orange-700' : 
                          tx.tipo === 'recarga' ? 'bg-green-100 text-green-700' : 
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {tx.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-sm">
                        <span className={tx.tipo === 'compra' ? 'text-red-500' : 'text-green-500'}>
                          {tx.tipo === 'compra' ? '-' : '+'} R$ {tx.valor.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 max-w-[150px] truncate">{tx.descricao}</td>
                      <td className="px-6 py-4 text-right">
                        {tx.tipo === 'compra' && !tx.estornada && (
                          <button 
                            className="p-1.5 hover:bg-red-50 text-red-500 rounded transition-colors" 
                            title="Estornar"
                            onClick={async () => {
                              if(confirm('Deseja estornar esta transação?')) {
                                await api.refundTransactions(showHistoryModal.id, [tx.id]);
                                viewHistory(showHistoryModal);
                                loadCards();
                              }
                            }}
                          >
                            <Undo2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr><td colSpan={5} className="p-12 text-center text-gray-400">Nenhuma transação registrada.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-gray-50 border-t flex justify-between items-center">
              <div className="flex gap-4">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Saldo Atual</p>
                  <p className="text-xl font-bold text-[#00C3F2]">R$ {showHistoryModal.saldo.toFixed(2)}</p>
                </div>
              </div>
              <button onClick={() => setShowHistoryModal(null)} className="px-6 py-2 bg-white border border-gray-200 rounded-xl font-semibold">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCartoesPage;
