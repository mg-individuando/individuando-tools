/**
 * Uma única fonte para preview e exportação: Montserrat variável (wght 100–900),
 * subset latin, auto-hospedada. `exportar.ts` embute ESTE mesmo arquivo em base64,
 * montando o @font-face por `cssFontFace()` — não há segunda cópia da URL nem da família.
 */
export const FONTE_POST_URL = "/fontes/montserrat-latin-variavel.woff2";
export const FONTE_POST_FAMILIA = "Montserrat";
export const FONTE_POST_PESOS = "100 900";

/** @font-face único, usado tanto na injeção no <head> quanto no embed base64 da exportação. */
export function cssFontFace(src: string): string {
  return (
    `@font-face{font-family:"${FONTE_POST_FAMILIA}";font-style:normal;` +
    `font-weight:${FONTE_POST_PESOS};font-display:block;src:url(${src}) format("woff2");}`
  );
}

let pronta: Promise<void> | null = null;

/**
 * Injeta o @font-face uma vez e resolve quando os pesos 500 e 800 estão carregados.
 * Em falha, limpa o cache para que a próxima chamada tente de novo (rede intermitente
 * não pode travar a sessão inteira).
 */
export function garantirFontePost(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  pronta ??= (async () => {
    const id = "fonte-post-montserrat";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = cssFontFace(FONTE_POST_URL);
      document.head.appendChild(style);
    }
    await Promise.all([
      document.fonts.load(`500 44px "${FONTE_POST_FAMILIA}"`),
      document.fonts.load(`800 80px "${FONTE_POST_FAMILIA}"`),
    ]);
    await document.fonts.ready;
  })().catch((e) => {
    pronta = null;
    throw e;
  });
  return pronta;
}
