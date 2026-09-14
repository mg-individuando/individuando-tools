"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { POST, PRESENCA as P } from "@/lib/posts/tokens";
import { QuadroBase, QuadroDefs, QuadroFundo, QuadroAssinatura, QuadroRuido } from "./quadro-post";
import { garantirFontePost } from "@/lib/posts/fontes";

/** Baseline da primeira linha do título, medida contra o render do Canva. */
const BASE_TITULO = 49;

export interface PostPresencaConfig {
  /** "mentorias online", "estivemos com o" — quebra em várias linhas sozinho. */
  titulo: string;
  /** Logo do parceiro. Precisa ter fundo transparente para o branco funcionar. */
  logoUrl: string;
  /** Pinta o logo de branco, como o Canva faz por recolorização. */
  logoBranco?: boolean;
  /** Chip de região: "AM / BA", "MARANHÃO". Vazio esconde o chip. */
  regiao?: string;
}

export const PRESENCA_PADRAO: PostPresencaConfig = {
  titulo: "mentorias online",
  logoUrl: "",
  logoBranco: true,
  regiao: "",
};

export function PostPresenca({
  config,
  blobUrl = "/marca/blob.png",
  assinaturaUrl = "/marca/assinatura-branca.svg",
  responsivo = false,
  ruido = true,
  svgRef,
  ...svgProps
}: {
  config: PostPresencaConfig;
  blobUrl?: string;
  assinaturaUrl?: string;
  responsivo?: boolean;
  ruido?: boolean;
  svgRef?: React.Ref<SVGSVGElement>;
} & Omit<React.SVGProps<SVGSVGElement>, "ref" | "width" | "height" | "viewBox">) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (n: string) => `${n}-${uid}`;

  const titulo = (config.titulo ?? "").toString();
  const regiao = (config.regiao ?? "").toString().trim();
  const logoUrl = (config.logoUrl ?? "").toString();
  const logoBranco = config.logoBranco !== false;

  // o chip encolhe/cresce com o texto, como a pílula do aniversário
  const chipRef = useRef<SVGTextElement>(null);
  const [larguraChip, setLarguraChip] = useState(0);
  const medir = () => {
    const w = chipRef.current?.getBBox().width ?? 0;
    if (w > 0) setLarguraChip(w);
  };
  useLayoutEffect(medir, [regiao]);
  useEffect(() => {
    let vivo = true;
    garantirFontePost().catch(() => {}).then(() => { if (vivo) medir(); });
    const ao = () => medir();
    document.fonts.addEventListener("loadingdone", ao);
    return () => { vivo = false; document.fonts.removeEventListener("loadingdone", ao); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // "AM / BA" mede 214,2 px em 50,67 bold e o chip original tem 299,57 de largura:
  // sobram 42,7 de cada lado. Uso 40 de padding e a largura do token como piso, então
  // "AM / BA" reproduz o original e um texto maior ("MARANHÃO") faz o chip crescer.
  const padChip = 40;
  const chipW = Math.max(P.chip.w, larguraChip + padChip * 2);
  const chipX = P.chip.x + P.chip.w - chipW;        // ancorado à direita do cartão

  // o título quebra em linhas: o Canva usa caixa de 349,78 de largura
  const linhas = quebrar(titulo, P.titulo.largura, P.titulo.corpo);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${POST.canvas} ${POST.canvas}`}
      {...(responsivo ? { width: "100%" } : { width: POST.canvas, height: POST.canvas })}
      xmlns="http://www.w3.org/2000/svg"
      data-pronto="1"
      {...svgProps}
      style={{ display: "block", fontFamily: POST.fonte.familia, aspectRatio: "1 / 1", ...(svgProps.style ?? {}) }}
    >
      <defs>
        <QuadroDefs uid={uid} />
        <linearGradient id={id("gradCartao")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={POST.cor.azulClaro} />
          <stop offset="1" stopColor={POST.cor.azulEscuro} />
        </linearGradient>
        <filter id={id("sombraCartao")} x="-15%" y="-15%" width="140%" height="150%">
          <feDropShadow
            dx={POST.sombra.anel.dx} dy={POST.sombra.anel.dy}
            stdDeviation={POST.sombra.anel.desfoque}
            floodColor="#000000" floodOpacity={POST.sombra.anel.opacidade}
          />
        </filter>
        <filter id={id("sombraChip")} x="-25%" y="-25%" width="160%" height="170%">
          <feDropShadow
            dx={POST.sombra.pilula.dx} dy={POST.sombra.pilula.dy}
            stdDeviation={POST.sombra.pilula.desfoque}
            floodColor="#000000" floodOpacity={POST.sombra.pilula.opacidade}
          />
        </filter>
        {/* zera RGB para branco preservando o alfa — é a recolorização que o Canva aplica */}
        <filter id={id("aoBranco")}>
          <feColorMatrix type="matrix"
            values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" />
        </filter>
      </defs>

      <QuadroBase />
      <QuadroFundo uid={uid} blobUrl={blobUrl} />
      <QuadroAssinatura url={assinaturaUrl} />

      <text
        x={P.titulo.x}
        fontSize={P.titulo.corpo}
        fontWeight={POST.fonte.medio}
        fill={POST.cor.navy}
      >
        {linhas.map((l, i) => (
          <tspan key={i} x={P.titulo.x} y={P.titulo.y + BASE_TITULO + i * P.titulo.corpo * P.titulo.entrelinha}>
            {l}
          </tspan>
        ))}
      </text>

      <rect
        x={P.cartao.x} y={P.cartao.y} width={P.cartao.w} height={P.cartao.h}
        rx={POST.raioPilula}
        fill={`url(#${id("gradCartao")})`}
        filter={`url(#${id("sombraCartao")})`}
      />
      {logoUrl && (
        <image
          href={logoUrl}
          x={P.logo.x} y={P.logo.y} width={P.logo.w} height={P.logo.h}
          preserveAspectRatio="xMidYMid meet"
          filter={logoBranco ? `url(#${id("aoBranco")})` : undefined}
        />
      )}

      {regiao && (
        <>
          <rect
            x={chipX} y={P.chip.y} width={chipW} height={P.chip.h}
            rx={POST.raioPilula} fill={POST.cor.pilula}
            filter={`url(#${id("sombraChip")})`}
          />
          <text
            ref={chipRef}
            x={chipX + chipW / 2}
            y={P.chip.y + P.chip.h / 2 + P.chip.corpo * 0.35}
            fontSize={P.chip.corpo} fontWeight={700} fill={POST.cor.azulClaro}
            textAnchor="middle"
          >
            {regiao}
          </text>
        </>
      )}

      {ruido && <QuadroRuido uid={uid} />}
    </svg>
  );
}

/** Quebra grosseira por largura — Montserrat medium tem ~0,55em por caractere. */
function quebrar(texto: string, largura: number, corpo: number): string[] {
  const max = Math.max(1, Math.floor(largura / (corpo * 0.55)));
  const palavras = texto.split(/\s+/).filter(Boolean);
  const linhas: string[] = [];
  let atual = "";
  for (const p of palavras) {
    const tentativa = atual ? `${atual} ${p}` : p;
    if (tentativa.length > max && atual) { linhas.push(atual); atual = p; }
    else atual = tentativa;
  }
  if (atual) linhas.push(atual);
  return linhas.length ? linhas : [""];
}

export default PostPresenca;
