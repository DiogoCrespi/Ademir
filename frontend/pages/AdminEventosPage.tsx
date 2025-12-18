
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Event } from '../types';
import { Calendar, Users, MapPin, Clock, Plus, MoreVertical, CheckCircle, AlertCircle, X, ChevronRight } from 'lucide-react';

const AdminEventosPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newEvent, setNewEvent] = useState({ nome: '', data: '', descricao: '' });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const payload = [...events, { ...newEvent, id: Date.now().toString(), finalizado: false }];
      await api.saveEvents(payload);
      setEvents(payload);
      setShowAddModal(false);
      setNewEvent({ nome: '', data: '', descricao: '' });
    } catch (err) {
      alert('Erro ao criar evento.');
    }
  };

  const finalizeEvent = async (id: string) => {
    if (!confirm('Deseja realmente finalizar este evento?')) return;
    try {
      const payload = events.map(e => e.id === id ? { ...e, finalizado: true, dataFinalizacao: new Date().toISOString() } : e);
      await api.saveEvents(payload);
      setEvents(payload);
    } catch (err) {
      alert('Erro ao finalizar evento.');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin h-10 w-10 border-2 border-[#00C3F2] border-t-transparent rounded-full"></div></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Eventos</h2>
          <p className="text-gray-500">Agende e monitore o consumo em tempo real durante os eventos.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#00C3F2] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#00a0c7] transition-all shadow-lg shadow-blue-100"
        >
          <Plus size={20} /> Agendar Evento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event.id} className={`bg-white border ${event.finalizado ? 'border-gray-100 opacity-75' : 'border-blue-100'} p-6 rounded-3xl shadow-sm hover:shadow-md transition-all relative group overflow-hidden`}>
            {/* Header Badge */}
            <div className="absolute top-0 right-0 p-4">
              <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-bl-2xl rounded-tr-xl ${event.finalizado ? 'bg-gray-100 text-gray-500' : 'bg-[#00C3F2] text-white animate-pulse'}`}>
                {event.finalizado ? 'Finalizado' : 'Ativo'}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className={`p-4 rounded-2xl ${event.finalizado ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-[#00C3F2]'}`}>
                <Calendar size={28} />
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-lg truncate pr-16">{event.nome}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={12} /> {new Date(event.data).toLocaleDateString()} • {new Date(event.data).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl mb-6 space-y-3">
              <p className="text-sm text-gray-600 line-clamp-2">{event.descricao}</p>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#1F1F1F]">0</span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Produtos</span>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#1F1F1F]">R$ 0,00</span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Consumo</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 text-[#1F1F1F] rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2">
                Ver Detalhes <ChevronRight size={14} />
              </button>
              {!event.finalizado && (
                <button 
                  onClick={() => finalizeEvent(event.id)}
                  className="px-4 py-2.5 bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-600 rounded-xl font-bold text-xs transition-colors"
                >
                  Finalizar
                </button>
              )}
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white border-2 border-dashed border-gray-100 rounded-3xl">
            <Calendar size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-400">Nenhum evento agendado</h3>
            <p className="text-sm text-gray-300">Crie seu primeiro evento clicando no botão acima.</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold">Novo Evento</h3>
              <button onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Nome do Evento</label>
                <input 
                  className="w-full p-4 border border-gray-100 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#00C3F2] font-bold" 
                  placeholder="Ex: Pool Party Verão"
                  value={newEvent.nome}
                  onChange={e => setNewEvent({...newEvent, nome: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Data e Hora de Início</label>
                  <input 
                    type="datetime-local"
                    className="w-full p-4 border border-gray-100 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#00C3F2] font-bold" 
                    value={newEvent.data}
                    onChange={e => setNewEvent({...newEvent, data: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Breve Descrição</label>
                <textarea 
                  className="w-full p-4 border border-gray-100 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#00C3F2] text-sm" 
                  rows={3}
                  placeholder="Detalhes sobre o evento..."
                  value={newEvent.descricao}
                  onChange={e => setNewEvent({...newEvent, descricao: e.target.value})}
                />
              </div>
              <button 
                onClick={handleCreate}
                disabled={!newEvent.nome || !newEvent.data}
                className="w-full py-4 bg-[#00C3F2] disabled:bg-gray-200 text-white rounded-2xl font-bold shadow-lg shadow-blue-100"
              >
                Confirmar Agendamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventosPage;
