# Smile Burguer: landing page

Página estática (HTML, CSS e JS puro, sem dependências) da Smile Burguer. Feita para receber o tráfego dos anúncios do Instagram: abre rápido no celular e todo botão leva direto ao pedido, com a mensagem já escrita.

Para ver no computador: `python3 -m http.server` dentro desta pasta e abra `http://localhost:8000`.

## Seções

1. **Topo:** promoção "Pediu, ganhou" (batata média grátis), trio de burgers reais + batata na caixa da Smile, horário e formas de atendimento.
2. **Faixa xadrez + letreiro:** a identidade do cartão de visita.
3. **Cardápio:** 3 destaques com foto e botão "Pedir" para cada um, mais a lista do restante.
4. **Combos:** Família e Casal Bacon Love.
5. **Como pedir:** 3 passos, horário e botão.
6. **Instagram, chamada final e rodapé.** No celular aparece um botão fixo "Pedir agora" depois que a pessoa passa do topo.

Toda mensagem termina com "(Vim pelo site)", para saber quantos pedidos chegam pela página.

## Como editar

Tudo fica no objeto `CONFIG` no começo de `app.js`:

- `whatsapp`: **preencha com o número da Smile** (DDD + número, só dígitos). Enquanto estiver vazio, os botões abrem o Direct do Instagram.
- `destaques`, `lista`, `combos`: nomes, descrições e preços. `preco: null` mostra "Consulte".
- `promo`: o texto da promoção que vai na mensagem. Quando a promo acabar, troque aqui e no topo do `index.html`.

## Fotos

`assets/` tem os recortes (fundo transparente) feitos a partir das fotos reais da Smile. Para trocar, mantenha o nome do arquivo. `og.jpg` é a imagem que aparece quando o link é compartilhado.

## Rastreamento

Os cliques em "Pedir" mandam o evento `pedido_clique` para `window.dataLayer` e, se o Meta Pixel estiver instalado, um evento `Contact`. Instale o Pixel no `<head>` do `index.html` para o Gerenciador de Anúncios otimizar por cliques de pedido.
