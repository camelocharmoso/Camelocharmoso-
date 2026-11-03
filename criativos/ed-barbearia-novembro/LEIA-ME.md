# ED Barbearia · Plano de conteúdo de novembro/2026 (House do Creator)

- `ED-Barbearia-Plano-de-Conteudo-Novembro-2026.pdf`: plano completo (22 páginas) no padrão da House.
- `artes/`: artes prontas em PNG.
  - Feed 1080×1350: `feed-01` (campanha), `feed-02a..c` (agendar), `feed-03a..c` (o Ed), `feed-04a..d` (cortes).
  - Stories 1080×1920: `story-01` a `story-04` (modelos para a equipe).
  - Capas de destaque: `destaque-*.png` (8).
- `fonte/`: HTML das artes e do PDF. Para gerar de novo: `node fonte/render-artes.js "$PWD"`, `python3 fonte/gerar_plano.py` e `node fonte/render-plano.js "$PWD"`.

As fotos dos cortes (A1 e A4) são do Unsplash e provisórias: trocar pelas do ensaio de 19/11 em `fonte/img/` e gerar de novo.
