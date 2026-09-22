/** Escape text for safe inclusion in HTML (element content and quoted attributes). */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Remove any occurrence of a secret from a string before it is logged or returned. */
export function redactSecrets(text: string, secrets: Array<string | undefined>): string {
  let out = text;
  for (const secret of secrets) {
    if (secret) out = out.split(secret).join("[redacted]");
  }
  return out;
}

/** Strip control characters (used for values placed in email subjects). */
export function stripControlChars(value: string): string {
  return value
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
