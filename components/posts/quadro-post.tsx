"use client";

import { POST, QUADRO } from "@/lib/posts/tokens";
import { CANTO_ANEIS, CANTO_PONTOS, CANTO_VIEWBOX } from "@/lib/posts/canto";

/** Fundo creme. Vem PRIMEIRO, antes de qualquer conteúdo do miolo que fique atrás da onda. */
export function QuadroBase() {
  return <rect width={POST.canvas} height={POST.canvas} fill={POST.cor.creme} />;
}

/**
 * O quadro: onda, círculos decorativos e canto de bolinhas — SEM o fundo creme,
 * que é pintado por <QuadroBase /> antes do conteúdo de trás (a data do aniversário,
 * por exemplo, fica atrás da onda, exatamente como no Canva).
 * Idêntico coordenada a coordenada em todos os templates — medido nos designs
 * DAHU3eX9sD4 (aniversário) e DAHUnVeduKA (SEBRAE AM/BA), que o copiam byte a byte.
 *
 * Não é editável pela comunicação. O que muda entre templates é só o miolo.
 * `uid` vem do template e mantém os ids únicos quando há mais de um post na página.
 */
export function QuadroFundo({ uid, blobUrl = "/marca/blob.png" }: { uid: string; blobUrl?: string }) {
  const sx = QUADRO.canto.w / CANTO_VIEWBOX.w;
  const sy = QUADRO.canto.h / CANTO_VIEWBOX.h;
  return (
    <>
      <g clipPath={`url(#quadroClipOnda-${uid})`}>
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
          fill={`url(#quadroGrad${c.alt ? "Alt" : ""}-${uid})`}
          transform={`rotate(${c.grau} ${c.x + c.d / 2} ${c.y + c.d / 2})`}
        />
      ))}
      {/* traço em unidades de usuário: fica em px do canvas 1080 em qualquer tamanho de exibição */}
      <g transform={`translate(${QUADRO.canto.x} ${QUADRO.canto.y}) scale(${sx} ${sy})`}>
        <g fill="none" stroke={POST.cor.cantoAnel} strokeWidth={QUADRO.canto.tracoPx / ((sx + sy) / 2)}>
          {CANTO_ANEIS.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}
        </g>
        <g fill={POST.cor.cantoPonto}>
          {CANTO_PONTOS.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}
        </g>
      </g>
    </>
  );
}

/** Assinatura — desenhada depois do fundo e antes do miolo, como no Canva. */
export function QuadroAssinatura({ url = "/marca/assinatura-branca.svg" }: { url?: string }) {
  return (
    <image
      href={url}
      x={QUADRO.assinatura.x}
      y={QUADRO.assinatura.y}
      width={QUADRO.assinatura.w}
      height={QUADRO.assinatura.h}
    />
  );
}

/** defs comuns do quadro, com ids sufixados por instância. */
export function QuadroDefs({ uid }: { uid: string }) {
  return (
    <>
      <clipPath id={`quadroClipOnda-${uid}`}>
        <rect x={QUADRO.blob.x} y={QUADRO.blob.y} width={QUADRO.blob.w} height={QUADRO.blob.h} />
      </clipPath>
      <linearGradient id={`quadroGrad-${uid}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#faf6ee" stopOpacity="0" />
        <stop offset="0.5" stopColor="#f9f5ed" stopOpacity="0.465" />
        <stop offset="1" stopColor="#f9f5ed" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`quadroGradAlt-${uid}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#f9f5ed" stopOpacity="0.4" />
        <stop offset="0.5" stopColor="#f9f5ed" stopOpacity="0" />
        <stop offset="1" stopColor="#f9f5ed" stopOpacity="0.4" />
      </linearGradient>
    </>
  );
}
