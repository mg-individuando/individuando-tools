// Database types
export interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: "admin" | "facilitator";
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandConfig {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  buttonRadius?: string;
  fontFamily?: string;
  fontUrl?: string;
  headingWeight?: string;
  bodyWeight?: string;
  labelWeight?: string;
  headerBg?: string;
  headerTextColor?: string;
  footerText?: string;
}

export interface Client {
  id: string;
  created_by: string | null;
  name: string;
  slug: string;
  logo_url: string | null;
  partner_logo_url: string | null;
  show_partner_logo: boolean;
  brand_config: BrandConfig;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tool {
  id: string;
  created_by: string;
  title: string;
  slug: string;
  description: string | null;
  template_type: string;
  schema: Record<string, unknown>;
  style_config: Record<string, unknown>;
  settings: Record<string, unknown>;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  created_at: string;
  updated_at: string;
  client_id: string | null;
  // Joined
  profiles?: Profile;
  clients?: Client;
}

export interface ToolSession {
  id: string;
  tool_id: string;
  name: string;
  access_code: string | null;
  starts_at: string | null;
  expires_at: string | null;
  max_responses: number | null;
  created_by: string;
  created_at: string;
}

export interface Response {
  id: string;
  tool_id: string;
  session_id: string | null;
  participant_name: string | null;
  participant_email: string | null;
  data: Record<string, unknown>;
  submitted_at: string;
  ip_hash: string | null;
  created_at: string;
}
