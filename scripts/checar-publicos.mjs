#!/usr/bin/env node
/**
 * Impede que material com pessoa identificável entre em `public/`.
 *
 * `public/` é servido como arquivo estático e NÃO passa pelo middleware de login:
 * qualquer URL ali é aberta. Então o conteúdo permitido é uma lista fechada de
 * ativos de marca. Qualquer outra coisa falha o build, com a instrução do que fazer.
 *
 * Arquivos começando com "_" são ignorados: são locais, e o .gitignore já os
 * mantém fora do repositório.
 */
import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const RAIZ = "public";

/** Lista fechada: ativos de marca, sem pessoa identificável. */
const PERMITIDOS = new Set([
  "marca/blob.png",
  "marca/canto.svg",
  "marca/assinatura-branca.svg",
  "fontes/montserrat-latin-variavel.woff2",
]);

/** Pastas cujo conteúdo é de marca e pode crescer sem lista item a item. */
const PASTAS_DE_MARCA = ["logos/"];

function varrer(dir, achados = []) {
  for (const nome of readdirSync(dir)) {
    if (nome.startsWith("_") || nome.startsWith(".")) continue;
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) varrer(caminho, achados);
    else achados.push(relative(RAIZ, caminho).split(sep).join("/"));
  }
  return achados;
}

let arquivos;
try {
  arquivos = varrer(RAIZ);
} catch {
  process.exit(0); // sem public/, nada a checar
}

const intrusos = arquivos.filter(
  (f) => !PERMITIDOS.has(f) && !PASTAS_DE_MARCA.some((p) => f.startsWith(p)),
);

if (intrusos.length) {
  console.error(
    `\n✖ ${intrusos.length} arquivo(s) inesperado(s) em public/:\n` +
      intrusos.map((f) => `   public/${f}`).join("\n") +
      `\n\n  public/ é servido SEM login — qualquer URL ali é aberta.\n` +
      `  Se for foto de pessoa: suba pelo app, que grava no bucket privado do Supabase.\n` +
      `  Se for fixture local: renomeie com "_" na frente (ex.: _teste-foo.jpg).\n` +
      `  Se for ativo de marca novo: acrescente em PERMITIDOS, em scripts/checar-publicos.mjs.\n`,
  );
  process.exit(1);
}

console.log(`✓ public/ limpo (${arquivos.length} ativos de marca)`);
