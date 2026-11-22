// Remoção de fundo das fotos de produto (opcional). Funciona com remove.bg e Photoroom,
// que recebem a imagem no campo "image_file" e a chave num cabeçalho.
import { config } from "./config.js";
import { sniffImage } from "./security.js";

export const cutoutEnabled = () => Boolean(config.cutout.url && config.cutout.key);

export async function removeBackground(buffer, mime) {
  const form = new FormData();
  form.append(config.cutout.field, new Blob([buffer], { type: mime }), mime === "image/png" ? "foto.png" : "foto.jpg");
  form.append("crop", "true"); // corta as bordas vazias: o produto ocupa a imagem toda
  form.append("format", "png");
  const res = await fetch(config.cutout.url, {
    method: "POST",
    headers: { [config.cutout.header]: config.cutout.key, Accept: "image/png" },
    body: form,
    signal: AbortSignal.timeout(45_000),
  });
  if (!res.ok) throw new Error(`recorte falhou: ${res.status} ${(await res.text()).slice(0, 200)}`);
  const out = Buffer.from(await res.arrayBuffer());
  if (out.length > 15 * 1024 * 1024 || sniffImage(out) !== "image/png") throw new Error("recorte devolveu um arquivo inesperado");
  return out;
}
