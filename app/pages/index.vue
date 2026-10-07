<template>
  <div style="background-image: url('/site-image.png')" class="backdrop-blur-lg bg-slate-200/90 bg-cover bg-center bg-no-repeat relative overflow-hidden space-y-24 py-12">
    <!-- Hero Section -->
    <section class="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto px-4">

      <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-tight">
        OCESL Documentation System <br />
        <span class="text-primary">Safekeeping our efforts</span>
      </h1>

      <p class="text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl leading-relaxed">
        A simple repository for the extension work, outreach, and service learning activities from Silliman University colleges, departments, and partners.
      </p>

      <div class="flex flex-wrap justify-center gap-4 pt-4">
        <UButton
          to="/dashboard"
          color="primary"
          size="xl"
          icon="i-lucide-layout-dashboard"
          label="Go to Dashboard"
          class="font-semibold px-6"
        />
        <UButton
          to="/proto-login-google"
          color="neutral"
          variant="outline"
          size="xl"
          icon="i-lucide-log-in"
          label="Portal Login"
          class="font-semibold px-6"
        />
      </div>
    </section>

    <!-- Feature Cards Section -->
    <section class="max-w-6xl mx-auto px-4">
      <div class="text-center space-y-2 mb-12">
        <h2 class="text-2xl sm:text-3xl font-bold">Made to be quick and easy</h2>
        <p class="text-neutral-500 dark:text-neutral-400">Everything you need to track, store, and verify university documentation.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Feature 1 -->
        <UCard class="hover:border-primary/50 transition-colors">
          <template #header>
            <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
              <UIcon name="i-lucide-folder-git-2" class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-bold">Google Sheets Sync</h3>
          </template>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            Directly synced with automated Google Sheets directory permissions and dynamic row formatting for error-free indexing.
          </p>
        </UCard>

        <!-- Feature 2 -->
        <UCard class="hover:border-primary/50 transition-colors">
          <template #header>
            <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
              <UIcon name="i-lucide-cloud-upload" class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-bold">Cloud Drive Integration</h3>
          </template>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            Attach photo documentation and media directly. Files are organized instantly inside dedicated Google Drive folders.
          </p>
        </UCard>

        <!-- Feature 3 -->
        <UCard class="hover:border-primary/50 transition-colors">
          <template #header>
            <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
              <UIcon name="i-lucide-shield-check" class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-bold">OCESL Verification</h3>
          </template>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            Administrative controls allow OCESL to review, provide feedback, and lock completed records against accidental edits.
          </p>
        </UCard>
      </div>
    </section>

    <!-- Quick Stats Banner -->
    <section class="max-w-5xl mx-auto px-4">
      <div class="p-8 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/50 flex flex-col md:flex-row justify-around items-center gap-6 text-center">
        <div>
          <p class="text-3xl sm:text-4xl font-extrabold text-primary">3 Main</p>
          <p class="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1">Categories (CE, CO, SL)</p>
        </div>
        <USeparator orientation="vertical" class="hidden md:block h-12" />
        <div>
          <p class="text-3xl sm:text-4xl font-extrabold text-primary">100%</p>
          <p class="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1">Automated Drive Storage</p>
        </div>
        <USeparator orientation="vertical" class="hidden md:block h-12" />
        <div>
          <p class="text-3xl sm:text-4xl font-extrabold text-primary">Real-time</p>
          <p class="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1">Status Verification</p>
        </div>
      </div>
    </section>

    <!-- Call to Action Banner -->
    <section class="max-w-4xl mx-auto px-4 text-center">
      <UCard class="p-8 bg-linear-to-r from-primary/10 via-transparent to-primary/5 border border-primary/20">
        <div class="space-y-4">
          <h2 class="text-2xl sm:text-3xl font-bold">Ready to submit your report?</h2>
          <p class="text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto">
            Log in with your department account to manage entries, upload attachments, and track document status.
          </p>
          <div class="pt-2">
            <UButton
              to="/dashboard"
              color="primary"
              size="lg"
              label="Launch App"
              icon="i-lucide-arrow-right"
              trailing
            />
          </div>
        </div>
      </UCard>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'OCESL Documentation System | Home',
})
</script>