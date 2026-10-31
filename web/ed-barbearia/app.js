/*
  ED Barbearia — interações da landing page.
  Para trocar o link de agendamento, o WhatsApp, os cortes ou o texto das mensagens, edite só o CONFIG abaixo.
*/
(() => {
  'use strict';

  const CONFIG = {
    agendamento: 'https://www.useaparo.com.br/barbearia/ed-barbearia-908b3c',
    whatsapp: '5581999421727',
    assinatura: '(Vim pelo site)',
    endereco: 'ED Barbearia, Rua Paula Batista, 604, Casa Amarela, Recife - PE, 52070-070',
    horario: { abre: 9, fecha: 19, dias: [1, 2, 3, 4, 5, 6] }, // 0 = domingo
    precos: { cabelo: 50, barba: 40, combo: 80 },
    mensagens: {
      geral: 'Olá! Quero agendar um horário na ED Barbearia.',
      curso: 'Olá! Quero entrar na lista de interesse da primeira turma do Curso de Barbeiro do Instituto Beleza Academy.',
      vaga: 'Olá! Sou barbeiro e vi que vocês estão contratando. Posso mandar meu portfólio?',
    },
    cortes: {
      textured: {
        nome: 'Textured crop', img: 'assets/corte-textured.webp', alt: 'Textured crop com degradê',
        desc: 'Topo com textura e franja curta, laterais em degradê. Prático no dia a dia e com cara de recém-cortado por mais tempo.',
        preco: 'Cabelo, R$ 50',
      },
      barba: {
        nome: 'Degradê com barba', img: 'assets/corte-barba.webp', alt: 'Degradê alto com barba cheia desenhada',
        desc: 'Laterais bem baixas subindo para o topo e barba cheia desenhada na navalha. O combo que mais fica bem na foto.',
        preco: 'Cabelo + barba, R$ 80',
      },
      crop: {
        nome: 'Crop com fade', img: 'assets/corte-crop.webp', alt: 'Crop curto com fade',
        desc: 'Curto em cima, fade marcado dos lados e contorno na régua. Pouca manutenção e acabamento limpo.',
        preco: 'Cabelo, R$ 50',
      },
    },
  };

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const limitar = (v, a, b) => Math.min(b, Math.max(a, v));

  const linkZap = (texto) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(`${texto} ${CONFIG.assinatura}`)}`;
  const registra = (evento, dados) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: evento, ...dados });
  };
  const externo = (a) => { a.target = '_blank'; a.rel = 'noopener'; };

  // ---------- Links ----------
  $$('[data-agendar]').forEach((a) => {
    a.href = CONFIG.agendamento; externo(a);
    a.addEventListener('click', () => registra('agendar_clique', { origem: a.dataset.origem || '' }));
  });
  $$('[data-zap]').forEach((a) => {
    a.href = linkZap(CONFIG.mensagens[a.dataset.zap] || CONFIG.mensagens.geral); externo(a);
    a.addEventListener('click', () => registra('whatsapp_clique', { assunto: a.dataset.zap, origem: a.dataset.origem || '' }));
  });
  $$('[data-rota]').forEach((a) => {
    a.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(CONFIG.endereco)}`; externo(a);
    a.addEventListener('click', () => registra('rota_clique', {}));
  });

  // ---------- Aberto agora? (horário de Recife) ----------
  const status = $('[data-status]');
  if (status) {
    const agora = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Recife' }));
    const h = agora.getHours() + agora.getMinutes() / 60;
    const { abre, fecha, dias } = CONFIG.horario;
    if (dias.includes(agora.getDay()) && h >= abre && h < fecha) {
      status.textContent = `Aberto agora, até as ${fecha}h. Casa Amarela, Recife`;
      status.parentElement.classList.add('aberto');
    }
  }

  // ---------- Topo: a tesoura corta o título ----------
  const corte = $('[data-corte]');
  const tesouraTopo = $('.tesoura-voo');
  if (corte) {
    const iniciar = () => requestAnimationFrame(() => {
      corte.classList.add('cortando');
      setTimeout(() => { corte.classList.remove('cortando'); corte.classList.add('repouso'); }, reduz ? 50 : 2700);
    });
    Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 1500))]).then(iniciar);

    // Em repouso, a tesoura acompanha o mouse de leve.
    if (!reduz && matchMedia('(pointer: fine)').matches) {
      addEventListener('pointermove', (e) => {
        if (!corte.classList.contains('repouso')) return;
        const r = tesouraTopo.getBoundingClientRect();
        const ang = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI;
        corte.style.setProperty('--giro', `${limitar(ang - 180, -25, 25) * (ang > 0 ? -1 : 1) * 0.4}deg`);
      }, { passive: true });
    }
  }

  // ---------- Vídeos: tocar/pausar e só rodar quando visíveis ----------
  $$('[data-video]').forEach((fig) => {
    const v = $('video', fig);
    const b = $('[data-play]', fig);
    const icone = (tocando) => {
      $('use', b).setAttribute('href', tocando ? '#i-pause' : '#i-play');
      b.setAttribute('aria-label', tocando ? 'Pausar vídeo' : 'Tocar vídeo');
      fig.classList.toggle('tocando', tocando);
    };
    let pausadoPeloUsuario = fig.classList.contains('detalhe-video');
    if (reduz) { v.removeAttribute('autoplay'); v.pause(); pausadoPeloUsuario = true; }
    icone(!v.paused);
    v.addEventListener('play', () => icone(true));
    v.addEventListener('pause', () => icone(false));
    b.addEventListener('click', () => {
      if (v.paused) { pausadoPeloUsuario = false; v.play(); } else { pausadoPeloUsuario = true; v.pause(); }
    });
    new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) v.pause();
      else if (!pausadoPeloUsuario) v.play().catch(() => {});
    }, { threshold: 0.25 }).observe(fig);
  });

  // ---------- Faixa: a tesoura corta conforme a rolagem ----------
  const faixa = $('[data-faixa]');
  if (faixa && !reduz) {
    let pedido = 0;
    const atualiza = () => {
      pedido = 0;
      const r = faixa.getBoundingClientRect();
      const total = r.height - innerHeight;
      const p = limitar(-r.top / total, 0, 1);
      faixa.style.setProperty('--p', p.toFixed(4));
      faixa.style.setProperty('--tique', `${(Math.sin(p * Math.PI * 22) * 5).toFixed(2)}deg`);
    };
    const agenda = () => { if (!pedido) pedido = requestAnimationFrame(atualiza); };
    addEventListener('scroll', agenda, { passive: true });
    addEventListener('resize', agenda);
    atualiza();
  }

  // ---------- Vitrine de cortes ----------
  const abas = $$('[data-corte-op]');
  const img = $('[data-corte-img]');
  const zapCorte = $('[data-zap-corte]');
  const mostraCorte = (chave) => {
    const c = CONFIG.cortes[chave];
    abas.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.corteOp === chave)));
    img.classList.add('trocando');
    setTimeout(() => {
      img.src = c.img; img.alt = c.alt;
      img.onload = () => img.classList.remove('trocando');
      if (img.complete) img.classList.remove('trocando');
    }, reduz ? 0 : 220);
    $('[data-corte-nome]').textContent = c.nome;
    $('[data-corte-desc]').textContent = c.desc;
    $('[data-corte-preco]').textContent = c.preco;
    zapCorte.href = linkZap(`Olá! Quero fazer um ${c.nome.toLowerCase()}. Vou mandar a foto de referência.`);
    externo(zapCorte);
  };
  abas.forEach((b, i) => {
    b.addEventListener('click', () => { mostraCorte(b.dataset.corteOp); registra('corte_escolhido', { corte: b.dataset.corteOp }); });
    b.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      const prox = abas[(i + d + abas.length) % abas.length];
      prox.focus(); prox.click();
    });
  });
  if (abas.length) mostraCorte('textured');
  zapCorte && zapCorte.addEventListener('click', () => registra('whatsapp_clique', { assunto: 'corte', origem: 'vitrine' }));
  // Pré-carrega as outras fotos para a troca ser instantânea.
  setTimeout(() => Object.values(CONFIG.cortes).forEach((c) => { new Image().src = c.img; }), 2500);

  // ---------- Montador de preço ----------
  const caixas = $$('.opcao input');
  const totalEl = $('[data-total]');
  const atualizaTotal = () => {
    const cabelo = $('.opcao input[value="cabelo"]').checked;
    const barba = $('.opcao input[value="barba"]').checked;
    const { precos } = CONFIG;
    let valor = 0, rotulo = 'Escolha um serviço', extra = 'Marque cabelo, barba ou os dois.', cta = 'Agendar meu horário';
    if (cabelo && barba) { valor = precos.combo; rotulo = 'Cabelo + barba'; extra = `Combo: você economiza <strong>R$ ${precos.cabelo + precos.barba - precos.combo}</strong>.`; cta = 'Agendar cabelo + barba'; }
    else if (cabelo) { valor = precos.cabelo; rotulo = 'Cabelo'; extra = `Junte a barba e pague R$ ${precos.combo} no combo.`; cta = 'Agendar cabelo'; }
    else if (barba) { valor = precos.barba; rotulo = 'Barba'; extra = `Junte o cabelo e pague R$ ${precos.combo} no combo.`; cta = 'Agendar barba'; }
    if (totalEl.textContent !== String(valor)) {
      totalEl.textContent = valor;
      totalEl.classList.remove('pula'); void totalEl.offsetWidth; totalEl.classList.add('pula');
    }
    $('[data-total-rotulo]').textContent = rotulo;
    $('[data-total-extra]').innerHTML = extra;
    $('[data-total-cta]').textContent = cta;
  };
  caixas.forEach((c) => c.addEventListener('change', atualizaTotal));
  if (caixas.length) atualizaTotal();

  // ---------- Cupom: a tesoura recorta ----------
  const cupom = $('[data-cupom]');
  if (cupom) {
    $('[data-recortar]', cupom).addEventListener('click', () => {
      registra('cupom_recortado', {});
      cupom.classList.add('recortando');
      setTimeout(() => {
        cupom.classList.remove('recortando');
        cupom.classList.add('recortado');
        const depois = $('.cupom-depois', cupom);
        depois.hidden = false;
        $('a', depois).focus({ preventScroll: true });
      }, reduz ? 50 : 1250);
    });
  }

  // ---------- Revelação discreta ao rolar ----------
  const revelar = $$('.vitrine, .montador, .cupom, .detalhe-texto, .fundador-texto, .curso-texto, .onde-texto');
  if ('IntersectionObserver' in window && !reduz) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    revelar.forEach((el) => { el.classList.add('revela'); io.observe(el); });
  }
})();
