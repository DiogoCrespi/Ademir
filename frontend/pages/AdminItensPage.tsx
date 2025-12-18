
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Category, MenuItem } from '../types';
import { Plus, Edit2, Trash2, Check, X, Camera, Grid, List } from 'lucide-react';

const AdminItensPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const data = await api.getMenu();
      setCategories(data.categorias);
      setItems(data.itens);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMenu = async (newCats: Category[], newItems: MenuItem[]) => {
    try {
      await api.saveMenu({ categorias: newCats, itens: newItems });
      setCategories(newCats);
      setItems(newItems);
      setEditingCategory(null);
      setEditingItem(null);
    } catch (err) {
      alert('Erro ao salvar menu.');
    }
  };

  const addCategory = () => {
    const newCat: Category = { id: Date.now().toString(), titulo: 'Nova Categoria', img: '', ativo: true };
    setEditingCategory(newCat);
  };

  const addItem = (catId: string) => {
    const newItem: MenuItem = { id: Date.now().toString(), nome: 'Novo Item', preco: 0, desc: '', ativo: true, categoriaId: catId };
    setEditingItem(newItem);
  };

  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin h-10 w-10 border-2 border-[#00C3F2] border-t-transparent rounded-full"></div></div>;

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestão do Cardápio</h2>
          <p className="text-gray-500">Organize categorias e produtos que aparecem no cardápio do cliente.</p>
        </div>
        <button 
          onClick={addCategory}
          className="bg-[#00C3F2] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#00a0c7] transition-all shadow-lg shadow-blue-100"
        >
          <Plus size={20} /> Nova Categoria
        </button>
      </div>

      <div className="space-y-12">
        {categories.map(cat => (
          <div key={cat.id} className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl overflow-hidden">
                  <img src={cat.img || `https://picsum.photos/seed/${cat.id}/100/100`} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{cat.titulo}</h3>
                  <span className={`text-[10px] font-bold uppercase ${cat.ativo ? 'text-green-500' : 'text-red-400'}`}>
                    {cat.ativo ? 'Ativo no Site' : 'Inativo'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setEditingCategory(cat)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#00C3F2] transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleSaveMenu(categories.filter(c => c.id !== cat.id), items.filter(i => i.categoriaId !== cat.id))}
                  className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                <button 
                  onClick={() => addItem(cat.id)}
                  className="ml-4 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-[#00C3F2] rounded-xl text-xs font-bold transition-all border border-gray-200"
                >
                  Adicionar Item
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {items.filter(i => i.categoriaId === cat.id).map(item => (
                <div key={item.id} className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-blue-50 text-[#00C3F2] rounded-xl flex items-center justify-center font-bold">
                      {item.nome.charAt(0)}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingItem(item)} className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg"><Edit2 size={14} /></button>
                      <button onClick={() => handleSaveMenu(categories, items.filter(i => i.id !== item.id))} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <h4 className="font-bold text-lg mb-1">{item.nome}</h4>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-4 h-10">{item.desc || 'Sem descrição cadastrada.'}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className="text-xl font-black text-[#00C3F2]">R$ {item.preco.toFixed(2)}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${item.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.ativo ? 'Ativo' : 'Pausado'}
                    </span>
                  </div>
                </div>
              ))}
              {items.filter(i => i.categoriaId === cat.id).length === 0 && (
                <div className="col-span-full py-8 text-center text-gray-300 text-sm border-2 border-dashed border-gray-100 rounded-3xl italic">
                  Nenhum item nesta categoria.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold">{editingCategory.id.length > 15 ? 'Editar' : 'Nova'} Categoria</h3>
              <button onClick={() => setEditingCategory(null)}><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 bg-gray-100 rounded-3xl overflow-hidden relative group cursor-pointer border-4 border-white shadow-xl">
                  <img src={editingCategory.img || `https://picsum.photos/seed/${editingCategory.id}/200/200`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Camera size={32} />
                  </div>
                </div>
                <p className="text-xs text-gray-400 text-center font-medium">Recomendado: 400x400px</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-widest">Título da Categoria</label>
                <input 
                  className="w-full p-4 border border-gray-100 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#00C3F2] font-bold" 
                  value={editingCategory.titulo}
                  onChange={e => setEditingCategory({...editingCategory, titulo: e.target.value})}
                />
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
                <input 
                  type="checkbox" 
                  id="cat-ativo"
                  className="w-5 h-5 accent-[#00C3F2]" 
                  checked={editingCategory.ativo}
                  onChange={e => setEditingCategory({...editingCategory, ativo: e.target.checked})}
                />
                <label htmlFor="cat-ativo" className="text-sm font-bold text-gray-600">Categoria Ativa no Cardápio</label>
              </div>
              <button 
                onClick={() => {
                  const exists = categories.find(c => c.id === editingCategory.id);
                  const newCats = exists ? categories.map(c => c.id === editingCategory.id ? editingCategory : c) : [...categories, editingCategory];
                  handleSaveMenu(newCats, items);
                }}
                className="w-full py-4 bg-[#00C3F2] text-white rounded-2xl font-bold shadow-lg shadow-blue-100"
              >
                Salvar Categoria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold">{editingItem.id.length > 15 ? 'Editar' : 'Novo'} Produto</h3>
              <button onClick={() => setEditingItem(null)}><X size={20} /></button>
            </div>
            <div className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-widest">Nome do Produto</label>
                  <input className="w-full p-4 border border-gray-100 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#00C3F2] font-bold" value={editingItem.nome} onChange={e => setEditingItem({...editingItem, nome: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-widest">Preço de Venda</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                    <input type="number" step="0.01" className="w-full pl-12 pr-4 py-4 border border-gray-100 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#00C3F2] font-black" value={editingItem.preco} onChange={e => setEditingItem({...editingItem, preco: Number(e.target.value)})} />
                  </div>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-widest">Status</label>
                   <select className="w-full p-4 border border-gray-100 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#00C3F2] font-bold" value={editingItem.ativo ? 'true' : 'false'} onChange={e => setEditingItem({...editingItem, ativo: e.target.value === 'true'})}>
                    <option value="true">Ativo</option>
                    <option value="false">Inativo/Pausado</option>
                   </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-widest">Descrição / Ingredientes</label>
                <textarea className="w-full p-4 border border-gray-100 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#00C3F2] text-sm" rows={3} value={editingItem.desc} onChange={e => setEditingItem({...editingItem, desc: e.target.value})} />
              </div>
              <button 
                onClick={() => {
                  const exists = items.find(i => i.id === editingItem.id);
                  const newItems = exists ? items.map(i => i.id === editingItem.id ? editingItem : i) : [...items, editingItem];
                  handleSaveMenu(categories, newItems);
                }}
                className="w-full py-4 bg-[#00C3F2] text-white rounded-2xl font-bold shadow-lg shadow-blue-100 mt-4"
              >
                Confirmar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminItensPage;
