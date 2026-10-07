// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxt/content',
    '@nuxtjs/supabase'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],
  
  colorMode: {
    preference: 'light'
  },

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2026-06-30',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  runtimeConfig: {
    googleSheetsSpreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    googleSheetsClientEmail: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    googleSheetsPrivateKey: process.env.GOOGLE_SHEETS_PRIVATE_KEY,
    googleDriveRootFolderId: process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleRefreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },

  supabase: {
    redirect: false, 
    redirectOptions: {
      login: '/login',         // Route to redirect unauthenticated users
      callback: '/confirm',    // Route handling the auth callback/session
      include: undefined,      // Specific routes to include (e.g., ['/admin(/*)?'])
      exclude: ['/', '/about'],// Public routes exempt from checks
      saveRedirectToCookie: false,
    }
  }
})