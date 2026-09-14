"use client";

/**
 * Lote: os 23 aniversários do ano gerados a partir de uma lista de dados.
 * É o que o Canva desta conta não faz — verifiquei: sem brand templates,
 * sem dataset e sem a ferramenta de autofill no conector.
 */
import { useEffect, useState } from "react";
import { PostAniversario, type PostAniversarioConfig } from "@/components/posts/post-aniversario";
import { garantirFontePost } from "@/lib/posts/fontes";
import { svgParaJpeg } from "@/lib/posts/exportar";
import { montarZip, type ArquivoZip } from "@/lib/posts/zip";

type Linha = { data: string; rotulo: "dia do" | "dia da"; nome: string; foto: string };

export default function LotePage() {
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [pronto, setPronto] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [feito, setFeito] = useState(0);

  /** Exercita o caminho completo: cada SVG do grid -> PNG -> ZIP. */
  async function baixarZip() {
    setGerando(true); setFeito(0);
    try {
      const svgs = [...document.querySelectorAll<SVGSVGElement>("#lote svg")];
      const arquivos: ArquivoZip[] = [];
      for (let i = 0; i < svgs.length; i++) {
        const blob = await svgParaJpeg(svgs[i], 1080);
        const l = linhas[i];
        arquivos.push({
          nome: `${String(i + 1).padStart(2, "0")}-${l.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.jpg`,
          dados: new Uint8Array(await blob.arrayBuffer()),
        });
        setFeito(i + 1);
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(montarZip(arquivos));
      a.download = "aniversarios.zip";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 20_000);
    } finally { setGerando(false); }
  }

  useEffect(() => {
    let vivo = true;
    Promise.all([
      fetch("/marca/_equipe/pauta.json").then((r) => r.json()),
      garantirFontePost().catch(() => {}),
    ]).then(([p]) => { if (vivo) { setLinhas(p as Linha[]); setPronto(true); } });
    return () => { vivo = false; };
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Aniversários do ano</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        {linhas.length} posts gerados de uma lista de dados. Nenhum passo manual.
      </p>
      <button id="zip" onClick={baixarZip} disabled={!pronto || gerando}
              className="btn-primary mb-6 inline-flex items-center gap-2 text-sm">
        {gerando ? `gerando ${feito}/${linhas.length}…` : "Baixar todos em ZIP"}
      </button>
      <div id="lote" data-pronto={pronto ? "1" : "0"}
           className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {pronto && linhas.map((l, i) => {
          const cfg: PostAniversarioConfig = {
            data: l.data, rotulo: l.rotulo, nome: l.nome, fotoUrl: l.foto,
          };
          return (
            <figure key={i} className="m-0 overflow-hidden rounded-lg border bg-white">
              <PostAniversario config={cfg} responsivo />
            </figure>
          );
        })}
      </div>
    </div>
  );
}
