import type { Database } from '#shared/types/database.types'

// Routes that require STAFF.authority === 'OCESL'. These must match the real
// routes (pages/manage.vue and pages/dashboard/admin.vue). A path that is not
// listed here is open to any signed-in user.
const adminPages = ['/manage', '/dashboard/admin']

export default defineNuxtRouteMiddleware(async (to) => {
  const client = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  // 1. Signed in at all?
  if (!user.value) {
    return navigateTo('/login')
  }

  // 2. Not an admin page: being signed in is enough.
  const isAdminPage = adminPages.some((p) => to.path === p || to.path.startsWith(`${p}/`))
  if (!isAdminPage) return

  // 3. Admin page: look the person up by email (STAFF has no auth-user-id column).
  if (!user.value.email) {
    return navigateTo('/dashboard')
  }

  const { data, error } = await client
    .from('STAFF')
    .select('authority')
    .eq('email', user.value.email)
    .single()

  // 4. No profile, or not an OCESL administrator: send them to their own dashboard.
  if (error || !data || data.authority !== 'OCESL') {
    return navigateTo('/dashboard')
  }
})
