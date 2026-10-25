<template>
  <div class="flex flex-col lg:grid lg:grid-cols-10 h-full min-h-0 bg-neutral-50 dark:bg-neutral-900">
    <!-- Clean, Modern Sidebar -->
    <!-- Below md: visibility is fully driven by the toggle (hidden until opened).
         At md and up: always visible, same as before — the toggle only affects mobile. -->
    <div :class="openSidebar ? 'block' : 'hidden md:block'" class="lg:col-span-2">
    <USidebar
      v-model:open="openSidebar"
      variant="inset"
      collapsible="icon"
      side="left"
      close
      style="--sidebar-width: unset"
      class="h-full border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
      :ui="{
        container: 'sticky h-full flex flex-col justify-between p-4'
      }"
    >
      <template #header>
        <div class="flex flex-col gap-1 px-2 py-1 border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <span class="text-xs uppercase font-semibold text-neutral-400 tracking-wider">Current Unit</span>
          <span class="text-sm font-bold text-primary-400 dark:text-neutral-200 truncate flex items-center gap-2">
            <UIcon v-if="unitsPending && !unitsInfo?.length" name="i-lucide-loader-2" class="size-3.5 animate-spin shrink-0" />
            {{ userUnits.unit_info.value?.[currentTabId]?.name ?? (unitsPending ? 'Loading units...' : 'No units assigned') }}
          </span>
        </div>
      </template>

      <!-- Unit Selector Tabs -->
      <div class="flex-1 py-2 overflow-y-auto">
        <div v-if="unitsPending && !unitsInfo?.length" class="flex flex-col gap-2 px-2">
          <USkeleton v-for="n in 3" :key="n" class="h-8 w-full" />
        </div>
        <UTabs
          v-else
          v-model="currentTabId"
          orientation="vertical"
          variant="link"
          :items="unitsTabs"
          class="w-full"
          @update:model-value="closeSidebarOnMobile"
        />
      </div>
    </USidebar>
    </div>

    <!-- Main Content Area -->
    <div class="flex flex-col lg:col-span-8 h-full min-h-0 overflow-y-auto p-4 lg:p-6 gap-6">
      <!-- Mobile sidebar toggle: only relevant below md, since the sidebar
           is always visible at md+ regardless of this button. -->
      <div class="flex items-center gap-2 md:hidden">
        <UButton
          :icon="openSidebar ? 'i-lucide-x' : 'i-lucide-menu'"
          color="neutral"
          variant="outline"
          size="sm"
          @click="openSidebar = !openSidebar"
        />
        <span class="text-sm font-medium text-neutral-500 dark:text-neutral-400 truncate">
          {{ userUnits.unit_info.value?.[currentTabId]?.name ?? 'Select a unit' }}
        </span>
      </div>

      <div
        v-for="(typeValue, typeKey) in ReportType"
        :key="typeKey"
        class="flex flex-col shrink-0 gap-3 w-full"
      >
        <!-- Section Header -->
        <div class="flex justify-between items-center px-1">
          <h2 class="text-xl lg:text-2xl font-bold text-neutral-800 dark:text-neutral-100">
            {{ ReportTypeName[typeKey] }}
          </h2>
        </div>

        <!-- Section Container Card -->
        <UCard
          class="w-full shadow-sm"
          :ui="{
            header: 'p-3 px-4 bg-neutral-50/50 dark:bg-neutral-800/50 border-b border-neutral-200/60 dark:border-neutral-700/60',
            body: 'p-4 flex flex-row w-full overflow-x-auto min-w-0 h-[36vh] gap-3'
          }"
        >
          <template #header>
            <div class="flex justify-between items-center">
              <div class="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                <template v-if="reportsPending && !currentUnitEntries?.[typeValue]?.length">
                  <USkeleton class="h-4 w-24" />
                </template>
                <template v-else>
                  <span>{{ currentReportTypeCounts[typeValue] }} Report{{ currentReportTypeCounts[typeValue] !== 1 ? 's' : '' }}</span>
                  <span v-if="currentReportTypePendingCounts[typeValue] > 0" class="text-amber-500 font-semibold ml-2">
                    • {{ currentReportTypePendingCounts[typeValue] }} Pending
                  </span>
                </template>
              </div>

              <UButton
                color="primary"
                size="sm"
                icon="i-lucide-plus"
                :label="`Add ${ReportTypeName[typeKey]}`"
                :disabled="!currentUnitId"
                @click="edit(typeValue, undefined)"
              />
            </div>
          </template>

          <!-- Loading skeleton: only while we have nothing yet, so a background
               refresh doesn't blow the cards away and replace them with skeletons -->
          <template v-if="reportsPending && !currentUnitEntries?.[typeValue]?.length">
            <div
              v-for="n in 3"
              :key="n"
              class="flex h-full shrink-0 min-w-64 sm:min-w-72 max-w-80 flex-col overflow-hidden rounded-lg border border-default"
            >
              <USkeleton class="w-full aspect-video rounded-none" />
              <div class="flex flex-1 flex-col gap-2 p-3">
                <USkeleton class="h-4 w-3/4" />
                <USkeleton class="h-3 w-full" />
                <USkeleton class="h-3 w-2/3" />
              </div>
            </div>
          </template>

          <!-- Empty State -->
          <div
            v-else-if="!(currentUnitEntries?.[typeValue]?.length)"
            class="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-400 gap-2"
          >
            <UIcon name="i-lucide-file-text" class="w-8 h-8 text-neutral-300" />
            <span class="text-sm">No reports submitted for {{ ReportTypeName[typeKey] }} yet.</span>
          </div>

          <!-- Report Cards -->
          <ReportCard
            v-else
            v-for="entry in currentUnitEntries?.[typeValue] ?? []"
            :key="entry.id"
            :entry="entry"
            :report-type="typeValue"
            edit-label="Review"
            :can-edit="!isDean"
            @edit="edit(typeValue, entry)"
            @view="view(typeValue, entry)"
          />
        </UCard>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ReportEditor } from '#components'
  import ReportViewer from '~/components/ReportViewer.vue'
  import { useUnitReports } from '~/composables/useUnitReports'
  import { useUnitsInfo } from '~/composables/useUnitsInfo'
  import type { Database } from '#shared/types/database.types'
  import { formatUnitReports } from '~/utils/formatUnitReports'
  import type { Entry, UnitEntries } from '~/utils/schemas'
  import { ReportTypeName, ReportType, type ReportTypes } from '~/utils/enums'
  import type { TabsItem } from '@nuxt/ui'

  type Unit = Database['public']['Tables']['UNIT']

  const user = useUserData()
  const userData = user.user_data

  const userUnits = useUnitsInfo()
  const unitsInfo = userUnits.unit_info ?? [] as Unit[]
  const unitsPending = userUnits.pending

  const userManagements = useUserManagements()
  const unitPositions = computed(() => {
    if (!userManagements.unit_pos.value) return [] as Database['public']['Tables']['MANAGEMENT']['Row'][]
    return userManagements.unit_pos.value
  })
  const isDean = computed(() => unitPositions.value.find(u => u.unit_id === currentUnitId.value)?.position === 'DEAN')

  const unitsTabs = computed<TabsItem[]>(() => {
    if (!unitsInfo.value) return [] as TabsItem[]
    return unitsInfo.value.map((e) => ({
      label: e.name,
      icon: 'i-lucide-house'
    }))
  })

  const currentTabId = ref<number>(0)
  const currentUnitId = computed<number>(() => userUnits.unit_info.value?.[currentTabId.value]?.id ?? 0)

  const { unit_reports, pending: reportsPending, refresh: refresh_reports } = useUnitReports(currentUnitId)
  const currentUnitEntries = computed(() => {
    const reports = unit_reports.value as Entry[]
    return formatUnitReports(reports ?? [])
  })

  // Another user (or you, in another tab) can change report/unit data at any
  // time — re-fetch whenever this tab regains focus so it doesn't sit stale.
  useRefreshOnFocus([refresh_reports, userUnits.refresh, userManagements.refresh])

  const openSidebar = ref(true)

  // The sidebar is a slide-over drawer below md and a permanent column from md up.
  // Picking a unit should only close it in the drawer case; on desktop,
  // setting `open` to false would collapse the column to its icon rail.
  function closeSidebarOnMobile() {
    if (window.matchMedia('(max-width: 767px)').matches) openSidebar.value = false
  }
  const toast = useToast()
  const overlay = useOverlay()

  const edit_modal = overlay.create(ReportEditor)
  const view_modal = overlay.create(ReportViewer)

  const currentReportTypeCounts = computed(() => {
    const counts: Record<ReportTypes, number> = {
      [ReportType.Extension]: currentUnitEntries.value?.[ReportType.Extension]?.length ?? 0,
      [ReportType.Outreach]: currentUnitEntries.value?.[ReportType.Outreach]?.length ?? 0,
      [ReportType.Service]: currentUnitEntries.value?.[ReportType.Service]?.length ?? 0,
    }

    return counts
  })

  const currentReportTypePendingCounts = computed(() => {
    // A report is "pending" until the Dean accepts it.
    const counts: Record<ReportTypes, number> = {
      [ReportType.Extension]: currentUnitEntries.value?.[ReportType.Extension]?.filter((e) => !e.dean_accepted).length ?? 0,
      [ReportType.Outreach]: currentUnitEntries.value?.[ReportType.Outreach]?.filter((e) => !e.dean_accepted).length ?? 0,
      [ReportType.Service]: currentUnitEntries.value?.[ReportType.Service]?.filter((e) => !e.dean_accepted).length ?? 0,
    }

    return counts
  })

  async function edit(report_type: ReportTypes, entry?: Entry) {
    if (entry?.locked) return
    if (!currentUnitId.value) return

    const instance = edit_modal.open({
      report_type: report_type,
      unit_id: currentUnitId.value,
      entry: entry,
      is_dean: isDean.value,
    })

    const isSuccess = await instance.result

    if (isSuccess) {
      toast.add({
        title: 'Success',
        description: entry ? 'Report updated successfully.' : 'Report added successfully.',
        color: 'success',
      })

      refresh_reports()
    }
  }

  function view(report_type: keyof typeof ReportCodeType, entry: Entry) {
    view_modal.open({
      report_type: report_type,
      unit_name: userUnits.unit_info.value?.[currentTabId.value]?.name ?? '',
      entry: entry,
      is_dean: isDean.value,                // shows the Dean Review control
      onChanged: () => refresh_reports(),   // refetch as soon as a checkbox saves
    })
  }
</script>
