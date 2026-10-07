<!-- components/MockLogin.vue -->
<script setup lang="ts">
// Cookie used by the server API (getUserEntries.ts) to filter data
const mockUserCookie = useCookie<string | null>('mock_user_email', {
  default: () => null,
  path: '/',
  maxAge: 60 * 60 * 8, // Persists for 8 hours
})

const supabase_client = useSupabaseClient()

const handleGoogleSignIn = async () => {
  const { data, error } = await supabase_client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // Optional: Redirect the user back to a specific page on your site after logging in
      redirectTo: `${window.location.origin}/dashboard`, 
    },
  })
  
  if (error) console.error('Error logging in:', error.message)
}

</script>

<template>
  <div class="max-w-xl mx-auto my-8 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
    <UButton label="Google Login" @click="handleGoogleSignIn()">
      
    </UButton>
  </div>
</template>