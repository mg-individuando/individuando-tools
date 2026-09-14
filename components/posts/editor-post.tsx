"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, ImagePlus, Loader2, RotateCcw, Save, ZoomIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PostAniversario, type PostAniversarioConfig } from "./post-aniversario";
import { svgParaPng } from "@/lib/posts/exportar";
import { garantirFontePost } from "@/lib/posts/fontes";
import { ANIVERSARIO } from "@/lib/posts/tokens";
import {
  dataPorExtenso, enviarArquivo, listarPessoas, listarPosts, salvarPessoa, salvarPost, urlAssinada,
} from "@/lib/posts/dados";
import type { Pessoa, Post } from "@/lib/schemas/types";

const MESES = ["janeiro","fevereiro","março","abril","maio","junho",
  "julho","agosto","setembro","outubro","novembro","dezembro"];

/** "2026-07-04" -> "04 de julho" */
function porExtenso(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  if (!m || !d) return "";
  return `${String(d).padStart(2, "0")} de ${MESES[m - 1]}`;
}
function semAcento(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
}

const PADRAO: PostAniversarioConfig = {
  data: "04 de julho",
  rotulo: "dia do",
  nome: "",
  fotoUrl: "",
  fotoX: 0,
  fotoY: 0,
  fotoZoom: 1,
};

export function EditorPost({
  pessoaId,
  postId,
  aoSalvar,
}: {
  /** Pré-carrega da pauta: nome, tratamento, data, foto e enquadramento salvos. */
  pessoaId?: string;
  /** Reabre um post existente a partir do config guardado. */
  postId?: string;
  aoSalvar?: (p: Post) => void;
} = {}) {
  const [cfg, setCfg] = useState<PostAniversarioConfig>(PADRAO);
  const [iso, setIso] = useState("2026-07-04");
  const [corpoManual, setCorpoManual] = useState<number | "">("");
  const [baixando, setBaixando] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const objectUrl = useRef<string | null>(null);
  // caminho no bucket (o que persiste); cfg.fotoUrl guarda a URL de exibição, que expira
  const [fotoPath, setFotoPath] = useState<string | null>(null);
  const [pessoa, setPessoa] = useState<Pessoa | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [carregando, setCarregando] = useState(!!(pessoaId || postId));
  const [salvando, setSalvando] = useState(false);
  const persistivel = !!(pessoaId || postId || pessoa || post);

  useEffect(() => { void garantirFontePost(); }, []);

  // carrega a pessoa da pauta ou reabre um post salvo
  useEffect(() => {
    if (!pessoaId && !postId) return;
    let vivo = true;
    (async () => {
      try {
        if (postId) {
          const achado = (await listarPosts()).find((x) => x.id === postId);
          if (!achado) throw new Error("post não encontrado");
          if (!vivo) return;
          setPost(achado);
          const c = achado.config as Partial<PostAniversarioConfig> & { fotoPath?: string };
          const caminho = c.fotoPath ?? null;
          setFotoPath(caminho);
          setCfg({
            ...PADRAO, ...c,
            fotoUrl: caminho ? await urlAssinada(caminho) : "",
          } as PostAniversarioConfig);
          if (achado.config && typeof (achado.config as { iso?: string }).iso === "string") {
            setIso((achado.config as { iso: string }).iso);
          }
        } else if (pessoaId) {
          const achada = (await listarPessoas(true)).find((x) => x.id === pessoaId);
          if (!achada) throw new Error("pessoa não encontrada");
          if (!vivo) return;
          setPessoa(achada);
          setFotoPath(achada.foto_url);
          const anoAtual = new Date().getFullYear();
          setIso(`${anoAtual}-${String(achada.nascimento_mes).padStart(2, "0")}-${String(achada.nascimento_dia).padStart(2, "0")}`);
          setCfg({
            data: dataPorExtenso(achada.nascimento_dia, achada.nascimento_mes),
            rotulo: achada.tratamento,
            nome: achada.nome,
            fotoUrl: achada.foto_url ? await urlAssinada(achada.foto_url) : "",
            fotoX: achada.foto_x, fotoY: achada.foto_y, fotoZoom: achada.foto_zoom,
          });
        }
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        if (vivo) setCarregando(false);
      }
    })();
    return () => { vivo = false; };
  }, [pessoaId, postId]);
  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);

  const patch = useCallback(
    (p: Partial<PostAniversarioConfig>) => setCfg((c) => ({ ...c, ...p })), []);

  async function aoEscolherFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Escolha um arquivo de imagem."); return; }
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(f);
    patch({ fotoUrl: objectUrl.current, fotoX: 0, fotoY: 0, fotoZoom: 1 });
    if (!persistivel) return;
    try {
      setFotoPath(await enviarArquivo(f, "fotos", cfg.nome || "foto"));
    } catch (err) {
      toast.error(`foto não foi guardada: ${(err as Error).message}`);
    }
  }

  /** Guarda o post e devolve o enquadramento para a pessoa — vale para os próximos anos. */
  async function guardar() {
    setSalvando(true);
    try {
      const titulo = `${cfg.rotulo} ${cfg.nome}`.trim();
      const salvo = await salvarPost({
        ...(post?.id ? { id: post.id } : {}),
        template: "aniversario",
        titulo,
        pessoa_id: pessoa?.id ?? post?.pessoa_id ?? null,
        ano: Number(iso.slice(0, 4)) || new Date().getFullYear(),
        config: { ...cfg, fotoUrl: undefined, fotoPath, iso },
      });
      setPost(salvo);
      if (pessoa) {
        await salvarPessoa({
          id: pessoa.id, nome: pessoa.nome,
          foto_url: fotoPath, foto_x: cfg.fotoX ?? 0,
          foto_y: cfg.fotoY ?? 0, foto_zoom: cfg.fotoZoom ?? 1,
        });
      }
      toast.success("Post salvo.");
      aoSalvar?.(salvo);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  // ---- arrastar para enquadrar: converte px de tela em deslocamento de foco ----
  const arrasto = useRef<{ x: number; y: number; fx: number; fy: number } | null>(null);
  // o template reporta a sobra real de cada eixo (depende do zoom e da proporção da foto)
  const [folgas, setFolgas] = useState({ folgaX: 0, folgaY: 0 });
  function aoPressionar(e: React.PointerEvent<SVGSVGElement>) {
    if (!cfg.fotoUrl) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    arrasto.current = { x: e.clientX, y: e.clientY, fx: cfg.fotoX ?? 0, fy: cfg.fotoY ?? 0 };
  }
  function aoMover(e: React.PointerEvent<SVGSVGElement>) {
    const a = arrasto.current;
    const svg = svgRef.current;
    if (!a || !svg) return;
    const larguraNaTela = svg.getBoundingClientRect().width || 1;
    const escala = 1080 / larguraNaTela; // px de tela -> unidades do canvas

    const { folgaX, folgaY } = folgas;
    const mover = (delta: number, folga: number, base: number) =>
      folga > 0.5 ? Math.max(-1, Math.min(1, base - (delta * escala) / folga)) : base;
    patch({
      fotoX: mover(e.clientX - a.x, folgaX, a.fx),
      fotoY: mover(e.clientY - a.y, folgaY, a.fy),
    });
  }
  const aoSoltar = () => { arrasto.current = null; };

  async function baixar() {
    if (!svgRef.current) return;
    setBaixando(true);
    try {
      const blob = await svgParaPng(svgRef.current, 1080);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `aniversario-${semAcento(cfg.nome || "post")}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
      toast.success("PNG 1080×1080 baixado.");
    } catch (err) {
      toast.error(`Não consegui exportar: ${(err as Error).message}`);
    } finally {
      setBaixando(false);
    }
  }

  const zoom = cfg.fotoZoom ?? 1;
  const podeArrastar = !!cfg.fotoUrl && (folgas.folgaX > 0.5 || folgas.folgaY > 0.5);

  if (carregando) {
    return <div className="grid h-64 place-items-center text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> carregando…</span>
    </div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* ---------------- preview ---------------- */}
      <div>
        <div
          className="overflow-hidden rounded-xl border bg-white shadow-sm"
          style={{ cursor: podeArrastar ? (arrasto.current ? "grabbing" : "grab") : "default" }}
        >
          <PostAniversario
            config={cfg}
            responsivo
            svgRef={svgRef}
            onEnquadramento={(g) => setFolgas({ folgaX: g.folgaX, folgaY: g.folgaY })}
            onPointerDown={aoPressionar}
            onPointerMove={aoMover}
            onPointerUp={aoSoltar}
            onPointerCancel={aoSoltar}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {podeArrastar
            ? "Arraste a imagem para enquadrar."
            : cfg.fotoUrl
              ? "Esta foto preenche o círculo exatamente — dê zoom para reposicionar."
              : "Escolha uma foto para começar."}
        </p>
      </div>

      {/* ---------------- controles ---------------- */}
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="foto">Foto</Label>
          <label
            htmlFor="foto"
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground transition hover:border-foreground/30 hover:bg-muted/40"
          >
            <ImagePlus className="size-4" />
            {cfg.fotoUrl ? "Trocar foto" : "Escolher foto"}
          </label>
          <input id="foto" type="file" accept="image/*" className="sr-only" onChange={aoEscolherFoto} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="zoom" className="flex items-center gap-1.5">
              <ZoomIn className="size-3.5" /> Zoom
            </Label>
            <span className="tabular-nums text-xs text-muted-foreground">{zoom.toFixed(2)}×</span>
          </div>
          <input
            id="zoom" type="range" min={1} max={3} step={0.01} value={zoom}
            disabled={!cfg.fotoUrl}
            onChange={(e) => patch({ fotoZoom: Number(e.target.value) })}
            className="w-full accent-[#1d2e4c] disabled:opacity-40"
          />
          <Button
            type="button" variant="ghost" size="sm" disabled={!cfg.fotoUrl}
            onClick={() => patch({ fotoX: 0, fotoY: 0, fotoZoom: 1 })}
            className="h-7 px-2 text-xs"
          >
            <RotateCcw className="mr-1 size-3" /> Recentralizar
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="data">Data</Label>
          <Input
            id="data" type="date" value={iso}
            onChange={(e) => { setIso(e.target.value); patch({ data: porExtenso(e.target.value) }); }}
          />
          <p className="text-xs text-muted-foreground">No post: {cfg.data || "—"}</p>
        </div>

        <div className="space-y-2">
          <Label>Tratamento</Label>
          <Select
            value={cfg.rotulo}
            onValueChange={(v) => patch({ rotulo: v as PostAniversarioConfig["rotulo"] })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="dia do">dia do</SelectItem>
              <SelectItem value="dia da">dia da</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome" value={cfg.nome} placeholder="marcos" autoComplete="off"
            onChange={(e) => patch({ nome: e.target.value.toLowerCase() })}
          />
          <div className="flex items-center gap-2">
            <Input
              type="number" min={ANIVERSARIO.nome.corpoMin} max={ANIVERSARIO.nome.corpo}
              placeholder="auto" value={corpoManual} className="h-8 w-24"
              onChange={(e) => {
                const v = e.target.value === "" ? "" : Number(e.target.value);
                setCorpoManual(v);
                patch({ nomeCorpo: v === "" ? undefined : v });
              }}
            />
            <span className="text-xs text-muted-foreground">
              corpo do nome — vazio = ajusta sozinho
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {persistivel && (
            <Button onClick={guardar} disabled={!cfg.nome || salvando} className="w-full">
              {salvando ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
              {post ? "Salvar alterações" : "Salvar post"}
            </Button>
          )}
          <Button onClick={baixar} disabled={!cfg.nome || baixando}
                  variant={persistivel ? "outline" : "default"} className="w-full">
            {baixando ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Download className="mr-2 size-4" />}
            Baixar PNG 1080×1080
          </Button>
        </div>
      </div>
    </div>
  );
}

export default EditorPost;
