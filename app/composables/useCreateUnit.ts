import type { Database } from '#shared/types/database.types'

export const useCreateUnit = () => {
  const client = useSupabaseClient<Database>()

  const pending = ref(false)
  const error = ref<string | null>(null)

  async function createUnit(unit: Database['public']['Tables']['UNIT']['Insert']) {
    pending.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await client
        .from('UNIT')
        .insert(unit)
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

  return { createUnit, pending, error }
}
