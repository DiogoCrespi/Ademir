
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import MenuPage from './pages/MenuPage';
import AdminCartoesPage from './pages/AdminCartoesPage';
import AdminItensPage from './pages/AdminItensPage';
import AdminEstoquePage from './pages/AdminEstoquePage';
import AdminEventosPage from './pages/AdminEventosPage';
import BilheteriaPage from './pages/BilheteriaPage';
import ControlePage from './pages/ControlePage';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/admin/cartoes" element={<AdminCartoesPage />} />
          <Route path="/admin/itens" element={<AdminItensPage />} />
          <Route path="/admin/estoque" element={<AdminEstoquePage />} />
          <Route path="/admin/eventos" element={<AdminEventosPage />} />
          <Route path="/admin/bilheteria" element={<BilheteriaPage />} />
          <Route path="/admin/controle" element={<ControlePage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
