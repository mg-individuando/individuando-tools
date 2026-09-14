"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarDays, Images, Plus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  listarPessoas, listarPosts, proximosAniversarios, urlsAssinadas, dataPorExtenso,
} from "@/lib/posts/dados";
import type { Pessoa, Post } from "@/lib/schemas/types";

export default function PostsPage() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [fotos, setFotos] = useState<Map<string, string>>(new Map());
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true); setErro(null);
    try {
      const [ps, po] = await Promise.all([listarPessoas(), listarPosts()]);
      setPessoas(ps); setPosts(po);
      setFotos(await urlsAssinadas(ps.map((p) => p.foto_url ?? "")));
    } catch (e) {
      setErro((e as Error).message);
    } finally { setCarregando(false); }
  }, []);
  useEffect(() => { void carregar(); }, [carregar]);

  const ano = new Date().getFullYear();
  const proximos = proximosAniversarios(pessoas, 60);
  const feitos = new Set(posts.filter((p) => p.ano === ano && p.pessoa_id).map((p) => p.pessoa_id!));

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
          <p className="text-sm text-muted-foreground">
            A arte segue a identidade sozinha. Você cuida da foto e do texto.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/posts/pauta" className="btn-secondary inline-flex items-center gap-2 text-sm">
            <Users className="size-4" /> Pauta
          </Link>
          <Link href="/admin/posts/editor" className="btn-primary inline-flex items-center gap-2 text-sm">
            <Plus className="size-4" /> Novo post
          </Link>
        </div>
      </header>

      {erro && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Não consegui ler os dados.</p>
            <p className="mt-0.5 opacity-80">{erro}</p>
            <p className="mt-1 opacity-80">
              Se as tabelas ainda não existem, aplique <code>supabase/migrations/004_posts.sql</code> no Supabase.
            </p>
          </div>
        </div>
      )}

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <CalendarDays className="size-4" /> Próximos aniversários
        </h2>
        {carregando ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : proximos.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Nada nos próximos 60 dias.{" "}
            <Link href="/admin/posts/pauta" className="underline underline-offset-2">Montar a pauta</Link>.
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {proximos.map(({ pessoa, faltam }) => (
              <li key={pessoa.id}
                  className="flex items-center gap-3 rounded-xl border bg-card p-3">
                <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-muted">
                  {pessoa.foto_url && fotos.get(pessoa.foto_url)
                    ? <img src={fotos.get(pessoa.foto_url)} alt="" className="size-full object-cover" />
                    : <span className="text-[10px] text-muted-foreground">sem foto</span>}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{pessoa.tratamento} {pessoa.nome}</span>
                  <span className="block text-sm text-muted-foreground">
                    {dataPorExtenso(pessoa.nascimento_dia, pessoa.nascimento_mes)} ·{" "}
                    {faltam === 0 ? "é hoje" : faltam === 1 ? "amanhã" : `em ${faltam} dias`}
                  </span>
                </span>
                {feitos.has(pessoa.id)
                  ? <Badge variant="secondary">pronto</Badge>
                  : (
                    <Link href={`/admin/posts/editor?pessoa=${pessoa.id}`}
                          className="btn-secondary shrink-0 text-xs">Gerar</Link>
                  )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Images className="size-4" /> Posts salvos
        </h2>
        {carregando ? (
          <Skeleton className="h-24 rounded-xl" />
        ) : posts.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Nenhum post salvo ainda.
          </div>
        ) : (
          <ul className="divide-y rounded-xl border bg-card">
            {posts.map((p) => (
              <li key={p.id} className="flex items-center gap-3 p-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{p.titulo}</span>
                  <span className="block text-xs text-muted-foreground">
                    {p.template} · {new Date(p.updated_at).toLocaleDateString("pt-BR")}
                  </span>
                </span>
                <Badge variant={p.status === "publicado" ? "default" : "secondary"}>{p.status}</Badge>
                <Link href={`/admin/posts/editor?post=${p.id}`}
                      className="shrink-0 text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground">
                  Abrir
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
