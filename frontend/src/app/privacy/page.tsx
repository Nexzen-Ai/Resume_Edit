"use client";

import Link from "next/link";
import Brand from "@/components/Brand";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      <nav className="border-b border-slate-800/80 px-6 py-4 sticky top-0 z-50 backdrop-blur-xl bg-[#030712]/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Brand href="/" size={32} wordmarkClass="text-base" />

          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
            <Link href="/features" className="hover:text-cyan-400 transition-colors">Features</Link>
            <Link href="/pricing" className="hover:text-cyan-400 transition-colors">Pricing</Link>
            <Link href="/terms" className="hover:text-cyan-400 transition-colors">Terms</Link>
            <Link href="/privacy" className="text-cyan-400 font-bold">Privacy</Link>
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
          <h1 className="text-3xl font-black text-white">Privacy Policy & Data Security Standards</h1>
          <p className="text-xs text-slate-400">Effective Date: August 8, 2026 | NexCV Data Governance</p>
        </header>

        <article className="space-y-6 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">1. Data Minimization & Resume Storage</h2>
            <p>
              Uploaded resume files (DOCX) are stored in private Supabase S3 storage buckets accessible only via authenticated session tokens. We extract text strictly for tailoring, ATS simulation, and Fact-Graph matching.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">2. Public Verification Tokens</h2>
            <p>
              When a user opts to share a Verified Proof Badge (`/verify/[token]`), the public page displays ONLY candidate name, skill tested, score percentage, date issued, and cryptographic signature hash. Personal contact information (email, phone, address) is NEVER exposed on public verification endpoints.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">3. Third-Party Processing & Security</h2>
            <p>
              Resume processing is performed through secure LLM API standard instances operating under strict data non-retention agreements. Your resumes are never used to train public foundation models.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">4. User Data Control & Deletion</h2>
            <p>
              You retain complete ownership of your data. Deleting a resume from your dashboard immediately removes the file from private storage buckets and purges associated Fact-Graph records.
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
