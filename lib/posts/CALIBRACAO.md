# Calibração do template de aniversário contra o Canva

Referência: `Individuando - Aniversários/26` (DAHU3eX9sD4), página 11 (marcos), exportada em PNG 1080.
Método: o SVG é exportado pelo mesmo caminho do produto (`lib/posts/exportar.ts`), desenhado num canvas
1080×1080 e comparado pixel a pixel com o PNG do Canva **dentro do navegador** (`/estilos/posts`,
`window.__diffPost`). Métrica: média de |ΔR|+|ΔG|+|ΔB| / 3, em níveis de 0–255.

## Resultado

| região | antes | depois | observação |
|---|---|---|---|
| global | 3,48 | **2,13** | dominado por AA de texto em arco e ruído PNG |
| arco (data) | 10,06 | 5,28 | bbox a ±3 px; resíduo é glifo-a-glifo, não vai a zero entre motores |
| pílula + textos | 13,60 | 4,33 | bboxes idênticos ao pixel |
| canto | 7,37 | 2,98 | extensão 46–440 × 614–1033, idêntica |
| foto (borda incl.) | 2,37 | 1,56 | com fixture realinhado |
| foto (interior, r<360) | — | **0,63** | p99 = 2: mapeamento pan/zoom exato |
| assinatura | 2,46 | 2,46 | piso de ruído |

Cores: 14 pontos amostrados (anel em 8 ângulos, círculos decorativos em 6) — todos dentro de ±1 nível.
Tipografia: `getBBox()` de "marcos" em Montserrat 800/80 = **313,53 px**; o Canva registra 313,53.

## Descobertas que viraram constantes

- `letterSpacing: 0.24` no Canva é **fração do corpo** (em), não px. Medido: 0,212em.
- `rotation: -180` do canto é do ativo do Canva; o `Corner_3.svg` já está na orientação final → sem rotação.
- Pílula: padding esquerdo 38, direito 41,6 → reproduz 393,1 (marcos) e 235,8 (ana).
- Arco da data: raio de baseline 446, centro a 17,5° à direita das 12h (`offsetPadrao` 0,601).
- Gradiente 135° do Canva = `x1=0 y1=0 x2=1 y2=1` em objectBoundingBox.

## O que NÃO é defeito do template

Diferença glifo-a-glifo no texto curvo: dois motores de layout distribuem letras de forma diferente
ao longo do trilho. O bounding box bate; a identidade pixel a pixel não é alcançável nem necessária.

## Revisão de código (orquestrada) e o que ela mudou

A primeira rodada (3 verificadores de transcrição + 3 revisores + refutação adversarial 3×) caiu no limite
de sessão **na fase de refutação**: 118 refutadores falharam, zero votos, e o script descartou tudo por
construção. Os achados brutos foram triados à mão e confirmados por leitura e por medição:

| achado da revisão | correção | prova |
|---|---|---|
| ids de `clipPath`/gradiente globais colidem entre instâncias | `useId()` sanitizado como sufixo | ids `clipBlob-_r_0_` etc., únicos |
| `getBBox` antes da fonte carregar; nunca re-medido | mede após `garantirFontePost()` e em `fonts.loadingdone`; ignora 0 | `nomeW` 313,53 estável |
| preview (Google) e export (woff2 local) usavam faces diferentes | `lib/posts/fontes.ts`: uma face variável para os dois | "marcos" = 313,53 nas duas |
| `preserveAspectRatio="slice"` cortava a foto ao quadrado antes do pan | imagem entra com proporção real; pan alcança as bordas | retrato 500×900: topo em 150,399 com foco −1, base em 942,394 com foco +1 |
| traço dos anéis do canto 0,51 px (Canva ≈ 1,6–2) | `tracoPx` em px finais + `vector-effect: non-scaling-stroke` | run médio 1,83 vs 1,75 |
| canto escalado só pela largura (431,43 ≠ 432) | `scale(sx sy)` | caixa exata |
| nome longo estoura a pílula sobre a assinatura | auto-ajuste: mede em texto invisível no corpo nominal, reduz até `fimMax` 719, piso 44; override `nomeCorpo` | "guilherme augusto": corpo 56,07, pílula termina em 719 |
| nome vazio colapsa a pílula | largura mínima = rótulo + pads | 205,38 |
| `data` indefinida derruba o render; NaN passa pelo `??` | `num()` com `isFinite` e clamps; strings coalescidas | — |
| export refaz base64 dos ativos a cada chamada; erro opaco em CORS | cache por URL; mensagem nomeia o recurso | — |
| ordem de empilhamento ≠ Canva | data no fundo, assinatura sob o anel, como no JSON | sem efeito visual hoje; fidelidade para conteúdo futuro |

Não corrigido por decisão: gradiente `(0,0)→(1,1)` em elipse 847×839 desvia 0,29° de 135° exatos — 14 pontos
amostrados a ±1 nível; irrelevante.

**Semântica do foco:** `fotoX`/`fotoY` = ponto de foco da foto. −1 = esquerda/topo, +1 = direita/base.

## Segunda revisão orquestrada (3 lentes, 2 refutadores por achado)

18 achados; 21 dos refutadores caíram no limite de modelo. Dos que votaram: **6 confirmados por 2 votos**,
2 refutados, 10 sem voto (avaliados por leitura). Todos os confirmados foram corrigidos e verificados
por transição ao vivo em `/estilos/posts` (`window.__setVariante`):

| achado | correção | prova |
|---|---|---|
| foto esticada enquanto o aspecto ainda era o da URL anterior (ou 1 no primeiro paint); export clonava esse frame | aspecto gravado junto com a URL; `<image>` só entra quando `aspecto.url === fotoUrl`; `data-pronto` no `<svg>`; `aguardarPronto()` antes de clonar | troca quadrada→retrato: frame seguinte tem `aspecto: null`, foto não desenhada, `data-pronto="0"`; export durante a troca sai correto |
| `n > 0` congelava a pílula quando o nome era apagado depois da montagem | rótulo (nunca vazio) como sentinela de subárvore renderizada; `n = 0` passa a ser medição legítima | 393,13 → apagar → **205,38** → restaurar → 393,13 |
| `pronta` cacheava a rejeição: uma falha de fonte travava a sessão | `.catch(() => { pronta = null; throw e })`; chamadores medem mesmo em falha | idem para `cssFontesCache` na exportação |
| URL/família da fonte duplicadas em `exportar.ts` e `fontes.ts` | `cssFontFace()` único em `fontes.ts`, importado pela exportação | uma definição só |
| texto de medida ia junto no SVG exportado | `data-medida="1"` removido no clone | XML 7638 → 7513 B |
| `vector-effect: non-scaling-stroke` fixa o traço no viewport — diverge em preview reduzido | traço dividido pela escala do grupo (unidades de usuário) | run 1,83 vs 1,75 do Canva, agora independente do tamanho de exibição |
| `href` + `xlink:href` duplicados dobravam o base64 | só `href` (SVG 2) | — |
| `tamanho` sem limite (canvas inerte no iOS Safari acima de ~4096) | `TAMANHO_MAX` com erro explícito | — |

Refutados com razão: re-render por `setLarguras` (impacto irrelevante) e invalidação do cache de data-URL
(não alcançável no código atual; a foto no cache é deliberada).

### blob.png: 1405 KB → 32 KB

O arquivo era a miniatura pública de 172×200 do Canva **ampliada** para 1584×1840. Guardá-la ampliada era
desperdício: voltar a 172 devolve o dado original. Medido compondo o quadro com cada versão e comparando
com o composto em resolução cheia (canvas inteiro, sem região escolhida a dedo): erro médio 0,16, p99 2,
máx 5. No navegador, sem regressão — global 2,11 → 2,12, onda inferior 3,19.

**Erro de método que cometi aqui:** a primeira tentativa comparou uma região que, nesta página, é coberta
pela pílula. O erro deu 31,21 idêntico em todos os tamanhos, inclusive no original — resultado constante é
sinal de que o teste não está medindo o que diz medir. Refeito contra o composto em resolução cheia.

## A data em arco: o original não é consistente consigo mesmo

Testando uma data longa contra a página 24 ("15 de dezembro", márcia) apareceu uma diferença que
"04 de julho" escondia. A causa está no arquivo do Canva, não no template:

```
p11  "04 de julho"      11 chars + 117 espaços = 128
p24  "15 de dezembro"   14 chars + 110 espaços = 124
```

As datas foram centralizadas **à mão, digitando espaços**. Com o preenchimento, o texto passa da
circunferência do trilho (≈2954 px contra 2802 disponíveis), então cada página comprime um pouco
diferente. Medindo o ângulo do centro da data em cada uma: **16,3° na p11 e 23,3° na p24** — 7° de
variação entre duas páginas do mesmo arquivo. Não existe um valor único a copiar.

Decisão de projeto, não de fidelidade: o texto é ancorado no **meio**, a 18° (a média das duas
páginas). Toda data cai no mesmo lugar independente do comprimento — mais consistente que o original.
`arcoOffset` permite sobrescrever por post.

**A data nunca cruza o anel**, para qualquer comprimento: a base do texto fica a 446 do centro do
canvas, o anel termina em 423,6 do centro da foto (os dois centros distam 8 px), e em `textPath` os
glifos crescem para fora. Folga mínima ≥ 14 px, por construção.

Erro de medição meu no caminho: tentei provar isso contando pixels navy por distância do centro, mas
o filtro pegava o blazer escuro da foto. Geometria resolveu sem medir.

## Estado final

| região | erro médio | p99 |
|---|---|---|
| global | **2,12** | 43 |
| foto | 1,55 | 35 |
| arco | 2,62 | 104 |
| canto | 2,85 | 50 |
| pílula | 4,39 | 60 |
