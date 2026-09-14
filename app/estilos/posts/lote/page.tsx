"use client";

/**
 * Lote: os 23 aniversários do ano gerados a partir de uma lista de dados.
 * É o que o Canva desta conta não faz — verifiquei: sem brand templates,
 * sem dataset e sem a ferramenta de autofill no conector.
 */
import { useEffect, useState } from "react";
import { PostAniversario, type PostAniversarioConfig } from "@/components/posts/post-aniversario";
import { garantirFontePost } from "@/lib/posts/fontes";

type Linha = { data: string; rotulo: "dia do" | "dia da"; nome: string; foto: string };

export default function LotePage() {
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [pronto, setPronto] = useState(false);

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
      <p className="mb-6 text-sm text-muted-foreground">
        {linhas.length} posts gerados de uma lista de dados. Nenhum passo manual.
      </p>
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
