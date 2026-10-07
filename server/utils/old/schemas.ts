export interface QueriedUserDirectory {
  users: Array<string>
  emails: Array<string>
  dean_names: Array<string>
  dean_emails: Array<string>
  ce_ranges: Array<string>
  co_ranges: Array<string>
  sl_ranges: Array<string>
}

// export interface QueriedUserEntries {
//   name: string
//   ce_entries: Array<UserEntry>
//   co_entries: Array<UserEntry>
//   sl_entries: Array<UserEntry>
// }

// export interface UserEntry {
//   event_name: string
//   date: string
//   location: string
//   members: number
//   description: string
//   outcomes: string
//   remarks: string
//   drive: string
//   status: string 
//   comment: string
//   reference: string
//   dean_accepted?: boolean
// }