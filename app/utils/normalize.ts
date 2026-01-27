/**
 * Normalizes a string for diacritic-insensitive search.
 * Removes special characters like ō, ū, ī and converts them to regular ASCII.
 * 
 * Example: "Ōnoki" -> "onoki", "Chōji" -> "choji"
 */
export function normalize(s: string): string {
  return s
    .normalize?.('NFD')
    .replace(/\p{M}/gu, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}
