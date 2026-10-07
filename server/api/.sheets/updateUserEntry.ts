import { useGoogleSheets } from '../middleware/googleapisAuth'
import { QueriedUserDirectory, UserEntry } from '~~/server/utils/old/schemas'
import { formatDirectoryQuery, formatEntryToRow } from '~~/server/utils/old/formatters'

export default defineEventHandler(async (event) => {
  const sheets = useGoogleSheets()
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const { email, entry_data }: { email: string; entry_data: UserEntry } = body

  if (!entry_data.reference) {
    throw createError({ statusCode: 400, statusMessage: 'Missing entry reference range for update operation.' })
  }

  try {
    // 1. Resolve user's row in permissions tab
    const fetchedDirectory = await fetchRangesData()
    const userDirectory: QueriedUserDirectory = formatDirectoryQuery(fetchedDirectory)

    const userIndex = userDirectory.emails.indexOf(email)
    if (userIndex === -1) {
      throw createError({ statusCode: 404, statusMessage: 'User email not found in directory permissions.' })
    }

    const permRow = userIndex + 2

    // 2. Format row with formula references
    const rowValues = formatEntryToRow(permRow, entry_data)

    // 3. Update target range with formula values
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.googleSheetsSpreadsheetId,
      range: entry_data.reference,
      valueInputOption: 'USER_ENTERED', // Crucial: evaluates dynamic formulas
      requestBody: {
        values: [rowValues],
      },
    })

    return { success: true }
  } catch (error) {
    const err = error as Error
    throw createError({ statusCode: 500, statusMessage: err.message })
  }
})