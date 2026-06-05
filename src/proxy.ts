import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";

// Clerk läuft passiv – setzt nur Auth-Header für API-Routen und Server-Components.
// Seitenschutz passiert ausschließlich im API-Layer (401 JSON bei fehlendem Token).
const clerkHandler = clerkMiddleware();

// Next.js 16 requires the export to be named "proxy"
export function proxy(request: NextRequest, event: NextFetchEvent) {
  return clerkHandler(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
