"use client";
import { useState, useRef, useEffect } from "react";

/* ── Types ──────────────────────────────────────────────── */
interface CustomerPersona {
  name: string; role: string; age_range: string;
  pain_level: "High" | "Medium" | "Low";
  description: string; where_to_find: string[];
  buying_trigger: string; objection: string; objection_handle: string;
}
interface AcquisitionChannel {
  channel: string; difficulty: "Easy" | "Medium" | "Hard";
  time_to_first_customer: string; cost: "Free" | "Low" | "Medium" | "High";
  strategy: string; first_action: string;
}
interface OutreachScripts {
  cold_email: { subject: string; body: string };
  linkedin_dm: string; twitter_dm: string;
  reddit_post: { subreddit: string; title: string; body: string };
}
interface WeekPlan { goal: string; actions: string[]; target_customers: number; }
interface ValidationExperiment { experiment: string; how: string; success_metric: string; }
interface AnalysisResult {
  startup_score: number; score_label: string; one_liner: string;
  ideal_customer_profiles: CustomerPersona[];
  top_channels: AcquisitionChannel[];
  outreach_scripts: OutreachScripts;
  first_10_customers_plan: { week_1: WeekPlan; week_2: WeekPlan; week_3: WeekPlan; week_4: WeekPlan; };
  pricing_feedback: string; biggest_mistake: string;
  unfair_advantage: string; competitor_gap: string;
  validation_experiments: ValidationExperiment[];
  red_flags: string[]; quick_wins: string[];
}
interface StartupInput {
  startup_name: string; problem: string; solution: string;
  target_market: string; pricing: string; stage: string;
}
interface WeekEntry { key: string; label: string; data: WeekPlan; }

/* ── Constants ──────────────────────────────────────────── */
const STAGES = ["Just an idea","Building MVP","MVP ready — no customers yet","Have 1-2 beta users"];
const SCRIPT_TABS = ["Cold Email","LinkedIn DM","Twitter DM","Reddit Post"] as const;
type ScriptTab = (typeof SCRIPT_TABS)[number];

/* ── Helpers ────────────────────────────────────────────── */
const diffBadge = (d: string) => d === "Easy" ? "badge-green" : d === "Hard" ? "badge-red" : "badge-orange";
const costBadge = (c: string) => c === "Free" ? "badge-green" : c === "High" ? "badge-red" : c === "Low" ? "badge-blue" : "badge-orange";
const painBadge = (p: string) => p === "High" ? "badge-red" : p === "Low" ? "badge-green" : "badge-yellow";
const scoreColor = (s: number) => s >= 80 ? "var(--green)" : s >= 60 ? "var(--accent)" : "var(--red)";

/* ── ScoreRing ──────────────────────────────────────────── */
function ScoreRing({ score }: { score: number }) {
  const r = 52, circ = 2 * Math.PI * r;
  const [dash, setDash] = useState(`0 ${circ}`);
  useEffect(() => {
    const t = setTimeout(() => setDash(`${(score / 100) * circ} ${circ}`), 300);
    return () => clearTimeout(t);
  }, [score, circ]);
  const col = scoreColor(score);
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle className="score-ring-track" cx="65" cy="65" r={r} />
        <circle className="score-ring-fill" cx="65" cy="65" r={r}
          stroke={col} strokeDasharray={dash}
          style={{ transition: "stroke-dasharray 2s cubic-bezier(.4,0,.2,1)" }} />
      </svg>
      <div className="absolute flex flex-col items-center gap-0.5">
        <span className="text-3xl font-black leading-none" style={{ color: col }}>{score}</span>
        <span className="text-xs font-semibold" style={{ color: "var(--text3)" }}>/ 100</span>
      </div>
    </div>
  );
}

/* ── CopyButton ─────────────────────────────────────────── */
function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    try { await navigator.clipboard.writeText(text); }
    catch { const el = document.createElement("textarea"); el.value = text; document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el); }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handle} className={`copy-btn${copied ? " copied" : ""}`}>
      {copied
        ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Copied</>
        : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>{label}</>
      }
    </button>
  );
}

/* ── SectionHeader ──────────────────────────────────────── */
function SectionHeader({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div className="section-header">
      <div className="section-icon">{icon}</div>
      <div>
        <h2 className="heading-md" style={{ color: "var(--text)" }}>{title}</h2>
        {sub && <p className="body-sm" style={{ color: "var(--text2)", marginTop: 2 }}>{sub}</p>}
      </div>
    </div>
  );
}

/* ── Field ──────────────────────────────────────────────── */
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="label" style={{ color: "var(--text2)" }}>{label}</label>
      {children}
      {error && <span className="body-sm" style={{ color: "var(--red)" }}>{error}</span>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function Page() {
  const [form, setForm] = useState<StartupInput>({
    startup_name: "", problem: "", solution: "", target_market: "", pricing: "", stage: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof StartupInput, string>>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [apiError, setApiError] = useState("");
  const [personaTab, setPersonaTab] = useState(0);
  const [scriptTab, setScriptTab] = useState<ScriptTab>("Cold Email");

  const resultsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLElement>(null);

  const validate = () => {
    const e: Partial<Record<keyof StartupInput, string>> = {};
    if (!form.startup_name.trim()) e.startup_name = "Required";
    if (!form.problem.trim()) e.problem = "Required";
    if (!form.solution.trim()) e.solution = "Required";
    if (!form.target_market.trim()) e.target_market = "Required";
    if (!form.pricing.trim()) e.pricing = "Required";
    if (!form.stage) e.stage = "Please select a stage";
    setErrors(e); return !Object.keys(e).length;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setApiError(""); setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      let data: unknown;
      try { data = await res.json(); } catch { throw new Error(`Server error ${res.status}`); }
      if (!res.ok) throw new Error((data as { detail?: string })?.detail ?? `Error ${res.status}`);
      setResult(data as AnalysisResult);
      setPersonaTab(0); setScriptTab("Cold Email");
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Unexpected error. Please try again.");
    } finally { setLoading(false); }
  };

  const reset = () => {
    setResult(null); setApiError(""); setErrors({});
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const scriptText = (): string => {
    if (!result) return "";
    const s = result.outreach_scripts;
    if (scriptTab === "Cold Email") return `Subject: ${s.cold_email.subject}\n\n${s.cold_email.body}`;
    if (scriptTab === "LinkedIn DM") return s.linkedin_dm;
    if (scriptTab === "Twitter DM") return s.twitter_dm;
    return `r/${s.reddit_post.subreddit}\n\nTitle: ${s.reddit_post.title}\n\n${s.reddit_post.body}`;
  };

  const weeks: WeekEntry[] = result ? [
    { key: "w1", label: "Week 1", data: result.first_10_customers_plan.week_1 },
    { key: "w2", label: "Week 2", data: result.first_10_customers_plan.week_2 },
    { key: "w3", label: "Week 3", data: result.first_10_customers_plan.week_3 },
    { key: "w4", label: "Week 4", data: result.first_10_customers_plan.week_4 },
  ] : [];

  const persona = result?.ideal_customer_profiles[personaTab];

  /* ──────────────────────────────────────────────────────── */
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>

      {/* ╔══ NAVBAR ══╗ */}
      <header className="navbar">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
              FirstCustomer<span style={{ color: "var(--accent)" }}>.ai</span>
            </span>
          </div>
          <a href="https://thrishanth-portfolio.vercel.app" target="_blank" rel="noopener noreferrer"
            className="footer-link" style={{ fontSize: "0.8125rem" }}>
            by Thrishanth Reddy ↗
          </a>
        </div>
      </header>

      {/* ╔══ HERO ══╗ */}
      <section className="hero-grid" style={{ paddingTop: 80, paddingBottom: 64 }}>
        <div className="max-w-3xl mx-auto px-5 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-8" style={{
            background: "var(--surface)", border: "1px solid var(--border2)",
            borderRadius: 99, padding: "5px 14px",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text2)", letterSpacing: "0.04em" }}>
              Powered by Google Gemini AI
            </span>
          </div>

          {/* Headline */}
          <h1 className="display" style={{ color: "var(--text)", marginBottom: 20 }}>
            Get Your First{" "}
            <span className="text-gradient">10 Customers</span>
          </h1>
          <p className="body-lg" style={{ color: "var(--text2)", maxWidth: 520, margin: "0 auto 40px" }}>
            Describe your startup. Get an AI-generated go-to-market strategy with
            customer personas, acquisition channels, outreach scripts, and a 30-day action plan.
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {[
              { n: "3", l: "Customer Personas" },
              { n: "5", l: "Acquisition Channels" },
              { n: "4", l: "Outreach Scripts" },
              { n: "30", l: "Day Action Plan" },
            ].map(s => (
              <div key={s.l} className="stat-chip">
                <span style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--accent)" }}>{s.n}</span>
                <span style={{ fontSize: "0.8125rem", color: "var(--text2)" }}>{s.l}</span>
              </div>
            ))}
          </div>

          {/* Scroll arrow */}
          <div className="bounce-arrow flex justify-center mt-10" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
            </svg>
          </div>
        </div>
      </section>

      {/* ╔══ FORM ══╗ */}
      <section ref={formRef} style={{ padding: "0 20px 80px" }}>
        <div className="card max-w-2xl mx-auto" style={{ padding: "40px 40px" }}>

          {/* Form header */}
          <div style={{ marginBottom: 32, borderBottom: "1px solid var(--border)", paddingBottom: 24 }}>
            <h2 className="heading-lg" style={{ color: "var(--text)", marginBottom: 6 }}>Describe Your Startup</h2>
            <p className="body-sm" style={{ color: "var(--text2)" }}>
              The more specific you are, the sharper your strategy.
            </p>
          </div>

          <form onSubmit={submit} noValidate className="flex flex-col gap-6">
            <Field label="Startup Name" error={errors.startup_name}>
              <input type="text" className="input" placeholder="e.g. TaskFlow AI"
                value={form.startup_name}
                onChange={e => setForm(p => ({ ...p, startup_name: e.target.value }))} />
            </Field>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label="Target Market" error={errors.target_market}>
                <input type="text" className="input" placeholder="e.g. SaaS startups with 5-20 devs"
                  value={form.target_market}
                  onChange={e => setForm(p => ({ ...p, target_market: e.target.value }))} />
              </Field>
              <Field label="Pricing" error={errors.pricing}>
                <input type="text" className="input" placeholder="e.g. $79/month or Free + $49 Pro"
                  value={form.pricing}
                  onChange={e => setForm(p => ({ ...p, pricing: e.target.value }))} />
              </Field>
            </div>

            <Field label="Problem You Solve" error={errors.problem}>
              <textarea rows={3} className="input resize-none" placeholder="e.g. Developers waste 3 hours daily waiting for code reviews, slowing down releases..."
                value={form.problem}
                onChange={e => setForm(p => ({ ...p, problem: e.target.value }))} />
            </Field>

            <Field label="Your Solution" error={errors.solution}>
              <textarea rows={3} className="input resize-none" placeholder="e.g. AI-powered instant code review that catches bugs and security issues before humans review..."
                value={form.solution}
                onChange={e => setForm(p => ({ ...p, solution: e.target.value }))} />
            </Field>

            <Field label="Current Stage" error={errors.stage}>
              <select className="input" value={form.stage}
                onChange={e => setForm(p => ({ ...p, stage: e.target.value }))}>
                <option value="" disabled>Select your stage…</option>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>

            {apiError && (
              <div style={{
                background: "var(--red-dim)", border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "var(--r-sm)", padding: "12px 16px",
                color: "var(--red)", fontSize: "0.875rem", lineHeight: 1.6,
              }}>
                <strong>Error:</strong> {apiError}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn btn-primary w-full"
              style={{ padding: "14px", fontSize: "0.9375rem" }}>
              {loading
                ? <><span className="spinner" /> Generating your strategy…</>
                : "Generate My Customer Strategy →"}
            </button>
          </form>
        </div>
      </section>

      {/* ╔══ RESULTS ══╗ */}
      {result && (
        <section ref={resultsRef} style={{ padding: "0 20px 100px" }}>
          <div className="max-w-6xl mx-auto flex flex-col gap-8">

            {/* ── Score + One-liner ── */}
            <div className="card fade-up delay-1" style={{ padding: "36px 40px" }}>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Ring */}
                <div className="flex flex-col items-center gap-3 flex-shrink-0">
                  <ScoreRing score={result.startup_score} />
                  <span className="badge" style={{
                    background: result.startup_score >= 80 ? "var(--green-dim)" : result.startup_score >= 60 ? "var(--accent-dim)" : "var(--red-dim)",
                    color: scoreColor(result.startup_score),
                    border: `1px solid ${result.startup_score >= 80 ? "rgba(34,197,94,0.25)" : result.startup_score >= 60 ? "rgba(255,92,40,0.25)" : "rgba(239,68,68,0.25)"}`,
                    fontSize: "0.75rem", padding: "4px 12px", borderRadius: 99,
                  }}>
                    {result.score_label}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <p className="label" style={{ marginBottom: 8 }}>AI-Generated One-Liner</p>
                  <p style={{
                    fontSize: "clamp(1.25rem, 2.5vw, 1.625rem)", fontWeight: 700,
                    color: "var(--text)", lineHeight: 1.35,
                    letterSpacing: "-0.02em", marginBottom: 24,
                  }}>
                    &ldquo;{result.one_liner}&rdquo;
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    {[
                      { n: result.ideal_customer_profiles?.length ?? 3, l: "Personas" },
                      { n: result.top_channels?.length ?? 5, l: "Channels" },
                      { n: weeks.reduce((a, w) => a + (w.data.target_customers ?? 0), 0), l: "Target Customers" },
                    ].map(s => (
                      <div key={s.l} className="stat-chip">
                        <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--accent)" }}>{s.n}</span>
                        <span className="body-sm" style={{ color: "var(--text2)" }}>{s.l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Customer Personas ── */}
            <div className="card fade-up delay-2" style={{ padding: "32px 36px" }}>
              <SectionHeader icon="👥" title="Ideal Customer Profiles" sub="Your 3 highest-value target personas" />

              {/* Persona Tab Bar */}
              <div className="tabs mb-6 overflow-x-auto" style={{ width: "fit-content", maxWidth: "100%" }}>
                {result.ideal_customer_profiles.map((p, i) => (
                  <button key={i} className={`tab-btn${personaTab === i ? " active" : ""}`}
                    onClick={() => setPersonaTab(i)}>
                    {p.name.split(" ").slice(0, 3).join(" ")}
                  </button>
                ))}
              </div>

              {persona && (
                <div className="flex flex-col gap-5">
                  {/* Name + badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="heading-md" style={{ color: "var(--text)" }}>{persona.name}</h3>
                    <span className="badge badge-blue">{persona.role}</span>
                    <span className="badge badge-muted">{persona.age_range}</span>
                    <span className={`badge ${painBadge(persona.pain_level)}`}>{persona.pain_level} Pain</span>
                  </div>

                  <p className="body" style={{ color: "var(--text2)" }}>{persona.description}</p>

                  {/* Where to find */}
                  <div>
                    <p className="label" style={{ marginBottom: 10 }}>Where to Find Them</p>
                    <div className="flex flex-wrap gap-2">
                      {persona.where_to_find.map((loc, j) => (
                        <span key={j} className="loc-pill">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                          </svg>
                          {loc}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Trigger + Objection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div style={{ background: "var(--green-dim)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: "var(--r-sm)", padding: 16 }}>
                      <p className="label" style={{ color: "var(--green)", marginBottom: 8 }}>⚡ Buying Trigger</p>
                      <p className="body-sm" style={{ color: "var(--text)" }}>{persona.buying_trigger}</p>
                    </div>
                    <div style={{ background: "var(--yellow-dim)", border: "1px solid rgba(234,179,8,0.15)", borderRadius: "var(--r-sm)", padding: 16 }}>
                      <p className="label" style={{ color: "var(--yellow)", marginBottom: 8 }}>🛡 Top Objection</p>
                      <p className="body-sm" style={{ color: "var(--text)", marginBottom: 8 }}>{persona.objection}</p>
                      <p className="label" style={{ color: "var(--yellow)", marginBottom: 4 }}>Your Response</p>
                      <p className="body-sm" style={{ color: "var(--text2)" }}>{persona.objection_handle}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Acquisition Channels ── */}
            <div className="fade-up delay-3">
              <div style={{ marginBottom: 20 }}>
                <SectionHeader icon="🚀" title="Top Acquisition Channels" sub="Ranked by speed to first customer" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.top_channels.map((ch, i) => (
                  <div key={i} className="card card-hover card-glow" style={{ padding: 24 }}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="heading-sm" style={{ color: "var(--text)" }}>{ch.channel}</h3>
                      <span style={{
                        fontSize: "0.6875rem", fontWeight: 800, padding: "2px 8px", borderRadius: 4,
                        background: "var(--surface3)", color: "var(--text3)", letterSpacing: "0.06em",
                      }}>#{i + 1}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`badge ${diffBadge(ch.difficulty)}`}>{ch.difficulty}</span>
                      <span className={`badge ${costBadge(ch.cost)}`}>{ch.cost}</span>
                      <span className="badge badge-muted">⏱ {ch.time_to_first_customer}</span>
                    </div>
                    <p className="body-sm" style={{ color: "var(--text2)", marginBottom: 0 }}>{ch.strategy}</p>
                    <div className="first-action">
                      <p className="label" style={{ color: "var(--accent)", marginBottom: 6 }}>▶ First Action Today</p>
                      <p className="body-sm" style={{ color: "var(--text)", fontWeight: 500 }}>{ch.first_action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Outreach Scripts ── */}
            <div className="card fade-up delay-4" style={{ padding: "32px 36px" }}>
              <SectionHeader icon="✉️" title="Outreach Scripts" sub="Copy-paste ready — personalized for your startup" />

              <div className="tabs mb-6 overflow-x-auto" style={{ width: "fit-content", maxWidth: "100%" }}>
                {SCRIPT_TABS.map(t => (
                  <button key={t} className={`tab-btn${scriptTab === t ? " active" : ""}`}
                    onClick={() => setScriptTab(t)}>{t}</button>
                ))}
              </div>

              <div>
                {scriptTab === "Cold Email" && (
                  <div className="flex flex-col gap-3">
                    <div style={{
                      background: "var(--surface2)", border: "1px solid var(--border)",
                      borderRadius: "var(--r-sm)", padding: "10px 14px", fontSize: "0.875rem",
                    }}>
                      <span className="label" style={{ marginRight: 8 }}>Subject:</span>
                      <span style={{ color: "var(--text)", fontWeight: 600 }}>
                        {result.outreach_scripts.cold_email.subject}
                      </span>
                    </div>
                    <div className="script-box">{result.outreach_scripts.cold_email.body}</div>
                  </div>
                )}
                {scriptTab === "LinkedIn DM" && (
                  <div className="flex flex-col gap-2">
                    <div className="script-box">{result.outreach_scripts.linkedin_dm}</div>
                    <p className="body-sm text-right" style={{ color: "var(--text3)" }}>
                      {result.outreach_scripts.linkedin_dm.length} / 300 chars
                    </p>
                  </div>
                )}
                {scriptTab === "Twitter DM" && (
                  <div className="flex flex-col gap-2">
                    <div className="script-box">{result.outreach_scripts.twitter_dm}</div>
                    <p className="body-sm text-right" style={{ color: "var(--text3)" }}>
                      {result.outreach_scripts.twitter_dm.length} / 280 chars
                    </p>
                  </div>
                )}
                {scriptTab === "Reddit Post" && (
                  <div className="flex flex-col gap-3">
                    <span className="badge badge-orange" style={{ width: "fit-content", borderRadius: 99, padding: "4px 12px" }}>
                      r/{result.outreach_scripts.reddit_post.subreddit}
                    </span>
                    <div style={{
                      background: "var(--surface2)", border: "1px solid var(--border)",
                      borderRadius: "var(--r-sm)", padding: "10px 14px",
                      fontWeight: 600, fontSize: "0.9375rem", color: "var(--text)",
                    }}>
                      {result.outreach_scripts.reddit_post.title}
                    </div>
                    <div className="script-box">{result.outreach_scripts.reddit_post.body}</div>
                  </div>
                )}
                <div className="flex justify-end mt-4">
                  <CopyButton text={scriptText()} label="Copy Script" />
                </div>
              </div>
            </div>

            {/* ── 30-Day Plan ── */}
            <div className="fade-up delay-5">
              <SectionHeader icon="📅" title="30-Day Action Plan" sub="Week-by-week roadmap to your first 10 customers" />

              {/* Timeline bar */}
              <div className="card-sm" style={{ padding: "14px 20px", marginBottom: 20 }}>
                <div className="flex justify-between mb-2">
                  {["Week 1", "Week 2", "Week 3", "Week 4 — 10 Customers ✓"].map(w => (
                    <span key={w} className="body-sm" style={{ color: "var(--text3)" }}>{w}</span>
                  ))}
                </div>
                <div className="progress-track"><div className="progress-fill" style={{ width: "100%" }} /></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {weeks.map(({ key, label, data }, idx) => (
                  <div key={key} className="week-card">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="week-number">{idx + 1}</div>
                      <div className="flex-1">
                        <p className="label" style={{ color: "var(--accent)", marginBottom: 3 }}>{label}</p>
                        <p className="heading-sm" style={{ color: "var(--text)" }}>{data.goal}</p>
                      </div>
                    </div>
                    <ol className="flex flex-col gap-2.5 mb-4">
                      {data.actions.map((a, ai) => (
                        <li key={ai} className="flex gap-2.5">
                          <div className="step-num">{ai + 1}</div>
                          <span className="body-sm" style={{ color: "var(--text2)", paddingTop: 1 }}>{a}</span>
                        </li>
                      ))}
                    </ol>
                    <span className="badge badge-orange">
                      Target: {data.target_customers} {data.target_customers === 1 ? "customer" : "customers"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Key Insights ── */}
            <div className="fade-up delay-6">
              <SectionHeader icon="💡" title="Key Insights" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="insight-blue">
                  <p className="label" style={{ color: "var(--blue)", marginBottom: 10 }}>💰 Pricing Feedback</p>
                  <p className="body-sm" style={{ color: "var(--text)" }}>{result.pricing_feedback}</p>
                </div>
                <div className="insight-red">
                  <p className="label" style={{ color: "var(--red)", marginBottom: 10 }}>⚠ Biggest Mistake</p>
                  <p className="body-sm" style={{ color: "var(--text)" }}>{result.biggest_mistake}</p>
                </div>
                <div className="insight-green">
                  <p className="label" style={{ color: "var(--green)", marginBottom: 10 }}>⚡ Unfair Advantage</p>
                  <p className="body-sm" style={{ color: "var(--text)" }}>{result.unfair_advantage}</p>
                </div>
              </div>
              {result.competitor_gap && (
                <div className="insight-yellow">
                  <p className="label" style={{ color: "var(--yellow)", marginBottom: 8 }}>🎯 Competitor Gap to Exploit</p>
                  <p className="body-sm" style={{ color: "var(--text)" }}>{result.competitor_gap}</p>
                </div>
              )}
            </div>

            {/* ── Validation Experiments ── */}
            <div className="fade-up delay-7">
              <SectionHeader icon="🧪" title="Validation Experiments" sub="Run each in under 48 hours to prove demand" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.validation_experiments.map((exp, i) => (
                  <div key={i} className="card card-hover" style={{ padding: 24 }}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="step-num" style={{ width: 26, height: 26, borderRadius: 8, fontSize: "0.75rem" }}>{i + 1}</div>
                      <h4 className="heading-sm" style={{ color: "var(--text)" }}>{exp.experiment}</h4>
                    </div>
                    <p className="label" style={{ color: "var(--blue)", marginBottom: 6 }}>How to Run</p>
                    <p className="body-sm" style={{ color: "var(--text2)", marginBottom: 14 }}>{exp.how}</p>
                    <div style={{
                      background: "var(--green-dim)", border: "1px solid rgba(34,197,94,0.15)",
                      borderRadius: "var(--r-sm)", padding: "10px 12px",
                    }}>
                      <p className="label" style={{ color: "var(--green)", marginBottom: 4 }}>✓ Success Metric</p>
                      <p className="body-sm" style={{ color: "var(--text)" }}>{exp.success_metric}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Red Flags + Quick Wins ── */}
            <div className="fade-up delay-8">
              <SectionHeader icon="🎯" title="Red Flags & Quick Wins" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Red Flags */}
                <div className="card" style={{ padding: 28 }}>
                  <p className="label" style={{ color: "var(--red)", marginBottom: 16 }}>🚩 Watch Out For</p>
                  <div className="flex flex-col gap-3">
                    {result.red_flags.map((f, i) => (
                      <div key={i} style={{
                        background: "var(--red-dim)", border: "1px solid rgba(239,68,68,0.15)",
                        borderRadius: "var(--r-sm)", padding: "12px 14px",
                        display: "flex", gap: 10,
                      }}>
                        <span style={{ color: "var(--red)", flexShrink: 0, marginTop: 1 }}>⚠</span>
                        <p className="body-sm" style={{ color: "var(--text)" }}>{f}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Wins */}
                <div className="card" style={{ padding: 28 }}>
                  <p className="label" style={{ color: "var(--green)", marginBottom: 16 }}>⚡ Do These Today</p>
                  <div className="flex flex-col gap-3">
                    {result.quick_wins.map((w, i) => (
                      <div key={i} style={{
                        background: "var(--green-dim)", border: "1px solid rgba(34,197,94,0.15)",
                        borderRadius: "var(--r-sm)", padding: "12px 14px",
                        display: "flex", gap: 10,
                      }}>
                        <div className="step-num" style={{
                          background: "rgba(34,197,94,0.2)", color: "var(--green)",
                          flexShrink: 0, borderRadius: 99, width: 20, height: 20, fontSize: "0.65rem",
                        }}>{i + 1}</div>
                        <div>
                          <span style={{
                            display: "inline-block", fontSize: "0.625rem", fontWeight: 800,
                            letterSpacing: "0.08em", textTransform: "uppercase",
                            color: "var(--green)", marginBottom: 4,
                          }}>Quick Win</span>
                          <p className="body-sm" style={{ color: "var(--text)" }}>{w}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Reset Button ── */}
            <div className="fade-up delay-9 text-center pt-4">
              <button onClick={reset} className="btn btn-secondary">
                ← Analyze Another Startup
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ╔══ HOW IT WORKS ══╗ */}
      {!result && (
        <section style={{ padding: "0 20px 96px" }}>
          <div className="max-w-5xl mx-auto">
            <div className="divider" style={{ marginBottom: 64 }} />
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <p className="label" style={{ marginBottom: 12 }}>Process</p>
              <h2 className="heading-xl" style={{ color: "var(--text)" }}>From idea to strategy in 60 seconds</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { n: "01", icon: "✍️", title: "Describe Your Startup", body: "Fill in 6 fields about your problem, solution, market, and pricing. Takes under a minute." },
                { n: "02", icon: "🤖", title: "Gemini Analyzes Everything", body: "Google Gemini 2.5 Flash analyzes your market fit, pricing, positioning, and acquisition signals." },
                { n: "03", icon: "🎯", title: "Get Your Full Strategy", body: "Receive 3 personas, 5 channels, 4 outreach scripts, and a complete 30-day plan — ready to execute today." },
              ].map(s => (
                <div key={s.n} className="how-card">
                  <div className="how-num">{s.n}</div>
                  <div style={{ marginTop: 20, marginBottom: 10, fontSize: "1.5rem" }}>{s.icon}</div>
                  <h3 className="heading-sm" style={{ color: "var(--text)", marginBottom: 8 }}>{s.title}</h3>
                  <p className="body-sm" style={{ color: "var(--text2)" }}>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ╔══ FOOTER ══╗ */}
      <footer style={{
        borderTop: "1px solid var(--border)", padding: "24px 20px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 24, flexWrap: "wrap",
      }}>
        <span className="body-sm" style={{ color: "var(--text3)" }}>
          Built by{" "}
          <a href="https://thrishanth-portfolio.vercel.app" target="_blank" rel="noopener noreferrer"
            className="footer-link" style={{ color: "var(--accent)", fontWeight: 600 }}>
            S. Thrishanth Reddy
          </a>
        </span>
        <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--border2)" }} />
        <span className="body-sm" style={{ color: "var(--text3)" }}>Powered by Google Gemini AI</span>
        <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--border2)" }} />
        <a href="https://firstcustomer-ai.vercel.app" className="footer-link" style={{ fontSize: "0.8125rem" }}>
          firstcustomer-ai.vercel.app
        </a>
      </footer>
    </div>
  );
}
