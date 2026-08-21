"use client";

import Link from "next/link";
import Image from "next/image";
import Brand from "@/components/Brand";
import TenSlideShowcase from "@/components/TenSlideShowcase";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { isLoggedIn } from "@/lib/auth";
import { Menu, X } from "lucide-react";
import {
  motion,
  useAnimate,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  useReducedMotion,
  stagger,
} from "motion/react";

const SKILLS = [
  { label: "React", color: "#00c8ff" },
  { label: "AWS", color: "#00e5a0" },
  { label: "Docker", color: "#7aa2ff" },
  { label: "GraphQL", color: "#ff9d5c" },
];

const delay = (s: number) => new Promise((r) => setTimeout(r, s * 1000));

export default function Landing() {
  const reduce = useReducedMotion() ?? false;
  const [scope, animate] = useAnimate();
  const [loggedIn, setLoggedIn] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const score = useMotionValue(34);
  const [scoreText, setScoreText] = useState(34);
  useMotionValueEvent(score, "change", (v) => setScoreText(Math.round(v)));
  const barWidth = useTransform(score, (v) => `${v}%`);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  useEffect(() => {
    if (reduce) {
      try {
        animate("#jd", { opacity: 1, x: 0 }, { duration: 0 });
        animate(".jd-kw", { backgroundColor: "rgba(0,200,255,0.22)", color: "#00c8ff" }, { duration: 0 });
        animate(".add-skill", { opacity: 1, scale: 1, y: 0 }, { duration: 0 });
        animate("#sum-line", { opacity: 1, height: "auto", marginBottom: 8 }, { duration: 0 });
        animate("#bullet", { opacity: 1, x: 0, height: "auto", marginTop: 2 }, { duration: 0 });
        animate("#bullet2", { opacity: 1, x: 0, height: "auto", marginTop: 2 }, { duration: 0 });
        animate("#migrate", { opacity: 0, height: 0 }, { duration: 0 });
        animate("#migrate2", { opacity: 1, height: "auto" }, { duration: 0 });
        score.set(94);
      } catch (e) {
        // ignore unmount
      }
      return;
    }

    let active = true;

    async function loop() {
      while (active) {
        try {
          // reset
          await animate("#paper", { opacity: 1 }, { duration: 0 });
          await animate("#track", { x: 0 }, { duration: 0 });
          await animate("#jd", { opacity: 0, x: 60 }, { duration: 0 });
          await animate("#beam-jd", { opacity: 0, top: -36 }, { duration: 0 });
          await animate("#beam-paper", { opacity: 0, top: -44 }, { duration: 0 });
          await animate(".jd-kw", { backgroundColor: "rgba(0,0,0,0)", color: "#7a90aa" }, { duration: 0 });
          await animate(".add-skill", { opacity: 0, scale: 0.8, y: 8 }, { duration: 0 });
          await animate("#sum-line", { opacity: 0, height: 0, marginBottom: 0 }, { duration: 0 });
          await animate("#bullet", { opacity: 0, x: -8, height: 0, marginTop: 0 }, { duration: 0 });
          await animate("#bullet2", { opacity: 0, x: -8, height: 0, marginTop: 0 }, { duration: 0 });
          await animate("#migrate", { opacity: 1, height: "auto" }, { duration: 0 });
          await animate("#migrate2", { opacity: 0, height: 0 }, { duration: 0 });
          score.set(34);
          if (!active) break;
          await delay(0.6);

          // 1. JD slides in
          await animate("#jd", { opacity: 1, x: 0 }, { duration: 0.6, ease: "easeOut" });
          await delay(0.35);

          // 2. scan the JD
          await animate("#beam-jd", { top: -36, opacity: 1 }, { duration: 0.2 });
          animate(".jd-kw", { backgroundColor: "rgba(0,200,255,0.22)", color: "#00c8ff" }, { delay: stagger(0.12), duration: 0.3 });
          await animate("#beam-jd", { top: 150 }, { duration: 1.1, ease: "easeInOut" });
          await animate("#beam-jd", { opacity: 0 }, { duration: 0.2 });

          // 3. scan page 1
          await animate("#beam-paper", { top: -44, opacity: 1 }, { duration: 0.2 });
          await animate("#beam-paper", { top: 400 }, { duration: 1.5, ease: "easeInOut" });
          await animate("#beam-paper", { opacity: 0 }, { duration: 0.25 });

          // 4. add page-1 edits, score climbs
          animate(score, 68, { duration: 1.8, ease: "easeOut" });
          await animate("#sum-line", { opacity: 1, height: "auto", marginBottom: 8 }, { duration: 0.5, ease: "easeOut" });
          await animate("#bullet", { opacity: 1, x: 0, height: "auto", marginTop: 2 }, { duration: 0.5, ease: "easeOut" });
          await animate("#bullet2", { opacity: 1, x: 0, height: "auto", marginTop: 2 }, { duration: 0.5, ease: "easeOut" });
          await delay(0.5);

          // page 1 full -> migrate to page 2
          await animate("#migrate", { opacity: 0, height: 0 }, { duration: 0.5, ease: "easeInOut" });
          await animate("#migrate2", { opacity: 1, height: "auto" }, { duration: 0.4, ease: "easeOut" });
          await delay(0.8);

          // 5. flip to page 2
          await animate("#track", { x: -280 }, { duration: 0.7, ease: [0.65, 0, 0.35, 1] });
          await delay(0.35);

          // 6. scan page 2
          await animate("#beam-paper", { top: -44, opacity: 1 }, { duration: 0.2 });
          await animate("#beam-paper", { top: 400 }, { duration: 1.4, ease: "easeInOut" });
          await animate("#beam-paper", { opacity: 0 }, { duration: 0.25 });

          // 7. add skills, score finishes 94%
          animate(score, 94, { duration: 1.6, ease: "easeOut" });
          await animate(
            ".add-skill",
            { opacity: 1, scale: 1, y: 0 },
            { delay: stagger(0.14), duration: 0.4, ease: "backOut" },
          );

          // 8. hold
          await delay(2.2);
          if (!active) break;

          // 9. outro reset
          await Promise.all([
            animate("#jd", { opacity: 0, x: 50 }, { duration: 0.6, ease: "easeIn" }),
            animate(".add-skill", { opacity: 0, y: 8 }, { duration: 0.5 }),
            animate(score, 34, { duration: 0.9, ease: "easeInOut" }),
          ]);
          await animate("#paper", { opacity: 0 }, { duration: 0.4 });
          await animate("#track", { x: 0 }, { duration: 0 });
          await animate("#sum-line", { opacity: 0, height: 0, marginBottom: 0 }, { duration: 0 });
          await animate("#bullet", { opacity: 0, height: 0, marginTop: 0 }, { duration: 0 });
          await animate("#bullet2", { opacity: 0, height: 0, marginTop: 0 }, { duration: 0 });
          await animate("#migrate", { opacity: 1, height: "auto" }, { duration: 0 });
          await animate("#migrate2", { opacity: 0, height: 0 }, { duration: 0 });
        } catch (err) {
          // catch unmount or animation interrupt safely
          break;
        }
      }
    }

    loop();
    return () => {
      active = false;
    };
  }, [reduce]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,200,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Glow orbs */}
      <div
        className="fixed top-0 right-0 w-[700px] h-[500px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(0,200,255,0.10) 0%, transparent 70%)" }}
      />
      <div
        className="fixed bottom-0 left-0 w-[600px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(0,102,255,0.08) 0%, transparent 70%)" }}
      />

      {/* Nav */}
      <nav className="relative z-50 border-b border-slate-800/80 px-4 sm:px-6 md:px-12 py-4 max-w-7xl mx-auto backdrop-blur-xl bg-[#030712]/90 flex items-center justify-between">
        <Brand href="/" size={36} wordmarkClass="text-lg" />

        <div className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
          <Link href="/features" className="hover:text-cyan-400 transition-colors">Features</Link>
          <Link href="/pricing" className="hover:text-cyan-400 transition-colors">Pricing & Credits</Link>
          <Link href="/terms" className="hover:text-cyan-400 transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {loggedIn ? (
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
                style={{ background: "linear-gradient(135deg, #00c8ff, #0066ff)", color: "#fff", boxShadow: "0 0 20px rgba(0,200,255,0.25)" }}
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileNavOpen ? <X className="w-6 h-6 text-cyan-400" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <div className="relative z-50 md:hidden border-b border-slate-800 bg-[#060b19] px-6 py-4 space-y-3">
          <div className="flex flex-col space-y-3 text-sm font-medium text-slate-300">
            <Link href="/features" onClick={() => setMobileNavOpen(false)} className="hover:text-cyan-400 transition-colors py-1">
              Features
            </Link>
            <Link href="/pricing" onClick={() => setMobileNavOpen(false)} className="hover:text-cyan-400 transition-colors py-1">
              Pricing & Credits
            </Link>
            <Link href="/terms" onClick={() => setMobileNavOpen(false)} className="hover:text-cyan-400 transition-colors py-1">
              Terms of Service
            </Link>
            <Link href="/privacy" onClick={() => setMobileNavOpen(false)} className="hover:text-cyan-400 transition-colors py-1">
              Privacy Policy
            </Link>
          </div>
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {loggedIn ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileNavOpen(false)}
                className="w-full py-3 rounded-xl text-xs font-extrabold bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-center shadow-lg"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileNavOpen(false)}
                  className="py-2.5 rounded-xl text-xs font-semibold text-center border border-slate-700 text-slate-300"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileNavOpen(false)}
                  className="py-2.5 rounded-xl text-xs font-bold text-center bg-cyan-500 text-slate-950"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Flagship Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-8 sm:py-12 lg:py-16">
        {/* Left: copy + quote */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-left"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold mb-4 sm:mb-6 border"
            style={{ background: "var(--accent-dim)", borderColor: "var(--border-bright)", color: "var(--accent)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            AI-Powered Resume Tailoring & Verification
          </div>

          <h1 className="text-3xl min-[400px]:text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight mb-4 sm:mb-6 text-white">
            Beat the bots.
            <br />
            Land the{" "}
            <span style={{ background: "linear-gradient(135deg, #00c8ff, #00e5a0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              interview.
            </span>
          </h1>

          <blockquote className="pl-3 sm:pl-4 border-l-2 mb-4 sm:mb-6 border-cyan-500">
            <p className="text-sm sm:text-base md:text-lg italic text-slate-300">
              &ldquo;Recruiters spend 6 seconds on a resume. Most are filtered by a bot before a human ever looks.&rdquo;
            </p>
          </blockquote>

          <p className="text-xs sm:text-sm md:text-base mb-6 sm:mb-8 max-w-lg text-slate-400 leading-relaxed">
            Upload your resume, paste any job description, and let AI inject the exact keywords recruiters and ATS systems
            scan for — your formatting untouched, your edge unfair.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <Link
              href={loggedIn ? "/dashboard" : "/register"}
              className="px-6 py-3.5 rounded-xl text-xs font-bold transition-all shadow-lg text-center"
              style={{ background: "linear-gradient(135deg, #00c8ff, #0066ff)", color: "#fff", boxShadow: "0 0 30px rgba(0,200,255,0.35)" }}
            >
              {loggedIn ? "Go to Dashboard →" : "Tailor my resume →"}
            </Link>
            {!loggedIn && (
              <Link
                href="/login"
                className="px-6 py-3.5 rounded-xl text-xs font-bold border border-slate-700 hover:border-slate-500 text-white text-center transition-all"
              >
                I have an account
              </Link>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-6 md:gap-8 mt-8 sm:mt-10 max-w-lg">
            {[
              { n: "98%", l: "ATS pass rate" },
              { n: "10s", l: "to tailor" },
              { n: "0", l: "reformatting" },
            ].map((s) => (
              <div key={s.l} className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-2.5 sm:p-3 text-center sm:text-left">
                <div className="text-xl sm:text-2xl font-extrabold text-white">{s.n}</div>
                <div className="text-[10px] sm:text-xs text-slate-400">{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: Live Interactive ATS Scanning Stage */}
        <motion.div
          className="relative flex justify-center items-center w-full max-w-full overflow-hidden py-2 sm:py-4"
          initial={reduce ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
        >
          <div className="w-full flex justify-center items-center h-[310px] min-[400px]:h-[360px] min-[520px]:h-[440px] lg:h-[480px]">
            <div
              ref={scope}
              className="relative origin-center sm:origin-top scale-[0.50] min-[400px]:scale-[0.62] min-[520px]:scale-[0.78] sm:scale-90 lg:scale-100 transition-transform duration-300"
              style={{ width: 560, height: 480 }}
            >
              {/* Resume document */}
            <div
              id="paper"
              className="absolute rounded-sm overflow-hidden"
              style={{
                left: 10,
                top: 45,
                width: 280,
                height: 396,
                background: "#ffffff",
                color: "#1f2430",
                fontFamily: "Georgia, 'Times New Roman', serif",
                boxShadow: "0 0 50px rgba(0,200,255,0.12), 0 30px 80px rgba(0,0,0,0.55)",
              }}
            >
              <motion.div id="track" className="flex h-full" style={{ width: 560 }}>
                {/* PAGE 1 */}
                <div className="relative px-5 py-5" style={{ width: 280, height: 396 }}>
                  <div className="text-center border-b pb-2 mb-2.5" style={{ borderColor: "#d7dbe4" }}>
                    <div className="text-[16px] font-bold tracking-[0.04em]" style={{ color: "#11151f" }}>AKHIRANSH KUMAR</div>
                    <div className="text-[9.5px] font-semibold tracking-[0.18em] mt-0.5" style={{ color: "#3b6fd4" }}>SOFTWARE ENGINEER</div>
                    <div className="text-[7px] mt-1 whitespace-nowrap" style={{ color: "#7a8090" }}>
                      akhiransh.kumar@email.com · Bengaluru · in/akhiransh
                    </div>
                  </div>

                  <div className="text-[9px] font-bold tracking-[0.16em] pb-0.5 mb-1.5 border-b" style={{ color: "#11151f", borderColor: "#e6e9f0" }}>SUMMARY</div>
                  <p className="text-[8.5px] leading-[1.55] mb-1 text-justify" style={{ color: "#3a3f4b" }}>
                    Software engineer with 4+ years building responsive, accessible web applications and scalable design
                    systems for high-traffic products.
                  </p>
                  <p
                    id="sum-line"
                    className="text-[8.5px] leading-[1.55] px-1 rounded text-justify"
                    style={{ opacity: 0, height: 0, marginBottom: 0, overflow: "hidden", color: "#0d5c4a", background: "rgba(0,229,160,0.18)" }}
                  >
                    Specialized in <b>React</b>, <b>AWS</b>, <b>Docker</b> and <b>GraphQL</b>, shipping containerized
                    services at production scale.
                  </p>

                  <div className="text-[9px] font-bold tracking-[0.16em] pb-0.5 mt-2.5 mb-1.5 border-b" style={{ color: "#11151f", borderColor: "#e6e9f0" }}>EXPERIENCE</div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[9.5px] font-bold" style={{ color: "#1f2430" }}>Nexzen Labs</span>
                    <span className="text-[7.5px]" style={{ color: "#7a8090" }}>2022 — Present</span>
                  </div>
                  <div className="text-[8px] italic mb-1" style={{ color: "#5a6070" }}>Software Engineer · Bengaluru</div>
                  <ul className="space-y-0.5 mb-1.5">
                    <li className="flex gap-1.5 text-[8.5px] leading-[1.5]" style={{ color: "#3a3f4b" }}>
                      <span style={{ color: "#3b6fd4" }}>▪</span>
                      <span>Led the UI rebuild that cut initial load time by 40%.</span>
                    </li>
                    <li className="flex gap-1.5 text-[8.5px] leading-[1.5]" style={{ color: "#3a3f4b" }}>
                      <span style={{ color: "#3b6fd4" }}>▪</span>
                      <span>Mentored 3 engineers and owned the shared component library.</span>
                    </li>
                    <li className="flex gap-1.5 text-[8.5px] leading-[1.5]" style={{ color: "#3a3f4b" }}>
                      <span style={{ color: "#3b6fd4" }}>▪</span>
                      <span>Drove the migration to a typed, test-covered codebase.</span>
                    </li>
                    <li id="bullet" className="flex gap-1.5 text-[8.5px] leading-[1.5] px-1 rounded" style={{ opacity: 0, height: 0, marginTop: 0, overflow: "hidden", color: "#0d5c4a", background: "rgba(0,200,255,0.16)" }}>
                      <span style={{ color: "#00a37a" }}>▪</span>
                      <span>Deployed containerized microservices on <b>AWS</b> using <b>Docker</b>.</span>
                    </li>
                  </ul>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[9.5px] font-bold" style={{ color: "#1f2430" }}>Infosys</span>
                    <span className="text-[7.5px]" style={{ color: "#7a8090" }}>2020 — 2022</span>
                  </div>
                  <div className="text-[8px] italic mb-1" style={{ color: "#5a6070" }}>Associate Developer · Hyderabad</div>
                  <ul className="space-y-0.5">
                    <li className="flex gap-1.5 text-[8.5px] leading-[1.5]" style={{ color: "#3a3f4b" }}>
                      <span style={{ color: "#3b6fd4" }}>▪</span>
                      <span>Shipped 20+ features across 3 enterprise client portals.</span>
                    </li>
                    <li id="bullet2" className="flex gap-1.5 text-[8.5px] leading-[1.5] px-1 rounded" style={{ opacity: 0, height: 0, marginTop: 0, overflow: "hidden", color: "#0d5c4a", background: "rgba(0,200,255,0.16)" }}>
                      <span style={{ color: "#00a37a" }}>▪</span>
                      <span>Built reusable <b>React</b> components, cutting delivery time 30%.</span>
                    </li>
                  </ul>

                  <div id="migrate" style={{ overflow: "hidden" }}>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[9.5px] font-bold" style={{ color: "#1f2430" }}>Freelance</span>
                      <span className="text-[7.5px]" style={{ color: "#7a8090" }}>2019 — 2020</span>
                    </div>
                    <div className="text-[8px] italic mb-1" style={{ color: "#5a6070" }}>Web Developer · Remote</div>
                    <ul className="space-y-0.5">
                      <li className="flex gap-1.5 text-[8.5px] leading-[1.5]" style={{ color: "#3a3f4b" }}>
                        <span style={{ color: "#3b6fd4" }}>▪</span>
                        <span>Delivered 8+ marketing sites for early-stage startups.</span>
                      </li>
                      <li className="flex gap-1.5 text-[8.5px] leading-[1.5]" style={{ color: "#3a3f4b" }}>
                        <span style={{ color: "#3b6fd4" }}>▪</span>
                        <span>Set up CI/CD pipelines that automated every release.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="absolute bottom-2 right-3 text-[6.5px] tracking-wider" style={{ color: "#aeb4c0" }}>1 / 2</div>
                </div>

                {/* PAGE 2 */}
                <div className="relative px-5 py-5" style={{ width: 280, height: 396 }}>
                  <div id="migrate2" style={{ opacity: 0, height: 0, overflow: "hidden" }}>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[9.5px] font-bold" style={{ color: "#1f2430" }}>Freelance</span>
                      <span className="text-[7.5px]" style={{ color: "#7a8090" }}>2019 — 2020</span>
                    </div>
                    <div className="text-[8px] italic mb-1" style={{ color: "#5a6070" }}>Web Developer · Remote</div>
                    <ul className="space-y-0.5 mb-2.5">
                      <li className="flex gap-1.5 text-[8.5px] leading-[1.5]" style={{ color: "#3a3f4b" }}>
                        <span style={{ color: "#3b6fd4" }}>▪</span>
                        <span>Delivered 8+ marketing sites for early-stage startups.</span>
                      </li>
                      <li className="flex gap-1.5 text-[8.5px] leading-[1.5]" style={{ color: "#3a3f4b" }}>
                        <span style={{ color: "#3b6fd4" }}>▪</span>
                        <span>Set up CI/CD pipelines that automated every release.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="text-[9px] font-bold tracking-[0.16em] pb-0.5 mb-1.5 border-b" style={{ color: "#11151f", borderColor: "#e6e9f0" }}>PROJECTS</div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[9px] font-bold" style={{ color: "#1f2430" }}>Resume Tailor</span>
                    <span className="text-[7.5px]" style={{ color: "#7a8090" }}>2024</span>
                  </div>
                  <ul className="space-y-0.5 mb-1.5">
                    <li className="flex gap-1.5 text-[8.5px] leading-[1.5]" style={{ color: "#3a3f4b" }}>
                      <span style={{ color: "#3b6fd4" }}>▪</span>
                      <span>AI tool that tailors resumes to any job description.</span>
                    </li>
                  </ul>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[9px] font-bold" style={{ color: "#1f2430" }}>Analytics Dashboard</span>
                    <span className="text-[7.5px]" style={{ color: "#7a8090" }}>2023</span>
                  </div>
                  <ul className="space-y-0.5">
                    <li className="flex gap-1.5 text-[8.5px] leading-[1.5]" style={{ color: "#3a3f4b" }}>
                      <span style={{ color: "#3b6fd4" }}>▪</span>
                      <span>Real-time metrics for 50k+ daily active users.</span>
                    </li>
                  </ul>

                  <div className="text-[9px] font-bold tracking-[0.16em] pb-0.5 mt-2.5 mb-1.5 border-b" style={{ color: "#11151f", borderColor: "#e6e9f0" }}>EDUCATION</div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[8.5px] font-semibold" style={{ color: "#1f2430" }}>B.Tech, Computer Science — VIT</span>
                    <span className="text-[7.5px]" style={{ color: "#7a8090" }}>2020</span>
                  </div>
                  <div className="text-[7.5px] mt-0.5" style={{ color: "#5a6070" }}>CGPA 8.6 / 10</div>

                  <div className="text-[9px] font-bold tracking-[0.16em] pb-0.5 mt-2.5 mb-1.5 border-b" style={{ color: "#11151f", borderColor: "#e6e9f0" }}>SKILLS</div>
                  <div className="flex flex-wrap gap-1.5 items-center min-h-[22px]">
                    <span className="text-[8px]" style={{ color: "#5a6070" }}>Python · SQL · Git ·</span>
                    {SKILLS.map((k) => (
                      <span
                        key={k.label}
                        className="add-skill px-1.5 py-0.5 rounded text-[8px] font-sans font-semibold"
                        style={{ opacity: 0, color: "#fff", background: k.color }}
                      >
                        {k.label}
                      </span>
                    ))}
                  </div>

                  <div className="text-[9px] font-bold tracking-[0.16em] pb-0.5 mt-2.5 mb-1.5 border-b" style={{ color: "#11151f", borderColor: "#e6e9f0" }}>CERTIFICATIONS</div>
                  <div className="text-[8.5px]" style={{ color: "#3a3f4b" }}>AWS Certified Developer — Associate</div>

                  <div className="absolute bottom-2 right-3 text-[6.5px] tracking-wider" style={{ color: "#aeb4c0" }}>2 / 2</div>
                </div>
              </motion.div>

              {/* scan beam */}
              <div
                id="beam-paper"
                className="absolute left-0 right-0 h-11 pointer-events-none"
                style={{
                  top: -44,
                  opacity: 0,
                  background: "linear-gradient(to bottom, transparent, rgba(0,200,255,0.16) 42%, rgba(0,229,160,0.28) 50%, rgba(0,200,255,0.16) 58%, transparent)",
                }}
              >
                <div className="absolute bottom-1/2 left-0 right-0 h-px" style={{ background: "var(--accent)", boxShadow: "0 0 12px var(--accent)" }} />
              </div>
            </div>

            {/* JD source card */}
            <div
              id="jd"
              className="absolute rounded-xl p-3 border overflow-hidden"
              style={{
                left: 330,
                top: 10,
                width: 220,
                opacity: 0,
                background: "var(--card)",
                borderColor: "var(--border)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.45)",
              }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Job Description
                </span>
              </div>
              <p className="text-[8px] leading-[1.6] text-slate-300">
                Hiring a <b className="jd-kw font-bold">Software Engineer</b> to build scalable web apps with{" "}
                <b className="jd-kw font-bold">React</b> and <b className="jd-kw font-bold">GraphQL</b>. You will containerize services
                using <b className="jd-kw font-bold">Docker</b>, deploy on <b className="jd-kw font-bold">AWS</b>, and own{" "}
                <b className="jd-kw font-bold">CI/CD</b> pipelines for fast, reliable releases.
              </p>

              <div
                id="beam-jd"
                className="absolute left-0 right-0 h-9 pointer-events-none"
                style={{
                  top: -36,
                  opacity: 0,
                  background: "linear-gradient(to bottom, transparent, rgba(0,200,255,0.16) 42%, rgba(0,229,160,0.28) 50%, rgba(0,200,255,0.16) 58%, transparent)",
                }}
              >
                <div className="absolute bottom-1/2 left-0 right-0 h-px" style={{ background: "var(--accent)", boxShadow: "0 0 12px var(--accent)" }} />
              </div>
            </div>

            {/* ATS match card */}
            <div
              className="absolute rounded-xl p-3.5 border bg-slate-900 border-slate-700 shadow-2xl"
              style={{
                left: 360,
                top: 230,
                width: 180,
              }}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-400">ATS Match</div>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-3xl font-extrabold leading-none tabular-nums text-emerald-400">
                  {scoreText}
                </span>
                <span className="text-lg font-bold mb-0.5 text-emerald-400">%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden bg-slate-800">
                <motion.div className="h-full rounded-full" style={{ width: barWidth, background: "linear-gradient(90deg, #00c8ff, #00e5a0)" }} />
              </div>
            </div>

          </div>
          </div>
        </motion.div>
      </main>

      {/* CONTINUOUS FLOW SECTION STRUCTURE */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 space-y-12 sm:space-y-20 py-8 sm:py-12">
        {/* STUDENT CAREER ACCELERATION SECTION */}
        <section className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-cyan-950/60 border border-purple-500/30 rounded-3xl p-5 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
            <div className="space-y-3">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                🎓 University & Early Career Advantage
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight glow-text-purple">
                Why Students & Early-Career Engineers Win with NexCV
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Most candidate resumes are rejected by ATS bots within 6 seconds due to strict low-YOE (Years of Experience) filters. NexCV bridges this gap by validating your actual skills through adaptive IRT tests and generating recruiter-verifiable cryptographic badges.
              </p>
            </div>
            <Link
              href="/pricing#student"
              className="px-6 py-3.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white transition-all shrink-0 shadow-lg shadow-purple-500/20 text-center w-full sm:w-auto"
            >
              Claim +10 Student Credits →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 pt-4 border-t border-slate-800 text-xs">
            <div className="space-y-2">
              <div className="font-bold text-white text-sm">1. Verification Over Inflation</div>
              <p className="text-slate-400">Instead of lying on your resume, prove your skill with a 5-question adaptive quiz and attach an audited HMAC link.</p>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-white text-sm">2. STAR Interview Defense</div>
              <p className="text-slate-400">Prepare for tough recruiter probing questions on low experience with STAR response frameworks grounded in your real projects.</p>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-white text-sm">3. Zero Paywalls for Advocates</div>
              <p className="text-slate-400">Earn +10 credits with your .edu email and +5 credits for every classmate who joins using your referral token.</p>
            </div>
          </div>
        </section>

        {/* 10-SLIDE INTERACTIVE SHOWCASE (WITH 10 DISTINCT UNIQUE IMAGES) */}
        <section>
          <TenSlideShowcase />
        </section>

        {/* INTERNAL ENGINE MECHANICS SECTION */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-8 space-y-6 sm:space-y-8 shadow-2xl">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              ⚙️ Under The Hood
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight glow-text-cyan">
              Internal System Mechanics: How NexCV Works
            </h2>
            <p className="text-xs text-slate-400">
              Step-by-step breakdown of our zero-hallucination candidate verification pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-xs">
            <div className="bg-slate-950 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 font-black flex items-center justify-center text-xs">01</div>
              <h3 className="font-bold text-white text-sm">Fact-Graph Extraction</h3>
              <p className="text-slate-400 leading-relaxed">Converts raw DOCX text into atomic JSON nodes. Compares nodes against target JD skills.</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 font-black flex items-center justify-center text-xs">02</div>
              <h3 className="font-bold text-white text-sm">IRT Skill Assessment</h3>
              <p className="text-slate-400 leading-relaxed">Routes detected skill gaps to an adaptive 5-question exam with instant auto-grading.</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-xs">03</div>
              <h3 className="font-bold text-white text-sm">HMAC Proof Token</h3>
              <p className="text-slate-400 leading-relaxed">Scores &ge; 80% generate an HMAC SHA-256 signed proof badge and public verification link.</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 font-black flex items-center justify-center text-xs">04</div>
              <h3 className="font-bold text-white text-sm">Recruiter Pipeline</h3>
              <p className="text-slate-400 leading-relaxed">Recruiters scan candidate proofs directly, bypassing first-round resume screening dropouts.</p>
            </div>
          </div>
        </section>

        {/* SIDE-BY-SIDE VISUAL MODULE 1: FACT-GRAPH DEEP-DIVE */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center bg-slate-900/40 border border-slate-800 p-5 sm:p-8 rounded-3xl">
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              🛡️ Zero Hallucinations
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white glow-text-cyan">Atomic Fact-Graph Customization</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Standard LLMs fabricate technologies and exaggerate years of experience. NexCV deconstructs your resume into atomic facts. Missing skills are strictly routed to testing rather than hallucinated onto experience.
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2 text-cyan-400 font-medium">✓ Zero-hallucination framing constraint</li>
              <li className="flex items-center gap-2 text-cyan-400 font-medium">✓ Adaptive IRT skill testing on missing skills</li>
              <li className="flex items-center gap-2 text-cyan-400 font-medium">✓ Cryptographic verification tokens & badges</li>
            </ul>
            <Link
              href={loggedIn ? "/dashboard" : "/register"}
              className="inline-block w-full sm:w-auto text-center px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all mt-2"
            >
              Explore Fact-Graph Tailoring →
            </Link>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-black/40 p-2">
            <Image
              src="/images/slide_1_fact_graph.png"
              alt="Fact Graph Module UI"
              width={600}
              height={400}
              className="w-full h-auto object-cover rounded-xl"
            />
          </div>
        </section>

        {/* SIDE-BY-SIDE VISUAL MODULE 2: ATS SIMULATOR */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center bg-slate-900/40 border border-slate-800 p-5 sm:p-8 rounded-3xl">
          <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-black/40 p-2 order-2 md:order-1">
            <Image
              src="/images/slide_5_ats_dualscan.png"
              alt="ATS Simulator UI"
              width={600}
              height={400}
              className="w-full h-auto object-cover rounded-xl"
            />
          </div>

          <div className="space-y-4 order-1 md:order-2">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              🔬 Dual-Scan Technology
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Transparent ATS Parser & Keyword Heatmap</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Don't guess what Applicant Tracking Systems see. Inspect your raw text stream side-by-side with format drop-risk alerts for Workday, Lever, and Greenhouse.
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2 text-emerald-400 font-medium">✓ Real-time line parsing stream</li>
              <li className="flex items-center gap-2 text-emerald-400 font-medium">✓ Tabular & character delimiter warning badges</li>
              <li className="flex items-center gap-2 text-emerald-400 font-medium">✓ Core ATS keyword match density calculation</li>
            </ul>
            <Link
              href={loggedIn ? "/dashboard/ats-simulator" : "/register"}
              className="inline-block w-full sm:w-auto text-center px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-400 hover:bg-emerald-300 text-slate-950 transition-all mt-2"
            >
              Test Your Resume ATS Score →
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
