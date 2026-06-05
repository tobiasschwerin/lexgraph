// Server Component — force-dynamic funktioniert nur hier, nicht in "use client"-Dateien
export const dynamic = "force-dynamic";

import { LibraryClient } from "./LibraryClient";

export default function LibraryPage() {
  return <LibraryClient />;
}
