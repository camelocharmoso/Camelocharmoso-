// Planos, preços e custo de cada entrega em créditos.

export const PLANS = {
  start: { name: "Start", price: 197, credits: 25 },
  pro: { name: "Pro", price: 397, credits: 60 },
  premium: { name: "Premium", price: 797, credits: 150 },
};

export const COSTS = {
  story: 1,
  feed: 2,
  site: 3,
  carousel: 4,
  video: 6,
};

export const EXTRA_PACK = { credits: 20, price: 49 };

export const planOf = (key) => PLANS[key] || PLANS.start;
