import type { Database } from '#shared/types/database.types'
import { useUserManagements } from './useUserManagements'

export const useUnitsInfo = () => {
  const client = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const { user_data, pending: userPending} = useUserData()
  // const { unit_ids, pending: managementsPending} = useUserManagements()

  const { data: unit_info, pending, error, refresh } = useAsyncData(
    `unit-info-${Date.now.toString()}`,
    async () => {
      // PATCHED IN GETTING USER'S UNIT IDs BECAUSE ASYNC DOESNT REFRESH
      const staffId = user_data.value?.id
      console.log('staffId', staffId)

      if (!staffId) {console.log('returned blank'); return []}
      
      console.log('searching with staffId', staffId)
      const { data: mgmt_data, error: mgmt_error } = await client
      .from('MANAGEMENT')
      .select('unit_id')
      .eq('staff_id', staffId);

      if (mgmt_error) throw new Error(mgmt_error.message)

      console.log('1', mgmt_data)
      const ids = mgmt_data?.map((row) => row.unit_id)

      // -----------END OF PATCH---------

      if (!ids) {console.log('early return'); return [] as Database['public']['Tables']['UNIT']['Row'][]}
      
      const { data: units_data, error: units_error } = await client
      .from('UNIT')
      .select('*')
      .in('id', ids);

      if (units_error) throw new Error(units_error.message)
      
      console.log(ids, units_data)
      return units_data
    },{ 
      watch: [user_data]
    })

  return { unit_info, pending, error, refresh }
}