# ED Barbearia: landing page

Página estática (HTML, CSS e JS puro, sem dependências) da ED Barbearia, em Casa Amarela, Recife. Os botões de agendar abrem o agendamento online (Aparo); os de WhatsApp abrem o (81) 99942-1727 com a mensagem já escrita.

Para ver no computador: `python3 -m http.server` dentro desta pasta e abra `http://localhost:8000`.

## O que tem na página

1. **Topo:** "Corte que chama atenção." Ao carregar, uma tesoura atravessa o título por uma linha tracejada e a metade de baixo das letras cai um pouco, como papel recortado. Botões de agendar e WhatsApp, horário e endereço.
2. **Faixa:** os serviços passando com tesouras entre eles.
3. **Cortes:** três fotos de corte. No celular, rolam para o lado. Linha sobre o corte kids.
4. **Preços:** cabelo R$ 50, barba R$ 40, cabelo + barba R$ 80, e um cupom recortável com os 50% no primeiro corte.
5. **Como funciona:** três passos, do agendamento até sair pronto.
6. **Fundador:** foto e frase do Edmilson Rodrigues.
7. **Curso de barbeiro** (`#curso`, dá para mandar o link direto para essa parte): Instituto Beleza Academy, turma em formação, botão para entrar na lista pelo WhatsApp.
8. **Como chegar:** mapa, endereço com a referência da delegacia, horário, telefones e botão de rota.
9. **Chamada final e rodapé**, com a vaga de barbeiro. No celular, uma barra fixa "Agendar" + WhatsApp.

Entre as seções, a linha tracejada de "corte aqui" ganha uma tesoura que anda e abre/fecha conforme a página rola. Com "reduzir movimento" ligado no aparelho, as animações param.

## Como editar

- **Link de agendamento, WhatsApp e mensagens:** só o objeto `CONFIG` no começo de `app.js`. Toda mensagem termina com "(Vim pelo site)".
- **Preços e textos:** em `index.html` (procure por `R$`).
- **Fotos:** troque os arquivos em `assets/` mantendo os nomes. O ideal é usar fotos reais de clientes da ED, de perfil e com fundo liso:
  - `corte-textured.webp`, `corte-barba.webp`, `corte-crop.webp`: cortes (Unsplash, em preto e branco).
  - `edmilson.webp`, `cadeira-ed.webp`: recortadas de prints da página do IBA. Peça os arquivos originais, porque o print perde qualidade.
  - `logo-ed.png`: logo branca com fundo transparente (no topo ela é escurecida por CSS).
  - `og.jpg`: prévia do link no WhatsApp (1200×630).
- **Rastreamento:** os cliques mandam `agendar_clique`, `whatsapp_clique` e `rota_clique` para `window.dataLayer`. Se instalarem Google Tag Manager ou Meta Pixel, os eventos já chegam lá.

## Antes de publicar no domínio deles

- Remover `<meta name="robots" content="noindex">` do `index.html`.
- `og:url` e `og:image` apontam para o GitHub Pages (`https://camelocharmoso.github.io/Camelocharmoso-/ed-barbearia/`). Se for para domínio próprio, troque as duas.
- Confirmado com o cliente em 31/10/2026: os 50% no primeiro corte (agendando pelo app, de segunda a quarta) e a vaga de barbeiro estão valendo. Quando a promoção acabar, apague o bloco `<aside class="cupom" data-promo>`; quando a vaga fechar, apague a linha `rodape-vaga` do rodapé.

## Créditos das imagens

Cortes: fotos do [Unsplash](https://unsplash.com/license) (uso comercial livre). Fotos do Edmilson: material da própria ED Barbearia. Ícones do WhatsApp e do Instagram: Simple Icons (CC0).
