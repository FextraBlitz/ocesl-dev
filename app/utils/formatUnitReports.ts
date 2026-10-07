import type { Database } from '#shared/types/database.types'
import { isReportType, ReportType } from './enums'
import type { Entry, UnitEntries } from './schemas'

export const formatUnitReports = (entry_list: Entry[]): UnitEntries => {

  const entry_map: UnitEntries = {} as UnitEntries

  for (const entry of entry_list) {
    if (!isReportType(entry.type)) {
      console.error(`Entry ${entry.id} has an invalid type: '${entry.id}'. (Skipping...)`)
      continue
    }

    if(!entry_map[entry.type]) {
      entry_map[entry.type] = []
    }

    entry_map[entry.type].push(entry)
  }

  return entry_map
}