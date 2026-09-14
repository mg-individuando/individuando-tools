/**
 * Tokens da identidade aplicada aos posts sociais.
 * Extraídos do Canva: design DAHU3eX9sD4 (aniversários) e DAHUnVeduKA (SEBRAE AM/BA).
 * Tipografia confirmada nas fontes embutidas do PDF exportado: Montserrat 500 / 800.
 *
 * NOTA: o app usa --ind-navy #1e2f4c; a identidade nova e os posts usam #1d2e4c.
 * Mantido aqui o valor dos posts. Unificar quando o Marcos decidir.
 */
export const POST = {
  canvas: 1080,
  cor: {
    creme:       "#f8f4ed",
    navy:        "#1d2e4c",
    azulClaro:   "#7daff7",
    azulEscuro:  "#3e54a4",
    azulSuave:   "#8aa1c8",
    cantoAnel:   "#a2c3f1",
    cantoPonto:  "#ffffff",
    pilula:      "#f5f5f5",
  },
  fonte: {
    familia: "Montserrat",
    medio: 500,
    forte: 800,
  },
  raioPilula: 20,
} as const;

/** Geometria do quadro — idêntica em todos os templates. Medida, não estimada. */
export const QUADRO = {
  blob:       { x: 200.933, y: 268.952, w: 1606.895, h: 1702.857,
                imgX: -37.7496, imgY: 0, imgW: 1682.394, imgH: 1956.273 },
  // Canva gira -180 o SEU ativo; o Corner_3.svg já está na orientação final.
  // tracoPx: espessura dos anéis em px finais, calibrada contra o render do Canva (run médio 1,75 px); o SVG oficial tem 0,37 na escala nativa.
  canto:      { x: 40, y: 608, w: 400.582, h: 432, rotacao: 0, tracoPx: 1.3 },
  assinatura: { x: 739.085, y: 1005.338, w: 300.915, h: 34.662 },
  circulos: [
    { x: 589.614, y: 499.048, d: 599.857, grau: -90, alt: false },
    { x: 715.797, y: 567.285, d: 463.382, grau:  90, alt: false },
    { x: 811.589, y: 620.327, d: 357.298, grau: -90, alt: false },
    { x: 884.892, y: 662.124, d: 273.703, grau: -90, alt: false },
    { x: 955.987, y: 702.818, d: 192.317, grau:   0, alt: true },
  ],
} as const;

/** Miolo do aniversário. */
export const ANIVERSARIO = {
  anel:   { x: 109.722, y: 127.054, w: 847.227, h: 838.686 },
  foto:   { x: 137.338, y: 150.399, d: 791.995 },
  // marcos: 38 + 313.53 + 41.6 = 393.1 ✓ · ana: 235.8 ✓
  // fimMax: borda direita máxima da pílula — 20 px antes da assinatura (x 739.085) para nunca cobri-la
  pilula: { x: 70, y: 853.833, h: 164.167, padEsq: 38, padDir: 41.6, fimMax: 719 },
  rotulo: { x: 108, y: 873.236, corpo: 40, entrelinha: 1.4 },
  nome:   { x: 108, y: 902.6,   corpo: 80, corpoMin: 44, entrelinha: 1 }, // corpoMin: piso do auto-ajuste (= corpo da data)
  arco:   { raio: 446, corpo: 44, espacamentoEm: 0.212, offsetPadrao: 0.601 }, // letterSpacing do Canva é fração do corpo (em), não px; offsetPadrao 0.601 ≈ 18° à direita das 12h
} as const;
