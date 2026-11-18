/** Returns the URL only if it is a plain http(s) link, otherwise null. */
export function safeUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}

export function isApk(url: string): boolean {
  const clean = url.split("#")[0].split("?")[0].toLowerCase();
  return clean.endsWith(".apk");
}
