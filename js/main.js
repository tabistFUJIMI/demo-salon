// メインJS: スクロールアニメーション、ヘッダー制御、動的コンテンツ
document.addEventListener('DOMContentLoaded', async () => {
  // --- Store Init (JSON fetch with localStorage fallback) ---
  const inits = [];
  if (typeof NewsStore !== 'undefined' && NewsStore.init) inits.push(NewsStore.init());
  if (typeof PriceStore !== 'undefined' && PriceStore.init) inits.push(PriceStore.init());
  if (typeof StaffStore !== 'undefined' && StaffStore.init) inits.push(StaffStore.init());
  await Promise.all(inits);

  // --- Scroll Header ---
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('header--scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  // --- Mobile Menu ---
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('is-open');
      nav.classList.toggle('is-open');
    });
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('is-open');
        nav.classList.remove('is-open');
      });
    });
  }

  // --- Scroll Reveal ---
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => entry.target.classList.add('is-visible'), delay);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => observer.observe(el));
  }

  // --- Re-observe helper ---
  function reobserve(container) {
    container.querySelectorAll('.reveal').forEach(el => {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { entry.target.classList.add('is-visible'); obs.unobserve(entry.target); }
        });
      }, { threshold: 0.1 });
      obs.observe(el);
    });
  }

  // --- Dynamic News (Top page) ---
  const newsList = document.getElementById('news-list');
  if (newsList && typeof NewsStore !== 'undefined') {
    const news = NewsStore.getPublished().slice(0, 5);
    newsList.innerHTML = news.map(n => {
      const date = new Date(n.createdAt).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');
      const tagClass = n.category === 'キャンペーン' ? 'tag-campaign' : 'tag-info';
      return `<li>
        <a href="news.html?id=${n.id}">
          <span class="news-date">${date}</span>
          <span class="news-tag ${tagClass}">${n.category}</span>
          <span class="news-text">${n.title}</span>
        </a>
      </li>`;
    }).join('');
  }

  // --- Dynamic Price List (Top page) ---
  const priceList = document.getElementById('price-list');
  if (priceList && typeof PriceStore !== 'undefined') {
    const categories = PriceStore.getCategories();
    let html = '';
    categories.forEach(cat => {
      const items = PriceStore.getPublished().filter(p => p.category === cat);
      html += `<h3 class="price-category-title reveal">${cat}</h3>`;
      html += '<div class="price-table-wrap">';
      html += '<table class="price-menu-table">';
      html += items.map(p => `
        <tr class="reveal">
          <td class="price-menu-name">${p.name}</td>
          <td class="price-menu-note">${p.note || ''}</td>
          <td class="price-menu-price">&yen;${p.price.toLocaleString()}</td>
        </tr>
      `).join('');
      html += '</table>';
      html += '</div>';
    });
    priceList.innerHTML = html;
    reobserve(priceList);
  }

  // --- Dynamic Staff Grid (Top page) ---
  const staffGrid = document.getElementById('staff-grid');
  if (staffGrid && typeof StaffStore !== 'undefined') {
    const staff = StaffStore.getPublished();
    staffGrid.innerHTML = '<div class="staff-cards">' + staff.map(s => `
      <div class="staff-card reveal">
        <div class="staff-card-img"><img src="${s.image}" alt="${s.name}" loading="lazy"></div>
        <div class="staff-card-body">
          <h3 class="staff-card-name">${s.name}</h3>
          <p class="staff-card-role">${s.role}｜経験${s.experience}</p>
          <p class="staff-card-specialty">得意: ${s.specialty}</p>
          <p class="staff-card-profile">${s.profile}</p>
        </div>
      </div>
    `).join('') + '</div>';
    reobserve(staffGrid);
  }
});
