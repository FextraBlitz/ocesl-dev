import type { Database } from '#shared/types/database.types'

// Routes that require STAFF.authority === 'OCESL'.
const adminPages = ['/dashboard/admin', '/manage']

export default defineNuxtRouteMiddleware(async (to, from) => {
  const client = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const router = useRouter()


  // 1. Check if user is logged into Supabase Auth
  if (!user.value) {
    return navigateTo('/login')
  }

  // 2. Query your specific table for the required value.
  // STAFF has no auth-user-id column — every profile lookup in this app
  // resolves by email (see useUserData), so this needs to match that.
  if (!user.value.email) {
    return router.back()
  }

  const { data, error } = await client
    .from('STAFF')
    .select('authority')
    .eq('email', user.value.email)
    .single()

  // 3. Handle errors or missing records
  if (error || !data) {
    return router.back() //navigateTo('/unauthorized')
  }

  // 4. Validate the specific column value
  const requiredValue = 'OCESL' // Replace with your expected value
  if (adminPages.includes(to.path) && data.authority !== requiredValue) {
    return router.back() //navigateTo('/forbidden')
  }
})
