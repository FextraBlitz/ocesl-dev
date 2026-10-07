import type { Database } from '#shared/types/database.types'

export const useUserManagements = () => {
  const client = useSupabaseClient<Database>()
  const { user_data, pending: userPending} = useUserData()

  const { data: unit_pos, pending, error, refresh } = useAsyncData(
    'user-units-${Date.now.toString()}',
    async () => {
      const staffId = user_data.value?.id
      if (!staffId) {console.log('returned blank'); return []}
      
      const { data, error } = await client
      .from('MANAGEMENT')
      .select('*')
      .eq('staff_id', staffId);

      if (error) throw new Error(error.message)
      return data
    },
    { 
      watch: [user_data],
      // default: () => [] as Database['public']['Tables']['MANAGEMENT'][],
    }
  )

  return { unit_pos, pending: computed(() => userPending.value || pending.value), error, refresh }
}