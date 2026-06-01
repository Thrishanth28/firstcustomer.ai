import { NextRequest, NextResponse } from "next/server";

// Allow up to 60 seconds for Gemini to respond (Vercel hobby supports up to 60s)
export const maxDuration = 60;

// Models ordered by quality — only ones confirmed working on this key
const GEMINI_MODELS = [
  "gemini-2.5-flash",       // best quality
  "gemini-2.5-flash-lite",  // fast & cheap
  "gemini-flash-latest",    // auto-routed alias
  "gemini-flash-lite-latest", // lightest fallback
];
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

interface StartupInput {
  startup_name: string;
  problem: string;
  solution: string;
  target_market: string;
  pricing: string;
  stage: string;
}

function buildPrompt(data: StartupInput): string {
  return `You are a world-class go-to-market strategist who has helped 500+ early-stage startups get their first 10 paying customers.

A founder has described their startup. Analyze it deeply and return ONLY valid JSON — no extra text, no markdown, no code fences — just the raw JSON object completely filled out with real, specific, actionable content tailored to this exact startup:

{
  "startup_score": 72,
  "score_label": "Strong",
  "one_liner": "example one liner",
  "ideal_customer_profiles": [
    {
      "name": "Sarah the SaaS Founder",
      "role": "Co-Founder & CEO",
      "age_range": "28-40",
      "pain_level": "High",
      "description": "Sarah runs a 5-person SaaS startup and spends 2 hours daily on manual code reviews. She needs to ship faster but cannot afford to hire a senior engineer just for reviews.",
      "where_to_find": [
        "r/startups and r/SaaS on Reddit",
        "Indie Hackers community forums",
        "YC Startup School Slack"
      ],
      "buying_trigger": "Just shipped a bug to production that a proper code review would have caught",
      "objection": "We already use GitHub built-in review tools",
      "objection_handle": "GitHub flags syntax errors. We catch business logic bugs, security holes, and architectural issues that require domain understanding — the bugs that actually reach production."
    },
    {
      "name": "Marcus the Engineering Manager",
      "role": "Engineering Manager",
      "age_range": "32-45",
      "pain_level": "High",
      "description": "Marcus manages 8 developers and is drowning in PR review queues. Developers wait 3-4 hours for reviews, killing their momentum.",
      "where_to_find": [
        "r/ExperiencedDevs on Reddit",
        "Engineering leadership Slack communities",
        "LinkedIn Engineering Manager groups"
      ],
      "buying_trigger": "Quarter-end sprint is delayed because review bottlenecks piled up",
      "objection": "My team will not trust AI reviews",
      "objection_handle": "Start with AI as a first-pass filter. It catches 70% of issues before human review, so your senior devs spend time on the 30% that actually needs their expertise."
    },
    {
      "name": "David the Solo Developer",
      "role": "Freelance Developer",
      "age_range": "24-38",
      "pain_level": "Medium",
      "description": "David builds client projects alone and has no one to review his code. A single bug costs him client trust and unpaid debugging time.",
      "where_to_find": [
        "r/freelance and r/webdev on Reddit",
        "Dev.to community",
        "Toptal community forums"
      ],
      "buying_trigger": "A client rejected a deliverable due to a bug David would have caught with a second pair of eyes",
      "objection": "I can just use free linters",
      "objection_handle": "Linters check formatting. We review logic, security vulnerabilities, and edge cases — the stuff that breaks in production at 2am."
    }
  ],
  "top_channels": [
    {
      "channel": "Reddit Communities",
      "difficulty": "Easy",
      "time_to_first_customer": "3-7 days",
      "cost": "Free",
      "strategy": "Post genuinely helpful content in relevant subreddits. Share a real story about the problem you solve. Mention your tool naturally at the end. Do NOT promote — teach first.",
      "first_action": "Write a post sharing a real insight about the problem you solve and post it to the most relevant subreddit today."
    },
    {
      "channel": "Cold Email Outreach",
      "difficulty": "Medium",
      "time_to_first_customer": "1-2 weeks",
      "cost": "Low",
      "strategy": "Find decision-makers at target companies on LinkedIn. Use Apollo.io to find emails. Send a 5-line email referencing a specific challenge visible on their company blog. Aim for 2% reply rate.",
      "first_action": "Export 50 decision-maker profiles from LinkedIn filtered to your ICP, then verify emails with Hunter.io."
    },
    {
      "channel": "LinkedIn Content",
      "difficulty": "Medium",
      "time_to_first_customer": "2-4 weeks",
      "cost": "Free",
      "strategy": "Post 3x per week about the problem you solve. Share data and specific examples. Engage in comments on posts by your ICP. Your content should attract inbound DMs.",
      "first_action": "Write a LinkedIn post about the number 1 mistake your target customer makes, based on your real experience. Post it today."
    },
    {
      "channel": "Developer Communities and Slack Groups",
      "difficulty": "Easy",
      "time_to_first_customer": "1-2 weeks",
      "cost": "Free",
      "strategy": "Join 10 relevant Slack workspaces and communities. Spend 1 week being genuinely helpful. Then share your tool when someone asks a relevant question.",
      "first_action": "Join 3 Slack communities where your ICP hangs out today and read recent messages to understand what they are struggling with."
    },
    {
      "channel": "Product Hunt Launch",
      "difficulty": "Hard",
      "time_to_first_customer": "1 day (launch day)",
      "cost": "Free",
      "strategy": "Prepare a polished Product Hunt launch with a compelling demo GIF, 5 clear bullet points on what makes you different, and a launch day offer. Rally 20 supporters to upvote at 12:01am PST.",
      "first_action": "Create your Product Hunt draft page today and DM 20 friendly contacts asking them to support your launch."
    }
  ],
  "outreach_scripts": {
    "cold_email": {
      "subject": "Quick question about your process",
      "body": "Hi [Name],\\n\\nI noticed [Company] is scaling fast.\\n\\nQuick question: how are you handling [specific pain point]? I ask because most [ICP role] I talk to lose significant time on this every week.\\n\\nI built a tool that solves this automatically. Teams using it report strong results.\\n\\nWould it be worth sharing what it does for one of your real use cases as a free test?\\n\\n[Your name]"
    },
    "linkedin_dm": "Hey [Name] — saw your post about [relevant topic]. Built a tool that solves [pain point] automatically. Would a free test on one of your real projects be useful?",
    "twitter_dm": "Hey [Name]! Love your work on [project]. Built a tool that solves [pain point]. Free to try — want me to run it on your use case?",
    "reddit_post": {
      "subreddit": "startups",
      "title": "I built a tool to solve [problem] after experiencing it firsthand — here is what I learned",
      "body": "After struggling with [problem] myself, I spent weeks building a tool that solves it automatically.\\n\\nWhat I learned:\\n- [Insight 1]\\n- [Insight 2]\\n- [Insight 3]\\n\\nHappy to give free access to anyone willing to share feedback. Drop a comment or DM me."
    }
  },
  "first_10_customers_plan": {
    "week_1": {
      "goal": "Get 10 genuine conversations with your ICP",
      "actions": [
        "Post 2 value-driven pieces of content in relevant communities",
        "Send 20 personalized cold emails to your exact ICP",
        "Join 5 relevant communities and spend 1 hour per day being genuinely helpful"
      ],
      "target_customers": 2
    },
    "week_2": {
      "goal": "Convert conversations into free trials",
      "actions": [
        "Follow up on all week 1 replies with a specific free trial offer",
        "DM 30 connections who engaged with your content",
        "Post a case study showing real results from your tool"
      ],
      "target_customers": 3
    },
    "week_3": {
      "goal": "Convert trial users to paying customers",
      "actions": [
        "Send personalized ROI summaries to each trial user",
        "Offer a founding customer deal with a time-limited discount",
        "Schedule calls with every trial user to gather feedback and close"
      ],
      "target_customers": 3
    },
    "week_4": {
      "goal": "Hit 10 paying customers and collect testimonials",
      "actions": [
        "Launch on Product Hunt with a founding customer offer",
        "Ask every paying customer for a referral with incentive",
        "Write a public post announcing your first 10 customers"
      ],
      "target_customers": 2
    }
  },
  "pricing_feedback": "Your pricing needs specific feedback based on your market and competitors.",
  "biggest_mistake": "The single biggest mistake is trying to sell to everyone instead of finding the one person in pain right now.",
  "unfair_advantage": "You have a unique advantage that most founders overlook — use it as your primary sales tool.",
  "competitor_gap": "There is a specific gap in the market that your competitors are missing completely.",
  "validation_experiments": [
    {
      "experiment": "Free Demo Audit",
      "how": "Find 20 potential customers online. Run your tool on their use case. Share the results with them and ask if they want the full version.",
      "success_metric": "5 of 20 respond positively and at least 2 ask for pricing"
    },
    {
      "experiment": "Landing Page Smoke Test",
      "how": "Create a simple landing page with a clear CTA. Run 50 dollars in targeted ads. Track email capture rate.",
      "success_metric": "Email capture rate above 15 percent means strong demand"
    },
    {
      "experiment": "Community Value Post",
      "how": "Write a detailed post in the most relevant community sharing genuine insights. Include a soft CTA for your tool at the end.",
      "success_metric": "20 or more upvotes and 5 or more people requesting access within 48 hours"
    }
  ],
  "red_flags": [
    "Building more features instead of selling: if you have fewer than 10 paying customers, every hour of coding is an hour not spent selling.",
    "Targeting a market that is too broad: get extremely specific about who your ideal customer is.",
    "Pricing too low: below a certain threshold signals the tool is a toy, not a professional product."
  ],
  "quick_wins": [
    "Post in the most relevant community right now offering free access in exchange for feedback.",
    "DM 10 people you already know who match your ICP and ask for 20 minutes of honest feedback.",
    "Search Twitter and Reddit for people complaining about your exact problem and reply to them today."
  ]
}

Now analyze THIS specific startup and return a JSON response in the EXACT same structure, but with every single field filled with specific, actionable, real content tailored to this startup. Every field must be different from the example above and specific to their market, product, and customers:

Startup Name: ${data.startup_name}
Problem they solve: ${data.problem}
Their solution: ${data.solution}
Target market: ${data.target_market}
Pricing: ${data.pricing}
Current stage: ${data.stage}

Return ONLY the JSON object. No markdown, no code fences, no explanation, no preamble.`;
}

function extractJson(text: string): unknown {
  let cleaned = text.trim();
  // Remove markdown code fences
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  // Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch {
    // Extract between first { and last }
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}") + 1;
    if (start !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end));
    }
    throw new Error("Could not extract valid JSON from Gemini response");
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { detail: "GEMINI_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  let body: StartupInput;
  try {
    body = (await req.json()) as StartupInput;
  } catch {
    return NextResponse.json({ detail: "Invalid JSON in request body." }, { status: 400 });
  }

  // Validate all fields
  const required: (keyof StartupInput)[] = [
    "startup_name", "problem", "solution", "target_market", "pricing", "stage",
  ];
  for (const field of required) {
    if (!body[field] || !body[field].trim()) {
      return NextResponse.json(
        { detail: `Field "${field}" must not be empty.` },
        { status: 422 }
      );
    }
  }

  const prompt = buildPrompt(body);

  const geminiPayload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    },
  };

  // Try each model in order; skip on 503/429 (overloaded/rate-limited)
  let geminiRes: Response | null = null;
  let lastError = "";

  for (const model of GEMINI_MODELS) {
    try {
      const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiPayload),
        signal: AbortSignal.timeout(55000),
      });

      // If the model is overloaded or not found, try the next one
      if (res.status === 503 || res.status === 429 || res.status === 404) {
        const txt = await res.text();
        lastError = `${model} → ${res.status}: ${txt.slice(0, 120)}`;
        continue;
      }

      geminiRes = res;
      break;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : "Network error";
      continue;
    }
  }

  if (!geminiRes) {
    // Check if the last error was a quota issue
    const isQuota = lastError.includes("quota") || lastError.includes("429");
    const msg = isQuota
      ? "The AI service has reached its free-tier limit. Please wait a few minutes and try again, or check your Gemini API quota at aistudio.google.com."
      : `AI service temporarily unavailable. Please try again in a moment. (${lastError.slice(0, 120)})`;
    return NextResponse.json({ detail: msg }, { status: 503 });
  }

  if (!geminiRes.ok) {
    const errorText = await geminiRes.text();
    const isQuota = errorText.includes("quota") || geminiRes.status === 429;
    const msg = isQuota
      ? "AI quota exceeded. Please wait a few minutes and try again."
      : `AI service error (${geminiRes.status}). Please try again shortly.`;
    return NextResponse.json({ detail: msg }, { status: 503 });
  }

  const geminiBody = (await geminiRes.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  const rawText = geminiBody?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    return NextResponse.json(
      { detail: "Gemini returned an empty or unexpected response." },
      { status: 502 }
    );
  }

  let analysis: unknown;
  try {
    analysis = extractJson(rawText);
  } catch {
    return NextResponse.json(
      {
        detail: `Gemini did not return valid JSON. Raw (first 500 chars): ${rawText.slice(0, 500)}`,
      },
      { status: 502 }
    );
  }

  return NextResponse.json(analysis);
}
