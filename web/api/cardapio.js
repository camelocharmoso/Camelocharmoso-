// POST /api/cardapio — monta o cardápio do dia.
// A IA escolhe alimentos da TACO e gramas; o código calcula, ajusta à meta e valida restrições.
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { criarTaco, paraCardapio, violacoes, ajustarPorcoes, trocarProibidos, totais, desvios, dentroDaMeta, TOLERANCIA } from '../lib/nutri.mjs';

export const config = { maxDuration: 60 };

const taco = criarTaco(JSON.parse(readFileSync(new URL('../data/taco.json', import.meta.url), 'utf8')));
const SUPABASE_URL = 'https://flxltpgirbdcimqzjaht.supabase.co';
const SUPABASE_KEY = 'sb_publishable_WAPK9_OdhIcwJgFedfcX7Q_fEgus9h3';
// Fila de modelos: o primeiro com chave configurada responde; erro, limite de uso ou demora passa a vez ao próximo.
// Cada modelo tem a própria cota nos planos gratuitos, por isso há dois de cada provedor.
const FILA = [
  ['anthropic', process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5'],
  ['gemini', process.env.GEMINI_MODEL || 'gemini-3.5-flash'],
  ['gemini', 'gemini-3.1-flash-lite'],
  ['groq', process.env.GROQ_MODEL || 'openai/gpt-oss-120b'],
  ['groq', 'openai/gpt-oss-20b'],
];
const LIMITE_MS = 52000;

const Entrada = z.object({
  ficha: z.object({
    sexo: z.enum(['f', 'm']),
    idade: z.coerce.number().min(10).max(110),
    objetivo: z.string().max(40),
    restricoes: z.array(z.string().max(30)).max(20).default([]),
    padrao: z.string().max(30).default('onivoro'),
    preferencias: z.string().max(1500).default(''),
    naoGosta: z.string().max(500).default(''),
    treino: z.string().max(200).default(''),
  }),
  metas: z.object({ kcal: z.number().positive(), ptn: z.number().positive(), cho: z.number().positive(), lip: z.number().positive() }),
  refeicoes: z.array(z.object({ nome: z.string().max(40), horario: z.string().max(5), pct: z.number().min(0).max(100) })).min(3).max(8),
});

const Saida = z.object({
  refeicoes: z.array(z.object({
    nome: z.string().min(1).max(40),
    horario: z.string().regex(/^\d{2}:\d{2}$/),
    itens: z.array(z.object({
      taco_id: z.number().int(),
      gramas: z.number().positive().max(1500),
      unidade_nome: z.string().min(1).max(40),
      gramas_por_unidade: z.number().positive().max(1000),
    })).min(1).max(10),
    substituicoes: z.string().max(400),
  })).min(3).max(8),
  observacoes: z.string().max(800),
});

const ITEM = {
  type: 'object',
  properties: {
    taco_id: { type: 'integer', description: 'id do alimento na lista TACO' },
    gramas: { type: 'number', description: 'quantidade em gramas, como consumido' },
    unidade_nome: { type: 'string', description: 'medida caseira no singular, ex.: colher de sopa, unidade média, fatia, concha, xícara' },
    gramas_por_unidade: { type: 'number', description: 'peso aproximado de 1 medida caseira em gramas' },
  },
  required: ['taco_id', 'gramas', 'unidade_nome', 'gramas_por_unidade'],
  additionalProperties: false,
};
const ESQUEMA = {
  type: 'object',
  properties: {
    refeicoes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          nome: { type: 'string' },
          horario: { type: 'string', description: 'HH:MM' },
          itens: { type: 'array', items: ITEM },
          substituicoes: { type: 'string', description: '1 ou 2 trocas equivalentes em uma frase curta' },
        },
        required: ['nome', 'horario', 'itens', 'substituicoes'],
        additionalProperties: false,
      },
    },
    observacoes: { type: 'string', description: '2 ou 3 orientações gerais em português' },
  },
  required: ['refeicoes', 'observacoes'],
  additionalProperties: false,
};
const DESCRICAO = 'Registra o cardápio de um dia escolhido só com alimentos da lista TACO fornecida.';

class ErroApp extends Error {
  constructor(status, codigo, mensagem) { super(mensagem); this.status = status; this.codigo = codigo; }
}

async function usuarioLogado(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) throw new ErroApp(401, 'sem_login', 'Entre na sua conta para gerar o cardápio.');
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new ErroApp(401, 'sessao_expirada', 'Sua sessão expirou. Entre de novo na aba Perfil.');
  return (await r.json()).id;
}

// A conversa é neutra ({ papel: 'user' | 'assistant', texto }); cada provedor recebe o esquema e devolve o objeto.
// Erro de rede/limite/chave num provedor faz tentar o próximo configurado.
async function pedir(url, opcoes, provedor, modelo) {
  const r = await fetch(url, { method: 'POST', ...opcoes });
  const corpo = await r.json().catch(() => ({}));
  if (!r.ok) {
    const nome = provedor[0].toUpperCase() + provedor.slice(1);
    if (r.status === 401 || r.status === 403) throw new ErroApp(503, 'chave_invalida', `A chave do ${nome} configurada na Vercel foi recusada.`);
    if (r.status === 404) throw new ErroApp(503, 'modelo_invalido', `O modelo ${modelo} não foi encontrado no ${nome}.`);
    if (r.status === 413 || r.status === 429 || r.status === 503 || r.status === 529) throw new ErroApp(503, 'ia_ocupada', 'A IA está ocupada agora. Tente de novo em alguns segundos.');
    throw new ErroApp(502, 'ia_erro', `A IA respondeu com erro (${provedor} ${r.status}).`);
  }
  return corpo;
}
const json = (t) => { try { return JSON.parse(String(t || '').replace(/^```(?:json)?\s*|\s*```$/g, '')); } catch { return null; } };

const PROVEDORES = {
  async anthropic(conversa, sinal, chave, modelo) {
    const ferramenta = { name: 'montar_cardapio', description: DESCRICAO, input_schema: ESQUEMA };
    const msgs = conversa.map((m) => ({ role: m.papel, content: m.texto }));
    const c = await pedir('https://api.anthropic.com/v1/messages', { signal: sinal, headers: { 'x-api-key': chave, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: modelo, max_tokens: 6000, tools: [ferramenta], tool_choice: { type: 'tool', name: 'montar_cardapio' }, messages: msgs }) }, 'anthropic', modelo);
    return c.content?.find((x) => x.type === 'tool_use')?.input;
  },
  async gemini(conversa, sinal, chave, modelo) {
    const c = await pedir(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`, { signal: sinal, headers: { 'x-goog-api-key': chave, 'content-type': 'application/json' },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: DESCRICAO + ' Responda só com o JSON pedido.' }] },
        contents: conversa.map((m) => ({ role: m.papel === 'assistant' ? 'model' : 'user', parts: [{ text: m.texto }] })),
        generationConfig: { responseMimeType: 'application/json', responseJsonSchema: ESQUEMA, temperature: 0.7, maxOutputTokens: 8000 } }) }, 'gemini', modelo);
    return json(c.candidates?.[0]?.content?.parts?.filter((p) => !p.thought).map((p) => p.text).join(''));
  },
  async groq(conversa, sinal, chave, modelo) {
    const c = await pedir('https://api.groq.com/openai/v1/chat/completions', { signal: sinal, headers: { Authorization: `Bearer ${chave}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: modelo, temperature: 0.7, max_completion_tokens: 8000,
        messages: [{ role: 'system', content: DESCRICAO + ' Responda só com o JSON pedido.' }, ...conversa.map((m) => ({ role: m.papel, content: m.texto }))],
        response_format: { type: 'json_schema', json_schema: { name: 'montar_cardapio', strict: true, schema: ESQUEMA } } }) }, 'groq', modelo);
    return json(c.choices?.[0]?.message?.content);
  },
};
const CHAVES = { anthropic: 'ANTHROPIC_API_KEY', gemini: 'GEMINI_API_KEY', groq: 'GROQ_API_KEY' };

// Modelo que recusou por limite fica 60 s no fim da fila (vale enquanto a função continuar aquecida).
const ocupadoAte = new Map();

async function chamarIA(conversa, sinal, requestId) {
  const agora = Date.now();
  const ativos = FILA.filter(([p]) => process.env[CHAVES[p]])
    .sort((a, b) => ((ocupadoAte.get(a[1]) || 0) > agora) - ((ocupadoAte.get(b[1]) || 0) > agora));
  if (!ativos.length) throw new ErroApp(503, 'sem_chave', 'A IA ainda não foi configurada no servidor (falta GEMINI_API_KEY, GROQ_API_KEY ou ANTHROPIC_API_KEY na Vercel).');
  let ultimo;
  for (const [i, [p, modelo]] of ativos.entries()) {
    if (sinal.aborted) break;
    // Com reserva na fila, cada modelo tem até 20 s (o primeiro) ou 15 s; o último usa o tempo que sobrar.
    const limite = i < ativos.length - 1 ? AbortSignal.timeout(i === 0 ? 20000 : 15000) : null;
    try {
      const saida = await PROVEDORES[p](conversa, limite ? AbortSignal.any([sinal, limite]) : sinal, process.env[CHAVES[p]], modelo);
      console.log(`[cardapio ${requestId}] respondeu ${p} ${modelo}`);
      return saida;
    } catch (e) {
      const passouDoLimite = limite?.aborted && !sinal.aborted;
      if (!passouDoLimite && (e.name === 'AbortError' || e.name === 'TimeoutError' || !(e instanceof ErroApp))) throw e;
      if (passouDoLimite) e = new ErroApp(504, 'tempo_esgotado', 'A IA demorou demais para responder.');
      if (e.codigo === 'ia_ocupada' || e.codigo === 'tempo_esgotado') ocupadoAte.set(modelo, Date.now() + 60000);
      console.warn(`[cardapio ${requestId}] ${p} ${modelo} falhou (${e.codigo}), tentando o próximo`);
      ultimo = e;
    }
  }
  if (sinal.aborted) throw Object.assign(new Error('tempo'), { name: 'AbortError' });
  throw ultimo?.codigo === 'tempo_esgotado' ? new ErroApp(503, 'ia_ocupada', 'As IAs gratuitas estão sobrecarregadas agora. Tente de novo em 1 minuto.')
    : ultimo?.codigo === 'ia_ocupada' ? new ErroApp(503, 'ia_ocupada', 'As IAs gratuitas atingiram o limite de uso deste minuto. Tente de novo em 1 minuto.') : ultimo;
}

function promptInicial(d, candidatos) {
  const f = d.ficha, m = d.metas;
  const refs = d.refeicoes.map((r) => `- ${r.nome} às ${r.horario}: cerca de ${Math.round((m.kcal * r.pct) / 100)} kcal`).join('\n');
  return `Você é assistente de um nutricionista brasileiro e monta uma PROPOSTA de cardápio de um dia, que ele vai revisar.
Paciente: ${f.sexo === 'm' ? 'homem' : 'mulher'}, ${f.idade} anos. Objetivo: ${f.objetivo}. Padrão alimentar: ${f.padrao}. Restrições e alergias: ${f.restricoes.join(', ') || 'nenhuma'}.
Treino: ${f.treino || 'não informado'}. Não gosta de: ${f.naoGosta || 'nada informado'}.
Preferências e rotina: ${f.preferencias || 'não informadas'}.
Metas do dia: ${m.kcal} kcal, ${m.ptn} g de proteína, ${m.cho} g de carboidrato, ${m.lip} g de gordura.
Refeições e distribuição de energia:
${refs}

Regras:
- Use SOMENTE alimentos desta lista (id | nome TACO). Prefira preparações prontas para comer (cozido, grelhado, assado, cru quando for fruta ou salada).
- Monte combinações do dia a dia brasileiro e nordestino (cuscuz, tapioca, macaxeira/mandioca, feijão, frutas regionais), que façam sentido juntas e no horário.
- Respeite o horário do treino: encaixe pré-treino e pós-treino quando houver treino.
- Dê gramas realistas e a medida caseira com o peso aproximado de 1 unidade dessa medida.
- Não se preocupe em acertar os números exatos: o sistema calcula pela TACO e ajusta as porções.

Lista TACO permitida:
${candidatos.map((c) => `${c.id} | ${c.nome}`).join('\n')}`;
}

export default async function handler(req, res) {
  const requestId = randomUUID().slice(0, 8);
  const inicio = Date.now();
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method !== 'POST') throw new ErroApp(405, 'metodo', 'Use POST.');
    await usuarioLogado(req);
    const entrada = Entrada.safeParse(typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body);
    if (!entrada.success) throw new ErroApp(400, 'ficha_incompleta', 'A ficha está incompleta para gerar o cardápio.');
    const d = entrada.data;
    const { restricoes, padrao, naoGosta } = d.ficha;
    const candidatos = taco.lista.filter((f) => paraCardapio(f) && !violacoes(f, restricoes, padrao, naoGosta).length);

    const ctl = new AbortController();
    const relogio = setTimeout(() => ctl.abort(), LIMITE_MS);
    const msgs = [{ papel: 'user', texto: promptInicial(d, candidatos) }];
    let bruto, tentativa = 0, avisos = [];
    try {
      // Saída estruturada: até 2 tentativas se a resposta não passar na validação.
      while (true) {
        tentativa++;
        const e = await chamarIA(msgs, ctl.signal, requestId);
        const v = Saida.safeParse(e);
        const permitidos = new Set(candidatos.map((c) => c.id));
        const idsRuins = v.success ? v.data.refeicoes.flatMap((r) => r.itens).filter((i) => !permitidos.has(i.taco_id)).map((i) => i.taco_id) : [];
        const inexistentes = idsRuins.filter((id) => !taco.get(id));
        // Na 2ª tentativa, alimento proibido mas existente é aceito e trocado pelo código (rede de segurança).
        if (v.success && (!idsRuins.length || (tentativa >= 2 && !inexistentes.length))) { bruto = v.data; break; }
        console.warn(`[cardapio ${requestId}] resposta inválida na tentativa ${tentativa}`, v.success ? `ids fora da TACO: ${idsRuins.join(',')}` : v.error.issues.slice(0, 3));
        if (tentativa >= 2) throw new ErroApp(502, 'resposta_invalida', 'A IA respondeu num formato inesperado duas vezes. Tente gerar de novo.');
        msgs.push({ papel: 'assistant', texto: JSON.stringify(e ?? {}) });
        msgs.push({ papel: 'user', texto: `Resposta inválida. Use só ids da lista permitida e todos os campos, no formato pedido. ${idsRuins.length ? 'Ids fora da lista (proibidos ou inexistentes): ' + idsRuins.join(', ') : ''}` });
      }
    } catch (e) {
      clearTimeout(relogio);
      if (e.name === 'AbortError') throw new ErroApp(504, 'tempo_esgotado', 'A IA demorou demais para responder. Tente de novo.');
      throw e;
    }

    const processar = (b) => {
      let refs = b.refeicoes.map((r) => ({
        nome: r.nome, horario: r.horario, substituicoes: r.substituicoes,
        itens: r.itens.map((i) => ({ taco_id: i.taco_id, gramas: i.gramas, unidade: { nome: i.unidade_nome, g: i.gramas_por_unidade } })),
      }));
      const troca = trocarProibidos(taco, refs, restricoes, padrao, naoGosta);
      return { refs: ajustarPorcoes(taco, troca.refeicoes, d.metas), avisosTroca: troca.avisos };
    };
    let { refs: refeicoes, avisosTroca } = processar(bruto);
    // Até 2 rodadas de correção pedindo à IA outros alimentos, se o ajuste de porções não bastar e houver tempo.
    for (let rodada = 1; rodada <= 2 && !dentroDaMeta(totais(refeicoes), d.metas) && Date.now() - inicio < 30000; rodada++) {
      const t0 = totais(refeicoes), dv = desvios(t0, d.metas);
      msgs.push({ papel: 'assistant', texto: JSON.stringify(bruto) });
      msgs.push({ papel: 'user', texto: `Calculado pela TACO depois de ajustar as porções: ${t0.kcal} kcal, ${t0.ptn} g proteína, ${t0.cho} g carboidrato, ${t0.lip} g gordura (desvios: proteína ${Math.round(dv.ptn * 100)}%, carboidrato ${Math.round(dv.cho * 100)}%, gordura ${Math.round(dv.lip * 100)}%). Troque ou acrescente alimentos para aproximar cada macronutriente da meta, mantendo o estilo das refeições, e registre o cardápio completo de novo.` });
      try {
        const e = await chamarIA(msgs, ctl.signal, requestId);
        const v = Saida.safeParse(e);
        if (!v.success || v.data.refeicoes.flatMap((r) => r.itens).some((i) => !taco.get(i.taco_id))) break;
        const novo = processar(v.data);
        const melhor = (t) => Object.values(desvios(t, d.metas)).reduce((s, x) => s + Math.abs(x), 0);
        if (melhor(totais(novo.refs)) < melhor(totais(refeicoes))) { refeicoes = novo.refs; avisosTroca = novo.avisosTroca; bruto = v.data; }
        console.log(`[cardapio ${requestId}] rodada de correção ${rodada}`);
      } catch (e) {
        if (e.name === 'AbortError') break;
        throw e;
      }
    }
    clearTimeout(relogio);
    avisos.push(...avisosTroca);
    const t = totais(refeicoes);
    if (!dentroDaMeta(t, d.metas)) {
      const dv = desvios(t, d.metas);
      avisos.push(`Não deu para bater todas as metas só ajustando porções (energia ${Math.round(dv.kcal * 100)}%, proteína ${Math.round(dv.ptn * 100)}%, carboidrato ${Math.round(dv.cho * 100)}%, gordura ${Math.round(dv.lip * 100)}%). Revise os alimentos.`);
    }
    console.log(`[cardapio ${requestId}] ok em ${Date.now() - inicio} ms, ${tentativa} chamada(s)`);
    res.status(200).json({ requestId, refeicoes, observacoes: bruto.observacoes, totais: t, metas: d.metas, avisos, tolerancia: TOLERANCIA });
  } catch (e) {
    const status = e instanceof ErroApp ? e.status : 500;
    const codigo = e instanceof ErroApp ? e.codigo : 'erro_interno';
    console.error(`[cardapio ${requestId}] ${codigo}: ${e.message}`);
    res.status(status).json({ requestId, codigo, mensagem: e instanceof ErroApp ? e.message : 'Algo deu errado ao montar o cardápio. Tente de novo.' });
  }
}
