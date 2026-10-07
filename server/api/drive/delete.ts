import { useGoogleDrive } from '#server/utils/drive'

export default defineEventHandler(async (event) => {
  const drive = useGoogleDrive()
  const { fileId } = await readBody(event)

  if (!fileId) throw createError({ statusCode: 400, statusMessage: 'Missing fileId parameter.' })

  try {
    await drive.files.delete({ fileId })
    return { success: true }
  } catch (error) {
    const err = error as Error
    throw createError({ statusCode: 500, statusMessage: err.message })
  }
})