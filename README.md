# 🛒 OpenBy — AI-Powered Price Tracking

> *Know when it's the **best time to buy** — powered by AI, market data & real-time analysis.*

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)

</div>

---

## ✨ What is OpenBy?

**OpenBy** is a smart price-tracking platform that uses AI to tell you **when it's a good time to buy** tech products. Instead of guessing, get a clear **OpenBy Index** score (0–100) and detailed breakdowns across:

| Factor | Description |
|--------|-------------|
| 📊 **Inflation Score** | Canada CPI data — how macro conditions affect prices |
| 🤖 **LLM Buy Score** | GPT-4, Gemini & Claude assess "is today a good day to buy?" |
| 📰 **Related News** | Recent headlines analyzed for buying sentiment |
| 📱 **Social Media** | Virality, forums, trends & engagement signals |
| 📈 **Search Trends** | Google Trends — rising or falling interest |
| 📉 **Volatility** | Price stability & risk |
| 📐 **Moving Average** | 7-day & 60-day MA vs current price |

---

## 🚀 Features

- **🔍 Smart Search** — Type-ahead suggestions with product thumbnails & scores
- **📋 OpenBy Index** — Single 0–100 score combining all factors
- **📊 Breakdown Table** — See how each factor contributes
- **🖼️ Product Images** — AI-generated via Gemini / Flux
- **📅 Price History** — Charts & 7-day price direction
- **🏷️ Categories** — Browse by laptops, monitors, phones, audio, gaming & more
- **⭐ Best Deals** — Filter & sort by score, price, category

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js Server Actions, Supabase (PostgreSQL)
- **AI:** OpenRouter (GPT-4, Gemini, Claude), SerpAPI (news, social)
- **Data:** Bank of Canada (inflation), Google Trends, PriceAPI

---

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com) account
- [OpenRouter](https://openrouter.ai) API key (for LLM & image gen)
- [SerpAPI](https://serpapi.com) key (for news & social)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/openby.git
cd openby
npm install
```

### 2. Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI & APIs
OPENROUTER_API_KEY=your_openrouter_key
SERPAPI_API_KEY=your_serpapi_key

# Optional
GOOGLE_CSE_API_KEY=...        # Google Custom Search (images)
GOOGLE_CSE_CX=...
PRICEAPI_API_KEY=...          # Price tracking
```

### 3. Database Setup

Run migrations in Supabase SQL Editor (or `npx supabase db push` if linked):

```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS openby_index INTEGER;
```

### 4. Seed Data (Optional)

```bash
npm run seed
```

Seeds 100 products with descriptions & images.

### 5. Backfill Scores & Images

```bash
npm run backfill-index
```

Calculates OpenBy Index and generates images for all products.

### 6. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run seed` | Clear DB & seed 100 products |
| `npm run backfill-index` | Calculate scores & images for products missing them |

---

## 📁 Project Structure

```
src/
├── app/              # Pages, API routes, actions
├── components/       # UI components
├── hooks/            # React hooks (e.g. search suggestions)
├── lib/              # Utilities, API clients, index logic
└── types/            # TypeScript types
```

---

## 🙏 Credits

- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [OpenRouter](https://openrouter.ai)
- [SerpAPI](https://serpapi.com)
- [shadcn/ui](https://ui.shadcn.com)

---

<div align="center">

**OpenBy** — *Buy smarter, not harder* 🧠💰

</div>
