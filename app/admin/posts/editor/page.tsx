"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EditorPost } from "@/components/posts/editor-post";

/** Lê os parâmetros do window: a página é toda cliente e isso evita o Suspense do useSearchParams. */
export default function EditorPage() {
  const [params, setParams] = useState<{ pessoa?: string; post?: string } | null>(null);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setParams({ pessoa: q.get("pessoa") ?? undefined, post: q.get("post") ?? undefined });
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/posts" className="mb-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Posts
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Aniversário</h1>
      </header>
      {params && <EditorPost pessoaId={params.pessoa} postId={params.post} />}
    </div>
  );
}
