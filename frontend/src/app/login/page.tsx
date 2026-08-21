"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Brand from "@/components/Brand";
import api from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("verified");
    if (v === "1") setNotice("Email verified. You can sign in now.");
    else if (v === "0") setNotice("Verification link is invalid or already used.");
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  async function handleResendEmail() {
    if (!form.email) {
      setError("Please enter your email address to resend verification.");
      return;
    }
    setResendLoading(true);
    setResendMsg("");
    try {
      const res = await api.post("/auth/resend-verification", { email: form.email });
      setResendMsg(res.data.message || "Verification link sent! Check your email.");
      setResendCooldown(30);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail || "Could not resend verification email.");
    } finally {
      setResendLoading(false);
    }
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    setResendMsg("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      saveAuth(res.data.access_token, {
        user_id: res.data.user_id,
        email: res.data.email,
        full_name: res.data.full_name,
        is_admin: res.data.is_admin,
        role: res.data.role,
      });
      router.replace(res.data.is_admin ? "/admin" : "/dashboard");
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((e: { msg?: string }) => e.msg).filter(Boolean).join(", ") || "Login failed");
      } else {
        setError((detail as string) || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  const isUnverifiedError = error.toLowerCase().includes("verify your email");

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(0,200,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.03) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      {/* Glow orb */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, rgba(0,200,255,0.08) 0%, transparent 70%)",
      }} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-10">
          <Brand href={null} size={40} wordmarkClass="text-xl" />
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 border" style={{
          background: "var(--card)",
          borderColor: "var(--border)",
          boxShadow: "0 0 40px rgba(0,200,255,0.05), 0 20px 60px rgba(0,0,0,0.4)",
        }}>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)" }}>Welcome back</h1>
          <p className="text-sm mb-7" style={{ color: "var(--muted-light)" }}>Sign in to continue</p>

          {notice && (
            <div className="mb-5 p-3 rounded-xl text-sm border" style={{
              background: "rgba(0,229,160,0.08)",
              borderColor: "rgba(0,229,160,0.25)",
              color: "var(--success)",
            }}>
              {notice}
            </div>
          )}

          {resendMsg && (
            <div className="mb-5 p-3.5 rounded-xl text-xs sm:text-sm border flex items-center gap-2" style={{
              background: "rgba(0,200,255,0.1)",
              borderColor: "rgba(0,200,255,0.3)",
              color: "var(--accent)",
            }}>
              <span>✓</span> {resendMsg}
            </div>
          )}

          {error && (
            <div className="mb-5 p-4 rounded-xl text-sm border space-y-3" style={{
              background: "rgba(255,77,109,0.1)",
              borderColor: "rgba(255,77,109,0.3)",
              color: "#ff4d6d",
            }}>
              <p>{error}</p>
              {isUnverifiedError && (
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={resendCooldown > 0 || resendLoading}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all border flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  style={{
                    background: resendCooldown > 0 ? "rgba(255,255,255,0.05)" : "rgba(0,200,255,0.15)",
                    borderColor: resendCooldown > 0 ? "var(--border)" : "rgba(0,200,255,0.35)",
                    color: resendCooldown > 0 ? "var(--muted-light)" : "var(--accent)",
                  }}
                >
                  {resendLoading
                    ? "Resending..."
                    : resendCooldown > 0
                    ? `Resend email in ${resendCooldown}s`
                    : "📩 Resend Verification Link"}
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--muted-light)" }}>Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "#080f22",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
                onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--muted-light)" }}>Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "#080f22",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
                onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 relative overflow-hidden"
              style={{
                background: loading ? "var(--border)" : "linear-gradient(135deg, #00c8ff, #0066ff)",
                color: "#fff",
                boxShadow: loading ? "none" : "0 0 20px rgba(0,200,255,0.3)",
              }}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              No account?{" "}
              <Link href="/register" className="font-semibold transition-colors" style={{ color: "var(--accent)" }}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
