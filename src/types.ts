export interface AttachedFile {
  id: string; // unique ID
  name: string; // name of the file
  mimeType: string; // e.g. "image/jpeg", "application/pdf"
  size?: number; // bytes
  dataUrl?: string; // base64 data-URL (for preview and multimodal generation)
  base64?: string; // raw base64 data
  textAlternative?: string; // alternative text representation for files (e.g., CSV/JSON/PDF extract)
  source: "local" | "camera" | "drive";
  driveFileId?: string; // if imported from Google Drive
}
