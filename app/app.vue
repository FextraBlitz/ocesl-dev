<script setup lang="ts">
useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: '/favicon.png' }],
  htmlAttrs: { lang: 'en' }
})

const route = useRoute()
const isAdminPage = computed(() => route.path.startsWith('/dashboard/admin'))

// Two independent things were being collapsed into one 'User' fallback:
// (1) whether Supabase Auth thinks anyone is logged in at all, and
// (2) whether the matching STAFF profile row has loaded. Checking them
// separately is what lets "logged out", "loading", and "no profile found"
// render as distinct, honest states instead of all looking like "User".
const supabaseUser = useSupabaseUser()
const { user_data, pending: userPending, error: userError } = useUserData()

const isLoggedOut = computed(() => !supabaseUser.value)
const isProfileLoading = computed(() => !isLoggedOut.value && userPending.value && !user_data.value)
const isProfileMissing = computed(() => !isLoggedOut.value && !userPending.value && !user_data.value)

const userName = computed(() => user_data.value?.name ?? null)
const isOceslAdmin = computed(() => user_data.value?.authority === 'OCESL')

const supabaseClient = useSupabaseClient()

async function handleLogout() {
  await supabaseClient.auth.signOut()
  navigateTo('/proto-login-google')
}
</script>

<template>
  <UApp>
    <UHeader :toggle="false" :ui="{'container': 'w-full mx-0 px-2 md:px-[10vw] max-w-screen flex justify-between items-center'}">
      <template #left>
        <NuxtLink to="https://su.edu.ph">
          <AppLogo class="w-auto h-6 shrink-0" />
        </NuxtLink>
      </template>

      <template #default>
        <span class="text-nowrap flex items-center gap-2">
          <template v-if="isLoggedOut">
            <UIcon name="i-lucide-user-x" class="size-4 text-muted" />
            <span class="text-muted text-sm">Not logged in</span>
          </template>

          <template v-else-if="isProfileLoading">
            <span class="text-muted">Logged in as</span>
            <USkeleton class="h-4 w-24" />
          </template>

          <template v-else-if="isProfileMissing">
            <UIcon name="i-lucide-triangle-alert" class="size-4 text-warning" />
            <span class="text-warning text-sm" :title="userError ?? undefined">No staff profile found</span>
          </template>

          <template v-else>
            Logged in as<span class="text-primary font-bold">{{ userName }}</span>
            <UBadge v-if="isOceslAdmin" color="success" variant="soft">OCESL</UBadge>
          </template>
        </span>
      </template>

      <template #right>
        <UButton
          v-if="isOceslAdmin"
          to="/manage"
          color="primary"
          variant="soft"
          size="lg"
          label="Manage"
          icon="i-lucide-cog"
          class="px-2"
          :ui="{'label': 'hidden lg:inline'}"
        />
        <UButton
          v-if="isOceslAdmin"
          :to="isAdminPage ? '/dashboard' : '/dashboard/admin'"
          color="primary"
          variant="soft"
          size="lg"
          :label="isAdminPage ? 'Open User Dashboard' : 'Open Admin Panel'"
          :icon="isAdminPage ? 'i-lucide-layout-dashboard' : 'i-lucide-shield'"
          class="px-2"
          :ui="{'label': 'hidden lg:inline'}"
        />
        <UButton
          v-if="!isLoggedOut"
          color="primary"
          variant="ghost"
          size="lg"
          label="Log out"
          class="px-2"
          @click="handleLogout"
        />
        <UButton
          v-else
          to="/proto-login-google"
          color="primary"
          variant="soft"
          size="lg"
          label="Log in"
        />
        <UColorModeButton />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage :key="$route.fullPath" />
    </UMain>

    <USeparator />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">Silliman University • {{ new Date().getFullYear() }}</p>
      </template>
      <template #right>
        <UButton
          to="https://github.com/nuxt-ui-templates/starter"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UFooter>
  </UApp>
</template>
