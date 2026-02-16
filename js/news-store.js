// お知らせデータストア (JSON file + localStorage fallback)
const NEWS_KEY = 'demo_salon_news';

const SEED_NEWS = [
  {
    id: '1',
    title: 'ホームページを開設しました',
    body: '<p>この度、当サロンのホームページを開設いたしました。</p><p>メニューやスタイリスト情報など、最新情報をお届けしてまいります。今後ともよろしくお願いいたします。</p>',
    category: 'お知らせ',
    status: 'published',
    createdAt: '2026-02-10T09:00:00',
    updatedAt: '2026-02-10T09:00:00',
  },
  {
    id: '2',
    title: '春の新メニューのご案内',
    body: '<p>春限定カラーメニューが始まりました。</p><p>トレンドの透明感カラーや、春らしいピンクベージュなど、季節感のあるカラーを取り揃えております。</p><p>ぜひこの機会にお試しください。</p>',
    category: 'キャンペーン',
    status: 'published',
    createdAt: '2026-02-01T09:00:00',
    updatedAt: '2026-02-01T09:00:00',
  },
  {
    id: '3',
    title: '年末年始の営業日について',
    body: '<p>年末年始の営業日をお知らせいたします。</p><p><strong>12月30日（火）</strong>：通常営業<br><strong>12月31日（水）〜1月3日（土）</strong>：休業<br><strong>1月4日（日）</strong>：通常営業</p><p>ご不便をおかけしますが、よろしくお願いいたします。</p>',
    category: 'お知らせ',
    status: 'published',
    createdAt: '2025-12-20T09:00:00',
    updatedAt: '2025-12-20T09:00:00',
  },
];

const NewsStore = {
  _cache: null,

  async init() {
    try {
      const res = await fetch('data/news.json');
      if (res.ok) {
        this._cache = await res.json();
        return;
      }
    } catch (e) { /* fetch失敗時はlocalStorageフォールバック */ }
    this._cache = null;
  },

  _getAll() {
    if (this._cache) return [...this._cache];
    const raw = localStorage.getItem(NEWS_KEY);
    if (!raw) {
      localStorage.setItem(NEWS_KEY, JSON.stringify(SEED_NEWS));
      return [...SEED_NEWS];
    }
    return JSON.parse(raw);
  },

  getPublished() {
    return this._getAll()
      .filter(n => n.status === 'published')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getAll() {
    return this._getAll().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getById(id) {
    return this._getAll().find(n => n.id === id) || null;
  },

  save(item) {
    const all = this._getAll();
    const now = new Date().toISOString();
    if (item.id) {
      const idx = all.findIndex(n => n.id === item.id);
      if (idx >= 0) {
        all[idx] = { ...all[idx], ...item, updatedAt: now };
      }
    } else {
      item.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      item.createdAt = now;
      item.updatedAt = now;
      item.status = item.status || 'published';
      all.push(item);
    }
    localStorage.setItem(NEWS_KEY, JSON.stringify(all));
    return item;
  },

  delete(id) {
    const all = this._getAll().filter(n => n.id !== id);
    localStorage.setItem(NEWS_KEY, JSON.stringify(all));
  },
};

if (typeof module !== 'undefined') module.exports = NewsStore;
