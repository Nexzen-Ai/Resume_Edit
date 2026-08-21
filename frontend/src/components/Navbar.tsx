"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearAuth, getUser } from "@/lib/auth";
import Brand from "@/components/Brand";
import CreditBadge from "@/components/CreditBadge";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{ full_name?: string; is_admin?: boolean } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, []);

  function logout() {
    clearAuth();
    router.replace("/login");
  }

  return (
    <nav className="border-b px-4 sm:px-6 py-4 sticky top-0 z-50 backdrop-blur-md" style={{
      background: "rgba(5, 10, 24, 0.9)",
      borderColor: "var(--border)",
    }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Brand href="/dashboard" size={32} wordmarkClass="text-base" />

          {user && (
            <div className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-300">
              <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Tailor Resume</Link>
              <Link href="/dashboard/assessment" className="hover:text-cyan-400 transition-colors">Skill Diagnostics</Link>
              <Link href="/dashboard/interview-prep" className="hover:text-cyan-400 transition-colors">STAR Interview Prep</Link>
              <Link href="/dashboard/ats-simulator" className="hover:text-cyan-400 transition-colors">ATS Simulator</Link>
            </div>
          )}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user && <CreditBadge />}

          {user?.is_admin && (
            <Link href="/admin" className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
              style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid rgba(0,200,255,0.25)" }}>
              Admin
            </Link>
          )}
          {user && (
            <Link href="/profile" className="flex items-center gap-2.5 group" title="Edit profile">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{
                background: "linear-gradient(135deg, #00c8ff22, #0066ff22)",
                border: "1px solid var(--border-bright)",
                color: "var(--accent)",
              }}>
                {user.full_name?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm hidden sm:block group-hover:text-white transition-colors" style={{ color: "var(--muted-light)" }}>{user.full_name}</span>
            </Link>
          )}
          <button
            onClick={logout}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer"
            style={{
              border: "1px solid var(--border)",
              color: "var(--muted-light)",
              background: "transparent",
            }}
          >
            Sign out
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-3">
          {user && <CreditBadge />}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-cyan-400" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-4 pb-3 border-t border-slate-800 mt-3 space-y-3">
          {user && (
            <div className="flex items-center gap-3 px-2 pb-3 border-b border-slate-800/80">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{
                background: "linear-gradient(135deg, #00c8ff22, #0066ff22)",
                border: "1px solid var(--border-bright)",
                color: "var(--accent)",
              }}>
                {user.full_name?.[0]?.toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">{user.full_name}</span>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="text-[11px] text-cyan-400 hover:underline">
                  View Profile →
                </Link>
              </div>
            </div>
          )}

          {user && (
            <div className="flex flex-col space-y-2 text-sm font-medium text-slate-300 px-2">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-slate-800/60 hover:text-cyan-400 transition-colors">
                📄 Tailor Resume
              </Link>
              <Link href="/dashboard/assessment" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-slate-800/60 hover:text-cyan-400 transition-colors">
                ⚡ Skill Diagnostics
              </Link>
              <Link href="/dashboard/interview-prep" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-slate-800/60 hover:text-cyan-400 transition-colors">
                🎙️ STAR Interview Prep
              </Link>
              <Link href="/dashboard/ats-simulator" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-slate-800/60 hover:text-cyan-400 transition-colors">
                🔬 ATS Simulator
              </Link>
              {user?.is_admin && (
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg bg-cyan-950/50 text-cyan-400 border border-cyan-500/30">
                  🛡️ Admin Panel
                </Link>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-slate-800 px-2 flex justify-between items-center">
            <button
              onClick={() => { setMobileMenuOpen(false); logout(); }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-all text-center"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
