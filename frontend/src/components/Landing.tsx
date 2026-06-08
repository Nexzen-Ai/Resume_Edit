"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

  const score = useMotionValue(34);
  const [scoreText, setScoreText] = useState(34);
  useMotionValueEvent(score, "change", (v) => setScoreText(Math.round(v)));
  const barWidth = useTransform(score, (v) => `${v}%`);

  useEffect(() => {
    if (reduce) {
      animate("#jd", { opacity: 1, x: 0 }, { duration: 0 });
      animate(".jd-kw", { backgroundColor: "rgba(0,200,255,0.22)", color: "#00c8ff" }, { duration: 0 });
      animate(".add-skill", { opacity: 1, scale: 1, y: 0 }, { duration: 0 });
      animate("#sum-line", { opacity: 1, height: "auto", marginBottom: 8 }, { duration: 0 });
      animate("#bullet", { opacity: 1, x: 0, height: "auto", marginTop: 2 }, { duration: 0 });
      animate("#bullet2", { opacity: 1, x: 0, height: "auto", marginTop: 2 }, { duration: 0 });
      animate("#migrate", { opacity: 0, height: 0 }, { duration: 0 });
      animate("#migrate2", { opacity: 1, height: "auto" }, { duration: 0 });
      score.set(94);
      return;
    }

    let active = true;

    async function loop() {
      while (active) {
        // ── reset (hidden state, page 1) ──
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

        // ── 1. JD slides in ──
        await animate("#jd", { opacity: 1, x: 0 }, { duration: 0.6, ease: "easeOut" });
        await delay(0.35);

        // ── 2. scan the JD, extract & highlight keywords ──
        await animate("#beam-jd", { top: -36, opacity: 1 }, { duration: 0.2 });
        animate(".jd-kw", { backgroundColor: "rgba(0,200,255,0.22)", color: "#00c8ff" }, { delay: stagger(0.12), duration: 0.3 });
        await animate("#beam-jd", { top: 150 }, { duration: 1.1, ease: "easeInOut" });
        await animate("#beam-jd", { opacity: 0 }, { duration: 0.2 });

        // ── 3. scan page 1 ──
        await animate("#beam-paper", { top: -44, opacity: 1 }, { duration: 0.2 });
        await animate("#beam-paper", { top: 400 }, { duration: 1.5, ease: "easeInOut" });
        await animate("#beam-paper", { opacity: 0 }, { duration: 0.25 });

        // ── 4. add page-1 edits (summary + both org bullets), score climbs ──
        animate(score, 68, { duration: 1.8, ease: "easeOut" });
        await animate("#sum-line", { opacity: 1, height: "auto", marginBottom: 8 }, { duration: 0.5, ease: "easeOut" });
        await animate("#bullet", { opacity: 1, x: 0, height: "auto", marginTop: 2 }, { duration: 0.5, ease: "easeOut" });
        await animate("#bullet2", { opacity: 1, x: 0, height: "auto", marginTop: 2 }, { duration: 0.5, ease: "easeOut" });
        await delay(0.5);

        // page 1 is now full → Freelance no longer fits, push it to page 2
        await animate("#migrate", { opacity: 0, height: 0 }, { duration: 0.5, ease: "easeInOut" });
        await animate("#migrate2", { opacity: 1, height: "auto" }, { duration: 0.4, ease: "easeOut" });
        await delay(0.8);

        // ── 5. flip to page 2 ──
        await animate("#track", { x: -280 }, { duration: 0.7, ease: [0.65, 0, 0.35, 1] });
        await delay(0.35);

        // ── 6. scan page 2 ──
        await animate("#beam-paper", { top: -44, opacity: 1 }, { duration: 0.2 });
        await animate("#beam-paper", { top: 400 }, { duration: 1.4, ease: "easeInOut" });
        await animate("#beam-paper", { opacity: 0 }, { duration: 0.25 });

        // ── 7. add skills, score finishes 90+ ──
        animate(score, 94, { duration: 1.6, ease: "easeOut" });
        await animate(
          ".add-skill",
          { opacity: 1, scale: 1, y: 0 },
          { delay: stagger(0.14), duration: 0.4, ease: "backOut" },
        );

        // ── 8. hold the tailored 2-page result ──
        await delay(2.2);
        if (!active) break;

        // ── 9. outro: fade JD + skills, score down, then masked reset to page 1 ──
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
      }
    }

    loop();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "var(--background)" }}>
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
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #00c8ff, #0066ff)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div className="absolute inset-0 rounded-xl blur-md opacity-40" style={{ background: "linear-gradient(135deg, #00c8ff, #0066ff)" }} />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Resume<span style={{ color: "var(--accent)" }}>Tailor</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors hover:bg-white/5" style={{ color: "var(--muted-light)" }}>
            Sign in
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "linear-gradient(135deg, #00c8ff, #0066ff)", color: "#fff", boxShadow: "0 0 20px rgba(0,200,255,0.25)" }}
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-12 items-center py-12 lg:py-20">
        {/* ── Left: copy + quote ── */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border"
            style={{ background: "var(--accent-dim)", borderColor: "var(--border-bright)", color: "var(--accent)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
            AI-Powered Resume Tailoring
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6">
            Beat the bots.
            <br />
            Land the{" "}
            <span style={{ background: "linear-gradient(135deg, #00c8ff, #00e5a0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              interview.
            </span>
          </h1>

          <blockquote className="pl-4 border-l-2 mb-6" style={{ borderColor: "var(--accent)" }}>
            <p className="text-base md:text-lg italic" style={{ color: "var(--muted-light)" }}>
              &ldquo;Recruiters spend 6 seconds on a resume. Most are filtered by a bot before a human ever looks.&rdquo;
            </p>
          </blockquote>

          <p className="text-base md:text-lg mb-8 max-w-lg" style={{ color: "var(--muted-light)" }}>
            Upload your resume, paste any job description, and let AI inject the exact keywords recruiters and ATS systems
            scan for — your formatting untouched, your edge unfair.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/register"
              className="px-6 py-3.5 rounded-xl text-sm font-bold transition-all"
              style={{ background: "linear-gradient(135deg, #00c8ff, #0066ff)", color: "#fff", boxShadow: "0 0 30px rgba(0,200,255,0.35)" }}
            >
              Tailor my resume →
            </Link>
            <Link
              href="/login"
              className="px-6 py-3.5 rounded-xl text-sm font-bold border transition-all hover:bg-white/5"
              style={{ borderColor: "var(--border-bright)", color: "var(--foreground)" }}
            >
              I have an account
            </Link>
          </div>

          <div className="flex items-center gap-8 mt-10">
            {[
              { n: "98%", l: "ATS pass rate" },
              { n: "10s", l: "to tailor" },
              { n: "0", l: "reformatting" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-2xl font-extrabold" style={{ color: "var(--foreground)" }}>{s.n}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Right: scanning animation stage ── */}
        <motion.div
          className="relative flex justify-center"
          initial={reduce ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
        >
          <div
            ref={scope}
            className="relative origin-top scale-[0.62] sm:scale-90 lg:scale-100"
            style={{ width: 560, height: 480 }}
          >
            {/* Resume document — A4 white paper (2 pages, flips) */}
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
              {/* sliding track: [page 1][page 2] */}
              <motion.div id="track" className="flex h-full" style={{ width: 560 }}>
                {/* ── PAGE 1 ── */}
                <div className="relative px-5 py-5" style={{ width: 280, height: 396 }}>
                  {/* header */}
                  <div className="text-center border-b pb-2 mb-2.5" style={{ borderColor: "#d7dbe4" }}>
                    <div className="text-[16px] font-bold tracking-[0.04em]" style={{ color: "#11151f" }}>AKHIRANSH KUMAR</div>
                    <div className="text-[9.5px] font-semibold tracking-[0.18em] mt-0.5" style={{ color: "#3b6fd4" }}>SOFTWARE ENGINEER</div>
                    <div className="text-[7px] mt-1 whitespace-nowrap" style={{ color: "#7a8090" }}>
                      akhiransh.kumar@email.com&nbsp;·&nbsp;Bengaluru&nbsp;·&nbsp;in/akhiransh
                    </div>
                  </div>

                  {/* SUMMARY */}
                  <div className="text-[9px] font-bold tracking-[0.16em] pb-0.5 mb-1.5 border-b" style={{ color: "#11151f", borderColor: "#e6e9f0" }}>SUMMARY</div>
                  <p className="text-[8.5px] leading-[1.55] mb-1 text-justify" style={{ color: "#3a3f4b" }}>
                    Software engineer with 4+ years building responsive, accessible web applications and scalable design
                    systems for high-traffic products.
                  </p>
                  {/* added summary sentence */}
                  <p
                    id="sum-line"
                    className="text-[8.5px] leading-[1.55] px-1 rounded text-justify"
                    style={{ opacity: 0, height: 0, marginBottom: 0, overflow: "hidden", color: "#0d5c4a", background: "rgba(0,229,160,0.18)" }}
                  >
                    Specialized in <b>React</b>, <b>AWS</b>, <b>Docker</b> and <b>GraphQL</b>, shipping containerized
                    services at production scale.
                  </p>

                  {/* EXPERIENCE */}
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
                    {/* added bullet */}
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
                    {/* added bullet — second org */}
                    <li id="bullet2" className="flex gap-1.5 text-[8.5px] leading-[1.5] px-1 rounded" style={{ opacity: 0, height: 0, marginTop: 0, overflow: "hidden", color: "#0d5c4a", background: "rgba(0,200,255,0.16)" }}>
                      <span style={{ color: "#00a37a" }}>▪</span>
                      <span>Built reusable <b>React</b> components, cutting delivery time 30%.</span>
                    </li>
                  </ul>

                  {/* Freelance — fills page 1; pushed to page 2 once edits are added */}
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

                {/* ── PAGE 2 ── */}
                <div className="relative px-5 py-5" style={{ width: 280, height: 396 }}>
                  {/* Freelance moved here from page 1 after editing */}
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

                  {/* PROJECTS */}
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

                  {/* EDUCATION */}
                  <div className="text-[9px] font-bold tracking-[0.16em] pb-0.5 mt-2.5 mb-1.5 border-b" style={{ color: "#11151f", borderColor: "#e6e9f0" }}>EDUCATION</div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[8.5px] font-semibold" style={{ color: "#1f2430" }}>B.Tech, Computer Science — VIT</span>
                    <span className="text-[7.5px]" style={{ color: "#7a8090" }}>2020</span>
                  </div>
                  <div className="text-[7.5px] mt-0.5" style={{ color: "#5a6070" }}>CGPA 8.6 / 10</div>

                  {/* SKILLS */}
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

                  {/* CERTIFICATIONS */}
                  <div className="text-[9px] font-bold tracking-[0.16em] pb-0.5 mt-2.5 mb-1.5 border-b" style={{ color: "#11151f", borderColor: "#e6e9f0" }}>CERTIFICATIONS</div>
                  <div className="text-[8.5px]" style={{ color: "#3a3f4b" }}>AWS Certified Developer — Associate</div>

                  <div className="absolute bottom-2 right-3 text-[6.5px] tracking-wider" style={{ color: "#aeb4c0" }}>2 / 2</div>
                </div>
              </motion.div>

              {/* scan beam — clipped to the page */}
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

            {/* JD source card (top-right) — full job description */}
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
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--error)" }} />
                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--muted-light)" }}>
                  Job Description
                </span>
              </div>
              <p className="text-[8px] leading-[1.6]" style={{ color: "var(--muted-light)" }}>
                Hiring a <b className="jd-kw">Software Engineer</b> to build scalable web apps with{" "}
                <b className="jd-kw">React</b> and <b className="jd-kw">GraphQL</b>. You will containerize services
                using <b className="jd-kw">Docker</b>, deploy on <b className="jd-kw">AWS</b>, and own{" "}
                <b className="jd-kw">CI/CD</b> pipelines for fast, reliable releases.
              </p>

              {/* scan beam — clipped to the JD card */}
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

            {/* ATS match card (right-mid) */}
            <div
              className="absolute rounded-xl p-3.5 border"
              style={{
                left: 360,
                top: 230,
                width: 180,
                background: "var(--card)",
                borderColor: "var(--border-bright)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
              }}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>ATS Match</div>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-3xl font-extrabold leading-none tabular-nums" style={{ color: "var(--success)" }}>
                  {scoreText}
                </span>
                <span className="text-lg font-bold mb-0.5" style={{ color: "var(--success)" }}>%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <motion.div className="h-full rounded-full" style={{ width: barWidth, background: "linear-gradient(90deg, #00c8ff, #00e5a0)" }} />
              </div>
            </div>

          </div>
        </motion.div>
      </main>
    </div>
  );
}
