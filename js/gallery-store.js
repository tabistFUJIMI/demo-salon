// スタイルギャラリーデータストア (JSON file + localStorage fallback)
const GALLERY_KEY = 'demo_salon_gallery';

const SEED_GALLERY = [
  {
    id: '1',
    title: 'ナチュラルショートボブ',
    description: '柔らかい質感のショートボブ。朝のスタイリングも簡単で、忙しい方にもおすすめです。',
    category: 'ショート',
    image: 'images/hero-bg.jpg',
    status: 'published',
    createdAt: '2026-02-05T09:00:00',
    updatedAt: '2026-02-05T09:00:00',
  },
  {
    id: '2',
    title: 'グレージュカラー × レイヤーミディアム',
    description: '透明感のあるグレージュカラーと動きのあるレイヤーカット。大人っぽい雰囲気に。',
    category: 'ミディアム',
    image: 'images/hero-bg.jpg',
    status: 'published',
    createdAt: '2026-01-20T09:00:00',
    updatedAt: '2026-01-20T09:00:00',
  },
  {
    id: '3',
    title: 'ゆるふわロングパーマ',
    description: 'デジタルパーマで作るゆるふわカール。自然なウェーブが女性らしい印象を演出します。',
    category: 'ロング',
    image: 'images/hero-bg.jpg',
    status: 'published',
    createdAt: '2025-12-15T09:00:00',
    updatedAt: '2025-12-15T09:00:00',
  },
];

const GalleryStore = {
  _cache: null,

  async init() {
    try {
      const res = await fetch('data/gallery.json');
      if (res.ok) {
        this._cache = await res.json();
        return;
      }
    } catch (e) { /* fetch失敗時はlocalStorageフォールバック */ }
    this._cache = null;
  },

  _getAll() {
    if (this._cache) return [...this._cache];
    const raw = localStorage.getItem(GALLERY_KEY);
    if (!raw) {
      localStorage.setItem(GALLERY_KEY, JSON.stringify(SEED_GALLERY));
      return [...SEED_GALLERY];
    }
    return JSON.parse(raw);
  },

  getPublished() {
    return this._getAll()
      .filter(g => g.status === 'published')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getAll() {
    return this._getAll().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getById(id) {
    return this._getAll().find(g => g.id === id) || null;
  },

  save(item) {
    const all = this._getAll();
    const now = new Date().toISOString();
    if (item.id) {
      const idx = all.findIndex(g => g.id === item.id);
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
    localStorage.setItem(GALLERY_KEY, JSON.stringify(all));
    return item;
  },

  delete(id) {
    const all = this._getAll().filter(g => g.id !== id);
    localStorage.setItem(GALLERY_KEY, JSON.stringify(all));
  },
};

if (typeof module !== 'undefined') module.exports = GalleryStore;
