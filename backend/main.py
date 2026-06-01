import os
import json
import re
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="FirstCustomer.ai API", version="1.0.0")

# allow_credentials MUST be False when allow_origins=["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.5-flash:generateContent"
)


class StartupInput(BaseModel):
    startup_name: str
    problem: str
    solution: str
    target_market: str
    pricing: str
    stage: str

    @field_validator(
        "startup_name", "problem", "solution", "target_market", "pricing", "stage"
    )
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field must not be empty")
        return v.strip()


def build_prompt(data: StartupInput) -> str:
    return f"""You are a world-class go-to-market strategist who has helped 500+ early-stage startups get their first 10 paying customers.

A founder has described their startup. Analyze it deeply and return ONLY valid JSON — no extra text, no markdown, no code fences, no explanation — just the raw JSON object below completely filled out with real content (no placeholder strings like "<persona name>"):

{{
  "startup_score": 72,
  "score_label": "Strong",
  "one_liner": "example one liner",
  "ideal_customer_profiles": [
    {{
      "name": "Sarah the SaaS Founder",
      "role": "Co-Founder & CEO",
      "age_range": "28-40",
      "pain_level": "High",
      "description": "Sarah runs a 5-person SaaS startup and spends 2 hours daily on manual code reviews. She needs to ship faster but can't afford to hire a senior engineer just for reviews.",
      "where_to_find": [
        "r/startups and r/SaaS on Reddit",
        "Indie Hackers community forums",
        "YC Startup School Slack"
      ],
      "buying_trigger": "Just shipped a bug to production that a proper code review would have caught",
      "objection": "We already use GitHub's built-in review tools",
      "objection_handle": "GitHub flags syntax errors. We catch business logic bugs, security holes, and architectural issues that require domain understanding — the bugs that actually reach production."
    }},
    {{
      "name": "Marcus the Engineering Manager",
      "role": "Engineering Manager",
      "age_range": "32-45",
      "pain_level": "High",
      "description": "Marcus manages 8 developers and is drowning in PR review queues. Developers wait 3-4 hours for reviews, killing their momentum and his team's velocity.",
      "where_to_find": [
        "r/ExperiencedDevs on Reddit",
        "Engineering leadership Slack communities",
        "LinkedIn Engineering Manager groups"
      ],
      "buying_trigger": "Quarter-end sprint is delayed because review bottlenecks piled up",
      "objection": "My team won't trust AI reviews",
      "objection_handle": "Start with AI as a first-pass filter. It catches 70% of issues before human review, so your senior devs spend time on the 30% that actually needs their expertise."
    }},
    {{
      "name": "David the Solo Developer",
      "role": "Freelance Developer / Solopreneur",
      "age_range": "24-38",
      "pain_level": "Medium",
      "description": "David builds client projects alone and has no one to review his code. A single bug costs him client trust and unpaid debugging time.",
      "where_to_find": [
        "r/freelance and r/webdev on Reddit",
        "Toptal and Upwork community forums",
        "Dev.to community"
      ],
      "buying_trigger": "A client rejected a deliverable due to a bug David would have caught with a second pair of eyes",
      "objection": "I can just use free linters",
      "objection_handle": "Linters check formatting. We review logic, security vulnerabilities, and edge cases — the stuff that breaks in production at 2am."
    }}
  ],
  "top_channels": [
    {{
      "channel": "Reddit Communities",
      "difficulty": "Easy",
      "time_to_first_customer": "3-7 days",
      "cost": "Free",
      "strategy": "Post genuinely helpful content in r/startups, r/SaaS, and r/programming. Share a real story about a bug that a better code review would have caught. Mention your tool naturally at the end. Do NOT promote — teach first.",
      "first_action": "Write a post titled 'I analyzed 500 production bugs — here are the 5 patterns that keep appearing in code reviews' and post it to r/programming today."
    }},
    {{
      "channel": "Cold Email Outreach",
      "difficulty": "Medium",
      "time_to_first_customer": "1-2 weeks",
      "cost": "Low",
      "strategy": "Find CTOs and Engineering Managers at 20-50 person startups on LinkedIn. Use Apollo.io to find their work email. Send a 5-line email referencing a specific engineering challenge visible on their company blog or GitHub. Aim for 2% reply rate.",
      "first_action": "Export 50 Engineering Manager profiles from LinkedIn Sales Navigator filtered to SaaS companies with 10-50 employees, then verify emails with Hunter.io."
    }},
    {{
      "channel": "LinkedIn Content",
      "difficulty": "Medium",
      "time_to_first_customer": "2-4 weeks",
      "cost": "Free",
      "strategy": "Post 3x per week about engineering productivity, code quality, and startup scaling. Share data and specific examples. Engage in comments on posts by engineering leaders. Your content should attract inbound DMs from your exact ICP.",
      "first_action": "Write a LinkedIn post about the #1 mistake engineering teams make in code reviews, based on your real experience. Post it today and engage with every comment."
    }},
    {{
      "channel": "Developer Communities & Slack Groups",
      "difficulty": "Easy",
      "time_to_first_customer": "1-2 weeks",
      "cost": "Free",
      "strategy": "Join 10 developer Slack workspaces (Rands Leadership, Software Lead Weekly, local tech communities). Spend 1 week being genuinely helpful. Then share your tool when someone asks a relevant question.",
      "first_action": "Join Rands Leadership Slack today at randsinrepose.com/slack and spend 30 minutes reading recent messages to understand what engineering managers are struggling with right now."
    }},
    {{
      "channel": "Product Hunt Launch",
      "difficulty": "Hard",
      "time_to_first_customer": "1 day (launch day)",
      "cost": "Free",
      "strategy": "Prepare a polished Product Hunt launch with a compelling demo GIF, 5 clear bullet points on what makes you different, and a launch day offer (3 months free for early adopters). Rally 20 supporters to upvote at 12:01am PST.",
      "first_action": "Create your Product Hunt draft page today, upload screenshots, and DM 20 friendly contacts asking them to support your launch on the date you choose."
    }}
  ],
  "outreach_scripts": {{
    "cold_email": {{
      "subject": "Quick question about your code review process",
      "body": "Hi [Name],\\n\\nI noticed [Company] is scaling fast — congrats on the Series A.\\n\\nQuick question: how are you handling code review bottlenecks as the team grows? I ask because most engineering teams I talk to lose 3-5 hours per developer per week waiting for reviews.\\n\\nI built a tool that does the first-pass review automatically — catching the logic bugs and security issues that usually slip through. Teams using it report 60% faster PR cycle times.\\n\\nWould it be worth sharing what it flags on one of your recent PRs as a free test?\\n\\n[Your name]"
    }},
    "linkedin_dm": "Hey [Name] — saw your post about scaling your eng team. We built an AI code reviewer that cuts PR wait times by 60%. Would a free test on one of your real PRs be useful?",
    "twitter_dm": "Hey [Name]! Love your work on [project]. Built an AI code reviewer that catches logic bugs before human review. Free to try — want me to run it on one of your repos?",
    "reddit_post": {{
      "subreddit": "SaaS",
      "title": "I built an AI code reviewer after our team shipped 3 production bugs in one month — here's what I learned",
      "body": "After our third production incident in a month (all preventable with better code review), I spent 6 weeks building an AI reviewer that does the first-pass before any human touches a PR.\\n\\nWhat I learned:\\n- 70% of bugs are caught at the logic level, not syntax\\n- Most teams skip security review entirely due to time pressure\\n- Junior devs write riskier code at 5pm on Fridays (the data was clear)\\n\\nThe tool flags these patterns automatically. Happy to give free access to anyone willing to share feedback. Drop a comment or DM me."
    }}
  }},
  "first_10_customers_plan": {{
    "week_1": {{
      "goal": "Get 10 genuine conversations with your ICP — no pitching yet",
      "actions": [
        "Post 2 value-driven pieces of content (1 Reddit, 1 LinkedIn) about the problem you solve",
        "Send 20 personalized cold emails to Engineering Managers at 20-50 person SaaS startups",
        "Join 5 developer Slack communities and spend 1 hour per day being genuinely helpful"
      ],
      "target_customers": 2
    }},
    "week_2": {{
      "goal": "Convert conversations into free trials with success criteria defined",
      "actions": [
        "Follow up on all week 1 replies with a specific offer: free trial with your personal setup help",
        "DM 30 LinkedIn connections who engaged with your content and offer a free demo",
        "Post a case study of your own use of the tool — make the results specific and credible"
      ],
      "target_customers": 3
    }},
    "week_3": {{
      "goal": "Convert trial users to paying customers by showing clear ROI",
      "actions": [
        "Send a personalized ROI summary to each trial user showing exactly what the tool caught",
        "Offer a founding customer deal: 40% off forever if they subscribe this week",
        "Ask every trial user for a 15-minute call — gather feedback and close verbally"
      ],
      "target_customers": 3
    }},
    "week_4": {{
      "goal": "Hit 10 paying customers and collect 3 public testimonials",
      "actions": [
        "Launch on Product Hunt with a 1-week founding offer to drive urgency",
        "Ask your 5 paying customers for a referral — offer 1 free month per successful referral",
        "Write a public launch post on LinkedIn announcing your first 10 customers and key learnings"
      ],
      "target_customers": 2
    }}
  }},
  "pricing_feedback": "Your pricing is solid for this market. Consider offering a free tier (up to 5 PRs/month) to reduce friction for trial. Your paid plan should start at $49/month for individuals and $149/month for teams — this is the sweet spot where engineering tools see highest conversion. Add an annual plan at 20% discount immediately; 40% of B2B SaaS revenue comes from annual plans.",
  "biggest_mistake": "Trying to sell to the whole company instead of finding the one person in pain right now. Engineering Managers with an active review backlog problem will buy today. CTOs evaluating tools for the future will delay for 6 months. Find the person with an open wound, not the person who might get hurt someday.",
  "unfair_advantage": "You can generate a free, personalized code review report for any public GitHub repo in under 2 minutes. This is a powerful demo that closes conversations instantly — most prospects will share their repo just to see what you find. Use this as your default opening move in every sales conversation.",
  "competitor_gap": "Every competitor in the code review space targets enterprises with 6-month sales cycles. The 10-50 person startup market — teams who ship fast, have no security team, and desperately need review automation — is completely underserved. These companies can buy with a credit card today, no procurement needed.",
  "validation_experiments": [
    {{
      "experiment": "Free Public Repo Audit",
      "how": "Find 20 popular open-source repos on GitHub. Run your tool on them. DM the maintainers on Twitter with a screenshot of 3 real issues you found. Ask if they'd want a full report.",
      "success_metric": "5 of 20 maintainers respond and at least 2 ask for the full report or pricing"
    }},
    {{
      "experiment": "Landing Page Smoke Test",
      "how": "Create a simple landing page with a 'Get Free Code Review' CTA. Run $50 in Google Ads targeting 'code review tool' and 'automated PR review'. Track how many people click and enter their email.",
      "success_metric": "Email capture rate above 15% means strong demand; below 5% means messaging needs work"
    }},
    {{
      "experiment": "Reddit Value Post",
      "how": "Write a detailed post in r/programming titled 'I analyzed 200 production bugs — here are the 5 review mistakes that caused all of them.' Include a CTA at the end: 'I built a tool that catches these automatically — free to try for the first 20 people who reply.'",
      "success_metric": "20+ upvotes and 5+ people replying to claim the free trial within 48 hours"
    }}
  ],
  "red_flags": [
    "Building more features instead of selling: if you have fewer than 10 paying customers, every hour of coding is an hour not spent selling. The product is good enough — go sell it.",
    "Targeting a market that's too broad: 'all developers' is not a customer. 'Engineering managers at 20-50 person SaaS startups who had a production incident in the last 90 days' is a customer. Get specific.",
    "Pricing too low to attract serious buyers: below $29/month signals the tool is a toy. Engineers and managers who expense tools need them to cost enough to feel professional. Free trials are fine; free forever is a trust signal problem."
  ],
  "quick_wins": [
    "Post in r/SaaS right now: 'We built an AI code reviewer and need 5 beta testers willing to give feedback in exchange for 3 months free. Comment below if interested.' — you could have conversations by tomorrow morning.",
    "DM 10 people you already know who are engineering managers or developers. Tell them you built something and ask if they'd spend 20 minutes giving honest feedback. Personal network converts at 10x the rate of cold outreach.",
    "Find the last 5 tweets from Engineering Managers complaining about code review bottlenecks on Twitter (search 'code review bottleneck' or 'PR review queue'). Reply genuinely to each one and mention what you built."
  ]
}}

Now analyze this specific startup and return a JSON response in the EXACT same structure as the example above, but filled with content specifically tailored to their startup. Every field must be specific, actionable, and relevant to their exact product and market:

Startup Name: {data.startup_name}
Problem they solve: {data.problem}
Their solution: {data.solution}
Target market: {data.target_market}
Pricing: {data.pricing}
Current stage: {data.stage}

Return ONLY the JSON object. No markdown, no code fences, no explanation."""


def extract_json(text: str) -> dict:
    text = text.strip()
    # Remove markdown code fences (```json ... ``` or ``` ... ```)
    text = re.sub(r"^```(?:json)?\s*\n?", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\n?```\s*$", "", text, flags=re.IGNORECASE)
    text = text.strip()

    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Find the first { and last } and extract
    start = text.find("{")
    end = text.rfind("}") + 1
    if start != -1 and end > start:
        try:
            return json.loads(text[start:end])
        except json.JSONDecodeError:
            pass

    raise json.JSONDecodeError("Could not extract valid JSON from response", text, 0)


@app.get("/")
def root():
    return {
        "name": "FirstCustomer.ai API",
        "version": "1.0.0",
        "description": "AI-powered go-to-market strategy for early-stage startups",
        "endpoints": ["/", "/health", "/analyze"],
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "gemini": "configured" if GEMINI_API_KEY else "missing — set GEMINI_API_KEY",
    }


@app.post("/analyze")
async def analyze(data: StartupInput):
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is not configured on the server.",
        )

    prompt = build_prompt(data)

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 8192,
            "responseMimeType": "application/json",
        },
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{GEMINI_URL}?key={GEMINI_API_KEY}",
                json=payload,
            )
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Request to Gemini API timed out. Please try again.",
        )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Network error reaching Gemini API: {exc}",
        )

    if resp.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini API returned {resp.status_code}: {resp.text[:400]}",
        )

    body = resp.json()
    try:
        raw_text = body["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError) as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Unexpected Gemini response shape: {exc}. Body: {str(body)[:300]}",
        )

    try:
        analysis = extract_json(raw_text)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=502,
            detail=(
                "Gemini did not return valid JSON. "
                f"Raw response (first 500 chars): {raw_text[:500]}"
            ),
        )

    return analysis
