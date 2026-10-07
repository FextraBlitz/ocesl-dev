import type { Database } from '#shared/types/database.types'

export const useUnitsList = () => {
  const client = useSupabaseClient<Database>()

  const { data: units, pending, error, refresh } = useAsyncData(
    'all-units-list',
    async () => {
      const { data, error } = await client
        .from('UNIT')
        .select('*')
        .order('name')

      if (error) throw new Error(error.message)
      return data
    }
  )

  return { units, pending, error, refresh }
}
