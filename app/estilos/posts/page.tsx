"use client";

/**
 * Preview de calibração dos posts sociais.
 * Renderiza o template em 1080×1080 reais, só depois da fonte compartilhada
 * (a mesma que a exportação embute) estar carregada.
 */
import { useEffect, useState } from "react";
import { PostAniversario } from "@/components/posts/post-aniversario";
import { svgParaCanvas, svgParaPng } from "@/lib/posts/exportar";
import { garantirFontePost } from "@/lib/posts/fontes";

type Stats = { media: number; max: number; p99: number };
function stats(vals: Float64Array | number[]): Stats {
  const arr = Float64Array.from(vals as ArrayLike<number>).sort();
  const n = arr.length;
  let soma = 0;
  for (let i = 0; i < n; i++) soma += arr[i];
  return { media: +(soma / n).toFixed(2), max: +arr[n - 1].toFixed(0), p99: +arr[Math.floor(n * 0.99)].toFixed(0) };
}

/** Regiões de interesse em coordenadas 1080. */
const REGIOES: Record<string, [number, number, number, number]> = {
  arco:       [480,  40, 1040, 200],
  foto:       [140, 150,  930, 940],
  pilula:     [ 60, 845,  480, 1025],
  canto:      [ 40, 608,  441, 1040],
  circulos:   [590, 500, 1080, 1000],
  assinatura: [735,1000, 1045, 1045],
};

async function diffContraReferencia(refUrl: string) {
  const svg = document.querySelector("#palco svg") as SVGSVGElement | null;
  if (!svg) throw new Error("sem svg no palco");
  const T = 1080;
  const meu = await svgParaCanvas(svg, T);
  const ref = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = refUrl;
  });
  const rc = document.createElement("canvas"); rc.width = rc.height = T;
  rc.getContext("2d")!.drawImage(ref, 0, 0, T, T);
  const A = meu.getContext("2d")!.getImageData(0, 0, T, T).data;
  const B = rc.getContext("2d")!.getImageData(0, 0, T, T).data;

  const dif = new Float64Array(T * T);
  for (let i = 0, p = 0; i < A.length; i += 4, p++) {
    dif[p] = (Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2])) / 3;
  }
  const regioes: Record<string, Stats> = {};
  for (const [nome, [x0, y0, x1, y1]] of Object.entries(REGIOES)) {
    const vals: number[] = [];
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) vals.push(dif[y * T + x]);
    regioes[nome] = stats(vals);
  }
  // heatmap 216px (blocos 5×5), amplificado ×4
  const H = 216, k = T / H;
  const hc = document.createElement("canvas"); hc.width = hc.height = H;
  const hctx = hc.getContext("2d")!; const img = hctx.createImageData(H, H);
  for (let hy = 0; hy < H; hy++) for (let hx = 0; hx < H; hx++) {
    let s = 0;
    for (let dy = 0; dy < k; dy++) for (let dx = 0; dx < k; dx++) s += dif[(hy * k + dy) * T + (hx * k + dx)];
    const v = Math.min(255, (s / (k * k)) * 4);
    const o = (hy * H + hx) * 4; img.data[o] = img.data[o + 1] = img.data[o + 2] = v; img.data[o + 3] = 255;
  }
  hctx.putImageData(img, 0, 0);
  return { global: stats(dif), regioes, heat: hc.toDataURL("image/png") };
}

declare global {
  interface Window {
    __diffPost?: (refUrl: string) => Promise<unknown>;
    __exportarPost?: () => Promise<string>;
    /** Dev: troca props em tempo real para exercitar transições pós-montagem. */
    __setVariante?: (patch: Partial<Variante>) => void;
  }
}

type Variante = {
  data: string; rotulo: "dia do" | "dia da"; nome: string; fotoUrl: string;
  fotoX?: number; fotoY?: number; fotoZoom?: number; arcoOffset?: number;
};
const PADRAO: Variante = { data: "04 de julho", rotulo: "dia do", nome: "marcos", fotoUrl: "/marca/_teste-marcos.jpg" };

/** Lê ?data=&rotulo=&nome=&foto=&fx=&fy=&zoom=&offset= para testar variantes sem editar código. */
function lerVariante(): Variante {
  const q = new URLSearchParams(window.location.search);
  const n = (k: string) => (q.has(k) ? Number(q.get(k)) : undefined);
  return {
    data: q.get("data") ?? PADRAO.data,
    rotulo: (q.get("rotulo") as Variante["rotulo"]) ?? PADRAO.rotulo,
    nome: q.has("nome") ? (q.get("nome") ?? "") : PADRAO.nome,
    fotoUrl: q.get("foto") ?? PADRAO.fotoUrl,
    fotoX: n("fx"), fotoY: n("fy"), fotoZoom: n("zoom"), arcoOffset: n("offset"),
  };
}

export default function PostsPreviewPage() {
  const [pronto, setPronto] = useState(false);
  const [variante, setVariante] = useState<Variante>(PADRAO);
  useEffect(() => {
    let vivo = true;
    setVariante(lerVariante());
    garantirFontePost().then(() => { if (vivo) setPronto(true); });
    window.__diffPost = diffContraReferencia;
    window.__setVariante = (patch) => setVariante((v) => ({ ...v, ...patch }));
    window.__exportarPost = async () => {
      const svg = document.querySelector("#palco svg") as SVGSVGElement;
      return URL.createObjectURL(await svgParaPng(svg));
    };
    return () => {
      vivo = false;
      delete window.__diffPost; delete window.__exportarPost; delete window.__setVariante;
    };
  }, []);

  return (
    <div id="palco" data-pronto={pronto ? "1" : "0"} style={{ width: 1080, height: 1080 }}>
      {pronto && (
        <PostAniversario config={variante} />
      )}
    </div>
  );
}
