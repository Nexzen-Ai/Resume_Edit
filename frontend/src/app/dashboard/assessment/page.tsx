"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";

interface Question {
  id: string;
  type: string;
  question: string;
  options: string[];
}

interface Breakdown {
  question_id: string;
  question: string;
  selected_option_index: number;
  correct_option_index: number;
  is_correct: boolean;
  explanation: string;
}

export default function DiagnosticAssessmentPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [assessmentId, setAssessmentId] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [missingComps, setMissingComps] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: number }>({});

  const [gradingResult, setGradingResult] = useState<{
    score_percent: number;
    passed: boolean;
    verification_token?: string;
    verified_bullet?: string;
    breakdown: Breakdown[];
  } | null>(null);

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

  async function handleGenerateTest() {
    if (!selectedResumeId || !jd.trim()) {
      setError("Please select a resume and paste the target job description.");
      return;
    }
    setLoading(true);
    setError("");
    setGradingResult(null);

    try {
      const res = await api.post("/assessment/generate", {
        resume_id: selectedResumeId,
        job_description: jd,
      });

      setAssessmentId(res.data.assessment_id);
      setQuestions(res.data.questions || []);
      setMissingComps(res.data.missing_competencies || []);
      setUserAnswers({});
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to generate diagnostic test.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitTest() {
    if (Object.keys(userAnswers).length < questions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const answersPayload = Object.entries(userAnswers).map(([qId, idx]) => ({
        question_id: qId,
        selected_option_index: idx,
      }));

      const res = await api.post("/assessment/submit", {
        assessment_id: assessmentId,
        answers: answersPayload,
      });

      setGradingResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Submission failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050a18] text-slate-100 font-sans">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-10">
        <header className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-3">
            <span>⚡ Adaptive Competency Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Adaptive Skill Diagnostic Engine
          </h1>
          <p className="mt-2 text-slate-400 text-sm max-w-2xl">
            Turn low YOE into proven capability. Take a 5-question targeted diagnostic test on detected experience gaps. Pass with 80%+ to generate a shareable Verified Proof Badge for recruiters.
          </p>
        </header>

        {!questions.length && !gradingResult && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
                1. Select Target Resume
              </label>
              {resumes.length === 0 ? (
                <p className="text-xs text-amber-400 bg-amber-950/30 p-3 rounded-lg border border-amber-500/30">
                  No resume uploaded yet. Please upload a resume from the dashboard first.
                </p>
              ) : (
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  {resumes.map((r) => (
                    <option key={r.resume_id} value={r.resume_id}>
                      {r.filename} (Uploaded: {new Date(r.uploaded_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
                2. Target Job Description (JD)
              </label>
              <textarea
                rows={6}
                placeholder="Paste the full job description here..."
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {error && <p className="text-xs text-rose-400 bg-rose-950/40 p-3 rounded-xl border border-rose-500/30">{error}</p>}

            <button
              onClick={handleGenerateTest}
              disabled={loading || resumes.length === 0}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {loading ? "Analyzing Gaps & Generating Test (Costs 2 Credits)..." : "Generate Diagnostic Assessment (2 Credits)"}
            </button>
          </div>
        )}

        {/* Diagnostic Exam Step */}
        {questions.length > 0 && !gradingResult && (
          <div className="space-y-6">
            {missingComps.length > 0 && (
              <div className="bg-cyan-950/30 border border-cyan-500/30 p-4 rounded-xl">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                  Detected Competency Gaps:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {missingComps.map((m, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md text-xs bg-cyan-500/20 text-cyan-200 border border-cyan-500/40">
                      {m.skill} ({m.jd_importance})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {questions.map((q, qIndex) => (
              <div key={q.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-cyan-400">
                  <span>Question {qIndex + 1} of {questions.length}</span>
                  <span className="uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">{q.type}</span>
                </div>
                <h3 className="text-base font-semibold text-white">{q.question}</h3>

                <div className="space-y-2 pt-2">
                  {q.options.map((opt, optIdx) => (
                    <button
                      key={optIdx}
                      onClick={() => setUserAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                      className={`w-full text-left p-3.5 rounded-xl text-xs font-medium border transition-all ${
                        userAnswers[q.id] === optIdx
                          ? "bg-cyan-500/20 border-cyan-500 text-cyan-200 font-semibold"
                          : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <span className="inline-block w-6 text-slate-500 font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {error && <p className="text-xs text-rose-400 bg-rose-950/40 p-3 rounded-xl border border-rose-500/30">{error}</p>}

            <button
              onClick={handleSubmitTest}
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/20"
            >
              {loading ? "Grading Test & Generating Verification Certificate..." : "Submit Diagnostic Assessment"}
            </button>
          </div>
        )}

        {/* Grading & Verification Result */}
        {gradingResult && (
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl border text-center space-y-3 ${
              gradingResult.passed
                ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200"
                : "bg-amber-950/40 border-amber-500/50 text-amber-200"
            }`}>
              <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/10 uppercase tracking-widest">
                {gradingResult.passed ? "✓ COMPETENCY VERIFIED" : "COMPETENCY NOT YET VERIFIED"}
              </div>
              <h2 className="text-4xl font-black">{gradingResult.score_percent}%</h2>
              <p className="text-xs max-w-md mx-auto">
                {gradingResult.passed
                  ? "Congratulations! You passed the NexCV Diagnostic Exam (Score >= 80%). Your cryptographic skill verification proof link is ready below."
                  : "You achieved " + gradingResult.score_percent + "%. A score of 80% is required for official verification. Review the answer rationales below to sharpen your readiness."}
              </p>

              {gradingResult.passed && gradingResult.verification_token && (
                <div className="pt-4 max-w-lg mx-auto space-y-3 text-left bg-slate-900/90 p-4 rounded-xl border border-emerald-500/40 text-xs">
                  <p className="font-bold text-emerald-400">Shareable Verification Proof Link:</p>
                  <input
                    readOnly
                    value={`${window.location.origin}/verify/${gradingResult.verification_token}`}
                    className="w-full font-mono bg-black/60 border border-emerald-500/40 rounded p-2 text-emerald-300 select-all"
                  />
                  <a
                    href={`/verify/${gradingResult.verification_token}`}
                    target="_blank"
                    className="inline-block text-xs font-bold text-emerald-400 underline hover:text-emerald-300"
                  >
                    View Recruiter Verification Proof Page →
                  </a>

                  {gradingResult.verified_bullet && (
                    <div className="pt-2">
                      <p className="font-bold text-cyan-400">Injectable Resume Bullet:</p>
                      <p className="font-mono bg-black/60 p-2 rounded text-cyan-200 border border-cyan-500/30">
                        {gradingResult.verified_bullet}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Detailed Answer Breakdown:</h3>
              {gradingResult.breakdown.map((item, idx) => (
                <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-300">Question {idx + 1}</span>
                    <span className={`font-bold ${item.is_correct ? "text-emerald-400" : "text-rose-400"}`}>
                      {item.is_correct ? "✓ Correct" : "✕ Incorrect"}
                    </span>
                  </div>
                  <p className="text-xs text-white font-medium">{item.question}</p>
                  <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <strong className="text-cyan-400">Rationale:</strong> {item.explanation}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setQuestions([]);
                setGradingResult(null);
              }}
              className="w-full py-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white"
            >
              Take Another Diagnostic Assessment
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
