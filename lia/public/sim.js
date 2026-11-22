// A senha fica só nesta aba (sessionStorage) e vai no cabeçalho, nunca na URL.
let token = '';
try { token = sessionStorage.getItem('lia-token') || ''; } catch {}
const headers = () => (token ? { 'x-admin-token': token } : {});
const $ = (s) => document.querySelector(s);
const ADMIN = 'admin';
let after = 0, current = '';
const newPhones = [];
const local = []; // mensagens que você digitou: {to: phone|admin, kind, text, img}
const outbox = [];

async function api(path, body) {
  const r = await fetch(path, body ? { method: 'POST', headers: { ...headers(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : { headers: headers() });
  if (r.status === 401 || r.status === 403) { $('#loginForm').hidden = false; throw new Error('login'); }
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
// Imagens também passam pela senha: baixa com o cabeçalho e mostra como blob.
const blobs = new Map();
function mediaUrl(f) {
  if (blobs.has(f)) return blobs.get(f);
  blobs.set(f, '');
  fetch(`/media/${encodeURIComponent(f)}`, { headers: headers() })
    .then((r) => (r.ok ? r.blob() : null))
    .then((b) => { if (b) { blobs.set(f, URL.createObjectURL(b)); render(); } });
  return '';
}
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const wa = (s) => esc(s).replace(/\*([^*\n]+)\*/g, '<b>$1</b>');

function render() {
  for (const [box, who] of [[$('#clientMsgs'), current], [$('#adminMsgs'), ADMIN]]) {
    const items = [
      ...local.filter((m) => m.to === who).map((m) => ({ ...m, dir: 'out' })),
      ...outbox.filter((m) => m.to === who).map((m) => ({ ...m, dir: 'in' })),
    ].sort((a, b) => a.t - b.t);
    const atBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 60;
    box.innerHTML = items.map((m) => {
      let inner = '';
      if (m.img) inner = `<img src="${m.img}" alt="">${m.text ? `<div>${esc(m.text)}</div>` : ''}`;
      else if (m.type === 'image') { const u = mediaUrl(m.file); inner = `${u ? `<img src="${u}" alt="Arte">` : '<div class="cap">carregando imagem…</div>'}${m.text ? `<div class="cap">${esc(m.text)}</div>` : ''}`; }
      else inner = wa(m.text);
      if (m.type === 'buttons') inner += `<div class="btns">${m.buttons.map((b) => `<button type="button" data-id="${esc(b.id)}" data-title="${esc(b.title)}">${esc(b.title)}</button>`).join('')}</div>`;
      return `<div class="row ${m.dir}"><div class="b">${inner}</div></div>`;
    }).join('');
    if (atBottom) box.scrollTop = box.scrollHeight;
  }
}

async function poll() {
  try {
    const msgs = await api(`/sim/outbox?after=${after}`);
    for (const m of msgs) { m.t = performance.now() + m.id / 1e6; outbox.push(m); after = Math.max(after, m.id); }
    if (msgs.length) { render(); refreshClients(); }
  } catch (e) { console.error(e); }
  setTimeout(poll, 900);
}

async function refreshClients() {
  const list = await api('/sim/clients');
  const sel = $('#client');
  const prev = sel.value;
  // Números novos (sem cadastro) caem na Lia vendedora.
  const leads = [...new Set([...newPhones, ...local.map((m) => m.to)].filter((p) => p !== ADMIN && !list.some((c) => c.phone === p)))];
  sel.innerHTML = list.map((c) => `<option value="${esc(c.phone)}">${esc(c.business)} · ${esc(c.phone)}</option>`).join('') +
    leads.map((p) => `<option value="${esc(p)}">Novo contato (venda) · ${esc(p)}</option>`).join('') +
    '<option value="__new">➕ Testar como número novo (vendas)</option>';
  if (prev === '__new') {
    const p = '5500' + String(Math.floor(Math.random() * 1e7)).padStart(7, '0');
    newPhones.push(p);
    sel.insertAdjacentHTML('afterbegin', `<option value="${p}">Novo contato (venda) · ${p}</option>`);
    sel.value = p;
  } else sel.value = prev && [...sel.options].some((o) => o.value === prev) ? prev : (sel.options[0]?.value || '');
  current = sel.value;
  const c = list.find((x) => x.phone === current);
  $('#info').textContent = c ? `Plano ${c.plan} · ${c.credits} créditos · ${c.onboarded ? 'onboarding feito' : 'onboarding pendente'}` : '';
  $('#who').textContent = current;
  render();
}

function sendClient(body, view) {
  if (!current) { alertBox('Cadastre e escolha um cliente primeiro.'); return Promise.resolve(); }
  local.push({ to: current, t: performance.now(), ...view });
  render();
  return api('/sim/send', { from: current, ...body });
}
function alertBox(t) { local.push({ to: ADMIN, t: performance.now(), text: t }); render(); }

$('#clientForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = $('#clientText').value.trim();
  if (!text) return;
  $('#clientText').value = '';
  sendClient({ text }, { text });
});
$('#adminForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = $('#adminText').value.trim();
  if (!text) return;
  $('#adminText').value = '';
  local.push({ to: ADMIN, t: performance.now(), text });
  render();
  api('/sim/send', { asAdmin: true, text });
});
$('#photoBtn').addEventListener('click', () => $('#photo').click());
$('#photo').addEventListener('change', (e) => {
  const f = e.target.files[0]; e.target.value = '';
  if (!f) return;
  const rd = new FileReader();
  rd.onload = () => {
    const url = rd.result;
    const caption = $('#clientText').value.trim(); $('#clientText').value = '';
    sendClient({ text: caption, image: { base64: url.split(',')[1], mime: f.type || 'image/jpeg' } }, { img: url, text: caption });
  };
  rd.readAsDataURL(f);
});
document.addEventListener('click', (e) => {
  const b = e.target.closest('.btns button');
  if (!b) return;
  sendClient({ buttonId: b.dataset.id, buttonTitle: b.dataset.title }, { text: b.dataset.title });
});
$('#client').addEventListener('change', refreshClients);
$('#loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  token = $('#token').value.trim();
  try { sessionStorage.setItem('lia-token', token); } catch {}
  $('#loginForm').hidden = true;
  refreshClients();
});

refreshClients().catch(() => {}).finally(poll);
