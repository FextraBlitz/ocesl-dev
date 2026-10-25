import type { Database } from '#shared/types/database.types'

type ReportRow = Database['public']['Tables']['REPORT']['Row']

export const useUpdateReport = () => {
  const client = useSupabaseClient<Database>()

  const error = ref<string | null>(null)
  const pending = ref(false)

  // Accepts a full row (as the editor sends) OR just { id, ...changedColumns }
  // (as the viewer's Dean / admin toggles send), so a toggle never overwrites
  // other columns with stale data.
  const updateReport = async (entryData: Partial<ReportRow> & Pick<ReportRow, 'id'>) => {
    pending.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await client
        .from('REPORT')
        .update(entryData)
        .eq('id', entryData.id)
        .select()
        .single()

      if (fetchError) throw new Error(fetchError.message)
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      throw err
    } finally {
      pending.value = false
    }
  }

  return { updateReport, pending, error }
}
