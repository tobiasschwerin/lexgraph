import { parseStringPromise } from "xml2js";

export interface ParsedParagraph {
  id: string;
  lawCode: string;
  section: string;
  sectionOrder: number; // e.g. 305 for "305a", used for numeric sorting
  title: string | null;
  content: string;
}

/** Extracts the leading integer from a section string for numeric sorting.
 *  "305a" → 305, "1" → 1, "12a" → 12
 */
function sectionToOrder(section: string): number {
  const match = section.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export interface CrossReference {
  fromId: string;
  toId: string;
}

// Recursively extract text from an xml2js value (handles nested objects & arrays)
function extractText(val: unknown): string {
  if (val == null) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (Array.isArray(val)) return val.map(extractText).join(" ");
  if (typeof val === "object") {
    const obj = val as Record<string, unknown>;
    // xml2js text node: { _: "text", $: { attrs } }
    if (obj._) return extractText(obj._);
    // Collect all non-attribute children
    return Object.entries(obj)
      .filter(([k]) => k !== "$")
      .map(([, v]) => extractText(v))
      .join(" ");
  }
  return "";
}

// Parses gesetze-im-internet.de XML format
export async function parseLawXml(
  xml: string,
  lawCode: string
): Promise<{ paragraphs: ParsedParagraph[]; refs: CrossReference[] }> {
  const parsed = await parseStringPromise(xml, {
    explicitArray: false,
    explicitCharkey: true, // always give { _: text, $: attrs } shape
    mergeAttrs: false,
  });

  const dokumente = parsed?.dokumente?.norm;
  if (!dokumente) return { paragraphs: [], refs: [] };

  const norms = Array.isArray(dokumente) ? dokumente : [dokumente];
  const paragraphs: ParsedParagraph[] = [];

  for (const norm of norms) {
    const metadaten = norm?.metadaten;
    if (!metadaten) continue;

    // enbez may be { _: "§ 1", $: {...} } or just a string
    const enbezRaw = metadaten.enbez;
    const enbez = extractText(enbezRaw).trim();
    if (!enbez.match(/^§|^Art\.?\s/i)) continue;

    const section = enbez.replace(/^§\s*|^Art\.?\s*/i, "").trim();
    if (!section) continue;

    const titelRaw = metadaten.titel;
    const title = titelRaw ? extractText(titelRaw).trim() || null : null;

    // Content lives in textdaten.text.Content (may be deeply nested HTML)
    const textContent = norm?.textdaten?.text?.Content;
    const content = extractText(textContent).trim();
    if (!content) continue;

    const id = `${lawCode.toLowerCase()}-${section.replace(/\s+/g, "-").toLowerCase()}`;
    paragraphs.push({ id, lawCode, section, sectionOrder: sectionToOrder(section), title, content });
  }

  const refs = extractCrossRefs(paragraphs, lawCode);
  return { paragraphs, refs };
}

// Detects cross-references like "§ 242 BGB" or "§ 305" in paragraph text
export function extractCrossRefs(
  paragraphs: ParsedParagraph[],
  defaultLawCode: string
): CrossReference[] {
  const idSet = new Set(paragraphs.map((p) => p.id));
  const seen = new Set<string>();
  const refs: CrossReference[] = [];
  const refPattern = /§\s*(\d+\w*)\s*(?:Abs\.\s*\d+\s*)?([A-ZÄÖÜ]{2,6})?/g;

  for (const para of paragraphs) {
    let match: RegExpExecArray | null;
    refPattern.lastIndex = 0;
    while ((match = refPattern.exec(para.content)) !== null) {
      const section = match[1];
      const law = (match[2] ?? defaultLawCode).toUpperCase();
      const toId = `${law.toLowerCase()}-${section.toLowerCase()}`;
      const key = `${para.id}→${toId}`;

      if (toId !== para.id && idSet.has(toId) && !seen.has(key)) {
        seen.add(key);
        refs.push({ fromId: para.id, toId });
      }
    }
  }

  return refs;
}
