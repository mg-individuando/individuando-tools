"use client";

/**
 * Acesso a dados da fábrica de posts: pauta (pessoas), posts e arquivos.
 *
 * O bucket `posts` é privado — foto de funcionário não pode ficar em link
 * anônimo — então as URLs de exibição são assinadas e expiram.
 */
import { createClient } from "@/lib/supabase/client";
import type { Pessoa, Post, StatusPost, TemplatePost } from "@/lib/schemas/types";

const BUCKET = "posts";
const VALIDADE_URL = 60 * 60 * 8; // 8h: cobre uma jornada sem re-assinar

function semAcento(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
}

/** Sobe um arquivo e devolve o caminho no bucket (não a URL — ela expira). */
export async function enviarArquivo(file: File, pasta: "fotos" | "png", nome: string): Promise<string> {
  const supabase = createClient();
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const caminho = `${pasta}/${semAcento(nome) || "arquivo"}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(caminho, file, {
    upsert: true, contentType: file.type || undefined,
  });
  if (error) throw new Error(`falha ao enviar ${file.name}: ${error.message}`);
  return caminho;
}

/** URL temporária para exibir/exportar um arquivo do bucket privado. */
export async function urlAssinada(caminho: string): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.storage.from(BUCKET)
    .createSignedUrl(caminho, VALIDADE_URL);
  if (error || !data) throw new Error(`falha ao assinar ${caminho}: ${error?.message ?? "sem dados"}`);
  return data.signedUrl;
}

/** Assina vários de uma vez (a listagem precisa de dezenas). */
export async function urlsAssinadas(caminhos: string[]): Promise<Map<string, string>> {
  const mapa = new Map<string, string>();
  const limpos = [...new Set(caminhos.filter(Boolean))];
  if (!limpos.length) return mapa;
  const supabase = createClient();
  const { data, error } = await supabase.storage.from(BUCKET)
    .createSignedUrls(limpos, VALIDADE_URL);
  if (error || !data) return mapa; // sem URL a lista ainda renderiza, só sem foto
  for (const item of data) if (item.path && item.signedUrl) mapa.set(item.path, item.signedUrl);
  return mapa;
}

// ------------------------------------------------------------------ pessoas

export async function listarPessoas(incluirInativas = false): Promise<Pessoa[]> {
  const supabase = createClient();
  let q = supabase.from("pessoas").select("*")
    .order("nascimento_mes").order("nascimento_dia");
  if (!incluirInativas) q = q.eq("ativo", true);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as Pessoa[];
}

export async function salvarPessoa(p: Partial<Pessoa> & { nome: string }): Promise<Pessoa> {
  const supabase = createClient();
  const { data, error } = p.id
    ? await supabase.from("pessoas").update(p).eq("id", p.id).select().single()
    : await supabase.from("pessoas").insert(p).select().single();
  if (error) throw new Error(error.message);
  return data as Pessoa;
}

/** Tira da pauta mas mantém o cadastro e a foto — para quem só saiu da lista do ano. */
export async function arquivarPessoa(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("pessoas").update({ ativo: false }).eq("id", id);
  if (error) throw new Error(error.message);
}

/**
 * Apaga de verdade: remove a foto do Storage e o cadastro.
 * É o que atende um pedido de exclusão — arquivar deixaria a imagem no bucket.
 * Os posts já gerados continuam existindo; perdem só a imagem de origem.
 */
export async function apagarPessoa(id: string, fotoPath?: string | null): Promise<void> {
  const supabase = createClient();
  if (fotoPath) {
    const { error } = await supabase.storage.from(BUCKET).remove([fotoPath]);
    // seguir mesmo se o arquivo já não existir: o cadastro tem de sair de qualquer forma
    if (error && !/not found/i.test(error.message)) throw new Error(`foto: ${error.message}`);
  }
  const { error } = await supabase.from("pessoas").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Remove um arquivo do bucket. Usado ao trocar uma foto, para não deixar órfão. */
export async function apagarArquivo(caminho: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).remove([caminho]);
  if (error && !/not found/i.test(error.message)) throw new Error(error.message);
}

/**
 * Aniversariantes de uma janela a partir de hoje, ordenados por proximidade.
 * Compara dia/mês ignorando o ano — é o que importa para aniversário.
 */
export function proximosAniversarios(pessoas: Pessoa[], dias = 45, hoje = new Date()) {
  const base = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return pessoas
    .map((p) => {
      let d = new Date(base.getFullYear(), p.nascimento_mes - 1, p.nascimento_dia);
      if (d < base) d = new Date(base.getFullYear() + 1, p.nascimento_mes - 1, p.nascimento_dia);
      const faltam = Math.round((d.getTime() - base.getTime()) / 86_400_000);
      return { pessoa: p, data: d, faltam };
    })
    .filter((x) => x.faltam <= dias)
    .sort((a, b) => a.faltam - b.faltam);
}

// -------------------------------------------------------------------- posts

export async function listarPosts(template?: TemplatePost): Promise<Post[]> {
  const supabase = createClient();
  let q = supabase.from("posts").select("*").order("updated_at", { ascending: false });
  if (template) q = q.eq("template", template);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as Post[];
}

export async function salvarPost(p: {
  id?: string; template: TemplatePost; titulo: string;
  config: Record<string, unknown>; pessoa_id?: string | null; ano?: number | null;
  status?: StatusPost; png_url?: string | null;
}): Promise<Post> {
  const supabase = createClient();
  const { data, error } = p.id
    ? await supabase.from("posts").update(p).eq("id", p.id).select().single()
    : await supabase.from("posts").insert(p).select().single();
  if (error) throw new Error(error.message);
  return data as Post;
}

export async function removerPost(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

const MESES = ["janeiro","fevereiro","março","abril","maio","junho",
  "julho","agosto","setembro","outubro","novembro","dezembro"];

/** 4, 7 -> "04 de julho" */
export function dataPorExtenso(dia: number, mes: number): string {
  return `${String(dia).padStart(2, "0")} de ${MESES[mes - 1] ?? ""}`;
}
