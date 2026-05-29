import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isPro } from "@/lib/stripe";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ isPro: false });
  const pro = await isPro(userId);
  return NextResponse.json({ isPro: pro });
}
