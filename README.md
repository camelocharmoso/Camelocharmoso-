# Camelocharmoso-

Kit de design para usar com o Claude Code.

## Skills (`.claude/skills/`)

| Skill | Origem | Para que serve |
|---|---|---|
| `frontend-design` | [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design) (Apache 2.0) | Como desenhar páginas e apps com identidade própria, sem cara de "gerado por IA". |
| `design-md-library` | [getdesign.md](https://getdesign.md/) / [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) (MIT) | 84 arquivos DESIGN.md de sites reais (Linear, Stripe, Notion, Spotify…) para usar como referência visual. |

O Claude Code carrega essas skills automaticamente em qualquer sessão aberta neste repositório.

## Mobbin MCP (`.mcp.json`)

O [Mobbin MCP](https://mobbin.com/mcp) dá ao Claude acesso a mais de 600 mil telas reais de apps. Precisa de conta Mobbin **Pro ou Team**.

- **Recomendado:** conecte o Mobbin em claude.ai → Configurações → Conectores ([página do conector](https://claude.ai/directory/connectors/mobbin)). O Claude Code passa a ter acesso automaticamente.
- **Só no terminal:** o `.mcp.json` deste repositório já registra o servidor. Abra o Claude Code aqui, rode `/mcp`, escolha `mobbin` e clique em *Authenticate* para entrar com sua conta Mobbin.
