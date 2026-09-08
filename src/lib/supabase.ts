import { createBrowserClient } from "@supabase/ssr";

export type WorkspaceRole = "owner" | "admin" | "member";

export type WorkspaceUser = {
  id: string;
  email: string;
  fullName: string;
  role: WorkspaceRole;
};

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

export function isSupabaseConfigured() {
  return Boolean(supabaseConfig.url && supabaseConfig.anonKey);
}

export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) return null;
  return createBrowserClient(supabaseConfig.url, supabaseConfig.anonKey);
}
