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
interface WeekPlan { goal: string; actions: string[]; target_customers: number; }
interface ValidationExperiment { experiment: string; how: string; success_metric: string; }
interface AnalysisResult {
  startup_score: number;
  score_label: string;
  one_liner: string;
  ideal_customer_profiles: CustomerPersona[];
  top_channels: AcquisitionChannel[];
  outreach_scripts: OutreachScripts;
  first_10_customers_plan: { week_1: WeekPlan; week_2: WeekPlan; week_3: WeekPlan; week_4: WeekPlan; };
  pricing_feedback: string;
  biggest_mistake: string;
  unfair_advantage: string;
  competitor_gap: string;
  validation_experiments: ValidationExperiment[];
  red_flags: string[];
  quick_wins: string[];
}
interface StartupInput {
  startup_name: string; problem: string; solution: string;
  target_market: string; pricing: string; stage: string;
}
interface WeekEntry { key: string; label: string; data: WeekPlan; }

const STAGE_OPTIONS = [
  "Just an idea", "Building MVP",
  "MVP ready — no customers yet", "Have 1-2 beta users",
];
const SCRIPT_TABS = ["Cold Email", "LinkedIn DM", "Twitter DM", "Reddit Post"] as const;
type ScriptTab = (typeof SCRIPT_TABS)[number];

/* ─── Helpers ─────────────────────────────────────────────────── */
function diffBadge(d: string) { return d === "Easy" ? "badge-green" : d === "Hard" ? "badge-red" : "badge-orange"; }
function costBadge(c: string) { return c === "Free" ? "badge-green" : c === "High" ? "badge-red" : c === "Low" ? "badge-blue" : "badge-orange"; }
function painBadge(p: string) { return p === "High" ? "badge-red" : p === "Low" ? "badge-green" : "badge-yellow"; }
function scoreColor(s: number) { return s >= 80 ? "var(--green)" : s >= 60 ? "var(--accent)" : "var(--red)"; }

/* ─── ScoreRing ───────────────────────────────────────────────── */
function ScoreRing({ score }: { score: number }) {
  const r = 50;
  const circ = 2 * Math.PI * r;
  const [dash, setDash] = useState(`0 ${circ}`);
  useEffect(() => {
    const t = setTimeout(() => setDash(`${(score / 100) * circ} ${circ}`), 250);
    return () => clearTimeout(t);
  }, [score, circ]);
  const color = scoreColor(score);
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle className="score-ring-track" cx="64" cy="64" r={r} />
        <circle className="score-ring-fill" cx="64" cy="64" r={r}
          stroke={color} strokeDasharray={dash}
          style={{ transition: "stroke-dasharray 1.8s ease-out" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold leading-none" style={{ color }}>{score}</span>
        <span className="text-xs font-semibold mt-0.5" style={{ color: "var(--faint)" }}>/100</span>
      </div>
    </div>
  );
}

/* ─── CopyButton ──────────────────────────────────────────────── */
function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(text); }
    catch { const el = document.createElement("textarea"); el.value = text; document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el); }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className={`copy-btn${copied ? " copied" : ""}`}>
      {copied ? (<><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>Copied</>) : (<><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>{label}</>)}
    </button>
  );
}

/* ─── Section heading ─────────────────────────────────────────── */
function SectionHeading({ num, title, sub }: { num: string; title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-baseline gap-3">
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--accent)" }}>{num}</span>
        <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>{title}</h2>
      </div>
      {sub && <p className="text-sm mt-1 ml-9" style={{ color: "var(--muted)" }}>{sub}</p>}
    </div>
  );
}

/* ─── FormField ───────────────────────────────────────────────── */
function FormField({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>{label}</label>
      {hint && <p className="text-xs mb-2" style={{ color: "var(--faint)" }}>{hint}</p>}
      {children}
      {error && <p className="mt-1 text-xs font-medium" style={{ color: "var(--red)" }}>{error}</p>}
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────── */
export default function HomePage() {
  const [form, setForm] = useState<StartupInput>({ startup_name: "", problem: "", solution: "", target_market: "", pricing: "", stage: "" });
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [apiError, setApiError] = useState("");
  const [activePersona, setActivePersona] = useState(0);
  const [activeScript, setActiveScript] = useState<ScriptTab>("Cold Email");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof StartupInput, string>>>({});

  const resultsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLElement>(null);

  const validate = () => {
    const e: Partial<Record<keyof StartupInput, string>> = {};
    if (!form.startup_name.trim()) e.startup_name = "Required";
    if (!form.problem.trim()) e.problem = "Required";
    if (!form.solution.trim()) e.solution = "Required";
    if (!form.target_market.trim()) e.target_market = "Required";
    if (!form.pricing.trim()) e.pricing = "Required";
    if (!form.stage) e.stage = "Please select your stage";
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setAnalyzing(true); setApiError(""); setResult(null);
    try {
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      let data: unknown;
      try { data = await res.json(); } catch { throw new Error(`Server error ${res.status}`); }
      if (!res.ok) throw new Error((data as { detail?: string })?.detail ?? `Error ${res.status}`);
      setResult(data as AnalysisResult);
      setActivePersona(0); setActiveScript("Cold Email");
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) { setApiError(err instanceof Error ? err.message : "Something went wrong."); }
    finally { setAnalyzing(false); }
  };

  const handleReset = () => {
    setResult(null); setApiError(""); setFieldErrors({});
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const scriptText = (): string => {
    if (!result) return "";
    const s = result.outreach_scripts;
    switch (activeScript) {
      case "Cold Email": return `Subject: ${s.cold_email.subject}\n\n${s.cold_email.body}`;
      case "LinkedIn DM": return s.linkedin_dm;
      case "Twitter DM": return s.twitter_dm;
      case "Reddit Post": return `r/${s.reddit_post.subreddit}\n\nTitle: ${s.reddit_post.title}\n\n${s.reddit_post.body}`;
    }
  };

  const weeks: WeekEntry[] = result ? [
    { key: "w1", label: "Week 1", data: result.first_10_customers_plan.week_1 },
    { key: "w2", label: "Week 2", data: result.first_10_customers_plan.week_2 },
    { key: "w3", label: "Week 3", data: result.first_10_customers_plan.week_3 },
    { key: "w4", label: "Week 4", data: result.first_10_customers_plan.week_4 },
  ] : [];

  const persona = result?.ideal_customer_profiles[activePersona];

  /* ── JSX ── */
  return (
    <div className="min-h-screen page-bg">

      {/* ━━ NAVBAR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <header style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <span className="text-base font-bold tracking-tight" style={{ color: "var(--text)" }}>
            FirstCustomer<span style={{ color: "var(--accent)" }}>.</span>ai
          </span>
          <a
            href="https://thrishanth-portfolio.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium transition-colors"
            style={{ color: "var(--muted)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
          >
            by Thrishanth Reddy ↗
          </a>
        </div>
      </header>

      {/* ━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="pt-20 pb-14 px-5 sm:px-8 max-w-5xl mx-auto">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="accent-line" />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
              For early-stage founders
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-5" style={{ color: "var(--text)", letterSpacing: "-0.02em" }}>
            Stop building.<br />
            <span style={{ color: "var(--accent)" }}>Go get customers.</span>
          </h1>

          <p className="text-base sm:text-lg leading-relaxed mb-10" style={{ color: "var(--muted)", maxWidth: "480px" }}>
            Tell me about your startup and I&apos;ll give you the exact people to target,
            where to find them, what to say, and a week-by-week plan to close your
            first 10 paying customers.
          </p>

          <div className="flex flex-wrap gap-6">
            {[
              { n: "3", label: "real customer personas" },
              { n: "5", label: "acquisition channels" },
              { n: "30", label: "day action plan" },
            ].map(s => (
              <div key={s.label}>
                <span className="text-2xl font-extrabold" style={{ color: "var(--text)" }}>{s.n}</span>
                <span className="text-sm ml-2" style={{ color: "var(--muted)" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ FORM ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section ref={formRef} className="px-5 sm:px-8 pb-20 max-w-5xl mx-auto">
        <div className="max-w-2xl">
          <div
            className="p-7 sm:p-9"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
          >
            <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text)" }}>Tell me about your startup</h2>
            <p className="text-sm mb-7" style={{ color: "var(--muted)" }}>
              Be specific — the more context you give, the more precise the strategy.
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <FormField label="Startup name" error={fieldErrors.startup_name}>
                <input type="text" className="form-input" placeholder="e.g. TaskFlow AI"
                  value={form.startup_name} onChange={e => setForm(p => ({ ...p, startup_name: e.target.value }))} />
              </FormField>

              <FormField label="What problem do you solve?" hint="Be specific about the pain — the more concrete, the better." error={fieldErrors.problem}>
                <textarea rows={3} className="form-input resize-none"
                  placeholder="e.g. Developers waste 2 hours daily waiting for code reviews, which delays releases by days each sprint..."
                  value={form.problem} onChange={e => setForm(p => ({ ...p, problem: e.target.value }))} />
              </FormField>

              <FormField label="How do you solve it?" hint="What does your product actually do?" error={fieldErrors.solution}>
                <textarea rows={3} className="form-input resize-none"
                  placeholder="e.g. AI that does an instant first-pass review and catches bugs before a human ever sees the PR..."
                  value={form.solution} onChange={e => setForm(p => ({ ...p, solution: e.target.value }))} />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField label="Who is your target market?" error={fieldErrors.target_market}>
                  <input type="text" className="form-input"
                    placeholder="e.g. SaaS startups with 5-25 devs"
                    value={form.target_market} onChange={e => setForm(p => ({ ...p, target_market: e.target.value }))} />
                </FormField>
                <FormField label="Your pricing" error={fieldErrors.pricing}>
                  <input type="text" className="form-input"
                    placeholder="e.g. $79/month per team"
                    value={form.pricing} onChange={e => setForm(p => ({ ...p, pricing: e.target.value }))} />
                </FormField>
              </div>

              <FormField label="Where are you right now?" error={fieldErrors.stage}>
                <select className="form-input" value={form.stage} onChange={e => setForm(p => ({ ...p, stage: e.target.value }))}>
                  <option value="" disabled>Select your current stage…</option>
                  {STAGE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </FormField>

              {apiError && (
                <div className="p-4 rounded-lg text-sm leading-relaxed"
                  style={{ background: "rgba(224,82,82,0.08)", border: "1px solid rgba(224,82,82,0.22)", color: "var(--red)" }}>
                  <strong>Error —</strong> {apiError}
                </div>
              )}

              <button type="submit" disabled={analyzing}
                className="btn-primary w-full flex items-center justify-center gap-3 mt-2"
                style={{ padding: "15px", fontSize: "0.975rem" }}>
                {analyzing ? (<><span className="spinner" />Working on your strategy…</>) : "Build my customer acquisition strategy →"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ━━ RESULTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {result && (
        <section ref={resultsRef} className="px-5 sm:px-8 pb-24 max-w-5xl mx-auto space-y-12">

          {/* ── Score + One-liner ── */}
          <div className="fade-up delay-1">
            <div style={{ borderTop: "2px solid var(--accent)", paddingTop: "32px" }}>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-8">

                <div className="flex items-center gap-5 flex-shrink-0">
                  <ScoreRing score={result.startup_score} />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--muted)" }}>GTM Score</p>
                    <p className="text-xl font-bold" style={{ color: "var(--text)" }}>{result.score_label}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--faint)" }}>customer acquisition readiness</p>
                  </div>
                </div>

                <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: "2rem" }} className="flex-1 hidden md:block" />

                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>How to describe your startup in one sentence</p>
                  <p className="text-xl font-semibold leading-snug" style={{ color: "var(--text)" }}>
                    &ldquo;{result.one_liner}&rdquo;
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-8">
                {[
                  { n: result.ideal_customer_profiles?.length ?? 3, label: "customer personas" },
                  { n: result.top_channels?.length ?? 5, label: "acquisition channels" },
                  { n: weeks.reduce((a, w) => a + w.data.target_customers, 0), label: "target customers" },
                ].map(s => (
                  <div key={s.label} className="stat-block">
                    <div className="text-xl font-extrabold" style={{ color: "var(--accent)" }}>{s.n}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Personas ── */}
          <div className="fade-up delay-2">
            <SectionHeading num="01" title="Your ideal customers" sub="Three distinct profiles — each with buying triggers, objections, and where to find them" />

            <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
              {result.ideal_customer_profiles.map((p, i) => (
                <button key={i} className={`tab-btn${activePersona === i ? " active" : ""}`} onClick={() => setActivePersona(i)}>
                  {p.name.split(" ").slice(0, 3).join(" ")}
                </button>
              ))}
            </div>

            {persona && (
              <div className="card p-6 sm:p-7">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <h3 className="text-lg font-bold" style={{ color: "var(--text)" }}>{persona.name}</h3>
                  <span className="badge badge-blue">{persona.role}</span>
                  <span className="badge badge-muted">{persona.age_range}</span>
                  <span className={`badge ${painBadge(persona.pain_level)}`}>{persona.pain_level} pain</span>
                </div>

                <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--muted)" }}>{persona.description}</p>

                <div className="mb-5">
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--faint)" }}>Where to find them</p>
                  <div className="flex flex-wrap gap-2">
                    {persona.where_to_find.map((loc, j) => (
                      <span key={j} className="location-pill">{loc}</span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg" style={{ background: "rgba(61,186,112,0.07)", border: "1px solid rgba(61,186,112,0.18)" }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--green)" }}>What makes them buy</p>
                    <p className="text-sm" style={{ color: "var(--text)" }}>{persona.buying_trigger}</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ background: "rgba(212,160,23,0.07)", border: "1px solid rgba(212,160,23,0.18)" }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--yellow)" }}>Their biggest objection</p>
                    <p className="text-sm mb-3" style={{ color: "var(--text)" }}>{persona.objection}</p>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--yellow)" }}>How to answer it</p>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>{persona.objection_handle}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Channels ── */}
          <div className="fade-up delay-3">
            <SectionHeading num="02" title="Where to find your first customers" sub="Ranked by how fast you can get someone on the phone" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.top_channels.map((ch, i) => (
                <div key={i} className="card card-accent-hover p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-base" style={{ color: "var(--text)" }}>{ch.channel}</h3>
                    <span className="text-xs font-bold ml-2 flex-shrink-0" style={{ color: "var(--faint)" }}>#{i + 1}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className={`badge ${diffBadge(ch.difficulty)}`}>{ch.difficulty}</span>
                    <span className={`badge ${costBadge(ch.cost)}`}>{ch.cost}</span>
                    <span className="badge badge-muted">{ch.time_to_first_customer}</span>
                  </div>

                  <p className="text-sm leading-relaxed mb-0" style={{ color: "var(--muted)" }}>{ch.strategy}</p>

                  <div className="first-action-box">
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--accent)" }}>Do this today</p>
                    <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{ch.first_action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Scripts ── */}
          <div className="fade-up delay-4">
            <SectionHeading num="03" title="What to say" sub="Copy these exactly — they're written for your specific startup" />

            <div className="card p-6 sm:p-7">
              <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                {SCRIPT_TABS.map(t => (
                  <button key={t} className={`tab-btn${activeScript === t ? " active" : ""}`} onClick={() => setActiveScript(t)}>{t}</button>
                ))}
              </div>

              <div>
                {activeScript === "Cold Email" && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>Subject line — </span>
                      <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{result.outreach_scripts.cold_email.subject}</span>
                    </div>
                    <div className="script-box">{result.outreach_scripts.cold_email.body}</div>
                  </div>
                )}
                {activeScript === "LinkedIn DM" && (
                  <div className="space-y-2">
                    <div className="script-box">{result.outreach_scripts.linkedin_dm}</div>
                    <p className="text-xs text-right" style={{ color: "var(--faint)" }}>{result.outreach_scripts.linkedin_dm.length} / 300 chars</p>
                  </div>
                )}
                {activeScript === "Twitter DM" && (
                  <div className="space-y-2">
                    <div className="script-box">{result.outreach_scripts.twitter_dm}</div>
                    <p className="text-xs text-right" style={{ color: "var(--faint)" }}>{result.outreach_scripts.twitter_dm.length} / 280 chars</p>
                  </div>
                )}
                {activeScript === "Reddit Post" && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: "rgba(245,90,44,0.1)", color: "var(--accent)", border: "1px solid rgba(245,90,44,0.2)" }}>
                      r/{result.outreach_scripts.reddit_post.subreddit}
                    </span>
                    <div className="p-3 rounded-lg text-sm font-bold" style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }}>
                      {result.outreach_scripts.reddit_post.title}
                    </div>
                    <div className="script-box">{result.outreach_scripts.reddit_post.body}</div>
                  </div>
                )}
                <div className="flex justify-end mt-4">
                  <CopyButton text={scriptText()} label="Copy script" />
                </div>
              </div>
            </div>
          </div>

          {/* ── 30-Day Plan ── */}
          <div className="fade-up delay-5">
            <SectionHeading num="04" title="Your 30-day plan" sub="Specific actions for each week — not vague advice" />

            <div className="progress-track mb-6">
              <div className="progress-fill" style={{ width: "100%" }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {weeks.map(({ key, label, data }, idx) => (
                <div key={key} className="week-card">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="week-number mt-0.5">{idx + 1}</div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--accent)" }}>{label}</p>
                      <p className="text-sm font-bold mt-0.5" style={{ color: "var(--text)" }}>{data.goal}</p>
                    </div>
                  </div>
                  <ol className="space-y-2 mb-4">
                    {data.actions.map((a, ai) => (
                      <li key={ai} className="flex gap-3 text-sm">
                        <span className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center text-xs font-bold mt-0.5"
                          style={{ background: "rgba(245,90,44,0.12)", color: "var(--accent)" }}>{ai + 1}</span>
                        <span style={{ color: "var(--muted)" }}>{a}</span>
                      </li>
                    ))}
                  </ol>
                  <span className="badge badge-orange">Target: {data.target_customers} customer{data.target_customers !== 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Insights ── */}
          <div className="fade-up delay-6">
            <SectionHeading num="05" title="Honest feedback on your startup" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="insight-card insight-card-blue">
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--blue)" }}>On your pricing</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{result.pricing_feedback}</p>
              </div>
              <div className="insight-card insight-card-red">
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--red)" }}>Biggest mistake to avoid</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{result.biggest_mistake}</p>
              </div>
              <div className="insight-card insight-card-green">
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--green)" }}>Your unfair advantage</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{result.unfair_advantage}</p>
              </div>
            </div>
            {result.competitor_gap && (
              <div className="p-5 rounded-lg" style={{ background: "rgba(212,160,23,0.07)", border: "1px solid rgba(212,160,23,0.18)" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--yellow)" }}>Gap in the market you can own</p>
                <p className="text-sm" style={{ color: "var(--text)" }}>{result.competitor_gap}</p>
              </div>
            )}
          </div>

          {/* ── Validation Experiments ── */}
          <div className="fade-up delay-7">
            <SectionHeading num="06" title="Validate demand in 48 hours" sub="Run each of these before you build another feature" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.validation_experiments.map((exp, i) => (
                <div key={i} className="card card-hover p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: "rgba(245,90,44,0.12)", color: "var(--accent)" }}>{i + 1}</span>
                    <h4 className="font-bold text-sm" style={{ color: "var(--text)" }}>{exp.experiment}</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--blue)" }}>How</p>
                      <p className="text-sm" style={{ color: "var(--muted)" }}>{exp.how}</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ background: "rgba(61,186,112,0.07)", border: "1px solid rgba(61,186,112,0.15)" }}>
                      <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--green)" }}>You know it worked when</p>
                      <p className="text-xs" style={{ color: "var(--text)" }}>{exp.success_metric}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Red Flags + Quick Wins ── */}
          <div className="fade-up delay-8">
            <SectionHeading num="07" title="Watch out / do this today" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card p-5">
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--red)" }}>Things that could kill traction</p>
                <div className="space-y-3">
                  {result.red_flags.map((flag, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg text-sm"
                      style={{ background: "rgba(224,82,82,0.07)", border: "1px solid rgba(224,82,82,0.15)" }}>
                      <span className="flex-shrink-0 font-bold mt-0.5" style={{ color: "var(--red)" }}>!</span>
                      <p style={{ color: "var(--text)" }}>{flag}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5">
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--green)" }}>Things to do in the next 24 hours</p>
                <div className="space-y-3">
                  {result.quick_wins.map((win, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg"
                      style={{ background: "rgba(61,186,112,0.07)", border: "1px solid rgba(61,186,112,0.15)" }}>
                      <span className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-xs font-bold mt-0.5"
                        style={{ background: "rgba(61,186,112,0.18)", color: "var(--green)" }}>{i + 1}</span>
                      <p className="text-sm" style={{ color: "var(--text)" }}>{win}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Reset ── */}
          <div className="fade-up delay-9 pt-4 flex items-center gap-4">
            <button onClick={handleReset} className="btn-primary">
              Analyze another startup →
            </button>
            <p className="text-sm" style={{ color: "var(--faint)" }}>or scroll back up to edit your inputs</p>
          </div>
        </section>
      )}

      {/* ━━ HOW IT WORKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {!result && (
        <section className="px-5 sm:px-8 py-16 max-w-5xl mx-auto">
          <hr className="section-divider" />

          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>How it works</p>
            <h2 className="text-2xl font-bold" style={{ color: "var(--text)", letterSpacing: "-0.02em" }}>Three steps, under two minutes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: "01", title: "Describe your startup", body: "Fill in the 6 fields above. The more specific you are about the problem and who has it, the sharper the output." },
              { n: "02", title: "AI does the research", body: "Gemini analyzes your market, ICP, pricing, competition, and positioning — then generates a strategy tailored to your exact situation." },
              { n: "03", title: "Execute the plan", body: "Copy the outreach scripts, work through the 30-day plan week by week. Real actions, not vague frameworks." },
            ].map(s => (
              <div key={s.n} className="card card-hover p-6">
                <div className="step-num mb-4">{s.n}</div>
                <h3 className="text-base font-bold mb-2" style={{ color: "var(--text)" }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{s.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ━━ FOOTER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer className="px-5 sm:px-8 py-7 text-sm" style={{ borderTop: "1px solid var(--border)", color: "var(--faint)" }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Built by <a href="https://thrishanth-portfolio.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: "var(--muted)" }} className="hover:underline">S. Thrishanth Reddy</a></span>
          <span>Powered by Google Gemini AI</span>
        </div>
      </footer>
    </div>
  );
}
