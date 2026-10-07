<script setup lang="ts">
const supabaseClient = useSupabaseClient()
const supabaseUser = useSupabaseUser()

const isSigningIn = ref(false)
const errorMessage = ref<string | null>(null)

// If someone's already authenticated and lands here anyway (e.g. an old
// bookmark, or a stray link), just take them straight to the dashboard
// instead of showing a pointless "sign in" button.
watch(
  supabaseUser,
  (user) => {
    if (user) navigateTo('/dashboard')
  },
  { immediate: true }
)

async function handleGoogleSignIn() {
  isSigningIn.value = true
  errorMessage.value = null

  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  })

  if (error) {
    console.error('Error logging in:', error.message)
    errorMessage.value = 'Something went wrong signing in. Please try again.'
    isSigningIn.value = false
  }
  // On success, the browser is redirected away by Supabase — no need to
  // reset isSigningIn here, the page is navigating away regardless.
}
</script>

<template>
  <div class="flex items-center justify-center py-24 px-4">
    <div class="w-full max-w-sm flex flex-col items-center gap-8 rounded-xl border border-default bg-white dark:bg-neutral-900 p-8 shadow-sm">
      <AppLogo class="h-10 w-auto" />

      <div class="flex flex-col items-center gap-1 text-center">
        <h1 class="text-lg font-semibold">Sign in</h1>
        <p class="text-sm text-muted">Use your Silliman University Google account to continue.</p>
      </div>

      <UAlert
        v-if="errorMessage"
        color="error"
        variant="soft"
        icon="i-lucide-alert-circle"
        :title="errorMessage"
        class="w-full"
      />

      <UButton
        block
        size="lg"
        color="neutral"
        variant="outline"
        icon="i-simple-icons-google"
        :loading="isSigningIn"
        :disabled="isSigningIn"
        @click="handleGoogleSignIn"
      >
        {{ isSigningIn ? 'Redirecting…' : 'Continue with Google' }}
      </UButton>

      <p class="text-xs text-muted text-center">
        Access is limited to accounts already registered as staff. Contact your OCESL admin if you need access.
      </p>
    </div>
  </div>
</template>
