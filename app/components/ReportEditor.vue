<template>
  <UModal
    :close="{ onClick: () => emit('close', false) }"
    :title="props.is_dean ? 'Reviewing Report' : (props.entry ? 'Editing Report' : 'New Report')"
    :dismissible="false"
    class="max-w-4xl"
  >
    <template #body>
      <UForm :schema="ReportSchema" :state="state" class="space-y-6" @submit="onSubmit">
        <!-- Fields disabled if logged in as Dean -->
        <fieldset :disabled="props.is_dean" class="space-y-6">
          <!-- EVENT DETAILS -->
          <div class="rounded-lg border border-default p-4 space-y-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-calendar-days" class="size-4 text-muted" />
              <h3 class="text-sm font-semibold uppercase tracking-wide text-muted">Event Details</h3>
            </div>

            <div class="flex flex-col md:flex-row gap-4 w-full">
              <UFormField class="flex-3" label="Event Name" name="event_name">
                <UInput v-model="state.name" class="w-full" placeholder="e.g. Community Tree Planting Day" />
              </UFormField>

              <UFormField class="flex-1" label="Date" name="date">
                <UInput v-model="localDatetimeBridge" type="datetime-local" class="w-full" />
              </UFormField>
            </div>

            <div class="flex gap-4 w-full">
              <UFormField class="flex-2 md:flex-3" label="Location" name="location">
                <UTextarea v-model="state.location" class="w-full" :rows="1" autoresize placeholder="Where did this take place?" />
              </UFormField>

              <UFormField class="flex-1 truncate" label="No. of members" name="members">
                <UInputNumber v-model="state.members" :min="0" class="w-full" />
              </UFormField>
            </div>
          </div>

          <!-- NARRATIVE -->
          <div class="rounded-lg border border-default p-4 space-y-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-file-text" class="size-4 text-muted" />
              <h3 class="text-sm font-semibold uppercase tracking-wide text-muted">Description & Objectives</h3>
            </div>

            <UFormField label="Event Description" name="description">
              <UTextarea v-model="state.description" class="w-full" autoresize placeholder="Summarize what happened." />
            </UFormField>

            <UFormField label="Objectives" name="objectives">
              <UTextarea v-model="state.objectives" class="w-full" autoresize placeholder="What was this event meant to accomplish?" />
            </UFormField>

            <UFormField label="Outcomes" name="outcomes">
              <UTextarea v-model="state.outcomes" class="w-full" autoresize placeholder="What was actually achieved?" />
            </UFormField>

            <UFormField label="Remarks" name="remarks">
              <UTextarea v-model="state.remarks" class="w-full" autoresize placeholder="Any additional notes." />
            </UFormField>
          </div>
        </fieldset>

        <!-- ATTACHMENTS -->
        <div class="rounded-lg border border-default p-4 space-y-4">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-paperclip" class="size-4 text-muted" />
            <h3 class="text-sm font-semibold uppercase tracking-wide text-muted">Attachments</h3>
          </div>

          <template v-if="!props.is_dean">
            <div
              class="relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer"
              :class="isDraggingFiles
                ? 'border-primary bg-primary-50/50 dark:bg-primary-950/20'
                : 'border-default hover:border-primary/50 hover:bg-elevated/50'"
              @click="fileInputRef?.click()"
              @dragover.prevent="isDraggingFiles = true"
              @dragleave.prevent="isDraggingFiles = false"
              @drop.prevent="handleFileDrop"
            >
              <UIcon name="i-lucide-upload-cloud" class="size-8 text-muted" />
              <div class="text-sm">
                <span class="font-medium text-primary">Click to upload</span>
                <span class="text-muted"> or drag and drop</span>
              </div>
              <p class="text-xs text-muted">Images and videos. First image becomes this report's card thumbnail.</p>

              <input
                ref="fileInputRef"
                type="file"
                multiple
                accept="image/*,video/*"
                class="hidden"
                @change="handleFileSelect"
                @click.stop
              />
            </div>

            <div v-if="selectedFiles.length > 0" class="flex flex-wrap gap-2">
              <div
                v-for="(file, index) in selectedFiles"
                :key="`${file.name}-${index}`"
                class="flex items-center gap-2 rounded-md border border-default bg-elevated/50 pl-2 pr-1 py-1"
              >
                <UIcon :name="fileIcon(file)" class="size-4 text-muted shrink-0" />
                <span class="text-xs truncate max-w-40">{{ file.name }}</span>
                <span class="text-[10px] text-muted shrink-0">{{ formatFileSize(file.size) }}</span>
                <UButton
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-x"
                  @click.stop="removeSelectedFile(index)"
                />
              </div>
            </div>
            <div v-if="thumbnailPreviewUrl" class="flex items-center gap-3">
              <img
                :src="thumbnailPreviewUrl"
                alt="Thumbnail preview"
                class="h-16 w-28 rounded-md border border-default object-cover shrink-0"
              />
              <p class="text-xs text-muted">This image will be used as the card thumbnail.</p>
            </div>
          </template>

          <div v-if="existingFiles.length > 0" class="space-y-2">
            <p class="text-xs font-medium text-muted">Already uploaded</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div
                v-for="file in existingFiles"
                :key="file.id"
                class="flex justify-between items-center gap-2 p-2 border border-default rounded-md bg-elevated/30"
              >
                <a :href="file.webViewLink" target="_blank" class="flex items-center gap-2 min-w-0 text-xs text-primary hover:underline">
                  <UIcon name="i-lucide-file" class="size-4 shrink-0" />
                  <span class="truncate">{{ file.name }}</span>
                </a>
                <UButton
                  v-if="!props.is_dean"
                  color="error"
                  variant="ghost"
                  icon="i-lucide-trash"
                  size="xs"
                  @click="onDeleteFile(file.id)"
                />
              </div>
            </div>
          </div>

          <p v-if="!existingFiles.length && !selectedFiles.length && props.is_dean" class="text-xs italic text-muted">
            No attachments.
          </p>
        </div>

        <!-- DEAN ACCEPTANCE CONTROL -->
        <div class="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 flex items-center justify-between gap-4">
          <div class="flex items-start gap-3">
            <UIcon name="i-lucide-shield-check" class="size-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div class="space-y-0.5">
              <p class="text-sm font-semibold text-amber-600 dark:text-amber-400">Dean Review</p>
              <p class="text-xs text-neutral-500">Deans accept reports from their respective college.</p>
            </div>
          </div>
          <UCheckbox
            v-model="isDeanAccepted"
            :disabled="!props.is_dean"
            label="Accepted by Dean"
            color="primary"
            @change="onDeanAcceptToggle"
          />
        </div>

        <!-- ADMIN STATUS OVERRIDE SECTION -->
        <div v-if="isOceslAdmin" class="rounded-lg border border-default bg-elevated/40 p-4 flex items-center justify-between gap-4">
          <div class="flex items-start gap-3">
            <UIcon name="i-lucide-lock" class="size-5 text-muted mt-0.5 shrink-0" />
            <div class="space-y-0.5">
              <p class="text-sm font-semibold">Admin Controls</p>
              <p class="text-xs text-neutral-500">Marking a report as complete prevents further edits by users.</p>
            </div>
          </div>
          <UCheckbox
            v-model="isCompleted"
            label="Mark as Completed"
            color="success"
          />
        </div>

        <USeparator />

        <div class="flex justify-between">
          <UButton color="neutral" variant="ghost" @click="emit('close', false)">
            {{ props.is_dean ? 'Close' : 'Cancel' }}
          </UButton>
          <UButton v-if="!props.is_dean" type="submit" :loading="isSubmitting">
            {{ props.entry ? 'Update' : 'Submit' }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Report } from '~/utils/schemas'
import { ReportSchema, type Entry, type UnitEntries } from '~/utils/schemas'
import type { Database } from '~~/shared/types/database.types';
const props = defineProps<{ report_type: ReportTypes, unit_id: number, entry?: Entry, is_dean: boolean }>()

const emit = defineEmits<{ close: [boolean] }>()
const { uploadFiles, deleteFile, getFolderFiles } = useDrive()
const { uploadThumbnail } = useReportThumbnail()

const { user_data } = useUserData()
const supabase_client = useSupabaseClient<Database>()

const isOceslAdmin = computed(() => user_data.value?.authority === 'OCESL')

const isSubmitting = ref(false)
const selectedFiles = ref<File[]>([])
const existingFiles = ref<Array<{ id: string; name: string; webViewLink: string }>>([])
const folderDriveId = ref<string>(props.entry?.drive_link ?? '')
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDraggingFiles = ref(false)

const isCompleted = ref<boolean>(props.entry?.locked ?? false)
const isDeanAccepted = ref<boolean>(props.entry?.dean_accepted ?? false)

watch(() => props.entry?.locked, (newStatus) => {
  isCompleted.value = newStatus ?? false
})

watch(() => props.entry?.dean_accepted, (newVal) => {
  isDeanAccepted.value = newVal ?? false
})

const state = reactive<Report>({
  name: props.entry?.name ?? '',
  date: props.entry?.date ?? '',
  location: props.entry?.location ?? '',
  members: props.entry?.members ?? 1, // Fallback guaranteed to be a number
  description: props.entry?.description ?? '',
  objectives: props.entry?.objectives ?? '',
  outcomes: props.entry?.outcomes ?? '',
  remarks: props.entry?.remarks ?? '',
})

onMounted(async () => {
  if (folderDriveId.value) {
    existingFiles.value = await getFolderFiles(folderDriveId.value)
  }
})

// Whichever file the user picks first (by input order) that's an image
// becomes the card thumbnail on submit. Falls back to the entry's existing
// thumbnail (if editing) when no new image is selected.
const thumbnailPreviewUrl = ref<string | null>(props.entry?.thumbnail_url ?? null)
let thumbnailObjectUrl: string | null = null

function refreshThumbnailPreview() {
  if (thumbnailObjectUrl) {
    URL.revokeObjectURL(thumbnailObjectUrl)
    thumbnailObjectUrl = null
  }

  const firstImage = selectedFiles.value.find((f) => f.type.startsWith('image/'))
  if (firstImage) {
    thumbnailObjectUrl = URL.createObjectURL(firstImage)
    thumbnailPreviewUrl.value = thumbnailObjectUrl
  } else {
    thumbnailPreviewUrl.value = props.entry?.thumbnail_url ?? null
  }
}

function addFiles(files: FileList | File[]) {
  selectedFiles.value = [...selectedFiles.value, ...Array.from(files)]
  refreshThumbnailPreview()
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files?.length) return
  addFiles(target.files)
  target.value = '' // allow re-selecting the same file later
}

function handleFileDrop(e: DragEvent) {
  isDraggingFiles.value = false
  if (!e.dataTransfer?.files?.length) return
  addFiles(e.dataTransfer.files)
}

function removeSelectedFile(index: number) {
  selectedFiles.value = selectedFiles.value.filter((_, i) => i !== index)
  refreshThumbnailPreview()
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fileIcon(file: File) {
  if (file.type.startsWith('image/')) return 'i-lucide-image'
  if (file.type.startsWith('video/')) return 'i-lucide-video'
  return 'i-lucide-file'
}

onBeforeUnmount(() => {
  if (thumbnailObjectUrl) URL.revokeObjectURL(thumbnailObjectUrl)
})

async function onDeleteFile(fileId: string) {
  try {
    await deleteFile(fileId)
    existingFiles.value = existingFiles.value.filter(f => f.id !== fileId)
  } catch (err) {
    console.error('Failed to delete file', err)
  }
}

async function onDeanAcceptToggle() {
  return
}

const { submitReport, pending: submitPending } = useSubmitReport()
const { updateReport, pending: updatePending } = useUpdateReport()

async function onSubmit(event: FormSubmitEvent<Report>) {
  if (!user_data.value?.email) return

  isSubmitting.value = true
  const category: ReportTypes = props.entry?.type && isReportType(props.entry?.type) ? props.entry.type : "CE"

  const firstImage = selectedFiles.value.find((f) => f.type.startsWith('image/'))

  try {
    if (selectedFiles.value.length > 0) {
      const uploadRes = await uploadFiles(user_data.value?.email, category, state.name, selectedFiles.value)
      if (uploadRes.folderId) {
        folderDriveId.value = uploadRes.folderId
      }
    }

    const submitEntry: Database['public']['Tables']['REPORT']['Insert'] = {
      id: props.entry?.id,
      name: state.name,
      date: state.date,
      location: state.location,
      members: state.members,
      description: state.description,
      objectives: state.objectives,
      outcomes: state.outcomes,
      remarks: state.remarks,
      drive_link: folderDriveId.value,
      locked: isCompleted.value,
      comment: props.entry?.comment,
      unit_id: props.entry?.unit_id ?? props.unit_id,
      dean_accepted: isDeanAccepted.value,
      type: props.entry?.type ?? props.report_type,
      // No new image selected: keep whatever thumbnail already exists (or
      // none). A new image is uploaded below and patched in afterward.
      thumbnail_url: props.entry?.thumbnail_url ?? null,
    }

    if (props.entry) {
      // Editing an existing report: we already have its id, so the thumbnail
      // (if any) can be uploaded and attached in the same request.
      if (firstImage) {
        submitEntry.thumbnail_url = await uploadThumbnail(props.entry.id, firstImage)
      }
      await updateReport(submitEntry as Entry)
    } else {
      // New report: it has no id until after the insert, so the thumbnail
      // has to be uploaded in a second step once we know the new id.
      const inserted = await submitReport(submitEntry)
      if (firstImage && inserted?.id) {
        const thumbnailUrl = await uploadThumbnail(inserted.id, firstImage)
        await updateReport({ ...inserted, thumbnail_url: thumbnailUrl } as Entry)
      }
    }

    emit('close', true)
  } catch (err) {
    console.error(err)
  } finally {
    isSubmitting.value = false
  }
}

// 2. Computed bridge to handle the raw text string `<UInput>` expects
const localDatetimeBridge = computed({
  get() {
    if (!state.date) return ''
    // Converts UTC ISO string to User's Local Time (YYYY-MM-DDTHH:mm)
    const date = new Date(state.date)
    const offset = date.getTimezoneOffset() * 60000
    const localISOTime = new Date(date.getTime() - offset).toISOString()
    return localISOTime.slice(0, 16) 
  },
  set(newValue: string) {
    if (!newValue) {
      state.date = ''
      return
    }
    // Converts user input string back to standard UTC ISO String for Supabase
    state.date = new Date(newValue).toISOString()
  }
})
</script>