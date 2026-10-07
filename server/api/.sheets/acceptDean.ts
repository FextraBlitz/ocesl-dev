import { useGoogleSheets } from '../middleware/googleapisAuth'

export default defineEventHandler(async (event) => {
  const sheets = useGoogleSheets()
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const { reference, dean_accepted }: { reference: string; dean_accepted: boolean } = body

  if (!reference) {
    throw createError({ statusCode: 400, statusMessage: 'Missing entry reference.' })
  }

  // Parse reference, e.g. "'community_extension'!A5:M5" -> target Column M cell
  const match = reference.match(/^'([^']+)'!([A-Z]+)(\d+):/)
  if (!match) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid reference format.' })
  }

  const sheetName = match[1]
  const rowNum = match[3]
  const targetCell = `'${sheetName}'!M${rowNum}`

  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.googleSheetsSpreadsheetId,
      range: targetCell,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[dean_accepted ? 'TRUE' : 'FALSE']],
      },
    })

    return { success: true }
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})