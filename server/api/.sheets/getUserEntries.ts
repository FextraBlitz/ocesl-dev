import { useGoogleSheets } from '../middleware/googleapisAuth'
import { QueriedUserDirectory, QueriedUserEntries } from '~~/server/utils/old/schemas'
import { formatDirectoryQuery, formatEntriesQuery } from '~~/server/utils/old/formatters'
import { fetchRangesData } from '~~/server/utils/old/sheets'

export default defineEventHandler(async (event): Promise<{ userName: string; isDean: boolean; userReports: QueriedUserEntries }> => {
  const sheets = useGoogleSheets()
  const config = useRuntimeConfig()
  const queryEmail: string = getQuery(event).email?.toString()?.toLowerCase() ?? ''

  const fetchedDirectory = await fetchRangesData()
  const userDirectory: QueriedUserDirectory = formatDirectoryQuery(fetchedDirectory)

  let isDean = false
  let userIndex = userDirectory.emails.findIndex(e => e?.toLowerCase() === queryEmail)

  if (userIndex === -1) {
    userIndex = userDirectory.dean_emails.findIndex(e => e?.toLowerCase() === queryEmail)
    if (userIndex !== -1) isDean = true
  }

  if (userIndex === -1) {
    return { userName: 'Unlisted', isDean: false, userReports: {} as QueriedUserEntries }
  }

  const displayName = isDean 
    ? (userDirectory.dean_names[userIndex] || 'Dean') 
    : (userDirectory.users[userIndex] || 'Department')

  const userCeRanges: Array<string> = userDirectory.ce_ranges[userIndex]?.split(",") ?? []
  const userCoRanges: Array<string> = userDirectory.co_ranges[userIndex]?.split(",") ?? []
  const userSlRanges: Array<string> = userDirectory.sl_ranges[userIndex]?.split(",") ?? []

  // Range extended through Column M to fetch dean_accepted state
  const combinedUserRanges: string[] = [
    ...userCeRanges.map((r) => "'community_extension'!" + r + ":M" + r.slice(1)),
    ...userCoRanges.map((r) => "'community_outreach'!" + r + ":M" + r.slice(1)),
    ...userSlRanges.map((r) => "'service_learning'!" + r + ":M" + r.slice(1))
  ].filter(item => !item.includes('#N/A'))

  if (combinedUserRanges.length === 0) {
    return { userName: displayName, isDean, userReports: {} as QueriedUserEntries }
  }

  const { data } = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: config.googleSheetsSpreadsheetId,
    ranges: combinedUserRanges,
  })

  const userEntries: QueriedUserEntries = formatEntriesQuery(
    data.valueRanges!, 
    userCeRanges.length, 
    userCoRanges.length, 
    userSlRanges.length, 
    combinedUserRanges, 
    displayName
  )

  return { userName: displayName, isDean, userReports: userEntries }
})