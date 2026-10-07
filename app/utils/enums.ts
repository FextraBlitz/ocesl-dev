import { record } from "valibot"

export const ReportTypeName = {
  Extension: "Community Extension",
  Outreach: "Community Outreach",
  Service: "Service Learning"
} as const

export const ReportType = {
  Extension: "CE",
  Outreach: "CO",
  Service: "SL"
} as const

export const ReportCodeType = Object.fromEntries(
  Object.entries(ReportType).map(([key, value]) => [value, key])
) as {
  [K in keyof typeof ReportType as typeof ReportType[K]]: K;
};

export type ReportTypes = typeof ReportType[keyof typeof ReportType]

export const isReportType = (value: string): value is ReportTypes => {
  return Object.values(ReportType).includes(value as any);
}

// export const ReportTypeEntriesMapping: Record<typeof ReportType[keyof typeof ReportType], keyof QueriedUserEntries> = {
//   "CE": "ce_entries" as keyof QueriedUserEntries,
//   "CO": 'co_entries' as keyof QueriedUserEntries,
//   "SL": 'sl_entries' as keyof QueriedUserEntries,
// }
