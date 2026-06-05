// Server Component — force-dynamic funktioniert nur hier, nicht in "use client"-Dateien
export const dynamic = "force-dynamic";

import { SearchClient } from "./SearchClient";

export default function SearchPage() {
  return <SearchClient />;
}
