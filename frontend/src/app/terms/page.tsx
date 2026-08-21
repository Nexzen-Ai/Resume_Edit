"use client";

import Link from "next/link";
import Brand from "@/components/Brand";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      <nav className="border-b border-slate-800/80 px-6 py-4 sticky top-0 z-50 backdrop-blur-xl bg-[#030712]/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Brand href="/" size={32} wordmarkClass="text-base" />

          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
            <Link href="/features" className="hover:text-cyan-400 transition-colors">Features</Link>
            <Link href="/pricing" className="hover:text-cyan-400 transition-colors">Pricing</Link>
            <Link href="/terms" className="text-cyan-400 font-bold">Terms</Link>
            <Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-12 pb-20 space-y-8">
        <header className="space-y-2 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-black text-white">Terms of Service & Candidate Agreement</h1>
          <p className="text-xs text-slate-400">Effective Date: August 8, 2026 | NexCV Verification Engine</p>
        </header>

        <article className="space-y-6 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">1. Skill Verification Protocols</h2>
            <p>
              NexCV issues cryptographic competency tokens (`token_id`) based on candidate performance on adaptive diagnostic exams (Score $\ge 80\%$). Verification badges represent automated exam performance at the time of testing and do not guarantee third-party employer hiring outcomes.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">2. Fact-Graph Constrained Tailoring</h2>
            <p>
              Our tailoring algorithms enforce zero-hallucination constraints on user-supplied resumes. Candidates remain responsible for verifying the accuracy of all technical metrics, employer names, and project scopes submitted to recruiters.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">3. Credit System & Student Bonuses</h2>
            <p>
              Credits are consumed upon generating diagnostic assessments or STAR interview prep. Educational domain bonuses (.edu / .ac.in) are subject to automated domain verification. Credits earned via referrals or campus campaigns carry no cash cash-out value.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">4. Acceptable Use Policy</h2>
            <p>
              Users agree not to attempt automated manipulation of diagnostic quizzes or reverse-engineer HMAC verification signature algorithms. Violation of automated exam integrity will result in verification badge revocation.
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
