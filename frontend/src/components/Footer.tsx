"use client";

import Link from "next/link";
import Brand from "@/components/Brand";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-[#02050e] text-slate-400 text-xs py-8 sm:py-12 px-4 sm:px-6 mt-12 sm:mt-20 relative z-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
        <div className="space-y-3 md:col-span-1">
          <Brand size={28} wordmarkClass="text-sm" />
          <p className="text-slate-400 text-[11px] leading-relaxed">
            The End-to-End Skill Verification & Candidate Readiness Engine. Turn low YOE into verified proof and beat Applicant Tracking Systems.
          </p>
          <div className="flex gap-3 pt-2">
            <span className="px-2.5 py-1 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold">
              ✓ HMAC Signed Proofs
            </span>
            <span className="px-2.5 py-1 rounded bg-purple-950/40 text-purple-400 border border-purple-500/30 text-[10px] font-bold">
              🎓 Student Friendly
            </span>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-white uppercase tracking-wider mb-3 text-[11px]">Platform</h4>
          <ul className="space-y-2">
            <li><Link href="/features" className="hover:text-cyan-400 transition-colors">Product Features</Link></li>
            <li><Link href="/pricing" className="hover:text-cyan-400 transition-colors">Pricing & Credits</Link></li>
            <li><Link href="/dashboard/assessment" className="hover:text-cyan-400 transition-colors">Skill Diagnostics</Link></li>
            <li><Link href="/dashboard/interview-prep" className="hover:text-cyan-400 transition-colors">STAR Interview Prep</Link></li>
            <li><Link href="/dashboard/ats-simulator" className="hover:text-cyan-400 transition-colors">ATS Dual-Scan Simulator</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white uppercase tracking-wider mb-3 text-[11px]">Student Growth</h4>
          <ul className="space-y-2">
            <li><Link href="/pricing#student" className="hover:text-purple-400 transition-colors">Campus Ambassador (+10 Credits)</Link></li>
            <li><Link href="/pricing#referral" className="hover:text-purple-400 transition-colors">Referral Program (+5 Credits)</Link></li>
            <li><Link href="/pricing#micro" className="hover:text-purple-400 transition-colors">Pay-As-You-Go Packs (₹99)</Link></li>
            <li><Link href="/verify/v_8f9a2b" className="hover:text-purple-400 transition-colors">Public Recruiter Proof Demo</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white uppercase tracking-wider mb-3 text-[11px]">Legal & Governance</h4>
          <ul className="space-y-2">
            <li><Link href="/terms" className="hover:text-cyan-400 transition-colors">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
            <li><span className="text-slate-500">Security & HMAC Standards</span></li>
            <li><span className="text-slate-500">Recruiter Trust Protocol</span></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
        <p>© {new Date().getFullYear()} NexCV. All rights reserved.</p>
        <p className="mt-2 sm:mt-0">Engineered for candidates and recruiters globally.</p>
      </div>
    </footer>
  );
}
