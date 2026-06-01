# FirstCustomer.ai — Find Your First 10 Customers

AI-powered go-to-market strategy for early-stage startups.  
Enter your startup details and get instant customer personas, acquisition channels, outreach scripts and a 30-day action plan — powered by Google Gemini 1.5 Flash.

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | Next.js 14, TypeScript, Tailwind CSS |
| Backend   | Python FastAPI                    |
| AI        | Google Gemini 1.5 Flash API       |
| Deploy    | Vercel (frontend) + Render (backend) |

---

## Project Structure

```
firstcustomer-ai/
├── backend/
│   ├── main.py           # FastAPI app + Gemini integration
│   ├── requirements.txt  # Python dependencies
│   └── .env.example      # Environment variable template
└── frontend/
    ├── src/app/
    │   ├── layout.tsx    # Root layout + font
    │   ├── globals.css   # Design system + animations
    │   └── page.tsx      # Main page (form + results)
    ├── package.json
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── .env.local.example
```

---

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.10+
- Google Gemini API key (get one free at https://aistudio.google.com)

### 1. Clone & set up backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

Start the backend:
```bash
uvicorn main:app --reload --port 8000
```

The API will be live at http://localhost:8000

### 2. Set up frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# .env.local already points to http://localhost:8000 for local dev
```

Start the frontend:
```bash
npm run dev
```

Open http://localhost:3000

---

## Environment Variables

### Backend (`backend/.env`)

| Variable        | Description                                   |
|-----------------|-----------------------------------------------|
| `GEMINI_API_KEY` | Your Google Gemini API key from AI Studio    |

### Frontend (`frontend/.env.local`)

| Variable              | Description                                      |
|-----------------------|--------------------------------------------------|
| `NEXT_PUBLIC_API_URL` | URL of the FastAPI backend (default: http://localhost:8000) |

---

## Deploying to Production

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo
3. Set the **Root Directory** to `backend`
4. Set **Build Command**: `pip install -r requirements.txt`
5. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variable: `GEMINI_API_KEY` = your key
7. Deploy — note the public URL (e.g. `https://firstcustomer-api.onrender.com`)

### Frontend → Vercel

1. Import the project on [vercel.com](https://vercel.com)
2. Set the **Root Directory** to `frontend`
3. Framework preset: **Next.js**
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = your Render backend URL (e.g. `https://firstcustomer-api.onrender.com`)
5. Deploy

> **CORS note**: The FastAPI backend allows all origins (`*`), so no additional configuration is needed for Vercel → Render communication.

---

## API Endpoints

| Method | Path      | Description                          |
|--------|-----------|--------------------------------------|
| GET    | `/`       | API info                             |
| GET    | `/health` | Health check + Gemini key status     |
| POST   | `/analyze`| Full startup analysis via Gemini AI  |

### POST /analyze — Request body

```json
{
  "startup_name": "TaskFlow AI",
  "problem": "Developers waste 2 hours daily on repetitive code reviews",
  "solution": "AI-powered code review that automatically catches bugs and style issues",
  "target_market": "Early-stage SaaS startups with 1-10 developers",
  "pricing": "$49/month",
  "stage": "MVP ready — no customers yet"
}
```

---

## Built by

**S. Thrishanth Reddy** — [thrishanth-portfolio.vercel.app](https://thrishanth-portfolio.vercel.app)
