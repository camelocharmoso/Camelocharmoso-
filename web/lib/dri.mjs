// Dietary Reference Intakes (Food and Nutrition Board / NASEM): RDA ou AI e UL por fase da vida.
// Fonte: tabelas-resumo das DRIs (1997–2011); sódio e potássio pela revisão de 2019 (com CDRR do sódio).
// As chaves dos nutrientes são as mesmas dos alimentos (lib/nutri.mjs e data/*.json).

export const GRUPOS = ['0–6 meses', '7–12 meses', '1–3 anos', '4–8 anos',
  'Homem 9–13', 'Homem 14–18', 'Homem 19–30', 'Homem 31–50', 'Homem 51–70', 'Homem > 70',
  'Mulher 9–13', 'Mulher 14–18', 'Mulher 19–30', 'Mulher 31–50', 'Mulher 51–70', 'Mulher > 70',
  'Gestante 14–18', 'Gestante 19–30', 'Gestante 31–50', 'Lactante 14–18', 'Lactante 19–30', 'Lactante 31–50'];

export function grupo({ sexo, idade, gestante, lactante }) {
  if (idade < 0.5) return 0;
  if (idade < 1) return 1;
  if (idade < 4) return 2;
  if (idade < 9) return 3;
  if (gestante && idade >= 14) return idade < 19 ? 16 : idade < 31 ? 17 : 18;
  if (lactante && idade >= 14) return idade < 19 ? 19 : idade < 31 ? 20 : 21;
  const b = sexo === 'm' ? 4 : 10;
  return b + (idade < 14 ? 0 : idade < 19 ? 1 : idade < 31 ? 2 : idade < 51 ? 3 : idade < 71 ? 4 : 5);
}

// [nome, unidade, valores RDA/AI nos 22 grupos, índices que são AI (true = todos), UL nos 22 grupos ou null, nota do UL]
const A = true;
const T = {
  vita: ['Vitamina A', 'µg RAE', [400, 500, 300, 400, 600, 900, 900, 900, 900, 900, 600, 700, 700, 700, 700, 700, 750, 770, 770, 1200, 1300, 1300], [0, 1],
    [600, 600, 600, 900, 1700, 2800, 3000, 3000, 3000, 3000, 1700, 2800, 3000, 3000, 3000, 3000, 2800, 3000, 3000, 2800, 3000, 3000], 'UL só para vitamina A pré-formada (retinol).'],
  vitc: ['Vitamina C', 'mg', [40, 50, 15, 25, 45, 75, 90, 90, 90, 90, 45, 65, 75, 75, 75, 75, 80, 85, 85, 115, 120, 120], [0, 1],
    [null, null, 400, 650, 1200, 1800, 2000, 2000, 2000, 2000, 1200, 1800, 2000, 2000, 2000, 2000, 1800, 2000, 2000, 1800, 2000, 2000]],
  vitd: ['Vitamina D', 'µg', [10, 10, 15, 15, 15, 15, 15, 15, 15, 20, 15, 15, 15, 15, 15, 20, 15, 15, 15, 15, 15, 15], [0, 1],
    [25, 38, 63, 75, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], '1 µg = 40 UI; supõe pouca exposição ao sol.'],
  vite: ['Vitamina E', 'mg', [4, 5, 6, 7, 11, 15, 15, 15, 15, 15, 11, 15, 15, 15, 15, 15, 15, 15, 15, 19, 19, 19], [0, 1],
    [null, null, 200, 300, 600, 800, 1000, 1000, 1000, 1000, 600, 800, 1000, 1000, 1000, 1000, 800, 1000, 1000, 800, 1000, 1000], 'UL só para suplementos e alimentos fortificados.'],
  vitk: ['Vitamina K', 'µg', [2.0, 2.5, 30, 55, 60, 75, 120, 120, 120, 120, 60, 75, 90, 90, 90, 90, 75, 90, 90, 75, 90, 90], A, null],
  b1: ['Tiamina (B1)', 'mg', [0.2, 0.3, 0.5, 0.6, 0.9, 1.2, 1.2, 1.2, 1.2, 1.2, 0.9, 1.0, 1.1, 1.1, 1.1, 1.1, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4], [0, 1], null],
  b2: ['Riboflavina (B2)', 'mg', [0.3, 0.4, 0.5, 0.6, 0.9, 1.3, 1.3, 1.3, 1.3, 1.3, 0.9, 1.0, 1.1, 1.1, 1.1, 1.1, 1.4, 1.4, 1.4, 1.6, 1.6, 1.6], [0, 1], null],
  b3: ['Niacina (B3)', 'mg', [2, 4, 6, 8, 12, 16, 16, 16, 16, 16, 12, 14, 14, 14, 14, 14, 18, 18, 18, 17, 17, 17], [0, 1],
    [null, null, 10, 15, 20, 30, 35, 35, 35, 35, 20, 30, 35, 35, 35, 35, 30, 35, 35, 30, 35, 35], 'UL só para formas sintéticas (suplementos e fortificados).'],
  b6: ['Vitamina B6', 'mg', [0.1, 0.3, 0.5, 0.6, 1.0, 1.3, 1.3, 1.3, 1.7, 1.7, 1.0, 1.2, 1.3, 1.3, 1.5, 1.5, 1.9, 1.9, 1.9, 2.0, 2.0, 2.0], [0, 1],
    [null, null, 30, 40, 60, 80, 100, 100, 100, 100, 60, 80, 100, 100, 100, 100, 80, 100, 100, 80, 100, 100]],
  b9: ['Folato', 'µg DFE', [65, 80, 150, 200, 300, 400, 400, 400, 400, 400, 300, 400, 400, 400, 400, 400, 600, 600, 600, 500, 500, 500], [0, 1],
    [null, null, 300, 400, 600, 800, 1000, 1000, 1000, 1000, 600, 800, 1000, 1000, 1000, 1000, 800, 1000, 1000, 800, 1000, 1000], 'UL só para ácido fólico sintético. Mulheres que podem engravidar: +400 µg de ácido fólico.'],
  b12: ['Vitamina B12', 'µg', [0.4, 0.5, 0.9, 1.2, 1.8, 2.4, 2.4, 2.4, 2.4, 2.4, 1.8, 2.4, 2.4, 2.4, 2.4, 2.4, 2.6, 2.6, 2.6, 2.8, 2.8, 2.8], [0, 1], null, 'Acima de 50 anos, prefira fontes fortificadas ou suplemento (absorção menor).'],
  ca: ['Cálcio', 'mg', [200, 260, 700, 1000, 1300, 1300, 1000, 1000, 1000, 1200, 1300, 1300, 1000, 1000, 1200, 1200, 1300, 1000, 1000, 1300, 1000, 1000], [0, 1],
    [1000, 1500, 2500, 2500, 3000, 3000, 2500, 2500, 2000, 2000, 3000, 3000, 2500, 2500, 2000, 2000, 3000, 2500, 2500, 3000, 2500, 2500]],
  fe: ['Ferro', 'mg', [0.27, 11, 7, 10, 8, 11, 8, 8, 8, 8, 8, 15, 18, 18, 8, 8, 27, 27, 27, 10, 9, 9], [0],
    [40, 40, 40, 40, 40, 45, 45, 45, 45, 45, 40, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45], 'Vegetarianos: necessidade 1,8 vez maior (menor biodisponibilidade).'],
  mg: ['Magnésio', 'mg', [30, 75, 80, 130, 240, 410, 400, 420, 420, 420, 240, 360, 310, 320, 320, 320, 400, 350, 360, 360, 310, 320], [0, 1], null, 'UL de 350 mg vale só para magnésio de suplementos/medicamentos.'],
  p: ['Fósforo', 'mg', [100, 275, 460, 500, 1250, 1250, 700, 700, 700, 700, 1250, 1250, 700, 700, 700, 700, 1250, 700, 700, 1250, 700, 700], [0, 1],
    [null, null, 3000, 3000, 4000, 4000, 4000, 4000, 4000, 3000, 4000, 4000, 4000, 4000, 4000, 3000, 3500, 3500, 3500, 4000, 4000, 4000]],
  zn: ['Zinco', 'mg', [2, 3, 3, 5, 8, 11, 11, 11, 11, 11, 8, 9, 8, 8, 8, 8, 12, 11, 11, 13, 12, 12], [0],
    [4, 5, 7, 12, 23, 34, 40, 40, 40, 40, 23, 34, 40, 40, 40, 40, 34, 40, 40, 34, 40, 40]],
  cu: ['Cobre', 'mg', [0.2, 0.22, 0.34, 0.44, 0.7, 0.89, 0.9, 0.9, 0.9, 0.9, 0.7, 0.89, 0.9, 0.9, 0.9, 0.9, 1.0, 1.0, 1.0, 1.3, 1.3, 1.3], [0, 1],
    [null, null, 1, 3, 5, 8, 10, 10, 10, 10, 5, 8, 10, 10, 10, 10, 8, 10, 10, 8, 10, 10]],
  mn: ['Manganês', 'mg', [0.003, 0.6, 1.2, 1.5, 1.9, 2.2, 2.3, 2.3, 2.3, 2.3, 1.6, 1.6, 1.8, 1.8, 1.8, 1.8, 2.0, 2.0, 2.0, 2.6, 2.6, 2.6], A,
    [null, null, 2, 3, 6, 9, 11, 11, 11, 11, 6, 9, 11, 11, 11, 11, 9, 11, 11, 9, 11, 11]],
  se: ['Selênio', 'µg', [15, 20, 20, 30, 40, 55, 55, 55, 55, 55, 40, 55, 55, 55, 55, 55, 60, 60, 60, 70, 70, 70], [0, 1],
    [45, 60, 90, 150, 280, 400, 400, 400, 400, 400, 280, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400]],
  k: ['Potássio', 'mg', [400, 860, 2000, 2300, 2500, 3000, 3400, 3400, 3400, 3400, 2300, 2300, 2600, 2600, 2600, 2600, 2600, 2900, 2900, 2500, 2800, 2800], A, null, 'AI da revisão de 2019.'],
  na: ['Sódio', 'mg', [110, 370, 800, 1000, 1200, 1500, 1500, 1500, 1500, 1500, 1200, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500], A,
    [null, null, 1200, 1500, 1800, 2300, 2300, 2300, 2300, 2300, 1800, 2300, 2300, 2300, 2300, 2300, 2300, 2300, 2300, 2300, 2300, 2300], 'Limite = CDRR de 2019 (reduzir abaixo disso diminui o risco cardiovascular).'],
  fib: ['Fibra', 'g', [null, null, 19, 25, 31, 38, 38, 38, 30, 30, 26, 26, 25, 25, 21, 21, 28, 28, 28, 29, 29, 29], A, null, 'Equivale a 14 g por 1.000 kcal.'],
};
// Água total (alimentos + bebidas), proteína e carboidrato de referência (g/dia).
const AGUA = [0.7, 0.8, 1.3, 1.7, 2.4, 3.3, 3.7, 3.7, 3.7, 3.7, 2.1, 2.3, 2.7, 2.7, 2.7, 2.7, 3.0, 3.0, 3.0, 3.8, 3.8, 3.8];
const PTN = [9.1, 11, 13, 19, 34, 52, 56, 56, 56, 56, 34, 46, 46, 46, 46, 46, 71, 71, 71, 71, 71, 71];
const CHO = [60, 95, 130, 130, 130, 130, 130, 130, 130, 130, 130, 130, 130, 130, 130, 130, 175, 175, 175, 210, 210, 210];

export function referencias(perfil) {
  const g = grupo(perfil);
  const micros = Object.entries(T).map(([k, [nome, un, v, ai, ul, nota]]) => ({
    k, nome, un, meta: v[g], tipo: ai === true || ai.includes(g) ? 'AI' : 'RDA', ul: ul ? ul[g] : null, nota: nota || '',
  })).filter((m) => m.meta != null);
  const amdr = perfil.idade < 4 ? { ptn: [5, 20], cho: [45, 65], lip: [30, 40] } : perfil.idade < 19 ? { ptn: [10, 30], cho: [45, 65], lip: [25, 35] } : { ptn: [10, 35], cho: [45, 65], lip: [20, 35] };
  return { grupo: GRUPOS[g], micros, agua: AGUA[g], ptn: PTN[g], cho: CHO[g], amdr,
    limites: { acucarLivre: 'menos de 10% da energia (OMS; ideal < 5%)', saturada: 'menos de 10% da energia' } };
}

// Compara o total do dia com as DRIs: % da meta e alerta de UL.
export function adequacao(totais, perfil) {
  const ref = referencias(perfil);
  return ref.micros.map((m) => {
    const v = totais[m.k];
    if (v == null) return { ...m, valor: null };
    return { ...m, valor: v, pct: m.meta ? Math.round((v / m.meta) * 100) : null, acimaUL: m.ul != null && v > m.ul };
  });
}
