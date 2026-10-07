import type { Database } from '#shared/types/database.types'

export type DBTables = Database['public']['Tables']
export type RowOf<T extends keyof DBTables> = DBTables[T]['Row']