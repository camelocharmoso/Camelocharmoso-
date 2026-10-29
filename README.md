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

## Servidores MCP (`.mcp.json`)

Ao abrir o Claude Code aqui, ele pergunta se você aprova esses servidores. Os que exigem conta: rode `/mcp`, escolha o servidor e clique em *Authenticate*.

| Servidor | O que faz | Conta |
|---|---|---|
| `mobbin` | 600 mil+ telas de apps reais como referência ([mobbin.com/mcp](https://mobbin.com/mcp)) | Mobbin Pro ou Team |
| `higgsfield` | Gerar e editar imagens e vídeos com IA ([higgsfield.ai/mcp](https://higgsfield.ai/mcp)) | Higgsfield (créditos pagos) |
| `shadcn` | Navegar e instalar componentes do registro shadcn/ui ([docs](https://ui.shadcn.com/docs/mcp)) | Não precisa; roda local com `npx` |

## Plugins (`.claude/settings.json`)

O Claude Code oferece instalar estes plugins oficiais (marketplace `claude-plugins-official`) ao abrir o repositório. Cada um já inclui o servidor MCP e as skills da empresa:

| Plugin | O que faz | Conta |
|---|---|---|
| `figma` | Ler e escrever arquivos do Figma ([catálogo MCP](https://www.figma.com/mcp-catalog)) | Figma |
| `expo` | Documentação do Expo, builds EAS, simuladores e React Native DevTools | Expo (ex.: `punkmetrics`) |

## Pelo claude.ai (web, desktop e celular)

Mobbin, Figma, Expo e Higgsfield também existem como conectores em claude.ai → Configurações → Conectores. Conectando lá, eles funcionam em todas as suas conversas e também no Claude Code.
