/*
  ED Barbearia — interações da landing page.
  Para trocar o link de agendamento, o WhatsApp ou o texto das mensagens, edite só o CONFIG abaixo.
*/
(() => {
  'use strict';

  const CONFIG = {
    agendamento: 'https://www.useaparo.com.br/barbearia/ed-barbearia-908b3c',
    whatsapp: '5581999421727',
    assinatura: '(Vim pelo site)',
    endereco: 'ED Barbearia, Rua Paula Batista, 604, Casa Amarela, Recife - PE, 52070-070',
    mensagens: {
      geral: 'Olá! Quero agendar um horário na ED Barbearia.',
      curso: 'Olá! Quero entrar na lista de interesse da primeira turma do Curso de Barbeiro do Instituto Beleza Academy.',
      vaga: 'Olá! Sou barbeiro e vi que vocês estão contratando. Posso mandar meu portfólio?',
    },
  };

  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduz = matchMedia('(prefers-reduced-motion: reduce)');

  const linkZap = (chave) =>
    `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(`${CONFIG.mensagens[chave] || CONFIG.mensagens.geral} ${CONFIG.assinatura}`)}`;

  // Eventos para Google Tag Manager / Meta Pixel, se forem instalados.
  const registra = (evento, dados) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: evento, ...dados });
  };

  // ---------- Links ----------
  $$('[data-agendar]').forEach((a) => {
    a.href = CONFIG.agendamento;
    a.target = '_blank';
    a.rel = 'noopener';
    a.addEventListener('click', () => registra('agendar_clique', { origem: a.dataset.origem || '' }));
  });

  $$('[data-zap]').forEach((a) => {
    a.href = linkZap(a.dataset.zap);
    a.target = '_blank';
    a.rel = 'noopener';
    a.addEventListener('click', () => registra('whatsapp_clique', { assunto: a.dataset.zap, origem: a.dataset.origem || '' }));
  });

  $$('[data-rota]').forEach((a) => {
    a.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(CONFIG.endereco)}`;
    a.target = '_blank';
    a.rel = 'noopener';
    a.addEventListener('click', () => registra('rota_clique', {}));
  });

  // ---------- Tesouras ----------
  // Copia o desenho do <symbol> para dentro de cada tesoura animada,
  // para que as duas lâminas possam girar separadas.
  const simbolo = document.getElementById('i-tesoura');
  $$('svg.tesoura').forEach((svg) => {
    svg.setAttribute('viewBox', simbolo.getAttribute('viewBox'));
    svg.innerHTML = simbolo.innerHTML;
  });

  // Topo: dispara o corte depois que a fonte do título carregou.
  const hero = document.querySelector('.corte-titulo');
  const cortar = () => requestAnimationFrame(() => hero.classList.add('corte-pronto'));
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]).then(cortar);
  } else {
    cortar();
  }

  // Linhas de recorte: a tesoura anda e abre/fecha conforme a página rola.
  const recortes = $$('[data-recorte]');
  if (recortes.length && !reduz.matches) {
    let pedido = 0;
    const atualiza = () => {
      pedido = 0;
      const alto = innerHeight;
      recortes.forEach((r) => {
        const caixa = r.getBoundingClientRect();
        if (caixa.bottom < -50 || caixa.top > alto + 50) return;
        // 0 quando a linha entra pela base da tela, 1 quando chega a 20% do topo.
        const p = Math.min(1, Math.max(0, (alto - caixa.top) / (alto * 0.8)));
        r.style.setProperty('--p', p.toFixed(4));
        r.style.setProperty('--abre', Math.abs(Math.sin(p * Math.PI * 7)).toFixed(3));
      });
    };
    const agenda = () => { if (!pedido) pedido = requestAnimationFrame(atualiza); };
    addEventListener('scroll', agenda, { passive: true });
    addEventListener('resize', agenda);
    atualiza();
  }
})();
