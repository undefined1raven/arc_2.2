export function strToBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);

  return globalThis
    .btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
