// ─── Validation Utilities ─────────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidFileType(file: File): boolean {
  const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const ext = file.name.toLowerCase();
  return allowed.includes(file.type) || ext.endsWith('.pdf') || ext.endsWith('.docx');
}

export const MAX_CV_SIZE_MB = 10;
export const MAX_CV_SIZE_BYTES = MAX_CV_SIZE_MB * 1024 * 1024;

export function isValidFileSize(file: File): boolean {
  return file.size <= MAX_CV_SIZE_BYTES;
}
