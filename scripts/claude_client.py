#!/usr/bin/env python3
"""Cliente mínimo da API do Claude (Anthropic) para os scripts do repositório.

Instalação:  pip install anthropic
Credencial:  export ANTHROPIC_API_KEY=sk-ant-...   (ou `ant auth login`; nunca coloque a chave no código)

Uso como script:  python3 scripts/claude_client.py "Sua pergunta aqui"
Uso como módulo:  from claude_client import perguntar
                  print(perguntar("Resuma esta anamnese: ..."))
"""
import sys

import anthropic

MODELO = 'claude-opus-5-5'
# Se o modelo recusar o pedido por segurança, a API refaz no modelo de fallback recomendado.
BETAS_FALLBACK = ['server-side-fallback-2026-07-01']


def criar_cliente():
    # Lê ANTHROPIC_API_KEY (ou o perfil do `ant auth login`) do ambiente.
    return anthropic.Anthropic()


def perguntar(prompt, sistema=None, esforco='medium', max_tokens=64000, cliente=None):
    """Envia `prompt` ao Claude e devolve o texto da resposta.

    Usa streaming para não estourar o tempo limite em respostas longas.
    `esforco`: 'low', 'medium', 'high', 'xhigh' ou 'max' (mais esforço = mais tokens e mais tempo).
    """
    cliente = cliente or criar_cliente()
    params = dict(
        model=MODELO,
        max_tokens=max_tokens,
        output_config={'effort': esforco},
        messages=[{'role': 'user', 'content': prompt}],
        betas=BETAS_FALLBACK,
        extra_body={'fallbacks': 'default'},
    )
    if sistema:
        params['system'] = sistema

    with cliente.beta.messages.stream(**params) as stream:
        resposta = stream.get_final_message()

    if resposta.stop_reason == 'refusal':
        detalhe = resposta.stop_details.explanation if resposta.stop_details else ''
        raise RuntimeError(f'O Claude recusou o pedido. {detalhe}'.strip())
    if resposta.stop_reason == 'max_tokens':
        print('Aviso: resposta cortada no limite de max_tokens.', file=sys.stderr)

    return ''.join(b.text for b in resposta.content if b.type == 'text')


def main():
    if len(sys.argv) < 2:
        sys.exit('Uso: python3 scripts/claude_client.py "Sua pergunta"')
    try:
        print(perguntar(' '.join(sys.argv[1:])))
    except anthropic.AuthenticationError:
        sys.exit('Chave inválida ou ausente: defina ANTHROPIC_API_KEY.')
    except anthropic.PermissionDeniedError:
        sys.exit('A chave não tem permissão para este modelo.')
    except anthropic.BadRequestError as e:
        sys.exit(f'Pedido inválido: {e.message}')
    except anthropic.RateLimitError as e:
        espera = e.response.headers.get('retry-after', '60')
        sys.exit(f'Limite de uso atingido. Tente de novo em {espera}s.')
    except anthropic.APIStatusError as e:
        sys.exit(f'Erro da API ({e.status_code}): {e.message}')
    except anthropic.APIConnectionError:
        sys.exit('Sem conexão com a API. Verifique a internet.')
    except RuntimeError as e:
        sys.exit(str(e))


if __name__ == '__main__':
    main()
