# Pinho Jets: landing page

Página estática (HTML, CSS e JS puro, sem dependências) para o @pinho_jets. Todo botão abre o WhatsApp (81) 97910-9536 com a mensagem já escrita conforme o que a pessoa escolheu.

Para ver no computador: `python3 -m http.server` dentro desta pasta e abra `http://localhost:8000`.

## O que tem na página

1. **Topo:** o vídeo do mar roda dentro de uma "tela" com cara de reels. Depois de um segundo a tela dá glitch, racha e o jet ski sai dela, voando por cima da página. Cacos de vidro com o quadro do vídeo e gotas de água completam o impacto.
2. **Travessia:** um segundo jet cruza a faixa azul conforme a pessoa rola a página e vai preenchendo "Navegar é preciso." (o slogan do flyer deles).
3. **Preços:** uma linha do tempo de 60 minutos, como a barra de um vídeo. O mini-jet anda até 20 min, 30 min ou 1 hora e o botão muda para "Reservar 30 min no WhatsApp". No celular a linha fica vertical.
4. **Onde:** os três pontos (Barra de Jangada, Paiva e Suape) ligados por uma linha de costa, de norte a sul, cada um com botão que já pede o jet naquele local.
5. **Não é só jet:** lancha, sofá maluco, drone e oficina, cada um com o próprio botão de WhatsApp.
6. **Monte seu passeio:** a pessoa escolhe o serviço, o local, o tempo, o dia, o período e quantas pessoas vão, e vê a mensagem do WhatsApp sendo montada num celular ao lado.
7. **Instagram, chamada final e rodapé.** No celular, um botão fixo "Reservar no WhatsApp" abre uma lista rápida de serviços.

Toda mensagem termina com "(Vim pelo site)", para a equipe saber quantos clientes chegam pela página.

## Como editar

- **Número, preços, locais e textos das mensagens:** só o objeto `CONFIG` no começo de `app.js`. Os locais também aparecem em `index.html` (seção `#onde`, etapa "Onde?" do montador e rodapé).
- **Preços na tela:** também aparecem em `index.html` (procure por `R$`).
- **Fotos e vídeo:** troque os arquivos em `assets/` mantendo os nomes. O ideal é usar os vídeos e fotos reais deles:
  - `mar.mp4` / `mar.webm` / `mar-poster.jpg`: vídeo da tela do topo (horizontal, até 15 s, sem som).
  - `sunset.webp`, `spray.webp`, `tilt.webp`: capas dos reels na seção do Instagram.
  - `lancha.webp`, `sofa.webp`, `drone.webp`, `oficina.webp`: fotos dos serviços.
  - `jet-frente.webp`, `jet-casal.webp`, `jet-salto.webp`: jets recortados, com fundo transparente.
  - `logo-pinho.png`: recortado do print do perfil. Peça o arquivo original do logo.
- **Rastreamento:** os cliques nos botões mandam o evento `whatsapp_clique` para `window.dataLayer`. Se instalarem o Google Tag Manager ou o Meta Pixel, o evento já chega lá.

## Antes de publicar no domínio deles

- Remover `<meta name="robots" content="noindex">` do `index.html`.
- Trocar `og:image` por um endereço absoluto (`https://.../assets/og.jpg`), senão a prévia do link não aparece no WhatsApp.
- Confirmar com o cliente: o ponto de encontro em cada local (a página diz que ele vai pelo WhatsApp), se a oficina atende as quatro marcas citadas (Sea-Doo, Yamaha, Kawasaki e Can-Am, que estão no logo) e se o preço é por jet ou por pessoa.

## Créditos das imagens

Fotos do [Unsplash](https://unsplash.com/license) (uso comercial livre): Yuriy Bogdanov (jet de frente), Hoseung Han (jet do casal), Steve Donoghue (jet saltando), Liam Gelap (lancha), Hai Nguyen (sofá maluco), Adrien Delforge (drone), Valentin Gerardi (oficina), Dawid Tkocz, Ludovic Gauthier e Jonathan Mueller (reels). Vídeo do topo: Mixkit, "Jet Ski in calm tropical waters" ([licença Mixkit](https://mixkit.co/license/)). Fundos dos jets removidos com rembg. Ícones do WhatsApp e do Instagram: Simple Icons (CC0).
