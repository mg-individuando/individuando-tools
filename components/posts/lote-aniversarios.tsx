"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Loader2, PackageOpen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PostAniversario, type PostAniversarioConfig } from "./post-aniversario";
import { svgParaJpeg } from "@/lib/posts/exportar";
import { garantirFontePost } from "@/lib/posts/fontes";
import { montarZip, type ArquivoZip } from "@/lib/posts/zip";
import { dataPorExtenso, listarPessoas, urlsAssinadas } from "@/lib/posts/dados";
import type { Pessoa } from "@/lib/schemas/types";

function semAcento(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
}

/**
 * Gera o ano inteiro num clique.
 *
 * Renderiza um post de cada vez num palco escondido: 23 SVGs simultâneos com
 * feTurbulence derrubariam o navegador, e o PNG sai igual de qualquer jeito.
 */
export function LoteAniversarios() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [fotos, setFotos] = useState<Map<string, string>>(new Map());
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [gerando, setGerando] = useState(false);
  const [feito, setFeito] = useState(0);
  const [atual, setAtual] = useState<PostAniversarioConfig | null>(null);
  const palco = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        await garantirFontePost().catch(() => {});
        const lista = await listarPessoas();
        if (!vivo) return;
        setPessoas(lista);
        setFotos(await urlsAssinadas(lista.map((p) => p.foto_url ?? "")));
      } catch (e) {
        if (vivo) setErro((e as Error).message);
      } finally {
        if (vivo) setCarregando(false);
      }
    })();
    return () => { vivo = false; };
  }, []);

  const esperarPintar = () =>
    new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

  const gerar = useCallback(async () => {
    const comFoto = pessoas.filter((p) => p.foto_url && fotos.get(p.foto_url));
    if (!comFoto.length) { toast.error("Ninguém na pauta tem foto guardada."); return; }
    setGerando(true); setFeito(0);
    const arquivos: ArquivoZip[] = [];
    try {
      for (const p of comFoto) {
        setAtual({
          data: dataPorExtenso(p.nascimento_dia, p.nascimento_mes),
          rotulo: p.tratamento, nome: p.nome,
          fotoUrl: fotos.get(p.foto_url!)!,
          fotoX: p.foto_x, fotoY: p.foto_y, fotoZoom: p.foto_zoom,
        });
        await esperarPintar();
        const svg = palco.current;
        if (!svg) throw new Error("palco sumiu");
        const blob = await svgParaJpeg(svg, 1080);
        const mm = String(p.nascimento_mes).padStart(2, "0");
        const dd = String(p.nascimento_dia).padStart(2, "0");
        arquivos.push({
          nome: `${mm}-${dd}-${semAcento(p.nome)}.jpg`,
          dados: new Uint8Array(await blob.arrayBuffer()),
        });
        setFeito((n) => n + 1);
      }
      const zip = montarZip(arquivos);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(zip);
      a.download = `aniversarios-${new Date().getFullYear()}.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 20_000);
      toast.success(`${arquivos.length} posts no ZIP.`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setGerando(false); setAtual(null);
    }
  }, [pessoas, fotos]);

  const comFoto = pessoas.filter((p) => p.foto_url && fotos.get(p.foto_url)).length;
  const semFoto = pessoas.length - comFoto;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4">
        <PackageOpen className="size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="font-medium">Gerar o ano inteiro</p>
          <p className="text-sm text-muted-foreground">
            {carregando ? "carregando a pauta…"
              : erro ? erro
              : `${comFoto} posts prontos para sair${semFoto ? ` · ${semFoto} sem foto, ficam de fora` : ""}`}
          </p>
        </div>
        <Button onClick={gerar} disabled={gerando || carregando || comFoto === 0}>
          {gerando
            ? <><Loader2 className="mr-2 size-4 animate-spin" /> {feito}/{comFoto}</>
            : <><Download className="mr-2 size-4" /> Baixar ZIP</>}
        </Button>
      </div>

      {/* palco escondido: um post por vez, fora do fluxo mas renderizado de verdade */}
      <div aria-hidden style={{ position: "fixed", left: -99999, top: 0, width: 1080, height: 1080 }}>
        {atual && <PostAniversario config={atual} svgRef={palco} />}
      </div>
    </div>
  );
}
