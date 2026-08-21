"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";

interface STARFramework {
  situation: string;
  task: string;
  action: string;
  result: string;
}

interface QuestionItem {
  probe_area: string;
  question: string;
  star_framework: STARFramework;
}

export default function InterviewPrepPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchResumes();
  }, []);

  async function fetchResumes() {
    try {
      const res = await api.get("/resume/");
      setResumes(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedResumeId(res.data[0].resume_id);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleGeneratePrep() {
    if (!selectedResumeId || !jd.trim()) {
      setError("Please select a resume and paste the target job description.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/interview/generate", {
        resume_id: selectedResumeId,
        job_description: jd,
      });

      setQuestions(res.data.questions || []);
      setActiveTab(0);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to generate interview defense prep.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050a18] text-slate-100 font-sans">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-10">
        <header className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/30 text-purple-400 mb-3">
            <span>🎯 STAR Interview Defense Studio</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Low-YOE Candidate Interview Readiness
          </h1>
          <p className="mt-2 text-slate-400 text-sm max-w-2xl">
            Prepare for recruiter probing questions on lower years of experience. Get project-grounded STAR frameworks (Situation, Task, Action, Result) to defend your capabilities with confidence.
          </p>
        </header>

        {questions.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">
                1. Select Resume
              </label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              >
                {resumes.map((r) => (
                  <option key={r.resume_id} value={r.resume_id}>
                    {r.filename}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">
                2. Target Job Description
              </label>
              <textarea
                rows={6}
                placeholder="Paste the target job description here..."
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {error && <p className="text-xs text-rose-400 bg-rose-950/40 p-3 rounded-xl border border-rose-500/30">{error}</p>}

            <button
              onClick={handleGeneratePrep}
              disabled={loading || resumes.length === 0}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
            >
              {loading ? "Analyzing Experience Gaps (Costs 1 Credit)..." : "Generate STAR Interview Defense Frameworks (1 Credit)"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tabs for Questions */}
            <div className="flex gap-2 overflow-x-auto border-b border-slate-800 pb-2">
              {questions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    activeTab === idx
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                      : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  Question {idx + 1}
                </button>
              ))}
            </div>

            {/* Active Question Card */}
            {questions[activeTab] && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="space-y-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Probing Gap: {questions[activeTab].probe_area}
                  </span>
                  <h2 className="text-xl font-bold text-white pt-2">
                    "{questions[activeTab].question}"
                  </h2>
                </div>

                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Ideal Response Framework (STAR Method)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-indigo-400">S — Situation</span>
                      <p className="text-xs text-slate-300">{questions[activeTab].star_framework.situation}</p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-purple-400">T — Task</span>
                      <p className="text-xs text-slate-300">{questions[activeTab].star_framework.task}</p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-cyan-400">A — Action</span>
                      <p className="text-xs text-slate-300">{questions[activeTab].star_framework.action}</p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-emerald-400">R — Result</span>
                      <p className="text-xs text-slate-300">{questions[activeTab].star_framework.result}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setQuestions([])}
              className="w-full py-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white"
            >
              Analyze Another Job Description
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
