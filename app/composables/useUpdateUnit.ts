import type { Database } from '#shared/types/database.types'

export const useUpdateUnit = () => {
  const client = useSupabaseClient<Database>()

  const pending = ref(false)
  const error = ref<string | null>(null)

  async function updateUnit(unit_id: number, patch: Database['public']['Tables']['UNIT']['Update']) {
    pending.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await client
        .from('UNIT')
        .update(patch)
        .eq('id', unit_id)
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

  return { updateUnit, pending, error }
}
