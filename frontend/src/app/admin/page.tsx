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
}
interface Stats { total_users: number; active_users: number; edits_today: number; }

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) { router.replace("/login"); return; }
    if (!getUser()?.is_admin) { router.replace("/dashboard"); return; }
  }, [router]);

  const load = useCallback(async () => {
    try {
      const [u, s] = await Promise.all([
        api.get("/admin/users", { params: { search } }),
        api.get("/admin/stats"),
      ]);
      setUsers(u.data); setStats(s.data);
    } catch {
      setError("Failed to load admin data");
    }
  }, [search]);

  useEffect(() => { load(); }, [load]);

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
  const revoke = (id: string) => act(id, () => api.post(`/admin/users/${id}/revoke`));
  const remove = (id: string) => {
    if (!confirm("Delete this user and all their data?")) return;
    act(id, () => api.delete(`/admin/users/${id}`));
  };

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

        {error && (
          <div className="p-3 rounded-xl text-sm border" style={{ background: "rgba(255,77,109,0.08)", borderColor: "rgba(255,77,109,0.25)", color: "#ff4d6d" }}>{error}</div>
        )}

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
                  <td className="p-3">{u.email_verified ? "✓" : "✗"}</td>
                  <td className="p-3" style={{ color: u.is_active ? "var(--success)" : "#ff4d6d" }}>
                    {u.is_active ? "Active" : "Revoked"}
                  </td>
                  <td className="p-3" style={{ color: expired(u.access_expires_at) ? "#ff4d6d" : "var(--muted-light)" }}>
                    {fmt(u.access_expires_at)}{expired(u.access_expires_at) ? " (expired)" : ""}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1.5 justify-end">
                      <button disabled={busy === u.id} onClick={() => grant(u.id)} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid rgba(0,200,255,0.25)" }}>Grant</button>
                      <button disabled={busy === u.id} onClick={() => revoke(u.id)} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: "rgba(255,77,109,0.08)", color: "#ff4d6d", border: "1px solid rgba(255,77,109,0.25)" }}>Revoke</button>
                      <button disabled={busy === u.id} onClick={() => remove(u.id)} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: "transparent", color: "var(--muted)", border: "1px solid var(--border)" }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center" style={{ color: "var(--muted)" }}>No users</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
