import type { Database } from '#shared/types/database.types'

export type ManagementPosition = 'DEAN' | 'STAFF'

export const useManagement = () => {
  const client = useSupabaseClient<Database>()

  const { data: assignments, pending, error, refresh } = useAsyncData(
    'all-management-assignments',
    async () => {
      const { data, error } = await client
        .from('MANAGEMENT')
        .select('staff_id, unit_id, position')

      if (error) throw new Error(error.message)
      return data
    }
  )

  // Creates the assignment if it doesn't exist, or updates the position if it does.
  // MANAGEMENT's primary key is (staff_id, unit_id), so upsert on that pair is safe.
  async function assignStaffToUnit(staff_id: number, unit_id: number, position: ManagementPosition) {
    const { data, error } = await client
      .from('MANAGEMENT')
      .upsert({ staff_id, unit_id, position }, { onConflict: 'staff_id,unit_id' })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  async function removeStaffFromUnit(staff_id: number, unit_id: number) {
    const { error } = await client
      .from('MANAGEMENT')
      .delete()
      .eq('staff_id', staff_id)
      .eq('unit_id', unit_id)

    if (error) throw new Error(error.message)
  }

  return { assignments, pending, error, refresh, assignStaffToUnit, removeStaffFromUnit }
}
