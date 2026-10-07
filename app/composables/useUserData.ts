import type { Database } from '#shared/types/database.types'

export const useUserData = () => {
  const client = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  const user_data = ref<Database['public']['Tables']['STAFF']['Row']>()
  const error = ref(null)
  const pending = ref(false)

  watchEffect(async () => {
    if (!user.value?.email) return null

    pending.value = true
    error.value = null
    
    const { data: fetchResult, error: fetchError } = await client
    .from('STAFF')
    .select('*')
    .eq('email', user.value.email) //change this for proto
    .single();

    if (fetchError) throw new Error(fetchError.message)
    else user_data.value = fetchResult

    return user_data
  })

  return { user_data, pending, error }
}