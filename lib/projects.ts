import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";

/** Fetches all projects, featured first then newest first. Never throws. */
export async function getProjects(): Promise<Project[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data ?? []) as Project[];
  } catch {
    return [];
  }
}
