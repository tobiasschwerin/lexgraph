/**
 * Returns the correct section prefix for a given law code.
 * Grundgesetz (GG) uses "Art.", all other German laws use "§".
 */
export function sectionPrefix(lawCode: string): string {
  return lawCode === "GG" ? "Art." : "§";
}
