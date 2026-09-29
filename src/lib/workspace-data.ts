import { createSupabaseBrowserClient } from "@/lib/supabase";

export type WorkspaceDataKey =
  | "dev-cluster-projects"
  | "dev-cluster-tasks"
  | "dev-cluster-clients"
  | "dev-cluster-activity"
  | "dev-cluster-team"
  | "dev-cluster-teams"
  | "dev-cluster-team-activity"
  | "dev-cluster-role-requests"
  | "dev-cluster-profile"
  | `dev-cluster-profile:${string}`
  | `dev-cluster-profile-documents:${string}`;

function removeSensitiveFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(removeSensitiveFields);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, nestedValue]) =>
      key.toLowerCase().includes("password")
        ? []
        : [[key, removeSensitiveFields(nestedValue)]],
    ),
  );
}

function readLocalValue<T>(key: WorkspaceDataKey): T | null {
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? null : (JSON.parse(value) as T);
  } catch {
    return null;
  }
}

export async function loadWorkspaceData<T>(
  key: WorkspaceDataKey,
  fallback: T,
): Promise<T> {
  const localValue = readLocalValue<T>(key);
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return localValue ?? fallback;

  const { data, error } = await supabase
    .from("workspace_data")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error) return localValue ?? fallback;
  if (data) {
    try {
      window.localStorage.setItem(key, JSON.stringify(data.value));
    } catch {
      // Remote data remains available even when the browser storage quota is full.
    }
    return data.value as T;
  }

  if (localValue !== null) {
    await supabase.from("workspace_data").upsert({
      key,
      value: removeSensitiveFields(localValue),
      updated_at: new Date().toISOString(),
    });
    return localValue;
  }

  return fallback;
}

export async function saveWorkspaceData<T>(
  key: WorkspaceDataKey,
  value: T,
): Promise<string | null> {
  const serialized = JSON.stringify(value);
  try {
    window.localStorage.setItem(key, serialized);
  } catch {
    // Continue with the remote write when local storage is full.
  }

  const supabase = createSupabaseBrowserClient();
  if (!supabase) return null;

  const { error } = await supabase.from("workspace_data").upsert({
    key,
    value: removeSensitiveFields(value),
    updated_at: new Date().toISOString(),
  });
  return error?.message ?? null;
}