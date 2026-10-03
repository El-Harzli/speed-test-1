import { supabase } from '../../lib/supabaseClient'
import { compressImage } from './compressImage'

// Per-bucket compression targets. These caps are picked from how large each
// image ever actually renders on the public site — no point storing an
// avatar at 4000px when it never displays bigger than a couple hundred.
// Quality is kept high (0.85) across the board since these are the photos
// selling the property; the size win comes from the dimension cap, not from
// aggressive quality loss.
const COMPRESSION_PRESETS = {
  'property-images': { maxDimension: 2400, quality: 0.85 },
  'neighborhood-images': { maxDimension: 2000, quality: 0.85 },
  'agent-avatars': { maxDimension: 800, quality: 0.85 },
}

// Uploads a File to the given Storage bucket at `path` and returns its
// public URL. Both buckets ('property-images', 'agent-avatars') are public
// read / admin write, per the storage policies set up alongside the schema.
export async function uploadFile(bucket, path, file) {
  const preset = COMPRESSION_PRESETS[bucket]
  const fileToUpload = preset ? await compressImage(file, preset) : file

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, fileToUpload, {
    cacheControl: '3600',
    upsert: false,
  })
  if (uploadError) throw uploadError

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
