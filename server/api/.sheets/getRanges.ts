import { fetchRangesData } from '~~/server/utils/old/sheets'

interface DepartmentOverview {
  email: string
  userName: string
  userReports: QueriedUserEntries
}

export default defineEventHandler(async (event) => {
  try {
    const rawRanges = await fetchRangesData()
    const ranges = formatDirectoryQuery(rawRanges)

    return ranges
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch ranges: ${error.message}`,
    })
  }
})