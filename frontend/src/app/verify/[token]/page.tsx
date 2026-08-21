"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";

interface VerificationData {
  token_id: string;
  user_name: string;
  skill_name: string;
  score_percent: number;
  passed_at: string;
  signature_hash: string;
  verified_status: string;
}

export default function PublicVerificationPage() {
  const params = useParams();
  const token = params?.token as string;
  
  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      fetchVerification();
    }
  }, [token]);

  async function fetchVerification() {
    try {
      const res = await api.get(`/verification/verify/${token}`);
      setData(res.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || "Invalid or expired verification proof.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-xl bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xs text-slate-400 font-medium">Validating Cryptographic Proof...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-950/50 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto text-xl font-bold">
              ✕
            </div>
            <h2 className="text-lg font-bold text-white">Verification Failed</h2>
            <p className="text-xs text-slate-400">{error}</p>
          </div>
        ) : data ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-black text-xs">
                  N
                </div>
                <span className="font-extrabold text-sm tracking-wider text-white">NEXCV VERIFIED</span>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                OFFICIALLY VERIFIED
              </span>
            </div>

            <div className="text-center py-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">Candidate Skill Competency</p>
              <h1 className="text-3xl font-black text-white">{data.skill_name}</h1>
              <div className="inline-block bg-slate-950/80 px-6 py-2 rounded-2xl border border-cyan-500/30 mt-2">
                <span className="text-3xl font-black text-cyan-400">{data.score_percent}%</span>
                <span className="text-xs text-slate-400 ml-2">Exam Score</span>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Candidate:</span>
                <span className="font-bold text-white">{data.user_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Verification ID:</span>
                <span className="font-mono text-cyan-300">{data.token_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date Issued:</span>
                <span className="text-slate-300">{new Date(data.passed_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Verification Engine:</span>
                <span className="text-emerald-400 font-semibold">{data.verified_status}</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-500 block text-[10px] mb-1">Cryptographic Signature Hash (HMAC SHA-256):</span>
                <span className="font-mono text-[10px] text-slate-400 bg-slate-900 p-2 rounded block break-all border border-slate-800">
                  {data.signature_hash}
                </span>
              </div>
            </div>

            <div className="text-center text-[11px] text-slate-500 pt-2">
              Issued by NexCV Proof Engine. Candidate passed adaptive IRT diagnostic assessment.
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
