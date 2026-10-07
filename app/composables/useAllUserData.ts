import type { QueriedUserEntries } from '~/utils/schemas'

export const useAllUserData = async () => {
  const { data: ranges } = await useFetch('/api/sheets/getRanges')

  const directory = ranges.value

  if (!directory) {
    return []
  }

  const departments = await Promise.all(
    directory.emails.map(async (email) => {
      const data = await useUserData(email)
      return {
        email,
        userName: data?.userName ?? 'Unknown Department',
        userReports: data?.userReports ?? ({ ce_entries: [], co_entries: [], sl_entries: [] } as QueriedUserEntries)
      }
    })
  )

  return ref(departments)
}