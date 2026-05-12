import { supabase } from "@/lib/supabase";

/**
 * Given a resume_url from the DB (which may be an expired signed URL or a raw path),
 * returns a fresh signed URL valid for 1 hour.
 * 
 * Usage: const url = await getFreshResumeUrl(profile.resume_url);
 */
export async function getFreshResumeUrl(
  storedUrl: string | null | undefined
): Promise<string | null> {
  if (!storedUrl) return null;

  // Extract the storage path from whatever format it's stored in
  // Handles: full signed URL, full public URL, or raw path like "resumes/uuid/file.pdf"
  let path = storedUrl;

  // If it's a full Supabase URL, extract just the path after /storage/v1/object/
  const storageMatch = storedUrl.match(/\/storage\/v1\/object\/(?:sign\/|public\/)?([^?]+)/);
  if (storageMatch) {
    path = storageMatch[1];
    // Remove bucket prefix if present (e.g. "resumes/..." stays, "private/resumes/..." -> remove "private/")
    path = path.replace(/^(public|private)\//, "");
  }

  // Determine bucket from path prefix
  const bucket = path.startsWith("avatars/") ? "avatars" : "resumes";

  // Generate a fresh signed URL valid for 1 hour (3600 seconds)
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 3600);

  if (error || !data?.signedUrl) {
    console.warn("Could not generate signed URL:", error?.message);
    return null;
  }

  return data.signedUrl;
}

/**
 * Store only the file path (not the full signed URL) in the DB.
 * This prevents expiry issues.
 * 
 * Usage: const path = extractStoragePath(signedUrl);
 * Then: supabase.from("profiles").update({ resume_url: path })
 */
export function extractStoragePath(signedUrl: string): string {
  const match = signedUrl.match(/\/storage\/v1\/object\/(?:sign\/|public\/)?([^?]+)/);
  if (match) {
    return match[1].replace(/^(public|private)\//, "");
  }
  return signedUrl;
}