import type { Database } from '#shared/types/database.types'

export const useUpdateStaffAuthority = () => {
  const client = useSupabaseClient<Database>()

  const pending = ref(false)
  const error = ref<string | null>(null)

  // authority is a flat text column on STAFF — 'OCESL' marks org-wide admins,
  // '' (or null) is a regular staff member. This is separate from a unit-level
  // position (DEAN/STAFF in MANAGEMENT), which useManagement handles.
  async function setAuthority(staff_id: number, authority: 'OCESL' | '') {
    pending.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await client
        .from('STAFF')
        .update({ authority })
        .eq('id', staff_id)
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

  return { setAuthority, pending, error }
}
