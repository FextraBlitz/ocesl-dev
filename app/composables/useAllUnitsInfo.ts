import type { Database } from '#shared/types/database.types'

export const useAllUnitsInfo = () => {
  const client = useSupabaseClient<Database>()
  // const { unit_ids, pending: managementsPending} = useUserManagements()

  const { data: unit_info, pending, error, refresh } = useAsyncData(
    `unit-info-${Date.now.toString()}`,
    async () => {
      const { data: units_data, error: units_error } = await client
      .from('UNIT')
      .select('*')

      if (units_error) throw new Error(units_error.message)
      return units_data
    })

  return { unit_info, pending, error, refresh }
}