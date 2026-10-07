import * as v from 'valibot'; 

export type Report = v.InferOutput<typeof ReportSchema>

// export type StrictInsert<
//   TableInsertType,
//   Exceptions extends keyof TableInsertType = never
// > = NonNullable<Omit<TableInsertType, Exceptions>> & Pick<TableInsertType, Exceptions>;

export type StrictInsert<T, K extends keyof T = never> = 
  // Make everything required and strip null/undefined
  { [P in Exclude<keyof T, K>]-?: NonNullable<T[P]> } & 
  // Keep the exception keys as they originally were
  { [P in K]: T[P] };

export const ReportSchema = v.object({
  name: v.pipe(v.string()),
  date: v.pipe(v.string(), v.nonEmpty('Date required'),v.isoTimestamp('Please enter a valid date (YYYY-MM-DD)')),
  location: v.pipe(v.string()),
  members: v.pipe(v.number(),v.minValue(1, 'Must be more than 1 members')),
  description: v.pipe(v.string()),
  objectives: v.pipe(v.string()),
  outcomes: v.pipe(v.string()),
  remarks: v.pipe(v.string()),
})

export interface Entry{
  name: string,
  date: string,
  location: string,
  members: number,
  description: string,
  outcomes: string,
  remarks: string,
  objectives: string,
  drive_link: string,
  locked: boolean, 
  comment: string,
  dean_accepted: boolean,
  unit_id: number,
  type: string,
  id: number,
  thumbnail_url: string
}

export interface UnitEntries{
  [ReportType.Extension]: Array<Entry>,
  [ReportType.Outreach]: Array<Entry>,
  [ReportType.Service]: Array<Entry>,
}