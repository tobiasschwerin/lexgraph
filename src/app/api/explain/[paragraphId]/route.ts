import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ paragraphId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 500 });

  const { paragraphId } = await params;

  const paragraph = await prisma.paragraph.findUnique({
    where: { id: paragraphId },
    select: { lawCode: true, section: true, title: true, content: true },
  });

  if (!paragraph) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const client = new Anthropic({ apiKey });

  const prompt = `Du erklärst deutschen Juristen und Mandanten Gesetzesparagraphen.

Paragraph: ${paragraph.lawCode} § ${paragraph.section}${paragraph.title ? ` (${paragraph.title})` : ""}

Gesetzestext:
${paragraph.content}

Erkläre diesen Paragraphen in **3 klaren Abschnitten**:

1. **Kernaussage** (1–2 Sätze): Was regelt dieser Paragraph grundsätzlich?
2. **Wann relevant?** (2–3 Sätze): In welchen typischen Alltagssituationen oder Rechtsfällen kommt dieser Paragraph zur Anwendung?
3. **Wichtigste Voraussetzungen** (Stichpunkte): Was muss erfüllt sein, damit der Paragraph greift?

Schreibe präzise aber verständlich — so, dass ein Mandant ohne Jurastudium es versteht. Auf Deutsch.`;

  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  return NextResponse.json({ explanation: text });
}
