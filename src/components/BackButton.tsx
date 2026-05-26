"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  href?: string;
}

export function BackButton({ href }: BackButtonProps) {
  const router = useRouter();
  return (
    <button
      onClick={() => (href ? router.push(href) : router.back())}
      className="text-slate-500 hover:text-slate-800 transition-colors"
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  );
}
