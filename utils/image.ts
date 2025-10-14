// Image utilities for converting base64 strings to displayable image URLs

/**
 * Convert a base64 string (no data URL prefix) to a data URL for immediate image display.
 * Example input: "iVBORw0KGgo..." -> output: "data:image/png;base64,iVBORw0KGgo..."
 */
export function base64ToDataUrl(base64: string, mimeType: string = 'image/png'): string {
  if (!base64) return '';
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Convert a base64 string to a Blob URL. Useful for large images to avoid large inline strings.
 */
export function base64ToBlobUrl(base64: string, mimeType: string = 'image/png'): string {
  if (typeof window === 'undefined' || !base64) return '';
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  return URL.createObjectURL(blob);
}

/**
 * Convert a data URL (data:image/png;base64,...) back to a Blob URL
 */
export function dataUrlToBlobUrl(dataUrl: string): string {
  if (typeof window === 'undefined' || !dataUrl) return '';
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header.match(/data:(.*?);base64/);
  const mime = mimeMatch?.[1] || 'image/png';
  return base64ToBlobUrl(base64, mime);
}


