import { google } from 'googleapis'
import { useGoogleSheets } from '../middleware/googleapisAuth'
import { QueriedUserDirectory } from '~~/server/utils/old/schemas'
import { formatDirectoryQuery, formatEntryToRow } from '~~/server/utils/old/formatters'

export default defineEventHandler(async (event) => {
  const sheets = useGoogleSheets()
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const { email, dest_type, entry_data } = body

  try {
    // 1. Fetch directory lookup to find user's permissions row
    const fetchedDirectory = await $fetch('/api/sheets/getRanges')
    const userDirectory: QueriedUserDirectory = formatDirectoryQuery(fetchedDirectory)

    const userIndex = userDirectory.emails.indexOf(email)
    if (userIndex === -1) {
      throw createError({ statusCode: 404, statusMessage: 'User email not found in directory permissions.' })
    }

    const permRow = userIndex + 2 // 1-based sheet index + 1 header row

    // 2. Format row array with formula references pointing to permissions!B{permRow} & permissions!A{permRow}
    const rowValues = formatEntryToRow(permRow, entry_data)

    // 3. Append row to target destination sheet
    const appendRes = await sheets.spreadsheets.values.append({
      spreadsheetId: config.googleSheetsSpreadsheetId,
      range: `${dest_type}!A:L`,
      valueInputOption: 'USER_ENTERED', // Crucial: forces Sheets to parse =permissions! formulas
      requestBody: {
        values: [rowValues],
      },
    })

    // Extract newly inserted row number
    const updatedRange = appendRes.data.updates?.updatedRange ?? ''
    const rowMatch = updatedRange.match(/!A(\d+):/)
    if (!rowMatch) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to resolve inserted row range.' })
    }
    const insertedRow = rowMatch[1]
    const newCellRef = `A${insertedRow}`

    // 4. Map destination tab to permissions pointer column
    const columnMap: Record<string, { col: string; currentRanges: string }> = {
      community_extension: { col: 'G', currentRanges: userDirectory.ce_ranges[userIndex] ?? '' },
      community_outreach:  { col: 'H', currentRanges: userDirectory.co_ranges[userIndex] ?? '' },
      service_learning:   { col: 'I', currentRanges: userDirectory.sl_ranges[userIndex] ?? '' },
    }

    const { col, currentRanges } = columnMap[dest_type]!
    const updatedRanges = currentRanges ? `${currentRanges},${newCellRef}` : newCellRef

    // 5. Update permissions pointer column with new cell reference
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.googleSheetsSpreadsheetId,
      range: `permissions!${col}${permRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[updatedRanges]],
      },
    })

    return { 
      success: true, 
      insertedRef: `'${dest_type}'!${newCellRef}:L${insertedRow}` 
    }
  } catch (error) {
    const err = error as Error
    throw createError({ statusCode: 500, statusMessage: err.message })
  }
})