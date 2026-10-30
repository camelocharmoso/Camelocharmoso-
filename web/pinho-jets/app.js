/*
  Pinho Jets — interações da landing page.
  Para trocar número, preços ou o texto das mensagens, edite só o CONFIG abaixo.
*/
(() => {
  'use strict';

  const CONFIG = {
    whatsapp: '5581979109536',
    assinatura: '(Vim pelo site)',
    tempos: {
      20: { rotulo: '20 minutos', curto: '20 min', preco: 200 },
      30: { rotulo: '30 minutos', curto: '30 min', preco: 300 },
      60: { rotulo: '1 hora', curto: '1 hora', preco: 600 },
    },
    servicos: {
      jet: { pedido: 'Quero alugar o jet ski', pergunta: 'Quais horários vocês têm?' },
      lancha: { pedido: 'Quero alugar a lancha para um passeio', pergunta: 'Pode me passar os valores?' },
      sofa: { pedido: 'Quero andar no sofá maluco', pergunta: 'Pode me passar os valores?' },
      drone: { pedido: 'Quero contratar a filmagem com drone', pergunta: 'Pode me passar os valores?' },
      oficina: { pedido: 'Preciso da oficina de jet ski', pergunta: 'Pode me passar um orçamento?' },
      geral: { pedido: 'Quero saber mais sobre os passeios', pergunta: '' },
    },
  };

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduz = matchMedia('(prefers-reduced-motion: reduce)');
  const espera = (ms) => new Promise((r) => setTimeout(r, ms));
  const limitar = (v, a, b) => Math.min(b, Math.max(a, v));
  const real = (n) => 'R$\u00a0' + n.toLocaleString('pt-BR');

  const linkZap = (texto) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;

  function pedidoCom(servico, tempo) {
    const s = CONFIG.servicos[servico] || CONFIG.servicos.geral;
    if (servico !== 'jet' || !tempo) return s.pedido;
    const t = CONFIG.tempos[tempo];
    return `${s.pedido} por ${t.rotulo} (${real(t.preco)})`;
  }

  function mensagemRapida(servico, tempo) {
    const s = CONFIG.servicos[servico] || CONFIG.servicos.geral;
    const pergunta = s.pergunta ? ' ' + s.pergunta : '';
    return `Olá, Pinho Jets! ${pedidoCom(servico, tempo)}.${pergunta}\n${CONFIG.assinatura}`;
  }

  // Gancho para Meta Pixel / Google Tag Manager, se forem instalados.
  function rastrear(evento, dados) {
    (window.dataLayer = window.dataLayer || []).push({ event: evento, ...dados });
  }

  /* ---------- Atalhos de WhatsApp (cada botão leva a sua mensagem) ---------- */
  $$('[data-zap]').forEach((a) => {
    a.href = linkZap(mensagemRapida(a.dataset.zap));
    a.addEventListener('click', () => rastrear('whatsapp_clique', { servico: a.dataset.zap, origem: 'atalho' }));
  });

  /* ---------- Preços: linha do tempo de 60 minutos ---------- */
  const crono = $('[data-crono]');
  if (crono) {
    const trilha = $('[data-trilha]', crono);
    const barra = $('[data-trilha-barra]', crono);
    const radios = $$('input[name="tempo-preco"]', crono);
    const visorTempo = $('[data-crono-tempo]', crono);
    const visorPreco = $('[data-crono-preco]', crono);
    const cta = $('[data-zap-tempo]', crono);
    const ctaRotulo = $('[data-zap-tempo-rotulo]', crono);
    const posicao = { 20: 1 / 3, 30: 0.5, 60: 1 };
    const vertical = matchMedia('(max-width: 640px)');
    let atual = 30;
    let quadro = 0;

    const relogio = (min) => `${String(min).padStart(2, '0')}:00`;

    function contar(de, para) {
      cancelAnimationFrame(quadro);
      if (reduz.matches || de === para) { visorTempo.textContent = relogio(para); return; }
      const t0 = performance.now();
      const passo = (t) => {
        const k = Math.min(1, (t - t0) / 420);
        const e = 1 - Math.pow(1 - k, 3);
        visorTempo.textContent = relogio(Math.round(de + (para - de) * e));
        if (k < 1) quadro = requestAnimationFrame(passo);
      };
      quadro = requestAnimationFrame(passo);
    }

    function aplicar(valor) {
      const v = Number(valor);
      const t = CONFIG.tempos[v];
      trilha.style.setProperty('--p', `${posicao[v] * 100}%`);
      contar(atual, v);
      atual = v;
      visorPreco.textContent = real(t.preco);
      ctaRotulo.textContent = `Reservar ${t.curto} no WhatsApp`;
      cta.href = linkZap(mensagemRapida('jet', v));
    }

    function escolherPeloPonteiro(e) {
      const r = barra.getBoundingClientRect();
      const f = vertical.matches ? (e.clientY - r.top) / r.height : (e.clientX - r.left) / r.width;
      let melhor = 30;
      let menor = Infinity;
      for (const [v, p] of Object.entries(posicao)) {
        const d = Math.abs(p - f);
        if (d < menor) { menor = d; melhor = v; }
      }
      const radio = radios.find((x) => x.value === String(melhor));
      if (!radio.checked) { radio.checked = true; aplicar(melhor); }
    }

    radios.forEach((r) => r.addEventListener('change', () => aplicar(r.value)));
    barra.addEventListener('pointerdown', (e) => { barra.setPointerCapture(e.pointerId); escolherPeloPonteiro(e); });
    barra.addEventListener('pointermove', (e) => { if (barra.hasPointerCapture(e.pointerId)) escolherPeloPonteiro(e); });
    cta.addEventListener('click', () => rastrear('whatsapp_clique', { servico: 'jet', tempo: atual, origem: 'precos' }));
    aplicar((radios.find((r) => r.checked) || radios[1]).value);
  }

  /* ---------- Monte seu passeio: a mensagem sai pronta ---------- */
  const form = $('[data-montador]');
  if (form) {
    const balao = $('[data-balao]');
    const texto = $('[data-balao-texto]');
    const hora = $('[data-balao-hora]');
    const enviar = $('[data-enviar]');
    const campoData = $('[data-campo-data]', form);
    const inputData = $('input[name="data"]', form);
    const saidaPessoas = $('[data-pessoas]', form);
    const obs = $('[data-obs]', form);
    const periodos = { manha: 'de manhã', tarde: 'à tarde', 'por-do-sol': 'no pôr do sol' };
    const formatoData = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
    let pessoas = 2;

    const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const curta = (d) => formatoData.format(d).replace('.', '');
    const marcado = (nome) => { const el = $(`input[name="${nome}"]:checked`, form); return el ? el.value : null; };
    inputData.min = iso(new Date());

    function descreverDia() {
      const dia = marcado('dia');
      const d = new Date();
      if (dia === 'hoje') return `hoje (${curta(d)})`;
      if (dia === 'amanha') { d.setDate(d.getDate() + 1); return `amanhã (${curta(d)})`; }
      if (inputData.value) {
        const [a, m, n] = inputData.value.split('-').map(Number);
        return curta(new Date(a, m - 1, n));
      }
      return 'a combinar';
    }

    function montar() {
      const servico = marcado('servico');
      const s = CONFIG.servicos[servico];
      $$('[data-so]', form).forEach((el) => { el.hidden = el.dataset.so !== servico; });
      $$('[data-sem]', form).forEach((el) => { el.hidden = el.dataset.sem.split(' ').includes(servico); });
      campoData.hidden = marcado('dia') !== 'outra';
      obs.placeholder = servico === 'oficina' ? 'Modelo do jet e o que está acontecendo' : 'Ex.: é aniversário de alguém';

      const linhas = [`Olá, Pinho Jets! ${pedidoCom(servico, marcado('tempo'))}.`];
      if (servico !== 'oficina') linhas.push(`Data: ${descreverDia()}, ${periodos[marcado('periodo')]}`);
      if (servico !== 'drone' && servico !== 'oficina') linhas.push(`Pessoas: ${pessoas}`);
      const nome = form.elements.nome.value.trim();
      if (nome) linhas.push(`Nome: ${nome}`);
      const nota = obs.value.trim();
      if (nota) linhas.push(`Obs.: ${nota}`);
      linhas.push(servico === 'jet' ? 'Tem horário disponível?' : s.pergunta);
      linhas.push(CONFIG.assinatura);

      const msg = linhas.join('\n');
      texto.textContent = msg;
      enviar.href = linkZap(msg);
      hora.textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    function pular() {
      if (reduz.matches) return;
      balao.classList.remove('pulou');
      void balao.offsetWidth;
      balao.classList.add('pulou');
    }

    form.addEventListener('input', montar);
    form.addEventListener('change', (e) => {
      montar();
      pular();
      if (e.target.name === 'dia' && e.target.value === 'outra') {
        try { inputData.showPicker(); } catch { inputData.focus(); }
      }
    });
    form.addEventListener('submit', (e) => e.preventDefault());
    $('[data-menos]', form).addEventListener('click', () => { pessoas = Math.max(1, pessoas - 1); saidaPessoas.value = pessoas; montar(); pular(); });
    $('[data-mais]', form).addEventListener('click', () => { pessoas = Math.min(20, pessoas + 1); saidaPessoas.value = pessoas; montar(); pular(); });
    enviar.addEventListener('click', () => rastrear('whatsapp_clique', { servico: marcado('servico'), origem: 'montador' }));
    montar();
  }

  /* ---------- Rolagem: um laço só para todos os efeitos ---------- */
  const efeitos = [];
  let agendado = false;
  function rodarEfeitos() {
    agendado = false;
    const vh = innerHeight;
    for (const f of efeitos) f(vh);
  }
  function agendar() {
    if (!agendado) { agendado = true; requestAnimationFrame(rodarEfeitos); }
  }
  addEventListener('scroll', agendar, { passive: true });
  addEventListener('resize', agendar);

  /* ---------- HERO: o jet rompe a tela ---------- */
  const hero = $('[data-hero]');
  if (hero) iniciarHero(hero);

  function iniciarHero(hero) {
    const palco = $('[data-palco]', hero);
    const tela = $('[data-tela]', hero);
    const video = $('[data-video]', hero);
    const flash = $('.tela-flash', tela);
    const rachado = $('[data-rachado]', hero);
    const cacos = $('[data-cacos]', hero);
    const rolagem = $('[data-jet-rolagem]', hero);
    const jet = $('[data-jet]', hero);
    const titulo = $('[data-titulo]', hero);
    const botaoPlay = $('[data-play]', hero);
    const progresso = $('[data-progresso]', hero);
    const tempo = $('[data-tempo]', hero);
    const spray = criarSpray($('[data-spray]', hero));
    let quebrou = false;
    let visivel = true;
    let pausouNaMao = false;
    let mouseX = 0;
    let mouseY = 0;

    /* controles do vídeo */
    const icone = $('use', botaoPlay);
    function sincronizarPlay() {
      const parado = video.paused;
      icone.setAttribute('href', parado ? '#i-play' : '#i-pause');
      botaoPlay.setAttribute('aria-label', parado ? 'Reproduzir vídeo' : 'Pausar vídeo');
    }
    botaoPlay.addEventListener('click', () => {
      if (video.paused) { pausouNaMao = false; video.play().catch(() => {}); } else { pausouNaMao = true; video.pause(); }
    });
    video.addEventListener('play', sincronizarPlay);
    video.addEventListener('pause', sincronizarPlay);
    if (reduz.matches) { video.removeAttribute('autoplay'); video.pause(); pausouNaMao = true; }
    sincronizarPlay();

    const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    (function tique() {
      if (visivel && video.duration) {
        progresso.style.transform = `scaleX(${video.currentTime / video.duration})`;
        tempo.textContent = mmss(video.currentTime);
      }
      requestAnimationFrame(tique);
    })();

    new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      spray.visibilidade(visivel);
      if (!visivel) video.pause();
      else if (!pausouNaMao) video.play().catch(() => {});
    }).observe(hero);

    /* geometria da tela e do jet, em px relativos à tela */
    function geo() {
      const w = tela.offsetWidth;
      const h = tela.offsetHeight;
      const ix = (parseFloat(getComputedStyle(palco).getPropertyValue('--impacto-x')) / 100) * w;
      return {
        w, h, ix,
        borda: parseFloat(getComputedStyle(tela).borderTopWidth) || 0,
        raio: parseFloat(getComputedStyle(tela).borderTopLeftRadius) || 0,
        jetW: rolagem.offsetWidth,
        fundo: Math.min(h * 0.2, 130),
      };
    }

    /* recorte irregular na borda de baixo, por onde o jet sai */
    function entalhe(g) {
      const R = semente(7);
      const largura = Math.min(g.jetW * 0.86, g.w - 2 * g.raio - 8);
      const xD = limitar(g.ix + largura / 2, g.raio + 8, g.w - g.raio - 2);
      const xE = limitar(g.ix - largura / 2, g.raio + 2, g.w - g.raio - 8);
      const pts = [[xD, g.h]];
      const n = 10;
      for (let i = 1; i < n; i++) {
        const t = i / n;
        const perfil = Math.pow(Math.sin(Math.PI * t), 0.55);
        pts.push([xD - (xD - xE) * t + (R() - 0.5) * 10, g.h - g.fundo * perfil * (0.55 + R() * 0.5)]);
      }
      pts.push([xE, g.h]);
      return pts;
    }

    function poligono(g, recorte) {
      const r = g.raio;
      const P = Math.PI;
      const arco = (cx, cy, a0, a1) => {
        const out = [];
        for (let i = 0; i <= 6; i++) {
          const a = a0 + ((a1 - a0) * i) / 6;
          out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
        }
        return out;
      };
      const pts = [
        ...arco(r, r, P, 1.5 * P),
        ...arco(g.w - r, r, 1.5 * P, 2 * P),
        ...arco(g.w - r, g.h - r, 0, 0.5 * P),
        ...recorte,
        ...arco(r, g.h - r, 0.5 * P, P),
      ];
      return `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(',')})`;
    }

    /* rachaduras: raios saindo do ponto de impacto, anéis ligando os raios */
    function desenharRachado(g, recorte, animar) {
      const R = semente(11);
      const ns = 'http://www.w3.org/2000/svg';
      const cx = g.ix;
      const cy = g.h - g.fundo * 0.5;
      const alcanceMax = Math.hypot(Math.max(cx, g.w - cx), cy);
      const caminhos = [];
      const raios = [];
      const n = 13;

      for (let i = 0; i < n; i++) {
        const base = P_(i, n) + (R() - 0.5) * 0.16;
        const alcance = alcanceMax * (0.2 + R() * 0.5);
        let r = g.fundo * (0.55 + R() * 0.3);
        let ang = base;
        const pts = [[cx + Math.cos(ang) * r, cy + Math.sin(ang) * r]];
        while (r < alcance) {
          r += 16 + R() * 42;
          ang += (R() - 0.5) * 0.26;
          const x = cx + Math.cos(ang) * r;
          const y = cy + Math.sin(ang) * r;
          pts.push([x, y]);
          if (x < 0 || x > g.w || y < 0) break;
        }
        raios.push(pts);
        caminhos.push({ d: linha(pts), tipo: 'risco', atraso: R() * 70 });
        if (pts.length > 4 && R() < 0.55) {
          const k = 2 + Math.floor(R() * (pts.length - 3));
          let [x, y] = pts[k];
          let a = Math.atan2(y - cy, x - cx) + (R() < 0.5 ? -1 : 1) * (0.5 + R() * 0.5);
          const galho = [[x, y]];
          for (let j = 0; j < 2 + R() * 3; j++) {
            a += (R() - 0.5) * 0.4;
            x += Math.cos(a) * (14 + R() * 30);
            y += Math.sin(a) * (14 + R() * 30);
            galho.push([x, y]);
          }
          caminhos.push({ d: linha(galho), tipo: 'risco', atraso: 90 + R() * 80 });
        }
      }

      [0.12, 0.24, 0.38].forEach((frac, anel) => {
        const raioAnel = alcanceMax * frac;
        for (let i = 0; i < raios.length - 1; i++) {
          if (R() < 0.35 + anel * 0.15) continue;
          const a = pontoNoRaio(raios[i], cx, cy, raioAnel);
          const b = pontoNoRaio(raios[i + 1], cx, cy, raioAnel);
          if (!a || !b) continue;
          const meio = [(a[0] + b[0]) / 2 + (R() - 0.5) * 12, (a[1] + b[1]) / 2 + (R() - 0.5) * 12];
          caminhos.push({ d: linha([a, meio, b]), tipo: 'anel', atraso: 120 + anel * 60 + R() * 60 });
        }
      });

      caminhos.push({ d: linha(recorte), tipo: 'borda-quebra', atraso: 0 });

      rachado.setAttribute('viewBox', `0 0 ${g.w} ${g.h}`);
      rachado.setAttribute('preserveAspectRatio', 'none');
      rachado.replaceChildren();
      for (const c of caminhos) {
        if (c.tipo === 'risco') rachado.appendChild(caminho(ns, c.d, 'sombra-risco', c.atraso));
        rachado.appendChild(caminho(ns, c.d, c.tipo, c.atraso));
      }
      rachado.classList.toggle('desenhar', animar);
      rachado.classList.toggle('pronto', !animar);
    }

    /* o quadro atual do vídeo, recortado como aparece na tela */
    function capturarQuadro(g) {
      const cw = g.w - 2 * g.borda;
      const ch = g.h - 2 * g.borda;
      const resultado = { url: video.poster, w: cw, h: ch };
      try {
        const fonte = video.readyState >= 2 ? video : null;
        if (!fonte) return resultado;
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        const k = Math.max(cw / vw, ch / vh);
        const sw = cw / k;
        const sh = ch / k;
        const escala = Math.min(1, 900 / cw);
        const c = document.createElement('canvas');
        c.width = Math.round(cw * escala);
        c.height = Math.round(ch * escala);
        c.getContext('2d').drawImage(video, (vw - sw) / 2, (vh - sh) / 2, sw, sh, 0, 0, c.width, c.height);
        resultado.url = c.toDataURL('image/jpeg', 0.74);
      } catch { /* fica o poster */ }
      return resultado;
    }

    /* cacos: a área do recorte vira triângulos que voam para fora da tela */
    function soltarCacos(g, recorte, quadro) {
      const R = semente(42);
      const base = [g.ix, g.h + 4];
      const cx = g.ix;
      const cy = g.h - g.fundo * 0.5;
      const tris = [];
      for (let i = 0; i < recorte.length - 1; i++) {
        const a = recorte[i];
        const b = recorte[i + 1];
        const m = [(a[0] + b[0]) / 2 + (R() - 0.5) * 10, (a[1] + b[1]) / 2 + (R() - 0.5) * 10];
        const fundoMeio = [(base[0] + m[0]) / 2, (base[1] + m[1]) / 2];
        tris.push([a, m, fundoMeio], [m, b, fundoMeio], [base, a, fundoMeio]);
      }
      cacos.replaceChildren();
      tris.forEach((tri, k) => {
        const xs = tri.map((p) => p[0]);
        const ys = tri.map((p) => p[1]);
        const x0 = Math.min(...xs);
        const y0 = Math.min(...ys);
        const w = Math.max(2, Math.max(...xs) - x0);
        const h = Math.max(2, Math.max(...ys) - y0);
        const el = document.createElement('div');
        el.className = 'caco';
        Object.assign(el.style, { left: `${x0}px`, top: `${y0}px`, width: `${w}px`, height: `${h}px` });
        const boia = document.createElement('div');
        boia.className = 'caco-boia';
        const vidro = document.createElement('div');
        vidro.className = 'caco-vidro';
        Object.assign(vidro.style, {
          clipPath: `polygon(${tri.map(([x, y]) => `${(x - x0).toFixed(1)}px ${(y - y0).toFixed(1)}px`).join(',')})`,
          backgroundColor: '#061a2e',
          backgroundImage: `url("${quadro.url}")`,
          backgroundSize: `${quadro.w}px ${quadro.h}px`,
          backgroundPosition: `${-(x0 - g.borda)}px ${-(y0 - g.borda)}px`,
        });
        boia.appendChild(vidro);
        el.appendChild(boia);
        cacos.appendChild(el);

        const centroX = x0 + w / 2;
        const centroY = y0 + h / 2;
        const ang = Math.atan2(centroY - cy, centroX - cx) + (R() - 0.5) * 0.5;
        const fica = k % 6 === 1;
        const dist = fica ? 70 + R() * 150 : 170 + R() * 360;
        const dx = Math.cos(ang) * dist;
        const dy = Math.sin(ang) * dist * 0.7 + (fica ? 40 + R() * 60 : 160 + R() * 200);
        const giro = (R() < 0.5 ? -1 : 1) * (fica ? 25 + R() * 70 : 120 + R() * 260);
        const escala = fica ? 1.1 + R() * 0.4 : 1.2 + R() * 0.9;
        el.animate(
          [
            { transform: 'translate(0, 0) rotate(0deg) scale(1)', opacity: 1 },
            { transform: `translate(${dx}px, ${dy}px) rotate(${giro}deg) scale(${escala})`, opacity: fica ? 0.92 : 0 },
          ],
          { duration: fica ? 1150 : 760 + R() * 520, easing: 'cubic-bezier(.1, .7, .25, 1)', fill: 'forwards' }
        );
        if (fica) {
          boia.style.setProperty('--fx', `${(R() - 0.5) * 16}px`);
          boia.style.setProperty('--fy', `${-6 - R() * 12}px`);
          boia.style.setProperty('--fr', `${(R() - 0.5) * 22}deg`);
          boia.style.setProperty('--dur', `${3.5 + R() * 3}s`);
          setTimeout(() => boia.classList.add('flutua'), 1150);
        }
      });
    }

    function sprayDoImpacto(g, recorte) {
      const R = Math.random;
      const cx = g.ix;
      const cy = g.h - g.fundo * 0.5;
      const pontos = [];
      for (let i = 0; i < 220; i++) {
        const [x, y] = recorte[Math.floor(R() * recorte.length)];
        const ang = Math.atan2(y - cy, x - cx) + (R() - 0.5) * 1.2;
        const vel = 220 + R() * 620;
        pontos.push({ x, y, vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel - 160 - R() * 220, vida: 0.5 + R() * 0.9, tam: 1 + R() * 3.2 });
      }
      spray.explodir(pontos, palco);
    }

    function emissorDoJet() {
      return {
        taxa: 70,
        gerar() {
          if (scrollY > 120) return null;
          const w = rolagem.offsetWidth;
          const x = rolagem.offsetLeft + (Math.random() - 0.5) * w * 0.62;
          const y = rolagem.offsetTop + rolagem.offsetHeight * (0.86 + Math.random() * 0.06);
          const lado = x < rolagem.offsetLeft ? -1 : 1;
          return { x, y, vx: lado * (60 + Math.random() * 200), vy: -120 - Math.random() * 280, vida: 0.5 + Math.random() * 0.6, tam: 0.8 + Math.random() * 2.2 };
        },
      };
    }

    function tremor() {
      return [0, -8, 7, -6, 5, -3, 2, 0].map((v, i) => ({ transform: `translate(${v}px, ${i % 2 ? -v * 0.5 : v * 0.35}px)` }));
    }

    const sombraJet = 'drop-shadow(0 28px 26px rgba(6, 26, 46, .38))';

    async function estourar() {
      if (quebrou) return;
      quebrou = true;
      const g = geo();
      const recorte = entalhe(g);
      const quadro = capturarQuadro(g);
      tela.style.setProperty('--quadro', `url("${quadro.url}")`);

      tela.classList.add('glitchando');
      await espera(280);
      tela.classList.remove('glitchando');

      const corte = poligono(g, recorte);
      tela.style.clipPath = corte;
      rachado.style.clipPath = corte;
      desenharRachado(g, recorte, true);
      flash.animate([{ opacity: 0.9 }, { opacity: 0 }], { duration: 340, easing: 'ease-out' });
      soltarCacos(g, recorte, quadro);
      sprayDoImpacto(g, recorte);
      hero.animate(tremor(), { duration: 420, easing: 'linear' });

      jet.animate(
        [
          { transform: 'translateY(-30%) scale(.28)', filter: `blur(5px) brightness(.7) ${sombraJet}`, opacity: 0 },
          { opacity: 1, offset: 0.08 },
          { transform: 'translateY(3%) scale(1.07)', filter: `blur(1px) brightness(1.06) ${sombraJet}`, offset: 0.62 },
          { transform: 'translateY(0) scale(1)', filter: `blur(0px) brightness(1) ${sombraJet}`, opacity: 1 },
        ],
        { duration: 780, easing: 'cubic-bezier(.16, .84, .26, 1)', fill: 'forwards' }
      );
      titulo.animate(
        [
          { opacity: 0, transform: 'translateY(.14em) scale(1.08)' },
          { opacity: 1, transform: 'none' },
        ],
        { duration: 520, delay: 160, easing: 'cubic-bezier(.2, .9, .2, 1)', fill: 'both' }
      );
      hero.classList.add('estourou');
      setTimeout(() => spray.emitir(emissorDoJet(), palco), 700);
    }

    function estadoFinal() {
      quebrou = true;
      const g = geo();
      const recorte = entalhe(g);
      const corte = poligono(g, recorte);
      tela.style.clipPath = corte;
      rachado.style.clipPath = corte;
      desenharRachado(g, recorte, false);
      jet.style.opacity = '1';
      titulo.style.opacity = '1';
      hero.classList.add('estourou');
    }

    function refazerCorte() {
      if (!quebrou) return;
      const g = geo();
      const recorte = entalhe(g);
      const corte = poligono(g, recorte);
      tela.style.clipPath = corte;
      rachado.style.clipPath = corte;
      desenharRachado(g, recorte, false);
      spray.medir();
    }

    let atrasoResize = 0;
    addEventListener('resize', () => {
      clearTimeout(atrasoResize);
      atrasoResize = setTimeout(refazerCorte, 160);
    });

    /* o jet avança sobre a página conforme a rolagem; no desktop segue o mouse de leve */
    if (matchMedia('(pointer: fine)').matches) {
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        mouseX = ((e.clientX - r.left) / r.width - 0.5) * 18;
        mouseY = ((e.clientY - r.top) / r.height - 0.5) * 10;
        agendar();
      });
    }
    efeitos.push(() => {
      if (!quebrou || reduz.matches) return;
      const r = hero.getBoundingClientRect();
      if (r.bottom < -200) return;
      const p = limitar(-r.top / (r.height * 0.9), 0, 1);
      rolagem.style.transform = `translate3d(${mouseX}px, calc(${p * 16}% + ${mouseY}px), 0) scale(${1 + p * 0.32})`;
    });

    async function comecar() {
      if (document.hidden) await new Promise((r) => document.addEventListener('visibilitychange', r, { once: true }));
      await Promise.race([Promise.all([jet.decode().catch(() => {}), document.fonts ? document.fonts.ready : null]), espera(2200)]);
      spray.medir();
      if (reduz.matches) { estadoFinal(); return; }
      await espera(video.paused ? 450 : 1000);
      estourar();
    }
    comecar();
  }

  /* ---------- Spray: gotas em canvas ---------- */
  function criarSpray(canvas) {
    const ctx = canvas.getContext('2d');
    let dpr = 1;
    let W = 0;
    let H = 0;
    let ox = 0;
    let oy = 0;
    let gotas = [];
    let rodando = false;
    let ultimo = 0;
    let emissor = null;
    let visivel = true;
    let acumulado = 0;

    function medir() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ox = canvas.offsetLeft;
      oy = canvas.offsetTop;
    }

    function adicionar(p) {
      if (gotas.length > 420) return;
      gotas.push({ x: p.x - ox, y: p.y - oy, vx: p.vx, vy: p.vy, vida: p.vida, max: p.vida, tam: p.tam });
    }

    function passo(t) {
      const dt = Math.min(0.033, (t - ultimo) / 1000 || 0.016);
      ultimo = t;
      if (emissor && visivel) {
        acumulado += emissor.taxa * dt;
        while (acumulado >= 1) {
          acumulado -= 1;
          const p = emissor.gerar();
          if (p) adicionar(p);
        }
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = 'rgba(10, 39, 66, .32)';
      ctx.fillStyle = '#fff';
      const vivas = [];
      for (const g of gotas) {
        g.vida -= dt;
        if (g.vida <= 0) continue;
        g.vy += 980 * dt;
        g.vx *= 0.985;
        g.x += g.vx * dt;
        g.y += g.vy * dt;
        ctx.globalAlpha = Math.min(1, (g.vida / g.max) * 1.5);
        ctx.beginPath();
        ctx.arc(g.x, g.y, g.tam, 0, 6.2832);
        ctx.fill();
        ctx.stroke();
        vivas.push(g);
      }
      gotas = vivas;
      ctx.globalAlpha = 1;
      if (gotas.length || (emissor && visivel)) requestAnimationFrame(passo);
      else rodando = false;
    }

    function ligar() {
      if (rodando || reduz.matches) return;
      rodando = true;
      ultimo = performance.now();
      requestAnimationFrame(passo);
    }

    return {
      medir,
      explodir(pontos) { pontos.forEach(adicionar); ligar(); },
      emitir(e) { emissor = e; ligar(); },
      visibilidade(v) { visivel = v; if (v && emissor) ligar(); },
    };
  }

  /* ---------- Travessia: o jet cruza e preenche o slogan ---------- */
  const travessia = $('[data-travessia]');
  if (travessia) {
    const faixa = $('.travessia-faixa', travessia);
    const jetT = $('[data-jet-travessia]', travessia);
    const cheio = $('[data-cheio]', travessia);
    const esteira = $('[data-esteira]', travessia);
    efeitos.push((vh) => {
      const r = faixa.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const W = faixa.clientWidth;
      const jw = jetT.offsetWidth;
      const margem = parseFloat(getComputedStyle(faixa).paddingLeft) || 0;
      if (reduz.matches) {
        jetT.style.transform = `translate3d(${W * 0.66}px, 0, 0)`;
        cheio.style.setProperty('--x', '9999px');
        esteira.style.setProperty('--w', `${W * 0.66 - jw * 0.42}px`);
        return;
      }
      const t = limitar(((vh - r.top) / (vh + r.height) - 0.12) / 0.7, 0, 1);
      const x = -jw * 0.55 + t * (W + jw * 1.1);
      jetT.style.transform = `translate3d(${x}px, 0, 0) rotate(${(0.5 - t) * 4}deg)`;
      cheio.style.setProperty('--x', `${Math.max(0, x - margem)}px`);
      esteira.style.setProperty('--w', `${Math.max(0, x - jw * 0.42)}px`);
    });
  }

  /* ---------- Final: o jet salta por cima do título ---------- */
  const final = $('[data-final]');
  if (final) {
    const jetF = $('[data-jet-final]', final);
    efeitos.push((vh) => {
      if (reduz.matches) return;
      const r = final.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const t = limitar((vh - r.top) / (vh + r.height), 0, 1);
      jetF.style.transform = `translate3d(${(t - 0.5) * -6}%, ${(0.4 - t) * 32}%, 0) rotate(${(t - 0.5) * 16 - 3}deg)`;
    });
  }

  /* ---------- Botão flutuante e folha de opções ---------- */
  const flutuante = $('[data-flutuante]');
  const folha = $('[data-folha]');
  if (flutuante && folha) {
    const escondem = new Map();
    const alvos = [hero, $('[data-crono]'), $('#reservar'), final].filter(Boolean);
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => escondem.set(e.target, e.isIntersecting));
      flutuante.classList.toggle('visivel', ![...escondem.values()].some(Boolean));
    });
    alvos.forEach((a) => { escondem.set(a, true); io.observe(a); });

    $('[data-abrir-folha]', flutuante).addEventListener('click', () => {
      if (typeof folha.showModal === 'function') folha.showModal();
      else location.hash = '#reservar';
    });
    folha.addEventListener('click', (e) => { if (e.target === folha) folha.close(); });
    $$('a', folha).forEach((a) => a.addEventListener('click', () => folha.close()));
  }

  rodarEfeitos();

  /* ---------- utilitários ---------- */
  function semente(a) {
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function P_(i, n) {
    // ângulos do semicírculo de cima (a tela quebra a partir da borda de baixo)
    return Math.PI + (i / (n - 1)) * Math.PI;
  }
  function linha(pts) {
    return 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L');
  }
  function caminho(ns, d, classe, atraso) {
    const p = document.createElementNS(ns, 'path');
    p.setAttribute('d', d);
    p.setAttribute('pathLength', '1');
    p.setAttribute('class', classe);
    p.style.setProperty('--atraso', `${Math.round(atraso)}ms`);
    return p;
  }
  function pontoNoRaio(pts, cx, cy, raio) {
    for (const p of pts) if (Math.hypot(p[0] - cx, p[1] - cy) >= raio) return p;
    return null;
  }
})();
