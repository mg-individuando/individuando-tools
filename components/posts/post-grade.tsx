"use client";

import { useEffect, useId, useState } from "react";
import { POST, GRADE as G } from "@/lib/posts/tokens";
import { QuadroBase, QuadroDefs, QuadroFundo, QuadroAssinatura, QuadroRuido } from "./quadro-post";

export interface PostGradeConfig {
  /** 2 a 6 fotos. A grade se reorganiza conforme a quantidade. */
  fotos: string[];
  /** Texto curto no topo. Opcional. */
  titulo?: string;
}

export const GRADE_PADRAO: PostGradeConfig = { fotos: [], titulo: "" };

/**
 * Arranjos por quantidade, em fração da área útil (x, y, largura, altura).
 * Não são grades regulares: o original alterna tamanhos para não virar tabela.
 */
const ARRANJOS: Record<number, [number, number, number, number][]> = {
  1: [[0, 0, 1, 1]],
  2: [[0, 0, 1, 0.49], [0, 0.51, 1, 0.49]],
  3: [[0, 0, 0.62, 1], [0.64, 0, 0.36, 0.49], [0.64, 0.51, 0.36, 0.49]],
  4: [[0, 0, 0.49, 0.49], [0.51, 0, 0.49, 0.49],
      [0, 0.51, 0.49, 0.49], [0.51, 0.51, 0.49, 0.49]],
  5: [[0, 0, 0.49, 0.62], [0.51, 0, 0.49, 0.38],
      [0.51, 0.40, 0.23, 0.28], [0.77, 0.40, 0.23, 0.28],
      [0, 0.64, 1, 0.36]],
  6: [[0, 0, 0.32, 0.49], [0.34, 0, 0.32, 0.49], [0.68, 0, 0.32, 0.49],
      [0, 0.51, 0.32, 0.49], [0.34, 0.51, 0.32, 0.49], [0.68, 0.51, 0.32, 0.49]],
};

export function PostGrade({
  config,
  blobUrl = "/marca/blob.png",
  assinaturaUrl = "/marca/assinatura-branca.svg",
  responsivo = false,
  ruido = true,
  svgRef,
  ...svgProps
}: {
  config: PostGradeConfig;
  blobUrl?: string;
  assinaturaUrl?: string;
  responsivo?: boolean;
  ruido?: boolean;
  svgRef?: React.Ref<SVGSVGElement>;
} & Omit<React.SVGProps<SVGSVGElement>, "ref" | "width" | "height" | "viewBox">) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (n: string) => `${n}-${uid}`;
  const fotos = (config.fotos ?? []).filter(Boolean).slice(0, 6);
  const titulo = (config.titulo ?? "").toString();
  const arranjo = ARRANJOS[fotos.length] ?? [];

  // cada foto entra cobrindo o seu quadro, sem distorcer
  const [aspectos, setAspectos] = useState<Record<string, number>>({});
  useEffect(() => {
    let vivo = true;
    for (const src of fotos) {
      if (aspectos[src]) continue;
      const img = new Image();
      img.onload = () => {
        if (vivo && img.naturalWidth && img.naturalHeight)
          setAspectos((a) => ({ ...a, [src]: img.naturalWidth / img.naturalHeight }));
      };
      img.src = src;
    }
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fotos.join("|")]);

  const area = { ...G.area, y: titulo ? G.area.y + 60 : G.area.y, h: titulo ? G.area.h - 60 : G.area.h };
  const prontas = fotos.every((f) => aspectos[f]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${POST.canvas} ${POST.canvas}`}
      {...(responsivo ? { width: "100%" } : { width: POST.canvas, height: POST.canvas })}
      xmlns="http://www.w3.org/2000/svg"
      data-pronto={prontas ? "1" : "0"}
      {...svgProps}
      style={{ display: "block", fontFamily: POST.fonte.familia, aspectRatio: "1 / 1", ...(svgProps.style ?? {}) }}
    >
      <defs>
        <QuadroDefs uid={uid} />
        {arranjo.map((_, i) => {
          const [fx, fy, fw, fh] = arranjo[i];
          return (
            <clipPath key={i} id={id(`q${i}`)}>
              <rect
                x={area.x + fx * area.w} y={area.y + fy * area.h}
                width={fw * area.w - G.vao / 2} height={fh * area.h - G.vao / 2}
                rx={G.raio}
              />
            </clipPath>
          );
        })}
      </defs>

      <QuadroBase />
      <QuadroFundo uid={uid} blobUrl={blobUrl} />
      <QuadroAssinatura url={assinaturaUrl} />

      {titulo && (
        <text x={G.margem} y={G.area.y + 6} fontSize={52} fontWeight={POST.fonte.medio} fill={POST.cor.navy}>
          {titulo}
        </text>
      )}

      {prontas && arranjo.map(([fx, fy, fw, fh], i) => {
        const src = fotos[i];
        const cw = fw * area.w - G.vao / 2;
        const ch = fh * area.h - G.vao / 2;
        const cx = area.x + fx * area.w;
        const cy = area.y + fy * area.h;
        const a = aspectos[src] ?? 1;
        // cobre o quadro pelo lado que falta, sem distorcer
        const w = a >= cw / ch ? ch * a : cw;
        const h = a >= cw / ch ? ch : cw / a;
        return (
          <g key={i} clipPath={`url(#${id(`q${i}`)})`}>
            <image
              href={src}
              x={cx + (cw - w) / 2} y={cy + (ch - h) / 2}
              width={w} height={h}
              preserveAspectRatio="none"
            />
          </g>
        );
      })}

      {ruido && <QuadroRuido uid={uid} />}
    </svg>
  );
}

export default PostGrade;
