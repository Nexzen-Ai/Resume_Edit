"use client";

import { useState } from "react";
import Link from "next/link";
import Brand from "@/components/Brand";
import Footer from "@/components/Footer";
import TenSlideShowcase from "@/components/TenSlideShowcase";
import { Menu, X } from "lucide-react";

export default function FeaturesPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800/80 px-4 sm:px-6 py-4 sticky top-0 z-50 backdrop-blur-xl bg-[#030712]/90 flex items-center justify-between max-w-7xl mx-auto">
        <Brand href="/" size={32} wordmarkClass="text-base" />

        <div className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
          <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
          <Link href="/features" className="text-cyan-400 font-bold">Features</Link>
          <Link href="/pricing" className="hover:text-cyan-400 transition-colors">Pricing</Link>
          <Link href="/terms" className="hover:text-cyan-400 transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy</Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/dashboard" className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all">
            Go to Dashboard
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileNavOpen ? <X className="w-6 h-6 text-cyan-400" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav Drawer */}
      {mobileNavOpen && (
        <div className="relative z-50 md:hidden border-b border-slate-800 bg-[#060b19] px-6 py-4 space-y-3">
          <div className="flex flex-col space-y-3 text-sm font-medium text-slate-300">
            <Link href="/" onClick={() => setMobileNavOpen(false)} className="hover:text-cyan-400 transition-colors py-1">
              Home
            </Link>
            <Link href="/features" onClick={() => setMobileNavOpen(false)} className="text-cyan-400 font-bold py-1">
              Features
            </Link>
            <Link href="/pricing" onClick={() => setMobileNavOpen(false)} className="hover:text-cyan-400 transition-colors py-1">
              Pricing & Credits
            </Link>
            <Link href="/terms" onClick={() => setMobileNavOpen(false)} className="hover:text-cyan-400 transition-colors py-1">
              Terms of Service
            </Link>
            <Link href="/privacy" onClick={() => setMobileNavOpen(false)} className="hover:text-cyan-400 transition-colors py-1">
              Privacy Policy
            </Link>
          </div>
          <div className="pt-3 border-t border-slate-800">
            <Link
              href="/dashboard"
              onClick={() => setMobileNavOpen(false)}
              className="w-full block py-2.5 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 text-center"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-16 sm:pb-20 space-y-12 sm:space-y-16">
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            Architecture Breakdown
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white glow-text-cyan">
            10-Module Candidate Verification Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Learn how NexCV combines Fact-Graphs, Adaptive IRT testing, HMAC cryptographic tokens, and STAR interview defense into an unbeatable candidate readiness ecosystem.
          </p>
        </header>

        {/* 10-Slide Showcase */}
        <section>
          <TenSlideShowcase />
        </section>

        {/* Detailed Grid Modules */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-sm">
              01
            </div>
            <h3 className="text-lg font-bold text-white">Fact-Graph Engine</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Deconstructs your resume into atomic facts. Tailoring is strictly constrained to your actual facts—no invented experience.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-sm">
              02
            </div>
            <h3 className="text-lg font-bold text-white">Adaptive Diagnostic Testing</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              When experience gaps are identified, the AI generates a 5-question targeted exam to prove practical competency.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm">
              03
            </div>
            <h3 className="text-lg font-bold text-white">Cryptographic Proof Badges</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Scoring 80%+ generates a signed verification URL (nexcv.me/verify/ID) and injectable resume bullet points.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
