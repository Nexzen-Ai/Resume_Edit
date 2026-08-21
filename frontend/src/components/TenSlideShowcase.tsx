"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface SlideData {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  imageSrc: string;
  ctaText: string;
  ctaHref: string;
  accentColor: string;
}

const SLIDES: SlideData[] = [
  {
    id: 1,
    badge: "Module 1",
    title: "Atomic Fact-Graph Engine",
    subtitle: "Strict Zero-Hallucination Resume Constraints",
    description: "Traditional LLMs invent technologies or exaggerate experience. NexCV converts raw resume text into a directed Fact-Graph. Missing JD skills are strictly routed to testing instead of being hallucinated into experience.",
    bullets: [
      "Deconstructs resume into atomic JSON nodes",
      "Strict zero-hallucination constraint during framing",
      "Routes missing competencies to diagnostic testing"
    ],
    imageSrc: "/images/slide_1_fact_graph.png",
    ctaText: "Try Resume Optimizer",
    ctaHref: "/dashboard",
    accentColor: "from-cyan-500 to-blue-600"
  },
  {
    id: 2,
    badge: "Module 2",
    title: "Adaptive Diagnostic Test Engine",
    subtitle: "Item Response Theory (IRT) Practical Skill Testing",
    description: "When the system detects a competency gap between your resume and the target JD, it generates a 5-question targeted exam (MCQs + Situational Code/Architecture questions) to measure practical depth.",
    bullets: [
      "5 targeted diagnostic questions on missing skills",
      "Instant auto-grading with detailed answer rationales",
      "Score >= 80% unlocks official verification proof"
    ],
    imageSrc: "/images/slide_2_adaptive_test.png",
    ctaText: "Take Skill Assessment",
    ctaHref: "/dashboard/assessment",
    accentColor: "from-blue-500 to-indigo-600"
  },
  {
    id: 3,
    badge: "Module 3",
    title: "Cryptographic Verified Proof Badges",
    subtitle: "Recruiter Trust Moat & Public Proof URL",
    description: "Turn low YOE into proven capability. Passing diagnostic tests issues an HMAC SHA-256 signed proof badge and public URL (nexcv.me/verify/ID) that recruiters can audit instantly.",
    bullets: [
      "Cryptographic HMAC SHA-256 signature validation",
      "Public recruiter-facing proof page (/verify/[token])",
      "Injectable verified skill bullets for DOCX output"
    ],
    imageSrc: "/images/slide_3_skill_badge.png",
    ctaText: "View Public Proof Demo",
    ctaHref: "/verify/v_8f9a2b",
    accentColor: "from-emerald-400 to-teal-500"
  },
  {
    id: 4,
    badge: "Module 4",
    title: "Low-YOE STAR Interview Defense Studio",
    subtitle: "Defend Lower Years of Experience with Project Grounding",
    description: "Generate 3-5 high-stakes technical questions recruiters ask to probe low experience. Receive STAR (Situation, Task, Action, Result) frameworks mapped directly to your past projects.",
    bullets: [
      "Probing recruiter questions targeting low YOE",
      "Project-grounded STAR response frameworks",
      "Confidence building for phone screens and technical rounds"
    ],
    imageSrc: "/images/slide_4_star_defense.png",
    ctaText: "Prepare STAR Defense",
    ctaHref: "/dashboard/interview-prep",
    accentColor: "from-purple-500 to-indigo-600"
  },
  {
    id: 5,
    badge: "Module 5",
    title: "Transparent ATS Dual-Scan Simulator",
    subtitle: "Visual Layout & Keyword Frequency Heatmap",
    description: "Inspect your resume through the eyes of Applicant Tracking Systems (Workday, Lever, Greenhouse). Split-screen view displays raw parsed text streams alongside format drop-risk alerts.",
    bullets: [
      "Split-screen view: Raw parsed stream vs keyword score",
      "Line-by-line format drop risk detection (tabular whitespace, delimiters)",
      "Keyword frequency density & readability score"
    ],
    imageSrc: "/images/slide_5_ats_dualscan.png",
    ctaText: "Launch ATS Simulator",
    ctaHref: "/dashboard/ats-simulator",
    accentColor: "from-teal-400 to-cyan-500"
  },
  {
    id: 6,
    badge: "Module 6",
    title: "Campus Ambassador .edu Model",
    subtitle: "Student-Focused Free Bonus Credits",
    description: "Empowering university students and junior developers. Registering with a college or university email (.edu / .ac.in) automatically awards +10 free bonus credits.",
    bullets: [
      "Automatic domain verification for .edu / .ac.in emails",
      "Instant +10 free credits grant upon registration",
      "Democratized access for early career professionals"
    ],
    imageSrc: "/images/slide_6_campus_edu.png",
    ctaText: "Claim Student Credits",
    ctaHref: "/pricing#student",
    accentColor: "from-cyan-400 to-purple-500"
  },
  {
    id: 7,
    badge: "Module 7",
    title: "Reciprocal Viral Referral Loops",
    subtitle: "Dual Credits for Referrer & Referee",
    description: "Share your unique referral code NEX-XXXX with classmates and colleagues. When a friend signs up, both you and your friend receive +5 bonus credits instantly.",
    bullets: [
      "Unique referral tokens for every user account",
      "Reciprocal reward: +5 credits to referrer & referee",
      "Zero paywalls for active campus advocates"
    ],
    imageSrc: "/images/slide_7_referral_loops.png",
    ctaText: "Share & Earn Credits",
    ctaHref: "/pricing#referral",
    accentColor: "from-indigo-500 to-purple-600"
  },
  {
    id: 8,
    badge: "Module 8",
    title: "B2B Recruiter Candidate Pipeline",
    subtitle: "Pre-Verified Talent Marketplace",
    description: "Recruiters bypass resume clutter by searching NexCV's verified talent portal. Candidate test scores and cryptographic audit trails eliminate first-round screening friction.",
    bullets: [
      "Pre-verified candidate pool with audited test scores",
      "Reduced hiring cycle and phone screen dropouts",
      "Direct verification URL scanning via QR & link"
    ],
    imageSrc: "/images/slide_8_recruiter_b2b.png",
    ctaText: "Explore Recruiter Portal",
    ctaHref: "/verify/v_8f9a2b",
    accentColor: "from-emerald-500 to-cyan-600"
  },
  {
    id: 9,
    badge: "Module 9",
    title: "AI DOCX Layout Preservation",
    subtitle: "Targeted Bullet Additions Without Formatting Destruction",
    description: "Unlike basic resume builders that ruin custom Word layouts, NexCV applies targeted additions directly into your original DOCX XML structure while preserving fonts, margins, and headers.",
    bullets: [
      "Preserves original DOCX XML layout & custom styling",
      "No-op detection prevents returning duplicate output",
      "Fast background processing queue"
    ],
    imageSrc: "/images/slide_9_docx_engine.png",
    ctaText: "Tailor Resume DOCX",
    ctaHref: "/dashboard",
    accentColor: "from-blue-600 to-cyan-500"
  },
  {
    id: 10,
    badge: "Module 10",
    title: "Cryptographic Transparency & Security",
    subtitle: "Enterprise Data Handling & Audit Standards",
    description: "Your candidate data and uploaded resumes are protected with private Supabase S3 storage buckets, row-level security (RLS), and SHA-256 HMAC payload verification.",
    bullets: [
      "Private S3 storage buckets with strict access control",
      "HMAC SHA-256 cryptographic verification payload",
      "Complete data ownership & easy deletion"
    ],
    imageSrc: "/images/slide_10_security_hmac.png",
    ctaText: "Read Security Overview",
    ctaHref: "/privacy",
    accentColor: "from-slate-700 to-slate-900"
  }
];

export default function TenSlideShowcase() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = SLIDES[currentSlide];

  function nextSlide() {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }

  function prevSlide() {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 sm:pb-6 mb-6 sm:mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-2">
            <span>⚡ Interactive Platform Showcase ({slide.id} / 10)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">NexCV 10-Module Engine Ecosystem</h2>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <button
            onClick={prevSlide}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-lg border border-slate-700 transition-all cursor-pointer"
            title="Previous Feature"
          >
            ←
          </button>
          <span className="text-xs font-mono font-bold text-slate-400 px-2">
            {currentSlide + 1} / {SLIDES.length}
          </span>
          <button
            onClick={nextSlide}
            className="w-10 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center font-bold text-lg transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            title="Next Feature"
          >
            →
          </button>
        </div>
      </div>

      {/* Slide body */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
        <div className="space-y-4 sm:space-y-5">
          <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r ${slide.accentColor}`}>
            {slide.badge}
          </span>

          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{slide.title}</h3>
          <p className="text-xs font-semibold text-cyan-400">{slide.subtitle}</p>

          <p className="text-xs text-slate-300 leading-relaxed">{slide.description}</p>

          <ul className="space-y-2 text-xs text-slate-300 pt-1 sm:pt-2">
            {slide.bullets.map((b, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="pt-2 sm:pt-4">
            <Link
              href={slide.ctaHref}
              className={`inline-block w-full sm:w-auto text-center px-6 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r ${slide.accentColor} shadow-lg hover:opacity-95 transition-all`}
            >
              {slide.ctaText} →
            </Link>
          </div>
        </div>

        {/* 100% EXPLICIT NEXCV BRANDED HIGH-RES IMAGE FRAME */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-black/40 group mt-4 lg:mt-0">
          <Image
            src={slide.imageSrc}
            alt={slide.title}
            width={1200}
            height={750}
            className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 p-2 sm:p-3 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 text-[10px] sm:text-[11px] text-slate-300 flex justify-between items-center">
            <span className="font-semibold text-white truncate max-w-[200px] sm:max-w-none">{slide.title} — NexCV System Image</span>
            <span className="text-cyan-400 font-mono font-bold text-[9px] sm:text-[10px]">nexzen.me</span>
          </div>
        </div>
      </div>

      {/* Slide Indicators Dots */}
      <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-6 sm:mt-8 pt-4 border-t border-slate-800">
        {SLIDES.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 sm:h-2.5 rounded-full transition-all cursor-pointer ${
              currentSlide === idx ? "w-6 sm:w-8 bg-cyan-400" : "w-2 sm:w-2.5 bg-slate-700 hover:bg-slate-500"
            }`}
            title={`Go to slide ${s.id}: ${s.title}`}
          />
        ))}
      </div>
    </div>
  );
}
