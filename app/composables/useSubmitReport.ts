import type { Database } from '#shared/types/database.types'
import type { Entry, StrictInsert } from '~/utils/schemas'
import { useUserManagements } from './useUserManagements'

export const useSubmitReport = () => {  
  const client = useSupabaseClient<Database>()

  // const inserted_data = ref<Database['public']['Tables']['REPORT']['Row']>()
  const error = ref(<string | null>null)
  const pending = ref(false)

  const submitReport = async (entryData: Omit<Database['public']['Tables']['REPORT']['Insert'], 'id'>) => {
    // const fullEntryData: Omit<Database['public']['Tables']['REPORT']['Insert'], 'id'> = {
    //   ...entryData,
    // }
    try {
      const { data, error: fetchError } = await client
      .from('REPORT')
      .insert(entryData)
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

  // console.log('submit success...?', inserted_data)
  return { submitReport, pending, error }
}