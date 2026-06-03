import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "JuraMap — Deutsches Recht visuell",
  description: "Verbinde Gesetzesparagraphen wie eine Mindmap. Für Juristen.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="de" className="h-full antialiased">
        <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
