"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { isLoggedIn, getUser } from "@/lib/auth";

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  access_expires_at: string | null;
  created_at: string | null;
  resume_count: number;
  edits_total: number;
  edits_done: number;
  resume_limit: number;
}
interface Stats { total_users: number; active_users: number; edits_today: number; }
interface UpgradeReq { id: string; email: string; full_name: string; message: string; created_at: string; }
interface UsageRow { user_id: string; email: string; full_name: string; edits: number; edits_done: number; }
interface Usage { start: string; end: string; total_edits: number; users: UsageRow[]; }
const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
const PRESETS: { label: string; days: number }[] = [
  { label: "1M", days: 30 }, { label: "2M", days: 60 }, { label: "3M", days: 90 },
  { label: "6M", days: 180 }, { label: "1Y", days: 365 },
];

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [requests, setRequests] = useState<UpgradeReq[]>([]);
  const [uStart, setUStart] = useState(() => daysAgo(29));
  const [uEnd, setUEnd] = useState(() => today());
  const [usage, setUsage] = useState<Usage | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) { router.replace("/login"); return; }
    if (!getUser()?.is_admin) { router.replace("/dashboard"); return; }
  }, [router]);

  const load = useCallback(async () => {
    try {
      const [u, s, r] = await Promise.all([
        api.get("/admin/users", { params: { search } }),
        api.get("/admin/stats"),
        api.get("/admin/upgrade-requests"),
      ]);
      setUsers(u.data); setStats(s.data); setRequests(r.data);
    } catch {
      setError("Failed to load admin data");
    }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    api.get("/admin/usage", { params: { start: uStart, end: uEnd } })
      .then((r) => setUsage(r.data))
      .catch(() => setUsage(null));
  }, [uStart, uEnd]);

  const preset = (days: number) => { setUStart(daysAgo(days - 1)); setUEnd(today()); };

  async function act(id: string, fn: () => Promise<unknown>) {
    setBusy(id); setError("");
    try { await fn(); await load(); }
    catch (e: unknown) {
      const d = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(d || "Action failed");
    } finally { setBusy(""); }
  }

  const grant = (id: string) => {
    const v = prompt("Days of access (blank = unlimited):", "30");
    if (v === null) return;
    const days = v.trim() === "" ? null : parseInt(v, 10);
    act(id, () => api.post(`/admin/users/${id}/grant`, { days }));
  };
  const verifyEmail = (id: string) => act(id, () => api.post(`/admin/users/${id}/verify-email`));
  const revoke = (id: string) => act(id, () => api.post(`/admin/users/${id}/revoke`));
  const remove = (id: string) => {
    if (!confirm("Delete this user and all their data?")) return;
    act(id, () => api.delete(`/admin/users/${id}`));
  };
  const setLimit = (id: string, current: number) => {
    const v = prompt("Resume limit for this user:", String(current));
    if (v === null) return;
    const limit = parseInt(v, 10);
    if (isNaN(limit)) return;
    act(id, () => api.post(`/admin/users/${id}/resume-limit`, { limit }));
  };
  const handleReq = (id: string) => act(id, () => api.post(`/admin/upgrade-requests/${id}/handle`));
  const approveLimit = (id: string) => act(id, () => api.post(`/admin/upgrade-requests/${id}/approve-limit`));
  const approveClearResume = (id: string) => act(id, () => api.post(`/admin/upgrade-requests/${id}/approve-clear-resume`));

  const fmt = (iso: string | null) => iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
  const expired = (iso: string | null) => !!iso && new Date(iso) < new Date();

  const card = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px" };

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Admin</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Users", value: stats?.total_users },
            { label: "Active", value: stats?.active_users },
            { label: "Edits Today", value: stats?.edits_today },
          ].map((s) => (
            <div key={s.label} className="p-5" style={card}>
              <p className="text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>{s.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: "var(--accent)" }}>{s.value ?? "—"}</p>
            </div>
          ))}
        </div>

        {/* Usage over a date range (credits = edits used) */}
        <div className="p-5" style={card}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h2 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
              Usage · <span style={{ color: "var(--accent)" }}>{usage?.total_edits ?? 0}</span> credits
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {PRESETS.map((p) => {
                const on = uEnd === today() && uStart === daysAgo(p.days - 1);
                return (
                  <button key={p.label} onClick={() => preset(p.days)}
                    className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                    style={{ background: on ? "var(--accent-dim)" : "rgba(255,255,255,0.03)", color: on ? "var(--accent)" : "var(--muted-light)", border: `1px solid ${on ? "rgba(0,200,255,0.3)" : "var(--border)"}` }}>
                    {p.label}
                  </button>
                );
              })}
              <input type="date" value={uStart} max={uEnd} onChange={(e) => setUStart(e.target.value)}
                className="px-2 py-1 rounded-lg text-xs outline-none" style={{ background: "#080f22", border: "1px solid var(--border)", color: "var(--foreground)" }} />
              <span style={{ color: "var(--muted)" }}>→</span>
              <input type="date" value={uEnd} min={uStart} max={today()} onChange={(e) => setUEnd(e.target.value)}
                className="px-2 py-1 rounded-lg text-xs outline-none" style={{ background: "#080f22", border: "1px solid var(--border)", color: "var(--foreground)" }} />
            </div>
          </div>

          {usage?.users.length ? (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {usage.users.map((u) => (
                <div key={u.user_id} className="flex items-center justify-between text-sm px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <span style={{ color: "var(--muted-light)" }}>{u.full_name} <span style={{ color: "var(--muted)" }}>· {u.email}</span></span>
                  <span style={{ color: "var(--accent)" }}>{u.edits_done}<span style={{ color: "var(--muted)" }}>/{u.edits} used</span></span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: "var(--muted)" }}>No credits used on this day.</p>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-xl text-sm border" style={{ background: "rgba(255,77,109,0.08)", borderColor: "rgba(255,77,109,0.25)", color: "#ff4d6d" }}>{error}</div>
        )}

        {/* Upgrade requests */}
        {requests.length > 0 && (
          <div className="p-5" style={card}>
            <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--accent)" }}>
              Upgrade & Deletion Requests · {requests.length}
            </h2>
            <div className="space-y-2">
              {requests.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                  <div className="min-w-0">
                    <div className="text-sm" style={{ color: "white" }}>{r.full_name} <span style={{ color: "var(--muted)" }}>· {r.email}</span></div>
                    {r.message && <div className="text-xs mt-1 text-cyan-300 bg-cyan-950/40 px-2 py-1 rounded border border-cyan-500/20">{r.message}</div>}
                    <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{fmt(r.created_at)}</div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 shrink-0 items-center">
                    <button
                      disabled={busy === r.id}
                      onClick={() => approveLimit(r.id)}
                      className="text-xs px-2.5 py-1 rounded-lg font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/70 cursor-pointer"
                      title="Increase user resume limit (+1)"
                    >
                      +1 Resume Limit
                    </button>
                    <button
                      disabled={busy === r.id}
                      onClick={() => approveClearResume(r.id)}
                      className="text-xs px-2.5 py-1 rounded-lg font-medium bg-amber-950/70 text-amber-300 border border-amber-500/40 hover:bg-amber-900/70 cursor-pointer"
                      title="Clear user's uploaded resume so they can upload a new one"
                    >
                      Clear User Resume
                    </button>
                    <button
                      disabled={busy === r.id}
                      onClick={() => handleReq(r.id)}
                      className="text-xs px-2.5 py-1 rounded-lg"
                      style={{ background: "transparent", color: "var(--muted-light)", border: "1px solid var(--border)" }}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}        )}

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email..."
          className="w-full max-w-sm px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: "#080f22", border: "1px solid var(--border)", color: "var(--foreground)" }}
        />

        {/* Users table */}
        <div className="overflow-x-auto p-2" style={card}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: "var(--muted)" }} className="text-left text-xs uppercase tracking-wider">
                <th className="p-3">User</th><th className="p-3">Role</th><th className="p-3">Verified</th>
                <th className="p-3">Resumes</th><th className="p-3">Edits</th><th className="p-3">Limit</th>
                <th className="p-3">Access</th><th className="p-3">Expiry</th><th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td className="p-3">
                    <div style={{ color: "white" }}>{u.full_name}</div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>{u.email}</div>
                  </td>
                  <td className="p-3" style={{ color: u.role === "admin" ? "var(--accent)" : "var(--muted-light)" }}>{u.role}</td>
                  <td className="p-3">
                    {u.email_verified ? (
                      <span className="text-xs px-2 py-0.5 rounded font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                        ✓ Verified
                      </span>
                    ) : (
                      <button
                        disabled={busy === u.id}
                        onClick={() => verifyEmail(u.id)}
                        className="text-[11px] px-2 py-1 rounded-lg font-semibold bg-amber-950/60 text-amber-300 border border-amber-500/40 hover:bg-amber-900/60 cursor-pointer"
                        title="Click to manually verify user email without SMTP"
                      >
                        ⚡ Verify Email
                      </button>
                    )}
                  </td>
                  <td className="p-3" style={{ color: "var(--muted-light)" }}>{u.resume_count}</td>
                  <td className="p-3" style={{ color: "var(--muted-light)" }}>{u.edits_done}<span style={{ color: "var(--muted)" }}>/{u.edits_total}</span></td>
                  <td className="p-3">
                    {u.role === "admin"
                      ? <span style={{ color: "var(--accent)" }}>∞</span>
                      : <button onClick={() => setLimit(u.id, u.resume_limit)} className="text-xs px-2 py-0.5 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", color: "var(--accent)", border: "1px solid var(--border)" }}>{u.resume_limit} ✎</button>}
                  </td>
                  <td className="p-3" style={{ color: u.is_active ? "var(--success)" : "#ff4d6d" }}>
                    {u.is_active ? "Active" : "Revoked"}
                  </td>
                  <td className="p-3" style={{ color: expired(u.access_expires_at) && u.role !== "admin" ? "#ff4d6d" : "var(--muted-light)" }}>
                    {u.role === "admin" ? "—" : `${fmt(u.access_expires_at)}${expired(u.access_expires_at) ? " (expired)" : ""}`}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1.5 justify-end">
                      {!u.email_verified && (
                        <button disabled={busy === u.id} onClick={() => verifyEmail(u.id)} className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30">Verify</button>
                      )}
                      <button disabled={busy === u.id} onClick={() => grant(u.id)} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid rgba(0,200,255,0.25)" }}>Grant</button>
                      <button disabled={busy === u.id} onClick={() => revoke(u.id)} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: "rgba(255,77,109,0.08)", color: "#ff4d6d", border: "1px solid rgba(255,77,109,0.25)" }}>Revoke</button>
                      <button disabled={busy === u.id} onClick={() => remove(u.id)} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: "transparent", color: "var(--muted)", border: "1px solid var(--border)" }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={9} className="p-6 text-center" style={{ color: "var(--muted)" }}>No users</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
