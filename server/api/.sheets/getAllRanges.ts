import { fetchRangesData } from '~~/server/utils/old/sheets'

export default defineEventHandler(async (event) => {
  try {
    return await fetchRangesData()
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch ranges: ${error.message}`,
    })
  }
})