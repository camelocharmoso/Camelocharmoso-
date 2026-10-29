// Anamnese nutricional: seções e campos da ficha (fora os campos de cálculo, que ficam no index.html).
// tipo: texto | num | sel | multi | area | data | hora ; w: largura em colunas (1, 2, 3 ou 6); so: só aparece para 'f' (mulher)
const op = (...xs) => xs.map((x) => (Array.isArray(x) ? x : [x, x]));
const FREQ = op(['', '—'], 'Nunca', 'Raramente', '1 a 3x/semana', '4 a 6x/semana', 'Todo dia', 'Mais de 1x/dia');

export const SECOES = [
  { id: 'rotina', titulo: 'Rotina', campos: [
    { k: 'profissao', rot: 'Profissão', w: 3 },
    { k: 'trabalho', rot: 'Horário de trabalho/estudo', ph: 'Ex.: 9h às 18h, seg a sex', w: 3 },
    { k: 'acorda', rot: 'Acorda às', tipo: 'hora' }, { k: 'dorme', rot: 'Dorme às', tipo: 'hora' },
    { k: 'sonoQual', rot: 'Qualidade do sono', tipo: 'sel', op: op(['', '—'], 'Boa', 'Regular', 'Ruim', 'Insônia') },
    { k: 'ondeCome', rot: 'Onde faz as refeições', tipo: 'multi', w: 6, op: op('Em casa', 'Marmita', 'Restaurante/self-service', 'Lanchonete', 'Delivery', 'Refeitório da empresa', 'Escola') },
    { k: 'quemCozinha', rot: 'Quem prepara a comida', tipo: 'sel', op: op(['', '—'], 'O próprio paciente', 'Familiar', 'Funcionária', 'Compra pronta') },
    { k: 'orcamento', rot: 'Orçamento para alimentação', tipo: 'sel', op: op(['', '—'], 'Apertado', 'Médio', 'Confortável') },
    { k: 'moraCom', rot: 'Mora com', ph: 'Ex.: marido e 2 filhos', w: 2 },
  ] },
  { id: 'objetivo', titulo: 'Objetivo e motivo da consulta', campos: [
    { k: 'motivo', rot: 'Motivo da consulta', tipo: 'area', w: 6, ph: 'Nas palavras do paciente' },
    { k: 'pesoDesejado', rot: 'Peso desejado (kg)', tipo: 'num', step: 0.1 },
    { k: 'prazo', rot: 'Prazo desejado', ph: 'Ex.: 6 meses', w: 2 },
    { k: 'tentativas', rot: 'Dietas/tratamentos anteriores', tipo: 'area', w: 6 },
    { k: 'pesoHistorico', rot: 'Peso máximo e mínimo na vida adulta', ph: 'Ex.: máx. 82 kg (2020), mín. 58 kg', w: 3 },
    { k: 'perdaRecente', rot: 'Mudou de peso sem querer nos últimos 6 meses?', tipo: 'sel', w: 3, op: op(['', '—'], 'Não', 'Perdeu até 5%', 'Perdeu mais de 5%', 'Ganhou peso') },
  ] },
  { id: 'treino', titulo: 'Atividade física', campos: [
    { k: 'treinoVezes', rot: 'Vezes por semana', tipo: 'num', min: 0, max: 14 },
    { k: 'treinoMin', rot: 'Minutos por sessão', tipo: 'num', min: 0, max: 600 },
    { k: 'treinoInt', rot: 'Intensidade', tipo: 'sel', op: op(['', '—'], 'Leve', 'Moderada', 'Intensa', 'Muito intensa') },
    { k: 'treinoHora', rot: 'Horário do treino', tipo: 'hora' },
    { k: 'treino2', rot: 'Outras atividades', ph: 'Ex.: futebol aos sábados', w: 2 },
    { k: 'objEsporte', rot: 'Objetivo no esporte', tipo: 'sel', op: op(['', '—'], 'Saúde', 'Estética', 'Hipertrofia', 'Desempenho', 'Competição') },
    { k: 'competicao', rot: 'Próxima competição/prova', ph: 'Ex.: meia maratona em março', w: 2 },
    { k: 'passos', rot: 'Passos por dia (se souber)', tipo: 'num' },
  ] },
  { id: 'mulher', titulo: 'Saúde da mulher', so: 'f', campos: [
    { k: 'ciclo', rot: 'Ciclo menstrual', tipo: 'sel', op: op(['', '—'], 'Regular', 'Irregular', 'Ausente (amenorreia)', 'Menopausa', 'Usa anticoncepcional contínuo') },
    { k: 'dum', rot: 'Data da última menstruação', tipo: 'data' },
    { k: 'gestacoes', rot: 'Gestações anteriores', tipo: 'num', min: 0 },
    { k: 'gestInter', rot: 'Na gestação atual', tipo: 'multi', w: 6, op: op('Náuseas/vômitos', 'Azia', 'Prisão de ventre', 'Diabetes gestacional', 'Hipertensão/pré-eclâmpsia', 'Anemia', 'Desejos/aversões', 'Gestação gemelar') },
    { k: 'tpm', rot: 'Sintomas na TPM', ph: 'Ex.: compulsão por doce, inchaço', w: 3 },
  ] },
  { id: 'saude', titulo: 'Saúde', campos: [
    { k: 'doencas', rot: 'Doenças e condições', tipo: 'multi', w: 6, op: op('Diabetes tipo 1', 'Diabetes tipo 2', 'Pré-diabetes/resistência à insulina', 'Hipertensão', 'Colesterol/triglicerídeos altos', 'Hipotireoidismo', 'Hipertireoidismo', 'SOP', 'Gordura no fígado', 'Doença renal', 'Gastrite/refluxo', 'Intestino irritável', 'Doença celíaca', 'Doença inflamatória intestinal', 'Anemia', 'Osteoporose', 'Ansiedade/depressão', 'Câncer', 'Cirurgia bariátrica', 'Doença cardíaca') },
    { k: 'doencasOutras', rot: 'Outras doenças, cirurgias e internações', tipo: 'area', w: 6 },
    { k: 'medicamentos', rot: 'Medicamentos em uso (nome, dose, horário)', tipo: 'area', w: 6, ph: 'Inclua anticoncepcional, remédio para emagrecer, insulina' },
    { k: 'suplementosUso', rot: 'Suplementos que já usa', w: 6 },
    { k: 'familia', rot: 'Histórico familiar', tipo: 'multi', w: 6, op: op('Diabetes', 'Hipertensão', 'Infarto/AVC', 'Colesterol alto', 'Obesidade', 'Câncer', 'Doença renal', 'Osteoporose') },
    { k: 'bristol', rot: 'Fezes (escala de Bristol)', tipo: 'sel', w: 3, op: op(['', '—'], ['1', '1 – bolinhas duras separadas'], ['2', '2 – salsicha com caroços'], ['3', '3 – salsicha com rachaduras'], ['4', '4 – salsicha lisa e macia (ideal)'], ['5', '5 – pedaços macios'], ['6', '6 – pastosas'], ['7', '7 – líquidas']) },
    { k: 'evacuacao', rot: 'Evacua', tipo: 'sel', op: op(['', '—'], 'Mais de 1x/dia', 'Todo dia', 'Dia sim, dia não', '2x/semana ou menos') },
    { k: 'sintomasGI', rot: 'Sintomas digestivos', tipo: 'multi', w: 6, op: op('Gases', 'Estufamento', 'Azia', 'Náusea', 'Diarreia', 'Prisão de ventre', 'Dor abdominal') },
    { k: 'agua', rot: 'Água por dia (litros)', tipo: 'num', step: 0.1 },
    { k: 'urina', rot: 'Cor da urina', tipo: 'sel', op: op(['', '—'], 'Clara', 'Amarelo-claro', 'Amarelo-escuro', 'Escura') },
    { k: 'estresse', rot: 'Estresse (1 a 5)', tipo: 'sel', op: op(['', '—'], '1', '2', '3', '4', '5') },
    { k: 'alcool', rot: 'Bebida alcoólica', tipo: 'sel', op: op(['', '—'], 'Não bebe', 'Socialmente (1 a 2x/mês)', 'Fins de semana', 'Várias vezes por semana', 'Todo dia') },
    { k: 'tabaco', rot: 'Cigarro/vape', tipo: 'sel', op: op(['', '—'], 'Não', 'Sim', 'Ex-fumante') },
    { k: 'pressao', rot: 'Pressão arterial', ph: 'Ex.: 12x8', w: 1 },
  ] },
  { id: 'exames', titulo: 'Exames laboratoriais', exames: true, campos: [{ k: 'examesData', rot: 'Data dos exames', tipo: 'data' }] },
  { id: 'habitos', titulo: 'Hábitos alimentares', campos: [
    { k: 'recordatorio', rot: 'Recordatório de 24 horas (o que comeu ontem, com horário e quantidade)', tipo: 'area', w: 6, linhas: 6, ph: '07:00 – 1 pão francês com manteiga, café com 2 colheres de açúcar\n10:00 – …' },
    { k: 'gosta', rot: 'Alimentos de que mais gosta', w: 6 },
    { k: 'apetite', rot: 'Apetite', tipo: 'sel', op: op(['', '—'], 'Pouco', 'Normal', 'Muito') },
    { k: 'fomeHora', rot: 'Horário de mais fome', tipo: 'hora' },
    { k: 'mastigacao', rot: 'Mastigação', tipo: 'sel', op: op(['', '—'], 'Rápida', 'Normal', 'Lenta', 'Dificuldade para mastigar') },
    { k: 'comportamento', rot: 'Comportamento', tipo: 'multi', w: 6, op: op('Belisca entre as refeições', 'Pula refeições', 'Come vendo TV/celular', 'Come rápido', 'Come escondido', 'Episódios de compulsão', 'Come por ansiedade', 'Acorda à noite para comer', 'Restringe muito e depois exagera') },
    { k: 'fFrutas', rot: 'Frutas', tipo: 'sel', op: FREQ }, { k: 'fVerduras', rot: 'Verduras e legumes', tipo: 'sel', op: FREQ },
    { k: 'fLeguminosas', rot: 'Feijão e leguminosas', tipo: 'sel', op: FREQ }, { k: 'fCarnes', rot: 'Carnes e ovos', tipo: 'sel', op: FREQ },
    { k: 'fLaticinios', rot: 'Leite e derivados', tipo: 'sel', op: FREQ }, { k: 'fIntegrais', rot: 'Cereais integrais', tipo: 'sel', op: FREQ },
    { k: 'fDoces', rot: 'Doces', tipo: 'sel', op: FREQ }, { k: 'fUltra', rot: 'Ultraprocessados (biscoito, salgadinho, embutido)', tipo: 'sel', op: FREQ },
    { k: 'fFrituras', rot: 'Frituras', tipo: 'sel', op: FREQ }, { k: 'fRefri', rot: 'Refrigerante/suco de caixinha', tipo: 'sel', op: FREQ },
    { k: 'fCafe', rot: 'Café', tipo: 'sel', op: FREQ }, { k: 'acucarCafe', rot: 'Adoça o café com', tipo: 'sel', op: op(['', '—'], 'Nada', 'Açúcar', 'Adoçante', 'Mel') },
    { k: 'oleoMes', rot: 'Óleo por mês na casa', ph: 'Ex.: 1 garrafa para 3 pessoas', w: 2 },
  ] },
  { id: 'antropo', titulo: 'Antropometria e composição corporal', campos: [
    { k: 'abdomen', rot: 'Abdômen (cm)', tipo: 'num', step: 0.1 }, { k: 'braco', rot: 'Braço (cm)', tipo: 'num', step: 0.1 },
    { k: 'panturrilha', rot: 'Panturrilha (cm)', tipo: 'num', step: 0.1 }, { k: 'pescoco', rot: 'Pescoço (cm)', tipo: 'num', step: 0.1 },
    { k: 'coxa', rot: 'Coxa (cm)', tipo: 'num', step: 0.1 },
    { k: 'massaMuscular', rot: 'Massa muscular (kg)', tipo: 'num', step: 0.1 },
    { k: 'gorduraVisceral', rot: 'Gordura visceral (nível)', tipo: 'num' },
    { k: 'metodoComp', rot: 'Método da composição', tipo: 'sel', op: op(['', '—'], 'Bioimpedância', 'Dobras cutâneas', 'DEXA', 'Estimado') },
    { k: 'dobras', rot: 'Dobras (mm): tríceps, subescapular, supra-ilíaca, abdominal, coxa', w: 6, ph: 'Ex.: 18, 15, 20, 25, 30' },
  ] },
  { id: 'risco', titulo: 'Rastreio de transtorno alimentar (SCOFF)', campos: [
    { k: 'scoff1', rot: 'Provoca vômito porque se sente desconfortavelmente cheio(a)?', tipo: 'sel', w: 6, op: op(['', '—'], 'Não', 'Sim') },
    { k: 'scoff2', rot: 'Sente que perdeu o controle sobre o quanto come?', tipo: 'sel', w: 6, op: op(['', '—'], 'Não', 'Sim') },
    { k: 'scoff3', rot: 'Perdeu mais de 6 kg em 3 meses?', tipo: 'sel', w: 6, op: op(['', '—'], 'Não', 'Sim') },
    { k: 'scoff4', rot: 'Acha que está gordo(a) quando os outros dizem que está magro(a)?', tipo: 'sel', w: 6, op: op(['', '—'], 'Não', 'Sim') },
    { k: 'scoff5', rot: 'Diria que a comida domina a sua vida?', tipo: 'sel', w: 6, op: op(['', '—'], 'Não', 'Sim') },
  ] },
];

// Valores usuais em adultos (confira sempre a referência do laboratório do paciente).
export const EXAMES = [
  { k: 'glicemia', rot: 'Glicemia de jejum', un: 'mg/dL', max: 99, min: 70, nota: '100–125 pré-diabetes; ≥ 126 diabetes (SBD)' },
  { k: 'hba1c', rot: 'Hemoglobina glicada', un: '%', max: 5.6, nota: '5,7–6,4 pré-diabetes; ≥ 6,5 diabetes' },
  { k: 'insulina', rot: 'Insulina de jejum', un: 'µUI/mL', max: 25, min: 2 },
  { k: 'colTotal', rot: 'Colesterol total', un: 'mg/dL', max: 189, nota: '< 190 desejável (SBC 2017)' },
  { k: 'ldl', rot: 'LDL', un: 'mg/dL', max: 129, nota: 'meta depende do risco cardiovascular' },
  { k: 'hdl', rot: 'HDL', un: 'mg/dL', min: 40, nota: '> 40 desejável' },
  { k: 'trig', rot: 'Triglicerídeos', un: 'mg/dL', max: 149, nota: '< 150 em jejum' },
  { k: 'tsh', rot: 'TSH', un: 'mUI/L', min: 0.4, max: 4.5 },
  { k: 'vitD', rot: 'Vitamina D (25-OH)', un: 'ng/mL', min: 20, nota: '≥ 20 população geral; 30–60 em grupos de risco (SBPC/SBEM)' },
  { k: 'b12', rot: 'Vitamina B12', un: 'pg/mL', min: 200, max: 900 },
  { k: 'ferritina', rot: 'Ferritina', un: 'ng/mL', sexo: { m: [30, 400], f: [15, 150] } },
  { k: 'hb', rot: 'Hemoglobina', un: 'g/dL', sexo: { m: [13.5, 17.5], f: [12, 15.5] }, nota: 'gestante: ≥ 11' },
  { k: 'creatinina', rot: 'Creatinina', un: 'mg/dL', sexo: { m: [0.7, 1.3], f: [0.6, 1.1] } },
  { k: 'tgo', rot: 'TGO (AST)', un: 'U/L', max: 40 }, { k: 'tgp', rot: 'TGP (ALT)', un: 'U/L', max: 40 },
  { k: 'acUrico', rot: 'Ácido úrico', un: 'mg/dL', sexo: { m: [3.4, 7.0], f: [2.4, 6.0] } },
  { k: 'pcr', rot: 'PCR ultrassensível', un: 'mg/L', max: 3 },
];

export function faixaExame(e, sexo) {
  const [min, max] = e.sexo ? e.sexo[sexo === 'm' ? 'm' : 'f'] : [e.min, e.max];
  return { min, max, texto: min != null && max != null ? `${min}–${max}` : max != null ? `até ${max}` : `≥ ${min}` };
}
export function avaliarExame(e, valor, sexo) {
  const v = Number(String(valor).replace(',', '.'));
  if (!valor || !Number.isFinite(v)) return null;
  const f = faixaExame(e, sexo);
  return f.min != null && v < f.min ? 'baixo' : f.max != null && v > f.max ? 'alto' : 'ok';
}
export const homaIR = (glic, ins) => (glic > 0 && ins > 0 ? (glic * ins) / 405 : null);

// Sinais que pedem cuidado antes de prescrever restrição.
export function alertasSeguranca(a = {}, imc, idade) {
  const out = [];
  const scoff = ['scoff1', 'scoff2', 'scoff3', 'scoff4', 'scoff5'].filter((k) => a[k] === 'Sim').length;
  if (scoff >= 2) out.push(`SCOFF positivo (${scoff} de 5): sinais de possível transtorno alimentar. Evite dietas restritivas e considere avaliação com psicólogo/psiquiatra.`);
  if (imc && imc < 18.5 && idade >= 19) out.push(`IMC ${String(Math.round(imc * 10) / 10).replace('.', ',')}: baixo peso. Investigue a causa e não prescreva déficit calórico.`);
  const comp = a.comportamento || [];
  if (comp.includes('Episódios de compulsão') || comp.includes('Come escondido') || comp.includes('Restringe muito e depois exagera')) out.push('Comportamentos de compulsão/restrição relatados: prefira abordagem sem restrição rígida.');
  if (a.perdaRecente === 'Perdeu mais de 5%') out.push('Perda de peso não intencional acima de 5%: investigue risco nutricional e causas clínicas.');
  if (a.ciclo === 'Ausente (amenorreia)') out.push('Amenorreia: considere baixa disponibilidade energética (RED-S), principalmente em atletas.');
  return out;
}
