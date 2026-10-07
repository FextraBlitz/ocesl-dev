import { google, Auth } from 'googleapis'
import type { sheets_v4 } from 'googleapis'

type OAuth2ClientType = InstanceType<typeof google.auth.OAuth2>

let oauth2Client: OAuth2ClientType | null = null
let sheetsInstance: sheets_v4.Sheets | null = null

export function getOAuth2Client(): OAuth2ClientType {
  if (oauth2Client) return oauth2Client

  const config = useRuntimeConfig()

  oauth2Client = new google.auth.OAuth2(
    config.googleClientId,
    config.googleClientSecret
  )

  oauth2Client.setCredentials({
    refresh_token: config.googleRefreshToken,
  })

  return oauth2Client
}

export function useGoogleSheets(): sheets_v4.Sheets {
  if (sheetsInstance) return sheetsInstance

  const auth = getOAuth2Client()
  sheetsInstance = google.sheets({ version: 'v4', auth })

  return sheetsInstance
}


// export function useGoogleSheets() {
//   const config = useRuntimeConfig()

//   // Initialize the client only once (Singleton pattern)
//   if (!authClient) {
//   // Replace literal '\n' characters with actual newlines
//     const privateKey = config.googleSheetsPrivateKey.replace(/\\n/g, '\n')

//     authClient = new google.auth.JWT({
//       email: config.googleSheetsClientEmail,
//       key: privateKey, // Fixes line breaks in production envs
//       scopes: [
//         'https://www.googleapis.com/auth/spreadsheets',
//         'https://www.googleapis.com/auth/drive'
//       ], 
//     })
//   }

//   // Return the configured sheets instance
//   return google.sheets({ version: 'v4', auth: authClient })
// }
