# ED Barbearia: landing page

Página estática (HTML, CSS e JS puro, sem dependências) da ED Barbearia, em Casa Amarela, Recife. Os botões de agendar abrem o agendamento online (Aparo); os de WhatsApp abrem o (81) 99942-1727 com a mensagem já escrita.

Para ver no computador: `python3 -m http.server` dentro desta pasta e abra `http://localhost:8000`.

## O que tem na página

Visual escuro e premium (carvão, amarelo Casa Amarela e aço), com vídeo e tesoura reais.

1. **Topo:** vídeo real da máquina fazendo o degradê na nuca. Ao carregar, uma tesoura de verdade (foto recortada) atravessa o título "Corte que chama atenção." pela linha tracejada e a metade de baixo cai em amarelo, como papel recortado. Depois ela fica parada ao lado do título e acompanha o mouse. O selo mostra "Aberto agora" no horário de funcionamento (hora de Recife).
2. **Faixa amarela:** ao rolar, a tesoura corta a tela e preenche "Hora marcada. Sem fila." atrás dela.
3. **Escolha o seu corte:** abas com três cortes; foto, descrição, preço e botões mudam juntos. O WhatsApp já sai com o nome do corte.
4. **Monte seu atendimento:** marca cabelo e/ou barba e o total aparece na hora (o combo mostra a economia de R$ 10). O botão muda para "Agendar cabelo + barba", etc.
5. **Cupom de 50%:** botão "Recortar o cupom"; a tesoura passa, o cupom solta e aparece o botão de usar no primeiro corte.
6. **Do celular à cadeira:** segundo vídeo (toca ao apertar o play) e os três passos.
7. **Fundador**, **Curso de barbeiro** (`#curso`), **Como chegar** (mapa, rota, telefones), **chamada final** e **rodapé** com a vaga. No celular, barra fixa "Agendar" + WhatsApp.

Os vídeos só rodam quando estão na tela. Com "reduzir movimento" ligado no aparelho, as animações param e os vídeos não tocam sozinhos.

## Como editar

- **Link de agendamento, WhatsApp e mensagens:** só o objeto `CONFIG` no começo de `app.js`. Toda mensagem termina com "(Vim pelo site)".
- **Preços e textos:** em `index.html` (procure por `R$`).
- **Fotos:** troque os arquivos em `assets/` mantendo os nomes. O ideal é usar fotos reais de clientes da ED, de perfil e com fundo liso:
  - `corte-textured.webp`, `corte-barba.webp`, `corte-crop.webp`: cortes (Unsplash, em preto e branco).
  - `edmilson.webp`, `cadeira-ed.webp`: recortadas de prints da página do IBA. Peça os arquivos originais, porque o print perde qualidade.
  - `logo-ed.png`: logo branca com fundo transparente (no topo ela é escurecida por CSS).
  - `og.jpg`: prévia do link no WhatsApp (1200×630).
  - `nuca.mp4`/`nuca.webm`/`nuca.jpg` (topo) e `acabamento.mp4`/`acabamento.jpg`: vídeos do Mixkit. O ideal é trocar por vídeos verticais da própria ED (até 8 s, sem som).
  - `tesoura.webp`: tesoura profissional real com fundo transparente (foto do Unsplash, recortada e com a marca gravada apagada).
- **Rastreamento:** os cliques mandam `agendar_clique`, `whatsapp_clique` e `rota_clique` para `window.dataLayer`. Se instalarem Google Tag Manager ou Meta Pixel, os eventos já chegam lá.

## Antes de publicar no domínio deles

- Remover `<meta name="robots" content="noindex">` do `index.html`.
- `og:url` e `og:image` apontam para o GitHub Pages (`https://camelocharmoso.github.io/Camelocharmoso-/ed-barbearia/`). Se for para domínio próprio, troque as duas.
- Confirmado com o cliente em 31/10/2026: os 50% no primeiro corte (agendando pelo app, de segunda a quarta) e a vaga de barbeiro estão valendo. Quando a promoção acabar, apague o bloco `<aside class="cupom" data-promo>`; quando a vaga fechar, apague a linha `rodape-vaga` do rodapé.

## Créditos das imagens

Cortes e tesoura: fotos do [Unsplash](https://unsplash.com/license) (uso comercial livre). Vídeos: [Mixkit](https://mixkit.co/license/) (uso comercial livre). Fotos do Edmilson: material da própria ED Barbearia. Ícones do WhatsApp e do Instagram: Simple Icons (CC0).
