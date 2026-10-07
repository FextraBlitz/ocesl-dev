<template>
  <div class="flex flex-col h-full min-h-0 gap-6 p-4 lg:p-6 overflow-y-auto">
    <div class="flex flex-col gap-1">
      <h1 class="text-2xl font-bold tracking-tight">Manage users & units</h1>
      <p class="text-sm text-muted">Invite staff, grant OCESL admin access, and assign people to units.</p>
    </div>

    <UTabs v-model="activeTab" :items="pageTabs" class="lg:w-1/2 lg:self-center" :ui="{'label': 'lg:text-lg', 'list': 'p-0'}" />

    <!-- STAFF -->
    <div v-if="activeTab === 'staff'" class="flex flex-col gap-4">
      <div class="flex justify-end">
        <UButton icon="i-lucide-user-plus" label="Invite staff" color="primary" @click="inviteModalOpen = true" />
      </div>

      <div v-if="staffPending && !staffRows.length" class="flex flex-col items-center justify-center gap-2 py-16 text-muted">
        <UIcon name="i-lucide-loader-2" class="size-6 animate-spin" />
        <span class="text-sm">Loading staff…</span>
      </div>

      <UCard v-else :ui="{ body: 'p-0 sm:p-0' }">
        <UTable :data="staffRows" :columns="staffColumns" :loading="staffPending">
          <template #authority-cell="{ row }">
            <div class="flex items-center gap-2">
              <USwitch
                :model-value="row.original.authority === 'OCESL'"
                @update:model-value="(val: boolean) => toggleAdmin(row.original, val)"
              />
              <span class="text-xs text-muted">{{ row.original.authority === 'OCESL' ? 'Admin' : 'Regular' }}</span>
            </div>
          </template>

          <template #units-cell="{ row }">
            <div class="flex flex-wrap gap-1">
              <UBadge
                v-for="a in assignmentsFor(row.original.id)"
                :key="a.unit_id"
                color="neutral"
                variant="subtle"
                size="sm"
              >
                {{ unitName(a.unit_id) }} · {{ a.position ?? '—' }}
              </UBadge>
              <span v-if="!assignmentsFor(row.original.id).length" class="text-xs italic text-muted">
                No units assigned
              </span>
            </div>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex justify-end gap-1">
              <UButton size="xs" variant="soft" label="Assign units" @click="openAssign(row.original)" />
              <UButton
                size="xs"
                variant="ghost"
                color="error"
                icon="i-lucide-trash-2"
                @click="confirmDeleteStaff(row.original)"
              />
            </div>
          </template>
        </UTable>
      </UCard>
    </div>

    <!-- UNITS -->
    <div v-else class="flex flex-col gap-4">
      <div class="flex justify-end">
        <UButton icon="i-lucide-plus" label="Add unit" color="primary" @click="openCreateUnit" />
      </div>

      <div v-if="unitsPending && !unitsList?.length" class="flex flex-col items-center justify-center gap-2 py-16 text-muted">
        <UIcon name="i-lucide-loader-2" class="size-6 animate-spin" />
        <span class="text-sm">Loading units…</span>
      </div>

      <UCard v-else :ui="{ body: 'p-0 sm:p-0' }">
        <UTable :data="unitsList ?? []" :columns="unitColumns" :loading="unitsPending">
          <template #actions-cell="{ row }">
            <div class="flex justify-end gap-1">
              <UButton size="xs" variant="ghost" icon="i-lucide-pencil" @click="openEditUnit(row.original)" />
              <UButton
                size="xs"
                variant="ghost"
                color="error"
                icon="i-lucide-trash-2"
                @click="confirmDeleteUnit(row.original)"
              />
            </div>
          </template>
        </UTable>
      </UCard>
    </div>

    <!-- INVITE STAFF MODAL -->
    <UModal v-model:open="inviteModalOpen" title="Invite staff">
      <template #body>
        <form class="flex flex-col gap-4" @submit.prevent="submitInvite">
          <UFormField label="Full name" required>
            <UInput v-model="inviteForm.name" placeholder="Jane Dela Cruz" class="w-full" />
          </UFormField>
          <UFormField label="Email" required>
            <UInput v-model="inviteForm.email" type="email" placeholder="jane@example.edu" class="w-full" />
          </UFormField>
          <p class="text-xs text-muted">
            They'll get an email invite to set a password. You can assign them to a unit afterward.
          </p>
          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="ghost" label="Cancel" @click="inviteModalOpen = false" />
            <UButton type="submit" color="primary" label="Send invite" :loading="invitePending" />
          </div>
        </form>
      </template>
    </UModal>

    <!-- ADD / EDIT UNIT MODAL -->
    <UModal v-model:open="unitModalOpen" :title="editingUnit ? 'Edit unit' : 'Add unit'">
      <template #body>
        <form class="flex flex-col gap-4" @submit.prevent="submitUnit">
          <UFormField label="Unit name" required>
            <UInput v-model="unitForm.name" placeholder="College of Engineering" class="w-full" />
          </UFormField>
          <UFormField label="Unit email" required>
            <UInput v-model="unitForm.email" type="email" placeholder="engineering@example.edu" class="w-full" />
          </UFormField>
          <UFormField label="Code">
            <UInput v-model="unitForm.code" placeholder="COE" class="w-full" />
          </UFormField>
          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="ghost" label="Cancel" @click="unitModalOpen = false" />
            <UButton
              type="submit"
              color="primary"
              :label="editingUnit ? 'Save changes' : 'Create unit'"
              :loading="createUnitPending || updateUnitPending"
            />
          </div>
        </form>
      </template>
    </UModal>

    <!-- ASSIGN UNITS SLIDEOVER -->
    <USlideover v-model:open="assignOpen" :title="`Units — ${assignTarget?.name ?? ''}`">
      <template #body>
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-3">
            <p v-if="assignedUnitsForTarget.length" class="text-xs text-muted">Current assignments</p>
            <p v-else class="text-xs italic text-muted">No units assigned yet.</p>

            <div
              v-for="unit in assignedUnitsForTarget"
              :key="unit.id"
              class="flex items-center justify-between gap-3 rounded-lg border border-default p-3"
            >
              <div class="flex flex-col min-w-0">
                <span class="text-sm font-medium truncate">{{ unit.name }}</span>
                <span class="text-xs text-muted truncate">{{ unit.code }}</span>
              </div>

              <div class="flex items-center gap-1 shrink-0">
                <USelect
                  :model-value="positionFor(assignTarget?.id, unit.id)"
                  :items="positionOptions"
                  class="w-32"
                  @update:model-value="(val: string) => updatePosition(assignTarget, unit, val)"
                />
                <UButton
                  size="xs"
                  variant="ghost"
                  color="error"
                  icon="i-lucide-x"
                  @click="updatePosition(assignTarget, unit, null)"
                />
              </div>
            </div>
          </div>

          <USeparator v-if="assignedUnitsForTarget.length" />

          <div v-if="!addingUnit" class="flex justify-center">
            <UButton
              variant="soft"
              icon="i-lucide-plus"
              label="Add unit"
              :disabled="!unassignedUnitOptions.length"
              @click="addingUnit = true"
            />
          </div>

          <div v-else class="flex flex-col gap-3 rounded-lg border border-dashed border-default p-3">
            <UFormField label="Unit">
              <USelect
                v-model="newAssignment.unitId"
                :items="unassignedUnitOptions"
                placeholder="Choose a unit"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Position">
              <USelect v-model="newAssignment.position" :items="positionOptions" class="w-full" />
            </UFormField>
            <div class="flex justify-end gap-2 pt-1">
              <UButton variant="ghost" label="Cancel" @click="cancelAddAssignment" />
              <UButton
                color="primary"
                label="Add"
                :disabled="!newAssignment.unitId"
                @click="submitAddAssignment"
              />
            </div>
          </div>
        </div>
      </template>
    </USlideover>

    <!-- CONFIRM DELETE MODAL -->
    <UModal v-model:open="confirmOpen" :title="confirmTarget?.title ?? 'Are you sure?'">
      <template #body>
        <div class="flex flex-col gap-4">
          <p class="text-sm text-muted">{{ confirmTarget?.description }}</p>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" label="Cancel" @click="confirmOpen = false" />
            <UButton color="error" label="Delete" :loading="confirmPending" @click="runConfirmedDelete" />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { Database } from '#shared/types/database.types'
import type { ManagementPosition } from '~/composables/useManagement'

type Staff = Database['public']['Tables']['STAFF']['Row']
type Unit = Database['public']['Tables']['UNIT']['Row']

// Reuses the same OCESL-authority gate as your other admin page.
definePageMeta({ middleware: 'auth-check' })

const toast = useToast()

const pageTabs = [
  { label: 'Staff', value: 'staff' },
  { label: 'Units', value: 'units' }
]
const activeTab = ref<'staff' | 'units'>('staff')

// --- data ---
const { staff, pending: staffPending, refresh: refreshStaff } = useAllStaff()
const { units: unitsList, pending: unitsPending, refresh: refreshUnits } = useUnitsList()
const { assignments, refresh: refreshAssignments, assignStaffToUnit, removeStaffFromUnit } = useManagement()

// Someone else (another admin) can change staff/unit/assignment data at any
// time. Without this, an already-open tab just looks stale until manually
// reloaded. This re-fetches whenever the tab regains focus/visibility.
useRefreshOnFocus([refreshStaff, refreshUnits, refreshAssignments])

const staffRows = computed(() => staff.value ?? [])

const staffColumns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'authority', header: 'OCESL admin', id: 'authority' },
  { accessorKey: 'units', header: 'Units', id: 'units' },
  { accessorKey: 'actions', header: '', id: 'actions' }
]

const unitColumns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'code', header: 'Code' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'actions', header: '', id: 'actions' }
]

function unitName(unit_id: number) {
  return unitsList.value?.find((u) => u.id === unit_id)?.name ?? `Unit ${unit_id}`
}

function assignmentsFor(staff_id: number) {
  return assignments.value?.filter((a) => a.staff_id === staff_id) ?? []
}

function positionFor(staff_id?: number, unit_id?: number) {
  if (!staff_id || !unit_id) return undefined
  return assignments.value?.find((a) => a.staff_id === staff_id && a.unit_id === unit_id)?.position ?? undefined
}

// --- OCESL admin toggle ---
const { setAuthority } = useUpdateStaffAuthority()

async function toggleAdmin(person: Staff, isAdmin: boolean) {
  try {
    await setAuthority(person.id, isAdmin ? 'OCESL' : '')
    await refreshStaff()
    toast.add({
      title: isAdmin ? `${person.name} is now an OCESL admin` : `${person.name} is no longer an OCESL admin`,
      color: 'success'
    })
  } catch {
    toast.add({ title: 'Could not update admin access', color: 'error' })
  }
}

// --- invite staff ---
const inviteModalOpen = ref(false)
const inviteForm = reactive({ name: '', email: '' })
const { inviteStaff, pending: invitePending } = useInviteStaff()

async function submitInvite() {
  if (!inviteForm.name || !inviteForm.email) return

  try {
    await inviteStaff(inviteForm.email, inviteForm.name)
    toast.add({
      title: 'Invite sent',
      description: `${inviteForm.email} will get an email to set up their account.`,
      color: 'success'
    })
    inviteModalOpen.value = false
    inviteForm.name = ''
    inviteForm.email = ''
    await refreshStaff()
  } catch (err) {
    toast.add({
      title: 'Could not send invite',
      description: err instanceof Error ? err.message : undefined,
      color: 'error'
    })
  }
}

// --- add / edit unit ---
const unitModalOpen = ref(false)
const editingUnit = ref<Unit | null>(null)
const unitForm = reactive({ name: '', email: '', code: '' })
const { createUnit, pending: createUnitPending } = useCreateUnit()
const { updateUnit, pending: updateUnitPending } = useUpdateUnit()

function openCreateUnit() {
  editingUnit.value = null
  unitForm.name = ''
  unitForm.email = ''
  unitForm.code = ''
  unitModalOpen.value = true
}

function openEditUnit(unit: Unit) {
  editingUnit.value = unit
  unitForm.name = unit.name
  unitForm.email = unit.email
  unitForm.code = unit.code ?? ''
  unitModalOpen.value = true
}

async function submitUnit() {
  if (!unitForm.name || !unitForm.email) return

  try {
    if (editingUnit.value) {
      await updateUnit(editingUnit.value.id, {
        name: unitForm.name,
        email: unitForm.email,
        code: unitForm.code || null
      })
      toast.add({ title: 'Unit updated', color: 'success' })
    } else {
      await createUnit({ name: unitForm.name, email: unitForm.email, code: unitForm.code || null })
      toast.add({ title: 'Unit created', color: 'success' })
    }

    unitModalOpen.value = false
    await refreshUnits()
  } catch (err) {
    toast.add({
      title: editingUnit.value ? 'Could not update unit' : 'Could not create unit',
      description: err instanceof Error ? err.message : undefined,
      color: 'error'
    })
  }
}

// --- assign units slideover ---
const assignOpen = ref(false)
const assignTarget = ref<Staff | null>(null)

const positionOptions = [
  { label: 'Staff', value: 'STAFF' },
  { label: 'Dean', value: 'DEAN' }
]

const assignedUnitsForTarget = computed(() => {
  const targetId = assignTarget.value?.id
  if (!targetId) return []
  const assignedIds = new Set(assignmentsFor(targetId).map((a) => a.unit_id))
  return (unitsList.value ?? []).filter((u) => assignedIds.has(u.id))
})

const unassignedUnitOptions = computed(() => {
  const targetId = assignTarget.value?.id
  const assignedIds = new Set(targetId ? assignmentsFor(targetId).map((a) => a.unit_id) : [])
  return (unitsList.value ?? [])
    .filter((u) => !assignedIds.has(u.id))
    .map((u) => ({ label: u.name, value: u.id }))
})

const addingUnit = ref(false)
const newAssignment = reactive<{ unitId: number | undefined; position: ManagementPosition }>({
  unitId: undefined,
  position: 'STAFF'
})

function cancelAddAssignment() {
  addingUnit.value = false
  newAssignment.unitId = undefined
  newAssignment.position = 'STAFF'
}

async function submitAddAssignment() {
  if (!assignTarget.value || !newAssignment.unitId) return

  try {
    await assignStaffToUnit(assignTarget.value.id, newAssignment.unitId, newAssignment.position)
    await refreshAssignments()
    cancelAddAssignment()
  } catch {
    toast.add({ title: 'Could not add assignment', color: 'error' })
  }
}

function openAssign(person: Staff) {
  assignTarget.value = person
  cancelAddAssignment()
  assignOpen.value = true
}

async function updatePosition(person: Staff | null, unit: Unit, value: string | null) {
  if (!person) return

  try {
    if (!value) {
      await removeStaffFromUnit(person.id, unit.id)
    } else {
      await assignStaffToUnit(person.id, unit.id, value as ManagementPosition)
    }
    await refreshAssignments()
  } catch {
    toast.add({ title: 'Could not update assignment', color: 'error' })
  }
}

// --- delete confirmation (shared by staff + units) ---
const confirmOpen = ref(false)
const confirmPending = ref(false)
const confirmTarget = ref<{ title: string; description: string; run: () => Promise<void> } | null>(null)

const { deleteStaff } = useDeleteStaff()
const { deleteUnit } = useDeleteUnit()

function confirmDeleteStaff(person: Staff) {
  confirmTarget.value = {
    title: `Delete ${person.name}?`,
    description: `This removes their profile and any unit assignments. It does not delete their login — they just won't be recognized as staff anymore.`,
    run: async () => {
      await deleteStaff(person.id)
      toast.add({ title: `${person.name} deleted`, color: 'success' })
      await Promise.all([refreshStaff(), refreshAssignments()])
    }
  }
  confirmOpen.value = true
}

function confirmDeleteUnit(unit: Unit) {
  confirmTarget.value = {
    title: `Delete ${unit.name}?`,
    description: `This unassigns any staff from this unit. If it still has reports attached, deletion may be blocked until those are moved or removed.`,
    run: async () => {
      await deleteUnit(unit.id)
      toast.add({ title: `${unit.name} deleted`, color: 'success' })
      await Promise.all([refreshUnits(), refreshAssignments()])
    }
  }
  confirmOpen.value = true
}

async function runConfirmedDelete() {
  if (!confirmTarget.value) return

  confirmPending.value = true
  try {
    await confirmTarget.value.run()
    confirmOpen.value = false
  } catch (err) {
    toast.add({
      title: 'Delete failed',
      description: err instanceof Error ? err.message : undefined,
      color: 'error'
    })
  } finally {
    confirmPending.value = false
  }
}
</script>
