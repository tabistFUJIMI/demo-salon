// スタイリストデータストア (JSON file + localStorage fallback)
const STAFF_KEY = 'demo_salon_staff';

const SEED_STAFF = [
  {
    id: '1',
    name: '藤見 彩香',
    role: 'オーナースタイリスト',
    experience: '15年',
    specialty: 'ナチュラルボブ、透明感カラー',
    image: 'images/staff-01.jpg',
    profile: '髪質やライフスタイルに合わせた、再現性の高いスタイルを心がけています。',
    status: 'published',
    order: 1,
  },
  {
    id: '2',
    name: '山田 結衣',
    role: 'スタイリスト',
    experience: '8年',
    specialty: 'ショートカット、ハイライト',
    image: 'images/staff-02.jpg',
    profile: '一人ひとりの魅力を引き出すカットを大切にしています。',
    status: 'published',
    order: 2,
  },
];

const StaffStore = {
  _cache: null,

  async init() {
    try {
      const res = await fetch('data/staff.json');
      if (res.ok) {
        this._cache = await res.json();
        return;
      }
    } catch (e) { /* fetch失敗時はlocalStorageフォールバック */ }
    this._cache = null;
  },

  _getAll() {
    if (this._cache) return [...this._cache];
    const raw = localStorage.getItem(STAFF_KEY);
    if (!raw) {
      localStorage.setItem(STAFF_KEY, JSON.stringify(SEED_STAFF));
      return [...SEED_STAFF];
    }
    return JSON.parse(raw);
  },

  getPublished() {
    return this._getAll()
      .filter(s => s.status === 'published')
      .sort((a, b) => a.order - b.order);
  },

  getAll() {
    return this._getAll().sort((a, b) => a.order - b.order);
  },

  getById(id) {
    return this._getAll().find(s => s.id === id) || null;
  },

  save(item) {
    const all = this._getAll();
    const now = new Date().toISOString();
    if (item.id) {
      const idx = all.findIndex(s => s.id === item.id);
      if (idx >= 0) {
        all[idx] = { ...all[idx], ...item };
      }
    } else {
      item.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      item.status = item.status || 'published';
      item.order = all.length + 1;
      all.push(item);
    }
    localStorage.setItem(STAFF_KEY, JSON.stringify(all));
    return item;
  },

  delete(id) {
    const all = this._getAll().filter(s => s.id !== id);
    localStorage.setItem(STAFF_KEY, JSON.stringify(all));
  },
};

if (typeof module !== 'undefined') module.exports = StaffStore;
