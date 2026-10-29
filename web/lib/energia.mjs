// Equações de gasto energético e recomendações por fase da vida, conferidas nas fontes originais.
// Unidades: peso em kg, altura em cm, idade em anos (decimal para bebês), resultado em kcal/dia.

export const CAF = [
  { id: 'inativo', nome: 'Sedentário (inativo)', desc: 'Só as atividades do dia a dia; NAF ~1,0 a 1,39 (adultos 1,0 a 1,52 no NASEM 2023).' },
  { id: 'pouco', nome: 'Pouco ativo', desc: 'Dia a dia + ~30 a 60 min de caminhada moderada; NAF ~1,4 a 1,59.' },
  { id: 'ativo', nome: 'Ativo', desc: 'Dia a dia + ~1 a 2 h de atividade moderada; NAF ~1,6 a 1,89.' },
  { id: 'muito', nome: 'Muito ativo', desc: 'Dia a dia + 2 h ou mais de atividade intensa; NAF ~1,9 a 2,5.' },
];
const iCAF = (id) => Math.max(0, CAF.findIndex((c) => c.id === id));

// Fatores de atividade para multiplicar a TMB (Harris-Benedict clássico e FAO/OMS 2001).
export const FATORES = [
  { v: 1.2, nome: 'Sedentário (1,2)' }, { v: 1.375, nome: 'Leve, 1 a 3x/sem (1,375)' }, { v: 1.55, nome: 'Moderado, 3 a 5x/sem (1,55)' },
  { v: 1.725, nome: 'Intenso, 6 a 7x/sem (1,725)' }, { v: 1.9, nome: 'Muito intenso, 2x/dia (1,9)' },
  { v: 1.53, nome: 'FAO/OMS leve (NAF 1,53)' }, { v: 1.76, nome: 'FAO/OMS moderado (NAF 1,76)' }, { v: 2.25, nome: 'FAO/OMS intenso (NAF 2,25)' },
];

const faixa = (idade, cortes) => cortes.findIndex((c) => idade < c);
const r0 = (n) => Math.round(n);

/* ---------- TMB ---------- */
// Henry/Oxford 2005 (Public Health Nutr 8:1133), tabelas 12, 14 e 15, kcal/dia.
const HENRY_P = { m: [[61.0, -33.7], [23.3, 514], [18.4, 581], [16.0, 545], [14.2, 593], [13.0, 567], [13.7, 481]], f: [[58.9, -23.1], [20.1, 507], [11.1, 761], [13.1, 558], [9.74, 694], [10.2, 572], [10.0, 577]] };
const HENRY_PA = { m: [[28.2, 859, -371], [15.1, 74.2, 306], [15.6, 266, 299], [14.4, 313, 113], [11.4, 541, -137], [11.4, 541, -256]], f: [[30.4, 703, -287], [15.9, 210, 349], [9.40, 249, 462], [10.4, 615, -282], [8.18, 502, -11.6], [8.52, 421, 10.7]] };
// FAO/OMS/UNU 1985 (Schofield, só peso), kcal/dia.
const FAO = { m: [[60.9, -54], [22.7, 495], [17.5, 651], [15.3, 679], [11.6, 879], [13.5, 487]], f: [[61.0, -51], [22.5, 499], [12.2, 746], [14.7, 496], [8.7, 829], [10.5, 596]] };

export function tmb(p) {
  const { sexo: s, idade: a, peso: w, altura: h } = p, m = s === 'm', mlg = p.mlg;
  const lista = [];
  const add = (id, nome, ref, kcal, nota, so) => lista.push({ id, nome, ref, kcal: r0(kcal), nota, so });
  if (a >= 10) {
    add('mifflin', 'Mifflin-St Jeor', 'Mifflin et al., Am J Clin Nutr 1990', 10 * w + 6.25 * h - 5 * a + (m ? 5 : -161), 'Mais precisa em adultos saudáveis e com sobrepeso.');
    add('hb1984', 'Harris-Benedict revisada', 'Roza & Shizgal, Am J Clin Nutr 1984', m ? 88.362 + 13.397 * w + 4.799 * h - 5.677 * a : 447.593 + 9.247 * w + 3.098 * h - 4.330 * a);
    add('hb1919', 'Harris-Benedict original', 'Harris & Benedict, 1919', m ? 66.473 + 13.7516 * w + 5.0033 * h - 6.755 * a : 655.0955 + 9.5634 * w + 1.8496 * h - 4.6756 * a, 'Tende a superestimar, sobretudo em mulheres jovens.');
  }
  const iF = faixa(a, [3, 10, 18, 30, 60, Infinity]);
  add('fao', 'FAO/OMS/UNU (só peso)', 'FAO/WHO/UNU 1985 (Schofield)', FAO[s][iF][0] * w + FAO[s][iF][1], 'Usa só o peso; serve para qualquer idade.');
  const iH = a >= 60 ? (a >= 70 ? 6 : 5) : iF;
  add('henry', 'Henry/Oxford (só peso)', 'Henry, Public Health Nutr 2005', HENRY_P[s][iH][0] * w + HENRY_P[s][iH][1], 'Base mais diversa que a FAO; tende a dar valores menores.');
  const iHa = Math.min(iF, 5), cHa = HENRY_PA[s][iHa];
  add('henry_pa', 'Henry/Oxford (peso e altura)', 'Henry, Public Health Nutr 2005', cHa[0] * w + cHa[1] * (h / 100) + cHa[2]);
  if (mlg > 0) {
    add('katch', 'Katch-McArdle', 'Katch & McArdle, 1996', 370 + 21.6 * mlg, 'Usa a massa livre de gordura; boa para quem tem composição corporal medida.', 'mlg');
    add('cunningham', 'Cunningham', 'Cunningham, Am J Clin Nutr 1980', 500 + 22 * mlg, 'Indicada para atletas e praticantes de musculação.', 'mlg');
    add('tinsley_mlg', 'Tinsley (massa livre de gordura)', 'Tinsley et al., Int J Sport Nutr 2019', 25.9 * mlg + 284, 'Validada em atletas de força.', 'mlg');
  }
  if (a >= 18) add('tinsley_p', 'Tinsley (peso)', 'Tinsley et al., Int J Sport Nutr 2019', 24.8 * w + 10, 'Validada em atletas de força; usa só o peso.');
  return lista;
}

/* ---------- Necessidade energética estimada (EER) ---------- */
// NASEM 2023 (Dietary Reference Intakes for Energy), coeficientes por categoria de atividade.
const N23_ADULTO = { m: [[753.07, -10.83, 6.50, 14.10], [581.47, -10.83, 8.30, 14.94], [1004.82, -10.83, 6.52, 15.91], [-517.88, -10.83, 15.61, 19.11]],
  f: [[584.90, -7.01, 5.72, 11.71], [575.77, -7.01, 6.60, 12.14], [710.25, -7.01, 6.54, 12.34], [511.83, -7.01, 9.07, 12.56]] };
const N23_CRIANCA = { m: [[-447.51, 3.68, 13.01, 13.15], [19.12, 3.68, 8.62, 20.28], [-388.19, 3.68, 12.66, 20.46], [-671.75, 3.68, 15.38, 23.25]],
  f: [[55.59, -22.25, 8.43, 17.07], [-297.54, -22.25, 12.77, 14.73], [-189.55, -22.25, 11.74, 18.34], [-709.59, -22.25, 18.22, 14.25]] };
const N23_GESTANTE = [[1131.20, -2.04, 0.34, 12.15], [693.35, -2.04, 5.73, 10.20], [-223.84, -2.04, 13.23, 8.15], [-779.72, -2.04, 18.45, 8.73]];
const eq = (c, a, h, w) => c[0] + c[1] * a + c[2] * h + c[3] * w;

function eer2023(p) {
  const { sexo: s, idade: a, peso: w, altura: h } = p, k = iCAF(p.caf);
  if (a < 3) {
    const base = s === 'm' ? -716.45 - 1.0 * a + 17.82 * h + 15.06 * w : -69.15 + 80.0 * a + 2.65 * h + 54.15 * w;
    const dep = s === 'm' ? [200, 50, 20, 20] : [180, 60, 20, 15];
    return { kcal: base + dep[faixa(a, [0.25, 0.5, 1, 3])], nota: 'Bebês e crianças até 3 anos: a mesma equação para qualquer nível de atividade, mais a energia de crescimento.' };
  }
  if (a < 19) {
    const dep = (s === 'm' ? [20, 15, 25, 20] : [15, 15, 30, 20])[faixa(a, [4, 9, 14, 19])];
    let kcal = eq(N23_CRIANCA[s][k], a, h, w) + dep, nota = 'Inclui a energia de crescimento da faixa etária.';
    if (p.lactante) kcal = eq(N23_CRIANCA.f[k], a, h, w) + (p.lactante.meses <= 6 ? 400 : 380), nota = 'Lactante adolescente: inclui a energia do leite menos a perda de peso do pós-parto.';
    else if (p.gestante && p.gestante.semanas >= 14) kcal = gest2023(p, k), nota = 'Gestante (2º/3º trimestre): equação própria do NASEM 2023 por semana e IMC pré-gestacional.';
    return { kcal, nota };
  }
  if (p.gestante && p.gestante.semanas >= 14) return { kcal: gest2023(p, k), nota: 'Equação de gestante do NASEM 2023 (2º e 3º trimestres), com a semana gestacional e o IMC pré-gestacional.' };
  if (p.gestante) return { kcal: eq(N23_ADULTO.f[k], a, h, w), nota: '1º trimestre: igual à não gestante (NASEM 2023).' };
  if (p.lactante) return { kcal: eq(N23_ADULTO.f[k], a, h, w) + (p.lactante.meses <= 6 ? 400 : 380), nota: p.lactante.meses <= 6 ? 'Lactação 0 a 6 meses: +540 kcal do leite −140 kcal de mobilização de reservas.' : 'Lactação 7 a 12 meses: +380 kcal.' };
  return { kcal: eq(N23_ADULTO[s][k], a, h, w), nota: 'Equações de 2023, feitas com água duplamente marcada; substituem as do IOM 2005.' };
}
function gest2023(p, k) {
  const imc = p.imcPre || p.imc;
  const c = N23_GESTANTE[k], extra = imc < 18.5 ? 300 : imc < 25 ? 200 : imc < 30 ? 150 : -50;
  return c[0] + c[1] * p.idade + c[2] * p.altura + c[3] * p.peso + 9.16 * p.gestante.semanas + extra;
}

// IOM 2005 (DRI Energy, 2002/2005). Altura em metros. Coeficientes de atividade física (CAF) por grupo.
const PA05 = { m19: [1, 1.11, 1.25, 1.48], f19: [1, 1.12, 1.27, 1.45], m3: [1, 1.13, 1.26, 1.42], f3: [1, 1.16, 1.31, 1.56],
  m19o: [1, 1.12, 1.29, 1.59], f19o: [1, 1.16, 1.27, 1.44], m3o: [1, 1.12, 1.24, 1.45], f3o: [1, 1.18, 1.35, 1.60] };
function eer2005(p) {
  const { sexo: s, idade: a, peso: w } = p, hm = p.altura / 100, k = iCAF(p.caf), m = s === 'm';
  const obeso = p.imc >= 25 && !p.gestante && !p.lactante, sobre = obeso && a >= 3;
  let kcal, nota, pa;
  if (a < 3) {
    kcal = 89 * w - 100 + [175, 56, 22, 20][faixa(a, [0.25, 0.5, 1, 3])];
    return { kcal, nota: 'Bebês e crianças até 3 anos: (89 × peso − 100) + energia de crescimento.', caf: null };
  }
  if (a < 19) {
    if (sobre) { pa = PA05[(m ? 'm' : 'f') + '3o'][k]; kcal = m ? -114.1 - 50.9 * a + pa * (19.5 * w + 1161.4 * hm) : 389.2 - 41.2 * a + pa * (15.0 * w + 701.6 * hm); nota = 'Equação de manutenção de peso para crianças e adolescentes com sobrepeso.'; }
    else { pa = PA05[(m ? 'm' : 'f') + '3'][k]; kcal = (m ? 88.5 - 61.9 * a + pa * (26.7 * w + 903 * hm) : 135.3 - 30.8 * a + pa * (10.0 * w + 934 * hm)) + (a < 9 ? 20 : 25); nota = 'Inclui a energia de crescimento (20 kcal de 3 a 8 anos; 25 kcal de 9 a 18).'; }
  } else if (sobre) { pa = PA05[(m ? 'm' : 'f') + '19o'][k]; kcal = m ? 1085.6 - 10.08 * a + pa * (13.7 * w + 416 * hm) : 447.6 - 7.95 * a + pa * (11.4 * w + 619 * hm); nota = 'Equação para adultos com IMC ≥ 25 (gasto total para manter o peso).'; }
  else { pa = PA05[(m ? 'm' : 'f') + '19'][k]; kcal = m ? 662 - 9.53 * a + pa * (15.91 * w + 539.6 * hm) : 354 - 6.91 * a + pa * (9.36 * w + 726 * hm); nota = 'Adultos com IMC 18,5 a 25.'; }
  if (p.gestante) { const t = p.gestante.semanas < 14 ? 0 : p.gestante.semanas < 28 ? 340 : 452; kcal += t; nota = `Gestante: EER da não gestante + ${t} kcal (${t === 0 ? '1º' : t === 340 ? '2º' : '3º'} trimestre).`; }
  if (p.lactante) { const l = p.lactante.meses <= 6 ? 330 : 400; kcal += l; nota = `Lactante: EER + ${l} kcal (${p.lactante.meses <= 6 ? '0 a 6 meses: +500 do leite −170 de reservas' : '7 a 12 meses: +400'}).`; }
  return { kcal, nota, caf: pa };
}

export function get(p, fa, tmbs) {
  const lista = [];
  const e23 = eer2023(p), e05 = eer2005(p);
  lista.push({ id: 'eer2023', nome: 'EER NASEM 2023', ref: 'National Academies, DRI for Energy, 2023', kcal: r0(e23.kcal), nota: e23.nota });
  lista.push({ id: 'eer2005', nome: 'EER IOM 2005 (com CAF)', ref: 'Institute of Medicine, DRI for Energy, 2005', kcal: r0(e05.kcal), nota: e05.nota + (e05.caf ? ` CAF usado: ${String(e05.caf).replace('.', ',')}.` : '') });
  for (const t of tmbs) lista.push({ id: 'tmbxfa_' + t.id, nome: `${t.nome} × FA ${String(fa).replace('.', ',')}`, ref: t.ref, kcal: r0(t.kcal * fa), nota: 'TMB multiplicada pelo fator de atividade.' });
  return lista;
}

/* ---------- antropometria ---------- */
export function antropometria(p) {
  const hm = p.altura / 100, imc = hm ? p.peso / hm ** 2 : 0, idoso = p.idade >= 60;
  let classe = '';
  if (p.idade >= 19 && imc) classe = idoso ? (imc < 22 ? 'Baixo peso' : imc <= 27 ? 'Eutrofia' : 'Sobrepeso') + ' (Lipschitz, idoso)'
    : imc < 16 ? 'Magreza grau III' : imc < 17 ? 'Magreza grau II' : imc < 18.5 ? 'Magreza grau I' : imc < 25 ? 'Eutrofia' : imc < 30 ? 'Sobrepeso' : imc < 35 ? 'Obesidade grau I' : imc < 40 ? 'Obesidade grau II' : 'Obesidade grau III';
  else if (imc) classe = 'Use as curvas de IMC por idade da OMS (escore-z)';
  const imcAlvo = p.imcAlvo || (idoso ? 24.5 : 22);
  const pesoIdeal = hm ? imcAlvo * hm ** 2 : 0;
  const pesoAjustado = pesoIdeal && p.peso > pesoIdeal ? (p.peso - pesoIdeal) * 0.25 + pesoIdeal : null;
  const mlg = p.mlg || (p.gordura ? p.peso * (1 - p.gordura / 100) : null);
  const rcq = p.cintura && p.quadril ? p.cintura / p.quadril : null, rce = p.cintura && p.altura ? p.cintura / p.altura : null;
  const riscoCintura = p.cintura ? (p.sexo === 'm' ? (p.cintura >= 102 ? 'muito aumentado' : p.cintura >= 94 ? 'aumentado' : 'normal') : (p.cintura >= 88 ? 'muito aumentado' : p.cintura >= 80 ? 'aumentado' : 'normal')) : null;
  return { imc, classe, imcAlvo, pesoIdeal, pesoAjustado, usarAjustado: imc >= 30, mlg, rcq, rce, riscoCintura,
    riscoRcq: rcq ? (rcq > (p.sexo === 'm' ? 0.90 : 0.85) ? 'aumentado' : 'normal') : null, riscoRce: rce ? (rce >= 0.5 ? 'aumentado' : 'normal') : null };
}

// Ganho de peso recomendado na gestação por IMC pré-gestacional (IOM 2009), kg no total e kg/semana no 2º e 3º trimestres.
export function ganhoGestacional(imcPre) {
  if (!imcPre) return null;
  return imcPre < 18.5 ? { total: [12.5, 18], semana: [0.44, 0.58] } : imcPre < 25 ? { total: [11.5, 16], semana: [0.35, 0.50] }
    : imcPre < 30 ? { total: [7, 11.5], semana: [0.23, 0.33] } : { total: [5, 9], semana: [0.17, 0.27] };
}

/* ---------- esporte ---------- */
// Compendium of Physical Activities (Ainsworth et al., 2011): MET de atividades comuns.
export const ATIVIDADES = [
  ['Musculação, moderada', 3.5], ['Musculação, vigorosa', 6.0], ['Treino funcional ou crossfit, vigoroso', 8.0], ['Calistenia/HIIT, vigoroso', 8.0],
  ['Caminhada, 5 km/h', 3.5], ['Caminhada rápida, 6,4 km/h', 5.0], ['Corrida, 8 km/h', 8.3], ['Corrida, 9,7 km/h', 9.8], ['Corrida, 11,3 km/h', 11.0], ['Corrida, 12,9 km/h', 11.8],
  ['Bicicleta, passeio (< 16 km/h)', 4.0], ['Bicicleta, 16 a 19 km/h', 6.8], ['Bicicleta, 19 a 22 km/h', 8.0], ['Spinning, vigoroso', 8.5], ['Elíptico, moderado', 5.0], ['Remo ergômetro, moderado', 7.0],
  ['Natação, crawl leve/moderado', 5.8], ['Natação, crawl vigoroso', 9.8], ['Hidroginástica', 5.5], ['Dança aeróbica/zumba', 7.3], ['Yoga', 2.5], ['Pilates', 3.0],
  ['Futebol, recreativo', 7.0], ['Futebol, competitivo', 10.0], ['Futsal/society', 8.0], ['Vôlei, recreativo', 4.0], ['Vôlei de praia', 8.0], ['Basquete', 6.5], ['Tênis', 7.3],
  ['Artes marciais (jiu-jitsu, judô, karatê)', 10.3], ['Boxe, saco de pancada', 5.5], ['Boxe, luta/sparring', 7.8],
].map(([nome, met]) => ({ nome, met }));
// Gasto líquido do treino, em média por dia: (MET − 1) × peso × horas por semana ÷ 7.
export const gastoTreino = (met, peso, horasSemana) => r0(((met - 1) * peso * horasSemana) / 7);

// Proteína (g/kg/dia) e carboidrato (g/kg/dia) de referência por perfil.
export function recomendacoes(p) {
  const a = p.idade, out = { proteina: null, carboidrato: null, fontes: [] };
  if (p.atleta) {
    out.proteina = p.objetivo === 'perda' ? { min: 2.3, max: 3.1, base: 'mlg', texto: '2,3 a 3,1 g/kg de massa magra em déficit (Helms et al., 2014)' } : { min: 1.4, max: 2.0, texto: '1,4 a 2,0 g/kg (ISSN, 2017); hipertrofia até 2,2 g/kg' };
    const h = p.horasTreinoDia || 0;
    out.carboidrato = h >= 4 ? { min: 8, max: 12, texto: 'Volume muito alto (≥ 4 h/dia): 8 a 12 g/kg' } : h >= 1 ? { min: 6, max: 10, texto: 'Volume alto (1 a 3 h/dia): 6 a 10 g/kg' }
      : h >= 0.75 ? { min: 5, max: 7, texto: 'Moderado (~1 h/dia): 5 a 7 g/kg' } : { min: 3, max: 5, texto: 'Leve/técnico: 3 a 5 g/kg' };
    out.fontes.push('Thomas, Erdman & Burke, ACSM/AND/DC 2016', 'Jäger et al., ISSN 2017');
  } else if (p.gestante && p.gestante.semanas >= 14) out.proteina = { min: 1.1, max: 1.1, texto: '1,1 g/kg (RDA gestação, 2º e 3º trimestres; +25 g/dia)' };
  else if (p.lactante) out.proteina = { min: 1.3, max: 1.3, texto: '1,3 g/kg (RDA lactação)' };
  else if (a >= 65) out.proteina = { min: 1.0, max: 1.2, texto: '1,0 a 1,2 g/kg (PROT-AGE/ESPEN para idosos)' };
  else if (a < 19) { const v = a < 1 ? 1.2 : a < 4 ? 1.05 : a < 14 ? 0.95 : 0.85; out.proteina = { min: v, max: v, texto: `${String(v).replace('.', ',')} g/kg (RDA da faixa etária)` }; }
  else out.proteina = { min: 0.8, max: 0.8, texto: '0,8 g/kg (RDA adulto saudável); ajuste ao objetivo' };
  return out;
}

// Taxa de perda/ganho semanal a partir do déficit/superávit (7.700 kcal ≈ 1 kg).
export const ritmoSemanal = (kcalDia) => (kcalDia * 7) / 7700;

// Água (ml/dia): 35 ml/kg adulto, 30 ml/kg idoso; Holliday-Segar até 18 anos.
export function agua(p) {
  if (p.idade < 19) { const w = p.peso; return r0(w <= 10 ? 100 * w : w <= 20 ? 1000 + 50 * (w - 10) : 1500 + 20 * (w - 20)); }
  return r0(p.peso * (p.idade >= 65 ? 30 : 35)) + (p.gestante ? 300 : 0) + (p.lactante ? 700 : 0);
}

/* ---------- tudo junto ---------- */
// Escolhe a equação mais indicada para o perfil e explica o porquê.
export function avaliar(p) {
  const ant = antropometria(p);
  const q = { ...p, imc: ant.imc, mlg: ant.mlg };
  // EER (2005 e 2023), Henry, FAO e Tinsley foram feitas com o peso real, inclusive em obesidade.
  // Na obesidade (IMC ≥ 30), Harris-Benedict e Mifflin ganham também a versão com peso ajustado.
  const tmbs = tmb(q);
  if (ant.usarAjustado && ant.pesoAjustado) {
    const aj = tmb({ ...q, peso: ant.pesoAjustado, mlg: null }).filter((t) => ['mifflin', 'hb1984', 'hb1919'].includes(t.id));
    tmbs.push(...aj.map((t) => ({ ...t, id: t.id + '_aj', nome: t.nome + ' (peso ajustado)', nota: `Com peso ajustado de ${String(Math.round(ant.pesoAjustado * 10) / 10).replace('.', ',')} kg, como se usa em obesidade.` })));
  }
  const pesoCalc = p.peso, qc = q;
  const gets = get(q, p.fa || 1.55, tmbs);
  let recomendada, motivo;
  if (p.idade < 19 || p.gestante || p.lactante) { recomendada = 'eer2023'; motivo = p.gestante ? 'Gestante: EER com semana gestacional (NASEM 2023).' : p.lactante ? 'Lactante: EER com o custo da lactação (NASEM 2023).' : 'Crianças e adolescentes: EER com energia de crescimento.'; }
  else if (p.atleta && ant.mlg) { recomendada = 'tmbxfa_cunningham'; motivo = 'Atleta com massa magra conhecida: Cunningham × fator de atividade.'; }
  else if (p.atleta) { recomendada = 'tmbxfa_tinsley_p'; motivo = 'Atleta sem composição corporal: Tinsley (peso) × fator de atividade.'; }
  else { recomendada = 'eer2023'; motivo = 'Adulto: EER NASEM 2023, a referência mais atual (água duplamente marcada).'; }
  return { ...ant, pesoCalc, tmbs, gets, recomendada, motivo, agua: agua(qc), rec: recomendacoes(q), ganhoGestacional: p.gestante ? ganhoGestacional(p.imcPre) : null };
}

// Suplementos com evidência forte e doses de referência (para o campo Suplementos da etapa Liberar).
export const SUPLEMENTOS_REF = [
  { produto: 'Creatina monoidratada', dose: '3 a 5 g/dia', horario: 'qualquer horário, todo dia', obs: 'ISSN 2017; sem necessidade de saturação' },
  { produto: 'Cafeína', dose: '3 a 6 mg/kg', horario: '60 min antes do treino', obs: 'ISSN 2021; evitar à noite e na gestação acima de 200 mg/dia' },
  { produto: 'Beta-alanina', dose: '3,2 a 6,4 g/dia', horario: 'fracionar em doses de 1,6 g', obs: 'ISSN 2015; formigamento é esperado' },
  { produto: 'Bicarbonato de sódio', dose: '0,2 a 0,3 g/kg', horario: '60 a 180 min antes', obs: 'ISSN 2021; testar em treino (desconforto gástrico)' },
  { produto: 'Whey protein', dose: 'para completar a meta de proteína', horario: 'pós-treino ou entre refeições', obs: '20 a 40 g por dose (ISSN 2017)' },
  { produto: 'Ácido fólico', dose: '400 µg/dia', horario: 'qualquer horário', obs: 'Mulheres que podem engravidar e 1º trimestre (DRI/MS)' },
  { produto: 'Sulfato ferroso (ferro elementar)', dose: '40 mg/dia', horario: 'longe de leite e café', obs: 'Gestantes, conforme Ministério da Saúde; ajustar por exame' },
  { produto: 'Vitamina D3', dose: 'conforme exame (25-OH-D)', horario: 'junto da maior refeição', obs: 'Não ultrapassar o UL (100 µg = 4.000 UI/dia) sem acompanhamento' },
  { produto: 'Ômega-3 (EPA + DHA)', dose: '1 a 2 g/dia', horario: 'junto de refeição', obs: 'Gestação: ao menos 200 mg/dia de DHA' },
  { produto: 'Vitamina B12', dose: 'conforme exame', horario: 'qualquer horário', obs: 'Veganos e idosos acima de 50 anos' },
];
