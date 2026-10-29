// POST /api/cardapio — monta o cardápio do dia.
// A IA escolhe alimentos da TACO e gramas; o código calcula, ajusta à meta e valida restrições.
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { criarTaco, violacoes, ajustarPorcoes, trocarProibidos, totais, desvios, dentroDaMeta, TOLERANCIA } from '../lib/nutri.mjs';

export const config = { maxDuration: 60 };

const taco = criarTaco(JSON.parse(readFileSync(new URL('../data/taco.json', import.meta.url), 'utf8')));
const SUPABASE_URL = 'https://flxltpgirbdcimqzjaht.supabase.co';
const SUPABASE_KEY = 'sb_publishable_WAPK9_OdhIcwJgFedfcX7Q_fEgus9h3';
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';
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

const FERRAMENTA = {
  name: 'montar_cardapio',
  description: 'Registra o cardápio de um dia escolhido só com alimentos da lista TACO fornecida.',
  input_schema: {
    type: 'object',
    properties: {
      refeicoes: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            nome: { type: 'string' },
            horario: { type: 'string', description: 'HH:MM' },
            itens: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  taco_id: { type: 'integer', description: 'id do alimento na lista TACO' },
                  gramas: { type: 'number', description: 'quantidade em gramas, como consumido' },
                  unidade_nome: { type: 'string', description: 'medida caseira no singular, ex.: colher de sopa, unidade média, fatia, concha, xícara' },
                  gramas_por_unidade: { type: 'number', description: 'peso aproximado de 1 medida caseira em gramas' },
                },
                required: ['taco_id', 'gramas', 'unidade_nome', 'gramas_por_unidade'],
              },
            },
            substituicoes: { type: 'string', description: '1 ou 2 trocas equivalentes em uma frase curta' },
          },
          required: ['nome', 'horario', 'itens', 'substituicoes'],
        },
      },
      observacoes: { type: 'string', description: '2 ou 3 orientações gerais em português' },
    },
    required: ['refeicoes', 'observacoes'],
  },
};

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

async function chamarClaude(mensagens, sinal) {
  const chave = process.env.ANTHROPIC_API_KEY;
  if (!chave) throw new ErroApp(503, 'sem_chave', 'A IA ainda não foi configurada no servidor (falta a chave ANTHROPIC_API_KEY na Vercel).');
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal: sinal,
    headers: { 'x-api-key': chave, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: 6000, tools: [FERRAMENTA], tool_choice: { type: 'tool', name: 'montar_cardapio' }, messages: mensagens }),
  });
  const corpo = await r.json().catch(() => ({}));
  if (!r.ok) {
    const tipo = corpo?.error?.type || r.status;
    if (r.status === 401) throw new ErroApp(503, 'chave_invalida', 'A chave da IA configurada na Vercel foi recusada. Confira a ANTHROPIC_API_KEY.');
    if (r.status === 404) throw new ErroApp(503, 'modelo_invalido', `O modelo de IA ${MODEL} não foi encontrado.`);
    if (r.status === 429 || r.status === 529) throw new ErroApp(503, 'ia_ocupada', 'A IA está ocupada agora. Tente de novo em alguns segundos.');
    throw new ErroApp(502, 'ia_erro', `A IA respondeu com erro (${tipo}).`);
  }
  const uso = corpo.content?.find((c) => c.type === 'tool_use');
  return { entrada: uso?.input, bloco: corpo.content };
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
    const candidatos = taco.lista.filter((f) => !violacoes(f, restricoes, padrao, naoGosta).length);

    const ctl = new AbortController();
    const relogio = setTimeout(() => ctl.abort(), LIMITE_MS);
    const msgs = [{ role: 'user', content: promptInicial(d, candidatos) }];
    let bruto, tentativa = 0, ultimoBloco = null, avisos = [];
    try {
      // Saída estruturada: até 2 tentativas se a resposta não passar na validação.
      while (true) {
        tentativa++;
        const { entrada: e, bloco } = await chamarClaude(msgs, ctl.signal);
        const v = Saida.safeParse(e);
        const permitidos = new Set(candidatos.map((c) => c.id));
        const idsRuins = v.success ? v.data.refeicoes.flatMap((r) => r.itens).filter((i) => !permitidos.has(i.taco_id)).map((i) => i.taco_id) : [];
        const inexistentes = idsRuins.filter((id) => !taco.get(id));
        // Na 2ª tentativa, alimento proibido mas existente é aceito e trocado pelo código (rede de segurança).
        if (v.success && (!idsRuins.length || (tentativa >= 2 && !inexistentes.length))) { bruto = v.data; ultimoBloco = bloco; break; }
        console.warn(`[cardapio ${requestId}] resposta inválida na tentativa ${tentativa}`, v.success ? `ids fora da TACO: ${idsRuins.join(',')}` : v.error.issues.slice(0, 3));
        if (tentativa >= 2) throw new ErroApp(502, 'resposta_invalida', 'A IA respondeu num formato inesperado duas vezes. Tente gerar de novo.');
        const uso = bloco.find((c) => c.type === 'tool_use');
        msgs.push({ role: 'assistant', content: bloco });
        msgs.push({ role: 'user', content: [{ type: 'tool_result', tool_use_id: uso?.id, is_error: true, content: `Resposta inválida. Use só ids da lista permitida e todos os campos. ${idsRuins.length ? 'Ids fora da lista (proibidos ou inexistentes): ' + idsRuins.join(', ') : ''}` }] });
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
      const uso = ultimoBloco.find((c) => c.type === 'tool_use');
      msgs.push({ role: 'assistant', content: ultimoBloco });
      msgs.push({ role: 'user', content: [{ type: 'tool_result', tool_use_id: uso?.id, content: `Calculado pela TACO depois de ajustar as porções: ${t0.kcal} kcal, ${t0.ptn} g proteína, ${t0.cho} g carboidrato, ${t0.lip} g gordura (desvios: proteína ${Math.round(dv.ptn * 100)}%, carboidrato ${Math.round(dv.cho * 100)}%, gordura ${Math.round(dv.lip * 100)}%). Troque ou acrescente alimentos para aproximar cada macronutriente da meta, mantendo o estilo das refeições, e registre o cardápio completo de novo.` }] });
      try {
        const { entrada: e, bloco } = await chamarClaude(msgs, ctl.signal);
        const v = Saida.safeParse(e);
        if (!v.success || v.data.refeicoes.flatMap((r) => r.itens).some((i) => !taco.get(i.taco_id))) break;
        const novo = processar(v.data);
        const melhor = (t) => Object.values(desvios(t, d.metas)).reduce((s, x) => s + Math.abs(x), 0);
        if (melhor(totais(novo.refs)) < melhor(totais(refeicoes))) { refeicoes = novo.refs; avisosTroca = novo.avisosTroca; bruto = v.data; }
        ultimoBloco = bloco;
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
