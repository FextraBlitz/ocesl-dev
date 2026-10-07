import type { Database } from '#shared/types/database.types'

type StaffRow = Database['public']['Tables']['STAFF']['Row']

// Inviting a user requires the Supabase service-role key (to call the Auth
// Admin API), which must never be exposed to the browser. So this goes
// through a server route instead of a direct Supabase client call — this is
// the "user-triggered event, plain async function, no useAsyncData" pattern,
// just backed by $fetch to our own API instead of the Supabase SDK directly.
export const useInviteStaff = () => {
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function inviteStaff(email: string, name: string) {
    pending.value = true
    error.value = null

    try {
      return await $fetch<StaffRow>('/api/admin/invite-staff', {
        method: 'POST',
        body: { email, name }
      })
    } catch (err: any) {
      error.value = err?.data?.statusMessage ?? (err instanceof Error ? err.message : String(err))
      throw err
    } finally {
      pending.value = false
    }
  }

  return { inviteStaff, pending, error }
}
