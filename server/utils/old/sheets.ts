import { useGoogleSheets } from '#server/api/middleware/googleapisAuth'

export async function fetchRangesData() {
  const sheets = useGoogleSheets()
  const config = useRuntimeConfig()

  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: config.googleSheetsSpreadsheetId,
    ranges: [
      "'permissions'!A2:A", // college/dept names[cite: 34]
      "'permissions'!B2:B", // college/dept emails[cite: 34]
      "'permissions'!C2:C", // dean names
      "'permissions'!D2:D", // dean emails
      "'permissions'!G2:G", // ce_ranges[cite: 34]
      "'permissions'!H2:H", // co_ranges[cite: 34]
      "'permissions'!I2:I", // sl_ranges[cite: 34]
    ],
  })

  return response.data.valueRanges ?? []
}