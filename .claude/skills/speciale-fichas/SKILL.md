---
name: speciale-fichas
description: Fichas técnicas, receitas de produção e materiais de padronização da Speciale Pizzas Artesanais (Recife) em PDF, no padrão vermelho da "Ficha Técnica · Molho de Tomate Artesanal". Use quando o pedido envolver a Speciale, ficha técnica de pizza, massa, molho, transcrição de anotações da cozinha, estimativa de Broto/Média, desperdício de massa ou revisão dessas fichas.
---

# Fichas técnicas Speciale

Você trabalha para uma nutricionista que monta as fichas técnicas da **Speciale Pizzas Artesanais** (Rua José Bonifácio, 601 · Torre · Recife · forno a lenha). Responda em português do Brasil, com linguagem simples.

## Regras que nunca mudam

1. **Preços sempre em branco** (`R$ ______`). O dono não informa preços.
2. **Fotos só da casa** (tiradas na cozinha e enviadas por nós). Nada de internet nem do site. Sem foto, a ficha fica sem foto.
3. **Nunca inventar.** Estimado leva `(est.)`; o que falta vai para "A confirmar com a equipe" e aparece como "a pesar".
4. **Descontar a tara:** pote 13 g · balde 0,30 kg · bacia 1 kg · triturador 1,35 kg.
5. **Pizza pesada pela metade = dobrar** (caso da 4 Queijos).
6. **Os pesos coletados são da Grande** (35 cm, 8 fatias). Média e Broto são estimativa proporcional à **área**, nunca ao nº de fatias: Broto 25 cm = 0,51 · Média 30 cm = 0,735. Ovos: 2 · 1½ · 1.
7. **Massa:** hoje todas as bolinhas são de 320 g (≈100 por dia). Sugestão em teste: Broto ≈165 g, Média ≈235 g.
8. **Orégano** a olho, ≈2 g na Grande (média de mercado).
9. **Catupiry:** 4 listras em todos os tamanhos; bisnaga 1,5 kg rende 1,330 kg.
10. **Identidade vermelha** da Speciale. O rebranding verde ficou para depois.
11. **Alérgenos:** glúten, leite, ovo, castanhas conforme os ingredientes. Óleo de soja refinado é dispensado de declarar soja (RDC 26/2015): confirmar com a nutricionista.
12. **Antes de entregar,** conferir cada número com as anotações e listar o que mudou.

## Dados coletados (fonte da verdade)

- **Massa (lote 15 kg de farinha):** fermento biológico 150 g · sal 200 g · açúcar 400 g (padrão seria 180 g) · água ambiente 7 L (6,5 L + 500 ml) · óleo de soja 400 ml. Secos → água → óleo → bater 10 min → bolear 320 g → **18 bolinhas por bandeja** → **descanso 20 a 30 min** coberta → **direto na geladeira, no máximo 2 dias**. Produção diária. Abre no balcão de baixo e apara a borda com cortador.
- **Molho:** tomate 30 kg · manjericão 102 g · alho 3 cabeças · orégano 50 g · óleo 158 g · sal 160 g · açúcar 210 g. 2x por semana, 18h30. Porção 150 ml. Rendimento ≈17,7 kg. Ficha pronta em `references/Ficha_Tecnica_Molho_REFERENCIA.pdf` (é a **referência visual**).
- **Forno:** lenha, sem marcador, 340 a 380 °C, 3 a 4 min. Caixas de 25 cm e 35 cm; não há caixa média.
- **Portuguesa (Grande):** molho 150 ml · muçarela 278 g · presunto 82 g · 2 ovos · cebola crua partida 97 g · azeitona preta 9 g · orégano. Ordem: molho, muçarela, presunto, ovo, azeitona (etapa da cebola a confirmar). Ovo cozido: até 3 dias refrigerado; fatiado, usar no turno.
- **4 Queijos (dobrada):** muçarela 126 g · provolone 126 g · gorgonzola 24 g · catupiry 4 listras.
- **Lombinho com Bacon:** muçarela 278 g · lombo 105 g · bacon, cream cheese e azeitona preta a pesar.
- **Frango com Catupiry:** frango Broto 70 g · Média 70 g · Grande 140 g · catupiry 4 listras · muçarela a pesar.
- **Chocolate com Avelã e Parma Speciale:** sem pesos.
- **Muçarela em bloco:** sem perda no porcionamento.

## Estrutura da ficha

Capa vermelha (tag, título grande com destaque laranja, 3 quadros, versão) → 01 Identificação · 02 Ingredientes · 03 Equipamentos · 04 Modo de preparo/montagem (faixa de etapas, passos com FOTO/PCC, tabela PCC) · 05 Pontos de cada etapa (fotos) · 06 Características · 07 Padrão por tamanho · 08 Forno · 09 Qualidade · 10 Armazenamento · 11 Custos (em branco) · 12 Registro · 13 Melhorias + "A confirmar com a equipe" + assinaturas.

Visual: A4 · vermelho `#DA161C` · laranja `#F07A1E` · texto `#241A17` · creme `#FDF5EC` · títulos TeX Gyre Heros Condensed Bold · texto Inter · faixa quadriculada vermelha e branca.

## Como gerar os PDFs

Os geradores ficam nesta pasta (HTML + Chromium/Playwright). Rode a partir desta pasta e salve a saída fora dela:

```bash
cd .claude/skills/speciale-fichas
python3 port_v2.py ficha  /caminho/saida/portuguesa.html      # ficha da Portuguesa
python3 port_v2.py padrao /caminho/saida/padronizacao.html    # tamanho e desperdício
python3 massa_v2.py ficha   /caminho/saida/massa.html         # ficha da massa
python3 massa_v2.py receita /caminho/saida/receita.html       # receita da produção (cozinha)
python3 oper_port.py /caminho/saida/oper.html         # ficha OPERACIONAL simplificada (1 página, cozinha)
python3 ft_ref.py quatro_queijos /caminho/saida/4q.html       # outras pizzas: portuguesa, quatro_queijos, lombinho_bacon, frango_catupiry, chocolate_avela, parma_speciale
node render.js /caminho/saida/arquivo.html /caminho/saida/arquivo.pdf
```

- `fichas_data.py` guarda os dados das pizzas (exceto a Portuguesa, que está em `port_v2.py`). Para uma pizza nova, siga o modelo de `port_v2.py` (ficha completa com fotos).
- Fotos da casa: `fotos_port/` (Portuguesa) e `fotos_massa/` (massa). Fotos novas entram em uma pasta própria.
- Depois de gerar, rasterize (`pdftoppm -r 40 -png`) e confira se nada estourou a página. Salve os PDFs finais em `speciale/fichas/` e faça commit.

## Ficha operacional (cozinha)

Versão de 1 página para colar na cozinha: tabela de quantidades por tamanho (Grande em destaque), ordem de montagem numerada com 3 fotos e 3 alertas. Sem preços, sem PCC, sem custos. Modelo: `oper_port.py`.

## Fluxo de trabalho

1. Recebeu fotos de anotações: transcreva em tabela (lido · tara · líquido · dúvidas) e peça confirmação do que estiver ilegível.
2. Gere a ficha, confira visualmente, entregue o PDF.
3. Sempre termine listando: o que foi medido, o que foi estimado e o que falta confirmar.
