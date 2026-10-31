// Copia de `data` sin las claves indicadas ni las que vienen `undefined`.
// Los managers la usan para armar los `UPDATE` parciales sin enviar la PK ni
// `created_at` al `SET`. Drizzle tira "No values to set" si el objeto queda
// solo con valores `undefined`, asi que se filtran aca.
export function omitKeys<T extends object, K extends keyof T>(
  data: T,
  ...keys: K[]
): Omit<T, K> {
  const excluded = new Set<string>(keys.map(String));
  return Object.fromEntries(
    Object.entries(data).filter(
      ([key, value]) => value !== undefined && !excluded.has(key),
    ),
  ) as Omit<T, K>;
}
