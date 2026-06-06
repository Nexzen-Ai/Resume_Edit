"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { isLoggedIn, getUser, updateUser } from "@/lib/auth";

export default function ProfilePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) { router.replace("/login"); return; }
    const u = getUser();
    setFullName(u?.full_name || "");
    setEmail(u?.email || "");
  }, [router]);

  async function save(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(""); setOk("");
    if (newPw && newPw.length < 8) { setError("New password must be at least 8 characters"); return; }
    if (newPw && !curPw) { setError("Enter your current password to change it"); return; }
    setSaving(true);
    try {
      const body: Record<string, string> = { full_name: fullName };
      if (newPw) { body.current_password = curPw; body.new_password = newPw; }
      const res = await api.patch("/auth/me", body);
      updateUser({ full_name: res.data.full_name });
      setOk(newPw ? "Profile and password updated" : "Profile updated");
      setCurPw(""); setNewPw("");
    } catch (err: unknown) {
      const d = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(d || "Update failed");
    } finally { setSaving(false); }
  }

  const inputStyle = { background: "#080f22", border: "1px solid var(--border)", color: "var(--foreground)" };
  const label = "block text-xs font-semibold uppercase tracking-widest mb-2";

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--foreground)" }}>My Profile</h1>

        <form onSubmit={save} className="rounded-2xl p-6 space-y-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          {error && <div className="p-3 rounded-xl text-sm border" style={{ background: "rgba(255,77,109,0.1)", borderColor: "rgba(255,77,109,0.3)", color: "#ff4d6d" }}>{error}</div>}
          {ok && <div className="p-3 rounded-xl text-sm border" style={{ background: "rgba(0,229,160,0.08)", borderColor: "rgba(0,229,160,0.25)", color: "var(--success)" }}>{ok}</div>}

          <div>
            <label className={label} style={{ color: "var(--muted-light)" }}>Full Name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
          </div>

          <div>
            <label className={label} style={{ color: "var(--muted-light)" }}>Email (cannot be changed)</label>
            <input value={email} disabled
              className="w-full px-4 py-3 rounded-xl text-sm outline-none cursor-not-allowed opacity-60"
              style={{ ...inputStyle, background: "#05091a" }} />
          </div>

          <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs mb-3 mt-3" style={{ color: "var(--muted)" }}>Change password (leave blank to keep current)</p>
            <div className="space-y-3">
              <input type="password" value={curPw} onChange={(e) => setCurPw(e.target.value)} placeholder="Current password"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
              <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="New password (min 8)"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #00c8ff, #0066ff)", color: "#fff" }}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </main>
    </div>
  );
}
