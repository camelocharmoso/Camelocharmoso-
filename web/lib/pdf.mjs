// PDF do plano alimentar (painel do nutricionista e área do paciente). Usa o jsPDF global.
const latin = (s) => String(s ?? '').replace(/[–—]/g, '-').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/…/g, '...').replace(/[^\x00-\xFF]/g, '');
const fmt = (n, d = 0) => (Math.round((Number(n) || 0) * 10 ** d) / 10 ** d).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const dataBR = (iso) => (iso ? new Date(iso + (iso.length === 10 ? 'T12:00:00' : '')).toLocaleDateString('pt-BR') : '');

// p = { paciente_nome, nutri: {nome, crn, whatsapp}, metas, cardapio: {refeicoes, observacoes}, compras, suplementos, proximo_retorno, versao, substituir(item) }
export function gerarPDF(p) {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) throw new Error('jsPDF não carregou');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, M = 16; let y = 0;
  const VIO = [91, 61, 245], LIM = [184, 240, 74], INK = [23, 19, 43], MUT = [93, 89, 115], LIN = [228, 224, 239];
  const nut = p.nutri || {};
  const rodape = () => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...MUT);
    doc.text(latin(`Plano elaborado e revisado por ${nut.nome || 'Nutricionista'}${nut.crn ? ' - ' + nut.crn : ''}. Uso individual de ${p.paciente_nome || 'paciente'}. Valores nutricionais: TACO 4ª edição.`), M, 290);
  };
  const precisa = (h) => { if (y + h > 280) { rodape(); doc.addPage(); y = 18; } };
  const titulo = (txt) => { precisa(14); doc.setTextColor(...INK); doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.text(latin(txt), M, y); y += 8; };
  const paragrafo = (txt, size = 9.5) => { const l = doc.splitTextToSize(latin(txt), W - 2 * M); precisa(l.length * 4.8 + 2); doc.setFont('helvetica', 'normal'); doc.setFontSize(size); doc.setTextColor(...INK); doc.text(l, M, y); y += l.length * 4.8 + 3; };

  doc.setFillColor(...VIO); doc.rect(0, 0, W, 46, 'F');
  doc.setFillColor(...LIM); doc.circle(W - 18, 44, 22, 'F');
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(24); doc.text('Plano alimentar', M, 20);
  doc.setFontSize(13); doc.text(latin(p.paciente_nome || ''), M, 30);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5);
  const meta = [nut.nome || 'Nutricionista', nut.crn, new Date().toLocaleDateString('pt-BR'), p.versao ? 'Versão ' + p.versao : '', p.proximo_retorno ? 'Retorno ' + dataBR(p.proximo_retorno) : ''].filter(Boolean).join('  |  ');
  doc.text(latin(meta), M, 38);
  y = 56;
  const m = p.metas || {};
  const caixas = [['Energia', fmt(m.kcal) + ' kcal'], ['Proteínas', fmt(m.ptn) + ' g'], ['Carboidratos', fmt(m.cho) + ' g'], ['Gorduras', fmt(m.lip) + ' g'], ['Água', m.agua_ml ? fmt(m.agua_ml / 1000, 1) + ' L' : '-']];
  const bw = (W - 2 * M - 12) / 5;
  caixas.forEach(([k, v], i) => {
    const x = M + i * (bw + 3);
    doc.setFillColor(...(i === 0 ? VIO : [240, 237, 248])); doc.roundedRect(x, y, bw, 18, 3, 3, 'F');
    doc.setTextColor(...(i === 0 ? [255, 255, 255] : INK)); doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text(latin(v), x + 3.5, y + 8);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.text(latin(k + ' por dia'), x + 3.5, y + 14);
  });
  y += 28;
  for (const r of p.cardapio?.refeicoes || []) {
    const subs = doc.splitTextToSize(latin('Substituições: ' + (r.substituicoes || '-')), W - 2 * M - 8);
    precisa(16 + r.itens.length * 6.5 + subs.length * 4.6);
    doc.setFillColor(...LIM); doc.roundedRect(M, y, W - 2 * M, 9, 2.5, 2.5, 'F');
    doc.setTextColor(...INK); doc.setFont('helvetica', 'bold'); doc.setFontSize(11.5); doc.text(latin(r.nome), M + 4, y + 6.2);
    const kcal = (r.itens || []).reduce((s, i) => s + (Number(i.kcal) || 0), 0);
    doc.setFontSize(10); doc.text(latin(`${r.horario || ''}   ${fmt(kcal)} kcal`), W - M - 4, y + 6.2, { align: 'right' });
    y += 14;
    for (const it of r.itens || []) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...INK);
      const nomes = doc.splitTextToSize(latin(it.alimento || it.taco_nome || ''), 100);
      doc.text(nomes, M + 4, y);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(...MUT); doc.text(latin(it.quantidade || ''), W - M - 4, y, { align: 'right' });
      y += 4.8 * nomes.length + 1.5; doc.setDrawColor(...LIN); doc.line(M + 4, y - 2.6, W - M - 4, y - 2.6);
    }
    doc.setFontSize(9); doc.setTextColor(...MUT); doc.text(subs, M + 4, y + 1); y += subs.length * 4.6 + 6;
  }
  const sup = (p.suplementos || []).filter((s) => s.produto);
  if (sup.length) {
    titulo('Suplementação');
    for (const s of sup) paragrafo(`${s.produto}${s.dose ? ' - ' + s.dose : ''}${s.horario ? ' - ' + s.horario : ''}${s.obs ? ' (' + s.obs + ')' : ''}`);
  }
  if (p.cardapio?.observacoes) { titulo('Orientações'); paragrafo(p.cardapio.observacoes); }
  const cats = p.compras?.categorias || [];
  if (cats.length) {
    rodape(); doc.addPage(); y = 20;
    doc.setTextColor(...INK); doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.text('Lista de compras da semana', M, y); y += 10;
    for (const c of cats) {
      precisa(10 + c.itens.length * 6);
      doc.setFillColor(...VIO); doc.roundedRect(M, y, 70, 7.5, 2, 2, 'F'); doc.setTextColor(255, 255, 255); doc.setFontSize(10); doc.text(latin(c.nome), M + 3, y + 5.2); y += 12;
      for (const i of c.itens) {
        precisa(7);
        doc.setDrawColor(...MUT); doc.rect(M + 1, y - 3.2, 3.6, 3.6);
        doc.setTextColor(...INK); doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.text(latin(i.item), M + 8, y);
        doc.setTextColor(...MUT); doc.text(latin(i.quantidade), W - M, y, { align: 'right' }); y += 6.2;
      }
      y += 4;
    }
  }
  rodape();
  return doc.output('blob');
}

export function baixar(blob, nome) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: nome });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
