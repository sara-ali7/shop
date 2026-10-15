const store = new Map<string, { expires: number; value: Promise<unknown> }>();

export function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  if (typeof window === "undefined") return load();
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as Promise<T>;

  const value = load().catch((error: unknown) => {
    store.delete(key);
    throw error;
  });
  store.set(key, { expires: Date.now() + ttlMs, value });
  return value;
}

export function invalidate(prefix: string): void {
  for (const key of [...store.keys()]) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
