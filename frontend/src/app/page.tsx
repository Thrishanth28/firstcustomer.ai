"use client";

import { useState, useRef, useEffect } from "react";

/* ─── Types ──────────────────────────────────────────────────── */
interface CustomerPersona {
  name: string;
  role: string;
  age_range: string;
  pain_level: "High" | "Medium" | "Low";
  description: string;
  where_to_find: string[];
  buying_trigger: string;
  objection: string;
  objection_handle: string;
}

interface AcquisitionChannel {
  channel: string;
  difficulty: "Easy" | "Medium" | "Hard";
  time_to_first_customer: string;
  cost: "Free" | "Low" | "Medium" | "High";
  strategy: string;
  first_action: string;
}

interface OutreachScripts {
  cold_email: { subject: string; body: string };
  linkedin_dm: string;
  twitter_dm: string;
  reddit_post: { subreddit: string; title: string; body: string };
}

interface WeekPlan {
  goal: string;
  actions: string[];
  target_customers: number;
}

interface ValidationExperiment {
  experiment: string;
  how: string;
  success_metric: string;
}

interface AnalysisResult {
  startup_score: number;
  score_label: string;
  one_liner: string;
  ideal_customer_profiles: CustomerPersona[];
  top_channels: AcquisitionChannel[];
  outreach_scripts: OutreachScripts;
  first_10_customers_plan: {
    week_1: WeekPlan;
    week_2: WeekPlan;
    week_3: WeekPlan;
    week_4: WeekPlan;
  };
  pricing_feedback: string;
  biggest_mistake: string;
  unfair_advantage: string;
  competitor_gap: string;
  validation_experiments: ValidationExperiment[];
  red_flags: string[];
  quick_wins: string[];
}

interface StartupInput {
  startup_name: string;
  problem: string;
  solution: string;
  target_market: string;
  pricing: string;
  stage: string;
}

interface WeekEntry {
  key: string;
  label: string;
  data: WeekPlan;
}

/* ─── Constants ──────────────────────────────────────────────── */
// Uses Next.js internal API route — works on localhost AND Vercel production
const API_URL = "/api";

const STAGE_OPTIONS = [
  "Just an idea",
  "Building MVP",
  "MVP ready — no customers yet",
  "Have 1-2 beta users",
];

const SCRIPT_TABS = ["Cold Email", "LinkedIn DM", "Twitter DM", "Reddit Post"] as const;
type ScriptTab = (typeof SCRIPT_TABS)[number];

/* ─── Color helpers ──────────────────────────────────────────── */
function difficultyClass(d: string): string {
  if (d === "Easy") return "badge-green";
  if (d === "Hard") return "badge-red";
  return "badge-orange";
}

function costClass(c: string): string {
  if (c === "Free") return "badge-green";
  if (c === "High") return "badge-red";
  if (c === "Low") return "badge-blue";
  return "badge-orange";
}

function painClass(p: string): string {
  if (p === "High") return "badge-red";
  if (p === "Low") return "badge-green";
  return "badge-yellow";
}

function scoreColor(s: number): string {
  if (s >= 80) return "#4ade80";
  if (s >= 60) return "#f97316";
  return "#f87171";
}

function scoreBg(s: number): string {
  if (s >= 80) return "rgba(74,222,128,0.14)";
  if (s >= 60) return "rgba(249,115,22,0.14)";
  return "rgba(248,113,113,0.14)";
}

function scoreBorder(s: number): string {
  if (s >= 80) return "rgba(74,222,128,0.3)";
  if (s >= 60) return "rgba(249,115,22,0.3)";
  return "rgba(248,113,113,0.3)";
}

/* ─── Sub-components ─────────────────────────────────────────── */

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const [dashArray, setDashArray] = useState(`0 ${circumference}`);

  useEffect(() => {
    const t = setTimeout(() => {
      const filled = (score / 100) * circumference;
      setDashArray(`${filled} ${circumference}`);
    }, 250);
    return () => clearTimeout(t);
  }, [score, circumference]);

  const color = scoreColor(score);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140" aria-label={`Score: ${score}/100`}>
        <circle
          className="score-ring-track"
          cx="70"
          cy="70"
          r={radius}
        />
        <circle
          className="score-ring-fill"
          cx="70"
          cy="70"
          r={radius}
          stroke={color}
          strokeDasharray={dashArray}
          style={{ transition: "stroke-dasharray 2s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold leading-none" style={{ color }}>
          {score}
        </span>
        <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>
          /100
        </span>
      </div>
    </div>
  );
}

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for browsers without clipboard API
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button onClick={handleCopy} className={`copy-btn${copied ? " copied" : ""}`}>
      {copied ? (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}

function SectionHeading({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-2xl leading-none" role="img" aria-hidden="true">{icon}</span>
        <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>{title}</h2>
      </div>
      {subtitle && (
        <p className="text-sm ml-10" style={{ color: "var(--muted)" }}>{subtitle}</p>
      )}
    </div>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text)" }}>
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs font-medium" style={{ color: "var(--red)" }}>
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function HomePage() {
  const [formData, setFormData] = useState<StartupInput>({
    startup_name: "",
    problem: "",
    solution: "",
    target_market: "",
    pricing: "",
    stage: "",
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [apiError, setApiError] = useState("");
  const [activePersonaTab, setActivePersonaTab] = useState(0);
  const [activeScriptTab, setActiveScriptTab] = useState<ScriptTab>("Cold Email");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof StartupInput, string>>>({});

  const resultsRef = useRef<HTMLDivElement>(null);
  const formSectionRef = useRef<HTMLElement>(null);

  /* ── Form validation ── */
  const validate = (): boolean => {
    const errs: Partial<Record<keyof StartupInput, string>> = {};
    if (!formData.startup_name.trim()) errs.startup_name = "Required";
    if (!formData.problem.trim()) errs.problem = "Required";
    if (!formData.solution.trim()) errs.solution = "Required";
    if (!formData.target_market.trim()) errs.target_market = "Required";
    if (!formData.pricing.trim()) errs.pricing = "Required";
    if (!formData.stage) errs.stage = "Please select your current stage";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setAnalyzing(true);
    setApiError("");
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let data: unknown;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server returned status ${res.status} with non-JSON body.`);
      }

      if (!res.ok) {
        const detail = (data as { detail?: string })?.detail;
        throw new Error(detail ?? `Server error ${res.status}`);
      }

      setResult(data as AnalysisResult);
      setActivePersonaTab(0);
      setActiveScriptTab("Cold Email");
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setAnalyzing(false);
    }
  };

  /* ── Reset ── */
  const handleReset = () => {
    setResult(null);
    setApiError("");
    setFieldErrors({});
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  /* ── Script content ── */
  const getScriptContent = (): string => {
    if (!result) return "";
    const s = result.outreach_scripts;
    switch (activeScriptTab) {
      case "Cold Email":
        return `Subject: ${s.cold_email.subject}\n\n${s.cold_email.body}`;
      case "LinkedIn DM":
        return s.linkedin_dm;
      case "Twitter DM":
        return s.twitter_dm;
      case "Reddit Post":
        return `r/${s.reddit_post.subreddit}\n\nTitle: ${s.reddit_post.title}\n\n${s.reddit_post.body}`;
    }
  };

  /* ── Weeks array (typed, no as-const) ── */
  const weeks: WeekEntry[] = result
    ? [
        { key: "w1", label: "Week 1", data: result.first_10_customers_plan.week_1 },
        { key: "w2", label: "Week 2", data: result.first_10_customers_plan.week_2 },
        { key: "w3", label: "Week 3", data: result.first_10_customers_plan.week_3 },
        { key: "w4", label: "Week 4", data: result.first_10_customers_plan.week_4 },
      ]
    : [];

  const totalTargetCustomers = weeks.reduce(
    (acc, w) => acc + (w.data.target_customers ?? 0),
    0
  );

  /* ── Active persona ── */
  const activePersona: CustomerPersona | undefined =
    result?.ideal_customer_profiles[activePersonaTab];

  /* ─── Render ──────────────────────────────────────────────── */
  return (
    <div className="min-h-screen hero-bg">

      {/* ══ NAVBAR ══════════════════════════════════════════════ */}
      <nav
        className="sticky top-0 z-50"
        style={{
          borderBottom: "1px solid rgba(51,65,85,0.45)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          background: "rgba(3,7,18,0.7)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-extrabold" style={{ color: "var(--text)" }}>
            FirstCustomer
            <span style={{ color: "var(--accent)" }}>.</span>
            <span className="text-orange-gradient">ai</span>
          </span>
          <a
            href="https://thrishanth-portfolio.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium transition-colors duration-200"
            style={{ color: "var(--muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            Built by Thrishanth Reddy ↗
          </a>
        </div>
      </nav>

      {/* ══ HERO ════════════════════════════════════════════════ */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 text-center overflow-hidden">
        <div className="hero-glow" aria-hidden="true" />
        <div className="relative max-w-4xl mx-auto">

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8"
            style={{
              background: "rgba(249,115,22,0.11)",
              border: "1px solid rgba(249,115,22,0.28)",
              color: "var(--accent)",
            }}
          >
            <span aria-hidden="true">✦</span>
            AI-Powered Go-To-Market Intelligence
          </div>

          {/* H1 */}
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight mb-6"
            style={{ color: "var(--text)" }}
          >
            Get Your First{" "}
            <span className="text-orange-gradient">10 Customers</span>
          </h1>

          <p
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
            style={{ color: "var(--muted)" }}
          >
            Describe your startup and get an instant AI-powered customer
            acquisition strategy — personas, channels, outreach scripts and a
            30-day action plan.
          </p>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-14">
            {[
              { n: "3", label: "Customer Personas" },
              { n: "5", label: "Acquisition Channels" },
              { n: "30-Day", label: "Action Plan" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-3 px-5 py-3 rounded-xl"
                style={{
                  background: "rgba(15,23,42,0.55)",
                  border: "1px solid rgba(51,65,85,0.55)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <span className="text-2xl font-extrabold" style={{ color: "var(--accent)" }}>
                  {s.n}
                </span>
                <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Scroll arrow */}
          <div className="scroll-arrow flex justify-center" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          </div>
        </div>
      </section>

      {/* ══ FORM ════════════════════════════════════════════════ */}
      <section ref={formSectionRef} className="px-4 sm:px-6 pb-16 max-w-3xl mx-auto">
        <div className="glass-card p-8 sm:p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>
              Describe Your Startup
            </h2>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              The more detail you give, the more precise your strategy will be.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <FormField label="Startup Name" error={fieldErrors.startup_name}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. TaskFlow AI"
                value={formData.startup_name}
                onChange={(e) => setFormData((p) => ({ ...p, startup_name: e.target.value }))}
              />
            </FormField>

            <FormField label="Problem You Solve" error={fieldErrors.problem}>
              <textarea
                rows={3}
                className="form-input resize-none"
                placeholder="e.g. Developers waste 2 hours daily on repetitive code reviews that slow down shipping..."
                value={formData.problem}
                onChange={(e) => setFormData((p) => ({ ...p, problem: e.target.value }))}
              />
            </FormField>

            <FormField label="Your Solution" error={fieldErrors.solution}>
              <textarea
                rows={3}
                className="form-input resize-none"
                placeholder="e.g. AI-powered code review tool that automatically catches bugs, security issues, and style problems..."
                value={formData.solution}
                onChange={(e) => setFormData((p) => ({ ...p, solution: e.target.value }))}
              />
            </FormField>

            <FormField label="Target Market" error={fieldErrors.target_market}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Early-stage SaaS startups with 1-10 developers"
                value={formData.target_market}
                onChange={(e) => setFormData((p) => ({ ...p, target_market: e.target.value }))}
              />
            </FormField>

            <FormField label="Your Pricing" error={fieldErrors.pricing}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. $49/month or Free tier + $99/month Pro"
                value={formData.pricing}
                onChange={(e) => setFormData((p) => ({ ...p, pricing: e.target.value }))}
              />
            </FormField>

            <FormField label="Current Stage" error={fieldErrors.stage}>
              <select
                className="form-input"
                value={formData.stage}
                onChange={(e) => setFormData((p) => ({ ...p, stage: e.target.value }))}
              >
                <option value="" disabled>Select your current stage…</option>
                {STAGE_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </FormField>

            {/* API error */}
            {apiError && (
              <div
                className="p-4 rounded-xl text-sm leading-relaxed"
                style={{
                  background: "rgba(248,113,113,0.09)",
                  border: "1px solid rgba(248,113,113,0.28)",
                  color: "var(--red)",
                }}
              >
                <strong>Error:</strong> {apiError}
              </div>
            )}

            <button
              type="submit"
              disabled={analyzing}
              className="btn-primary w-full flex items-center justify-center gap-3"
            >
              {analyzing ? (
                <>
                  <span className="spinner" />
                  AI is analyzing your startup…
                </>
              ) : (
                "Find My First 10 Customers →"
              )}
            </button>
          </form>
        </div>
      </section>

      {/* ══ RESULTS ═════════════════════════════════════════════ */}
      {result && (
        <section
          ref={resultsRef}
          className="px-4 sm:px-6 pb-24 max-w-6xl mx-auto space-y-10"
        >

          {/* ── 4a Score Header ── */}
          <div className="glass-card p-8 sm:p-10 fade-up delay-1">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Ring + label */}
              <div className="flex flex-col items-center gap-3 flex-shrink-0">
                <ScoreRing score={result.startup_score} />
                <span
                  className="badge text-sm"
                  style={{
                    background: scoreBg(result.startup_score),
                    color: scoreColor(result.startup_score),
                    border: `1px solid ${scoreBorder(result.startup_score)}`,
                  }}
                >
                  {result.score_label}
                </span>
              </div>

              {/* One-liner + stats */}
              <div className="flex-1 text-center md:text-left">
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "var(--muted)" }}
                >
                  AI-Generated One-Liner
                </p>
                <p
                  className="text-2xl sm:text-3xl font-bold leading-snug mb-6"
                  style={{ color: "var(--text)" }}
                >
                  &ldquo;{result.one_liner}&rdquo;
                </p>

                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  {[
                    { n: result.ideal_customer_profiles?.length ?? 3, label: "Personas Found" },
                    { n: result.top_channels?.length ?? 5, label: "Channels Identified" },
                    { n: totalTargetCustomers, label: "Target Customers" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="px-5 py-3 rounded-xl text-center"
                      style={{
                        background: "rgba(30,41,59,0.55)",
                        border: "1px solid rgba(51,65,85,0.55)",
                      }}
                    >
                      <div className="text-2xl font-extrabold" style={{ color: "var(--accent)" }}>
                        {s.n}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── 4b Customer Personas ── */}
          <div className="glass-card p-8 sm:p-10 fade-up delay-2">
            <SectionHeading
              icon="👥"
              title="Ideal Customer Profiles"
              subtitle="Your 3 highest-value target personas — click each tab"
            />

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
              {result.ideal_customer_profiles.map((p, i) => (
                <button
                  key={i}
                  className={`tab-btn${activePersonaTab === i ? " active" : ""}`}
                  onClick={() => setActivePersonaTab(i)}
                >
                  {p.name.split(" ").slice(0, 3).join(" ")}
                </button>
              ))}
            </div>

            {/* Active persona content */}
            {activePersona && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold" style={{ color: "var(--text)" }}>
                    {activePersona.name}
                  </h3>
                  <span className="badge badge-blue">{activePersona.role}</span>
                  <span className="badge badge-muted">{activePersona.age_range}</span>
                  <span className={`badge ${painClass(activePersona.pain_level)}`}>
                    {activePersona.pain_level} Pain
                  </span>
                </div>

                <p className="leading-relaxed" style={{ color: "var(--muted)" }}>
                  {activePersona.description}
                </p>

                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-3"
                    style={{ color: "var(--muted)" }}
                  >
                    Where to Find Them
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activePersona.where_to_find.map((loc, j) => (
                      <span key={j} className="location-pill">
                        <span aria-hidden="true">📍</span> {loc}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      background: "rgba(74,222,128,0.07)",
                      border: "1px solid rgba(74,222,128,0.22)",
                    }}
                  >
                    <p
                      className="text-xs font-semibold uppercase tracking-widest mb-2"
                      style={{ color: "var(--green)" }}
                    >
                      ⚡ Buying Trigger
                    </p>
                    <p className="text-sm" style={{ color: "var(--text)" }}>
                      {activePersona.buying_trigger}
                    </p>
                  </div>

                  <div
                    className="p-4 rounded-xl"
                    style={{
                      background: "rgba(250,204,21,0.07)",
                      border: "1px solid rgba(250,204,21,0.22)",
                    }}
                  >
                    <p
                      className="text-xs font-semibold uppercase tracking-widest mb-2"
                      style={{ color: "var(--yellow)" }}
                    >
                      🛡 Top Objection
                    </p>
                    <p className="text-sm mb-3" style={{ color: "var(--text)" }}>
                      {activePersona.objection}
                    </p>
                    <p
                      className="text-xs font-semibold uppercase tracking-widest mb-1"
                      style={{ color: "var(--yellow)" }}
                    >
                      How to Handle It
                    </p>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>
                      {activePersona.objection_handle}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── 4c Acquisition Channels ── */}
          <div className="fade-up delay-3">
            <SectionHeading
              icon="🚀"
              title="Top Acquisition Channels"
              subtitle="5 channels ranked by speed to first customer"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {result.top_channels.map((ch, i) => (
                <div key={i} className="glass-card glass-card-hover p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold" style={{ color: "var(--text)" }}>
                      {ch.channel}
                    </h3>
                    <span
                      className="text-xs font-bold px-2 py-1 rounded-lg ml-2 flex-shrink-0"
                      style={{
                        background: "rgba(249,115,22,0.12)",
                        color: "var(--accent)",
                      }}
                    >
                      #{i + 1}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`badge ${difficultyClass(ch.difficulty)}`}>
                      {ch.difficulty}
                    </span>
                    <span className={`badge ${costClass(ch.cost)}`}>{ch.cost}</span>
                    <span className="badge badge-muted">⏱ {ch.time_to_first_customer}</span>
                  </div>

                  <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--muted)" }}>
                    {ch.strategy}
                  </p>

                  <div className="first-action-box">
                    <p
                      className="text-xs font-semibold uppercase tracking-widest mb-2"
                      style={{ color: "var(--accent)" }}
                    >
                      ▶ First Action Today
                    </p>
                    <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                      {ch.first_action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 4d Outreach Scripts ── */}
          <div className="glass-card p-8 sm:p-10 fade-up delay-4">
            <SectionHeading
              icon="✉️"
              title="Outreach Scripts"
              subtitle="Copy-paste ready — personalized for your exact startup"
            />

            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
              {SCRIPT_TABS.map((t) => (
                <button
                  key={t}
                  className={`tab-btn${activeScriptTab === t ? " active" : ""}`}
                  onClick={() => setActiveScriptTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            <div>
              {activeScriptTab === "Cold Email" && (
                <div className="space-y-3">
                  <div
                    className="p-3 rounded-lg text-sm"
                    style={{
                      background: "rgba(30,41,59,0.55)",
                      border: "1px solid rgba(51,65,85,0.55)",
                    }}
                  >
                    <span
                      className="text-xs font-semibold uppercase tracking-widest"
                      style={{ color: "var(--muted)" }}
                    >
                      Subject:{" "}
                    </span>
                    <span className="font-semibold" style={{ color: "var(--text)" }}>
                      {result.outreach_scripts.cold_email.subject}
                    </span>
                  </div>
                  <div className="script-box">{result.outreach_scripts.cold_email.body}</div>
                </div>
              )}

              {activeScriptTab === "LinkedIn DM" && (
                <div className="space-y-2">
                  <div className="script-box">{result.outreach_scripts.linkedin_dm}</div>
                  <p className="text-xs text-right" style={{ color: "var(--muted)" }}>
                    {result.outreach_scripts.linkedin_dm.length} / 300 characters
                  </p>
                </div>
              )}

              {activeScriptTab === "Twitter DM" && (
                <div className="space-y-2">
                  <div className="script-box">{result.outreach_scripts.twitter_dm}</div>
                  <p className="text-xs text-right" style={{ color: "var(--muted)" }}>
                    {result.outreach_scripts.twitter_dm.length} / 280 characters
                  </p>
                </div>
              )}

              {activeScriptTab === "Reddit Post" && (
                <div className="space-y-3">
                  <span
                    className="inline-block text-xs font-bold px-3 py-1 rounded-full"
                    style={{
                      background: "rgba(249,115,22,0.14)",
                      color: "var(--accent)",
                      border: "1px solid rgba(249,115,22,0.28)",
                    }}
                  >
                    r/{result.outreach_scripts.reddit_post.subreddit}
                  </span>
                  <div
                    className="p-3 rounded-lg text-sm font-bold"
                    style={{
                      background: "rgba(30,41,59,0.55)",
                      border: "1px solid rgba(51,65,85,0.55)",
                      color: "var(--text)",
                    }}
                  >
                    {result.outreach_scripts.reddit_post.title}
                  </div>
                  <div className="script-box">{result.outreach_scripts.reddit_post.body}</div>
                </div>
              )}

              <div className="flex justify-end mt-4">
                <CopyButton text={getScriptContent()} label="Copy Script" />
              </div>
            </div>
          </div>

          {/* ── 4e 30-Day Action Plan ── */}
          <div className="fade-up delay-5">
            <SectionHeading
              icon="📅"
              title="30-Day Action Plan"
              subtitle="Week-by-week roadmap to your first 10 paying customers"
            />

            <div
              className="mb-5 rounded-xl p-4"
              style={{
                background: "rgba(15,23,42,0.6)",
                border: "1px solid rgba(51,65,85,0.55)",
              }}
            >
              <div className="flex justify-between text-xs mb-2" style={{ color: "var(--muted)" }}>
                <span>Start</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>10 Customers ✓</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: "100%" }} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {weeks.map(({ key, label, data }, idx) => (
                <div key={key} className="week-card">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="week-number mt-0.5">{idx + 1}</div>
                    <div className="flex-1">
                      <p
                        className="text-xs font-semibold uppercase tracking-widest mb-1"
                        style={{ color: "var(--accent)" }}
                      >
                        {label}
                      </p>
                      <p className="text-sm font-bold" style={{ color: "var(--text)" }}>
                        {data.goal}
                      </p>
                    </div>
                  </div>

                  <ol className="space-y-2 mb-4">
                    {data.actions.map((action, ai) => (
                      <li key={ai} className="flex gap-3 text-sm">
                        <span
                          className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                          style={{
                            background: "rgba(249,115,22,0.14)",
                            color: "var(--accent)",
                          }}
                        >
                          {ai + 1}
                        </span>
                        <span style={{ color: "var(--muted)" }}>{action}</span>
                      </li>
                    ))}
                  </ol>

                  <span className="badge badge-orange">
                    Target: {data.target_customers}{" "}
                    {data.target_customers === 1 ? "customer" : "customers"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── 4f Key Insights ── */}
          <div className="fade-up delay-6">
            <SectionHeading icon="💡" title="Key Insights" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
              <div className="insight-card insight-card-blue">
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: "var(--blue)" }}
                >
                  💰 Pricing Feedback
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                  {result.pricing_feedback}
                </p>
              </div>

              <div className="insight-card insight-card-red">
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: "var(--red)" }}
                >
                  ⚠ Biggest Mistake
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                  {result.biggest_mistake}
                </p>
              </div>

              <div className="insight-card insight-card-green">
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: "var(--green)" }}
                >
                  ⚡ Unfair Advantage
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                  {result.unfair_advantage}
                </p>
              </div>
            </div>

            {result.competitor_gap && (
              <div
                className="p-5 rounded-xl"
                style={{
                  background: "rgba(250,204,21,0.06)",
                  border: "1px solid rgba(250,204,21,0.22)",
                }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "var(--yellow)" }}
                >
                  🎯 Competitor Gap to Exploit
                </p>
                <p className="text-sm" style={{ color: "var(--text)" }}>
                  {result.competitor_gap}
                </p>
              </div>
            )}
          </div>

          {/* ── 4g Validation Experiments ── */}
          <div className="fade-up delay-7">
            <SectionHeading
              icon="🧪"
              title="Validation Experiments"
              subtitle="Run each of these in under 48 hours to prove demand"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {result.validation_experiments.map((exp, i) => (
                <div key={i} className="glass-card glass-card-hover p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{
                        background: "rgba(249,115,22,0.14)",
                        color: "var(--accent)",
                      }}
                    >
                      {i + 1}
                    </span>
                    <h4 className="font-bold text-sm" style={{ color: "var(--text)" }}>
                      {exp.experiment}
                    </h4>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p
                        className="text-xs font-semibold uppercase tracking-widest mb-1"
                        style={{ color: "var(--blue)" }}
                      >
                        How to Run
                      </p>
                      <p className="text-sm" style={{ color: "var(--muted)" }}>{exp.how}</p>
                    </div>

                    <div
                      className="p-3 rounded-lg"
                      style={{
                        background: "rgba(74,222,128,0.07)",
                        border: "1px solid rgba(74,222,128,0.18)",
                      }}
                    >
                      <p
                        className="text-xs font-semibold uppercase tracking-widest mb-1"
                        style={{ color: "var(--green)" }}
                      >
                        ✓ Success Metric
                      </p>
                      <p className="text-xs" style={{ color: "var(--text)" }}>
                        {exp.success_metric}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 4h Red Flags + Quick Wins ── */}
          <div className="fade-up delay-8">
            <SectionHeading icon="🎯" title="Red Flags & Quick Wins" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Red Flags */}
              <div className="glass-card p-6">
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-4"
                  style={{ color: "var(--red)" }}
                >
                  🚩 Watch Out For
                </p>
                <div className="space-y-3">
                  {result.red_flags.map((flag, i) => (
                    <div
                      key={i}
                      className="flex gap-3 p-3 rounded-xl"
                      style={{
                        background: "rgba(248,113,113,0.07)",
                        border: "1px solid rgba(248,113,113,0.18)",
                      }}
                    >
                      <span
                        className="flex-shrink-0 mt-0.5"
                        style={{ color: "var(--red)" }}
                        aria-hidden="true"
                      >
                        ⚠
                      </span>
                      <p className="text-sm" style={{ color: "var(--text)" }}>{flag}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Wins */}
              <div className="glass-card p-6">
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-4"
                  style={{ color: "var(--green)" }}
                >
                  ⚡ Do These Today
                </p>
                <div className="space-y-3">
                  {result.quick_wins.map((win, i) => (
                    <div
                      key={i}
                      className="flex gap-3 p-3 rounded-xl"
                      style={{
                        background: "rgba(74,222,128,0.07)",
                        border: "1px solid rgba(74,222,128,0.18)",
                      }}
                    >
                      <span
                        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                        style={{
                          background: "rgba(74,222,128,0.18)",
                          color: "var(--green)",
                        }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <span
                          className="inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-1"
                          style={{
                            background: "rgba(74,222,128,0.14)",
                            color: "var(--green)",
                          }}
                        >
                          Quick Win
                        </span>
                        <p className="text-sm" style={{ color: "var(--text)" }}>{win}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── 4i Analyze Another ── */}
          <div className="fade-up delay-9 text-center pt-6">
            <button
              onClick={handleReset}
              className="btn-primary inline-flex items-center gap-2 px-10"
            >
              ↩ Analyze Another Startup
            </button>
          </div>
        </section>
      )}

      {/* ══ HOW IT WORKS (only shown before results) ════════════ */}
      {!result && (
        <section className="px-4 sm:px-6 py-16 max-w-4xl mx-auto">
          <hr className="section-divider" />
          <h2
            className="text-3xl font-bold text-center mb-12"
            style={{ color: "var(--text)" }}
          >
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "✍️",
                step: "1",
                title: "Describe Your Startup",
                desc: "Fill in 6 fields in under 60 seconds. The more specific you are, the sharper your strategy.",
              },
              {
                icon: "🤖",
                step: "2",
                title: "AI Analyzes 50+ Signals",
                desc: "Google Gemini 1.5 Flash analyzes your market, positioning, pricing and go-to-market fit instantly.",
              },
              {
                icon: "🎯",
                step: "3",
                title: "Get Your Full Strategy",
                desc: "Receive 3 personas, 5 channels, 4 outreach scripts, a 30-day plan, and validation experiments.",
              },
            ].map((s) => (
              <div key={s.step} className="glass-card glass-card-hover p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="step-icon" role="img" aria-label={s.title}>
                    {s.icon}
                  </div>
                </div>
                <div
                  className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3"
                  style={{
                    background: "rgba(249,115,22,0.11)",
                    color: "var(--accent)",
                  }}
                >
                  Step {s.step}
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text)" }}>
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══ FOOTER ══════════════════════════════════════════════ */}
      <footer
        className="py-8 px-4 text-center text-sm"
        style={{
          borderTop: "1px solid rgba(51,65,85,0.45)",
          color: "var(--muted)",
        }}
      >
        Built by{" "}
        <a
          href="https://thrishanth-portfolio.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold transition-colors duration-200"
          style={{ color: "var(--accent)" }}
        >
          S. Thrishanth Reddy
        </a>{" "}
        · Powered by{" "}
        <span className="font-semibold" style={{ color: "var(--text)" }}>
          Google Gemini AI
        </span>
      </footer>
    </div>
  );
}
