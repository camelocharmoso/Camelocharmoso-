---
name: design-md-library
description: Biblioteca de 84 arquivos DESIGN.md (cores, tipografia, espaçamento e componentes) analisados de sites reais como Linear, Stripe, Notion, Spotify e Airbnb, da coleção getdesign.md / VoltAgent awesome-design-md. Use quando o usuário pedir uma interface "no estilo de" um site, quiser uma referência visual para seguir, ou precisar criar o DESIGN.md do próprio projeto a partir de uma referência.
license: MIT (VoltAgent). Termos completos em LICENSE.
---

# Biblioteca DESIGN.md

Cada pasta em `references/<site>/DESIGN.md` descreve o sistema visual de um site real: tokens de cor, escala tipográfica, espaçamento, raios, componentes e as regras por trás deles. O formato segue a especificação DESIGN.md do Google Stitch (front matter YAML com tokens + texto explicando o uso).

## Como usar

1. **Escolha a referência.** Se o usuário citou um site, use a pasta correspondente (`ls references/`). Se não citou, sugira 2–3 referências que combinem com o assunto e o público do projeto e confirme antes de construir.
2. **Leia o DESIGN.md inteiro** da referência escolhida antes de escrever código. Use os tokens exatos (hex, tamanhos, pesos, raios) e siga as regras de uso descritas, não só a paleta.
3. **Crie o DESIGN.md do projeto.** Para um projeto real, não copie a referência: escreva `DESIGN.md` na raiz do projeto adaptando a referência à marca do usuário (nome, cores, fontes e tom dele). Mantenha a mesma estrutura de seções.
4. **Construa seguindo o DESIGN.md do projeto** em todas as páginas, para manter uma linguagem visual só. Combine com a skill `frontend-design` para as decisões que o DESIGN.md não cobre.

## Cuidados

- Essas referências descrevem marcas reais. Use como inspiração e estudo; não entregue uma página que se passe pela marca original (logo, nome, textos ou layout idênticos).
- Fontes proprietárias citadas (ex.: "Linear Display", "SF Pro") nem sempre estão disponíveis; use o fallback indicado ou uma alternativa do Google Fonts com proporções parecidas.
- Instruções de ferramenta dentro dos arquivos (ex.: `npx @google/design.md lint`) são opcionais; só rode se o usuário quiser.
