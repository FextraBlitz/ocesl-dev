import type { Database } from '#shared/types/database.types'

export const useAllStaff = () => {
  const client = useSupabaseClient<Database>()

  const { data: staff, pending, error, refresh } = useAsyncData(
    'all-staff',
    async () => {
      const { data, error } = await client
        .from('STAFF')
        .select('*')
        .order('name')

      if (error) throw new Error(error.message)
      return data
    }
  )

  return { staff, pending, error, refresh }
}
