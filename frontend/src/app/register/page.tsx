"use client";
import { useState } from "react";
import Link from "next/link";
import Brand from "@/components/Brand";
import api from "@/lib/api";

export default function RegisterPage() {
  const [form, setForm] = useState({ email: "", password: "", full_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      setDone(true);   // verification email sent — no auto-login
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((e: { msg?: string }) => e.msg).filter(Boolean).join(", ") || "Registration failed");
      } else {
        setError((detail as string) || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    background: "#080f22",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(0,200,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.03) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, rgba(0,200,255,0.08) 0%, transparent 70%)",
      }} />

      <div className="relative w-full max-w-md">
        <div className="flex items-center justify-center mb-10">
          <Brand href={null} size={40} wordmarkClass="text-xl" />
        </div>

        <div className="rounded-2xl p-8 border" style={{
          background: "var(--card)",
          borderColor: "var(--border)",
          boxShadow: "0 0 40px rgba(0,200,255,0.05), 0 20px 60px rgba(0,0,0,0.4)",
        }}>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)" }}>Create account</h1>
          <p className="text-sm mb-7" style={{ color: "var(--muted-light)" }}>Start tailoring your resume with AI</p>

          {done ? (
            <div className="space-y-5">
              <div className="p-4 rounded-xl text-sm border" style={{
                background: "rgba(0,229,160,0.08)", borderColor: "rgba(0,229,160,0.25)", color: "var(--success)",
              }}>
                Account created. We sent a verification link to <b>{form.email}</b>. Click it, then sign in.
              </div>
              <Link href="/login" className="block text-center w-full py-3 rounded-xl text-sm font-semibold"
                style={{ background: "linear-gradient(135deg, #00c8ff, #0066ff)", color: "#fff" }}>
                Go to Sign in
              </Link>
            </div>
          ) : (
          <>
          {error && (
            <div className="mb-5 p-3 rounded-xl text-sm border" style={{
              background: "rgba(255,77,109,0.1)",
              borderColor: "rgba(255,77,109,0.3)",
              color: "#ff4d6d",
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { label: "Full Name", key: "full_name", type: "text", placeholder: "John Doe" },
              { label: "Email", key: "email", type: "email", placeholder: "you@example.com" },
              { label: "Password", key: "password", type: "password", placeholder: "Min 8 characters" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--muted-light)" }}>{label}</label>
                <input
                  type={type}
                  required
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                  placeholder={placeholder}
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              style={{
                background: loading ? "var(--border)" : "linear-gradient(135deg, #00c8ff, #0066ff)",
                color: "#fff",
                boxShadow: loading ? "none" : "0 0 20px rgba(0,200,255,0.3)",
              }}
            >
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>
          </>
          )}

          <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Already have account?{" "}
              <Link href="/login" className="font-semibold" style={{ color: "var(--accent)" }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
