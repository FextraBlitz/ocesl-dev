<template>
  <div class="space-y-6 lg:mx-64">
    <UPageHeader
      description="Check and create your report documents here."
      :ui="{
        wrapper: 'flex flex-col items-center justify-center text-center gap-4 lg:justify-center',
        title: 'text-center text-2xl lg:text-4xl',
        description: 'text-center'
      }"
    >
      <template #title>
        Welcome <span class="text-primary">{{ userData?.name }}!</span>
      </template>
    </UPageHeader>

    <div v-for="(typeValue, typeKey) in ReportType" :key="typeKey" class="flex flex-col gap-2 w-full mt-4 last:pb-8">
      <!-- Section Header -->
      <div class="flex justify-between items-center px-1">
        <h2 class="text-xl lg:text-2xl font-bold">{{ typeValue }}</h2>
      </div>

      <UCard
        class="w-full"
        :ui="{
          header: 'p-1 px-2 lg:p-2 lg:px-4',
          body: 'flex flex-row w-full overflow-x-auto min-w-0 h-[35vh]'
        }"
      >
        <template #header>
          <div class="flex justify-between items-center">
            <!-- Updated Entries & Pending Counter -->
            <div class="text-lg">
              {{ getEntriesCount(typeValue) }} Reports
              <template v-if="getPendingCount(typeValue) > 0">
                <span class="text-neutral-400 font-medium"> • {{ getPendingCount(typeValue) }} Pending</span>
              </template>
            </div>
            <!-- Dynamic Add Button carrying Category context -->
            <UButton 
              color="primary" 
              :label="`+ Add ${typeValue}`" 
              @click="edit(typeValue, undefined)"
            />
          </div>
        </template>

        <!-- Category Row Grid -->
        <UCard
          v-for="entry in reportData?.[ReportTypeEntriesMapping[typeValue]] ?? []"
          :key="entry.reference"
          style="background-image: url('/placeholder-bg.avif');"
          class="mx-1 bg-cover bg-center bg-no-repeat bg-clip-content min-w-1/3 h-full box-border"
          :ui="{
            header: 'bg-elevated/75 backdrop-blur-sm sm:px-4 p-2'
          }"
          @click="view(typeValue, entry)"
        >
          <template #header>
            <div class="flex justify-between items-center gap-2">
              <div class="text-lg font-semibold truncate">{{ entry.event_name }}</div>
              
              <div class="flex items-center gap-2">
                <!-- Completed Status Badge -->
                <UBadge 
                  v-if="entry.status?.toLowerCase() === 'completed'" 
                  color="success" 
                  variant="subtle"
                  size="sm"
                >
                  Completed
                </UBadge>

                <!-- Dynamic Edit Button (Disabled if Completed) -->
                <UButton 
                  variant="outline" 
                  color="primary" 
                  :disabled="entry.status?.toLowerCase() === 'completed'"
                  :label="entry.status?.toLowerCase() === 'completed' ? 'Locked' : 'Edit'" 
                  @click.stop="edit(typeValue, entry)"
                />
              </div>
            </div>
          </template>
        </UCard>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ReportEditor } from '#components'
  import ReportViewer from '~/components/ReportViewer.vue'
  import { useUnitReports } from '~/composables/useUnitReports'
  import { useUnitsInfo } from '~/composables/useUnitsInfo'
  import type { Database } from '#shared/types/database.types'

  type Unit = Database['public']['Tables']['UNIT']

  const user = await useUserData()
  const userData = user.user_data

  const userUnits = await useUnitsInfo()
  const unitsInfo = userUnits.unit_info ?? [] as Unit[]

  const loadUnitEntries = async (unit_id: number) => {
    const unitReports = await useUnitReports(unit_id)
    const reports = unitReports.unit_reports.value ?? [] as Report[]

    return reports
  }


  const toast = useToast()
  const overlay = useOverlay()

  const edit_modal = overlay.create(ReportEditor)
  const view_modal = overlay.create(ReportViewer)
  
  const destTypeMap: Record<ReportType, 'community_extension' | 'community_outreach' | 'service_learning'> = {
    [ReportType.Extension]: 'community_extension',
    [ReportType.Outreach]: 'community_outreach',
    [ReportType.Service]: 'service_learning'
  }

  // Count helper functions
  function getEntriesCount(typeValue: ReportType): number {
    return reportData[ReportTypeEntriesMapping[typeValue]]?.length ?? 0
  }

  function getPendingCount(typeValue: ReportType): number {
    const entries = reportData[ReportTypeEntriesMapping[typeValue]] ?? []
    return entries.filter(e => e.status?.toLowerCase() !== 'completed').length
  }

  async function edit(category: ReportType, entry?: UserEntry) {
    if (entry?.status?.toLowerCase() === 'completed') return

    const instance = edit_modal.open({
      categoryLabel: category,
      destType: destTypeMap[category],
      data: {
        event_name: entry?.event_name ?? "",
        date: entry?.date ?? "2026-08-05",
        location: entry?.location ?? "",
        members: entry?.members ?? 1,
        description: entry?.description ?? "",
        outcomes: entry?.outcomes ?? "",
        remarks: entry?.remarks ?? "",
      },
      drive: entry?.drive ?? "",
      status: entry?.status ?? "Pending",
      comment: entry?.comment ?? "",
      reference: entry?.reference ?? "" 
    })

    const isSuccess = await instance.result

    if (isSuccess) {
      count.value++
      toast.add({
        title: 'Success',
        description: entry?.reference ? 'Report updated successfully.' : 'Report added successfully.',
        color: 'success',
      })
      refreshNuxtData()
    }
  }

  async function view(category: ReportType, entry?: UserEntry) {
    view_modal.open({
      categoryLabel: category,
      destType: destTypeMap[category],
      data: {
        event_name: entry?.event_name ?? "",
        date: entry?.date ?? "2026-08-05",
        location: entry?.location ?? "",
        members: entry?.members ?? 1,
        description: entry?.description ?? "",
        outcomes: entry?.outcomes ?? "",
        remarks: entry?.remarks ?? "",
      },
      drive: entry?.drive ?? "",
      status: entry?.status ?? "Pending",
      comment: entry?.comment ?? "",
      reference: entry?.reference ?? "" 
    })
  }

  
</script>