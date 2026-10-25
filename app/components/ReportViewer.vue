<template>
  <UModal
    :close="{ onClick: () => emit('close') }"
    :title="`${ReportTypeName[ReportCodeType[props.report_type]] ?? 'Report'}`"
    :dismissible="false"
    class="max-w-3xl"
  >
    <template #body>
      <article class="flex flex-col gap-6">
        <!-- Cover thumbnail -->
        <div v-if="props.entry.thumbnail_url" class="w-full aspect-[21/9] overflow-hidden rounded-lg">
          <img
            :src="props.entry.thumbnail_url"
            :alt="props.entry.name"
            class="h-full w-full object-cover"
          />
        </div>

        <!-- Title & status -->
        <header class="flex flex-col items-center gap-3 text-center">
          <div class="flex items-center gap-2">
            <UBadge v-if="deanAccepted" color="success" variant="subtle">
              <UIcon name="i-lucide-check-circle-2" class="size-3.5 mr-1" />
              Accepted by Dean
            </UBadge>
            <UBadge v-else-if="locked" color="neutral" variant="subtle">
              <UIcon name="i-lucide-lock" class="size-3.5 mr-1" />
              Locked
            </UBadge>
            <UBadge v-else color="warning" variant="subtle">
              <UIcon name="i-lucide-clock" class="size-3.5 mr-1" />
              Pending review
            </UBadge>
          </div>

          <h1 class="text-3xl font-bold tracking-tight">{{ props.entry.name }}</h1>

          <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted">
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-building-2" class="size-4" />
              {{ props.unit_name ?? 'Unnamed unit' }}
            </span>
            <span aria-hidden="true">•</span>
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-users" class="size-4" />
              {{ props.entry.members ?? 0 }} participants
            </span>
            <span aria-hidden="true">•</span>
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-calendar" class="size-4" />
              {{ formattedDate }}
            </span>
          </div>

          <div v-if="props.entry.location" class="flex items-center gap-1 text-sm text-muted">
            <UIcon name="i-lucide-map-pin" class="size-4" />
            {{ props.entry.location }}
          </div>
        </header>

        <USeparator />

        <!-- Sections -->
        <section v-for="section in sections" :key="section.label" class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <UIcon :name="section.icon" class="size-4 text-muted" />
            <h2 class="text-sm font-semibold uppercase tracking-wide text-muted">{{ section.label }}</h2>
          </div>
          <p v-if="section.content" class="indent-8 text-justify text-base leading-relaxed text-pretty whitespace-pre-line">
            {{ section.content }}
          </p>
          <p v-else class="text-sm italic text-muted">No {{ section.label.toLowerCase() }} provided.</p>
        </section>

        <!-- Files -->
        <template v-if="existingFiles.length > 0 || folderDriveId">
          <USeparator />
          <section class="flex flex-col gap-3">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-paperclip" class="size-4 text-muted" />
              <h2 class="text-sm font-semibold uppercase tracking-wide text-muted">Attachments</h2>
            </div>

            <a
              v-if="folderDriveId"
              :href="driveFolderUrl"
              target="_blank"
              class="flex items-center gap-3 p-3 border border-default rounded-lg bg-elevated/30 hover:bg-elevated/60 transition-colors"
            >
              <UIcon name="i-lucide-folder-open" class="size-5 text-primary shrink-0" />
              <div class="flex flex-col min-w-0">
                <span class="text-sm font-medium text-primary">Open Drive folder</span>
                <span class="text-xs text-muted truncate">View all files for this report on Google Drive</span>
              </div>
              <UIcon name="i-lucide-external-link" class="size-4 text-muted ml-auto shrink-0" />
            </a>

            <div v-if="existingFiles.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                v-for="file in existingFiles"
                :key="file.id"
                :href="file.webViewLink"
                target="_blank"
                class="flex items-center gap-2 p-2 border border-default rounded-md bg-elevated/30 hover:bg-elevated/60 transition-colors min-w-0"
              >
                <UIcon name="i-lucide-file" class="size-4 text-muted shrink-0" />
                <span class="text-sm truncate text-primary">{{ file.name }}</span>
              </a>
            </div>
          </section>
        </template>

        <!-- Review controls: only Deans (of this unit) and OCESL admins see these.
             Neither can edit the report, so status changes live here. -->
        <template v-if="props.is_dean || isOceslAdmin">
          <USeparator />
          <section class="flex flex-col gap-3">
            <div v-if="props.is_dean" class="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 flex items-center justify-between gap-4">
              <div class="flex items-start gap-3">
                <UIcon name="i-lucide-shield-check" class="size-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div class="space-y-0.5">
                  <p class="text-sm font-semibold text-amber-600 dark:text-amber-400">Dean Review</p>
                  <p class="text-xs text-neutral-500">Deans accept reports from their respective college.</p>
                </div>
              </div>
              <UCheckbox
                v-model="deanAccepted"
                :disabled="savingField !== null"
                label="Accepted by Dean"
                color="primary"
                @update:model-value="(val: boolean | 'indeterminate') => saveFlag('dean_accepted', val === true)"
              />
            </div>

            <div v-if="isOceslAdmin" class="rounded-lg border border-default bg-elevated/40 p-4 flex items-center justify-between gap-4">
              <div class="flex items-start gap-3">
                <UIcon name="i-lucide-lock" class="size-5 text-muted mt-0.5 shrink-0" />
                <div class="space-y-0.5">
                  <p class="text-sm font-semibold">Admin Controls</p>
                  <p class="text-xs text-neutral-500">Marking a report as complete prevents further edits by users.</p>
                </div>
              </div>
              <UCheckbox
                v-model="locked"
                :disabled="savingField !== null"
                label="Mark as Completed"
                color="success"
                @update:model-value="(val: boolean | 'indeterminate') => saveFlag('locked', val === true)"
              />
            </div>
          </section>
        </template>
      </article>
    </template>

    <template #footer>
      <div class="flex justify-between w-full">
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-download"
          :loading="isExporting"
          @click="exportPdf"
        >
          Export PDF
        </UButton>
        <UButton color="neutral" variant="ghost" @click="emit('close')">Close</UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { Entry } from '~/utils/schemas'

const props = defineProps<{
  report_type: keyof typeof ReportCodeType
  unit_name: string
  entry: Entry
  /** True when the logged-in user is the Dean of this report's unit. */
  is_dean?: boolean
}>()

// `changed` fires right after a Dean / admin toggle is saved (the modal stays
// open), so the page behind it can refetch immediately.
const emit = defineEmits<{ close: []; changed: [] }>()

const toast = useToast()
const { user_data } = useUserData()
const { updateReport } = useUpdateReport()

const isOceslAdmin = computed(() => user_data.value?.authority === 'OCESL')

// Local copies, so the badge (and PDF status) update immediately after a
// toggle without waiting for the parent to refetch.
const deanAccepted = ref<boolean>(props.entry.dean_accepted ?? false)
const locked = ref<boolean>(props.entry.locked ?? false)
const savingField = ref<'dean_accepted' | 'locked' | null>(null)

async function saveFlag(field: 'dean_accepted' | 'locked', value: boolean) {
  const target = field === 'dean_accepted' ? deanAccepted : locked
  savingField.value = field

  try {
    // Only this one column is sent, so a stale copy of the report can't
    // overwrite anything someone else just edited.
    await updateReport({ id: props.entry.id, [field]: value })
    emit('changed')
    toast.add({
      title: field === 'dean_accepted'
        ? (value ? 'Report accepted' : 'Acceptance removed')
        : (value ? 'Report marked as completed' : 'Report unlocked'),
      color: 'success',
    })
  } catch (err) {
    target.value = !value // put the checkbox back
    toast.add({
      title: 'Could not update the report',
      description: err instanceof Error ? err.message : undefined,
      color: 'error',
    })
  } finally {
    savingField.value = null
  }
}

const { getFolderFiles } = useDrive()

const existingFiles = ref<Array<{ id: string; name: string; webViewLink: string }>>([])
const folderDriveId = ref<string>(props.entry.drive_link ?? '')

// Fetch files if editing an existing entry with a Drive Folder ID
onMounted(async () => {
  if (folderDriveId.value) {
    existingFiles.value = await getFolderFiles(folderDriveId.value)
  }
})

const formattedDate = computed(() => {
  if (!props.entry.date) return 'No date'
  return new Date(props.entry.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const driveFolderUrl = computed(() =>
  folderDriveId.value ? `https://drive.google.com/drive/folders/${folderDriveId.value}` : ''
)

const sections = computed(() => [
  { label: 'Description', icon: 'i-lucide-file-text', content: props.entry.description },
  { label: 'Objectives', icon: 'i-lucide-target', content: props.entry.objectives },
  { label: 'Outcomes', icon: 'i-lucide-trophy', content: props.entry.outcomes },
  { label: 'Remarks', icon: 'i-lucide-message-square', content: props.entry.remarks }
])

const isExporting = ref(false)

function slugify(text: string) {
  return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'report'
}

async function exportPdf() {
  isExporting.value = true

  try {
    // Dynamic import keeps jsPDF out of the initial bundle and guarantees
    // it only ever loads in the browser, never during SSR.
    const { default: jsPDF } = await import('jspdf')

    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 56
    const maxWidth = pageWidth - margin * 2
    let y = margin

    function ensureSpace(lineHeight: number) {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage()
        y = margin
      }
    }

    function writeCenteredLines(text: string, size: number, lineGap: number, bold = false) {
      doc.setFont('helvetica', bold ? 'bold' : 'normal')
      doc.setFontSize(size)
      const lines = doc.splitTextToSize(text, maxWidth)
      for (const line of lines) {
        ensureSpace(lineGap)
        doc.text(line, pageWidth / 2, y, { align: 'center' })
        y += lineGap
      }
    }

    // Title
    writeCenteredLines(props.entry.name || 'Untitled report', 20, 26, true)
    y += 4

    // Meta line
    doc.setTextColor(110)
    const metaText = `${props.unit_name ?? 'Unnamed unit'}  •  ${props.entry.members ?? 0} participants  •  ${formattedDate.value}`
    writeCenteredLines(metaText, 10, 14)
    if (props.entry.location) {
      writeCenteredLines(props.entry.location, 10, 14)
    }

    // Status
    const status = deanAccepted.value ? 'Accepted by Dean' : locked.value ? 'Locked' : 'Pending review'
    doc.setTextColor(140)
    writeCenteredLines(`Status: ${status}`, 9, 13)
    doc.setTextColor(0)
    y += 12

    // Divider
    ensureSpace(20)
    doc.setDrawColor(210)
    doc.line(margin, y, pageWidth - margin, y)
    y += 24

    // Sections
    for (const section of sections.value) {
      ensureSpace(20)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(0)
      doc.text(section.label, margin, y)
      y += 18

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10.5)
      const bodyText = section.content || `No ${section.label.toLowerCase()} provided.`
      if (!section.content) doc.setTextColor(150)
      const lines = doc.splitTextToSize(bodyText, maxWidth)
      for (const line of lines) {
        ensureSpace(16)
        doc.text(line, margin, y)
        y += 16
      }
      doc.setTextColor(0)
      y += 12
    }

    doc.save(`${slugify(props.entry.name || 'report')}.pdf`)
  } finally {
    isExporting.value = false
  }
}
</script>
