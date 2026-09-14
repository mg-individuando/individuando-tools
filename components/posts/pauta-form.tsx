"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Pessoa } from "@/lib/schemas/types";
import { enviarArquivo, salvarPessoa, removerPessoa } from "@/lib/posts/dados";

const MESES = ["janeiro","fevereiro","março","abril","maio","junho",
  "julho","agosto","setembro","outubro","novembro","dezembro"];

export function PautaForm({
  pessoa, fotoPreview, aoSalvar, aoFechar,
}: {
  pessoa: Partial<Pessoa> | null;
  fotoPreview?: string;
  aoSalvar: () => void;
  aoFechar: () => void;
}) {
  const [nome, setNome] = useState("");
  const [tratamento, setTratamento] = useState<"dia do" | "dia da">("dia do");
  const [dia, setDia] = useState(1);
  const [mes, setMes] = useState(1);
  const [fotoPath, setFotoPath] = useState<string | null>(null);
  const [previa, setPrevia] = useState<string>("");
  const [salvando, setSalvando] = useState(false);
  const objUrl = useRef<string | null>(null);

  useEffect(() => {
    setNome(pessoa?.nome ?? "");
    setTratamento((pessoa?.tratamento as "dia do" | "dia da") ?? "dia do");
    setDia(pessoa?.nascimento_dia ?? 1);
    setMes(pessoa?.nascimento_mes ?? 1);
    setFotoPath(pessoa?.foto_url ?? null);
    setPrevia(fotoPreview ?? "");
  }, [pessoa, fotoPreview]);

  useEffect(() => () => { if (objUrl.current) URL.revokeObjectURL(objUrl.current); }, []);

  async function aoEscolherFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Escolha um arquivo de imagem."); return; }
    if (objUrl.current) URL.revokeObjectURL(objUrl.current);
    objUrl.current = URL.createObjectURL(f);
    setPrevia(objUrl.current);
    try {
      const caminho = await enviarArquivo(f, "fotos", nome || "pessoa");
      setFotoPath(caminho);
      toast.success("Foto enviada.");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function salvar() {
    if (!nome.trim()) { toast.error("O nome é obrigatório."); return; }
    setSalvando(true);
    try {
      await salvarPessoa({
        ...(pessoa?.id ? { id: pessoa.id } : {}),
        nome: nome.trim().toLowerCase(),
        tratamento,
        nascimento_dia: dia,
        nascimento_mes: mes,
        foto_url: fotoPath,
      });
      toast.success(pessoa?.id ? "Pessoa atualizada." : "Pessoa adicionada.");
      aoSalvar();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  async function remover() {
    if (!pessoa?.id) return;
    try {
      await removerPessoa(pessoa.id);
      toast.success("Removida da pauta.");
      aoSalvar();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <div className="flex items-start gap-4">
        <label
          htmlFor="pauta-foto"
          className="relative grid size-24 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full border border-dashed bg-muted/40 text-muted-foreground transition hover:border-foreground/30"
        >
          {previa
            ? <img src={previa} alt="" className="size-full object-cover" />
            : <ImagePlus className="size-5" />}
        </label>
        <input id="pauta-foto" type="file" accept="image/*" className="sr-only" onChange={aoEscolherFoto} />

        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="pauta-nome">Nome no post</Label>
            <Input id="pauta-nome" value={nome} placeholder="marcos" autoComplete="off"
                   onChange={(e) => setNome(e.target.value.toLowerCase())} />
          </div>
          <div className="space-y-1.5">
            <Label>Tratamento</Label>
            <Select value={tratamento} onValueChange={(v) => setTratamento(v as "dia do" | "dia da")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dia do">dia do</SelectItem>
                <SelectItem value="dia da">dia da</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-[90px_1fr] gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="pauta-dia">Dia</Label>
              <Input id="pauta-dia" type="number" min={1} max={31} value={dia}
                     onChange={(e) => setDia(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Mês</Label>
              <Select value={String(mes)} onValueChange={(v) => setMes(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MESES.map((m, i) => <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        {pessoa?.id && (
          <Button variant="ghost" size="sm" onClick={remover} className="mr-auto text-destructive">
            <Trash2 className="mr-1.5 size-3.5" /> Remover
          </Button>
        )}
        <Button variant="ghost" onClick={aoFechar}>Cancelar</Button>
        <Button onClick={salvar} disabled={salvando}>
          {salvando && <Loader2 className="mr-2 size-4 animate-spin" />}
          Salvar
        </Button>
      </div>
    </div>
  );
}
