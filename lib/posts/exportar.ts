/**
 * Exportação de post: SVG vivo no DOM → PNG exato, em qualquer tamanho.
 *
 * O rasterizador de SVG-como-imagem do navegador NÃO busca recursos externos.
 * Por isso tudo entra embutido: imagens viram data-URI e as fontes viram
 * @font-face base64 dentro de <defs><style>. O que sai é idêntico ao preview
 * porque É o mesmo SVG.
 */


import { FONTE_POST_URL, cssFontFace } from "./fontes";

const SVG_NS = "http://www.w3.org/2000/svg";
const XLINK_NS = "http://www.w3.org/1999/xlink";

/** Cache por URL: os ativos de marca não mudam entre exportações; fotos repetem entre preview e export. */
const cacheDataUrl = new Map<string, Promise<string>>();

async function paraDataUrl(url: string): Promise<string> {
  const emCache = cacheDataUrl.get(url);
  if (emCache) return emCache;
  const p = (async () => {
    let r: Response;
    try {
      r = await fetch(url, { mode: "cors" });
    } catch (e) {
      throw new Error(`não consegui buscar ${url} — se for outra origem, ela precisa permitir CORS (${(e as Error).message})`);
    }
    if (!r.ok) throw new Error(`falha ao carregar ${url}: HTTP ${r.status}`);
    const blob = await r.blob();
    return new Promise<string>((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result as string);
      fr.onerror = () => rej(new Error(`falha ao ler ${url}`));
      fr.readAsDataURL(blob);
    });
  })();
  cacheDataUrl.set(url, p);
  p.catch(() => cacheDataUrl.delete(url)); // não cacheia falha
  return p;
}

let cssFontesCache: Promise<string> | null = null;
/** @font-face com o woff2 embutido em base64 — o rasterizador não busca recursos externos. */
function cssFontes(): Promise<string> {
  cssFontesCache ??= paraDataUrl(FONTE_POST_URL)
    .then(cssFontFace)
    .catch((e) => {
      cssFontesCache = null; // falha transitória não trava os próximos exports
      throw e;
    });
  return cssFontesCache;
}

/** Espera o SVG sinalizar data-pronto="1" (foto medida). Resolve na hora se já estiver. */
export function aguardarPronto(origem: SVGSVGElement, msMax = 10_000): Promise<void> {
  if (origem.getAttribute("data-pronto") !== "0") return Promise.resolve();
  return new Promise((res) => {
    const obs = new MutationObserver(() => {
      if (origem.getAttribute("data-pronto") !== "0") { obs.disconnect(); clearTimeout(t); res(); }
    });
    const t = setTimeout(() => { obs.disconnect(); res(); }, msMax); // não trava a exportação
    obs.observe(origem, { attributes: true, attributeFilter: ["data-pronto"] });
  });
}

/** Clona o SVG e embute imagens e fontes. Devolve o XML serializado. */
export async function svgAutocontido(origem: SVGSVGElement): Promise<string> {
  await aguardarPronto(origem);
  const svg = origem.cloneNode(true) as SVGSVGElement;
  svg.querySelectorAll("[data-medida]").forEach((e) => e.remove()); // texto auxiliar de medição
  svg.setAttribute("xmlns", SVG_NS);
  svg.setAttribute("xmlns:xlink", XLINK_NS);

  await Promise.all(
    Array.from(svg.querySelectorAll("image")).map(async (img) => {
      const href = img.getAttribute("href") ?? img.getAttributeNS(XLINK_NS, "href");
      if (!href || href.startsWith("data:")) return;
      const data = await paraDataUrl(new URL(href, location.href).toString());
      img.setAttribute("href", data);
      // NÃO duplicar em xlink:href — dobraria o base64 (blob.png sozinho tem 1,4 MB)
      img.removeAttributeNS(XLINK_NS, "href");
    }),
  );

  const style = document.createElementNS(SVG_NS, "style");
  style.textContent = await cssFontes();
  let defs = svg.querySelector("defs");
  if (!defs) {
    defs = document.createElementNS(SVG_NS, "defs");
    svg.insertBefore(defs, svg.firstChild);
  }
  defs.insertBefore(style, defs.firstChild);

  return new XMLSerializer().serializeToString(svg);
}

/** Rasteriza o SVG num canvas quadrado do tamanho pedido. */
/** Acima disso o canvas do iOS Safari devolve imagem em branco em vez de falhar. */
export const TAMANHO_MAX = 4096;

export async function svgParaCanvas(origem: SVGSVGElement, tamanho = 1080): Promise<HTMLCanvasElement> {
  if (!Number.isFinite(tamanho) || tamanho < 1) throw new Error(`tamanho inválido: ${tamanho}`);
  if (tamanho > TAMANHO_MAX) throw new Error(`tamanho ${tamanho} acima do limite seguro de ${TAMANHO_MAX} px`);
  const xml = await svgAutocontido(origem);
  const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("o SVG não rasterizou"));
      i.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = tamanho;
    canvas.height = tamanho;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas 2d indisponível");
    ctx.drawImage(img, 0, 0, tamanho, tamanho);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function svgParaPng(origem: SVGSVGElement, tamanho = 1080): Promise<Blob> {
  const canvas = await svgParaCanvas(origem, tamanho);
  return new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob falhou"))), "image/png"),
  );
}
