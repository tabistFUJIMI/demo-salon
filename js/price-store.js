// メニュー・料金データストア (JSON file + localStorage fallback)
const PRICE_KEY = 'demo_salon_price';

const SEED_PRICE = [
  { id: '1', name: 'カット', category: 'カット', price: 4400, note: '', status: 'published', order: 1 },
  { id: '2', name: 'カット＋カラー', category: 'セットメニュー', price: 8800, note: 'リタッチの場合は¥7,700', status: 'published', order: 2 },
  { id: '3', name: 'カット＋パーマ', category: 'セットメニュー', price: 9900, note: '', status: 'published', order: 3 },
  { id: '4', name: 'カラー（リタッチ）', category: 'カラー', price: 5500, note: '', status: 'published', order: 4 },
  { id: '5', name: 'カラー（フルカラー）', category: 'カラー', price: 7700, note: '', status: 'published', order: 5 },
  { id: '6', name: 'パーマ', category: 'パーマ', price: 6600, note: '', status: 'published', order: 6 },
  { id: '7', name: 'トリートメント', category: 'ケア', price: 3300, note: '', status: 'published', order: 7 },
  { id: '8', name: 'ヘッドスパ', category: 'ケア', price: 4400, note: '', status: 'published', order: 8 },
];

const PriceStore = {
  _cache: null,

  async init() {
    try {
      const res = await fetch('data/price.json');
      if (res.ok) {
        this._cache = await res.json();
        return;
      }
    } catch (e) { /* fetch失敗時はlocalStorageフォールバック */ }
    this._cache = null;
  },

  _getAll() {
    if (this._cache) return [...this._cache];
    const raw = localStorage.getItem(PRICE_KEY);
    if (!raw) {
      localStorage.setItem(PRICE_KEY, JSON.stringify(SEED_PRICE));
      return [...SEED_PRICE];
    }
    return JSON.parse(raw);
  },

  getPublished() {
    return this._getAll()
      .filter(p => p.status === 'published')
      .sort((a, b) => a.order - b.order);
  },

  getAll() {
    return this._getAll().sort((a, b) => a.order - b.order);
  },

  getById(id) {
    return this._getAll().find(p => p.id === id) || null;
  },

  getCategories() {
    const all = this.getPublished();
    return [...new Set(all.map(p => p.category))];
  },

  save(item) {
    const all = this._getAll();
    const now = new Date().toISOString();
    if (item.id) {
      const idx = all.findIndex(p => p.id === item.id);
      if (idx >= 0) {
        all[idx] = { ...all[idx], ...item };
      }
    } else {
      item.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      item.status = item.status || 'published';
      item.order = all.length + 1;
      all.push(item);
    }
    localStorage.setItem(PRICE_KEY, JSON.stringify(all));
    return item;
  },

  delete(id) {
    const all = this._getAll().filter(p => p.id !== id);
    localStorage.setItem(PRICE_KEY, JSON.stringify(all));
  },
};

if (typeof module !== 'undefined') module.exports = PriceStore;
