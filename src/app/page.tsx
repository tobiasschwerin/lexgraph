import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-slate-200 bg-white">
        <span className="text-xl font-bold text-blue-600 tracking-tight">LexGraph</span>
        <div className="flex items-center gap-4">
          <Link href="/search" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
            Gesetze suchen
          </Link>

          <Show when="signed-in">
            <Link
              href="/library"
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Meine Maps
            </Link>
            <UserButton />
          </Show>

          <Show when="signed-out">
            <Link
              href="/sign-in"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Anmelden
            </Link>
            <Link
              href="/sign-up"
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kostenlos starten
            </Link>
          </Show>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full mb-6">
          Für Anwälte, Notare & Juristen
        </div>
        <h1 className="text-5xl font-bold text-slate-900 mb-4 leading-tight max-w-2xl">
          Deutsches Recht{" "}
          <span className="text-blue-600">visuell verbinden</span>
        </h1>
        <p className="text-lg text-slate-500 mb-10 max-w-xl">
          Verknüpfe Paragraphen wie eine Mindmap. Erkenne automatisch Querverweise.
          Arbeite gemeinsam mit deinem Team.
        </p>
        <div className="flex items-center gap-4">
          <Show when="signed-out">
            <Link
              href="/sign-up"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              Jetzt starten — kostenlos
            </Link>
          </Show>
          <Show when="signed-in">
            <Link
              href="/library"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              Zu meinen Maps →
            </Link>
          </Show>
          <Link
            href="/search"
            className="text-slate-600 px-6 py-3 rounded-xl font-medium hover:bg-slate-100 transition-colors"
          >
            Gesetze durchsuchen →
          </Link>
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-t border-slate-200 bg-white px-8 py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: "⚡",
              title: "Auto-Erkennung",
              desc: "Querverweise wie '§ 242 BGB' werden automatisch als gestrichelte Pfeile erkannt.",
            },
            {
              icon: "🗺️",
              title: "Visuelle Maps",
              desc: "Ziehe Paragraphen auf die Canvas, verbinde sie und speichere deine Analyse.",
            },
            {
              icon: "🤝",
              title: "Kollaboration",
              desc: "Teile Maps mit Kollegen per Link — lesen oder gemeinsam bearbeiten.",
            },
          ].map((f) => (
            <div key={f.title} className="flex flex-col gap-2">
              <span className="text-2xl">{f.icon}</span>
              <h3 className="font-semibold text-slate-800">{f.title}</h3>
              <p className="text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center text-xs text-slate-400 py-6 border-t border-slate-100">
        © 2026 LexGraph — Gesetze via gesetze-im-internet.de (BMJ)
      </footer>
    </main>
  );
}
