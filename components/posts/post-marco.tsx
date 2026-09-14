"use client";

import { useId } from "react";
import { POST, QUADRO, MARCO as M } from "@/lib/posts/tokens";
import { QuadroAssinatura, QuadroRuido } from "./quadro-post";
import { CANTO_ANEIS, CANTO_PONTOS, CANTO_VIEWBOX } from "@/lib/posts/canto";

export interface PostMarcoConfig {
  /** "11", "10", "25" — o que vira o numeral gigante. */
  numero: string;
  /** "ANOS", "EDIÇÕES" — sai na vertical, à direita. */
  rotulo?: string;
}

export const MARCO_PADRAO: PostMarcoConfig = { numero: "11", rotulo: "ANOS" };

/**
 * Marco. Único template com fundo próprio (azul, não creme), então não usa
 * QuadroFundo — mas mantém canto, assinatura, sombra e grão do mesmo sistema.
 */
export function PostMarco({
  config,
  assinaturaUrl = "/marca/assinatura-branca.svg",
  responsivo = false,
  ruido = true,
  svgRef,
  ...svgProps
}: {
  config: PostMarcoConfig;
  assinaturaUrl?: string;
  responsivo?: boolean;
  ruido?: boolean;
  svgRef?: React.Ref<SVGSVGElement>;
} & Omit<React.SVGProps<SVGSVGElement>, "ref" | "width" | "height" | "viewBox">) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (n: string) => `${n}-${uid}`;
  const numero = (config.numero ?? "").toString();
  const rotulo = (config.rotulo ?? "").toString();
  const sx = QUADRO.canto.w / CANTO_VIEWBOX.w;
  const sy = QUADRO.canto.h / CANTO_VIEWBOX.h;
  const C = POST.canvas;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${C} ${C}`}
      {...(responsivo ? { width: "100%" } : { width: C, height: C })}
      xmlns="http://www.w3.org/2000/svg"
      data-pronto="1"
      {...svgProps}
      style={{ display: "block", fontFamily: POST.fonte.familia, aspectRatio: "1 / 1", ...(svgProps.style ?? {}) }}
    >
      <defs>
        <linearGradient id={id("fundo")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={M.fundo.de} />
          <stop offset="1" stopColor={M.fundo.para} />
        </linearGradient>
        {/* marca d'água: os mesmos anéis concêntricos do símbolo, bem apagados */}
        <radialGradient id={id("halo")}>
          <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.72" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="0.9" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width={C} height={C} fill={`url(#${id("fundo")})`} />
      <circle cx={C * 0.62} cy={C * 0.42} r={C * 0.46} fill={`url(#${id("halo")})`} />
      <circle cx={C * 0.62} cy={C * 0.42} r={C * 0.30} fill={`url(#${id("halo")})`} />
      <circle cx={C * 0.62} cy={C * 0.42} r={C * 0.17} fill={`url(#${id("halo")})`} />

      <g transform={`translate(${QUADRO.canto.x} ${QUADRO.canto.y}) scale(${sx} ${sy})`} opacity={0.5}>
        <g fill="none" stroke="#ffffff" strokeWidth={QUADRO.canto.tracoPx / ((sx + sy) / 2)}>
          {CANTO_ANEIS.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}
        </g>
        <g fill="#ffffff">
          {CANTO_PONTOS.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}
        </g>
      </g>

      <text
        x={C * 0.40} y={M.numero.y}
        fontSize={M.numero.corpo} fontWeight={M.numero.peso}
        fill="#ffffff" textAnchor="middle" dominantBaseline="central"
      >
        {numero}
      </text>

      {rotulo && (
        <text
          x={C * 0.795} y={M.numero.y}
          fontSize={M.rotulo.corpo} fontWeight={POST.fonte.medio}
          fill="#ffffff" textAnchor="middle" dominantBaseline="central"
          transform={`rotate(90 ${C * 0.795} ${M.numero.y})`}
          style={{ letterSpacing: `${M.rotulo.espacamentoEm}em` }}
        >
          {rotulo}
        </text>
      )}

      <QuadroAssinatura url={assinaturaUrl} />
      {ruido && <QuadroRuido uid={uid} />}
    </svg>
  );
}

export default PostMarco;
