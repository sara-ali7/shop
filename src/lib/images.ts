export function cleanImage(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().replace(/^[\[\]"'\s]+|[\[\]"'\s]+$/g, "");
  return /^https?:\/\/\S+$/i.test(trimmed) ? trimmed : null;
}

export function cleanImages(images: unknown): string[] {
  if (!Array.isArray(images)) return [];
  return images
    .map((value) => (typeof value === "string" ? cleanImage(value) : null))
    .filter((value): value is string => value !== null);
}
