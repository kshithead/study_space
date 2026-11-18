import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://grmhuhzvkygpluasxsto.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_NNEjeY6EWJ37lbVsZlSQCA_ZDU7SI8U";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("https://") &&
    !supabaseUrl.includes("placeholder")
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Upload a study material PDF to Supabase Storage bucket 'study-materials'
 */
export async function uploadPdfToSupabase(file: File, userEmail?: string): Promise<{ url: string; path: string }> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const prefix = userEmail ? userEmail.replace(/[^a-zA-Z0-9]/g, "_") : "general";
  const filePath = `${prefix}/${Date.now()}_${cleanName}`;

  const { data, error } = await supabase.storage
    .from("study-materials")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: "application/pdf",
    });

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from("study-materials")
    .getPublicUrl(data.path);

  return {
    url: publicUrlData.publicUrl,
    path: data.path,
  };
}

export interface SupabasePdfDoc {
  id: string;
  name: string;
  title: string;
  url: string;
  createdAt: string;
  size?: number;
}

/**
 * List all uploaded PDFs from Supabase Storage bucket 'study-materials'
 */
export async function listPdfsFromSupabase(userEmail?: string): Promise<SupabasePdfDoc[]> {
  if (!supabase) return [];

  const folders = ["general"];
  if (userEmail) {
    const userFolder = userEmail.replace(/[^a-zA-Z0-9]/g, "_");
    if (!folders.includes(userFolder)) {
      folders.unshift(userFolder);
    }
  }

  const allFiles: SupabasePdfDoc[] = [];
  const seenNames = new Set<string>();

  for (const folder of folders) {
    try {
      const { data, error } = await supabase.storage
        .from("study-materials")
        .list(folder, {
          limit: 100,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error || !data) continue;

      for (const item of data) {
        if (!item.name || item.name.startsWith(".")) continue;
        if (seenNames.has(item.name)) continue;
        seenNames.add(item.name);

        const filePath = `${folder}/${item.name}`;
        const { data: pubData } = supabase.storage
          .from("study-materials")
          .getPublicUrl(filePath);

        // Format clean title from timestamp prefix and underscores
        const cleanTitle = item.name
          .replace(/^\d+_/, "")
          .replace(/\.pdf$/i, "")
          .replace(/_/g, " ");

        allFiles.push({
          id: item.id || item.name,
          name: item.name,
          title: cleanTitle,
          url: pubData.publicUrl,
          createdAt: item.created_at || new Date().toISOString(),
          size: item.metadata?.size,
        });
      }
    } catch (e) {
      console.warn(`Error listing Supabase PDFs for folder ${folder}:`, e);
    }
  }

  return allFiles;
}

