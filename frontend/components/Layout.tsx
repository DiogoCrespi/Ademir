
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  UtensilsCrossed, 
  Package, 
  Calendar, 
  Ticket, 
  Menu, 
  X,
  ChevronRight,
  User
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Cardápio', path: '/', icon: UtensilsCrossed },
    { label: 'Administração', divider: true },
    { label: 'Cartões', path: '/admin/cartoes', icon: CreditCard },
    { label: 'Itens & Menu', path: '/admin/itens', icon: Menu },
    { label: 'Estoque', path: '/admin/estoque', icon: Package },
    { label: 'Eventos', path: '/admin/eventos', icon: Calendar },
    { label: 'Bilheteria', path: '/admin/bilheteria', icon: Ticket },
    { label: 'Controle', path: '/admin/controle', icon: LayoutDashboard },
  ];

  const activePath = location.pathname;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-30 lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-6 bg-[#00C3F2]">
            <span className="text-white font-bold text-xl tracking-tight">ADEMIR</span>
            <button className="lg:hidden text-white" onClick={() => setSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            {navItems.map((item, idx) => {
              if (item.divider) {
                return (
                  <div key={`div-${idx}`} className="pt-4 pb-2 px-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {item.label}
                    </span>
                  </div>
                );
              }

              const Icon = item.icon!;
              const isActive = activePath === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path!}
                  className={`
                    flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-[#00C3F2] bg-opacity-10 text-[#00C3F2]' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    {item.label}
                  </div>
                  {isActive && <ChevronRight size={14} />}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Area */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
              <div className="w-10 h-10 rounded-full bg-[#00C3F2] flex items-center justify-center text-white">
                <User size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[#1F1F1F]">Administrador</span>
                <span className="text-xs text-gray-500">Online</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <button className="lg:hidden text-gray-500" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-[#1F1F1F]">FOTOS</h1>
            <div className="hidden md:block w-32 h-0.5 bg-[#CFCFCF] rounded-full"></div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Saldo do Dia</p>
              <p className="text-sm font-bold text-[#00C3F2]">R$ 1.250,00</p>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#FFFFFF]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
