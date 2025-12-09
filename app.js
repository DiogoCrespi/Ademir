const data = [
  {
    id: "refrigerantes",
    titulo: "Refrigerantes",
    img: "./refrigerante.png",
    itens: [
      { nome: "Coca-Cola Lata", preco: "R$ 6,00", desc: "350ml" },
      { nome: "Guaraná Lata", preco: "R$ 5,50", desc: "350ml" },
      { nome: "Sprite Lata", preco: "R$ 5,50", desc: "350ml" }
    ]
  },
  {
    id: "porcoes",
    titulo: "Porções",
    img: "./porção.png",
    itens: [
      { nome: "Batata Frita", preco: "R$ 24,00", desc: "500g crocante" },
      { nome: "Iscas de Frango", preco: "R$ 32,00", desc: "500g com molho" },
      { nome: "Anéis de Cebola", preco: "R$ 22,00", desc: "Porção média" }
    ]
  },
  {
    id: "hamburguer",
    titulo: "Hambúrguer",
    img: "./hamburguer.png",
    itens: [
      { nome: "Clássico", preco: "R$ 28,00", desc: "Blend 160g, queijo, salada" },
      { nome: "Cheddar Bacon", preco: "R$ 32,00", desc: "Cheddar cremoso e bacon" },
      { nome: "Veggie", preco: "R$ 29,00", desc: "Grão-de-bico, maionese verde" }
    ]
  },
  {
    id: "cerveja",
    titulo: "Cerveja",
    img: "./cerveja.png",
    itens: [
      { nome: "Heineken 330ml", preco: "R$ 14,00", desc: "Long neck" },
      { nome: "Stella 330ml", preco: "R$ 12,00", desc: "Long neck" },
      { nome: "Original 600ml", preco: "R$ 18,00", desc: "Garrafa" }
    ]
  },
  {
    id: "chop",
    titulo: "Chop",
    img: "./chopp.png",
    itens: [
      { nome: "Pilsen 300ml", preco: "R$ 8,00", desc: "Taça" },
      { nome: "Pilsen 500ml", preco: "R$ 12,00", desc: "Caneca" },
      { nome: "IPA 500ml", preco: "R$ 16,00", desc: "Caneca" }
    ]
  }
];

const categoriesGrid = document.getElementById("categoriesGrid");
const itemsList = document.getElementById("itemsList");
const categoriesScreen = document.getElementById("categoriesScreen");
const itemsScreen = document.getElementById("itemsScreen");
const paymentScreen = document.getElementById("paymentScreen");
const title = document.getElementById("title");
const breadcrumb = document.getElementById("breadcrumb");
const backBtn = document.getElementById("backBtn");
const cartList = document.getElementById("cartList");
const cartFloating = document.getElementById("cartFloating");
const cartStatus = document.getElementById("cartStatus");
const cartTotal = document.getElementById("cartTotal");
const clearCartBtn = document.getElementById("clearCartBtn");
const checkoutBtn = document.getElementById("checkoutBtn");
const cartToggle = document.getElementById("cartToggle");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartFinalize = document.getElementById("cartFinalize");
const cartFabs = document.getElementById("cartFabs");
const toast = document.getElementById("toast");
const checkoutModal = document.getElementById("checkoutModal");
const modalItems = document.getElementById("modalItems");
const modalClose = document.getElementById("modalClose");
const modalConfirm = document.getElementById("modalConfirm");
const modalTotal = document.getElementById("modalTotal");
const tableInput = document.getElementById("tableInput");
const paymentPanel = document.getElementById("paymentPanel");
const paymentInfo = document.getElementById("paymentInfo");
const cardManualField = document.getElementById("cardManualField");
const cardNumber = document.getElementById("cardNumber");
const cardHolder = document.getElementById("cardHolder");
const cardBalance = document.getElementById("cardBalance");
const cardTime = document.getElementById("cardTime");
const cardStatus = document.getElementById("cardStatus");
const cardStatusText = document.getElementById("cardStatusText");
const paymentBack = document.getElementById("paymentBack");
const paymentConfirm = document.getElementById("paymentConfirm");
let toastTimer = null;

const CART_KEY = "cartDataV1";
const CARTOES_KEY = "cartoes";
const cart = [];
let cartaoAtual = null;

function renderCategories() {
  categoriesGrid.innerHTML = "";
  data.forEach(cat => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img src="${cat.img}" alt="${cat.titulo}" class="card-img" loading="lazy" />
      <div class="card-meta">
        <div class="card-title">${cat.titulo}</div>
      </div>
    `;
    card.onclick = () => openCategory(cat);
    categoriesGrid.appendChild(card);
  });
}

function openCategory(cat) {
  breadcrumb.textContent = "Categorias › " + cat.titulo;
  title.textContent = cat.titulo;
  backBtn.style.display = "inline-flex";
  itemsList.innerHTML = "";
  cat.itens.forEach(item => {
    const row = document.createElement("article");
    row.className = "item";
    row.innerHTML = `
      <div class="item-title">${item.nome}</div>
      <div class="item-price">${item.preco}</div>
      <p class="item-desc">${item.desc}</p>
    `;
    row.onclick = () => addToCart(item, cat);
    itemsList.appendChild(row);
  });
  switchScreen("items");
}

function backToCategories() {
  breadcrumb.textContent = "Categorias";
  title.textContent = "Selecione uma categoria";
  backBtn.style.display = "none";
  switchScreen("categories");
}

function switchScreen(target) {
  const screens = {
    categories: categoriesScreen,
    items: itemsScreen,
    payment: paymentScreen,
  };
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[target].classList.add("active");
}

function parsePrice(str) {
  const cleaned = str.replace(/[^\d,.-]/g, "").replace(",", ".");
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : 0;
}

function formatPrice(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1000);
}

function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {
    console.warn("Não foi possível salvar o carrinho:", e);
  }
}

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      cart.push(
        ...parsed.map(entry => ({
          nome: entry.nome,
          preco: Number(entry.preco) || 0,
          desc: entry.desc || "",
          categoria: entry.categoria || "",
          qty: Number(entry.qty) || 1,
          obs: entry.obs || "",
        }))
      );
    }
  } catch (e) {
    console.warn("Não foi possível carregar o carrinho:", e);
  }
}

function addToCart(item, cat) {
  const existing = cart.find(c => c.nome === item.nome);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      nome: item.nome,
      preco: parsePrice(item.preco),
      desc: item.desc,
      categoria: cat.titulo,
      qty: 1,
      obs: "",
    });
  }
  renderCart(true); // Mostrar mensagem ao adicionar item
}

function updateQty(nome, delta) {
  const entry = cart.find(c => c.nome === nome);
  if (!entry) return;
  entry.qty += delta;
  if (entry.qty <= 0) {
    const idx = cart.findIndex(c => c.nome === nome);
    cart.splice(idx, 1);
  }
  renderCart();
}

function removeItem(nome) {
  const idx = cart.findIndex(c => c.nome === nome);
  if (idx >= 0) {
    cart.splice(idx, 1);
    renderCart();
  }
}

function clearCart() {
  cart.length = 0;
  renderCart();
  showToast("Carrinho limpo");
}

function renderCart(mostrarMensagem = false) {
  cartList.innerHTML = "";
  if (!cart.length) {
    cartList.innerHTML = `<div class="cart-sub">Carrinho vazio</div>`;
    cartFloating.classList.remove("visible", "open");
    cartToggle.classList.remove("visible");
  } else {
    cartFloating.classList.add("visible");
    cartToggle.classList.add("visible");
    cart.forEach(entry => {
      const line = document.createElement("div");
      line.className = "cart-item";
      line.innerHTML = `
        <div class="cart-row">
          <div>
            <div class="item-title">${entry.nome}</div>
            <div class="cart-sub">${entry.categoria}</div>
          </div>
          <div class="item-price">${formatPrice(entry.preco * entry.qty)}</div>
        </div>
        <div class="cart-actions">
          <button class="chip" data-action="dec">-</button>
          <span>${entry.qty}x</span>
          <button class="chip" data-action="inc">+</button>
          <button class="link-btn" data-action="remove">Remover</button>
        </div>
      `;
      line.querySelector('[data-action="dec"]').onclick = () => updateQty(entry.nome, -1);
      line.querySelector('[data-action="inc"]').onclick = () => updateQty(entry.nome, 1);
      line.querySelector('[data-action="remove"]').onclick = () => removeItem(entry.nome);
      cartList.appendChild(line);
    });
  }

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalValue = cart.reduce((sum, item) => sum + item.preco * item.qty, 0);
  cartStatus.textContent = `${totalItems} ${totalItems === 1 ? "item" : "itens"}`;
  cartTotal.textContent = formatPrice(totalValue);
  cartToggle.textContent = `Ver Carrinho (${totalItems})`;
  if (cartFloating.classList.contains("open")) {
    cartToggle.classList.remove("visible");
  }
  if (cart.length) {
    cartFinalize.classList.add("visible");
  } else {
    cartFinalize.classList.remove("visible");
  }
  saveCart();
  
  // Só mostrar mensagem se explicitamente solicitado (ao adicionar item)
  if (mostrarMensagem && cart.length > 0) {
    showToast(`${cart[cart.length - 1]?.nome || "Item"} adicionado ao carrinho`);
  }
}

clearCartBtn.addEventListener("click", clearCart);
checkoutBtn.addEventListener("click", () => openCheckoutModal());
cartToggle.addEventListener("click", () => {
  cartFloating.classList.toggle("open");
  if (cartFloating.classList.contains("open")) {
    cartToggle.classList.remove("visible");
    cartFinalize.classList.remove("visible");
  } else if (cart.length) {
    cartToggle.classList.add("visible");
    cartFinalize.classList.add("visible");
  }
});
closeCartBtn.addEventListener("click", () => {
  cartFloating.classList.remove("open");
  if (cart.length) cartToggle.classList.add("visible");
  if (cart.length) cartFinalize.classList.add("visible");
});
cartFinalize.addEventListener("click", () => {
  if (!cart.length) return;
  openCheckoutModal();
});
modalClose.addEventListener("click", closeCheckoutModal);
modalConfirm.addEventListener("click", () => {
  const mesa = tableInput.value.trim();
  
  if (!mesa) {
    showToast("Por favor, informe o número da mesa");
    tableInput.focus();
    tableInput.style.borderColor = "var(--danger)";
    
    // Remover o destaque após um tempo
    setTimeout(() => {
      tableInput.style.borderColor = "";
    }, 3000);
    return;
  }
  
  showToast("Pedido confirmado");
  closeCheckoutModal();
  goToPayment();
});
document.addEventListener("keydown", (ev) => {
  // Atalho: seta para a esquerda retorna à lista de categorias quando estiver em itens
  if (ev.key === "ArrowLeft" && itemsScreen.classList.contains("active")) {
    ev.preventDefault();
    backToCategories();
  }
});
backBtn.addEventListener("click", backToCategories);
renderCategories();
loadCart();
renderCart();

function openCheckoutModal() {
  if (!cart.length) return;
  modalItems.innerHTML = "";
  cart.forEach(entry => {
    const block = document.createElement("div");
    block.className = "modal-item";
    block.innerHTML = `
      <div class="modal-row">
        <div>
          <div class="item-title">${entry.nome}</div>
          <div class="cart-sub">${entry.categoria} · ${entry.qty}x</div>
        </div>
        <div class="item-price">${formatPrice(entry.preco * entry.qty)}</div>
      </div>
      <textarea class="modal-note" placeholder="Observação (opcional)">${entry.obs || ""}</textarea>
    `;
    const textarea = block.querySelector(".modal-note");
    textarea.addEventListener("input", () => {
      entry.obs = textarea.value;
      saveCart();
    });
    modalItems.appendChild(block);
  });
  const totalValue = cart.reduce((sum, item) => sum + item.preco * item.qty, 0);
  modalTotal.textContent = formatPrice(totalValue);
  
  // Limpar campo de mesa e resetar estilo
  tableInput.value = "";
  tableInput.style.borderColor = "";
  
  checkoutModal.classList.add("open");
  
  // Focar no campo de mesa após abrir o modal
  setTimeout(() => tableInput.focus(), 100);
}

function closeCheckoutModal() {
  checkoutModal.classList.remove("open");
}

function goToPayment() {
  const totalValue = cart.reduce((sum, item) => sum + item.preco * item.qty, 0);
  paymentInfo.textContent = `Total: ${formatPrice(totalValue)} (${cart.reduce((s,i)=>s+i.qty,0)} itens)`;
  cardNumber.value = "";
  cardHolder.value = "";
  cardBalance.value = "";
  cardBalance.style.color = "";
  cardTime.value = "";
  cartaoAtual = null;
  ocultarStatusCartao();
  breadcrumb.textContent = "Pagamento";
  title.textContent = "Pagamento";
  backBtn.style.display = "none";
  cartFabs.style.display = "none";
  switchScreen("payment");
  
  // Focar no campo de número do cartão
  setTimeout(() => cardNumber.focus(), 100);
}

// Verificar se há cartões no sistema
function verificarCartoesDisponiveis() {
  const cartoesRaw = localStorage.getItem(CARTOES_KEY);
  if (!cartoesRaw) {
    return { existe: false, total: 0, mensagem: 'Nenhum cartão cadastrado. Crie cartões na página de administração.' };
  }
  
  try {
    const cartoes = JSON.parse(cartoesRaw);
    const total = Array.isArray(cartoes) ? cartoes.length : 0;
    return { existe: total > 0, total, mensagem: total > 0 ? `${total} cartão(ões) cadastrado(s)` : 'Nenhum cartão cadastrado' };
  } catch (e) {
    return { existe: false, total: 0, mensagem: 'Erro ao ler cartões do sistema' };
  }
}

// Buscar cartão por número
function buscarCartao(numero) {
  try {
    const cartoesRaw = localStorage.getItem(CARTOES_KEY);
    if (!cartoesRaw) {
      const info = verificarCartoesDisponiveis();
      console.warn('⚠️', info.mensagem);
      return null;
    }
    
    const cartoes = JSON.parse(cartoesRaw);
    if (!Array.isArray(cartoes) || cartoes.length === 0) {
      console.warn('Lista de cartões vazia ou inválida');
      return null;
    }
    
    const numeroLimpo = String(numero).replace(/\s/g, '').trim();
    
    // Debug temporário
    console.log('🔍 Buscando cartão:', numeroLimpo);
    console.log('📋 Total de cartões:', cartoes.length);
    console.log('📋 Números dos cartões:', cartoes.map(c => `"${c.numero}"`));
    
    // Buscar exato primeiro (comparação direta)
    let cartao = cartoes.find(c => {
      const numCartao = String(c.numero || '').replace(/\s/g, '').trim();
      const match = numCartao === numeroLimpo;
      if (match) console.log('✅ Encontrado por busca exata:', numCartao);
      return match;
    });
    
    // Se não encontrar, tentar busca parcial (últimos dígitos)
    if (!cartao && numeroLimpo.length >= 4) {
      const ultimosDigitos = numeroLimpo.slice(-4);
      console.log('🔍 Tentando busca parcial com últimos 4 dígitos:', ultimosDigitos);
      cartao = cartoes.find(c => {
        const numCartao = String(c.numero || '').replace(/\s/g, '').trim();
        const match = numCartao.endsWith(ultimosDigitos);
        if (match) console.log('✅ Encontrado por busca parcial:', numCartao);
        return match;
      });
    }
    
    if (!cartao) {
      console.log('❌ Cartão não encontrado');
    }
    
    return cartao;
  } catch (error) {
    console.error('Erro ao buscar cartão:', error);
    return null;
  }
}

// Validar e carregar dados do cartão
function validarECarregarCartao() {
  const numero = cardNumber.value.trim().replace(/\s/g, '');
  
  if (!numero || numero.length < 8) {
    limparDadosCartao();
    ocultarStatusCartao();
    return false;
  }
  
  const cartao = buscarCartao(numero);
  
  if (!cartao) {
    const info = verificarCartoesDisponiveis();
    cardHolder.value = "Cartão não encontrado";
    cardBalance.value = "";
    cardTime.value = new Date().toLocaleTimeString('pt-BR');
    cartaoAtual = null;
    
    if (!info.existe) {
      mostrarStatusCartao("⚠️ Nenhum cartão cadastrado. Acesse a página de administração para criar cartões.", "danger");
    } else {
      mostrarStatusCartao(`Cartão não encontrado. ${info.total} cartão(ões) cadastrado(s) no sistema.`, "danger");
    }
    return false;
  }
  
  if (!cartao.ativo) {
    cardHolder.value = cartao.nome;
    cardBalance.value = "Cartão DESATIVADO";
    cardBalance.style.color = "var(--danger)";
    cardTime.value = new Date().toLocaleTimeString('pt-BR');
    cartaoAtual = null;
    mostrarStatusCartao("Este cartão está desativado", "danger");
    return false;
  }
  
  // Cartão válido
  cartaoAtual = cartao;
  cardHolder.value = cartao.nome;
  cardBalance.value = formatPrice(cartao.saldo);
  cardBalance.style.color = cartao.saldo > 0 ? "var(--accent)" : "var(--danger)";
  cardTime.value = new Date().toLocaleTimeString('pt-BR');
  
  // Verificar saldo suficiente
  const totalValue = cart.reduce((sum, item) => sum + item.preco * item.qty, 0);
  if (cartao.saldo < totalValue) {
    const falta = totalValue - cartao.saldo;
    mostrarStatusCartao(`Saldo insuficiente. Faltam ${formatPrice(falta)}`, "danger");
    return false;
  }
  
  // Saldo suficiente
  const saldoRestante = cartao.saldo - totalValue;
  mostrarStatusCartao(`Saldo suficiente. Após o pagamento: ${formatPrice(saldoRestante)}`, "success");
  return true;
}

function mostrarStatusCartao(mensagem, tipo) {
  cardStatus.style.display = "block";
  cardStatusText.textContent = mensagem;
  cardStatus.style.borderColor = tipo === "success" ? "var(--accent)" : "var(--danger)";
  cardStatusText.style.color = tipo === "success" ? "var(--accent)" : "var(--danger)";
}

function ocultarStatusCartao() {
  cardStatus.style.display = "none";
}

function limparDadosCartao() {
  cardHolder.value = "";
  cardBalance.value = "";
  cardBalance.style.color = "";
  cardTime.value = "";
  cartaoAtual = null;
  ocultarStatusCartao();
}

// Processar pagamento com cartão
function processarPagamentoComCartao() {
  if (!cartaoAtual) {
    showToast("Cartão não encontrado ou inválido");
    return false;
  }
  
  const totalValue = cart.reduce((sum, item) => sum + item.preco * item.qty, 0);
  
  if (cartaoAtual.saldo < totalValue) {
    showToast(`Saldo insuficiente. Saldo atual: ${formatPrice(cartaoAtual.saldo)}`);
    return false;
  }
  
  // Debitar do saldo
  const cartoes = JSON.parse(localStorage.getItem(CARTOES_KEY) || '[]');
  const cartaoIndex = cartoes.findIndex(c => c.id === cartaoAtual.id);
  
  if (cartaoIndex >= 0) {
    cartoes[cartaoIndex].saldo -= totalValue;
    cartoes[cartaoIndex].saldo = Math.round(cartoes[cartaoIndex].saldo * 100) / 100; // Arredondar para 2 casas
    localStorage.setItem(CARTOES_KEY, JSON.stringify(cartoes));
    
    // Atualizar cartão atual
    cartaoAtual.saldo = cartoes[cartaoIndex].saldo;
  }
  
  return true;
}

paymentBack.addEventListener("click", () => {
  switchScreen("items");
  breadcrumb.textContent = "Itens";
  title.textContent = "Itens";
  cartFabs.style.display = "flex";
});

// Event listener para buscar cartão ao digitar
cardNumber.addEventListener("input", (e) => {
  const numero = e.target.value.trim();
  
  // Limpar dados se campo estiver vazio
  if (!numero || numero.length < 4) {
    limparDadosCartao();
    return;
  }
  
  // Buscar cartão quando tiver pelo menos 4 caracteres (pode ser apenas os últimos dígitos)
  if (numero.length >= 4) {
    // Aguardar um pouco para não buscar a cada tecla
    clearTimeout(window.buscaCartaoTimer);
    window.buscaCartaoTimer = setTimeout(() => {
      validarECarregarCartao();
    }, 300);
  }
});

// Event listener para buscar ao perder foco
cardNumber.addEventListener("blur", () => {
  if (cardNumber.value.trim().length >= 4) {
    validarECarregarCartao();
  }
});

paymentConfirm.addEventListener("click", () => {
  const totalValue = cart.reduce((sum, item) => sum + item.preco * item.qty, 0);
  
  // Validar cartão antes de processar
  if (!validarECarregarCartao()) {
    if (!cartaoAtual) {
      showToast("Digite um número de cartão válido");
    }
    return;
  }
  
  // Processar pagamento
  if (processarPagamentoComCartao()) {
    showToast("Pagamento confirmado");
    
    // Limpar carrinho
    cart.length = 0;
    saveCart();
    renderCart(false); // Não mostrar mensagem ao limpar após pagamento
    
    // Voltar para categorias
    setTimeout(() => {
      backToCategories();
      cartFabs.style.display = "flex";
    }, 1000);
  }
});

