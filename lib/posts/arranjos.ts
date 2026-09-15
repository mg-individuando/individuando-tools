/**
 * Banco de arranjos de foto, extraído dos posts que o Marcos já fez.
 *
 * Cada arranjo é a geometria real de uma página: onde as fotos ficam, de que
 * tamanho, em que proporção. Sai do JSON do Canva (elementos com
 * `isMediaReplaceable: true`), não de invenção minha.
 *
 * Uma VAGA aceita imagem ou vídeo — o campo `midia` só registra o que estava lá
 * quando extraí, como pista de intenção.
 *
 * O que o JSON do Canva NÃO expõe e por isso não está aqui:
 * borda arredondada de `rect` e sombra. São estilo constante: o raio e a sombra
 * medidos em POST.sombra valem para todas.
 */

export type Midia = "image" | "video";

/** Papel da vaga: nem toda vaga é foto de pessoa. */
export type Papel =
  | "tile"    // foto/vídeo do conteúdo — o que entra em quantidade
  | "mockup"  // moldura de dispositivo (notebook, celular)
  | "tela"    // o que aparece dentro do mockup
  | "destaque";

export interface Vaga {
  /** Em unidades do canvas 1080. */
  x: number; y: number; w: number; h: number;
  rot?: number;
  midia: Midia;
  papel: Papel;
}

export interface Arranjo {
  id: string;
  origem: { design: string; pagina: number; titulo: string };
  identidade: "nova" | "antiga";
  vagas: Vaga[];
}

/** Só as vagas que entram em quantidade — é por elas que se escolhe o arranjo. */
export const contarTiles = (a: Arranjo) => a.vagas.filter((v) => v.papel === "tile").length;

export const ARRANJOS: Arranjo[] = [
  {
    id: "amba-p3",
    origem: { design: "DAHUnVeduKA", pagina: 3, titulo: "SEBRAE AM/BA — Mentorias" },
    identidade: "nova",
    vagas: [
      { x: 62.643, y: 251.467, w: 954.715, h: 577.065, midia: "image", papel: "mockup" },
      { x: 279.909, y: 365.910, w: 520.181, h: 313.591, midia: "image", papel: "tela" },
      { x: 82.784, y: 655.146, w: 426.075, h: 235.021, midia: "image", papel: "tile" },
      { x: 676.505, y: 189.857, w: 426.075, h: 235.021, midia: "image", papel: "tile" },
      { x: 59.227, y: 169.771, w: 426.075, h: 235.021, midia: "image", papel: "tile" },
      { x: 355.120, y: 52.261, w: 426.075, h: 235.021, midia: "image", papel: "tile" },
      { x: 540.000, y: 679.500, w: 426.075, h: 235.021, midia: "image", papel: "tile" },
    ],
  },
  {
    id: "amba-p4",
    origem: { design: "DAHUnVeduKA", pagina: 4, titulo: "SEBRAE AM/BA — Mentorias" },
    identidade: "nova",
    vagas: [
      { x: 62.643, y: 251.467, w: 954.715, h: 577.065, midia: "image", papel: "mockup" },
      { x: 279.909, y: 365.910, w: 520.181, h: 313.591, midia: "image", papel: "tela" },
      { x: 438.255, y: 710.216, w: 412.564, h: 227.568, midia: "image", papel: "tile" },
      { x: 644.537, y: 225.289, w: 412.564, h: 227.568, midia: "image", papel: "tile" },
      { x: 88.638, y: 198.446, w: 412.564, h: 227.568, midia: "image", papel: "tile" },
      { x: 355.612, y: 84.662, w: 412.564, h: 227.568, midia: "image", papel: "tile" },
      { x: 88.638, y: 634.148, w: 412.564, h: 227.568, midia: "image", papel: "tile" },
    ],
  },
  {
    id: "amba-p5",
    origem: { design: "DAHUnVeduKA", pagina: 5, titulo: "SEBRAE AM/BA — Mentorias" },
    identidade: "nova",
    vagas: [
      { x: 62.643, y: 251.467, w: 954.715, h: 577.065, midia: "image", papel: "mockup" },
      { x: 279.909, y: 365.910, w: 520.181, h: 313.591, midia: "image", papel: "tela" },
      { x: 700.179, y: 740.289, w: 314.954, h: 173.727, midia: "image", papel: "tile" },
      { x: 488.408, y: 633.369, w: 314.954, h: 173.727, midia: "image", papel: "tile" },
      { x: 379.821, y: 222.574, w: 314.954, h: 173.727, midia: "image", papel: "tile" },
      { x: 661.272, y: 173.395, w: 314.954, h: 173.727, midia: "image", papel: "tile" },
      { x: 64.867, y: 633.369, w: 314.954, h: 173.727, midia: "image", papel: "tile" },
      { x: 276.638, y: 740.289, w: 314.954, h: 173.727, midia: "image", papel: "tile" },
      { x: 85.669, y: 173.395, w: 314.954, h: 173.727, midia: "image", papel: "tile" },
    ],
  },
  {
    id: "sebraema-p4",
    origem: { design: "DAHM8uMBYk8", pagina: 4, titulo: "SEBRAE MA — JUN/26" },
    identidade: "antiga",
    vagas: [
      { x: 450.191, y: 588.336, w: 521.809, h: 377.445, midia: "video", papel: "tile" },
      { x: 112.353, y: 114.219, w: 314.567, h: 851.562, midia: "video", papel: "tile" },
      { x: 450.191, y: 114.219, w: 521.809, h: 450.255, midia: "image", papel: "tile" },
    ],
  },
  {
    id: "sebraema-p3",
    origem: { design: "DAHM8uMBYk8", pagina: 3, titulo: "SEBRAE MA — JUN/26" },
    identidade: "antiga",
    vagas: [
      { x: 108.000, y: 113.261, w: 864.000, h: 514.874, midia: "video", papel: "tile" },
      { x: 108.000, y: 647.759, w: 864.000, h: 324.241, midia: "image", papel: "tile" },
    ],
  },
  {
    id: "sebraema-p7",
    origem: { design: "DAHM8uMBYk8", pagina: 7, titulo: "SEBRAE MA — JUN/26" },
    identidade: "antiga",
    vagas: [
      { x: 108.000, y: 192.022, w: 573.000, h: 737.926, midia: "image", papel: "tile" },
      { x: 551.208, y: 620.940, w: 420.792, h: 351.060, midia: "image", papel: "tile" },
      { x: 630.644, y: 108.000, w: 341.356, h: 295.652, midia: "image", papel: "tile" },
    ],
  },
];
