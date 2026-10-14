import { createClient } from '@supabase/supabase-js';
import { ENV } from '../config/env.js';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface UploadResult {
  url: string;
  filename: string;
  sizeBytes: number;
  mimeType: string;
}

export async function uploadMedia(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string
): Promise<UploadResult> {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error(`Unsupported media type: ${mimeType}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`);
  }

  if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File size (${(fileBuffer.length / (1024 * 1024)).toFixed(1)}MB) exceeds limit of 10MB.`);
  }

  const cleanExt = filename.split('.').pop() || 'png';
  const uniqueName = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${cleanExt}`;

  // If Supabase Storage is configured, upload to 'creatorconnect-media' bucket
  if (ENV.isSupabaseConfigured && (ENV.SUPABASE_SERVICE_ROLE_KEY || ENV.SUPABASE_ANON_KEY)) {
    try {
      const supabase = createClient(
        ENV.SUPABASE_URL,
        ENV.SUPABASE_SERVICE_ROLE_KEY || ENV.SUPABASE_ANON_KEY
      );
      const { data, error } = await supabase.storage
        .from('creatorconnect-media')
        .upload(`public/${uniqueName}`, fileBuffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('creatorconnect-media')
          .getPublicUrl(`public/${uniqueName}`);

        return {
          url: publicUrlData.publicUrl,
          filename: uniqueName,
          sizeBytes: fileBuffer.length,
          mimeType,
        };
      }
    } catch (err) {
      console.warn('[Storage] Supabase upload error, falling back:', err);
    }
  }

  // Resilient fallback: Data URL
  const base64Data = fileBuffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  return {
    url: dataUrl,
    filename: uniqueName,
    sizeBytes: fileBuffer.length,
    mimeType,
  };
}
