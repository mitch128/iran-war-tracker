const express = require('express');
const Parser = require('rss-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const parser = new Parser({ timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsTracker/1.0)' } });

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// ── Feed sources ──────────────────────────────────────────────────────────────
const OUTLETS = [
  { id: 'bbc',       name: 'BBC News',            color: '#BB1919', url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml' },
  { id: 'aljazeera', name: 'Al Jazeera',           color: '#C8860A', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
  { id: 'toi',       name: 'Times of Israel',      color: '#1A6FA8', url: 'https://www.timesofisrael.com/feed/' },
  { id: 'haaretz',   name: 'Haaretz',              color: '#2C9473', url: 'https://www.haaretz.com/srv/haaretz-latest-articles' },
  { id: 'cnn',       name: 'CNN',                  color: '#CC0000', url: 'http://rss.cnn.com/rss/edition_world.rss' },
  { id: 'cbs',       name: 'CBS News',             color: '#1C4E8A', url: 'https://www.cbsnews.com/latest/rss/world' },
  { id: 'fox',       name: 'Fox News',             color: '#0a3a7a', url: 'https://feeds.foxnews.com/foxnews/world' },
  { id: 'wsj',       name: 'Wall Street Journal',  color: '#0047AB', url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml' },
  { id: 'ft',        name: 'Financial Times',      color: '#C8860A', url: 'https://www.ft.com/world?format=rss' },
  { id: 'economist', name: 'The Economist',        color: '#E3120B', url: 'https://www.economist.com/middle-east-and-africa/rss.xml' },
  { id: 'n12',       name: 'N12 / Walla',          color: '#8E44AD', url: 'https://rss.walla.co.il/feed/1' },
];

const KEYWORDS = [
  'iran','israel','israeli','idf','tehran','netanyahu','khamenei',
  'hezbollah','hamas','gaza','beirut','missile','airstrike','strike',
  'bomb','attack','war','conflict','nuclear','ceasefire','drone',
  'rocket','middle east','irgc','rafah','jerusalem','tel aviv',
  'hormuz','houthi','natanz','mossad','centcom','operation epic fury',
  'rising lion','larijani','mojtaba','pezeshkian',
];

function isRelevant(title = '', desc = '') {
  const text = (title + ' ' + desc).toLowerCase();
  return KEYWORDS.some(k => text.includes(k));
}

function strip(html = '') {
  return html.replace(/<[^>]*>/g, '')
    .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ')
    .replace(/\s+/g,' ').trim();
}

function ageLabel(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 2)    return 'just now';
  if (m < 60)   return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m/60)}h ago`;
  return `${Math.floor(m/1440)}d ago`;
}

// ── Cache: refresh every 10 minutes ──────────────────────────────────────────
let cache = { data: {}, fetchedAt: null };

async function fetchOne(outlet) {
  try {
    const feed = await parser.parseURL(outlet.url);
    const items = (feed.items || [])
      .map(item => ({
        title:   strip(item.title || ''),
        snippet: strip(item.contentSnippet || item.summary || item.content || '').slice(0, 200),
        url:     item.link || '',
        pubDate: item.pubDate || item.isoDate || null,
        age:     ageLabel(item.pubDate || item.isoDate),
      }))
      .filter(i => i.title && isRelevant(i.title, i.snippet))
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
      .slice(0, 8);
    return { id: outlet.id, name: outlet.name, color: outlet.color, items, error: null };
  } catch (e) {
    return { id: outlet.id, name: outlet.name, color: outlet.color, items: [], error: e.message };
  }
}

async function refreshAll() {
  console.log('Fetching all feeds...');
  const results = await Promise.all(OUTLETS.map(fetchOne));
  const data = {};
  results.forEach(r => { data[r.id] = r; });
  cache = { data, fetchedAt: new Date().toISOString() };
  const total = results.reduce((n, r) => n + r.items.length, 0);
  console.log(`Done. ${total} relevant articles across ${results.filter(r=>r.items.length>0).length} outlets.`);
}

// Refresh on startup and every 10 minutes
refreshAll();
setInterval(refreshAll, 10 * 60 * 1000);

// ── API endpoints ─────────────────────────────────────────────────────────────
app.get('/api/news', (req, res) => {
  res.json({ fetchedAt: cache.fetchedAt, outlets: cache.data });
});

app.get('/api/refresh', async (req, res) => {
  await refreshAll();
  res.json({ ok: true, fetchedAt: cache.fetchedAt });
});

app.get('/health', (req, res) => res.json({ ok: true }));

// ── Serve frontend ────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`News tracker running on port ${PORT}`));
