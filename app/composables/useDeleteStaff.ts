import type { Database } from '#shared/types/database.types'

export const useDeleteStaff = () => {
  const client = useSupabaseClient<Database>()

  const pending = ref(false)
  const error = ref<string | null>(null)

  // This removes the STAFF row (and, if MANAGEMENT has a CASCADE foreign key
  // on staff_id, their unit assignments go with it — check that constraint
  // if you want assignments to also disappear automatically).
  //
  // NOTE: this does NOT delete their Supabase Auth account. Removing the
  // actual login requires the service-role key, same as inviteStaff did —
  // it would need a server route (client.auth.admin.deleteUser). Left out
  // for now since "delete staff" here reads as "remove their profile/access
  // to units," but say the word if you want the auth account gone too.
  async function deleteStaff(staff_id: number) {
    pending.value = true
    error.value = null

    try {
      const { error: fetchError } = await client
        .from('STAFF')
        .delete()
        .eq('id', staff_id)

      if (fetchError) throw new Error(fetchError.message)
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      throw err
    } finally {
      pending.value = false
    }
  }

  return { deleteStaff, pending, error }
}
