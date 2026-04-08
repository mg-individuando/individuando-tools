-- Tabela de clientes com branding
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  partner_logo_url TEXT,
  show_partner_logo BOOLEAN DEFAULT true,
  brand_config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- brand_config structure example:
-- {
--   "primaryColor": "#C3002F",
--   "secondaryColor": "#000000",
--   "backgroundColor": "#FFFFFF",
--   "textColor": "#1a1a1a",
--   "buttonColor": "#C3002F",
--   "buttonTextColor": "#FFFFFF",
--   "buttonRadius": "8px",
--   "fontFamily": "Roboto",
--   "fontUrl": "",
--   "headingWeight": "700",
--   "bodyWeight": "400",
--   "labelWeight": "600",
--   "headerBg": "#000000",
--   "headerTextColor": "#FFFFFF",
--   "footerText": "Powered by Individuando"
-- }

-- Índices
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON clients(created_by);
CREATE INDEX IF NOT EXISTS idx_clients_slug ON clients(slug);
CREATE INDEX IF NOT EXISTS idx_clients_active ON clients(is_active);

-- Trigger de updated_at (reusa a função existente)
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Adicionar client_id à tabela tools (nullable - ferramentas sem cliente usam branding padrão)
ALTER TABLE tools ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_tools_client_id ON tools(client_id);

-- RLS para clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Admins podem tudo
CREATE POLICY "Admins manage clients"
  ON clients FOR ALL
  TO authenticated
  USING (is_admin());

-- Facilitadores podem ver clientes ativos (para o dropdown)
CREATE POLICY "Facilitators view active clients"
  ON clients FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Público pode ver clientes (para branding no formulário público)
CREATE POLICY "Public view clients for branding"
  ON clients FOR SELECT
  TO anon
  USING (is_active = true);
