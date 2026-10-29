# Camelocharmoso-

Kit de design e desenvolvimento de apps para usar com o Claude Code. Tudo aqui é carregado automaticamente quando você abre o Claude Code neste repositório.

## Skills (`.claude/skills/`)

| Skill | Origem | Para que serve |
|---|---|---|
| `frontend-design` | [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design) (Apache 2.0) | Páginas e apps com identidade própria, sem cara de "gerado por IA". |
| `design-md-library` | [getdesign.md](https://getdesign.md/) / [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) (MIT) | 84 DESIGN.md de sites reais (Linear, Stripe, Notion…) como referência visual. |
| `shadcn` | [shadcn/ui](https://ui.shadcn.com/docs/skills) (MIT) | Encontrar, instalar, combinar e personalizar componentes shadcn/ui. |
| `migrate-radix-to-base` | [shadcn/ui](https://github.com/shadcn-ui/ui/tree/main/skills) (MIT) | Migrar componentes shadcn de Radix para Base UI. |
| `material-3` | [hamen/material-3-skill](https://github.com/hamen/material-3-skill) (MIT) | Material Design 3 ([m3.material.io](https://m3.material.io/)) em Jetpack Compose, Flutter e web. |
| `android-*` (36 skills) | [android/skills](https://github.com/android/skills) (Apache 2.0) | Skills oficiais do Google para Android: Compose, navegação, Wear, TV, carros, XR, câmera, Play Billing, desempenho, segurança, IA no aparelho e mais. |
| `motion` | [Motion AI Kit](https://motion.dev/ai-kit) / [motiondivision/ai-kit](https://github.com/motiondivision/ai-kit) (MIT) | Animações com Motion (antigo Framer Motion) e CSS: boas práticas, molas em CSS `linear()`, busca na documentação e auditoria de desempenho (MotionScore, só Motion+). Use com `/motion`. |
| `transitions-dev`, `transitions-polish`, `transitions-ui-generation` | [transitions.dev](https://transitions.dev/) / [Jakubantalik/transitions.dev](https://github.com/Jakubantalik/transitions.dev) (licença própria) | Transições de UI prontas (modal, menu, toast, abas…), refinamento de movimento e efeito de "UI sendo gerada". Pode usar em projetos pessoais e comerciais; não pode redistribuir a coleção como produto concorrente. |

## Agentes (`.claude/agents/`)

| Agente | Origem | Para que serve |
|---|---|---|
| `motion-reviewer` | Motion AI Kit | Audita o desempenho de todas as animações de um projeto. Precisa do MCP Motion+ (conta paga). |

## Servidores MCP (`.mcp.json`)

Ao abrir o Claude Code aqui, ele pergunta se você aprova esses servidores. Os que exigem conta: rode `/mcp`, escolha o servidor e clique em *Authenticate*.

| Servidor | O que faz | Conta |
|---|---|---|
| `mobbin` | 600 mil+ telas de apps reais como referência ([mobbin.com/mcp](https://mobbin.com/mcp)) | Mobbin Pro ou Team |
| `higgsfield` | Gerar e editar imagens e vídeos com IA ([higgsfield.ai/mcp](https://higgsfield.ai/mcp)) | Higgsfield (créditos pagos) |
| `shadcn` | Navegar e instalar componentes do registro shadcn/ui ([docs](https://ui.shadcn.com/docs/mcp)) | Não precisa; roda local com `npx` |
| `motion` | Documentação atual do Motion e geração de molas CSS ([motion.dev/ai-kit](https://motion.dev/ai-kit)) | Não precisa (gratuito). Para Motion+: `npx motion-ai --plus` |

## Plugins (`.claude/settings.json`)

O Claude Code oferece instalar estes plugins oficiais (marketplace `claude-plugins-official`) ao abrir o repositório. Cada um já inclui o servidor MCP e as skills da empresa:

| Plugin | O que faz | Conta |
|---|---|---|
| `figma` | Ler e escrever arquivos do Figma ([catálogo MCP](https://www.figma.com/mcp-catalog)) | Figma |
| `expo` | Servidor MCP do Expo + as [Expo Skills](https://expo.dev/expo-skills) (Router, UI nativa, EAS Build/Update/Hosting, App Store, upgrades…) | Expo (ex.: `punkmetrics`) |
| `gsap-skills` (marketplace `greensock/gsap-skills`) | Skills oficiais do [GSAP](https://gsap.com/): tweens, timelines, ScrollTrigger, plugins, React e desempenho | Não precisa |

## Pelo claude.ai (web, desktop e celular)

Mobbin, Figma, Expo e Higgsfield também existem como conectores em claude.ai → Configurações → Conectores. Conectando lá, eles funcionam em todas as suas conversas e também no Claude Code.
