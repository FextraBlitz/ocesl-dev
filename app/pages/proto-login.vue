<!-- components/MockLogin.vue -->
<script setup lang="ts">
// Cookie used by the server API (getUserEntries.ts) to filter data
const mockUserCookie = useCookie<string | null>('mock_user_email', {
  default: () => null,
  path: '/',
  maxAge: 60 * 60 * 8, // Persists for 8 hours
})

// Structured test users across all 3 categories
const userCategories = [
  {
    categoryName: '0. Admin',
    description: 'Website Administrator',
    users: [
      { name: 'OCESL', email: 'ocesl@su.edu.ph', badge: 'OCESL' },
    ]
  },
  {
    categoryName: '1. Department / College Emails',
    description: 'Functional office & department contact endpoints',
    users: [
      { name: 'College of Arts and Sciences', email: 'cas@su.edu.ph', badge: 'CAS Office' },
      { name: 'College of Engineering & Design', email: 'ced@su.edu.ph', badge: 'ENG Office' },
      { name: 'Biology Department', email: 'bio@su.edu.ph', badge: 'CBA Office' },
      { name: 'Chemistry Department', email: 'chem@su.edu.ph', badge: 'Chem Dept' },
      { name: 'College of Computer Studies', email: 'ccs@su.edu.ph', badge: 'CCS Office' },
      { name: 'College of Business and Administration', email: 'cba@su.edu.ph', badge: 'CBA Office' },
      { name: 'Department of Psychology', email: 'psychology@su.edu.ph', badge: 'Psych Dept' },
      { name: 'College of Agriculture', email: 'agriculture@su.edu.ph', badge: 'COA Office' },
    ]
  },
  {
    categoryName: '2. Deans of Respective Colleges',
    description: 'Academic leadership & executive access',
    users: [
      { name: 'Dean, Arts and Sciences', email: 'cas_dean@su.edu.ph', badge: 'Dean' },
      { name: 'Dean, Engineering & Design', email: 'ced_dean@su.edu.ph', badge: 'Dean' },
      { name: 'Head, Biology', email: 'bio_head@su.edu.ph', badge: 'Dean' },
      { name: 'Head, Chemistry', email: 'chem_head@su.edu.ph', badge: 'Head' },
      { name: 'Dean, Computer Studies', email: 'ccs_dean@su.edu.ph', badge: 'Dean' },
      { name: 'Dean, Business and Administration', email: 'cba_dean@su.edu.ph', badge: 'Dean' },
      { name: 'Head, Psychology', email: 'psych_head@su.edu.ph', badge: 'Head' },
      { name: 'Dean, Agriculture', email: 'agri_dean@su.edu.ph', badge: 'Dean' },
    ]
  },
  {
    categoryName: '3. Non-School Emails (Personal)',
    description: 'External test accounts (for testing domain restriction / 403 errors)',
    users: [
      { name: 'Juan Dela Cruz', email: 'juan.delacruz98@gmail.com', badge: 'External Gmail' },
      { name: 'Maria Clara Reyes', email: 'maria.clara.reyes@yahoo.com', badge: 'External Yahoo' },
      { name: 'Mark Dimalanta', email: 'mark.dimalanta@outlook.ph', badge: 'External Outlook' },
    ]
  }
]

function loginAs(email: string) {
  mockUserCookie.value = email
  refreshNuxtData()
}

function logout() {
  mockUserCookie.value = null
  refreshNuxtData()
}
</script>

<template>
  <div class="max-w-xl mx-auto my-8 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
    <!-- State 1: Active Mock Session -->
    <div v-if="mockUserCookie" class="space-y-4 text-center">
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 font-bold text-lg">
        ✓
      </div>
      
      <div>
        <span class="inline-block px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full mb-2">
          Prototype SSO Active
        </span>
        <h3 class="text-lg font-bold text-gray-900">Signed In</h3>
        <p class="text-sm font-mono text-gray-700 mt-1 bg-gray-50 py-1.5 px-3 rounded border border-gray-200 inline-block">
          {{ mockUserCookie }}
        </p>
      </div>

      <p class="text-xs text-gray-500">
        API requests are currently sending this email to <code>/api/sheets/getUserEntries</code>.
      </p>

      <button
        @click="logout"
        class="w-full py-2 px-4 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
      >
        Switch / Disconnect Mock Account
      </button>

      <NuxtLink to="/dashboard">
        <button
          class="w-full py-2 px-4 text-sm font-medium text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
        >
          Go to dashboard.
        </button>
      </NuxtLink>

      
    </div>

    <!-- State 2: Category Selector -->
    <div v-else class="space-y-6">
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 mb-2">
          🔑
        </div>
        <h2 class="text-xl font-bold text-gray-900">Simulated SSO Login</h2>
        <p class="text-xs text-gray-500 mt-1">
          Select a test account category to simulate login and evaluate permissions filtering.
        </p>
      </div>

      <!-- Render Categories -->
      <div v-for="category in userCategories" :key="category.categoryName" class="space-y-2">
        <div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-gray-500">
            {{ category.categoryName }}
          </h3>
          <p class="text-[11px] text-gray-400 mb-1.5">{{ category.description }}</p>
        </div>

        <div class="space-y-1.5">
          <button
            v-for="user in category.users"
            :key="user.email"
            @click="loginAs(user.email)"
            class="w-full flex items-center justify-between p-2.5 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left group"
          >
            <div>
              <p class="text-xs font-bold text-gray-900 group-hover:text-blue-700">
                {{ user.name }}
              </p>
              <p class="text-[11px] text-gray-500 font-mono">{{ user.email }}</p>
            </div>

            <span class="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded group-hover:bg-blue-100 group-hover:text-blue-700 font-medium">
              {{ user.badge }}
            </span>
          </button>
        </div>
      </div>

      <div class="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
        💡 <strong>Tip for tomorrow's demo:</strong> Selecting a Non-School email can be used to demonstrate how your domain-lock guardrail blocks unauthorized non-institutional accounts!
      </div>
    </div>
  </div>
</template>