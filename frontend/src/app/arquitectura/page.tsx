"use client"
import React from "react"
import Link from "next/link"
import { Activity, Brain, ChevronLeft, Zap } from "lucide-react"
import { DiagramaArquitectura } from "@/components/diagrama-arquitectura"

export default function ArquitecturaPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0A0A0F] pattern-bg text-white relative overflow-x-hidden">

      {/* Header Unificado */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center border-b border-white/5 bg-[#0D0D12]/60 backdrop-blur-2xl px-6 lg:px-10">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#1D9E75] to-[#25C08F] shadow-[0_0_20px_rgba(29,158,117,0.3)] group-hover:scale-110 transition-transform">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="font-black text-xl tracking-tighter">
              VetSur <span className="text-[#1D9E75] opacity-50 font-medium">ML</span>
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/predictor"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-[#1D9E75] transition-all"
            >
              <Brain className="h-4 w-4" />
              Predictor IA
            </Link>
            <Link href="/" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-[#1D9E75] transition-colors border-l border-white/10 pl-6">
              <ChevronLeft className="h-4 w-4" />
              Volver
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full p-6 lg:p-10 pt-32 z-10">
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <DiagramaArquitectura />
        </div>
      </main>
    </div>
  )
}
