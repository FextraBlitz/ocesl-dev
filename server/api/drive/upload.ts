import { Readable } from 'stream'
import { useGoogleDrive, getOrCreateFolderTree } from '#server/utils/drive'

export default defineEventHandler(async (event) => {
  const drive = useGoogleDrive()
  const formData = await readMultipartFormData(event)

  if (!formData) throw createError({ statusCode: 400, statusMessage: 'No files provided.' })

  let email = ''
  let category = ''
  let eventName = ''
  const filesToUpload: Array<{ filename: string; type: string; data: Buffer }> = []

  for (const field of formData) {
    if (field.name === 'email') email = field.data.toString()
    else if (field.name === 'category') category = field.data.toString()
    else if (field.name === 'event_name') eventName = field.data.toString()
    else if (field.filename) {
      filesToUpload.push({
        filename: field.filename,
        type: field.type || 'application/octet-stream',
        data: field.data,
      })
    }
  }

  const targetFolderId = await getOrCreateFolderTree(email, category, eventName)
  const uploadedFiles: Array<{ id: string; name: string; webViewLink: string }> = []

  for (const file of filesToUpload) {
    const fileStream = new Readable()
    fileStream.push(file.data)
    fileStream.push(null)

    const response = await drive.files.create({
      requestBody: {
        name: file.filename,
        parents: [targetFolderId],
      },
      media: {
        mimeType: file.type,
        body: fileStream,
      },
      fields: 'id, name, webViewLink',
      supportsAllDrives: true, // <-- Fixes the 0-byte quota error
    })

    // Make file viewable via link
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: { role: 'reader', type: 'anyone' },
      supportsAllDrives: true,
    })

    uploadedFiles.push({
      id: response.data.id!,
      name: response.data.name!,
      webViewLink: response.data.webViewLink!,
    })
  }

  return { success: true, folderId: targetFolderId, files: uploadedFiles }
})