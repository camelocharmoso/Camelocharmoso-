// Planos, preços, custo de cada entrega em créditos e o argumento de valor de cada plano.

export const PLANS = {
  start: { name: "Start", price: 197, credits: 25, extras: ["site de 1 página"] },
  pro: { name: "Pro", price: 397, credits: 60, extras: ["site completo", "Google Meu Negócio", "campanha pronta das datas do mês"] },
  premium: { name: "Premium", price: 797, credits: 150, extras: ["site completo + cardápio digital", "Google Meu Negócio", "campanhas do mês", "revisão humana de todas as artes"] },
};

export const COSTS = { story: 1, feed: 2, site: 3, carousel: 4, video: 6 };

export const EXTRA_PACK = { credits: 20, price: 49 };

/** Quanto do saldo não usado passa para o mês seguinte (fração do plano). */
export const ROLLOVER = 0.5;

export const INCLUDED = "legendas, ideias de post, roteiros de Reels, respostas de avaliação do Google, textos para lista de transmissão e dúvidas de marketing";

export const planOf = (key) => PLANS[key] || PLANS.start;

const brl = (n) => n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** O que cada plano rende na prática, com o preço por arte calculado (não inventado). */
export function planValue(key) {
  const p = planOf(key);
  const feeds = Math.floor(p.credits / COSTS.feed);
  const mix = { feed: Math.floor(p.credits * 0.6 / COSTS.feed), story: Math.floor(p.credits * 0.4 / COSTS.story) };
  return {
    ...p,
    key,
    feeds,
    stories: Math.floor(p.credits / COSTS.story),
    mix,
    perFeed: brl(p.price / feeds),
    perDay: brl(p.price / 30),
  };
}

export function plansPitch() {
  return Object.keys(PLANS).map((k) => {
    const v = planValue(k);
    return `*${v.name} · R$ ${v.price}/mês* · ${v.credits} créditos\n` +
      `= até ${v.feeds} artes de feed (R$ ${v.perFeed} cada) ou ${v.mix.feed} artes + ${v.mix.story} stories\n` +
      `+ ${v.extras.join(", ")}`;
  }).join("\n\n");
}
