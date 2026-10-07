export const useDrive = () => {
  const uploadFiles = async (email: string, category: string, eventName: string, files: File[]) => {
    const formData = new FormData()
    formData.append('email', email)
    formData.append('category', category)
    formData.append('event_name', eventName)

    files.forEach((file) => formData.append('files', file))

    return await $fetch('/api/drive/upload', {
      method: 'POST',
      body: formData,
    })
  }

  const deleteFile = async (fileId: string) => {
    return await $fetch('/api/drive/delete', {
      method: 'POST',
      body: { fileId },
    })
  }

  const getFolderFiles = async (folderId: string) => {
    return await $fetch('/api/drive/getFiles', {
      query: { folderId },
    })
  }

  return { uploadFiles, deleteFile, getFolderFiles }
}