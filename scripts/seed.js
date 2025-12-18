/**
 * Seed de dados para o backend (arquivos em backend/data).
 * Executar a partir da raiz do projeto:
 *   npm run seed
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'backend', 'data');
fs.mkdirSync(dataDir, { recursive: true });

const write = (filename, data) => {
  const filepath = path.join(dataDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ ${filename}`);
};

// Menu (novo formato: { categorias, itens })
write('menu.json', {
  categorias: [
    { id: 'bebidas', titulo: 'Bebidas', img: 'https://i.ibb.co/8DWyqRjT/refrigerante.png', ativo: true },
    { id: 'porcoes', titulo: 'Porções', img: 'https://i.ibb.co/qFxWFY7Y/porcao.png', ativo: true },
    { id: 'burger', titulo: 'Burger', img: 'https://i.ibb.co/sphwvfNN/hamburguer.png', ativo: true },
  ],
  itens: [
    { id: 'coca', nome: 'Coca-Cola Lata', preco: 6.0, desc: '350ml gelada', ativo: true, categoriaId: 'bebidas' },
    { id: 'guarana', nome: 'Guaraná Lata', preco: 5.5, desc: '350ml', ativo: true, categoriaId: 'bebidas' },
    { id: 'batata', nome: 'Batata Frita', preco: 24.0, desc: '500g crocante', ativo: true, categoriaId: 'porcoes' },
    { id: 'iscas', nome: 'Iscas de Frango', preco: 32.0, desc: '500g com molho', ativo: true, categoriaId: 'porcoes' },
    { id: 'cheeseburger', nome: 'Cheeseburger', preco: 28.0, desc: '160g, queijo, salada', ativo: true, categoriaId: 'burger' },
    { id: 'cheddar', nome: 'Cheddar Bacon', preco: 32.0, desc: 'Cheddar cremoso e bacon', ativo: true, categoriaId: 'burger' },
  ],
});

// Cartões
write('cartoes.json', [
  { id: 1, numero: '1111 2222 3333 4444', nome: 'João Silva', saldo: 120.5, ativo: true },
  { id: 2, numero: '5555 6666 7777 8888', nome: 'Maria Souza', saldo: 75.0, ativo: true },
  { id: 3, numero: '9999 0000 1111 2222', nome: 'Cliente Inativo', saldo: 10.0, ativo: false },
]);

// Transações de cartões (histórico)
write('cartoes-transacoes.json', [
  {
    id: Date.now(),
    cartaoId: 1,
    cartaoNumero: '1111 2222 3333 4444',
    tipo: 'recarga',
    valor: 100,
    saldoAnterior: 20.5,
    saldoAtual: 120.5,
    data: new Date().toISOString(),
    descricao: 'Recarga inicial',
  },
  {
    id: Date.now() + 1,
    cartaoId: 2,
    cartaoNumero: '5555 6666 7777 8888',
    tipo: 'compra',
    valor: 25,
    saldoAnterior: 100,
    saldoAtual: 75,
    data: new Date().toISOString(),
    itens: [{ nome: 'Batata Frita', quantidade: 1, preco: 25 }],
    descricao: 'Compra de porção',
  },
]);

// Estoque
write('estoque.json', {
  geladeiras: [
    { id: 'g1', nome: 'Coca-Cola Lata', quantidade: 30, valorUnitario: 4.5, updatedAt: new Date().toISOString() },
    { id: 'g2', nome: 'Guaraná Lata', quantidade: 25, valorUnitario: 4.0, updatedAt: new Date().toISOString() },
    { id: 'g3', nome: 'Heineken 330ml', quantidade: 40, valorUnitario: 8.0, updatedAt: new Date().toISOString() },
  ],
  cameraFria: [
    { id: 'c1', nome: 'Batata Frita', quantidade: 15, valorUnitario: 12.0, updatedAt: new Date().toISOString() },
    { id: 'c2', nome: 'Iscas de Frango', quantidade: 10, valorUnitario: 16.0, updatedAt: new Date().toISOString() },
  ],
});

write('estoque-historico.json', [
  {
    id: Date.now(),
    data: new Date().toISOString(),
    tipo: 'entrada',
    local: 'geladeiras',
    produtoId: 'g1',
    produtoNome: 'Coca-Cola Lata',
    quantidade: 30,
    valorUnitario: 4.5,
    total: 135,
    observacao: 'Carga inicial',
  },
]);

// Eventos
write('eventos.json', [
  {
    id: 1,
    nome: 'Festival de Verão',
    finalizado: false,
    itens: [
      { nome: 'Cerveja Long Neck', quantidadeInicial: 200, quantidadeConsumida: 40 },
      { nome: 'Batata Frita', quantidadeInicial: 80, quantidadeConsumida: 10 },
    ],
    dataCriacao: new Date().toISOString(),
  },
]);

// Bilheteria
write('bilheteria-config.json', {
  precoNormal: 20,
  precoMeio: 10,
  precoPassaporte: 50,
});

write('bilheteria-ingressos.json', [
  {
    id: Date.now(),
    codigo: 'ING001',
    tipo: 'normal',
    valor: 20,
    dataVenda: new Date().toISOString(),
    dataVendaDate: new Date().toISOString().split('T')[0],
    liberado: false,
    dataLiberacao: null,
    formaPagamento: 'dinheiro',
  },
]);

console.log('Seed concluído. Dados gerados em backend/data/*.json');


