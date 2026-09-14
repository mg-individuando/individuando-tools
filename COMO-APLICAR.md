# O que é o Supabase e o que fazer

## O que é

O Supabase é onde o `individuando-tools` guarda tudo: os usuários que fazem login,
as ferramentas, os clientes. Não é nada novo — o app **já usa** desde antes. É um
banco de dados na nuvem, com login e um espaço para arquivos, tudo junto.

O que eu adicionei foram duas gavetas novas nesse mesmo armário:

- **`pessoas`** — a equipe: nome, data de aniversário, foto e o enquadramento dela
- **`posts`** — os posts gerados, para poder reabrir e editar depois
- uma pasta privada de arquivos, para as fotos (privada = ninguém acessa por link solto)

## O que você precisa fazer — uma vez só

1. Abra https://supabase.com/dashboard/project/jbcopicfdgawlghzwykf/sql/new
   (é o projeto que já está no ar, o mesmo do `CLAUDE.md`)
2. Abra o arquivo `supabase/migrations/004_posts.sql` deste repositório
3. Copie o conteúdo inteiro, cole na caixa do SQL Editor
4. Clique em **Run**

Pronto. Se aparecer "Success. No rows returned", funcionou.

## Como saber que deu certo

Entre em `/admin/posts`. Antes de rodar, a página mostra um aviso amarelo dizendo
que não conseguiu ler os dados. Depois de rodar, o aviso some e aparece
"Nada nos próximos 60 dias" com um link para montar a pauta.

## Se der erro

O erro mais provável é `relation "profiles" does not exist`, que significa que as
migrations anteriores (001, 002, 003) não foram aplicadas nesse projeto. Nesse caso
rode elas na ordem antes da 004.

Rodar de novo não quebra nada: tudo é `IF NOT EXISTS`.

## Depois de rodar: montar a pauta em um minuto

1. Vá em `/admin/posts/pauta`
2. Clique em **Escolher arquivos**
3. Selecione tudo dentro de
   `_Individuando/Redes/Aniversário_26_Fotos/`
4. Confira a lista que aparece e clique em **Importar**

Nome, data e tratamento saem do próprio nome do arquivo (`13_marcos_04-07.jpg`).
O tratamento ("dia do" / "dia da") vem de um mapa tirado do arquivo do Canva —
adivinhar por terminação erraria em beatriz, lud e mj.

### Sete fotos dessa pasta estão desatualizadas

Você trocou estas no Canva depois que a pasta foi montada. A versão local é a antiga:

| arquivo local | no Canva agora |
|---|---|
| `13_marcos_04-07.jpg` (498×700) | `Marcos.jpg` (3591×5383) |
| `14_lud_17-07.jpg` (267×267) | `lud.png` (4556×5364) |
| `19_lilian-silva_21-09.jpeg` | `Lilia_Pereira.jpg` |
| `20_beatriz_25-09.png` | `Image (42).jpg` |
| `21_ana-gemea_11-10.jpg` | `Aninha.jpg` |
| `23_saulo_21-10.jpg` | `MicrosoftTeams-image (79).jpg` |
| `18_leo_13-09.jpg` | `IMG_0089.HEIC` |

Não consigo baixar as novas: a API do Canva devolve só miniatura de 200 px e a URL
é assinada — pedir tamanho maior dá 403. Baixe as sete pelo Canva para dentro da
pasta com o mesmo padrão de nome, ou troque cada uma pela tela da pauta depois de
importar (é um clique por pessoa).

Também estão na pasta `04_beta` e `05_camila`, cujas páginas foram apagadas do
arquivo. Importe e remova, ou desmarque na hora de escolher.
