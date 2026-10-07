import type { Database } from '#shared/types/database.types'

export const useDeleteUnit = () => {
  const client = useSupabaseClient<Database>()

  const pending = ref(false)
  const error = ref<string | null>(null)

  // If REPORT.unit_id or MANAGEMENT.unit_id has a RESTRICT foreign key
  // (rather than CASCADE) back to UNIT, deleting a unit that still has
  // reports or staff assigned will fail with a Postgres FK-violation
  // message — that message is surfaced via `error`/the thrown error as-is,
  // so the admin sees exactly why (e.g. "update or delete on table UNIT
  // violates foreign key constraint...") rather than a silent failure.
  async function deleteUnit(unit_id: number) {
    pending.value = true
    error.value = null

    try {
      const { error: fetchError } = await client
        .from('UNIT')
        .delete()
        .eq('id', unit_id)

      if (fetchError) throw new Error(fetchError.message)
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      throw err
    } finally {
      pending.value = false
    }
  }

  return { deleteUnit, pending, error }
}
