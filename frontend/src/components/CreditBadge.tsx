"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function CreditBadge() {
  const [balance, setBalance] = useState<number | null>(null);
  const [isEdu, setIsEdu] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [referralInput, setReferralInput] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCredits();
  }, []);

  async function fetchCredits() {
    try {
      const res = await api.get("/credits/balance");
      setBalance(res.data.credits_balance);
      setIsEdu(res.data.is_edu_verified);
      setReferralCode(res.data.referral_code);
    } catch (e) {
      console.error("Failed to load credits", e);
    }
  }

  async function handleVerifyEdu() {
    setLoading(true);
    setMsg("");
    try {
      const res = await api.post("/credits/verify-edu");
      setMsg(res.data.message);
      if (res.data.success) {
        fetchCredits();
      }
    } catch (err: any) {
      setMsg(err.response?.data?.detail || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleRedeemReferral() {
    if (!referralInput.trim()) return;
    setLoading(true);
    setMsg("");
    try {
      const res = await api.post("/credits/redeem-referral", { referral_code: referralInput });
      setMsg(res.data.message);
      if (res.data.success) {
        setReferralInput("");
        fetchCredits();
      }
    } catch (err: any) {
      setMsg(err.response?.data?.detail || "Redeem failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowModal(!showModal)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
        style={{
          background: "linear-gradient(135deg, rgba(0, 200, 255, 0.15), rgba(120, 0, 255, 0.15))",
          border: "1px solid rgba(0, 200, 255, 0.3)",
          color: "#00c8ff",
        }}
      >
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span>{balance !== null ? `${balance} Credits` : "Credits..."}</span>
      </button>

      {showModal && (
        <div
          className="absolute right-0 mt-3 w-80 p-5 rounded-2xl shadow-2xl z-50 border backdrop-blur-xl text-white"
          style={{
            background: "#080d1a",
            borderColor: "rgba(0, 200, 255, 0.2)",
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm text-cyan-400">NexCV Credit Balance</h3>
            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-xs">✕</button>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl mb-4 border border-slate-800 text-center">
            <p className="text-2xl font-black text-white">{balance ?? 0}</p>
            <p className="text-[11px] text-gray-400">Available Credits</p>
          </div>

          {/* Student EDU Bonus */}
          {!isEdu ? (
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 mb-4">
              <p className="text-xs font-semibold text-cyan-300">🎓 Student Bonus (+10 Credits)</p>
              <p className="text-[11px] text-gray-400 my-1">Signed up with a university/college email?</p>
              <button
                onClick={handleVerifyEdu}
                disabled={loading}
                className="w-full mt-2 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all"
              >
                {loading ? "Verifying..." : "Claim 10 Free Credits"}
              </button>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs mb-4 text-center font-medium">
              ✓ Educational Domain Verified (+10 Claimed)
            </div>
          )}

          {/* Reciprocal Referral */}
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30">
              <p className="text-xs font-semibold text-purple-300">🎁 Share Your Referral Code</p>

              <div className="flex items-center gap-2 mt-2">
                <input
                  readOnly
                  value={referralCode}
                  className="w-full text-xs font-mono bg-black/40 border border-purple-500/40 rounded px-2 py-1 text-purple-200 select-all"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(referralCode);
                    alert("Referral code copied!");
                  }}
                  className="text-xs px-2.5 py-1 rounded bg-purple-600 text-white font-medium hover:bg-purple-500"
                >
                  Copy
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Give 5 credits to a classmate, get 5 for yourself.</p>
            </div>

            <div className="pt-2">
              <p className="text-xs text-gray-300 mb-1">Have a referral code?</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  value={referralInput}
                  onChange={(e) => setReferralInput(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                />
                <button
                  onClick={handleRedeemReferral}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 rounded font-bold bg-purple-600 hover:bg-purple-500 text-white"
                >
                  Redeem
                </button>
              </div>
            </div>
          </div>

          {msg && <p className="text-xs mt-3 text-cyan-300 bg-slate-900 p-2 rounded text-center">{msg}</p>}
        </div>
      )}
    </div>
  );
}
