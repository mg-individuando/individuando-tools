"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { POST, QUADRO, ANIVERSARIO as A } from "@/lib/posts/tokens";
import { CANTO_ANEIS, CANTO_PONTOS, CANTO_VIEWBOX } from "@/lib/posts/canto";
import { garantirFontePost } from "@/lib/posts/fontes";

/** Baselines calibradas contra o export do Canva (pg11 = marcos). Ver lib/posts/CALIBRACAO.md. */
const BASE_ROTULO = 38;
const BASE_NOME = 75.8;

export interface PostAniversarioConfig {
  data: string;                 // "04 de julho"
  rotulo: "dia do" | "dia da";
  nome: string;
  fotoUrl: string;
  /**
   * Enquadramento — alavanca 1. fotoX/fotoY são o PONTO DE FOCO da foto:
   * -1 = borda esquerda / topo da foto, 0 = centro, +1 = borda direita / base. Alcançam as bordas
   * mesmo em foto não quadrada. fotoZoom ≥ 1 (1 = a foto cobre o círculo exatamente).
   */
  fotoX?: number;
  fotoY?: number;
  fotoZoom?: number;
  /** Corpo do nome em px. Omitido = auto-ajuste: reduz até a pílula não invadir a assinatura. */
  nomeCorpo?: number;
  /** Posição da data no arco, 0..1. Padrão calibrado em tokens. */
  arcoOffset?: number;
}

export const ANIVERSARIO_PADRAO: PostAniversarioConfig = {
  data: "04 de julho",
  rotulo: "dia do",
  nome: "marcos",
  fotoUrl: "",
  fotoX: 0,
  fotoY: 0,
  fotoZoom: 1,
};

const num = (v: unknown, padrao: number, min = -Infinity, max = Infinity) => {
  const n = typeof v === "number" && Number.isFinite(v) ? v : padrao;
  return Math.min(max, Math.max(min, n));
};

/** Largura estimada antes da medição real, para não piscar com a pílula errada. */
const estimarLargura = (texto: string, corpo: number, fator: number) =>
  Math.max(0, texto.length) * corpo * fator;

export function PostAniversario({
  config,
  blobUrl = "/marca/blob.png",
  assinaturaUrl = "/marca/assinatura-branca.svg",
}: {
  config: PostAniversarioConfig;
  blobUrl?: string;
  assinaturaUrl?: string;
}) {
  const data = (config.data ?? "").toString();
  const rotulo = (config.rotulo ?? "dia do").toString();
  const nome = (config.nome ?? "").toString();
  const fotoUrl = (config.fotoUrl ?? "").toString();
  const fotoX = num(config.fotoX, 0, -1, 1);
  const fotoY = num(config.fotoY, 0, -1, 1);
  const zoom = num(config.fotoZoom, 1, 1, 8);
  const offset = num(config.arcoOffset, A.arco.offsetPadrao, 0, 1);

  // ids únicos por instância: duas prévias na mesma página não podem compartilhar clipPath/gradiente
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (n: string) => `${n}-${uid}`;

  // ---- alavanca 2: pílula se ajusta ao texto, medido com a fonte certa ----
  const medidaRef = useRef<SVGTextElement>(null);
  const rotuloRef = useRef<SVGTextElement>(null);
  const [larguras, setLarguras] = useState(() => ({
    nome: estimarLargura(nome, A.nome.corpo, 0.62),
    rotulo: estimarLargura(rotulo, A.rotulo.corpo, 0.55),
  }));
  const medir = () => {
    // o nome é medido num texto invisível no corpo NOMINAL, para o auto-ajuste não realimentar a medição
    const n = medidaRef.current?.getBBox().width ?? 0;
    const r = rotuloRef.current?.getBBox().width ?? 0;
    // o rótulo nunca é vazio (coalescido acima), então r > 0 prova que a subárvore está sendo
    // renderizada. Só então n = 0 é uma medição legítima (nome apagado) e não "display:none".
    if (r > 0) setLarguras((l) => (l.nome === n && l.rotulo === r ? l : { nome: n, rotulo: r }));
  };
  useLayoutEffect(medir, [nome, rotulo]);
  useEffect(() => {
    let vivo = true;
    garantirFontePost().catch(() => {}).then(() => { if (vivo) medir(); });
    const aoCarregar = () => medir();
    document.fonts.addEventListener("loadingdone", aoCarregar);
    return () => { vivo = false; document.fonts.removeEventListener("loadingdone", aoCarregar); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // auto-ajuste tipográfico (alavanca 2): a pílula não pode passar de fimMax; se o nome nominal não cabe,
  // o corpo cai proporcionalmente até corpoMin. Override manual via config.nomeCorpo.
  const nomeMaxW = A.pilula.fimMax - A.pilula.x - A.pilula.padEsq - A.pilula.padDir;
  const corpoAuto = larguras.nome > nomeMaxW
    ? Math.max(A.nome.corpoMin, A.nome.corpo * (nomeMaxW / larguras.nome))
    : A.nome.corpo;
  const nomeCorpo = num(config.nomeCorpo, corpoAuto, A.nome.corpoMin, A.nome.corpo);
  const nomeW = larguras.nome * (nomeCorpo / A.nome.corpo);
  const pilulaW = A.pilula.padEsq + Math.max(nomeW, larguras.rotulo) + A.pilula.padDir;

  // ---- alavanca 1: a foto entra com a proporção real, e o pan alcança as bordas ----
  // o aspecto é gravado JUNTO com a URL que o produziu: enquanto não bate com a foto atual,
  // a foto não é desenhada (evita um frame esticado e, pior, um export clonado nesse frame)
  const [medidaFoto, setMedidaFoto] = useState<{ url: string; aspecto: number } | null>(null);
  useEffect(() => {
    if (!fotoUrl) { setMedidaFoto(null); return; }
    let vivo = true;
    const img = new Image();
    img.onload = () => {
      if (vivo && img.naturalWidth && img.naturalHeight)
        setMedidaFoto({ url: fotoUrl, aspecto: img.naturalWidth / img.naturalHeight });
    };
    img.onerror = () => { if (vivo) setMedidaFoto(null); };
    img.src = fotoUrl;
    return () => { vivo = false; img.src = ""; };
  }, [fotoUrl]);
  const aspecto = medidaFoto?.url === fotoUrl ? medidaFoto.aspecto : null;
  const fotoPronta = aspecto !== null;
  const d = A.foto.d;
  const cx = A.foto.x + d / 2;
  const cy = A.foto.y + d / 2;
  // cobre o círculo no zoom 1: o lado menor da imagem = d
  const a = aspecto ?? 1;
  const imgW = (a >= 1 ? d * a : d) * zoom;
  const imgH = (a >= 1 ? d : d / a) * zoom;
  const fx = cx - imgW / 2 - fotoX * ((imgW - d) / 2);
  const fy = cy - imgH / 2 - fotoY * ((imgH - d) / 2);

  const sxCanto = QUADRO.canto.w / CANTO_VIEWBOX.w;
  const syCanto = QUADRO.canto.h / CANTO_VIEWBOX.h;

  return (
    <svg
      viewBox={`0 0 ${POST.canvas} ${POST.canvas}`}
      width={POST.canvas}
      height={POST.canvas}
      xmlns="http://www.w3.org/2000/svg"
      data-pronto={!fotoUrl || fotoPronta ? "1" : "0"}
      style={{ display: "block", fontFamily: POST.fonte.familia }}
    >
      <defs>
        <clipPath id={id("clipBlob")}>
          <rect x={QUADRO.blob.x} y={QUADRO.blob.y} width={QUADRO.blob.w} height={QUADRO.blob.h} />
        </clipPath>
        <clipPath id={id("clipFoto")}>
          <circle cx={cx} cy={cy} r={d / 2} />
        </clipPath>
        {/* "rotation: 135" do Canva ≡ (0,0)→(1,1) em objectBoundingBox — verificado por amostragem em 8 ângulos */}
        <linearGradient id={id("gradAnel")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={POST.cor.azulClaro} />
          <stop offset="1" stopColor={POST.cor.azulEscuro} />
        </linearGradient>
        <linearGradient id={id("gradCirc")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#faf6ee" stopOpacity="0" />
          <stop offset="0.5" stopColor="#f9f5ed" stopOpacity="0.465" />
          <stop offset="1" stopColor="#f9f5ed" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id("gradCircAlt")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f9f5ed" stopOpacity="0.4" />
          <stop offset="0.5" stopColor="#f9f5ed" stopOpacity="0" />
          <stop offset="1" stopColor="#f9f5ed" stopOpacity="0.4" />
        </linearGradient>
        <path
          id={id("trilhoData")}
          fill="none"
          d={`M ${POST.canvas / 2 - A.arco.raio},${POST.canvas / 2} A ${A.arco.raio},${A.arco.raio} 0 1,1 ${POST.canvas / 2 + A.arco.raio},${POST.canvas / 2}`}
        />
      </defs>

      {/* ---------- ordem de empilhamento igual à do Canva: data no fundo, assinatura sob o anel ---------- */}
      <rect width={POST.canvas} height={POST.canvas} fill={POST.cor.creme} />

      <text
        fontSize={A.arco.corpo}
        fontWeight={POST.fonte.medio}
        fill={POST.cor.navy}
        style={{ letterSpacing: `${A.arco.espacamentoEm}em` }}
      >
        <textPath href={`#${id("trilhoData")}`} startOffset={`${offset * 100}%`} textAnchor="middle">
          {data.toUpperCase()}
        </textPath>
      </text>

      <g clipPath={`url(#${id("clipBlob")})`}>
        <image
          href={blobUrl}
          x={QUADRO.blob.x + QUADRO.blob.imgX}
          y={QUADRO.blob.y + QUADRO.blob.imgY}
          width={QUADRO.blob.imgW}
          height={QUADRO.blob.imgH}
          preserveAspectRatio="none"
        />
      </g>
      {QUADRO.circulos.map((c, i) => (
        <circle
          key={i}
          cx={c.x + c.d / 2}
          cy={c.y + c.d / 2}
          r={c.d / 2}
          fill={`url(#${id(c.alt ? "gradCircAlt" : "gradCirc")})`}
          transform={`rotate(${c.grau} ${c.x + c.d / 2} ${c.y + c.d / 2})`}
        />
      ))}
      {/* canto: escala não-uniforme para ocupar exatamente a caixa do Canva; traço em px finais, independente da escala */}
      <g transform={`translate(${QUADRO.canto.x} ${QUADRO.canto.y}) scale(${sxCanto} ${syCanto})`}>
        {/* traço dividido pela escala do grupo: fica em px do canvas 1080 em QUALQUER tamanho de
            exibição. `non-scaling-stroke` seria relativo ao viewport e divergiria num preview reduzido. */}
        <g fill="none" stroke={POST.cor.cantoAnel} strokeWidth={QUADRO.canto.tracoPx / ((sxCanto + syCanto) / 2)}>
          {CANTO_ANEIS.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}
        </g>
        <g fill={POST.cor.cantoPonto}>
          {CANTO_PONTOS.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}
        </g>
      </g>
      <image
        href={assinaturaUrl}
        x={QUADRO.assinatura.x} y={QUADRO.assinatura.y}
        width={QUADRO.assinatura.w} height={QUADRO.assinatura.h}
      />

      {/* ---------- miolo ---------- */}
      <ellipse
        cx={A.anel.x + A.anel.w / 2}
        cy={A.anel.y + A.anel.h / 2}
        rx={A.anel.w / 2}
        ry={A.anel.h / 2}
        fill={`url(#${id("gradAnel")})`}
      />
      {fotoUrl && fotoPronta && (
        <g clipPath={`url(#${id("clipFoto")})`}>
          <image href={fotoUrl} x={fx} y={fy} width={imgW} height={imgH} preserveAspectRatio="none" />
        </g>
      )}

      <rect
        x={A.pilula.x}
        y={A.pilula.y}
        width={pilulaW}
        height={A.pilula.h}
        rx={POST.raioPilula}
        fill={POST.cor.pilula}
      />
      <text ref={rotuloRef} x={A.rotulo.x} y={A.rotulo.y + BASE_ROTULO}
            fontSize={A.rotulo.corpo} fontWeight={POST.fonte.medio} fill={POST.cor.azulSuave}>
        {rotulo}
      </text>
      <text x={A.nome.x} y={A.nome.y + BASE_NOME}
            fontSize={nomeCorpo} fontWeight={POST.fonte.forte} fill={POST.cor.navy}>
        {nome}
      </text>
      {/* medida: mesmo texto no corpo nominal, invisível mas com geometria (visibility, não display) */}
      <text ref={medidaRef} data-medida="1" x={A.nome.x} y={A.nome.y + BASE_NOME} visibility="hidden" aria-hidden="true"
            fontSize={A.nome.corpo} fontWeight={POST.fonte.forte}>
        {nome}
      </text>
    </svg>
  );
}

export default PostAniversario;
