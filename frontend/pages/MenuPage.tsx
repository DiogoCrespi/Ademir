
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Category, MenuItem, Card } from '../types';
// Added X icon to the imports
import { ShoppingCart, Search, Trash2, CreditCard, ChevronRight, Check, X, AlertCircle, RefreshCw } from 'lucide-react';

const MenuPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<{ item: MenuItem; qty: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Checkout states
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [foundCard, setFoundCard] = useState<Card | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'searching' | 'confirming' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMenu();
      setCategories(data.categorias.filter(c => c.ativo));
      setItems(data.itens.filter(i => i.ativo));
    } catch (error: any) {
      console.error('Failed to load menu', error);
      setError(error.message || 'Erro ao carregar cardápio.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (item: MenuItem) => {
    try {
      const stock = await api.checkStock(item.nome);
      if (stock.quantidade <= 0) {
        alert('Produto esgotado no estoque!');
        return;
      }
      
      const existing = cart.find(c => c.item.id === item.id);
      if (existing) {
        if (existing.qty + 1 > stock.quantidade) {
          alert('Quantidade máxima atingida baseada no estoque!');
          return;
        }
        setCart(cart.map(c => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      } else {
        setCart([...cart, { item, qty: 1 }]);
      }
    } catch (err) {
      alert('Erro ao verificar estoque.');
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(c => c.item.id !== id));
  };

  const total = cart.reduce((acc, curr) => acc + (curr.item.preco * curr.qty), 0);

  const filteredItems = items.filter(i => {
    const matchesSearch = i.nome.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? i.categoriaId === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleSearchCard = async () => {
    if (!cardNumber) return;
    setCheckoutStatus('searching');
    try {
      const card = await api.getCardByNumber(cardNumber);
      if (card) {
        setFoundCard(card);
        setCheckoutStatus('confirming');
      } else {
        setErrorMessage('Cartão não encontrado.');
        setCheckoutStatus('error');
      }
    } catch (err) {
      setErrorMessage('Erro ao buscar cartão.');
      setCheckoutStatus('error');
    }
  };

  const handleFinishOrder = async () => {
    if (!foundCard) return;
    if (foundCard.saldo < total) {
      alert('Saldo insuficiente!');
      return;
    }

    try {
      // 1. Debit card
      await api.debitCard(foundCard.id, {
        valor: total,
        itens: cart.map(c => ({
          nome: c.item.nome,
          quantidade: c.qty,
          preco: c.item.preco,
          total: c.item.preco * c.qty
        }))
      });

      // 2. Reduce stock for each item
      for (const cartItem of cart) {
        await api.reduceStock({ produtoNome: cartItem.item.nome, quantidade: cartItem.qty });
      }

      setCheckoutStatus('success');
      setCart([]);
      setTimeout(() => {
        setIsCheckingOut(false);
        setCheckoutStatus('idle');
        setCardNumber('');
        setFoundCard(null);
      }, 3000);
    } catch (err) {
      alert('Erro ao processar pedido.');
    }
  };

  if (loading) return <div className="flex flex-col items-center justify-center h-full gap-4">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C3F2]"></div>
    <p className="text-sm text-gray-500 font-medium">Carregando cardápio...</p>
  </div>;

  if (error) return (
    <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-4">
      <div className="p-6 bg-red-50 text-red-500 rounded-full">
        <AlertCircle size={48} />
      </div>
      <div>
        <h3 className="text-xl font-bold text-[#1F1F1F]">Ops! Algo deu errado</h3>
        <p className="text-gray-500 mt-2 max-w-md">{error}</p>
      </div>
      <button 
        onClick={loadData}
        className="px-8 py-3 bg-[#00C3F2] text-white rounded-xl font-bold flex items-center gap-2 hover:bg-[#00a0c7] transition-all shadow-lg shadow-blue-100"
      >
        <RefreshCw size={18} /> Tentar Novamente
      </button>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* Menu Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-[#1F1F1F]">Cardápio</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar item..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-[#00C3F2] focus:border-transparent outline-none w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button 
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${!selectedCategory ? 'bg-[#00C3F2] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Tudo
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${selectedCategory === cat.id ? 'bg-[#00C3F2] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {cat.titulo}
            </button>
          ))}
        </div>

        {/* Grid of items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pr-2">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
              <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                <img src={`https://picsum.photos/seed/${item.id}/400/300`} alt={item.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-[#00C3F2]">
                  R$ {item.preco.toFixed(2)}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{item.nome}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{item.desc}</p>
                <button 
                  onClick={() => addToCart(item)}
                  className="w-full py-2 bg-gray-50 hover:bg-[#00C3F2] hover:text-white text-[#00C3F2] rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400">Nenhum item encontrado.</div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col bg-white border border-gray-200 rounded-2xl shadow-sm h-fit sticky top-0">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-[#00C3F2]" />
            <span className="font-bold">Meu Carrinho</span>
          </div>
          <span className="bg-[#00C3F2] text-white text-xs px-2 py-1 rounded-full">{cart.length}</span>
        </div>

        <div className="p-4 flex-1 min-h-[200px] max-h-[400px] overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <ShoppingCart size={40} className="mb-2 opacity-20" />
              <p className="text-sm">Seu carrinho está vazio</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(c => (
                <div key={c.item.id} className="flex justify-between items-start group">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{c.item.nome}</p>
                    <p className="text-xs text-gray-500">{c.qty}x R$ {c.item.preco.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">R$ {(c.qty * c.item.preco).toFixed(2)}</span>
                    <button onClick={() => removeFromCart(c.item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 space-y-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <span className="text-[#00C3F2]">R$ {total.toFixed(2)}</span>
          </div>
          <button 
            disabled={cart.length === 0}
            onClick={() => setIsCheckingOut(true)}
            className="w-full py-3 bg-[#00C3F2] disabled:bg-gray-300 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all flex items-center justify-center gap-2"
          >
            Finalizar Pedido
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckingOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">Pagamento com Cartão</h3>
              <button onClick={() => setIsCheckingOut(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              {checkoutStatus === 'idle' || checkoutStatus === 'searching' || checkoutStatus === 'error' ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-50 text-[#00C3F2] rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CreditCard size={32} />
                    </div>
                    <p className="text-gray-500">Insira o número ou os últimos 4 dígitos do seu cartão pré-pago.</p>
                  </div>

                  <div className="space-y-2">
                    <input 
                      type="text" 
                      placeholder="Número do Cartão"
                      className={`w-full px-4 py-3 border rounded-xl text-center text-xl font-bold outline-none focus:ring-2 focus:ring-[#00C3F2] transition-all ${checkoutStatus === 'error' ? 'border-red-300' : 'border-gray-200'}`}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                    {checkoutStatus === 'error' && <p className="text-red-500 text-center text-sm">{errorMessage}</p>}
                  </div>

                  <button 
                    onClick={handleSearchCard}
                    disabled={!cardNumber || checkoutStatus === 'searching'}
                    className="w-full py-4 bg-[#00C3F2] text-white rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    {checkoutStatus === 'searching' ? <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div> : 'Buscar Cartão'}
                  </button>
                </div>
              ) : checkoutStatus === 'confirming' ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-2xl space-y-2">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Titular</span>
                      <span className="font-bold text-[#1F1F1F]">{foundCard?.nome}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Saldo Atual</span>
                      <span className="font-bold text-[#1F1F1F]">R$ {foundCard?.saldo.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-gray-200 my-2"></div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Pedido</span>
                      <span className="text-red-500">- R$ {total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold border-t pt-2">
                      <span>Saldo Após</span>
                      <span className={`text-${(foundCard?.saldo || 0) - total >= 0 ? 'green' : 'red'}-600`}>
                        R$ {((foundCard?.saldo || 0) - total).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {(foundCard?.saldo || 0) < total ? (
                    <p className="text-red-500 text-center font-semibold">Saldo insuficiente para completar a compra.</p>
                  ) : (
                    <button 
                      onClick={handleFinishOrder}
                      className="w-full py-4 bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      Confirmar Pagamento
                    </button>
                  )}
                  <button onClick={() => setCheckoutStatus('idle')} className="w-full text-gray-400 text-sm hover:underline">Voltar</button>
                </div>
              ) : checkoutStatus === 'success' ? (
                <div className="text-center py-8 space-y-4 animate-in fade-in zoom-in-90">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <Check size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-green-600">Pedido Sucesso!</h3>
                  <p className="text-gray-500">Sua compra foi processada e o estoque atualizado. Retire seus produtos no balcão.</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
