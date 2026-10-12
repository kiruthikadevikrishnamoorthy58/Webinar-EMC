export const MAX_FILE_MB = 4
export const MAX_JOB_DESCRIPTION_CHARACTERS = 12_000

export function validateFile(file) {
  if (!file) return 'No file selected.'
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return "That's not a PDF. Please upload a .pdf resume."
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) return `File is larger than ${MAX_FILE_MB} MB.`
  return null
}
