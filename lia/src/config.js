import path from "node:path";

const env = process.env;

export const config = {
  port: Number(env.PORT || 3000),
  dataDir: path.resolve(env.DATA_DIR || "./data"),

  model: env.LIA_MODEL || "claude-opus-5-5",
  effort: env.LIA_EFFORT || "low",

  wa: {
    token: env.WHATSAPP_TOKEN || "",
    phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID || "",
    verifyToken: env.WHATSAPP_VERIFY_TOKEN || "",
    appSecret: env.WHATSAPP_APP_SECRET || "",
    graphVersion: env.GRAPH_API_VERSION || "v23.0",
  },

  adminPhone: (env.ADMIN_PHONE || "").replace(/\D/g, ""),
  adminToken: env.ADMIN_TOKEN || "",
  salesContact: env.SALES_CONTACT || "Fala com a gente para virar cliente.",

  transcribe: {
    url: env.TRANSCRIBE_API_URL || "",
    key: env.TRANSCRIBE_API_KEY || "",
    model: env.TRANSCRIBE_MODEL || "whisper-1",
  },

  // Remoção de fundo (opcional). remove.bg: https://api.remove.bg/v1.0/removebg + X-Api-Key.
  // Photoroom: https://sdk.photoroom.com/v1/segment + x-api-key.
  cutout: {
    url: env.CUTOUT_API_URL || "",
    key: env.CUTOUT_API_KEY || "",
    header: env.CUTOUT_API_KEY_HEADER || "X-Api-Key",
    field: env.CUTOUT_FIELD || "image_file",
  },

  // Modo vendedora: números desconhecidos conversam com a Lia para conhecer e contratar os planos.
  sales: env.SALES_MODE !== "off",
  // Links de pagamento (Asaas, Mercado Pago, Stripe…). Só https. Sem link, a Lia avisa você para mandar.
  payLinks: { start: env.PAY_LINK_START || "", pro: env.PAY_LINK_PRO || "", premium: env.PAY_LINK_PREMIUM || "" },

  timezone: "America/Sao_Paulo",

  // Quantos proxies existem na frente do servidor (Railway, Render e Cloudflare usam 1).
  // Serve para saber o IP real de quem acessa e aplicar os limites. Use 0 se o Node recebe direto.
  trustProxy: Number(env.TRUST_PROXY ?? 1),

  // Limites contra spam e abuso (cada mensagem que chega ao Claude custa dinheiro).
  limits: {
    messagesPer10Min: Number(env.LIMIT_MESSAGES_10MIN || 30),
    aiTurnsPerDay: Number(env.LIMIT_AI_TURNS_DAY || 150),
    humanCallsPerHour: 3,
    // vendas: conversas por número desconhecido por dia e total do dia (protege seus créditos de IA)
    leadTurnsPerDay: Number(env.LIMIT_LEAD_TURNS_DAY || 30),
    leadTurnsTotalPerDay: Number(env.LIMIT_LEAD_TURNS_TOTAL_DAY || 400),
    maxTextChars: 2000,
    maxImageBytes: 5 * 1024 * 1024,
    maxMessageAgeSec: 24 * 3600,
  },
};

export const waEnabled = () => Boolean(config.wa.token && config.wa.phoneNumberId);
