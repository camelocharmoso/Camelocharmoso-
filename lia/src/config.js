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

  timezone: "America/Sao_Paulo",
};

export const waEnabled = () => Boolean(config.wa.token && config.wa.phoneNumberId);
