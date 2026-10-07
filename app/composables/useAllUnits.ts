import type { Database } from '#shared/types/database.types'
import { useUserManagements } from './useUserManagements'

export const useAllUnits = () => {
  const client = useSupabaseClient<Database>()
  // const { unit_ids, pending: managementsPending} = useUserManagements()

  const { data: unit_reports, pending, error, refresh } = useAsyncData(
    `all-unit-ids-${Date.now.toString()}`,
    async () => {

      const { data, error } = await client
      .from('UNIT')
      .select('id')

      if (error) throw new Error(error.message)

      return data?.map((row) => row.id)
    },
  )

  return { unit_reports, pending, error, refresh }
}