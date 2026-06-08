"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearAuth, getUser } from "@/lib/auth";
import Brand from "@/components/Brand";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{ full_name?: string; is_admin?: boolean } | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  function logout() {
    clearAuth();
    router.replace("/login");
  }

  return (
    <nav className="border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md" style={{
      background: "rgba(5, 10, 24, 0.85)",
      borderColor: "var(--border)",
    }}>
      <Brand href="/dashboard" size={32} wordmarkClass="text-base" />

      <div className="flex items-center gap-5">
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
          className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
          style={{
            border: "1px solid var(--border)",
            color: "var(--muted-light)",
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.borderColor = "var(--accent)";
            (e.target as HTMLElement).style.color = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.borderColor = "var(--border)";
            (e.target as HTMLElement).style.color = "var(--muted-light)";
          }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
