# Foto de pessoa: onde pode e onde não pode

Este projeto lida com foto de funcionário. A regra abaixo é de engenharia — a parte
jurídica (base legal, aviso à equipe, prazo de retenção) é com quem cuida disso.

## A regra

**`public/` é servido sem login.** No Next.js, tudo nessa pasta vira arquivo estático
com URL aberta; o middleware de autenticação não passa por ali. Então:

| onde | quem alcança | serve para |
|---|---|---|
| `public/` | qualquer um com a URL | ativos de marca: logo, fontes, grafismos |
| bucket `posts` no Supabase | só autenticado, por URL assinada de 8 h | foto de pessoa |

Foto de pessoa **nunca** vai para `public/` nem para o repositório.

## Como isso é garantido, e não só combinado

1. **`.gitignore`**: `public/**/_*` — em `public/`, qualquer caminho começando com `_`
   é local e não entra no repositório. É a convenção para fixture de teste.
2. **`scripts/checar-publicos.mjs`**, que roda no `npm run build`: `public/` tem uma
   **lista fechada** de ativos permitidos. Qualquer arquivo fora dela derruba o build
   com a instrução do que fazer. Um ativo de marca novo entra na lista de propósito,
   por quem sabe o que está acrescentando.
3. **Upload pelo app** grava direto no bucket privado. O caminho é o que fica salvo;
   a URL de exibição é assinada e expira.

## Apagar de verdade

Na tela da pauta, cada pessoa tem duas ações diferentes:

- **Tirar da pauta** — sai da lista do ano, cadastro e foto continuam.
- **Apagar** — remove o cadastro **e o arquivo do bucket**. Sem volta. É o que atende
  um pedido de exclusão.

Trocar a foto de alguém também apaga a anterior, para não acumular imagem órfã
no armazenamento sem nenhum cadastro apontando para ela.

## O que continua fora do meu alcance

- Posts já **publicados** no Instagram são cópia que vive lá; apagar aqui não mexe neles.
- PNG exportado e baixado por alguém é arquivo no computador dessa pessoa.
