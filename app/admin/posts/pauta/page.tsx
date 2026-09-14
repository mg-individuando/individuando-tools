"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { PautaForm } from "@/components/posts/pauta-form";
import { ImportarPauta } from "@/components/posts/importar-pauta";
import { listarPessoas, urlsAssinadas, dataPorExtenso } from "@/lib/posts/dados";
import type { Pessoa } from "@/lib/schemas/types";

export default function PautaPage() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [fotos, setFotos] = useState<Map<string, string>>(new Map());
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [editando, setEditando] = useState<Partial<Pessoa> | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true); setErro(null);
    try {
      const lista = await listarPessoas();
      setPessoas(lista);
      setFotos(await urlsAssinadas(lista.map((p) => p.foto_url ?? "")));
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/posts" className="mb-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3.5" /> Posts
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Pauta</h1>
          <p className="text-sm text-muted-foreground">
            A equipe e as datas. A foto fica guardada — sobe uma vez e serve todo ano.
          </p>
        </div>
        {!editando && (
          <button onClick={() => setEditando({})}
                  className="btn-primary inline-flex items-center gap-2 text-sm">
            <Plus className="size-4" /> Adicionar pessoa
          </button>
        )}
      </header>

      {editando && (
        <PautaForm
          pessoa={editando}
          fotoPreview={editando.foto_url ? fotos.get(editando.foto_url) : undefined}
          aoSalvar={() => { setEditando(null); void carregar(); }}
          aoFechar={() => setEditando(null)}
        />
      )}

      {erro && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Não consegui ler a pauta.</p>
            <p className="mt-0.5 opacity-80">{erro}</p>
            <p className="mt-1 opacity-80">
              Se as tabelas ainda não existem, aplique <code>supabase/migrations/004_posts.sql</code>.
            </p>
          </div>
        </div>
      )}

      {!editando && pessoas.length === 0 && !carregando && (
        <ImportarPauta aoTerminar={() => void carregar()} />
      )}

      {carregando ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : pessoas.length === 0 && !erro ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            A pauta está vazia. Adicione a primeira pessoa e o post de aniversário dela passa a se montar sozinho.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pessoas.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => setEditando(p)}
                className="flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left transition hover:border-foreground/20 hover:bg-muted/40"
              >
                <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-muted">
                  {p.foto_url && fotos.get(p.foto_url)
                    ? <img src={fotos.get(p.foto_url)} alt="" className="size-full object-cover" />
                    : <span className="text-xs text-muted-foreground">sem foto</span>}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{p.tratamento} {p.nome}</span>
                  <span className="block text-sm text-muted-foreground">
                    {dataPorExtenso(p.nascimento_dia, p.nascimento_mes)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
