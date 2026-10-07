import { Readable } from 'stream'
import { google } from 'googleapis'
import { getOAuth2Client, useGoogleSheets } from '#server/api/middleware/googleapisAuth'

export function useGoogleDrive() {
  const auth = getOAuth2Client() // Reuse existing authenticated client
  return google.drive({ version: 'v3', auth })
}

// Ensures subfolder tree exists and returns final target folder ID
export async function getOrCreateFolderTree(email: string, category: string, eventName: string): Promise<string> {
  const drive = useGoogleDrive()
  const config = useRuntimeConfig()
  
  let parentId = config.googleDriveRootFolderId

  if (!parentId) {
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Server configuration error: GOOGLE_DRIVE_ROOT_FOLDER_ID is missing.' 
    })
  }
  
  const pathSegments = [email, category, eventName]

  for (const segment of pathSegments) {
    const safeSegment = segment.replace(/'/g, "\\'")

    const res = await drive.files.list({
      q: `'${parentId}' in parents and name = '${safeSegment}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    })

    if (res.data.files && res.data.files.length > 0) {
      parentId = res.data.files[0]!.id!
    } else {
      const folder = await drive.files.create({
        requestBody: {
          name: segment,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentId],
        },
        fields: 'id',
        supportsAllDrives: true, // <-- Required for shared folders/drives
      })
      parentId = folder.data.id!
    }
  }

  return parentId
}