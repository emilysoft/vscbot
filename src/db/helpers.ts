// Copia de `data` sin las claves indicadas. Los managers la usan para armar
// los `UPDATE` parciales sin enviar la PK ni `created_at` al `SET`.
export function omitKeys<T extends object, K extends keyof T>(
  data: T,
  ...keys: K[]
): Omit<T, K> {
  const excluded = new Set<string>(keys.map(String));
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => !excluded.has(key)),
  ) as Omit<T, K>;
}
