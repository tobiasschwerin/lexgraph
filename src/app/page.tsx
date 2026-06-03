import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { Scale, Network, Users, Search, ArrowRight, Check, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen bg-slate-50">

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-900 rounded-lg flex items-center justify-center">
            <Scale className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-blue-900 tracking-tight" style={{ fontFamily: "'EB Garamond', serif" }}>
            JuraMap
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/search" className="text-sm text-slate-600 hover:text-blue-900 transition-colors font-medium">
            Gesetze suchen
          </Link>
          <Show when="signed-in">
            <Link
              href="/library"
              className="text-sm bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors font-medium"
            >
              Meine Maps
            </Link>
            <UserButton />
          </Show>
          <Show when="signed-out">
            <Link href="/sign-in" className="text-sm text-slate-600 hover:text-blue-900 transition-colors font-medium">
              Anmelden
            </Link>
            <Link
              href="/sign-up"
              className="text-sm bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors font-medium"
            >
              Kostenlos starten
            </Link>
          </Show>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">

        {/* Graph network background decoration */}
        <div className="absolute inset-0 opacity-20 pointer-events-none select-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="fade" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="white" stopOpacity="0.15"/>
                <stop offset="100%" stopColor="white" stopOpacity="0"/>
              </radialGradient>
            </defs>
            {/* Nodes */}
            <circle cx="15%" cy="25%" r="4" fill="#60a5fa" opacity="0.8"/>
            <circle cx="30%" cy="15%" r="3" fill="#93c5fd" opacity="0.6"/>
            <circle cx="50%" cy="20%" r="5" fill="#3b82f6" opacity="0.9"/>
            <circle cx="70%" cy="12%" r="3" fill="#60a5fa" opacity="0.6"/>
            <circle cx="85%" cy="25%" r="4" fill="#93c5fd" opacity="0.7"/>
            <circle cx="20%" cy="50%" r="6" fill="#3b82f6" opacity="0.8"/>
            <circle cx="40%" cy="45%" r="4" fill="#60a5fa" opacity="0.7"/>
            <circle cx="60%" cy="40%" r="5" fill="#93c5fd" opacity="0.8"/>
            <circle cx="80%" cy="50%" r="4" fill="#3b82f6" opacity="0.6"/>
            <circle cx="10%" cy="70%" r="3" fill="#60a5fa" opacity="0.5"/>
            <circle cx="35%" cy="75%" r="4" fill="#93c5fd" opacity="0.6"/>
            <circle cx="65%" cy="70%" r="3" fill="#3b82f6" opacity="0.7"/>
            <circle cx="90%" cy="75%" r="5" fill="#60a5fa" opacity="0.6"/>
            {/* Edges */}
            <line x1="15%" y1="25%" x2="30%" y2="15%" stroke="#60a5fa" strokeWidth="1" opacity="0.4"/>
            <line x1="30%" y1="15%" x2="50%" y2="20%" stroke="#60a5fa" strokeWidth="1" opacity="0.4"/>
            <line x1="50%" y1="20%" x2="70%" y2="12%" stroke="#60a5fa" strokeWidth="1" opacity="0.3"/>
            <line x1="70%" y1="12%" x2="85%" y2="25%" stroke="#60a5fa" strokeWidth="1" opacity="0.4"/>
            <line x1="15%" y1="25%" x2="20%" y2="50%" stroke="#60a5fa" strokeWidth="1" opacity="0.3"/>
            <line x1="20%" y1="50%" x2="40%" y2="45%" stroke="#60a5fa" strokeWidth="1.5" opacity="0.5"/>
            <line x1="40%" y1="45%" x2="60%" y2="40%" stroke="#60a5fa" strokeWidth="1.5" opacity="0.5"/>
            <line x1="60%" y1="40%" x2="80%" y2="50%" stroke="#60a5fa" strokeWidth="1" opacity="0.4"/>
            <line x1="50%" y1="20%" x2="40%" y2="45%" stroke="#93c5fd" strokeWidth="1" opacity="0.35"/>
            <line x1="85%" y1="25%" x2="80%" y2="50%" stroke="#60a5fa" strokeWidth="1" opacity="0.3"/>
            <line x1="20%" y1="50%" x2="35%" y2="75%" stroke="#60a5fa" strokeWidth="1" opacity="0.3"/>
            <line x1="40%" y1="45%" x2="35%" y2="75%" stroke="#60a5fa" strokeWidth="1" opacity="0.25"/>
            <line x1="60%" y1="40%" x2="65%" y2="70%" stroke="#93c5fd" strokeWidth="1" opacity="0.35"/>
            <line x1="80%" y1="50%" x2="90%" y2="75%" stroke="#60a5fa" strokeWidth="1" opacity="0.3"/>
            <line x1="35%" y1="75%" x2="65%" y2="70%" stroke="#60a5fa" strokeWidth="1" opacity="0.3"/>
          </svg>
        </div>

        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/30 text-blue-200 text-xs font-medium px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
            <Scale className="w-3.5 h-3.5" />
            Für Juristen
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight tracking-tight" style={{ fontFamily: "'EB Garamond', serif" }}>
            Deutsches Recht{" "}
            <em className="text-blue-300 not-italic">visuell verbinden</em>
          </h1>

          <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto leading-relaxed">
            Verknüpfe Paragraphen wie eine Mindmap. Erkenne automatisch Querverweise.
            Arbeite strukturiert mit BGB, HGB, StGB und mehr.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Show when="signed-out">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 bg-white text-blue-900 px-7 py-3.5 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg text-sm"
              >
                Jetzt kostenlos starten
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Show>
            <Show when="signed-in">
              <Link
                href="/library"
                className="inline-flex items-center gap-2 bg-white text-blue-900 px-7 py-3.5 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg text-sm"
              >
                Zu meinen Maps
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Show>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 text-slate-300 border border-slate-600 px-7 py-3.5 rounded-xl font-medium hover:bg-white/5 transition-colors text-sm"
            >
              <Search className="w-4 h-4" />
              Gesetze durchsuchen
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-slate-600" />
        </div>
      </section>

      {/* Features */}
      <section className="bg-white px-8 py-20 border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-amber-700 tracking-widest uppercase mb-3">Funktionen</p>
            <h2 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'EB Garamond', serif" }}>
              Alles was Juristen brauchen
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                Icon: Zap,
                title: "Auto-Erkennung",
                desc: "Querverweise wie '§ 242 BGB' werden automatisch als Pfeile erkannt und eingetragen.",
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
              {
                Icon: Network,
                title: "Visuelle Maps",
                desc: "Ziehe Paragraphen auf die Canvas, verbinde sie und speichere deine juristische Analyse.",
                color: "text-blue-700",
                bg: "bg-blue-50",
              },
              {
                Icon: Users,
                title: "Kollaboration",
                desc: "Teile Maps mit Kollegen per Link — zum Lesen oder gemeinsamen Bearbeiten.",
                color: "text-indigo-700",
                bg: "bg-indigo-50",
              },
            ].map(({ Icon, title, desc, color, bg }) => (
              <div key={title} className="flex flex-col gap-4 p-6 rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-sm transition-all">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-semibold text-slate-900 text-lg" style={{ fontFamily: "'EB Garamond', serif" }}>{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gesetze */}
      <section className="bg-slate-50 px-8 py-16 border-b border-slate-100">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-semibold text-slate-400 tracking-widest uppercase mb-6">Enthaltene Gesetze</p>
          <div className="flex flex-wrap justify-center gap-3">
            {["BGB", "HGB", "StGB", "GG", "ZPO", "StPO", "VwGO"].map((law) => (
              <span key={law} className="bg-white border border-slate-200 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg shadow-sm">
                {law}
              </span>
            ))}
          </div>
          <p className="text-sm text-slate-400 mt-5">5.879 Paragraphen · Daten via gesetze-im-internet.de (BMJ)</p>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-amber-700 tracking-widest uppercase mb-3">Preise</p>
            <h2 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'EB Garamond', serif" }}>
              Einfach & transparent
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Free */}
            <div className="border border-slate-200 rounded-2xl p-8 flex flex-col gap-5">
              <div>
                <h3 className="font-bold text-slate-900 text-lg" style={{ fontFamily: "'EB Garamond', serif" }}>Free</h3>
                <div className="flex items-end gap-1 mt-2">
                  <span className="text-4xl font-bold text-slate-900">€0</span>
                  <span className="text-slate-400 text-sm mb-1">/Monat</span>
                </div>
              </div>
              <ul className="flex flex-col gap-2.5 text-sm text-slate-600">
                {["Bis zu 3 Maps", "Alle 5.879 Paragraphen", "Auto-Erkennung Querverweise", "Suche & Navigation"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="mt-auto text-center border border-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Kostenlos starten
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-blue-900 rounded-2xl p-8 flex flex-col gap-5 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                Empfohlen
              </div>
              <div>
                <h3 className="font-bold text-white text-lg" style={{ fontFamily: "'EB Garamond', serif" }}>Pro</h3>
                <div className="flex items-end gap-1 mt-2">
                  <span className="text-4xl font-bold text-white">€14,99</span>
                  <span className="text-blue-300 text-sm mb-1">/Monat</span>
                </div>
              </div>
              <ul className="flex flex-col gap-2.5 text-sm text-blue-100">
                {["Unbegrenzte Maps", "Alle Free-Funktionen", "Kollaboration & Teilen", "Priority Support"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-blue-300 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="/api/stripe/checkout"
                className="mt-auto text-center bg-white text-blue-900 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors"
              >
                Pro starten
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 px-8 py-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-blue-400" />
            <span className="text-white font-semibold text-sm" style={{ fontFamily: "'EB Garamond', serif" }}>JuraMap</span>
          </div>
          <p className="text-xs">
            © 2026 JuraMap · Gesetze via{" "}
            <a href="https://gesetze-im-internet.de" className="underline hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
              gesetze-im-internet.de
            </a>{" "}
            (BMJ)
          </p>
        </div>
      </footer>
    </main>
  );
}
