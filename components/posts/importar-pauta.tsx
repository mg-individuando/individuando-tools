"use client";

import { useRef, useState } from "react";
import { FolderUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { enviarArquivo, salvarPessoa } from "@/lib/posts/dados";

/**
 * Tratamento por nome, lido do arquivo do Canva (Individuando - Aniversários/26).
 * O nome do arquivo não carrega essa informação e "termina em A" erraria em
 * beatriz, lud e mj — então vem da fonte, não de palpite.
 */
const TRATAMENTO: Record<string, "dia do" | "dia da"> = {
  fabricio: "dia do", lilian: "dia da", ligia: "dia da", gabi: "dia da",
  ana: "dia da", mj: "dia do", jaja: "dia do", miza: "dia do",
  chacon: "dia do", marcelo: "dia do", marcos: "dia do", lud: "dia da",
  david: "dia do", julinho: "dia do", dri: "dia da", leo: "dia do",
  beatriz: "dia da", karine: "dia da", saulo: "dia do", anna: "dia da",
  marcia: "dia da", beta: "dia da", camila: "dia da",
};

/** Acentos que o nome de arquivo perde e o post precisa de volta. */
const ACENTO: Record<string, string> = {
  fabricio: "fabrício", ligia: "lígia", jaja: "jajá", marcia: "márcia",
};

interface Linha {
  arquivo: File; nome: string; dia: number; mes: number;
  tratamento: "dia do" | "dia da"; ordem: number;
}

/** "13_marcos_04-07.jpg" -> marcos, 4 de julho */
function interpretar(f: File): Linha | null {
  const base = f.name.replace(/\.[^.]+$/, "");
  const m = base.match(/^(\d+)[_-](.+?)[_-](\d{1,2})-(\d{1,2})$/);
  if (!m) return null;
  const bruto = m[2].split("-")[0].toLowerCase();  // "ana-gemea" -> "ana"
  return {
    arquivo: f,
    nome: ACENTO[bruto] ?? bruto,
    dia: Number(m[3]),
    mes: Number(m[4]),
    tratamento: TRATAMENTO[bruto] ?? "dia do",
    ordem: Number(m[1]),
  };
}

export function ImportarPauta({ aoTerminar }: { aoTerminar: () => void }) {
  const [lendo, setLendo] = useState<Linha[] | null>(null);
  const [ignorados, setIgnorados] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [feito, setFeito] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  function escolher(e: React.ChangeEvent<HTMLInputElement>) {
    const fs = [...(e.target.files ?? [])].filter((f) => f.type.startsWith("image/"));
    const ok: Linha[] = []; const nao: string[] = [];
    for (const f of fs) {
      const l = interpretar(f);
      if (l) ok.push(l); else nao.push(f.name);
    }
    ok.sort((a, b) => a.ordem - b.ordem);
    setLendo(ok); setIgnorados(nao);
    if (!ok.length) toast.error("Nenhum arquivo no padrão NN_nome_DD-MM.");
  }

  async function importar() {
    if (!lendo?.length) return;
    setEnviando(true); setFeito(0);
    let erros = 0;
    for (const l of lendo) {
      try {
        const caminho = await enviarArquivo(l.arquivo, "fotos", l.nome);
        await salvarPessoa({
          nome: l.nome, tratamento: l.tratamento,
          nascimento_dia: l.dia, nascimento_mes: l.mes, foto_url: caminho,
        });
      } catch (e) {
        erros++;
        toast.error(`${l.nome}: ${(e as Error).message}`);
      }
      setFeito((n) => n + 1);
    }
    setEnviando(false); setLendo(null);
    if (input.current) input.current.value = "";
    toast.success(`${lendo.length - erros} pessoas na pauta${erros ? ` · ${erros} falharam` : ""}.`);
    aoTerminar();
  }

  return (
    <div className="space-y-3 rounded-xl border border-dashed bg-muted/20 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <FolderUp className="size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="font-medium">Importar a pauta de uma vez</p>
          <p className="text-sm text-muted-foreground">
            Selecione os arquivos nomeados <code>NN_nome_DD-MM.jpg</code> — o nome e a data saem do
            próprio arquivo.
          </p>
        </div>
        <label htmlFor="importar" className="btn-secondary shrink-0 cursor-pointer text-sm">
          Escolher arquivos
        </label>
        <input ref={input} id="importar" type="file" accept="image/*" multiple
               className="sr-only" onChange={escolher} />
      </div>

      {lendo && lendo.length > 0 && (
        <>
          <ul className="max-h-48 space-y-0.5 overflow-auto rounded-lg bg-background p-2 text-sm">
            {lendo.map((l, i) => (
              <li key={i} className="flex justify-between gap-2">
                <span>{l.tratamento} <strong>{l.nome}</strong></span>
                <span className="text-muted-foreground">
                  {String(l.dia).padStart(2, "0")}/{String(l.mes).padStart(2, "0")}
                </span>
              </li>
            ))}
          </ul>
          {ignorados.length > 0 && (
            <p className="text-xs text-amber-700">
              Fora do padrão, ignorados: {ignorados.join(", ")}
            </p>
          )}
          <Button onClick={importar} disabled={enviando} className="w-full">
            {enviando
              ? <><Loader2 className="mr-2 size-4 animate-spin" /> {feito}/{lendo.length}</>
              : `Importar ${lendo.length} pessoas`}
          </Button>
        </>
      )}
    </div>
  );
}
