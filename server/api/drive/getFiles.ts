import { useGoogleDrive } from '#server/utils/drive'

export default defineEventHandler(async (event) => {
  const drive = useGoogleDrive()
  const folderId = getQuery(event).folderId?.toString()

  if (!folderId) return []

  try {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, webViewLink, thumbnailLink)',
    })

    // Map files to guarantee non-null string properties
    return (res.data.files ?? []).map((file) => ({
      id: file.id ?? '',
      name: file.name ?? 'Untitled File',
      webViewLink: file.webViewLink ?? '#',
    }))
  } catch {
    return []
  }
})