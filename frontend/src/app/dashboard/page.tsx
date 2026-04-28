"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { isLoggedIn, getUser } from "@/lib/auth";

interface Resume { resume_id: string; filename: string; uploaded_at: string; }
interface EditJob { id: string; resume_id: string; status: string; created_at: string; added_skills: string[]; keywords_added: string[]; }

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ full_name?: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [history, setHistory] = useState<EditJob[]>([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [jd, setJd] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) { router.replace("/login"); return; }
    setUser(getUser());
    fetchResumes();
    fetchHistory();
  }, [router]);

  async function fetchResumes() {
    try { const r = await api.get("/resume/"); setResumes(r.data); if (r.data.length > 0) setSelectedResume(r.data[0].resume_id); } catch {}
  }
  async function fetchHistory() {
    try { const r = await api.get("/edit/history"); setHistory(r.data); } catch {}
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      await api.post("/resume/upload", form, { headers: { "Content-Type": "multipart/form-data" } });
      setSuccess("Resume uploaded"); setTimeout(() => setSuccess(""), 3000);
      fetchResumes();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Upload failed");
    } finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/resume/${id}`);
      setResumes(prev => prev.filter(r => r.resume_id !== id));
      if (selectedResume === id) setSelectedResume(resumes.find(r => r.resume_id !== id)?.resume_id || "");
    } catch {}
  }

  async function handleEdit() {
    if (!selectedResume || !jd.trim()) { setError("Select a resume and paste a job description"); return; }
    setEditing(true); setError("");
    try {
      const res = await api.post("/edit/", { resume_id: selectedResume, job_description: jd });
      setSuccess("Resume tailored! Downloading..."); setTimeout(() => setSuccess(""), 4000);
      const dl = await api.get(`/edit/${res.data.job_id}/download`, { responseType: "blob" });
      const url = URL.createObjectURL(dl.data);
      const a = document.createElement("a");
      a.href = url; a.download = `tailored_resume_${res.data.job_id}.docx`; a.click();
      URL.revokeObjectURL(url);
      fetchHistory();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "AI editing failed. Try again.");
    } finally { setEditing(false); }
  }

  async function downloadJob(jobId: string) {
    try {
      const dl = await api.get(`/edit/${jobId}/download`, { responseType: "blob" });
      const url = URL.createObjectURL(dl.data);
      const a = document.createElement("a"); a.href = url; a.download = `tailored_resume_${jobId}.docx`; a.click();
      URL.revokeObjectURL(url);
    } catch {}
  }

  function fmt(iso: string) {
    return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  const cardStyle = {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* bg grid */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(0,200,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.02) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <Navbar />

      <main className="relative max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
              Hello, <span style={{ color: "var(--accent)" }}>{user?.full_name?.split(" ")[0]}</span>
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Upload resume · paste JD · download tailored DOCX</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: "var(--accent-dim)", border: "1px solid rgba(0,200,255,0.2)" }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--accent)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--accent)" }}>AI Ready</span>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-xl text-sm border" style={{ background: "rgba(255,77,109,0.08)", borderColor: "rgba(255,77,109,0.25)", color: "#ff4d6d" }}>
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 rounded-xl text-sm border" style={{ background: "rgba(0,229,160,0.08)", borderColor: "rgba(0,229,160,0.25)", color: "var(--success)" }}>
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Resume Panel */}
          <div className="p-6" style={cardStyle}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-white text-sm">My Resumes</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{resumes.length} uploaded</p>
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl font-semibold transition-all disabled:opacity-50"
                style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid rgba(0,200,255,0.2)" }}
              >
                {uploading ? (
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round"/></svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                )}
                {uploading ? "Uploading..." : "Upload"}
              </button>
              <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleUpload} />
            </div>

            {resumes.length === 0 ? (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed rounded-xl p-10 text-center transition-all hover:border-cyan-500/50 group"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center group-hover:scale-105 transition-transform" style={{ background: "var(--accent-dim)", border: "1px solid rgba(0,200,255,0.15)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--accent)" }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <p className="text-sm font-medium text-white">Drop resume here</p>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>DOCX only · max 5MB</p>
              </button>
            ) : (
              <div className="space-y-2">
                {resumes.map((r) => {
                  const selected = selectedResume === r.resume_id;
                  return (
                    <div
                      key={r.resume_id}
                      onClick={() => setSelectedResume(r.resume_id)}
                      className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group"
                      style={{
                        background: selected ? "rgba(0,200,255,0.08)" : "rgba(255,255,255,0.02)",
                        border: `1px solid ${selected ? "rgba(0,200,255,0.3)" : "var(--border)"}`,
                      }}
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{
                        background: selected ? "rgba(0,200,255,0.15)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${selected ? "rgba(0,200,255,0.3)" : "var(--border)"}`,
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: selected ? "var(--accent)" : "var(--muted)" }}>
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: selected ? "white" : "var(--foreground)" }}>{r.filename}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{fmt(r.uploaded_at)}</p>
                      </div>
                      {selected && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(r.resume_id); }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all"
                        style={{ color: "var(--muted)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#ff4d6d")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* JD Panel */}
          <div className="p-6 flex flex-col" style={cardStyle}>
            <div className="mb-5">
              <h2 className="font-semibold text-white text-sm">Job Description</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Paste the full JD — AI extracts skills &amp; keywords</p>
            </div>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste job description here..."
              className="flex-1 w-full rounded-xl p-4 text-sm resize-none outline-none transition-all min-h-[200px]"
              style={{
                background: "#080f22",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
              onFocus={(e) => e.target.style.borderColor = "rgba(0,200,255,0.4)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border)"}
            />

            <button
              onClick={handleEdit}
              disabled={editing || !selectedResume || !jd.trim()}
              className="mt-4 w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: editing ? "var(--border)" : "linear-gradient(135deg, #00c8ff, #0066ff)",
                color: "#fff",
                boxShadow: editing ? "none" : "0 0 24px rgba(0,200,255,0.25)",
              }}
            >
              {editing ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="32" strokeLinecap="round"/></svg>
                  AI tailoring resume...
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                  Tailor &amp; Download
                </>
              )}
            </button>
            <p className="text-xs text-center mt-2" style={{ color: "var(--muted)" }}>Downloads as .docx</p>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="p-6" style={cardStyle}>
            <h2 className="font-semibold text-white text-sm mb-5">Edit History</h2>
            <div className="space-y-2">
              {history.map((job) => (
                <div key={job.id} className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer transition-colors"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                    onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                  >
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--success)" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">Tailored resume</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{fmt(job.created_at)}</p>
                    </div>
                    {job.added_skills?.length > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full hidden sm:block" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                        +{job.added_skills.length} skills
                      </span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); downloadJob(job.id); }}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                      style={{ background: "linear-gradient(135deg, #00c8ff, #0066ff)", color: "#fff" }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Download
                    </button>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--muted)", transform: expandedJob === job.id ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>

                  {expandedJob === job.id && (
                    <div className="px-5 pb-5 pt-3 space-y-4" style={{ borderTop: "1px solid var(--border)", background: "rgba(0,0,0,0.2)" }}>
                      {job.added_skills?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--muted-light)" }}>Skills Added</p>
                          <div className="flex flex-wrap gap-1.5">
                            {job.added_skills.map((s) => (
                              <span key={s} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "rgba(0,200,255,0.1)", color: "var(--accent)", border: "1px solid rgba(0,200,255,0.2)" }}>
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {job.keywords_added?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--muted-light)" }}>Keywords Injected</p>
                          <div className="flex flex-wrap gap-1.5">
                            {job.keywords_added.map((k) => (
                              <span key={k} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "rgba(0,229,160,0.1)", color: "var(--success)", border: "1px solid rgba(0,229,160,0.2)" }}>
                                {k}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
