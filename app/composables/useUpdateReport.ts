import type { Database } from '#shared/types/database.types'
import type { Entry, StrictInsert } from '~/utils/schemas'
import { useUserManagements } from './useUserManagements'

export const useUpdateReport = () => {
  const client = useSupabaseClient<Database>()

  // const inserted_data = ref<Database['public']['Tables']['REPORT']['Row']>()
  const error = ref<string | null>(null)
  const pending = ref(false)
  
  const updateReport = async (entryData: Database['public']['Tables']['REPORT']['Row']) => {
    // const fullEntryData: Omit<Database['public']['Tables']['REPORT']['Insert'], 'id'> = {
    //   ...entryData,
    // }
    try {
      const { data, error: fetchError } = await client
      .from('REPORT')
      .update(entryData)
      .eq('id', entryData.id)
      .select()
      .single();

      if (fetchError) throw new Error(fetchError.message)
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      throw err
    } finally {
      pending.value = false
    }
  }

  return { updateReport, pending, error, status }
}