import type { Database } from '#shared/types/database.types'
import { useUserManagements } from './useUserManagements'

export const useUnitReports = (unit_id: Ref<number | undefined>) => {
  const client = useSupabaseClient<Database>()
  // const { unit_ids, pending: managementsPending} = useUserManagements()

  const { data: unit_reports, pending, error, refresh } = useAsyncData(`unit-reports-${Date.now.toString()}`, async () => {
    const uid = unit_id.value
    if (!uid) return []

    const { data, error } = await client
    .from('REPORT')
    .select('*')
    .eq('unit_id', uid)

    if (error) throw new Error(error.message)

    return data
  },
  {
    // 2. Automatically re-runs fetcher whenever unitId ref changes
    watch: [unit_id] 
  }
  )

  return { unit_reports, pending, error, refresh }
}