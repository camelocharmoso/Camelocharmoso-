# Lia: equipe de marketing com IA no WhatsApp

O cliente conversa com a Lia pelo WhatsApp e pede artes, stories, carrosséis, legendas, ideias e roteiros. A Lia cria as artes com a identidade da marca, manda as opções com botões, debita os créditos quando o cliente aprova e avisa você quando tem post para publicar ou tarefa para fazer.

## O que já funciona

| Parte | Como funciona |
|---|---|
| Conversa | Claude responde como a Lia, no tom da marca de cada cliente. |
| Primeira conversa | A Lia faz as perguntas da marca, salva o **Cérebro da Marca** (cores, tom, produtos…) e oferece uma arte de amostra grátis. |
| Artes de feed (4:5) | 2 opções com as cores da marca e a foto do produto. Botões: *Quero a 1*, *Quero a 2*, *Refazer*. |
| Story (9:16) | 1 opção com botão "chama no direct". |
| Carrossel | Capa + 2 a 6 slides. |
| Fotos | Foto que o cliente manda vira a imagem principal das próximas artes. |
| Áudio | Transcrito se você configurar um serviço de transcrição (opcional). |
| Créditos | Debitados só na aprovação. Renovam todo dia 1º. Pacote extra de 20 créditos por R$ 49 com botão. |
| Agendamento | Cliente escolhe o horário; você recebe a arte e a legenda no seu WhatsApp para publicar. |
| Site e vídeo | Viram tarefas para você, com aviso no seu WhatsApp. |
| Falar com humano | A Lia te chama; você responde com `/msg`. |
| Números desconhecidos | Recebem uma apresentação e você é avisado com o comando pronto para cadastrar. |

**Ainda não faz sozinha:** publicar no Instagram (você publica pelo Meta Business Suite quando chega o aviso) e ler métricas do Instagram. A Lia foi instruída a não inventar números.

## Modelos de arte

Inspirados em artes profissionais de hamburgueria e food service. A Lia escolhe o modelo pelo clima do pedido (`promo`, `premium`, `divertido`) e cada "Refazer" passa para os próximos.

| Modelo | Visual | Melhor com |
|---|---|---|
| `eco` | Título gigante repetido 3x, produto na frente, etiqueta de preço em gota | produto recortado |
| `script` | Título em duas cores + palavra manuscrita por cima ("Nostalgia *pura*") | produto recortado |
| `oferta` | Manchete serifada, produto no centro, placa "por apenas R$ 20,90 unid" | qualquer foto |
| `cinema` | Foto ocupando tudo, escurecida, título embaixo | foto inteira (não recortada) |
| `fogo` | Fundo escuro com brilho e faíscas, título vazado gigante, reflexo do produto | produto recortado |

**Paletas prontas** para quem não tem cores definidas: `brasa`, `pop`, `fresh`, `retro`, `street`, `noite`. Se o cliente tem cores, elas têm prioridade.

**Recorte do fundo**: configure `CUTOUT_API_URL` e `CUTOUT_API_KEY` (remove.bg ou Photoroom) para o produto sair "solto" na frente do título. Cada foto é recortada uma vez só, quando chega. Sem isso, a foto entra emoldurada e a Lia prefere o modelo `cinema`.

Fontes usadas (todas OFL, uso comercial liberado): Inter, Archivo Black, Alfa Slab One, Anton e Great Vibes, com as licenças em `fonts/`.

## Seus comandos (mande do seu WhatsApp para o número da Lia)

```
/add 5581999998888 pro Nome do Negócio   cadastra cliente (planos: start, pro, premium)
/clientes                                 lista clientes, planos e créditos
/fila                                     posts e tarefas pendentes
/feito p12   ou   /feito t3               marca post ou tarefa como feito
/creditos 5581999998888 +10               ajusta créditos
/plano 5581999998888 premium              troca o plano
/pausar 5581999998888  /ativar …          pausa ou reativa (ex.: inadimplência)
/msg 5581999998888 texto                  responde o cliente como Lia
```

Use o número do cliente exatamente como aparece no aviso de "número novo" (o WhatsApp às vezes manda sem o 9 depois do DDD).

## Testar no computador, sem WhatsApp

1. Instale o Node.js 22 ou mais novo.
2. Nesta pasta: `npm install`
3. Copie `.env.example` para `.env` e preencha só `ANTHROPIC_API_KEY` (crie em console.anthropic.com → API Keys).
4. `npm start` e abra http://localhost:3000/sim
5. No lado direito (você), mande `/add 5581999990000 pro Brasa Burger`. Escolha o cliente no topo e, do lado esquerdo, mande "oi" como se fosse o dono.

Para rodar os testes automáticos (não gastam API): `npm test`

## Colocar no ar com WhatsApp de verdade

### 1. Chip e conta na Meta
1. Compre um chip só para a Lia. **Esse número não pode estar em uso no app do WhatsApp** (se estiver, apague a conta dele no app antes).
2. Crie uma conta em developers.facebook.com → *Meus apps* → *Criar app* → tipo **Empresa** → adicione o produto **WhatsApp**.
3. Em *WhatsApp → Configuração da API*, adicione o número da Lia e confirme pelo SMS.
4. Anote o **ID do número de telefone** (vai em `WHATSAPP_PHONE_NUMBER_ID`).
5. Crie um **token permanente**: Configurações do negócio → Usuários do sistema → adicionar (admin) → Gerar token com as permissões `whatsapp_business_messaging` e `whatsapp_business_management`. Vai em `WHATSAPP_TOKEN`.
6. Em *Configurações do app → Básico*, copie a **Chave secreta do app** para `WHATSAPP_APP_SECRET`.
7. Cadastre um cartão em *WhatsApp → Configuração da API → Forma de pagamento*. A Meta cobra por conversa iniciada pela empresa; respostas a mensagens do cliente dentro de 24 horas são de graça ou bem baratas (confira a tabela atual da Meta para o Brasil).

### 2. Hospedagem
A Lia guarda tudo num banco SQLite na pasta `data/`, então o servidor precisa de **disco que não apaga** a cada deploy:
- **Railway** ou **Render**: crie o serviço a partir deste repositório (pasta `lia`, usa o `Dockerfile`) e adicione um **Volume/Disk** montado em `/data`.
- **VPS** (Hostinger, DigitalOcean, Contabo…): `npm install && npm start` com o `pm2` ou `systemd`, atrás de HTTPS.

Preencha as variáveis do `.env.example` no painel da hospedagem. Defina `ADMIN_TOKEN` (uma senha sua) e `ADMIN_PHONE` (seu número pessoal).

### 3. Webhook
1. No app da Meta: *WhatsApp → Configuração → Webhook → Editar*.
2. URL de callback: `https://SEU-ENDERECO/webhook`
3. Token de verificação: o mesmo valor de `WHATSAPP_VERIFY_TOKEN`.
4. Clique em *Verificar e salvar* e assine o campo **messages**.
5. Do seu número pessoal, mande `/ajuda` para o número da Lia. Se chegar a lista de comandos, está tudo ligado.

O simulador continua disponível em `https://SEU-ENDERECO/sim` (pede a senha `ADMIN_TOKEN`).

### 4. Áudio (opcional)
Para a Lia entender áudio, configure `TRANSCRIBE_API_URL`, `TRANSCRIBE_API_KEY` e `TRANSCRIBE_MODEL` com qualquer serviço compatível com o formato Whisper (`/v1/audio/transcriptions`). Sem isso, ela pede para o cliente escrever.

## Segurança

### O que o sistema já faz sozinho
| Ameaça | Proteção |
|---|---|
| Alguém fingir ser a Meta e mandar mensagens falsas | Toda chamada ao `/webhook` precisa da assinatura HMAC do seu app. Sem `WHATSAPP_APP_SECRET`, o servidor **se recusa a subir**. |
| Invadir o simulador / painel | Senha forte obrigatória (`ADMIN_TOKEN`, 24+ caracteres) enviada por cabeçalho, nunca na URL. Sem senha, só abre no seu computador. Depois de 10 senhas erradas, o IP fica bloqueado por 15 minutos. |
| Cliente virar operador | Comandos (`/add`, `/creditos`…) só são aceitos do seu número (`ADMIN_PHONE`). |
| Cliente convencer a IA a dar créditos ("ignore as regras…") | A IA não tem nenhuma ferramenta que mexe em créditos. Débitos e saldos são feitos só pelo código, no clique do botão. |
| Spam para queimar seus créditos de IA | Limite de 30 mensagens a cada 10 min e 150 conversas por dia por cliente; números desconhecidos recebem no máximo uma resposta por dia e nunca chegam à IA. |
| Encher seu WhatsApp de avisos | No máximo 3 pedidos de "falar com humano" por hora por cliente. |
| Arquivo malicioso disfarçado de foto | O tipo é conferido pelos bytes do arquivo (só JPG, PNG e WEBP), com limite de 5 MB. Download de mídia só dos servidores da Meta. |
| Repetir mensagens antigas | Cada mensagem é processada uma vez só; mensagens com mais de 24 h são ignoradas. |
| Ler arquivos do servidor pela URL | Nomes de arquivo validados; qualquer outra rota responde 404. |
| Ataques pelo navegador (XSS, clickjacking) | Cabeçalhos de segurança (CSP sem scripts embutidos, `X-Frame-Options`, `nosniff`, HSTS em HTTPS). Todo texto exibido é escapado. |
| Vazamento de detalhes técnicos | Erros internos vão só para o log; o cliente recebe mensagem genérica. |
| Invasor tomar a máquina | O contêiner roda sem privilégios de administrador. |

`npm test` roda também os testes de segurança (assinatura, senha, força bruta, spam, arquivos falsos).

### O que depende de você
1. **Senhas fortes e únicas** para `ADMIN_TOKEN` e `WHATSAPP_VERIFY_TOKEN` (`openssl rand -hex 24`). Nunca mande essas chaves por WhatsApp, e-mail ou print.
2. **Verificação em duas etapas** em tudo: Meta (Facebook), Anthropic, GitHub, hospedagem e seu e-mail. A maioria das invasões começa por uma conta pessoal sem 2FA.
3. **PIN de duas etapas no número da Lia** (Meta → WhatsApp → Números de telefone → Verificação em duas etapas) e no seu chip pessoal (`ADMIN_PHONE` manda no sistema). Peça à operadora bloqueio de portabilidade/troca de chip.
4. **Limite de gasto** em console.anthropic.com → Limits, para um problema nunca virar uma conta gigante.
5. **Backup** da pasta `/data` (banco e artes) pelo menos uma vez por semana.
6. **Atualizações**: rode `npm audit` e `npm update` uma vez por mês.
7. **Se suspeitar de vazamento**: gere um novo token na Meta, troque `ADMIN_TOKEN`, `WHATSAPP_APP_SECRET` e a chave do Claude, e reinicie.
8. **LGPD**: você guarda nome, telefone, fotos e conversas dos clientes. Informe isso no contrato e apague os dados de quem cancelar (peça que eu crie o comando quando precisar).

## Custos de IA

Cada mensagem do cliente é uma chamada ao Claude (às vezes duas, quando a Lia usa uma ferramenta e depois responde). O modelo padrão é o `claude-opus-5-5` com esforço `low`, que deixa a conversa rápida. Para baratear, você pode trocar `LIA_MODEL` por `claude-sonnet-5-5` ou `claude-haiku-5-5`; teste a qualidade antes. A arte em si é gerada no seu servidor e não custa IA.

Acompanhe o gasto real em console.anthropic.com → Usage nas primeiras semanas e compare com o que cada cliente paga.

## Estrutura

```
src/server.js            servidor, webhook da Meta, simulador
src/handler.js           decide o que fazer com cada mensagem; comandos do operador
src/brain.js             prompt da Lia e ferramentas do Claude
src/actions.js           artes, créditos, agendamento, tarefas, avisos para você
src/templates.js         modelos de arte (eco, script, oferta, cinema, fogo) e paletas
src/art.js               renderização SVG → PNG, carrossel, utilidades de imagem
src/cutout.js            remoção de fundo das fotos (opcional)
src/db.js                banco SQLite
src/plans.js             planos, preços e custo em créditos
src/channels/            WhatsApp Cloud API e canal do simulador
src/security.js          assinatura, senhas, limites, validação de arquivos, cabeçalhos
public/                  simulador (HTML, CSS e JS separados por causa da CSP)
fonts/                   fonte Inter (licença OFL, em fonts/LICENSE-Inter.txt)
```
