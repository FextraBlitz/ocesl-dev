import type { Database } from '#shared/types/database.types'

// Storage bucket must exist already (create it once in the Supabase dashboard
// or via `supabase storage create-bucket report-thumbnails --public`).
// It needs to be public (or served through a signed URL) since we store the
// plain public URL directly on REPORT.thumbnail_url for simple <img> rendering.
const BUCKET = 'report-thumbnails'

export const useReportThumbnail = () => {
  const client = useSupabaseClient<Database>()

  const pending = ref(false)
  const error = ref<string | null>(null)

  // One thumbnail per report — re-uploading overwrites the same path (upsert),
  // so old thumbnails don't pile up in the bucket as reports are edited.
  async function uploadThumbnail(reportId: number, file: File) {
    pending.value = true
    error.value = null

    try {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${reportId}/thumbnail.${ext}`

      const { error: uploadError } = await client.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, cacheControl: '3600' })

      if (uploadError) throw new Error(uploadError.message)

      const { data } = client.storage.from(BUCKET).getPublicUrl(path)
      return data.publicUrl
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      throw err
    } finally {
      pending.value = false
    }
  }

  return { uploadThumbnail, pending, error }
}
