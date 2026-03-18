# Iran · US · Israel War Tracker

Real-time news dashboard pulling live RSS feeds from 11 outlets, filtered for conflict coverage.

## Deploy in 5 minutes (free, no credit card)

### Step 1 — Upload to GitHub
1. Go to github.com → sign in (or create free account)
2. Click **New repository** → name it `iran-war-tracker` → click **Create repository**
3. Click **uploading an existing file**
4. Upload ALL these files keeping the folder structure:
   - `server.js`
   - `package.json`
   - `render.yaml`
   - `public/index.html`
5. Click **Commit changes**

### Step 2 — Deploy on Render (free)
1. Go to **render.com** → sign in with GitHub
2. Click **New** → **Web Service**
3. Select your `iran-war-tracker` repository
4. Render auto-detects the settings from `render.yaml`
5. Click **Create Web Service**
6. Wait ~2 minutes for it to build and deploy
7. Your URL appears at the top — something like `https://iran-war-tracker.onrender.com`

### Step 3 — Open on iPhone
- Open the URL in Safari
- Tap the Share button → **Add to Home Screen**
- You now have a one-tap app on your home screen

## What it does
- Fetches real RSS feeds from BBC, Al Jazeera, Times of Israel, Haaretz, CNN, CBS, Fox News, WSJ, Financial Times, The Economist, N12/Walla
- Filters all articles for Iran/Israel/US conflict keywords
- Auto-refreshes feeds every 10 minutes on the server
- Two views:
  - **By Source** — cards per outlet, tap to see all articles
  - **Compare** — topics as rows (Military, Political, Diplomatic, Economic, Humanitarian), all outlets in a comparison table with editorial angle labels
- Tap any article to see headline + snippet + link to full article

## Notes
- Render free tier spins down after 15 min of inactivity — first load after inactivity takes ~30 seconds
- To avoid this, upgrade to Render Starter ($7/mo) or use Railway.app instead
- WSJ and FT may have limited results (paywalled RSS)
