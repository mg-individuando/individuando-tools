"use client";

import { useEffect, useState } from "react";
import { PostPresenca } from "@/components/posts/post-presenca";
import { garantirFontePost } from "@/lib/posts/fontes";
import { svgParaPng } from "@/lib/posts/exportar";

declare global {
  interface Window { __exportarPresenca?: () => Promise<string> }
}

export default function PresencaCalibracao() {
  const [pronto, setPronto] = useState(false);
  useEffect(() => {
    let vivo = true;
    garantirFontePost().catch(() => {}).then(() => { if (vivo) setPronto(true); });
    window.__exportarPresenca = async () => {
      const svg = document.querySelector("#palco svg") as SVGSVGElement | null;
      if (!svg) throw new Error("sem palco");
      return URL.createObjectURL(await svgParaPng(svg));
    };
    return () => { vivo = false; delete window.__exportarPresenca; };
  }, []);
  return (
    <div id="palco" data-pronto={pronto ? "1" : "0"} style={{ width: 1080, height: 1080 }}>
      {pronto && (
        <PostPresenca
          ruido={false}
          config={{
            titulo: "mentorias online",
            logoUrl: "/marca/_teste-logo-sebrae.png",
            logoBranco: true,
            regiao: "AM / BA",
          }}
        />
      )}
    </div>
  );
}
