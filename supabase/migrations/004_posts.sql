-- Fábrica de posts: pauta de pessoas + posts gerados
-- Aplicar no Supabase (SQL Editor ou `supabase db push`).

-- ---------------------------------------------------------------- pessoas
-- A pauta. Uma linha por pessoa; a foto fica no Storage e é reaproveitada
-- todo ano, que é o ponto: ninguém sobe a mesma foto duas vezes.
CREATE TABLE IF NOT EXISTS pessoas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,                      -- como sai no post, em minúsculas
  tratamento TEXT NOT NULL DEFAULT 'dia do' CHECK (tratamento IN ('dia do','dia da')),
  nascimento_dia SMALLINT NOT NULL CHECK (nascimento_dia BETWEEN 1 AND 31),
  nascimento_mes SMALLINT NOT NULL CHECK (nascimento_mes BETWEEN 1 AND 12),
  foto_url TEXT,
  -- enquadramento salvo junto da pessoa: ajusta uma vez, vale pros próximos anos
  foto_x REAL NOT NULL DEFAULT 0 CHECK (foto_x BETWEEN -1 AND 1),
  foto_y REAL NOT NULL DEFAULT 0 CHECK (foto_y BETWEEN -1 AND 1),
  foto_zoom REAL NOT NULL DEFAULT 1 CHECK (foto_zoom BETWEEN 1 AND 8),
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_por UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pessoas_data ON pessoas(nascimento_mes, nascimento_dia);
CREATE INDEX IF NOT EXISTS idx_pessoas_ativo ON pessoas(ativo);

CREATE TRIGGER set_pessoas_updated_at
  BEFORE UPDATE ON pessoas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---------------------------------------------------------------- posts
-- Um post gerado. `config` guarda exatamente o que o template recebe, então
-- reabrir um post reproduz a arte igual — não é um PNG órfão.
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template TEXT NOT NULL DEFAULT 'aniversario'
    CHECK (template IN ('aniversario','presenca','marco','grade')),
  titulo TEXT NOT NULL,                    -- para listar ("dia da márcia")
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  pessoa_id UUID REFERENCES pessoas(id) ON DELETE SET NULL,
  -- ano de referência: permite um post por pessoa por ano sem colidir
  ano SMALLINT,
  png_url TEXT,                            -- último PNG exportado, se houver
  status TEXT NOT NULL DEFAULT 'rascunho'
    CHECK (status IN ('rascunho','aprovado','publicado')),
  criado_por UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_template ON posts(template);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_pessoa ON posts(pessoa_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_pessoa_ano
  ON posts(pessoa_id, ano) WHERE pessoa_id IS NOT NULL AND ano IS NOT NULL;

CREATE TRIGGER set_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---------------------------------------------------------------- RLS
-- Quem entra no admin cuida da comunicação: todo autenticado lê e escreve.
-- Nada é público: post de aniversário tem foto de funcionário.
ALTER TABLE pessoas ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados gerenciam pessoas"
  ON pessoas FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Autenticados gerenciam posts"
  ON posts FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------- storage
-- Bucket privado: as fotos não podem ser lidas por link anônimo.
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Autenticados leem arquivos de posts"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'posts');

CREATE POLICY "Autenticados enviam arquivos de posts"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'posts');

CREATE POLICY "Autenticados atualizam arquivos de posts"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'posts');

CREATE POLICY "Autenticados apagam arquivos de posts"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'posts');
