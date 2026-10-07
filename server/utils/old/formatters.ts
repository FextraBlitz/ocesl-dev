import { QueriedUserDirectory, QueriedUserEntries, UserEntry } from "./schemas"
import { sheets_v4 } from 'googleapis'

export const formatDirectoryQuery = (fetchedDirectory: sheets_v4.Schema$ValueRange[]): QueriedUserDirectory => {
  return {
    users: fetchedDirectory[0]?.values?.flat() as Array<string>,
    emails: fetchedDirectory[1]?.values?.flat() as Array<string>,
    dean_names: fetchedDirectory[2]?.values?.flat() as Array<string>,
    dean_emails: fetchedDirectory[3]?.values?.flat() as Array<string>,
    ce_ranges: fetchedDirectory[4]?.values?.flat() as Array<string>,
    co_ranges: fetchedDirectory[5]?.values?.flat() as Array<string>,
    sl_ranges: fetchedDirectory[6]?.values?.flat() as Array<string>,
  }
}

export const formatEntriesQuery = (
  fetchedEntries: sheets_v4.Schema$ValueRange[], 
  ce_len: number, 
  co_len: number, 
  sl_len: number, 
  references: Array<string>, 
  user_name: string
): QueriedUserEntries => {
  const entries = fetchedEntries.map((e, i): UserEntry => { 
    return {
      event_name: e.values![0]![2] ?? '',
      date: e.values![0]![3] ?? '',
      location: e.values![0]![4] ?? '',
      members: parseInt(e.values![0]![5]) ?? 0,
      description: e.values![0]![6] ?? '',
      outcomes: e.values![0]![7] ?? '',
      remarks: e.values![0]![8] ?? '',
      drive: e.values![0]![9] ?? '',
      status: e.values![0]![10] ?? '',
      comment: e.values![0]![11] ?? '',
      reference: references[i]!,
      dean_accepted: e.values![0]![12] === 'TRUE', // Column M
    }
  })

  return {
    name: user_name,
    ce_entries: entries.slice(0, ce_len),
    co_entries: entries.slice(ce_len, ce_len + co_len),
    sl_entries: entries.slice(ce_len + co_len, ce_len + co_len + sl_len),
  }
}

export const formatEntryToRow = (permRow: number, entry: UserEntry): (string | number | boolean)[] => {
  const emailFormula = `=permissions!B${permRow}`
  const nameFormula = `=permissions!A${permRow}`

  return [
    emailFormula,
    nameFormula,
    entry.event_name ?? '',
    entry.date ?? '',
    entry.location ?? '',
    entry.members ?? 0,
    entry.description ?? '',
    entry.outcomes ?? '',
    entry.remarks ?? '',
    entry.drive ?? '',
    entry.status ?? 'Pending',
    entry.comment ?? '',
    entry.dean_accepted ?? false
  ]
}