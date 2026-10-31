/* =========================================================
   CONFIG: tudo que a Smile muda no dia a dia fica aqui.
   preco: número (ex.: 32.90) ou null para "consulte no WhatsApp".
   ========================================================= */
const CONFIG = {
  // WhatsApp com DDD, só números (ex.: '81999998888').
  // Enquanto estiver vazio, os botões abrem o Direct do Instagram.
  whatsapp: '',
  instagram: 'thesmileburguer',
  promo: 'Quero aproveitar a promoção pediu, ganhou (batata média grátis)! 🍟',
  assinatura: '(Vim pelo site)',

  destaques: [
    { id: 'smash-duplo', nome: 'Smash Duplo', tag: 'Mais pedido', img: 'assets/smash-duplo.webp',
      desc: 'Dois discos de 100 g, queijo, cebola e molho da casa.', preco: 32.90 },
    { id: 'melt', nome: 'Burger Melt', img: 'assets/melt.webp',
      desc: 'Burger de 100 g, cheddar e cebola caramelizada no pão australiano.', preco: 32.90 },
    { id: 'gorgonzola', nome: 'Gorgonzola Supremo', tag: 'Premium', img: 'assets/gorgonzola.webp',
      desc: 'Carne suculenta, creme de gorgonzola e cebola crispy no pão australiano.', preco: null },
  ],

  lista: [
    { nome: 'Bacon Grill', desc: 'Bacon, carne suculenta e queijo.', preco: null },
    { nome: 'Burguer Supreme', desc: 'Pão brioche, carne e cheddar.', preco: 24.90 },
    { nome: 'Smash Burguer', desc: 'O clássico smash da casa.', preco: 34.90 },
    { nome: 'Batata média (adicional)', desc: 'Crocante, na caixinha da Smile.', preco: 8.90 },
  ],

  combos: [
    { nome: 'Combo Família', itens: ['3 burgers à escolha', '2 batatas grandes', '1 bebida sabor cola 1 L'], preco: 89.90 },
    { nome: 'Combo Casal Bacon Love', itens: ['2 hambúrgueres', '1 batata frita', '1 L de Guaraná'], preco: null },
  ],
};

/* ---------- utilidades ---------- */
const brl = v => v.toFixed(2).replace('.', ',');
const priceHTML = p => p == null
  ? '<span class="price--ask">Consulte</span>'
  : `<span class="price"><small>R$</small>${brl(p)}</span>`;

function linkPedido(texto) {
  const msg = `${texto}\n\n${CONFIG.assinatura}`;
  if (CONFIG.whatsapp) {
    return `https://wa.me/55${CONFIG.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
  }
  return `https://ig.me/m/${CONFIG.instagram}`;
}

function track(origem) {
  (window.dataLayer = window.dataLayer || []).push({ event: 'pedido_clique', origem });
  if (typeof window.fbq === 'function') window.fbq('track', 'Contact', { content_name: origem });
}

/* ---------- monta cardápio ---------- */
const btnPedir = (texto, origem, label = 'Pedir') =>
  `<a class="btn btn--sm" href="${linkPedido(texto)}" target="_blank" rel="noopener" data-origem="${origem}">${label}</a>`;

document.getElementById('menu-destaques').innerHTML = CONFIG.destaques.map(b => `
  <article class="card">
    ${b.tag ? `<span class="card__tag">${b.tag}</span>` : ''}
    <div class="card__img"><img src="${b.img}" alt="${b.nome} da Smile Burguer" loading="lazy"></div>
    <div class="card__body">
      <h3 class="card__name">${b.nome}</h3>
      <p class="card__desc">${b.desc}</p>
      <div class="card__row">${priceHTML(b.preco)}${btnPedir(`Oi! Quero pedir um ${b.nome}. ${CONFIG.promo}`, b.id)}</div>
    </div>
  </article>`).join('');

document.getElementById('menu-lista').innerHTML = CONFIG.lista.map(i => `
  <li>
    <div><span class="n">${i.nome}</span><span class="d">${i.desc}</span></div>
    <span class="dots"></span>
    ${i.preco == null ? '' : `<span class="p">R$ ${brl(i.preco)}</span>`}
    <a href="${linkPedido(`Oi! Quero pedir: ${i.nome}.`)}" target="_blank" rel="noopener" data-origem="lista-${i.nome}">Pedir</a>
  </li>`).join('');

document.getElementById('combos-lista').innerHTML = CONFIG.combos.map(c => `
  <article class="combo">
    <h3>${c.nome}</h3>
    <ul>${c.itens.map(x => `<li>${x}</li>`).join('')}</ul>
    <div class="card__row">${priceHTML(c.preco)}${btnPedir(`Oi! Quero o ${c.nome}. ${CONFIG.promo}`, c.nome, 'Pedir combo')}</div>
  </article>`).join('');

/* ---------- botões gerais ---------- */
const textos = {
  promo: `Oi! ${CONFIG.promo}`,
  geral: 'Oi! Quero fazer um pedido.',
};
document.querySelectorAll('.js-pedir').forEach(a => {
  a.href = linkPedido(textos[a.dataset.msg] || textos.geral);
  a.target = '_blank';
  a.rel = 'noopener';
  a.dataset.origem = a.dataset.origem || `botao-${a.dataset.msg}`;
  if (!CONFIG.whatsapp) {
    const lbl = a.querySelector('.js-pedir-label');
    if (lbl && a.classList.contains('dock')) lbl.textContent = 'Pedir pelo Instagram';
  }
});
document.addEventListener('click', e => {
  const a = e.target.closest('a[data-origem]');
  if (a) track(a.dataset.origem);
});

/* ---------- botão fixo aparece depois do topo ---------- */
const dock = document.querySelector('.dock');
const hero = document.querySelector('.hero__ctas');
if (dock && hero && 'IntersectionObserver' in window) {
  new IntersectionObserver(([e]) => dock.classList.toggle('is-on', !e.isIntersecting)).observe(hero);
}
