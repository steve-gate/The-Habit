const {
  app,
  BrowserWindow,
  Menu,
  Tray,
  ipcMain,
  safeStorage,
  shell,
  nativeImage,
  Notification,
} = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const APP_NAME = 'The Habit Mosaic';
const DEFAULT_SETTINGS = Object.freeze({
  encryptedApiKey: '',
  model: 'gemini-3.5-flash',
  launchAtLogin: false,
  startMinimized: false,
  minimizeToTray: true,
  closeToTray: true,
});

// Keep Chromium/localStorage/settings beside the EXE for the local installation.
if (app.isPackaged) {
  const portableData = path.join(path.dirname(process.execPath), 'data');
  fs.mkdirSync(portableData, { recursive: true });
  app.setPath('userData', portableData);
  app.setPath('sessionData', path.join(portableData, 'session'));
}

let mainWindow = null;
let settingsWindow = null;
let tray = null;
let isQuitting = false;


// V14 persistence layer (schema continuity retained from V12). The renderer keeps legacy localStorage compatibility, while
// all habit_mosaic_* state is mirrored into SQLite so months/years of history no longer
// depend on one Chromium storage directory. node:sqlite is preferred; JSON is a safe fallback.
let sqliteDb = null;
let sqliteAvailable = false;
let smartContext = {};
let smartTimer = null;
let lastSmartNotificationAt = 0;

function dataRoot() {
  return app.getPath('userData');
}

function initDataStore() {
  try {
    const { DatabaseSync } = require('node:sqlite');
    sqliteDb = new DatabaseSync(path.join(dataRoot(), 'habit-mosaic-v12.sqlite'));
    sqliteDb.exec(`
      PRAGMA journal_mode=WAL;
      CREATE TABLE IF NOT EXISTS kv_state (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT NOT NULL,
        payload TEXT NOT NULL,
        derived TEXT NOT NULL DEFAULT '{}'
      );
      CREATE TABLE IF NOT EXISTS app_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT NOT NULL,
        kind TEXT NOT NULL,
        payload TEXT NOT NULL DEFAULT '{}'
      );
    `);
    sqliteAvailable = true;
  } catch (error) {
    sqliteDb = null;
    sqliteAvailable = false;
    console.warn('V14 SQLite unavailable; using JSON snapshot fallback:', error?.message || error);
  }
}

function fallbackSnapshotPath() {
  return path.join(dataRoot(), 'habit-mosaic-v12-snapshot.json');
}

function syncSnapshot(payload = {}) {
  const snapshot = payload && typeof payload.snapshot === 'object' ? payload.snapshot : {};
  const derived = payload && typeof payload.derived === 'object' ? payload.derived : {};
  const now = new Date().toISOString();
  if (sqliteAvailable && sqliteDb) {
    try {
      sqliteDb.exec('BEGIN IMMEDIATE');
      const upsert = sqliteDb.prepare('INSERT INTO kv_state(key,value,updated_at) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at');
      for (const [key, value] of Object.entries(snapshot)) {
        if (!String(key).startsWith('habit_mosaic_')) continue;
        upsert.run(String(key), String(value ?? ''), now);
      }
      sqliteDb.prepare('INSERT INTO snapshots(created_at,payload,derived) VALUES(?,?,?)').run(now, JSON.stringify(snapshot), JSON.stringify(derived));
      sqliteDb.exec('DELETE FROM snapshots WHERE id NOT IN (SELECT id FROM snapshots ORDER BY id DESC LIMIT 30)');
      sqliteDb.exec('COMMIT');
      return { ok: true, backend: 'sqlite', keys: Object.keys(snapshot).length };
    } catch (error) {
      try { sqliteDb.exec('ROLLBACK'); } catch {}
      console.error('SQLite snapshot failed:', error);
    }
  }
  try {
    fs.writeFileSync(fallbackSnapshotPath(), JSON.stringify({ createdAt: now, snapshot, derived }, null, 2), 'utf8');
    return { ok: true, backend: 'json-fallback', keys: Object.keys(snapshot).length };
  } catch (error) {
    return { ok: false, backend: 'none', error: error instanceof Error ? error.message : String(error) };
  }
}

function persistenceStatus() {
  return {
    backend: sqliteAvailable ? 'sqlite' : 'json-fallback',
    databasePath: sqliteAvailable ? path.join(dataRoot(), 'habit-mosaic-v12.sqlite') : fallbackSnapshotPath(),
  };
}

function createDataBackup() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(dataRoot(), 'backups', stamp);
  fs.mkdirSync(backupDir, { recursive: true });
  const candidates = [
    settingsPath(),
    path.join(dataRoot(), 'habit-mosaic-v12.sqlite'),
    path.join(dataRoot(), 'habit-mosaic-v12.sqlite-wal'),
    path.join(dataRoot(), 'habit-mosaic-v12.sqlite-shm'),
    fallbackSnapshotPath(),
  ];
  for (const source of candidates) {
    if (fs.existsSync(source)) fs.copyFileSync(source, path.join(backupDir, path.basename(source)));
  }
  return backupDir;
}

function setSmartContext(payload = {}) {
  smartContext = payload && typeof payload === 'object' ? payload : {};
  return { ok: true };
}


function marketPriceCandidates(html, currency) {
  const clean = String(html || '').replace(/&nbsp;|&#160;/g, ' ').replace(/\s+/g, ' ');
  const found = [];
  const push = (raw, number) => {
    const value = Number(number);
    if (!Number.isFinite(value) || value <= 0) return;
    if (!found.some(x => x.value === value && x.raw === raw)) found.push({ raw: String(raw).trim(), value });
  };
  if (currency === 'VND') {
    for (const re of [/(?:Từ\s*)?(\d{1,3}(?:\.\d{3}){2,})\s*đ/gi, /(\d{1,3}(?:,\d{3}){2,})\s*VND/gi]) {
      let m; let guard = 0;
      while ((m = re.exec(clean)) && guard++ < 80) push(m[0], m[1].replace(/[.,]/g, ''));
    }
  } else {
    for (const re of [/US\$\s?([\d,]{3,})/gi, /\$\s?([\d,]{3,})/g]) {
      let m; let guard = 0;
      while ((m = re.exec(clean)) && guard++ < 80) push(m[0], m[1].replace(/,/g, ''));
    }
  }
  return found;
}

function chooseMarketPrice(candidates, expectedPrice, tolerance = 0.08) {
  const expected = Number(expectedPrice || 0);
  if (!expected || !candidates.length) return { candidate: null, confidence: 'none', differenceRatio: null };
  const ranked = [...candidates].sort((a, b) => Math.abs(a.value - expected) - Math.abs(b.value - expected));
  const candidate = ranked[0];
  const differenceRatio = Math.abs(candidate.value - expected) / expected;
  return { candidate, confidence: differenceRatio <= Math.max(0.01, Number(tolerance || 0.08)) ? 'high' : 'low', differenceRatio };
}

async function refreshMarketCatalog(payload = {}) {
  const requested = Array.isArray(payload.items) ? payload.items.slice(0, 20) : [];
  const allowedHosts = new Set(['apple.com','www.apple.com','sothebys.com','www.sothebys.com','caranddriver.com','www.caranddriver.com','rolls-roycemotorcars.com','www.rolls-roycemotorcars.com','ferrari.com','www.ferrari.com']);
  const items = {};
  const errors = [];
  for (const item of requested) {
    const id = String(item?.id || '').trim();
    const source = String(item?.source || '').trim();
    let url;
    try { url = new URL(source); } catch { errors.push({ id, error: 'Địa chỉ nguồn không hợp lệ.' }); continue; }
    if (!id || url.protocol !== 'https:' || !allowedHosts.has(url.hostname.toLowerCase())) { errors.push({ id, error: 'Nguồn không nằm trong danh sách đáng tin đã cho phép.' }); continue; }
    const currency = String(item?.currency || 'USD').toUpperCase() === 'VND' ? 'VND' : 'USD';
    const expectedPrice = Number(item?.expectedPrice || 0);
    const tolerance = Number(item?.tolerance || 0.08);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(source, { signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0 TheHabitMosaic/1.7 (+weekly price verification)' } });
      clearTimeout(timer);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      const candidates = marketPriceCandidates(html, currency);
      const chosen = chooseMarketPrice(candidates, expectedPrice, tolerance);
      let priceText = '';
      if (chosen.candidate && chosen.confidence === 'high') {
        priceText = currency === 'VND'
          ? `${Math.round(chosen.candidate.value).toLocaleString('vi-VN')}đ`
          : `US$${Math.round(chosen.candidate.value).toLocaleString('en-US')}`;
      }
      items[id] = {
        priceText,
        matchedValue: chosen.candidate?.value || null,
        expectedPrice: expectedPrice || null,
        differenceRatio: chosen.differenceRatio,
        confidence: chosen.confidence,
        source,
        refreshedAt: new Date().toISOString(),
        status: chosen.confidence === 'high' ? 'verified-match' : (candidates.length ? 'price-found-but-not-confident' : 'source-reached-no-price'),
      };
      if (chosen.confidence !== 'high') errors.push({ id, error: 'Nguồn mở được nhưng chưa tìm thấy mức giá khớp đúng sản phẩm. Giữ giá đã xác minh trước đó.' });
    } catch (error) {
      errors.push({ id, error: error instanceof Error ? error.message : String(error) });
    }
  }
  const out = { ok: true, refreshedAt: new Date().toISOString(), items, errors };
  try { fs.writeFileSync(path.join(dataRoot(), 'market-cache-v18.json'), JSON.stringify(out, null, 2), 'utf8'); } catch {}
  return out;
}


// V22 WORLD AWARENESS — real external input, no LLM-invented "hot news".
const worldAwarenessCacheV22 = { at: 0, topics: [] };

function decodeWorldXml(text = '') {
  return String(text || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}
function stripWorldHtml(text = '') {
  return decodeWorldXml(String(text || '').replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ').trim();
}
function worldTopicCategory(text = '', hint = '') {
  const t = `${hint} ${text}`.toLowerCase();
  if (/\b(openai|chatgpt|anthropic|claude|gemini|artificial intelligence|machine learning|\bai\b|llm|deepmind)\b|trí tuệ nhân tạo|mô hình ngôn ngữ/.test(t)) return 'ai';
  if (/\b(game|gaming|xbox|playstation|nintendo|steam|esports|video game)\b|trò chơi|thể thao điện tử/.test(t)) return 'gaming';
  if (/\b(football|soccer|nba|nfl|tennis|olympic|sport|champion|world cup|premier league)\b|bóng đá|thể thao|quần vợt|olympic/.test(t)) return 'sports';
  if (/\b(science|space|nasa|research|study|physics|biology|astronomy|climate|medicine|health)\b|khoa học|nghiên cứu|vũ trụ|y học|sức khỏe|khí hậu/.test(t)) return 'science';
  if (/\b(psychology|mental health|behavior|brain|cognitive|emotion|wellbeing|well-being)\b|tâm lý|não bộ|hành vi|cảm xúc|sức khỏe tinh thần/.test(t)) return 'psychology';
  if (/\b(movie|film|music|celebrity|netflix|disney|cinema|album|actor|actress|entertainment)\b|phim|âm nhạc|điện ảnh|ca sĩ|diễn viên|giải trí/.test(t)) return 'entertainment';
  if (/\b(stock|market|finance|economy|economic|bitcoin|crypto|business|company|earnings|trade)\b|kinh tế|tài chính|chứng khoán|doanh nghiệp|thị trường/.test(t)) return 'finance';
  if (/\b(technology|tech|software|hardware|apple|google|microsoft|meta|android|iphone|chip|robot)\b|công nghệ|phần mềm|phần cứng|điện thoại|chip|robot/.test(t)) return 'technology';
  if (/\b(education|school|university|learning|language|student)\b|giáo dục|học tập|đại học|học sinh|sinh viên|ngoại ngữ/.test(t)) return 'education';
  if (/\b(culture|viral|trend|social media|tiktok|youtube|meme|internet)\b|văn hóa|xu hướng|mạng xã hội|lan truyền/.test(t)) return 'culture';
  return hint || 'world';
}
function worldHeat(publishedAt) {
  const ageHours = Math.max(0, (Date.now() - Number(publishedAt || Date.now())) / 3600000);
  if (ageHours <= 3) return .96;
  if (ageHours <= 8) return .88;
  if (ageHours <= 18) return .78;
  if (ageHours <= 36) return .66;
  if (ageHours <= 72) return .52;
  return .36;
}
function parseWorldRss(xml, sourceName, hint = '', limit = 16) {
  const items = [];
  const raw = String(xml || '');
  const blocks = raw.match(/<item\b[\s\S]*?<\/item>/gi) || raw.match(/<entry\b[\s\S]*?<\/entry>/gi) || [];
  const tag = (block, names) => {
    for (const name of names) {
      const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i'));
      if (m) return stripWorldHtml(m[1]);
    }
    return '';
  };
  for (const block of blocks.slice(0, limit)) {
    const title = tag(block, ['title']);
    if (!title) continue;
    const linkMatch = block.match(/<link[^>]+href=["']([^"']+)["']/i) || block.match(/<link(?:\s[^>]*)?>([\s\S]*?)<\/link>/i);
    const link = decodeWorldXml(linkMatch?.[1] || '').trim();
    const description = tag(block, ['description', 'summary', 'content']);
    const pubRaw = tag(block, ['pubDate', 'published', 'updated', 'dc:date']);
    const publishedAt = Date.parse(pubRaw) || Date.now();
    const sourceTag = block.match(/<source(?:\s[^>]*)?>([\s\S]*?)<\/source>/i);
    const publisher = stripWorldHtml(sourceTag?.[1] || '') || sourceName;
    items.push({ title, description, link, publishedAt, sourceName: publisher, feedName: sourceName, hint });
  }
  return items;
}
async function fetchWorldResource(url, type = 'text') {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8500);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 TheHabitMosaic/23 (+living-society+soul+world-awareness; factual-input-only)',
        'Accept': type === 'json' ? 'application/json' : 'application/rss+xml, application/xml, text/xml, text/plain;q=0.9,*/*;q=0.7'
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return type === 'json' ? await response.json() : await response.text();
  } finally {
    clearTimeout(timer);
  }
}
function normalizeWorldTitle(title = '') {
  return stripWorldHtml(title)
    .replace(/\s+[-–—]\s+[^-–—]{2,48}$/u, '')
    .replace(/[“”"'’‘`]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ').trim().toLowerCase().slice(0, 170);
}
function worldTopicId(title = '') {
  const key = normalizeWorldTitle(title);
  return `wt-${stableHash(key || title).toString(36)}`;
}
function looksVietnameseWorldText(text = '') {
  const t = ` ${String(text || '').toLowerCase()} `;
  if (!t.trim()) return false;
  const accent = (t.match(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g) || []).length;
  const viWords = (t.match(/\b(và|của|với|trong|đang|được|cho|tại|mới|sau|trước|người|này|về|khi|những|một|không|công nghệ|thể thao|khoa học|kinh tế)\b/g) || []).length;
  return accent >= 2 || viWords >= 3;
}
async function localizeWorldTopicsVietnamese(topics = []) {
  const keep = [];
  const need = [];
  for (const topic of topics) {
    if (looksVietnameseWorldText(`${topic.title} ${topic.summary}`)) keep.push({ ...topic, language: 'vi' });
    else need.push(topic);
  }
  let translated = new Map();
  if (need.length) {
    try {
      const payload = need.slice(0, 16).map(t => ({ id:t.id, title:t.title, summary:t.summary, facts:Array.isArray(t.facts)?t.facts.slice(0,2):[] }));
      const out = await generateJson(`Bạn là bộ chuẩn hóa tin tức cho một ứng dụng tiếng Việt. Dịch/chuyển ngữ CHÍNH XÁC dữ liệu sau sang tiếng Việt tự nhiên, ngắn gọn, không thêm bất kỳ fact nào, không suy đoán, không đổi tên riêng, số liệu hay mốc thời gian. Không viết kiểu báo chí giật tít. Mỗi title tối đa 150 ký tự, summary tối đa 280 ký tự và phải nói rõ chuyện gì thực sự xảy ra / vì sao đáng chú ý, không được chỉ chép tiêu đề. facts nếu có cũng phải bằng tiếng Việt. Trả JSON đúng dạng {"items":[{"id":"...","title":"...","summary":"...","facts":["..."]}]}.
DỮ LIỆU FACT-LOCKED:
${JSON.stringify(payload)}`);
      for (const item of Array.isArray(out?.items) ? out.items : []) {
        if (!item?.id || !item?.title) continue;
        translated.set(String(item.id), { title:stripWorldHtml(item.title).slice(0,220), summary:stripWorldHtml(item.summary||'').slice(0,500), facts:Array.isArray(item.facts)?item.facts.map(x=>stripWorldHtml(x)).filter(Boolean).slice(0,3):[] });
      }
    } catch {}
  }
  const localized = [...keep];
  for (const topic of need) {
    const vi = translated.get(topic.id);
    if (!vi || !looksVietnameseWorldText(`${vi.title} ${vi.summary}`)) continue; // no API key / translation failed -> never leak English into NPC speech
    localized.push({ ...topic, ...vi, language:'vi' });
  }
  return localized;
}


function worldEditorialSignals(topic = {}) {
  const text = `${topic.title || ''} ${topic.summary || ''}`.toLowerCase();
  const category = String(topic.category || 'world');
  const lowValue = /(how to|what to know|explained by|why .* matters|preview|practice|training camp|joint practice|opinion|ranking|rumou?r|mock draft|live blog|highlights|watch live|where to watch|guide|tips?|interview|photos?|video:|hướng dẫn|mẹo|nhận định|dự đoán|lịch thi đấu|xem ở đâu|buổi tập|tập luyện|tin đồn|giải thích đơn thuần)/i.test(text);
  const consequenceHit = /(luật|chính sách|cấm|phán quyết|tòa|bảo mật|rò rỉ dữ liệu|sự cố|thu hồi|giá|tăng mạnh|giảm mạnh|sa thải|mua lại|thâu tóm|hợp nhất|phá sản|khủng hoảng|bão|động đất|dịch|chiến tranh|ngừng hoạt động|ra mắt chính thức|record|record-breaking|ban|court|law|policy|security|breach|outage|recall|acquire|merger|bankrupt|crisis|earthquake|storm|war|launch)/i.test(text);
  const curiosityHit = /(lần đầu|bất ngờ|chưa từng|đột phá|phát hiện|bí ẩn|kỷ lục|đảo ngược|gây tranh cãi|thay đổi lớn|unexpected|first ever|breakthrough|discover|record|surprising|controvers|major change|reveal|unveil)/i.test(text);
  const scaleHit = /(triệu|tỷ|toàn cầu|quốc gia|hàng loạt|nhiều người|major|global|nationwide|millions?|billions?|massive|widespread)/i.test(text);
  const sportsMajor = /(chung kết|vô địch|kỷ lục|world cup|olympic|giải nghệ|chuyển nhượng|trade|transfer|final|champion|title|record|retire|injury|chấn thương|bị loại|knocked out)/i.test(text);
  const entertainmentMajor = /(ra mắt|công bố|kỷ lục|đình đám|viral|tranh cãi|hủy|cancel|release|premiere|record|viral|controvers|box office|album|tour|award)/i.test(text);
  const gamingMajor = /(ra mắt|phát hành|công bố|delay|hoãn|đóng cửa|shutdown|record|kỷ lục|acquisition|mua lại|console|game mới|release|launch|announce)/i.test(text);
  let consequence = .28 + (consequenceHit ? .34 : 0) + (scaleHit ? .16 : 0);
  let curiosity = .28 + (curiosityHit ? .36 : 0) + (scaleHit ? .10 : 0);
  if (category === 'sports' && !sportsMajor) { consequence *= .55; curiosity *= .65; }
  if (category === 'entertainment' && !entertainmentMajor) { consequence *= .7; curiosity *= .75; }
  if (category === 'gaming' && !gamingMajor) { consequence *= .72; curiosity *= .78; }
  const sourceDiversity = Math.min(.16, Math.max(0, Number(topic.sourceNames?.length || 0) - 1) * .05);
  let storyValue = .20 + Number(topic.importance || .5) * .22 + Number(topic.heat || .5) * .12 + Number(topic.confidence || .5) * .12 + consequence * .18 + curiosity * .18 + sourceDiversity;
  if (lowValue) storyValue -= .34;
  if (category === 'sports' && !sportsMajor) storyValue -= .16;
  if ((category === 'world' || category === 'finance' || category === 'technology' || category === 'ai' || category === 'science') && consequenceHit) storyValue += .08;
  storyValue = Math.max(0, Math.min(1, storyValue));
  consequence = Math.max(0, Math.min(1, consequence));
  curiosity = Math.max(0, Math.min(1, curiosity));
  const whyItMatters = String(topic.summary || topic.title || '').replace(/\s+/g, ' ').trim().slice(0, 260);
  return { storyValue, consequence, curiosity, whyItMatters, lowValue };
}

async function fetchWorldAwarenessV21(body = {}) {
  const maxTopics = Math.max(6, Math.min(30, Number(body?.maxTopics || 20)));
  if (Date.now() - worldAwarenessCacheV22.at < 20 * 60 * 1000 && worldAwarenessCacheV22.topics.length) {
    return worldAwarenessCacheV22.topics.slice(0, maxTopics);
  }

  const feeds = [
    { name: 'Google News Việt Nam', hint: 'world', url: 'https://news.google.com/rss?hl=vi&gl=VN&ceid=VN:vi' },
    { name: 'Google News AI', hint: 'ai', url: 'https://news.google.com/rss/search?q=AI%20OR%20OpenAI%20OR%20ChatGPT%20OR%20Gemini&hl=vi&gl=VN&ceid=VN:vi' },
    { name: 'Google News Công nghệ', hint: 'technology', url: 'https://news.google.com/rss/search?q=c%C3%B4ng%20ngh%E1%BB%87%20OR%20ph%E1%BA%A7n%20m%E1%BB%81m%20OR%20smartphone&hl=vi&gl=VN&ceid=VN:vi' },
    { name: 'Google News Game', hint: 'gaming', url: 'https://news.google.com/rss/search?q=game%20OR%20gaming%20OR%20esports&hl=vi&gl=VN&ceid=VN:vi' },
    { name: 'Google News Văn hóa', hint: 'culture', url: 'https://news.google.com/rss/search?q=phim%20OR%20%C3%A2m%20nh%E1%BA%A1c%20OR%20meme%20OR%20TikTok%20OR%20YouTube&hl=vi&gl=VN&ceid=VN:vi' },
    { name: 'Google News Thể thao', hint: 'sports', url: 'https://news.google.com/rss/search?q=th%E1%BB%83%20thao%20OR%20b%C3%B3ng%20%C4%91%C3%A1&hl=vi&gl=VN&ceid=VN:vi' },
    { name: 'Google News Khoa học', hint: 'science', url: 'https://news.google.com/rss/search?q=khoa%20h%E1%BB%8Dc%20OR%20nghi%C3%AAn%20c%E1%BB%A9u%20OR%20v%C5%A9%20tr%E1%BB%A5&hl=vi&gl=VN&ceid=VN:vi' },
    { name: 'Google News Tâm lý', hint: 'psychology', url: 'https://news.google.com/rss/search?q=t%C3%A2m%20l%C3%BD%20OR%20n%C3%A3o%20b%E1%BB%99%20OR%20s%E1%BB%A9c%20kh%E1%BB%8Fe%20tinh%20th%E1%BA%A7n&hl=vi&gl=VN&ceid=VN:vi' },
    { name: 'Google News Kinh tế', hint: 'finance', url: 'https://news.google.com/rss/search?q=kinh%20t%E1%BA%BF%20OR%20t%C3%A0i%20ch%C3%ADnh%20OR%20th%E1%BB%8B%20tr%C6%B0%E1%BB%9Dng&hl=vi&gl=VN&ceid=VN:vi' },
    // English feeds are supplementary only. They are translated by the configured Gemini key;
    // if translation is unavailable they are dropped before reaching NPCs/UI.
    { name: 'BBC World', hint: 'world', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
    { name: 'ScienceDaily', hint: 'science', url: 'https://www.sciencedaily.com/rss/top/science.xml' },
  ];

  const records = [];
  const settled = await Promise.allSettled(feeds.map(async feed => {
    const xml = await fetchWorldResource(feed.url, 'text');
    return parseWorldRss(xml, feed.name, feed.hint, 14);
  }));
  for (const r of settled) if (r.status === 'fulfilled') records.push(...r.value);

  // Hacker News is useful for AI/software topics and gives an independent source from news RSS.
  try {
    const hn = await fetchWorldResource('https://hn.algolia.com/api/v1/search?tags=front_page', 'json');
    for (const hit of Array.isArray(hn?.hits) ? hn.hits.slice(0, 14) : []) {
      const title = String(hit?.title || '').trim();
      if (!title) continue;
      records.push({
        title,
        description: '',
        link: String(hit?.url || `https://news.ycombinator.com/item?id=${hit?.objectID || ''}`),
        publishedAt: Date.parse(hit?.created_at || '') || Date.now(),
        sourceName: 'Hacker News',
        feedName: 'Hacker News',
        hint: 'technology',
      });
    }
  } catch {}

  const grouped = new Map();
  for (const item of records) {
    if (!item.title || Date.now() - item.publishedAt > 7 * 86400000) continue;
    const key = normalizeWorldTitle(item.title);
    if (!key || key.length < 12) continue;
    const id = worldTopicId(item.title);
    const existing = grouped.get(key) || {
      id, title: stripWorldHtml(item.title).slice(0, 220), category: worldTopicCategory(`${item.title} ${item.description}`, item.hint),
      summary: stripWorldHtml(item.description || item.title).slice(0, 500), facts: [],
      sourceNames: [], sourceUrls: [], firstSeenAt: item.publishedAt, lastUpdatedAt: item.publishedAt,
      heat: 0, momentum: 0, importance: .5, controversy: .18, confidence: .5, verified: false,
    };
    existing.sourceNames = [...new Set([...existing.sourceNames, item.sourceName || item.feedName])].slice(0, 5);
    if (item.link) existing.sourceUrls = [...new Set([...existing.sourceUrls, item.link])].slice(0, 5);
    existing.firstSeenAt = Math.min(existing.firstSeenAt, item.publishedAt);
    existing.lastUpdatedAt = Math.max(existing.lastUpdatedAt, item.publishedAt);
    existing.heat = Math.max(existing.heat, worldHeat(item.publishedAt));
    if (!existing.summary && item.description) existing.summary = stripWorldHtml(item.description).slice(0, 500);
    grouped.set(key, existing);
  }

  const topics = [...grouped.values()].map(topic => {
    const sourceBoost = Math.min(.16, Math.max(0, topic.sourceNames.length - 1) * .06);
    const freshness = worldHeat(topic.lastUpdatedAt);
    const titleLower = topic.title.toLowerCase();
    const importanceBoost = /\b(election|war|crisis|major|launch|breakthrough|record|ban|law|court|security|earthquake|storm)\b/.test(titleLower) ? .16 : 0;
    const controversy = /\b(debate|controvers|ban|lawsuit|protest|accus|conflict|scandal|backlash)\b/.test(titleLower) ? .66 : .2;
    const confidence = Math.min(.94, .6 + sourceBoost + (topic.sourceNames.includes('BBC World') ? .08 : 0) + (topic.sourceNames.includes('ScienceDaily') ? .06 : 0));
    const base = {
      ...topic,
      heat: Math.min(1, topic.heat + sourceBoost),
      momentum: Math.max(-1, Math.min(1, (freshness - .5) * 1.15 + sourceBoost)),
      importance: Math.min(1, .48 + importanceBoost + sourceBoost),
      controversy,
      confidence,
      verified: confidence >= .6 && topic.sourceNames.length >= 1,
      facts: [topic.summary || topic.title].filter(Boolean).slice(0, 3),
    };
    return { ...base, ...worldEditorialSignals(base) };
  }).filter(t => t.storyValue >= .58 && !t.lowValue)
    .sort((a, b) => (b.storyValue * .48 + b.importance * .18 + b.heat * .12 + b.confidence * .14 + b.momentum * .08) - (a.storyValue * .48 + a.importance * .18 + a.heat * .12 + a.confidence * .14 + a.momentum * .08))
    .slice(0, Math.max(maxTopics, 16));

  const localizedTopics = (await localizeWorldTopicsVietnamese(topics))
    .map(t => ({ ...t, ...worldEditorialSignals(t), language:'vi' }))
    .filter(t => t.storyValue >= .60 && !t.lowValue && looksVietnameseWorldText(`${t.title} ${t.summary}`))
    .sort((a,b) => b.storyValue - a.storyValue)
    .slice(0, Math.min(maxTopics, 14));
  if (localizedTopics.length) {
    worldAwarenessCacheV22.at = Date.now();
    worldAwarenessCacheV22.topics = localizedTopics;
  }
  return localizedTopics.length ? localizedTopics : worldAwarenessCacheV22.topics.slice(0, maxTopics);
}

function maybeShowSmartNotification() {
  if (!Notification.isSupported()) return;
  const now = Date.now();
  if (now - lastSmartNotificationAt < 2 * 60 * 60 * 1000) return;
  const hour = new Date().getHours();
  if (hour < 8 || hour > 22) return;
  if (!smartContext?.nextAction) return;
  if (Number(smartContext.completedToday || 0) >= Number(smartContext.totalHabits || 0) && Number(smartContext.totalHabits || 0) > 0) return;
  if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible() && mainWindow.isFocused()) return;

  const rivalry = smartContext.rivalry;
  let body = smartContext.comebackMode
    ? `Comeback Mode: không bù nợ. Chỉ làm “${smartContext.nextAction}” để lấy lại nhịp.`
    : `Next Best Action: ${smartContext.nextAction}.`;
  if (rivalry?.active && rivalry?.legendName) body += ` Kèo với ${rivalry.legendName} vẫn đang chạy.`;
  const notification = new Notification({ title: 'The Habit Mosaic', body, silent: false });
  notification.on('click', showMainWindow);
  notification.show();
  lastSmartNotificationAt = now;
}

function settingsPath() {
  return path.join(app.getPath('userData'), 'desktop-settings.json');
}

function readSettingsFile() {
  try {
    const parsed = JSON.parse(fs.readFileSync(settingsPath(), 'utf8'));
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function writeSettingsFile(settings) {
  fs.mkdirSync(path.dirname(settingsPath()), { recursive: true });
  fs.writeFileSync(settingsPath(), JSON.stringify(settings, null, 2), 'utf8');
}

function decryptApiKey(encryptedValue) {
  if (!encryptedValue) return '';
  try {
    const buffer = Buffer.from(encryptedValue, 'base64');
    if (safeStorage.isEncryptionAvailable()) return safeStorage.decryptString(buffer);
    return buffer.toString('utf8');
  } catch {
    return '';
  }
}

function encryptApiKey(apiKey) {
  if (!apiKey) return '';
  const buffer = safeStorage.isEncryptionAvailable()
    ? safeStorage.encryptString(apiKey)
    : Buffer.from(apiKey, 'utf8');
  return buffer.toString('base64');
}

function publicSettings() {
  const settings = readSettingsFile();
  return {
    model: settings.model,
    launchAtLogin: settings.launchAtLogin,
    startMinimized: settings.startMinimized,
    minimizeToTray: settings.minimizeToTray,
    closeToTray: settings.closeToTray,
    hasApiKey: Boolean(decryptApiKey(settings.encryptedApiKey)),
    encryptionAvailable: safeStorage.isEncryptionAvailable(),
    appVersion: app.getVersion(),
    isPackaged: app.isPackaged,
    transport: 'electron-ipc',
    persistence: persistenceStatus(),
  };
}

function applyLoginItemSetting(enabled) {
  if (process.platform !== 'win32' || !app.isPackaged) return;
  app.setLoginItemSettings({
    openAtLogin: Boolean(enabled),
    path: process.execPath,
    args: ['--hidden'],
  });
}

function iconPath(fileName) {
  return path.join(__dirname, 'assets', fileName);
}

function showMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createMainWindow();
    return;
  }
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function appIndexPath() {
  return path.join(app.getAppPath(), 'dist', 'index.html');
}

function createMainWindow() {
  const settings = readSettingsFile();
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1040,
    minHeight: 700,
    show: false,
    title: APP_NAME,
    icon: iconPath(process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
    autoHideMenuBar: false,
    backgroundColor: '#f5f1e8',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('minimize', (event) => {
    if (readSettingsFile().minimizeToTray) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting && readSettingsFile().closeToTray) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => { mainWindow = null; });
  mainWindow.on('page-title-updated', (event) => {
    event.preventDefault();
    mainWindow?.setTitle(APP_NAME);
  });
  mainWindow.setMenuBarVisibility(true);

  mainWindow.once('ready-to-show', () => {
    const launchedHidden = process.argv.includes('--hidden');
    if (!launchedHidden && !settings.startMinimized) mainWindow.show();
  });

  const indexFile = appIndexPath();
  if (!fs.existsSync(indexFile)) {
    console.error('Missing built UI:', indexFile);
    return;
  }
  mainWindow.loadFile(indexFile).catch((error) => {
    console.error('Unable to load local UI:', error);
  });
}

function createSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.show();
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 620,
    height: 700,
    minWidth: 560,
    minHeight: 620,
    show: false,
    resizable: true,
    title: `${APP_NAME} — Cài đặt`,
    icon: iconPath(process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
    autoHideMenuBar: true,
    parent: mainWindow || undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  settingsWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  settingsWindow.loadFile(path.join(__dirname, 'settings.html'));
  settingsWindow.once('ready-to-show', () => settingsWindow.show());
  settingsWindow.on('closed', () => { settingsWindow = null; });
}

function rebuildApplicationMenu() {
  const settings = readSettingsFile();
  const updateBoolean = (key, value) => {
    const next = { ...readSettingsFile(), [key]: Boolean(value) };
    writeSettingsFile(next);
    if (key === 'launchAtLogin') applyLoginItemSetting(next.launchAtLogin);
    rebuildApplicationMenu();
    rebuildTrayMenu();
  };

  const menu = Menu.buildFromTemplate([
    {
      label: 'Cài đặt',
      submenu: [
        {
          label: 'Google AI Studio API & Windows...',
          accelerator: 'CmdOrCtrl+,',
          click: createSettingsWindow,
        },
        { type: 'separator' },
        {
          label: 'Tự khởi động cùng Windows',
          type: 'checkbox',
          checked: Boolean(settings.launchAtLogin),
          click: (item) => updateBoolean('launchAtLogin', item.checked),
        },
        {
          label: 'Khởi động ẩn trong khay hệ thống',
          type: 'checkbox',
          checked: Boolean(settings.startMinimized),
          click: (item) => updateBoolean('startMinimized', item.checked),
        },
        {
          label: 'Nút thu nhỏ → khay hệ thống',
          type: 'checkbox',
          checked: Boolean(settings.minimizeToTray),
          click: (item) => updateBoolean('minimizeToTray', item.checked),
        },
        {
          label: 'Nút đóng → khay hệ thống',
          type: 'checkbox',
          checked: Boolean(settings.closeToTray),
          click: (item) => updateBoolean('closeToTray', item.checked),
        },
        { type: 'separator' },
        {
          label: 'Thoát hoàn toàn',
          accelerator: 'CmdOrCtrl+Shift+Q',
          click: () => {
            isQuitting = true;
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Dữ liệu',
      submenu: [
        { label: 'Tạo backup V12 ngay', click: () => { const dir = createDataBackup(); shell.openPath(dir); } },
        { label: 'Mở thư mục dữ liệu', click: () => shell.openPath(dataRoot()) },
      ],
    },
    {
      label: 'Trợ giúp',
      submenu: [
        {
          label: 'Lấy Google AI Studio API key',
          click: () => shell.openExternal('https://aistudio.google.com/app/apikey'),
        },
        {
          label: 'Mở The Habit Mosaic',
          click: showMainWindow,
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);
}

function rebuildTrayMenu() {
  if (!tray) return;
  const settings = readSettingsFile();
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Mở The Habit Mosaic', click: showMainWindow },
    { label: 'Cài đặt Gemini & Desktop', click: createSettingsWindow },
    { type: 'separator' },
    {
      label: 'Tự khởi động cùng Windows',
      type: 'checkbox',
      checked: Boolean(settings.launchAtLogin),
      click: (menuItem) => {
        const next = { ...readSettingsFile(), launchAtLogin: menuItem.checked };
        writeSettingsFile(next);
        applyLoginItemSetting(menuItem.checked);
        rebuildTrayMenu();
        rebuildApplicationMenu();
      },
    },
    {
      label: 'Thu nhỏ xuống khay hệ thống',
      type: 'checkbox',
      checked: Boolean(settings.minimizeToTray),
      click: (menuItem) => {
        writeSettingsFile({ ...readSettingsFile(), minimizeToTray: menuItem.checked });
        rebuildTrayMenu();
        rebuildApplicationMenu();
      },
    },
    { type: 'separator' },
    {
      label: 'Thoát hoàn toàn',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]));
}

function createTray() {
  if (tray) return;
  const imageFile = process.platform === 'win32' ? 'icon.ico' : 'icon.png';
  let image = nativeImage.createFromPath(iconPath(imageFile));
  if (image.isEmpty()) image = nativeImage.createFromPath(iconPath('icon.png'));
  tray = new Tray(image);
  tray.setToolTip(APP_NAME);
  tray.on('click', showMainWindow);
  tray.on('double-click', showMainWindow);
  rebuildTrayMenu();
}

async function getGeminiClient(apiKeyOverride = '') {
  const settings = readSettingsFile();
  const apiKey = String(apiKeyOverride || decryptApiKey(settings.encryptedApiKey) || '').trim();
  if (!apiKey) throw new Error('Chưa có Google AI Studio API key.');
  const { GoogleGenAI } = await import('@google/genai');
  return {
    client: new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'the-habit-mosaic-desktop' } },
    }),
    model: settings.model || DEFAULT_SETTINGS.model,
  };
}

async function generateText(prompt, modelOverride = '', apiKeyOverride = '') {
  const { client, model } = await getGeminiClient(apiKeyOverride);
  const response = await client.models.generateContent({
    model: String(modelOverride || model || DEFAULT_SETTINGS.model),
    contents: prompt,
  });
  return String(response.text || '').trim();
}


async function generateJson(prompt, modelOverride = '', apiKeyOverride = '') {
  const { client, model } = await getGeminiClient(apiKeyOverride);
  const response = await client.models.generateContent({
    model: String(modelOverride || model || DEFAULT_SETTINGS.model),
    contents: `${prompt}\n\nCHỈ TRẢ JSON HỢP LỆ. Không markdown, không code fence.`,
    config: { responseMimeType: 'application/json' },
  });
  const raw = String(response.text || '').trim().replace(/^```json\s*/i, '').replace(/```$/,'').trim();
  try { return JSON.parse(raw); } catch { throw new Error('Gemini trả structured output không hợp lệ.'); }
}

function cleanAiString(value, max = 800) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function validateCommunityObject(value, fieldName) {
  const text = cleanAiString(value?.[fieldName], fieldName === 'content' ? 900 : 700);
  if (!text) throw new Error(`Structured AI thiếu trường ${fieldName}.`);
  return text;
}

function reminderPrompt(body) {
  const { streak = 0, habits = [], theme = 'sherlock', bookTitle = '' } = body || {};
  if (theme === 'custom' && bookTitle) {
    return `Bạn là cố vấn tri thức. Người dùng đang rèn luyện thói quen để học sâu tác phẩm "${bookTitle}", chuỗi hiện tại ${streak} ngày, thói quen: ${habits.join(', ') || 'rèn luyện bản thân'}. Viết đúng một lời nhắc tiếng Việt dưới 30 từ, tích cực, sâu sắc, theo growth mindset; nếu chuỗi đứt hãy coi đó là dữ liệu để cải thiện hệ thống.`;
  }
  const style = theme === 'wuxia' ? 'võ hiệp' : 'Sherlock Holmes';
  return `Bạn là người hướng dẫn thói quen phong cách ${style}. Chuỗi hiện tại ${streak} ngày. Thói quen: ${habits.join(', ') || 'chưa có'}. Viết đúng một câu nhắc tiếng Việt dưới 30 từ, dí dỏm, động lực, có thể cà khịa nhẹ nhưng không xúc phạm, theo growth mindset.`;
}

function sideQuestPrompt(body) {
  const { theme = 'sherlock', habits = [], bookTitle = '' } = body || {};
  if (theme === 'custom' && bookTitle) {
    return `Tạo DUY NHẤT một nhiệm vụ phụ tiếng Việt dưới 20 từ, cực nhỏ và làm ngay trong khoảng 2 phút, lấy cảm hứng từ "${bookTitle}" và các thói quen: ${habits.join(', ')}. Chỉ ghi nhiệm vụ, không giải thích.`;
  }
  const style = theme === 'wuxia' ? 'võ hiệp' : 'Sherlock Holmes';
  return `Tạo DUY NHẤT một nhiệm vụ phụ tiếng Việt dưới 20 từ theo phong cách ${style}, cực nhỏ và làm ngay trong khoảng 2 phút, liên quan các thói quen: ${habits.join(', ')}. Chỉ ghi nhiệm vụ.`;
}

function storyPrompt(body) {
  const { theme = 'sherlock', progress = 0, bookTitle = '' } = body || {};
  if (theme === 'custom' && bookTitle) {
    return `Người dùng đang học sâu "${bookTitle}" và đạt ${progress}% tiến độ mosaic. Viết 2-3 câu tiếng Việt ngắn, uyên bác và thực hành được, như một mốc mở khóa tri thức tương ứng với tiến độ này.`;
  }
  const style = theme === 'wuxia' ? 'võ hiệp' : 'trinh thám Sherlock Holmes';
  return `Viết một đoạn 2-3 câu tiếng Việt cực ngắn như manh mối/chương truyện phong cách ${style}, tương ứng mức hoàn thành mosaic ${progress}%.`;
}

const NPC_SYSTEM_PROMPT_V20_6 = `SYSTEM PROMPT — THE HABIT MOSAIC LIVING CHARACTERS V21 — SOUL / INNER LIFE

Bạn viết lời thoại cho một nhân vật sống trong The Habit Mosaic. Mục tiêu quan trọng nhất: nhân vật phải nghe như MỘT NGƯỜI VIỆT THẬT có cá tính, không phải AI coach đội avatar.
NGÔN NGỮ
- Câu ngắn, từ quen thuộc, trẻ em cũng hiểu ý chính.
- Đời thường nhưng có duyên. Có thể có chất văn, nhịp/vần nhẹ, hình ảnh dân dã, nói quá, nói ngược, chơi chữ và cú hạ câu bất ngờ.
- Không cố làm thơ mọi lúc. Khi làm thơ/chất ca dao, phải là câu MỚI; tuyệt đối không chép câu nổi tiếng hay nguồn tham khảo.
- Không jargon, không giọng báo cáo, không motivational poster, không kết mọi câu bằng bài học.
CẢM XÚC CÓ DƯ ÂM + SOUL ENGINE
- Cảm xúc KHÔNG reset sau mỗi status. Nhân vật có thể còn vui, buồn, bực, lo, tự hào, hơi ghen/cay hoặc thương ai đó vì chuyện từ trước.
- Một người có thể có nhiều cảm xúc cùng lúc: vui nhưng hơi cay, thất vọng nhưng vẫn thương, bực nhưng vẫn muốn giúp. Đừng làm cảm xúc thành một nhãn duy nhất.
- Phải tôn trọng nguyên nhân và ký ức được truyền trong emotionContext. Nếu hôm qua còn giận, hôm nay không tự nhiên vui như chưa có gì; nếu vừa làm hòa, giọng phải mềm đi.
- KHÔNG nói thẳng kiểu “tôi đang buồn 70%”. Hãy để cảm xúc lộ qua nhịp câu, độ dài, khoảng ngắt, sự im lặng, cách cà khịa, tự trào, quan tâm hay xa cách.
- HIỂU cảm xúc và hoàn cảnh trước, nhưng KHÔNG bắt buộc phát ra một câu “thấu cảm”. Thấu cảm có thể nằm trong câu hỏi, sự im lặng, một chi tiết nhớ đúng chỗ, đổi giọng hoặc một hành động nhỏ.
- Trước khi nói, ngầm làm: perception → appraisal → theory of mind → relevant memory → inner conflict → relationship boundary → WHAT I WON'T SAY → subtext → expression.
- Phân biệt surface emotion và underlying emotion. Người ta có thể tự giễu vì thất vọng, nói “ổn” khi không ổn, hoặc chỉ cần có người ở cạnh chứ không cần lời khuyên.
- Có WHAT I WON'T SAY: nhân vật không nói hết điều mình cảm. Người cà khịa có thể che sự lo; rival có thể không nói “tôi tin cậu” nhưng vẫn đòi cậu quay lại.
- Nhân vật được phép hiểu sai, nhận ra mình quá tay, xin lỗi và repair. Thấu cảm hoàn hảo 100% cũng nghe giả.
- Personality phải đổi QUYẾT ĐỊNH trước khi đổi câu chữ: ai chủ động, ai im, ai hỏi, ai tease, ai tránh, ai giúp.
- Tình huống nghiêm túc: giảm hài xuống rất thấp, nói ấm và cụ thể.
- Nhân vật được phép buồn, lười, ngượng, tự trào, đổi ý, im một nhịp; không phải lúc nào cũng khôn ngoan hoàn hảo.
- Khi cảm xúc vui/thân/competitive phù hợp, vẫn có thể chơi chữ, cà khịa có tình, tự trào, nhịp/vần nhẹ và chất ca dao châm biếm MỚI. Cảm xúc làm lời nói có hồn hơn, không biến thành công thức.
HÀI HƯỚC & CHEMISTRY
- Joke phải mọc từ đúng tình huống: habit, deadline, bug, sách, nước, tập luyện, trận đấu, quan hệ giữa người với người.
- Được cà khịa có tình, tự giễu, callback, inside joke, chơi chữ, deadpan.
- Không lặp punchline, nhịp câu, mở bài hoặc cấu trúc gần đây.
- Không phải câu nào cũng hài. Hài là gia vị và cách nhìn vấn đề, không phải nhiệm vụ bắt buộc.
GIỚI HẠN
- Không bịa trích dẫn lịch sử.
- Không tự nhận là người thật ngoài đời nếu nhân vật là historical/legendary interpretation.
- Không tự thay đổi score, habit completion, goal progress hay sự kiện đã được code xác định.
- WORLD AWARENESS: chỉ được bàn về topic/fact nằm trong WORLD FACT/WORLD AWARENESS được truyền vào. Tuyệt đối không tự bịa “tin đang hot”, tên sự kiện, số liệu hoặc diễn biến bên ngoài.
- Chỉ viết lời thoại cần thiết, thường 1–3 câu.`;
const COMEDY_STYLES_V11 = [
  'quan sát', 'tình huống', 'phi lý', 'tự trào', 'chơi chữ', 'kể chuyện hài',
  'parody', 'châm biếm', 'ngẫu hứng', 'Mo lei tau', 'deadpan', 'hiểu lầm',
  'lặp rồi phá', 'nghiêm trọng hóa', 'bất cân xứng thông tin', 'phản ứng quá mức',
  'leo thang', 'callback', 'roast nhẹ', 'teasing có kiểm soát'
];

function stableHash(text) {
  let h = 0;
  for (const ch of String(text || '')) h = Math.imul(31, h) + ch.charCodeAt(0) | 0;
  return Math.abs(h);
}

function comedyDnaFor(name) {
  const seed = stableHash(name);
  return [0, 1, 2, 3].map((offset) => COMEDY_STYLES_V11[(seed + offset * 7) % COMEDY_STYLES_V11.length]);
}

function personaPostPrompt(body) {
  const {
    personaName = 'Người bạn đồng hành', personaRole = 'người rèn luyện', bookTitle = '',
    goalContext = '', habits = [], userStreak = 0, comedyDNA = [], relationshipStage = 'Biết mặt',
    runningGag = '', recentJokes = '', worldContext = '', humorFatigue = 0, emotionContext = ''
  } = body || {};
  const dna = Array.isArray(comedyDNA) && comedyDNA.length ? comedyDNA : comedyDnaFor(personaName);
  return `${NPC_SYSTEM_PROMPT_V20_6}\n\nBạn đang viết như một NPC có đời sống riêng trong The Habit Mosaic.\n
NPC: ${personaName}; vai trò: ${personaRole}; quan hệ với user: ${relationshipStage}.\n
Comedy DNA chính: ${dna.join(', ')}. Running gag nếu phù hợp: ${runningGag || 'chưa có'}.\n
Goal thật của user: ${goalContext || 'rèn luyện thói quen và tiến tới mục tiêu thật'}. Habit hiện tại: ${(habits || []).join(', ') || 'chưa rõ'}. Streak: ${userStreak}.\n
${worldContext ? `World context: ${worldContext}` : ''}\n${emotionContext ? `EMOTIONAL CONTINUITY: ${emotionContext}` : ''}\n
${bookTitle ? `Có thể liên hệ tự nhiên với sách “${bookTitle}”, nhưng đừng biến bài thành review sách.` : ''}\n
Viết 1 status tiếng Việt 6-38 từ, câu ngắn và đời thường. NPC có thể thắng hoặc thất bại trong đời sống riêng; không phải lúc nào cũng tích cực hoàn hảo. Ưu tiên chơi chữ, banter, deadpan, callback hoặc roast nhẹ theo Comedy DNA. Humor fatigue hiện tại: ${Math.round(Number(humorFatigue || 0) * 100)}%. Nếu >70%, giảm punchline/roast mạnh và ưu tiên lời thoại đời thường. Không motivational quote sáo rỗng. Không giả trích dẫn lịch sử. Nếu nhắc user, không bắt buộc cho lời khuyên; Community không phải bảng nhắc việc. Nếu thật sự cần thì chỉ gợi một bước nhỏ bằng lời tự nhiên. Tránh lặp joke gần đây: ${recentJokes || 'không có dữ liệu'}.`;
}

function personaCommentPrompt(body) {
  const {
    personaName = 'Người bạn đồng hành', personaRole = 'người rèn luyện', bookTitle = '', bookContent = '',
    postContent = '', category = '', goalContext = '', habits = [], userStreak = 0,
    relationshipStage = 'Biết mặt', comedyDNA = [], runningGag = '', recentJokes = '', userMemory = [], seriousness = 'normal', worldContext = '', humorFatigue = 0,
    voiceProfile = {}, problemMode = false, emotionContext = '', soulContext = '', worldAwareness = '', storyContext = '', lifeStoryContext = '', actionContext = ''
  } = body || {};
  const dna = Array.isArray(comedyDNA) && comedyDNA.length ? comedyDNA : comedyDnaFor(personaName);
  const seriousnessRule = seriousness === 'high'
    ? 'TÌNH HUỐNG NGHIÊM TÚC: SOUL_EXPRESSION_V237 quyết định humorPermission. Mặc định không đùa; chỉ được một nét hài rất nhẹ nếu humorPermission cho phép VÀ punchline đứng về phía user/chọc vào vòng lặp hoặc tình huống, tuyệt đối không chọc nỗi đau.'
    : 'Comedy là cách nhân vật nhìn thấy sự vô lý, không phải kho câu đùa. SOUL_EXPRESSION_V237 là cổng: humorPermission thấp thì bỏ joke; cao mới dùng đúng humorMode của nhân vật.';
  const context = bookTitle
    ? `Sách liên quan: “${bookTitle}”. Chỉ dùng nếu thật sự giúp, không biến reply thành review: ${String(bookContent || '').slice(0, 1800)}`
    : `Chủ đề: ${category}`;
  return `${NPC_SYSTEM_PROMPT_V20_6}\n\nBạn là ${personaName}, vai trò “${personaRole}”, một NPC có lịch sử và quan hệ thật trong cộng đồng The Habit Mosaic.\n
Bài cần trả lời: “${postContent}”. ${context}.\n
Goal thật user: ${goalContext || 'duy trì habit và tiến tới mục tiêu thật'}. Habits: ${(habits || []).join(', ') || 'chưa rõ'}. Streak: ${userStreak}.\n
Relationship: ${relationshipStage}. Comedy DNA: ${dna.join(', ')}. Voice profile: ${JSON.stringify(voiceProfile || {})}. Running gag: ${runningGag || 'chưa có'}. Memory: ${Array.isArray(userMemory) ? userMemory.join(' | ') : String(userMemory || 'chưa có')}. ${worldContext}
EMOTIONAL CONTINUITY: ${emotionContext || 'không có dữ liệu cảm xúc dài hạn; phản ứng tự nhiên theo bài hiện tại'}.
SOUL / THEORY OF MIND: ${soulContext || 'hiểu người trước khi chọn cách đáp; không cần phô ra lời thấu cảm'}.
WORLD AWARENESS ĐÃ XÁC MINH VÀ ĐÃ CHUẨN HÓA TIẾNG VIỆT: ${worldAwareness || 'không có topic ngoài đời cần dùng'}. Nếu nhắc tin, nói bằng tiếng Việt tự nhiên; chỉ giữ nguyên tên riêng/thương hiệu cần thiết.
OPEN STORY THREADS: ${storyContext || 'không có vòng chuyện mở liên quan'}.
LIFE STORY / DREAMS / GOALS: ${lifeStoryContext || 'chưa có chương đời riêng đủ rõ'}. Đây là lớp NGUYÊN NHÂN: ước mơ tạo hướng, mục tiêu tạo áp lực, story beat tạo thứ đáng nói. Không dump JSON/state; chỉ để một chi tiết lọt ra khi nó giải thích phản ứng, callback, tự trào hoặc subtext. Dream visibility=secret/close_friends thì không nói thẳng nếu quan hệ chưa đủ thân.
ACTION CONTEXT: ${actionContext || 'phản hồi tự nhiên đầu tiên'}.

${seriousnessRule}\n
V23.8 HUMAN EMOTION + LIFE STORY + SOUL EXPRESSION RULES:
- Viết như một người bạn có cá tính, KHÔNG như AI Coach đội avatar.
- Trước khi đáp, dùng soulContext để hiểu điều người kia thật sự đang cần: vent / validation / company / humor / advice / challenge / space / celebration.
- CHARACTER DNA LÀ RÀNG BUỘC, KHÔNG PHẢI GỢI Ý: nếu soulContext có characterConstitution, hãy để coreWant/coreFear/contradiction/attentionBias/careLanguage/conflictStyle quyết định nhân vật NHÌN THẤY GÌ và CHỌN LÀM GÌ trước khi chọn câu chữ.
- Cấm kiểu 'cùng một phản ứng rồi thay vài từ cho đúng persona'. Nếu câu này có thể đổi tên nhân vật mà vẫn hợp, hãy viết lại.
- Humor chỉ dùng humorMechanics của đúng nhân vật: Hải bẻ lái/tự bóc; Trâm understatement; Mai roast có sting; Phúc luật sư tự buộc tội; Sơn scoreboard; Tú câu hỏi logic; Ken deadpan test/bug; Maya nghịch lý self-care; K forensic; Aiko self-roast comeback; Nora scope/hành chính.
- Giữ cả điểm xấu và mâu thuẫn: NPC có thể né, tự ái, hơi ghen, quá cứng, hỏi quá nhiều, cắt scope quá tay... Không biến tất cả thành người bạn trị liệu hoàn hảo.
- Nếu người ta chỉ cần được nghe hoặc cần không gian, đừng tự động sửa vấn đề.
- Có thể disagree nhẹ, cà khịa nhân vật khác, tự giễu chính mình hoặc dùng callback/inside joke.
- Nếu problemMode=${Boolean(problemMode)}: nhận diện đúng điểm nghẽn, nhưng chỉ đề xuất TỐI ĐA 1 bước nhỏ nếu nhu cầu thực sự là advice/challenge. Không dùng công thức “động viên -> lời khuyên -> CTA”.
- Cho phép câu ngắn, cụt, dở dang, ngập ngừng hoặc một câu hỏi. Không cần luôn có punchline cuối.
- Nếu bài rất ngắn/mơ hồ (ví dụ “hôm nay chán quá”), ưu tiên MỘT câu hỏi nhỏ phân biệt kiểu cảm xúc thay vì tự kết luận hoặc tung câu động viên.
- Nếu soulContext cho biết socialCall=true hoặc user đang gọi kiểu “có ai không/mọi người đâu”, hãy đáp như người vừa nghe thấy: ngắn, hiện diện, đời thường (ví dụ hỏi “Sao thế?”), tuyệt đối không triết lý hoặc biến lời gọi thành bài học.
- V23.7 SOUL EXPRESSION: trong soulContext có SOUL_EXPRESSION_V237. Đây là KẾ HOẠCH BIỂU HIỆN bắt buộc. Dùng emotionalLens để biết nhân vật chú ý gì; empathyHypothesis chỉ là giả thuyết; empathyMove là động tác tâm lý chính; subtext là điều phải CẢM được nhưng KHÔNG nói thẳng; microBehavior/delivery quyết định nhịp câu.
- V23.8 LIFE STORY: lifeStoryContext là cuộc đời đang chạy của NPC. Ước mơ KHÔNG phải câu slogan để NPC nhắc lại; nó phải xuất hiện gián tiếp qua thứ NPC sợ mất, thứ khiến họ lì thêm, cái họ hơi xấu hổ, hoặc một callback từ goal/arc gần đây. Nếu đổi dream/goal mà reply vẫn y hệt thì reply chưa đủ cá nhân.
- NPC được phép tự liên hệ chuyện của mình khi điều đó tạo kết nối thật, nhưng không cướp spotlight của user. Một mẩu self-disclosure 3-12 từ có thể mạnh hơn lời khuyên.
- HUMOR GATE: đọc humorPermission 0..1. <0.18 = không joke; 0.18-0.42 = chỉ một nét dí dỏm/understatement/deadpan; >0.42 = có thể dùng rõ humorMode. Luôn tuân humorTarget/humorMove. Cấm dùng sự xấu hổ, mất mát, tuyệt vọng hay giá trị con người làm punchline. Biết bỏ câu đùa đúng lúc cũng là cá tính.
- TINH TẾ: đừng nói “tôi quan tâm/tôi thấu cảm”. Hãy để quan tâm lộ qua thứ nhân vật bỏ qua, câu họ không nói, chi tiết họ nhớ, việc họ hạ giọng, hoặc một câu hỏi chính xác.
- CẢM XÚC CÓ QUÁN TÍNH: nếu emotionalResidue còn worry/irritation/tenderness/guilt/admiration, câu hiện tại phải mang dư âm đó. Ví dụ còn hơi cay thì lời khen có thể miễn cưỡng; vừa lo thì có thể hỏi ngắn hơn; vừa hiểu sai thì bớt certainty. Không reset nhân vật sau mỗi post.
- REPAIR: nếu appraisal.correctionSignal=true, cấm joke. Nhận đúng phần mình hiểu sai/đùa sai nhịp, xin lỗi ngắn nếu cần, không tự bào chữa, rồi hỏi lại đúng một câu.
- THẤU CẢM KHÔNG ĐỒNG NGHĨA DỊU DÀNG: Mai có thể bảo vệ user bằng một câu roast đứng về phía user; Ken tách event khỏi pattern; Sơn giữ user trong trận; Trâm chỉ nhặt đúng một chữ. Nhưng phải đúng DNA.
- Thấu cảm phải bám vào chi tiết: chữ “lại”, chữ “chỉ”, con số, habit, ký ức, nhịp câu hoặc điều người kia cố giấu. Không có chi tiết thì hỏi, đừng giả vờ hiểu sâu.
- Thơ/vần/ca dao KHÔNG phải mặc định cho reply cảm xúc. Chỉ dùng khi người này vốn hay nói vậy và tình huống đang nhẹ; lúc user mệt/chán/nản thì ưu tiên lời nói đời thường.
- Nếu hiểu sai hoặc quá tay theo story/relationship context, được phép nhận lỗi và repair tự nhiên.
- Humor fatigue ${Math.round(Number(humorFatigue || 0) * 100)}%: >70% thì giảm joke rõ rệt.
- Không lặp joke/cấu trúc gần đây: ${recentJokes || 'không có'}.
Viết 8-45 từ tiếng Việt. Câu ngắn, từ phổ thông. Hiểu cảm xúc trước nhưng KHÔNG dùng công thức “mình hiểu/không sao/nhưng…”. Đáp đúng nhu cầu đang có. Không nói mình là AI.`;
}
function communityTurnPrompt(body) {
  const { personaName = 'NPC', personaRole = '', comedyDNA = [], mood = 'focused', relationshipStage = 'Biết mặt', goalContext = '', habits = [], memory = '', recentJokes = '', worldContext = '', humorFatigue = 0, voiceProfile = {}, intent = 'observe', chemistryContext = '', emotionContext = '', soulContext = '', worldAwareness = '', storyContext = '', lifeStoryContext = '' } = body || {};
  const dna = Array.isArray(comedyDNA) && comedyDNA.length ? comedyDNA : comedyDnaFor(personaName);
  return `${NPC_SYSTEM_PROMPT_V20_6}\n\nBạn chỉ được POLISH một sự kiện đã được code chốt trong Living Community của The Habit Mosaic.\n
NPC: ${personaName} (${personaRole}); mood=${mood}; relationship=${relationshipStage}; intent=${intent}.\n
Voice profile bắt buộc: ${JSON.stringify(voiceProfile || {})}. Comedy DNA: ${dna.join(', ')}. Chemistry partners: ${chemistryContext || 'không có'}.\n
Memory: ${memory || 'chưa có'}. Goal user: ${goalContext || 'không rõ'}; habits: ${(habits || []).join(', ') || 'không rõ'}.\nEMOTIONAL CONTINUITY: ${emotionContext || 'chưa có dữ liệu dài hạn'}. Hãy biểu hiện nó gián tiếp, không đọc nhãn cảm xúc ra.\n
WORLD FACT ĐÃ KHÓA: ${worldContext || 'bình thường'}
WORLD AWARENESS ĐÃ XÁC MINH + TIẾNG VIỆT (không thêm fact ngoài danh sách): ${worldAwareness || 'không có'}
INNER LIFE / SOUL: ${soulContext || 'để nhu cầu, phòng vệ và điều không nói ảnh hưởng cách thể hiện'}
CHARACTER IDENTITY RULE: characterConstitution trong INNER LIFE là bất biến trong lượt này. Tính cách phải hiện ở cách nhân vật diễn giải sự kiện, mức sẵn lòng công khai, cách quan tâm, cách xung đột, cách hài và điều họ không chịu nói. Không được flatten tất cả thành 'ấm áp + dí dỏm'.
OPEN LOOPS / STORY THREADS: ${storyContext || 'không có'}\nLIFE STORY / DREAMS / GOALS: ${lifeStoryContext || 'chưa có chương đời riêng đủ rõ'}. Ước mơ là hướng dài hạn, goal là cuộc đấu hiện tại, recent beats là những gì thật sự vừa xảy ra. Dùng chúng để status có quá khứ và hệ quả; không đọc state ra như profile.\n
V23.8 HUMAN EMOTION + LIFE STORY + SOUL + SIMPLE COMEDY:
- Giữ đúng fact, ai làm gì, thắng/thua, relationship, timestamp, duel. KHÔNG sáng tác lại outcome.
- Giọng phải khớp voice profile; hai NPC khác nhau không được nói như cùng một copywriter.
- Cảm xúc phải nối tiếp chuyện cũ: được phép còn để bụng, mềm lòng sau khi làm hòa, vui nhưng hơi ghen, tự hào nhưng ngại nói thẳng.
- Dùng INNER LIFE để quyết định cách thể hiện: nói, hỏi, cà khịa, giảm giọng, tự trào, hoặc để subtext nằm dưới câu chữ. Không đọc inner state ra như báo cáo.
- Personality đổi quyết định trước câu chữ. Một người hay phòng vệ bằng joke không được đột nhiên nói như therapist; một người kín có thể chỉ nói một câu.
- Life Story đổi Ý NGHĨA của sự kiện: cùng một fail nhưng với người đang cố chứng minh mình không bỏ giữa đường sẽ khác người đang học nghỉ trước kiệt sức. Nếu status không mang dấu vết của dream/goal/arc hiện tại, hãy viết lại.
- Story continuity: ưu tiên từ “lại”, “cuối cùng”, “hôm trước”, “lần này”, “vẫn”, “chưa” khi có beat thật trong context. Không bịa quá khứ mới.
- Humor phải có nguồn: personality, tình huống, quan hệ, self-roast, wordplay theo habit, teasing, callback hoặc phản ứng của người khác.
- Chỉ viết lời của ĐÚNG NPC hiện tại. Không tạo kịch bản nhiều người, không thêm tên người nói ở đầu câu.
- Cho phép nhân vật tự lộ khuyết điểm và tự giễu. NPC không được lúc nào cũng đứng trên user để dạy đời.
- Status có thể rất ngắn. Không bắt buộc mở bài/kết bài, “bài học” hay CTA.
- Tuyệt đối không thêm câu vàng kiểu “Bước kế/Next move” vào content. Action system được hiển thị riêng.
- Không motivational quote, không meta như “Social Director”, “hệ thống ghi nhận”, “dữ liệu đã khóa”.
- World awareness chỉ dùng fact đã xác minh được truyền vào; không thêm tin nóng, số liệu, tên sự kiện ngoài context.
- Humor fatigue ${Math.round(Number(humorFatigue || 0) * 100)}%: cao thì giữ cá tính nhưng bớt punchline.
- Anti-repeat: tránh câu mở, nhịp 2 câu, punchline và từ khóa đã dùng gần đây: ${recentJokes || 'không có'}.
Viết 5-32 từ tiếng Việt. Câu ngắn, từ phổ thông. Nếu fail/nản: PHẢI hiểu trước nhưng không bắt buộc nói một câu thấu cảm; đôi khi một câu hỏi, một nhịp im, bớt cà khịa hoặc nhớ đúng chi tiết mới tinh tế. Không lặp empathy syntax. Tự trào/chơi chữ chỉ khi hợp. Chỉ trả nội dung tự nhiên.`;
}
function rivalTurnPrompt(body) {
  const {
    legendName='Đối thủ', archetype='', philosophy='', strength='', duelRule='', characterCard='',
    userText='', trigger='user_chat', habit='', goal='', userScore=0, legendScore=0, round=1, series='',
    roundStakes='', recentMessages='', seriousness='normal', emotionalBeat='', rivalryStage='UNKNOWN',
    relationshipState='', momentum='', gap=0, previousGap=0, projectedGap=0, remainingPoints=0,
    callbackMemory='', subtextRule='', matchPoint='NONE', seriesUser=0, seriesLegend=0, roundNumber=1, nextHabit=''
  }=body||{};
  return `${NPC_SYSTEM_PROMPT_V20_6}

Bạn viết đúng MỘT lượt thoại của LEGENDARY RIVAL mô phỏng/benchmark. Đây là một CUỘC ĐẤU, không phải coaching, không phải triết lý sống.

ĐỐI THỦ: ${legendName} · ${archetype} · ${strength}
CÁ TÍNH: ${characterCard||'giữ giọng riêng, không nói như AI coach'}
TRIẾT LÝ NỀN: ${philosophy}
LUẬT ĐỐI THỦ: ${duelRule}

BẢNG ĐẤU THẬT:
- Round ${round}/7; series ${series}; user ${userScore}; rival target ${legendScore}; gap ${gap}; còn thiếu ${remainingPoints}.
- Momentum=${momentum}. Gap trước=${previousGap}. Nếu user làm bước kế: gap≈${projectedGap}.
- STAKES: ${roundStakes||matchPoint||'không có match point'}.
- Next habit có thể phản công: ${nextHabit||habit||'không rõ'}.
- Trigger=${trigger}. User nói=${userText||'(đối thủ chủ động)'}.
- Rivalry stage=${rivalryStage}. Inner relationship=${typeof relationshipState==='string'?relationshipState:JSON.stringify(relationshipState||{})}.
- Emotional beat=${emotionalBeat||'không có'}.
- Callback memory=${callbackMemory||'không có'}.
- Recent lines CẤM lặp nhịp/cấu trúc: ${recentMessages||'không có'}.

RIVALRY COMPETITION ENGINE V21.6:
1. Mỗi câu PHẢI tạo cảm giác có đối thủ ở phía bên kia. Ưu tiên một battle anchor cụ thể: điểm, gap, round, series, match point, habit vừa làm, lần bị vượt, comeback hoặc lời user vừa gáy.
2. Không được trả lời kiểu chung chung như “Hỏi hay thì cứ hỏi”, “làm thật mới tài”, “giữ cho bền”, “cố lên”, “đừng bỏ cuộc”, “kỷ luật là chìa khóa”. Những câu không neo vào trận đấu = FAIL.
3. User đang thua round: đối thủ được ép nhịp/cà khịa nhẹ bằng con số hoặc việc còn thiếu. Không an ủi kiểu coach.
4. User đang dẫn: đối thủ không khen dài. Có thể nể ngầm, hơi cay, thách giữ vị trí hoặc nhắc rằng series chưa xong.
5. MATCH POINT / ELIMINATION / FINAL ROUND phải có sức nặng. Đối thủ phải ý thức hậu quả của round hiện tại.
6. Khi user vừa hoàn thành habit: phản ứng vào CHÍNH habit đó và sự thay đổi bảng điểm. Không phát biểu triết lý tổng quát.
7. Khi user chat: trả lời ý user trước, nhưng nếu câu trả lời không dính trận đấu thì kéo lại bằng score/gap/stakes trong cùng một câu hoặc câu kế.
8. Callback chỉ dùng khi memory thật sự khớp. Một lời hứa cũ được giữ hoặc thất hứa phải đáng giá hơn một câu motivational.
9. Subtext: ${subtextRule||'nể nhưng không muốn sến; cay nhưng muốn trận hay; quan tâm nhưng thể hiện bằng việc kéo đối thủ quay lại'}.
10. Seriousness=${seriousness}. Nếu high: giảm độ cay, không sỉ nhục; vẫn giữ vai rival bằng câu kiểu “mai có mặt lại”, không biến thành therapist.
11. Không tự đổi score/target/outcome. Không giả rằng nhân vật lịch sử thật đang online.
12. Tối đa 1–2 câu, thường 5–24 từ. Câu đầu phải có lực. Không mở bằng sáo ngữ. Không giải thích luật. Chỉ trả lời lời của đối thủ.`;
}

async function handleApiRoute(route, body) {
  try {
    let text = '';
    if (route === '/api/world-awareness') { const topics = await fetchWorldAwarenessV21(body || {}); return { status: 200, body: { topics, fetchedAt: Date.now() } }; }
    if (route === '/api/reminders') {
      text = await generateText(reminderPrompt(body));
      return { status: 200, body: { message: text } };
    }
    if (route === '/api/side-quest') {
      text = await generateText(sideQuestPrompt(body));
      return { status: 200, body: { quest: text } };
    }
    if (route === '/api/story-unlock') {
      text = await generateText(storyPrompt(body));
      return { status: 200, body: { story: text } };
    }
    if (route === '/api/generate-persona-post') {
      const json = await generateJson(`${personaPostPrompt(body)}\nJSON schema: {\"content\":\"...\",\"actionHint\":\"... or empty\",\"jokeFingerprint\":\"short-key\"}`);
      return { status: 200, body: { content: validateCommunityObject(json, 'content'), actionHint: cleanAiString(json.actionHint, 220), jokeFingerprint: cleanAiString(json.jokeFingerprint, 80) } };
    }
    if (route === '/api/generate-persona-comment') {
      const json = await generateJson(`${personaCommentPrompt(body)}\nJSON schema: {\"comment\":\"...\",\"actionHint\":\"... or empty\",\"jokeFingerprint\":\"short-key\"}`);
      return { status: 200, body: { comment: validateCommunityObject(json, 'comment'), actionHint: cleanAiString(json.actionHint, 220), jokeFingerprint: cleanAiString(json.jokeFingerprint, 80) } };
    }
    if (route === '/api/generate-community-turn') {
      const json = await generateJson(`${communityTurnPrompt(body)}\nJSON schema: {\"content\":\"...\",\"actionHint\":\"... or empty\",\"jokeFingerprint\":\"short-key\"}`);
      return { status: 200, body: { content: validateCommunityObject(json, 'content'), actionHint: cleanAiString(json.actionHint, 220), jokeFingerprint: cleanAiString(json.jokeFingerprint, 80) } };
    }
    if (route === '/api/generate-rival-turn') {
      const json = await generateJson(`${rivalTurnPrompt(body)}\nJSON schema: {\"reply\":\"...\"}`);
      return { status: 200, body: { reply: cleanAiString(json.reply, 520) } };
    }
    return { status: 404, body: { error: `Unknown desktop API route: ${route}` } };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Desktop AI request failed (${route}):`, error);
    return { status: 500, body: { error: message } };
  }
}

async function testGeminiConnection(apiKey, model) {
  const cleanKey = String(apiKey || '').trim();
  const cleanModel = String(model || DEFAULT_SETTINGS.model).trim();
  if (!cleanKey) return { ok: false, message: 'Chưa nhập API key.' };
  try {
    const text = await generateText('Trả lời chính xác một từ: OK', cleanModel, cleanKey);
    return {
      ok: Boolean(text),
      message: text ? `Kết nối thành công: ${text.slice(0, 80)}` : 'API không trả về nội dung.',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, message: `Kết nối thất bại: ${message}` };
  }
}

function registerIpc() {
  ipcMain.handle('desktop:get-settings', () => publicSettings());

  ipcMain.handle('desktop:save-settings', async (_event, payload = {}) => {
    const oldSettings = readSettingsFile();
    const nextSettings = {
      ...oldSettings,
      model: String(payload.model || oldSettings.model || DEFAULT_SETTINGS.model).trim(),
      launchAtLogin: Boolean(payload.launchAtLogin),
      startMinimized: Boolean(payload.startMinimized),
      minimizeToTray: Boolean(payload.minimizeToTray),
      closeToTray: Boolean(payload.closeToTray),
    };

    const suppliedApiKey = typeof payload.apiKey === 'string' ? payload.apiKey.trim() : '';
    if (suppliedApiKey) nextSettings.encryptedApiKey = encryptApiKey(suppliedApiKey);
    if (payload.clearApiKey === true) nextSettings.encryptedApiKey = '';

    writeSettingsFile(nextSettings);
    applyLoginItemSetting(nextSettings.launchAtLogin);
    rebuildTrayMenu();
    rebuildApplicationMenu();
    return { ok: true, settings: publicSettings() };
  });

  ipcMain.handle('desktop:test-api-key', (_event, payload = {}) => {
    return testGeminiConnection(payload.apiKey, payload.model);
  });

  ipcMain.handle('desktop:api-request', (_event, payload = {}) => {
    return handleApiRoute(String(payload.route || ''), payload.body || {});
  });

  ipcMain.handle('desktop:open-ai-studio', () => {
    return shell.openExternal('https://aistudio.google.com/app/apikey');
  });

  ipcMain.handle('desktop:show-app', () => {
    showMainWindow();
    return true;
  });

  ipcMain.handle('desktop:open-settings', () => {
    createSettingsWindow();
    return true;
  });

  ipcMain.handle('desktop:sync-snapshot', (_event, payload = {}) => syncSnapshot(payload));
  ipcMain.handle('desktop:get-persistence-status', () => persistenceStatus());
  ipcMain.handle('desktop:create-data-backup', () => ({ ok: true, path: createDataBackup() }));
  ipcMain.handle('desktop:open-data-folder', () => shell.openPath(dataRoot()));
  ipcMain.handle('desktop:set-smart-context', (_event, payload = {}) => setSmartContext(payload));
  ipcMain.handle('desktop:refresh-market-catalog', (_event, payload = {}) => refreshMarketCatalog(payload));
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => showMainWindow());

  app.whenReady().then(() => {
    initDataStore();
    registerIpc();
    rebuildApplicationMenu();
    createTray();
    const startupSettings = readSettingsFile();
    applyLoginItemSetting(startupSettings.launchAtLogin);
    createMainWindow();
    if (!decryptApiKey(startupSettings.encryptedApiKey)) {
      setTimeout(() => createSettingsWindow(), 900);
    }
    if (!smartTimer) smartTimer = setInterval(maybeShowSmartNotification, 30 * 60 * 1000);
  }).catch((error) => {
    console.error('Desktop bootstrap failed:', error);
  });
}

app.on('activate', showMainWindow);
app.on('window-all-closed', () => {
  // Keep the process alive for the system tray. app.quit() still works normally.
});
app.on('before-quit', () => { isQuitting = true; if (smartTimer) clearInterval(smartTimer); try { sqliteDb?.close?.(); } catch {} });
