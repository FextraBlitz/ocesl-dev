<template>
  <UCard
    class="group relative flex h-full aspect-square shrink-0 min-w-64 sm:min-w-72 max-w-80 flex-col overflow-hidden ring-default transition-shadow hover:shadow-md cursor-pointer"
    :ui="{ header: 'bg-elevated p-2', body: 'flex-1 p-0 sm:p-0', footer: 'px-3 py-2' }"
    @click="$emit('view')"
  >
    <template #header>
      <div class="relative w-full overflow-hidden">
        
        <div>
          <div class="text-lg font-bold leading-tight truncate">{{ entry.name }}</div>
          <p v-if="entry.description" class="text-xs text-muted line-clamp-3">{{ entry.description }}</p>
          <p v-else class="text-xs italic text-muted">No description provided.</p>
        </div>
      </div>
    </template>

    <div class="relative flex h-full flex-col overflow-hidden justify-center items-center">
      <img
        v-if="entry.thumbnail_url"
        :src="entry.thumbnail_url"
        :alt="entry.name"
        class="object-cover object-center h-full w-full absolute inset-0 transition-transform duration-200 group-hover:scale-[1.03]"
        loading="lazy"
      />
      <div
        v-else
        class="flex h-full w-full items-center justify-center"
      >
        <UIcon :name="reportTypeIcon" class="size-9 text-primary/40" />
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between text-xs text-muted">
        <span>{{ entry.date ? new Date(entry.date).toLocaleDateString() : 'No date' }}</span>
        <div class="flex items-center">
          <UBadge v-if="entry.dean_accepted" color="success" variant="solid" size="sm">
            Completed
          </UBadge>
          <UBadge v-else-if="entry.locked" color="neutral" variant="solid" size="sm">
            Locked
          </UBadge>
          <UButton
            variant="ghost"
            color="primary"
            size="xs"
            :disabled="canEdit && !entry.locked && entry.dean_accepted"
            :label="canEdit && entry.locked ? 'View' : editLabel"
            @click.stop="opensViewer ? $emit('view') : $emit('edit')"
          />
        </div>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import type { Entry } from '~/utils/schemas'
import { ReportType, type ReportTypes } from '~/utils/enums'

const props = withDefaults(
  defineProps<{
    entry: Entry
    reportType: ReportTypes
    editLabel?: string
    /**
     * False for Deans and OCESL admins: they only review, so the button opens
     * the viewer (where the accept / lock controls are) instead of the editor.
     */
    canEdit?: boolean
  }>(),
  { editLabel: 'Edit', canEdit: true }
)

// Locked reports can't be edited by anyone, so for them (and for reviewers)
// the button opens the viewer.
const opensViewer = computed(() => !props.canEdit || props.entry.locked)

defineEmits<{ edit: [], view: [] }>()

// Cosmetic per-category icon shown when a report has no thumbnail yet.
// Adjust freely to whatever best represents CE / CO / SL in your app.
const reportTypeIcons: Record<ReportTypes, string> = {
  [ReportType.Extension]: 'i-lucide-graduation-cap',
  [ReportType.Outreach]: 'i-lucide-heart-handshake',
  [ReportType.Service]: 'i-lucide-briefcase',
}

const reportTypeIcon = computed(() => reportTypeIcons[props.reportType] ?? 'i-lucide-file-text')
</script>
