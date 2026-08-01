# Identidade Temporária

**Data:** 31/07/2026

## Contexto

O redesign vibrante do front público precisava de uma marca que acompanhasse a
nova direção de arte ("Energia que acolhe. Cor que aproxima.") sem depender de
uma logomarca final da ONG. Enquanto a identidade definitiva não é definida,
a aplicação usa uma marca temporária construída em SVG.

## Componente

`src/components/ui/Logo.tsx`

## Descrição da marca temporária

A marca é composta por um rosto de animal estilizado (inspirado em cão/gato)
dentro de um retângulo arredondado:

- **Orelhas:** orelha esquerda amarela (`#FFC928`), orelha direita verde (`#14866D`).
- **Cabeça:** retângulo arredondado com gradiente de vermelho vivo
  `#EF3E36 → #C7222A`, levemente girado.
- **Rosto:** olhos, focinho e detalhes claros com leve efeito de brilho.
- **Bigodes:** linhas finas para um toque carinhoso.
- **Patinha:** verde, posicionada sobre o retângulo.
- **Glow:** suave brilho amarelo atrás da marca.

### Cores da marca

| Elemento | Cor |
| --- | --- |
| Orelha esquerda | `#FFC928` (amarelo vivo) |
| Orelha direita | `#14866D` (verde de apoio) |
| Cabeça (gradiente) | `#EF3E36 → #C7222A` (vermelho vivo) |
| Detalhes do rosto | branco / amarelo-claro |
| Patinha | `#14866D` |

### Estrutura de classes preservadas

Para não quebrar as animações CSS existentes, as seguintes classes foram
mantidas no novo SVG:

- `logo-link` (link wrapper)
- `logo-head`
- `logo-ear--left`, `logo-ear--right`
- `logo-eye--left`, `logo-eye--right`
- `logo-nose`, `logo-nose-shine`
- `logo-paw`
- `logo-text-main`

## Interações

- **Hover:** a cabeça inclina, as orelhas balançam, o focinho dá um "pulo" e a
  patinha acena, com suporte a `prefers-reduced-motion`.

## Substituição futura

Quando a logomarca definitiva da SOS Focinho Carente estiver disponível:

1. Substituir o conteúdo de `src/components/ui/Logo.tsx` mantendo o mesmo
   contrato de props/classes.
2. Remover (ou reaproveitar) a seção "LOGO" do `src/styles/components-vibrant.css`.
3. Atualizar este documento e o `docs/DIRECAO-DE-ARTE.md`.
