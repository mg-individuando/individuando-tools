-- =====================================================
-- Row Level Security Policies
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- Helper: verificar se o usuário é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper: obter profile_id do usuário atual
CREATE OR REPLACE FUNCTION current_profile_id()
RETURNS UUID AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- PROFILES
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  USING (is_admin());

-- TOOLS
CREATE POLICY "Facilitators see own tools"
  ON public.tools FOR SELECT
  USING (created_by = current_profile_id() OR is_admin());

CREATE POLICY "Facilitators create own tools"
  ON public.tools FOR INSERT
  WITH CHECK (created_by = current_profile_id());

CREATE POLICY "Facilitators update own tools"
  ON public.tools FOR UPDATE
  USING (created_by = current_profile_id() OR is_admin());

CREATE POLICY "Facilitators delete own tools"
  ON public.tools FOR DELETE
  USING (created_by = current_profile_id() OR is_admin());

-- Acesso público para ferramentas publicadas (anon pode ler)
CREATE POLICY "Public can view published tools"
  ON public.tools FOR SELECT
  USING (status = 'published');

-- TOOL SESSIONS
CREATE POLICY "Facilitators manage own sessions"
  ON public.tool_sessions FOR ALL
  USING (
    created_by = current_profile_id()
    OR is_admin()
    OR EXISTS (
      SELECT 1 FROM public.tools
      WHERE tools.id = tool_sessions.tool_id
      AND tools.created_by = current_profile_id()
    )
  );

-- RESPONSES
CREATE POLICY "Anyone can submit to published tools"
  ON public.responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tools
      WHERE tools.id = responses.tool_id
      AND tools.status = 'published'
    )
  );

CREATE POLICY "Facilitators view responses to own tools"
  ON public.responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tools
      WHERE tools.id = responses.tool_id
      AND (tools.created_by = current_profile_id() OR is_admin())
    )
  );
