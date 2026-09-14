"use client";

import { useEffect, useState } from "react";
import { PostAniversario } from "@/components/posts/post-aniversario";
import { PostPresenca } from "@/components/posts/post-presenca";
import { PostMarco } from "@/components/posts/post-marco";
import { PostGrade } from "@/components/posts/post-grade";
import { garantirFontePost } from "@/lib/posts/fontes";

// recortes internos ao círculo: os arquivos base trazem borda do anel
const EQUIPE = [1, 4, 9, 13, 16, 21].map((n) =>
  `/marca/_equipe/grade-${String(n).padStart(2, "0")}-${
    ({1:"fabricio",4:"gabi",9:"chacon",13:"david",16:"leo",21:"karine"} as Record<number,string>)[n]
  }.jpg`);

export default function TemplatesPage() {
  const [pronto, setPronto] = useState(false);
  useEffect(() => { garantirFontePost().catch(() => {}).then(() => setPronto(true)); }, []);
  if (!pronto) return <div className="p-6 text-sm text-muted-foreground">carregando…</div>;

  const cartao = "overflow-hidden rounded-xl border bg-white";
  return (
    <div className="space-y-8 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
        <p className="text-sm text-muted-foreground">
          Os quatro miolos sobre o mesmo quadro. Aniversário e presença foram medidos contra o
          Canva; marco e grade são desenho novo — os originais não estão na conta.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <figure className="m-0 space-y-2">
          <div className={cartao}>
            <PostAniversario responsivo config={{
              data: "15 de dezembro", rotulo: "dia da", nome: "márcia",
              fotoUrl: "/marca/_teste-marcia.jpg",
            }} />
          </div>
          <figcaption className="text-xs text-muted-foreground">aniversário · medido</figcaption>
        </figure>

        <figure className="m-0 space-y-2">
          <div className={cartao}>
            <PostPresenca responsivo config={{
              titulo: "mentorias online", logoUrl: "/marca/_teste-logo-sebrae.png",
              logoBranco: true, regiao: "AM / BA",
            }} />
          </div>
          <figcaption className="text-xs text-muted-foreground">presença · medido</figcaption>
        </figure>

        <figure className="m-0 space-y-2">
          <div className={cartao}>
            <PostMarco responsivo config={{ numero: "11", rotulo: "ANOS" }} />
          </div>
          <figcaption className="text-xs text-muted-foreground">marco · desenho novo</figcaption>
        </figure>

        <figure className="m-0 space-y-2">
          <div className={cartao}>
            <PostGrade responsivo config={{ titulo: "como foi", fotos: EQUIPE }} />
          </div>
          <figcaption className="text-xs text-muted-foreground">grade · desenho novo</figcaption>
        </figure>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Grade: o arranjo muda com a quantidade
        </h2>
        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {[2, 3, 4, 5, 6].map((n) => (
            <figure key={n} className="m-0 space-y-1">
              <div className={cartao}>
                <PostGrade responsivo config={{ fotos: EQUIPE.slice(0, n) }} />
              </div>
              <figcaption className="text-xs text-muted-foreground">{n} fotos</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
