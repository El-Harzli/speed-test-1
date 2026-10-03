// Resizes + re-encodes an image File in the browser before it's uploaded,
// so a multi-megabyte phone photo doesn't ship to Storage as-is. This runs
// entirely client-side (canvas), so it costs nothing and needs no backend
// changes.
//
// Design goals, given these are listing/hero photos on a luxury site:
//   - Quality loss must be imperceptible. 0.85 JPEG quality + capping the
//     long edge (rather than aggressively downscaling) keeps photos crisp
//     at any card or detail-view size we currently use.
//   - Never make things worse. If compression fails, or the "compressed"
//     result is somehow bigger than the original (can happen with already-
//     optimized PNGs), we just upload the original file untouched.
//   - Small files are left alone — no point spending CPU/time on a photo
//     that's already lightweight.
//   - Handle whatever an agency admin actually uploads, not just JPEGs:
//     iPhone photos default to HEIC (which canvas can't decode directly),
//     PNGs may carry real transparency (logos/overlays), and GIFs/SVGs
//     should never be touched at all.
//
// Requires the `heic2any` package (`npm install heic2any`) — it's only
// imported lazily inside the HEIC branch below, so it adds nothing to the
// main bundle unless an admin actually uploads a HEIC/HEIF file.

const SKIP_BELOW_BYTES = 300 * 1024 // ~300KB — not worth compressing below this

/**
 * @param {File} file - the original image file selected by the admin
 * @param {object} options
 * @param {number} options.maxDimension - max width/height in px (aspect ratio preserved)
 * @param {number} [options.quality=0.85] - output quality, 0–1
 * @returns {Promise<File>} the compressed file, or the original if compression
 *   isn't applicable/fails/doesn't help
 */
export async function compressImage(file, { maxDimension, quality = 0.85 } = {}) {
  if (!file?.size || !maxDimension) return file

  const type = (file.type || '').toLowerCase()
  const name = file.name || ''

  // Vector — rasterizing an SVG through canvas would permanently destroy
  // its scalability for essentially no size win. Leave it alone.
  if (type === 'image/svg+xml' || /\.svg$/i.test(name)) return file

  // Canvas only ever captures a single frame, so running an animated GIF
  // through this pipeline would silently kill the animation.
  if (type === 'image/gif' || /\.gif$/i.test(name)) return file

  let workingFile = file

  // HEIC/HEIF is the default photo format on iPhones, and most browsers
  // (everything but Safari) can't decode it via createImageBitmap at all —
  // without this step, compression would just quietly no-op and the huge
  // original would get uploaded. Convert to JPEG first, then let the normal
  // resize/compress pipeline below handle it like any other photo.
  const isHeic = type === 'image/heic' || type === 'image/heif' || /\.hei[cf]$/i.test(name)
  if (isHeic) {
    try {
      const { default: heic2any } = await import('heic2any')
      const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })
      const convertedBlob = Array.isArray(result) ? result[0] : result
      workingFile = new File([convertedBlob], name.replace(/\.[^.]+$/, '') + '.jpg', {
        type: 'image/jpeg',
      })
    } catch (error) {
      console.error('HEIC conversion failed, uploading original file instead:', error)
      return file
    }
  }

  if (workingFile.size <= SKIP_BELOW_BYTES) return workingFile

  try {
    // `imageOrientation: 'from-image'` bakes in EXIF rotation so photos
    // taken on a phone don't come out sideways after re-encoding.
    const bitmap = await createImageBitmap(workingFile, { imageOrientation: 'from-image' })

    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close?.()

    // PNG is the one format admins are likely to use *for* transparency
    // (a logo, a watermark overlay) — re-encode those to WebP, which keeps
    // the alpha channel but compresses far smaller than PNG. Everything
    // else (JPEG, WebP, the now-converted HEIC, etc.) goes to JPEG.
    const isPng = type === 'image/png' || /\.png$/i.test(name)
    const targetType = isPng ? 'image/webp' : 'image/jpeg'

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, targetType, quality))

    // Bail out to the working file if toBlob failed, or if for some reason
    // the "compressed" version isn't actually smaller.
    if (!blob || blob.size >= workingFile.size) return workingFile

    const extension = blob.type === 'image/webp' ? 'webp' : blob.type === 'image/png' ? 'png' : 'jpg'
    const baseName = workingFile.name.replace(/\.[^.]+$/, '')
    return new File([blob], `${baseName}.${extension}`, { type: blob.type })
  } catch (error) {
    console.error('Image compression failed, uploading original file instead:', error)
    return workingFile
  }
}
