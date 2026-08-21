"use client";

import { useState } from "react";
import Link from "next/link";
import Brand from "@/components/Brand";
import Footer from "@/components/Footer";
import { Menu, X } from "lucide-react";

export default function PricingPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800/80 px-4 sm:px-6 py-4 sticky top-0 z-50 backdrop-blur-xl bg-[#030712]/90 flex items-center justify-between max-w-7xl mx-auto">
        <Brand href="/" size={32} wordmarkClass="text-base" />

        <div className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
          <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
          <Link href="/features" className="hover:text-cyan-400 transition-colors">Features</Link>
          <Link href="/pricing" className="text-cyan-400 font-bold">Pricing</Link>
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
            <Link href="/features" onClick={() => setMobileNavOpen(false)} className="hover:text-cyan-400 transition-colors py-1">
              Features
            </Link>
            <Link href="/pricing" onClick={() => setMobileNavOpen(false)} className="text-cyan-400 font-bold py-1">
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
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/30">
            Transparent Credit Model
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white glow-text-purple">
            Pay-As-You-Go Credit Packs & Student Rewards
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            No expensive monthly subscription traps. Pay only for what you scan or claim free credits through university verification and referral rewards.
          </p>
        </header>

        {/* Credit Breakdown Table */}
        <div className="max-w-3xl mx-auto bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Credit Cost Breakdown:</h3>
          <div className="divide-y divide-slate-800 text-xs">
            <div className="py-3 flex justify-between items-center">
              <span>1 Resume Tailoring Scan</span>
              <span className="font-bold text-cyan-300">1 Credit</span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <span>1 Adaptive Diagnostic Skill Assessment</span>
              <span className="font-bold text-cyan-300">2 Credits</span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <span>1 STAR Method Low-YOE Interview Defense Prep</span>
              <span className="font-bold text-cyan-300">1 Credit</span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <span>Dual-Scan ATS Simulator Analysis</span>
              <span className="font-bold text-emerald-400">FREE</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Card 1: Student Free Tier */}
          <div id="student" className="bg-slate-900/80 border border-cyan-500/40 rounded-3xl p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                🎓 Campus Ambassador
              </span>
              <h3 className="text-2xl font-black text-white">Student Bonus</h3>
              <div className="text-4xl font-black text-cyan-400 glow-text-cyan">FREE</div>
              <p className="text-xs text-slate-300">
                Register with your university or college email address (.edu / .ac.in / university domain) to unlock 10 free credits automatically.
              </p>

              <ul className="space-y-2 text-xs text-slate-300 pt-2">
                <li>✓ Automatic domain verification</li>
                <li>✓ +10 Instant free credits</li>
                <li>✓ Full access to diagnostic tests</li>
              </ul>
            </div>

            <Link
              href="/dashboard"
              className="w-full py-3.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-center transition-all block mt-6"
            >
              Verify University Email →
            </Link>
          </div>

          {/* Card 2: Micro-transaction Pack */}
          <div id="micro" className="bg-gradient-to-b from-purple-950/40 to-slate-900 border border-purple-500/50 rounded-3xl p-8 space-y-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                ⚡ Starter Top-Up
              </span>
              <h3 className="text-2xl font-black text-white">Pay-As-You-Go</h3>
              <div>
                <span className="text-4xl font-black text-white glow-text-purple">₹99</span>
                <span className="text-xs text-slate-400 ml-1">/ 10 Credits ($1.99 USD)</span>
              </div>
              <p className="text-xs text-slate-300">
                Micro-transaction credit pack. No monthly renewal fees, credits never expire. Perfect for job search sprints.
              </p>

              <ul className="space-y-2 text-xs text-slate-300 pt-2">
                <li>✓ 10 Scan / Assessment Credits</li>
                <li>✓ Credits never expire</li>
                <li>✓ Includes HMAC verified proof tokens</li>
              </ul>
            </div>

            <Link
              href="/dashboard"
              className="w-full py-3.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white text-center transition-all block mt-6"
            >
              Top Up Credits →
            </Link>
          </div>

          {/* Card 3: Referral Program */}
          <div id="referral" className="bg-slate-900/80 border border-emerald-500/40 rounded-3xl p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                🎁 Reciprocal Reward
              </span>
              <h3 className="text-2xl font-black text-white">Refer a Classmate</h3>
              <div className="text-4xl font-black text-emerald-400">+5 Credits</div>
              <p className="text-xs text-slate-300">
                Share your personal referral token. When a classmate signs up, both of you get 5 free credits added instantly.
              </p>

              <ul className="space-y-2 text-xs text-slate-300 pt-2">
                <li>✓ Reciprocal dual bonus</li>
                <li>✓ Unlimited referral rewards</li>
                <li>✓ Instant automated credit grant</li>
              </ul>
            </div>

            <Link
              href="/dashboard"
              className="w-full py-3.5 rounded-xl font-bold text-xs bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-center transition-all block mt-6"
            >
              Get Referral Code →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
