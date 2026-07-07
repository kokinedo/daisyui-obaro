/**
 * Tiny className joiner (zero-dep). Accepts strings, arrays, and
 * conditional objects; falsy values are dropped. Later classes are NOT
 * de-duplicated — order your utilities so the intended one wins, or pass the
 * override last. For this starter's scale that's simpler than a full merge lib.
 */
export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[]
  | Record<string, boolean | null | undefined>;

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  const walk = (v: ClassValue) => {
    if (!v) {
      return;
    }
    if (typeof v === "string" || typeof v === "number") {
      out.push(String(v));
    } else if (Array.isArray(v)) {
      v.forEach(walk);
    } else if (typeof v === "object") {
      for (const key in v) {
        if (v[key]) {
          out.push(key);
        }
      }
    }
  };
  inputs.forEach(walk);
  return out.join(" ");
}
