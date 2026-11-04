import { createClient } from '@supabase/supabase-js';
import './style.css';

const envReady = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const supabase = envReady ? createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
) : null;

const defaultCategories = [
  ['همه','▦'],['فانتزی','✧'],['انیمه','♧'],
  ['سایبرپانک','⌁'],['طبیعت','♢'],['فضا','◉'],
  ['گیمینگ','⌘'],['مینیمال','◇'],['کی‌پاپ','♫'],['موسیقی','♪']
];

const samples = [
  {id:'s1',title:'Neon Tokyo',category:'سایبرپانک',kind:'image',url:'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1000&q=85',description:'شهر نئونی در شب'},
  {id:'s2',title:'Dreamy Anime',category:'انیمه',kind:'image',url:'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=85',description:'حال‌وهوای انیمه'},
  {id:'s3',title:'Pink Fuji',category:'طبیعت',kind:'image',url:'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=85',description:'غروب صورتی ژاپن'},
  {id:'s4',title:'Cosmic Cat',category:'فانتزی',kind:'image',url:'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1000&q=85',description:'چشم‌های کهکشانی'},
  {id:'s5',title:'Blue Planet',category:'فضا',kind:'image',url:'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1000&q=85',description:'جهان بی‌انتها'},
  {id:'s6',title:'Game Night',category:'گیمینگ',kind:'image',url:'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1000&q=85',description:'نورهای گیمینگ'},
  {id:'m1',title:'Midnight Drive',category:'موسیقی',kind:'audio',url:'',description:'قطعه‌ی الکترونیک ساخته‌شده با هوش مصنوعی'},
  {id:'m2',title:'Pink Rain',category:'موسیقی',kind:'audio',url:'',description:'موسیقی آرام برای شب‌های بارانی'}
];

const $ = selector => document.querySelector(selector);

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;',
  '<':'&lt;',
  '>':'&gt;',
  '"':'&quot;',
  "'":'&#39;'
}[c]));

let categories = [...defaultCategories];
let items = [...samples];
let adminItems = [];
let pages = [];
let sections = [];
let user = null;
let activeCategory = 'همه';
let activeTab = 'image';
let currentPage = 1;
let pageSize = 12;
let sortMode = 'newest';
let adminTab = 'dashboard';
let siteSettings = {
  site_title: 'NEONOVA',
  tagline: 'Dream in pixels',
  about_text: 'مجموعه‌ای از تصاویر و موسیقی‌های خاص و خلاقانه.',
  contact_text: 'برای ارتباط با ما از راه‌های ارتباطی استفاده کنید.'
};

let siteConfig = {
  heroTitle: 'تصاویر رویایی،',
  heroSubtitle: 'برای صفحه‌نمایش تو',
  heroDescription: 'در اینجا مجموعه‌ای از تصاویر ساخته‌شده با هوش مصنوعی و موسیقی‌های خاص پیدا می‌کنی.',
  columns: 6,
  pageSize: 12,
  showHero: true,
  showCategories: true,
  showFeatures: true,
  showAbout: true,
  showContact: true,
  showSamples: true,
  theme: 'dark'
};

const favoritesKey = 'neonova-favorites';
let favorites = JSON.parse(localStorage.getItem(favoritesKey) || '[]');

const app = $('#app');

function notify(message) {
  alert(message);
}

function saveFavorites() {
  localStorage.setItem(favoritesKey, JSON.stringify(favorites));
}

function isFavorite(id) {
  return favorites.includes(String(id));
}

function toggleFavorite(id) {
  id = String(id);
  favorites = isFavorite(id)
    ? favorites.filter(x => x !== id)
    : [...favorites, id];

  saveFavorites();
  renderGallery();
}

function getCategoryNames() {
  return categories.filter(x => x[0] !== 'همه').map(x => x[0]);
}

function categoryOptions(selected = '') {
  return getCategoryNames().map(name =>
    `<option value="${esc(name)}" ${name === selected ? 'selected' : ''}>${esc(name)}</option>`
  ).join('');
}

function getPublicItems() {
  return items.filter(item => item.is_published !== false);
}

function getItemDate(item) {
  return new Date(item.created_at || 0).getTime();
}

function applySiteConfig() {
  document.title = siteSettings.site_title || 'NEONOVA';

  const root = document.documentElement;
  root.style.setProperty('--gallery-columns', siteConfig.columns || 6);
pageSize = siteConfig.pageSize || 12;
  root.style.setProperty('--neon-red', siteConfig.red || '#ff3b68');
  root.style.setProperty('--neon-pink', siteConfig.pink || '#ff4fc8');
  root.style.setProperty('--neon-purple', siteConfig.purple || '#a45cff');
  root.style.setProperty('--neon-blue', siteConfig.blue || '#83d7ff');
}

function shell() {
  app.innerHTML = `
    <header class="topbar">
      <a class="brand" href="#home">
        <span class="brand-mark">✦</span>
        <span>
          <b id="brandTitle">${esc(siteSettings.site_title)}</b>
          <small id="brandTagline">${esc(siteSettings.tagline)}</small>
        </span>
      </a>

      <nav id="mainNav">
        <a class="active" href="#home">خانه</a>
        <a href="#gallery">دسته‌بندی‌ها</a>
        <a href="#about">درباره ما</a>
        <a href="#contact">تماس با ما</a>
        <span id="customNav"></span>
      </nav>

      <div class="tools">
        <button id="searchToggle" aria-label="جستجو">⌕</button>
        <button id="favoritesToggle" aria-label="علاقه‌مندی‌ها">♡</button>
        <button id="accountBtn" aria-label="پنل مدیریت">♙</button>
        <button id="themeBtn" aria-label="تغییر تم">☾</button>
      </div>
    </header>

    <main id="home">
      <section class="hero" id="heroSection">
        <div class="hero-copy">
          <p class="eyebrow">YOUR DIGITAL DREAMSPACE</p>
          <h1>
            ${esc(siteConfig.heroTitle)}<br>
            <span>${esc(siteConfig.heroSubtitle)}</span>
          </h1>
          <p>${esc(siteConfig.heroDescription)}</p>

          <label class="search">
            <span>⌕</span>
            <input id="searchInput" placeholder="جستجو در تصاویر و موسیقی..." />
          </label>
        </div>
      </section>

      <section class="categories" id="categories"></section>

      <section class="gallery-section" id="gallery">
        <div class="section-head">
          <div>
            <span class="eyebrow">FRESH DROPS</span>
            <h2 id="sectionTitle">جدیدترین تصاویر <b>✦</b></h2>
          </div>

          <div class="tabs">
            <button class="tab active" data-tab="image">تصاویر</button>
            <button class="tab" data-tab="audio">موسیقی AI</button>
            <button class="tab" data-tab="poem">شعرها</button>
          </div>
        </div>

        <div class="gallery-controls">
          <select id="sortSelect">
            <option value="newest">جدیدترین</option>
            <option value="oldest">قدیمی‌ترین</option>
            <option value="title">نام اثر</option>
          </select>

          <select id="pageSizeSelect">
            <option value="12">۱۲ مورد در صفحه</option>
            <option value="20">۲۰ مورد در صفحه</option>
            <option value="40">۴۰ مورد در صفحه</option>
          </select>
        </div>

        <div class="gallery" id="galleryGrid"></div>
        <div class="pagination" id="pagination"></div>

        <p class="empty hidden" id="empty">
          هنوز چیزی اینجا نیست. بعداً دوباره سر بزن ✨
        </p>
      </section>

      <section class="features" id="featuresSection">
        <article>
          <span>♡</span>
          <div>
            <b>به‌روزرسانی مداوم</b>
            <p>هر بار تصاویر و آهنگ‌های تازه اضافه می‌شوند.</p>
          </div>
        </article>
        <article>
          <span>ϟ</span>
          <div>
            <b>کیفیت بالا</b>
            <p>محتوای باکیفیت برای تجربه‌ای بهتر.</p>
          </div>
        </article>
        <article>
          <span>▣</span>
          <div>
            <b>مناسب همه دستگاه‌ها</b>
            <p>برای موبایل، تبلت و کامپیوتر.</p>
          </div>
        </article>
      </section>

      <section id="aboutSection" class="public-info">
        <h2>درباره ما</h2>
        <p id="aboutText">${esc(siteSettings.about_text)}</p>
      </section>
    </main>

    <footer id="contact">
      <a class="brand" href="#home">
        <span class="brand-mark">✦</span>
        <span>
          <b>${esc(siteSettings.site_title)}</b>
          <small>${esc(siteSettings.tagline)}</small>
        </span>
      </a>
      <small>© 2026 ${esc(siteSettings.site_title)}. All rights reserved.</small>
      <div class="social">✈　◎　▶</div>
      <p id="contactText">${esc(siteSettings.contact_text)}</p>
    </footer>

    <div id="modal" class="modal hidden"></div>
  `;

  applySiteConfig();
  applyVisibility();
  renderCategories();
  renderCustomNav();
  bindShell();
  renderGallery();
}

function applyVisibility() {
  const toggle = (id, visible) => {
    const element = document.getElementById(id);
    if (element) element.classList.toggle('hidden', !visible);
  };

  toggle('heroSection', siteConfig.showHero !== false);
  toggle('categories', siteConfig.showCategories !== false);
  toggle('featuresSection', siteConfig.showFeatures !== false);
  toggle('aboutSection', siteConfig.showAbout !== false);
  toggle('contact', siteConfig.showContact !== false);
}

function renderCategories() {
  const box = $('#categories');
  if (!box) return;

  box.innerHTML = categories.map(([name, icon]) => `
    <button class="cat ${name === activeCategory ? 'selected' : ''}" data-cat="${esc(name)}">
      <i>${esc(icon)}</i>
      <span>${esc(name)}</span>
    </button>
  `).join('');

  box.querySelectorAll('[data-cat]').forEach(button => {
    button.onclick = () => {
      activeCategory = button.dataset.cat;
      currentPage = 1;
      renderCategories();
      renderGallery();
    };
  });
}

function renderCustomNav() {
  const box = $('#customNav');
  if (!box) return;

  box.innerHTML = pages
    .filter(page => page.is_published && page.show_in_nav)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map(page => `<a href="#page-${esc(page.slug)}" data-page="${esc(page.slug)}">${esc(page.title)}</a>`)
    .join('');

  box.querySelectorAll('[data-page]').forEach(link => {
    link.onclick = event => {
      event.preventDefault();
      openPage(link.dataset.page);
    };
  });
}

function bindShell() {
  document.querySelectorAll('[data-tab]').forEach(button => {
    button.onclick = () => {
      activeTab = button.dataset.tab;
      currentPage = 1;

      document.querySelectorAll('[data-tab]').forEach(x =>
        x.classList.toggle('active', x === button)
      );

      const titles = {
        image: 'جدیدترین تصاویر <b>✦</b>',
        audio: 'موسیقی‌های هوش مصنوعی <b>♫</b>',
        poem: 'شعرها و نوشته‌ها <b>✧</b>'
      };

      $('#sectionTitle').innerHTML = titles[activeTab];
      renderGallery();
    };
  });

  $('#searchInput').oninput = () => {
    currentPage = 1;
    renderGallery();
  };

  $('#searchToggle').onclick = () => $('#searchInput').focus();

  $('#themeBtn').onclick = () => {
    document.body.classList.toggle('light');
  };

  $('#favoritesToggle').onclick = () => {
    activeCategory = 'همه';
    $('#searchInput').value = '';
    renderGallery(true);
  };

  $('#sortSelect').onchange = event => {
    sortMode = event.target.value;
    renderGallery();
  };

  $('#pageSizeSelect').onchange = event => {
    pageSize = Number(event.target.value);
    currentPage = 1;
    renderGallery();
  };

  $('#accountBtn').onclick = showAdmin;
}

function renderGallery(onlyFavorites = false) {
  const grid = $('#galleryGrid');
  if (!grid) return;

  const query = ($('#searchInput')?.value || '').trim().toLowerCase();

  let filtered = getPublicItems().filter(item => {
    const type = item.kind === 'poem' ? 'poem' : item.kind;

    return type === activeTab &&
      (activeCategory === 'همه' || item.category === activeCategory) &&
      `${item.title} ${item.description || ''} ${item.category || ''}`
        .toLowerCase().includes(query) &&
      (!onlyFavorites || isFavorite(item.id));
  });

  if (sortMode === 'oldest') {
    filtered.sort((a, b) => getItemDate(a) - getItemDate(b));
  } else if (sortMode === 'title') {
    filtered.sort((a, b) => String(a.title).localeCompare(String(b.title)));
  } else {
    filtered.sort((a, b) => getItemDate(b) - getItemDate(a));
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  currentPage = Math.min(currentPage, totalPages);

  const start = (currentPage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  grid.innerHTML = visible.map(item => {
    const favorite = isFavorite(item.id);

    if (item.kind === 'image') {
      return `
        <article class="tile">
          <img src="${esc(item.url)}" alt="${esc(item.title)}" loading="lazy">
          <button class="favorite-btn ${favorite ? 'is-favorite' : ''}" data-favorite="${esc(item.id)}">♡</button>
          <div class="tile-overlay">
            <span>${esc(item.category)}</span>
            <b>${esc(item.title)}</b>
            <div>
              <button data-view="${esc(item.id)}">مشاهده</button>
              <a href="${esc(item.url)}" download target="_blank" rel="noopener">دانلود ↓</a>
            </div>
          </div>
        </article>
      `;
    }

    if (item.kind === 'audio') {
      return `
        <article class="audio-card">
          <div class="audio-art">♫</div>
          <span class="eyebrow">AI ORIGINAL</span>
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.description || '')}</p>
          ${item.url
            ? `<audio controls preload="none" src="${esc(item.url)}"></audio>
               <a class="download-audio" href="${esc(item.url)}" download>دانلود آهنگ ↓</a>`
            : '<small class="pending">فایل صوتی هنوز منتشر نشده است.</small>'}
          <button class="favorite-btn ${favorite ? 'is-favorite' : ''}" data-favorite="${esc(item.id)}">♡</button>
        </article>
      `;
    }

    return `
      <article class="audio-card poem-card">
        <div class="audio-art">✧</div>
        <span class="eyebrow">NEONOVA WORDS</span>
        <h3>${esc(item.title)}</h3>
        <p class="poem-content">${esc(item.description || '')}</p>
        <button data-poem="${esc(item.id)}">مطالعه کامل</button>
        <button class="favorite-btn ${favorite ? 'is-favorite' : ''}" data-favorite="${esc(item.id)}">♡</button>
      </article>
    `;
  }).join('');

  $('#empty').classList.toggle('hidden', filtered.length > 0);

  renderPagination(totalPages);

  grid.querySelectorAll('[data-favorite]').forEach(button => {
    button.onclick = () => toggleFavorite(button.dataset.favorite);
  });

  grid.querySelectorAll('[data-view]').forEach(button => {
    button.onclick = () => openImage(button.dataset.view);
  });

  grid.querySelectorAll('[data-poem]').forEach(button => {
    button.onclick = () => openPoem(button.dataset.poem);
  });
}

function renderPagination(totalPages) {
  const box = $('#pagination');
  if (!box) return;

  if (totalPages <= 1) {
    box.innerHTML = '';
    return;
  }

  box.innerHTML = `
    <button data-page-prev ${currentPage === 1 ? 'disabled' : ''}>قبلی</button>
    <span>صفحه ${currentPage} از ${totalPages}</span>
    <button data-page-next ${currentPage === totalPages ? 'disabled' : ''}>بعدی</button>
  `;

  box.querySelector('[data-page-prev]').onclick = () => {
    currentPage--;
    renderGallery();
  };

  box.querySelector('[data-page-next]').onclick = () => {
    currentPage++;
    renderGallery();
  };
}

function openImage(id) {
  const item = getPublicItems().find(x => String(x.id) === String(id));
  if (!item) return;

  const modal = $('#modal');

  modal.innerHTML = `
    <div class="modal-box">
      <button class="close">×</button>
      <img src="${esc(item.url)}" alt="${esc(item.title)}">
      <h3>${esc(item.title)}</h3>
      <p>${esc(item.description || '')}</p>
      <a class="primary" href="${esc(item.url)}" download target="_blank" rel="noopener">دانلود تصویر</a>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.querySelector('.close').onclick = () => modal.classList.add('hidden');
}

function openPoem(id) {
  const item = getPublicItems().find(x => String(x.id) === String(id));
  if (!item) return;

  const modal = $('#modal');

  modal.innerHTML = `
    <div class="modal-box">
      <button class="close">×</button>
      <span class="eyebrow">NEONOVA WORDS</span>
      <h2>${esc(item.title)}</h2>
      <p class="poem-content">${esc(item.description || '')}</p>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.querySelector('.close').onclick = () => modal.classList.add('hidden');
}

function openPage(slug) {
  const page = pages.find(x => x.slug === slug && x.is_published);
  if (!page) return;

  const modal = $('#modal');

  modal.innerHTML = `
    <div class="modal-box">
      <button class="close">×</button>
      <span class="eyebrow">${esc(siteSettings.site_title)}</span>
      <h2>${esc(page.title)}</h2>
      <div class="page-content">${esc(page.content || '').replace(/\n/g, '<br>')}</div>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.querySelector('.close').onclick = () => modal.classList.add('hidden');
}

async function showAdmin() {
  if (!supabase) {
    notify('تنظیمات Supabase در فایل .env پیدا نشد.');
    return;
  }

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    notify(error.message);
    return;
  }

  if (data.session) {
    user = data.session.user;
    await loadAdminData();
    showAdminPanel();
    return;
  }

  const modal = $('#modal');

  modal.innerHTML = `
    <div class="modal-box admin-box">
      <button class="close">×</button>
      <span class="eyebrow">PRIVATE AREA</span>
      <h2>ورود مدیر</h2>
      <p>برای مدیریت NEONOVA وارد حساب مدیر شو.</p>

      <form id="loginForm">
        <input id="email" type="email" placeholder="ایمیل مدیر" required>
        <input id="password" type="password" placeholder="رمز عبور" required>
        <button class="primary" type="submit">ورود</button>
      </form>

      <div class="admin-note">اتصال پایگاه داده ${envReady ? 'آماده است.' : 'تنظیم نشده است.'}</div>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.querySelector('.close').onclick = () => modal.classList.add('hidden');

  modal.querySelector('#loginForm').onsubmit = async event => {
    event.preventDefault();

    const email = $('#email').value.trim();
    const password = $('#password').value;
    const button = event.currentTarget.querySelector('button');

    button.disabled = true;
    button.textContent = 'در حال ورود...';

    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (loginError) {
      notify(loginError.message);
      button.disabled = false;
      button.textContent = 'ورود';
      return;
    }

    user = loginData.user;
    await loadAdminData();
    showAdminPanel();
  };
}

async function loadAdminData() {
  if (!supabase) return;

  const results = await Promise.all([
    supabase.from('media_items').select('*').order('created_at', { ascending: false }),
    supabase.from('site_pages').select('*').order('sort_order', { ascending: true }),
    supabase.from('site_sections').select('*').order('sort_order', { ascending: true }),
    supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()
  ]);

  const [mediaResult, pageResult, sectionResult, settingsResult] = results;

  if (!mediaResult.error) adminItems = mediaResult.data || [];
  else console.error('Media admin load:', mediaResult.error);

  if (!pageResult.error) {
    pages = (pageResult.data || []).filter(page => page.slug !== '__neonova_config__');
    const configRow = (pageResult.data || []).find(page => page.slug === '__neonova_config__');

    if (configRow?.content) {
      try {
        siteConfig = { ...siteConfig, ...JSON.parse(configRow.content) };
      } catch {
        console.warn('تنظیمات ذخیره‌شده قابل خواندن نیست.');
      }
    }
  } else {
    console.error('Pages load:', pageResult.error);
  }

  if (!sectionResult.error && sectionResult.data?.length) {
    sections = sectionResult.data;
    categories = [
      ['همه', '▦'],
      ...sections.filter(x => x.is_visible !== false).map(x => [x.title, x.icon || '✧'])
    ];
  }

  if (!settingsResult.error && settingsResult.data) {
    siteSettings = { ...siteSettings, ...settingsResult.data };
  }

  applySiteConfig();
}

function showAdminPanel() {
  const modal = $('#modal');

  modal.innerHTML = `
    <div class="modal-box admin-box admin-dashboard">
      <button class="close">×</button>

      <div class="admin-heading">
        <span class="eyebrow">NEONOVA CONTROL CENTER</span>
        <h2>مدیریت سایت</h2>
        <p>همه‌چیز از همین‌جا کنترل می‌شود.</p>
      </div>

      <div class="admin-tabs">
        <button data-admin-tab="dashboard">داشبورد</button>
        <button data-admin-tab="media">محتوا</button>
        <button data-admin-tab="categories">دسته‌بندی‌ها</button>
        <button data-admin-tab="pages">صفحات</button>
        <button data-admin-tab="settings">تنظیمات</button>
      </div>

      <div id="adminContent"></div>

      <button id="logout" class="text-btn" type="button">خروج از حساب</button>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.querySelector('.close').onclick = () => modal.classList.add('hidden');

  modal.querySelectorAll('[data-admin-tab]').forEach(button => {
    button.onclick = () => {
      adminTab = button.dataset.adminTab;
      renderAdminTab();
    };
  });

  modal.querySelector('#logout').onclick = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      notify(error.message);
      return;
    }

    user = null;
    modal.classList.add('hidden');
  };

  renderAdminTab();
}

function renderAdminTab() {
  const content = $('#adminContent');
  if (!content) return;

  document.querySelectorAll('[data-admin-tab]').forEach(button =>
    button.classList.toggle('active', button.dataset.adminTab === adminTab)
  );

  if (adminTab === 'dashboard') renderDashboard(content);
  if (adminTab === 'media') renderMediaManager(content);
  if (adminTab === 'categories') renderCategoryManager(content);
  if (adminTab === 'pages') renderPageManager(content);
  if (adminTab === 'settings') renderSettingsManager(content);
}

function renderDashboard(box) {
  const published = adminItems.filter(x => x.is_published !== false).length;
  const drafts = adminItems.length - published;
  const images = adminItems.filter(x => x.kind === 'image').length;
  const audio = adminItems.filter(x => x.kind === 'audio').length;
  const poems = adminItems.filter(x => x.kind === 'poem').length;

  box.innerHTML = `
    <div class="stats-grid">
      <article><small>کل محتوا</small><b>${adminItems.length}</b></article>
      <article><small>منتشرشده</small><b>${published}</b></article>
      <article><small>پیش‌نویس</small><b>${drafts}</b></article>
      <article><small>صفحات</small><b>${pages.length}</b></article>
    </div>

    <div class="stats-grid">
      <article><small>تصاویر</small><b>${images}</b></article>
      <article><small>موسیقی</small><b>${audio}</b></article>
      <article><small>شعرها</small><b>${poems}</b></article>
      <article><small>دسته‌بندی‌ها</small><b>${getCategoryNames().length}</b></article>
    </div>

    <div class="admin-actions">
      <button class="primary" id="quickUpload">＋ افزودن محتوا</button>
      <button class="admin-secondary" id="quickSettings">⚙ تنظیمات سایت</button>
    </div>

    <div class="admin-note">
      آمار بازدید و لایک مشترک در نسخه بعدی اضافه خواهد شد.
    </div>
  `;

  $('#quickUpload').onclick = () => {
    adminTab = 'media';
    renderAdminTab();
  };

  $('#quickSettings').onclick = () => {
    adminTab = 'settings';
    renderAdminTab();
  };
}

function renderMediaManager(box) {
  box.innerHTML = `
    <h3>افزودن محتوای جدید</h3>

    <form id="uploadForm" class="admin-form">
      <label>عنوان</label>
      <input id="uploadTitle" placeholder="عنوان اثر" required>

      <label>نوع محتوا</label>
      <select id="uploadKind">
        <option value="image">تصویر</option>
        <option value="audio">موسیقی</option>
        <option value="poem">شعر یا متن</option>
      </select>

      <label>دسته‌بندی</label>
      <select id="uploadCategory">${categoryOptions()}</select>

      <label>توضیحات یا متن شعر</label>
      <textarea id="uploadDescription" rows="4" placeholder="توضیحات اثر یا متن شعر..."></textarea>

      <label>فایل‌ها</label>
      <input id="uploadFiles" type="file" multiple accept="image/*" required>

      <label class="check-line">
        <input id="uploadPublished" type="checkbox" checked>
        انتشار فوری
      </label>

      <button class="primary" type="submit">آپلود و ذخیره</button>
      <p class="admin-note">برای شعر، متن را وارد کن و نیازی به انتخاب فایل نیست.</p>
    </form>

    <hr>
    <h3>مدیریت محتوا (${adminItems.length})</h3>

    <input id="adminSearch" placeholder="جستجو در محتوای مدیریت...">
    <div id="adminMediaList"></div>
  `;

  const kind = $('#uploadKind');
  const fileInput = $('#uploadFiles');

  function updateUploadType() {
    const value = kind.value;
    fileInput.accept = value === 'image' ? 'image/*' : 'audio/*';
    fileInput.required = value !== 'poem';
    fileInput.disabled = value === 'poem';
  }

  kind.onchange = updateUploadType;
  updateUploadType();

  $('#uploadForm').onsubmit = uploadContent;
  $('#adminSearch').oninput = renderAdminMediaList;

  renderAdminMediaList();
}

function renderAdminMediaList() {
  const list = $('#adminMediaList');
  if (!list) return;

  const query = ($('#adminSearch')?.value || '').trim().toLowerCase();

  const filtered = adminItems.filter(item =>
    `${item.title} ${item.category} ${item.kind}`.toLowerCase().includes(query)
  );

  if (!filtered.length) {
    list.innerHTML = '<p class="admin-note">محتوایی پیدا نشد.</p>';
    return;
  }

  list.innerHTML = filtered.map(item => `
    <div class="admin-item">
      <div>
        <b>${esc(item.title)}</b>
        <small>
          ${item.kind === 'image' ? 'تصویر' : item.kind === 'audio' ? 'موسیقی' : 'شعر'}
          · ${esc(item.category || 'بدون دسته')}
          · ${item.is_published === false ? 'پیش‌نویس' : 'منتشرشده'}
        </small>
      </div>

      <div class="admin-item-actions">
        <button data-edit="${esc(item.id)}">ویرایش</button>
        <button data-publish="${esc(item.id)}">${item.is_published === false ? 'انتشار' : 'پیش‌نویس'}</button>
        <button data-delete="${esc(item.id)}">حذف</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('[data-edit]').forEach(button => {
    button.onclick = () => editMedia(button.dataset.edit);
  });

  list.querySelectorAll('[data-publish]').forEach(button => {
    button.onclick = () => togglePublish(button.dataset.publish);
  });

  list.querySelectorAll('[data-delete]').forEach(button => {
    button.onclick = () => deleteMedia(button.dataset.delete);
  });
}

async function uploadContent(event) {
  event.preventDefault();

  const title = $('#uploadTitle').value.trim();
  const kind = $('#uploadKind').value;
  const category = $('#uploadCategory').value;
  const description = $('#uploadDescription').value.trim();
  const files = [...$('#uploadFiles').files];
  const published = $('#uploadPublished').checked;

  if (!title) {
    notify('عنوان را وارد کن.');
    return;
  }

  if (kind === 'poem' && !description) {
    notify('متن شعر را وارد کن.');
    return;
  }

  if (kind !== 'poem' && !files.length) {
    notify('حداقل یک فایل انتخاب کن.');
    return;
  }

  if (kind === 'image' && files.some(file => !file.type.startsWith('image/'))) {
    notify('برای محتوای تصویری فقط فایل تصویر انتخاب کن.');
    return;
  }

  if (kind === 'audio' && files.some(file => !file.type.startsWith('audio/'))) {
    notify('برای موسیقی فقط فایل صوتی انتخاب کن.');
    return;
  }

  const button = event.currentTarget.querySelector('button[type="submit"]');
  button.disabled = true;

  try {
    const uploadList = kind === 'poem' ? [null] : files;

    for (let index = 0; index < uploadList.length; index++) {
      const file = uploadList[index];
      const itemTitle = uploadList.length > 1
        ? `${title} ${index + 1}`
        : title;

      let url = '';
      let storagePath = null;

      if (file) {
        const safeName = `${Date.now()}-${index}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        storagePath = `${kind}/${safeName}`;

        button.textContent = `در حال آپلود ${index + 1} از ${uploadList.length}...`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(storagePath, file, { upsert: false });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from('media')
          .getPublicUrl(storagePath);

        url = publicData.publicUrl;
      }

      const record = {
        title: itemTitle,
        category,
        kind,
        url,
        storage_path: storagePath,
        is_published: published
      };

      if (description) record.description = description;

      const { error } = await supabase
        .from('media_items')
        .insert(record);

      if (error) {
        if (storagePath) {
          await supabase.storage.from('media').remove([storagePath]);
        }
        throw error;
      }
    }

    notify('محتوا با موفقیت ذخیره شد! ✨');
    await loadAdminData();
    await loadItems();
    renderMediaManager($('#adminContent'));
  } catch (error) {
    console.error(error);
    notify('خطا در ذخیره محتوا: ' + error.message);
  } finally {
    button.disabled = false;
    button.textContent = 'آپلود و ذخیره';
  }
}

async function editMedia(id) {
  const item = adminItems.find(x => String(x.id) === String(id));
  if (!item) return;

  const title = prompt('عنوان جدید:', item.title);
  if (title === null) return;

  const cleanTitle = title.trim();
  if (!cleanTitle) {
    notify('عنوان نمی‌تواند خالی باشد.');
    return;
  }

  const category = prompt(
    'دسته‌بندی جدید:\n' + getCategoryNames().join('، '),
    item.category
  );

  if (category === null) return;

  if (!getCategoryNames().includes(category.trim())) {
    notify('دسته‌بندی معتبر نیست.');
    return;
  }

  const { error } = await supabase
    .from('media_items')
    .update({
      title: cleanTitle,
      category: category.trim()
    })
    .eq('id', item.id);

  if (error) {
    notify(error.message);
    return;
  }

  await loadAdminData();
  await loadItems();
  renderMediaManager($('#adminContent'));
  notify('اطلاعات محتوا ویرایش شد.');
}

async function togglePublish(id) {
  const item = adminItems.find(x => String(x.id) === String(id));
  if (!item) return;

  const { error } = await supabase
    .from('media_items')
    .update({ is_published: item.is_published === false })
    .eq('id', item.id);

  if (error) {
    notify(error.message);
    return;
  }

  await loadAdminData();
  await loadItems();
  renderMediaManager($('#adminContent'));
}

async function deleteMedia(id) {
  const item = adminItems.find(x => String(x.id) === String(id));
  if (!item) return;

  if (!confirm(`«${item.title}» برای همیشه حذف شود؟`)) return;

  if (item.storage_path) {
    const { error } = await supabase.storage
      .from('media')
      .remove([item.storage_path]);

    if (error) {
      notify('خطا در حذف فایل: ' + error.message);
      return;
    }
  }

  const { error } = await supabase
    .from('media_items')
    .delete()
    .eq('id', item.id);

  if (error) {
    notify(error.message);
    return;
  }

  await loadAdminData();
  await loadItems();
  renderMediaManager($('#adminContent'));
  notify('محتوا حذف شد.');
}

function renderCategoryManager(box) {
  box.innerHTML = `
    <h3>مدیریت دسته‌بندی‌ها</h3>

    <form id="categoryForm" class="admin-form">
      <input id="newCategory" placeholder="نام دسته‌بندی جدید" required>
      <input id="newCategoryIcon" placeholder="آیکون، مثلاً ✧" value="✧">
      <button class="primary" type="submit">افزودن دسته‌بندی</button>
    </form>

    <div id="categoryList"></div>
    <p class="admin-note">دسته‌بندی‌ها در جدول site_sections ذخیره می‌شوند.</p>
  `;

  $('#categoryForm').onsubmit = async event => {
    event.preventDefault();

    const title = $('#newCategory').value.trim();
    const icon = $('#newCategoryIcon').value.trim() || '✧';

    if (!title || getCategoryNames().includes(title)) {
      notify('نام دسته‌بندی خالی یا تکراری است.');
      return;
    }

    const { error } = await supabase
      .from('site_sections')
      .insert({
        title,
        section_key: `category-${Date.now()}`,
        icon,
        sort_order: sections.length + 1,
        is_visible: true
      });

    if (error) {
      notify(error.message);
      return;
    }

    await loadAdminData();
    renderCategoryManager($('#adminContent'));
  };

  const list = $('#categoryList');

  list.innerHTML = sections.map(section => `
    <div class="admin-item">
      <div>
        <b>${esc(section.icon || '✧')} ${esc(section.title)}</b>
        <small>${section.is_visible === false ? 'مخفی' : 'نمایش در سایت'}</small>
      </div>
      <div class="admin-item-actions">
        <button data-cat-edit="${esc(section.id)}">ویرایش</button>
        <button data-cat-toggle="${esc(section.id)}">${section.is_visible === false ? 'نمایش' : 'مخفی‌کردن'}</button>
        <button data-cat-delete="${esc(section.id)}">حذف</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('[data-cat-edit]').forEach(button => {
    button.onclick = async () => {
      const section = sections.find(x => String(x.id) === button.dataset.catEdit);
      if (!section) return;

      const title = prompt('نام جدید:', section.title);
      if (title === null || !title.trim()) return;

      const icon = prompt('آیکون:', section.icon || '✧');
      if (icon === null) return;

      const { error } = await supabase.from('site_sections')
        .update({ title: title.trim(), icon: icon.trim() })
        .eq('id', section.id);

      if (error) return notify(error.message);

      await loadAdminData();
      renderCategoryManager($('#adminContent'));
    };
  });

  list.querySelectorAll('[data-cat-toggle]').forEach(button => {
    button.onclick = async () => {
      const section = sections.find(x => String(x.id) === button.dataset.catToggle);
      if (!section) return;

      const { error } = await supabase.from('site_sections')
        .update({ is_visible: section.is_visible === false })
        .eq('id', section.id);

      if (error) return notify(error.message);

      await loadAdminData();
      renderCategoryManager($('#adminContent'));
    };
  });

  list.querySelectorAll('[data-cat-delete]').forEach(button => {
    button.onclick = async () => {
      const section = sections.find(x => String(x.id) === button.dataset.catDelete);
      if (!section || !confirm(`دسته‌بندی «${section.title}» حذف شود؟`)) return;

      const { error } = await supabase.from('site_sections')
        .delete()
        .eq('id', section.id);

      if (error) return notify(error.message);

      await loadAdminData();
      renderCategoryManager($('#adminContent'));
    };
  });
}

function renderPageManager(box) {
  box.innerHTML = `
    <h3>ساخت صفحه جدید</h3>

    <form id="pageForm" class="admin-form">
      <input id="pageTitle" placeholder="عنوان صفحه" required>
      <input id="pageSlug" placeholder="آدرس انگلیسی، مثلاً rules" required>
      <textarea id="pageContent" rows="6" placeholder="متن صفحه..." required></textarea>

      <label class="check-line">
        <input id="pagePublished" type="checkbox" checked>
        انتشار صفحه
      </label>

      <label class="check-line">
        <input id="pageNav" type="checkbox" checked>
        نمایش در منوی سایت
      </label>

      <button class="primary" type="submit">ساخت صفحه</button>
    </form>

    <hr>
    <h3>صفحات ساخته‌شده</h3>
    <div id="pageList"></div>
  `;

  $('#pageForm').onsubmit = async event => {
    event.preventDefault();

    const title = $('#pageTitle').value.trim();
    const slug = $('#pageSlug').value.trim().toLowerCase()
      .replace(/[^a-z0-9-]/g, '-');

    if (!slug) {
      notify('آدرس صفحه معتبر نیست.');
      return;
    }

    const { error } = await supabase.from('site_pages').insert({
      title,
      slug,
      content: $('#pageContent').value,
      is_published: $('#pagePublished').checked,
      show_in_nav: $('#pageNav').checked,
      sort_order: pages.length + 1
    });

    if (error) {
      notify(error.message);
      return;
    }

    await loadAdminData();
    renderPageManager($('#adminContent'));
    renderCustomNav();
  };

  $('#pageList').innerHTML = pages.map(page => `
    <div class="admin-item">
      <div>
        <b>${esc(page.title)}</b>
        <small>/${esc(page.slug)} · ${page.is_published ? 'منتشرشده' : 'پیش‌نویس'}</small>
      </div>
      <div class="admin-item-actions">
        <button data-page-edit="${esc(page.id)}">ویرایش</button>
        <button data-page-toggle="${esc(page.id)}">${page.is_published ? 'پیش‌نویس' : 'انتشار'}</button>
        <button data-page-delete="${esc(page.id)}">حذف</button>
      </div>
    </div>
  `).join('');

  $('#pageList').querySelectorAll('[data-page-edit]').forEach(button => {
    button.onclick = async () => {
      const page = pages.find(x => String(x.id) === button.dataset.pageEdit);
      if (!page) return;

      const title = prompt('عنوان:', page.title);
      if (title === null) return;

      const content = prompt('متن صفحه:', page.content || '');
      if (content === null) return;

      const { error } = await supabase.from('site_pages')
        .update({ title: title.trim(), content })
        .eq('id', page.id);

      if (error) return notify(error.message);

      await loadAdminData();
      renderPageManager($('#adminContent'));
      renderCustomNav();
    };
  });

  $('#pageList').querySelectorAll('[data-page-toggle]').forEach(button => {
    button.onclick = async () => {
      const page = pages.find(x => String(x.id) === button.dataset.pageToggle);
      if (!page) return;

      const { error } = await supabase.from('site_pages')
        .update({ is_published: !page.is_published })
        .eq('id', page.id);

      if (error) return notify(error.message);

      await loadAdminData();
      renderPageManager($('#adminContent'));
      renderCustomNav();
    };
  });

  $('#pageList').querySelectorAll('[data-page-delete]').forEach(button => {
    button.onclick = async () => {
      const page = pages.find(x => String(x.id) === button.dataset.pageDelete);
      if (!page || !confirm(`صفحه «${page.title}» حذف شود؟`)) return;

      const { error } = await supabase.from('site_pages')
        .delete()
        .eq('id', page.id);

      if (error) return notify(error.message);

      await loadAdminData();
      renderPageManager($('#adminContent'));
      renderCustomNav();
    };
  });
}

function renderSettingsManager(box) {
  box.innerHTML = `
    <h3>تنظیمات عمومی سایت</h3>

    <form id="settingsForm" class="admin-form">
      <label>نام سایت</label>
      <input id="settingTitle" value="${esc(siteSettings.site_title)}">

      <label>شعار سایت</label>
      <input id="settingTagline" value="${esc(siteSettings.tagline)}">

      <label>عنوان اصلی صفحه</label>
      <input id="settingHeroTitle" value="${esc(siteConfig.heroTitle)}">

      <label>عنوان رنگی صفحه</label>
      <input id="settingHeroSubtitle" value="${esc(siteConfig.heroSubtitle)}">

      <label>توضیحات صفحه اصلی</label>
      <textarea id="settingHeroDescription" rows="3">${esc(siteConfig.heroDescription)}</textarea>

      <label>متن درباره ما</label>
      <textarea id="settingAbout" rows="3">${esc(siteSettings.about_text)}</textarea>

      <label>متن تماس با ما</label>
      <textarea id="settingContact" rows="3">${esc(siteSettings.contact_text)}</textarea>

      <label>تعداد ستون‌های گالری</label>
      <select id="settingColumns">
        <option value="3" ${siteConfig.columns === 3 ? 'selected' : ''}>۳ ستون</option>
        <option value="4" ${siteConfig.columns === 4 ? 'selected' : ''}>۴ ستون</option>
        <option value="5" ${siteConfig.columns === 5 ? 'selected' : ''}>۵ ستون</option>
        <option value="6" ${siteConfig.columns === 6 ? 'selected' : ''}>۶ ستون</option>
      </select>

      <label>تعداد محتوا در هر صفحه</label>
      <select id="settingPageSize">
        <option value="12" ${siteConfig.pageSize === 12 ? 'selected' : ''}>۱۲</option>
        <option value="20" ${siteConfig.pageSize === 20 ? 'selected' : ''}>۲۰</option>
        <option value="40" ${siteConfig.pageSize === 40 ? 'selected' : ''}>۴۰</option>
      </select>

      <hr>
      <h3>نمایش بخش‌های سایت</h3>

      ${[
        ['showHero','نمایش بخش اصلی'],
        ['showCategories','نمایش دسته‌بندی‌ها'],
        ['showFeatures','نمایش ویژگی‌ها'],
        ['showAbout','نمایش درباره ما'],
        ['showContact','نمایش تماس با ما']
      ].map(([key,label]) => `
        <label class="check-line">
          <input type="checkbox" id="setting-${key}" ${siteConfig[key] !== false ? 'checked' : ''}>
          ${label}
        </label>
      `).join('')}

      <hr>
      <h3>رنگ‌های قابل تنظیم</h3>

      <label>قرمز نئونی</label>
      <input type="color" id="settingRed" value="${esc(siteConfig.red || '#ff3b68')}">

      <label>صورتی نئونی</label>
      <input type="color" id="settingPink" value="${esc(siteConfig.pink || '#ff4fc8')}">

      <label>بنفش نئونی</label>
      <input type="color" id="settingPurple" value="${esc(siteConfig.purple || '#a45cff')}">

      <label>آبی نئونی</label>
      <input type="color" id="settingBlue" value="${esc(siteConfig.blue || '#83d7ff')}">

      <button class="primary" type="submit">ذخیره تمام تنظیمات</button>
      <button class="admin-secondary" type="button" id="resetSettings">بازگشت به تنظیمات اولیه</button>
    </form>

    <div class="admin-note">
      تنظیمات در جدول site_settings و رکورد تنظیمات NEONOVA ذخیره می‌شوند.
    </div>
  `;

  $('#settingsForm').onsubmit = saveSettings;

  $('#resetSettings').onclick = () => {
    if (!confirm('تنظیمات ظاهری به حالت اولیه برگردند؟')) return;

    siteConfig = {
      heroTitle: 'تصاویر رویایی،',
      heroSubtitle: 'برای صفحه‌نمایش تو',
      heroDescription: 'در اینجا مجموعه‌ای از تصاویر ساخته‌شده با هوش مصنوعی و موسیقی‌های خاص پیدا می‌کنی.',
      columns: 6,
      pageSize: 12,
      showHero: true,
      showCategories: true,
      showFeatures: true,
      showAbout: true,
      showContact: true,
      showSamples: true,
      theme: 'dark'
    };

    renderSettingsManager($('#adminContent'));
  };
}

async function saveSettings(event) {
  event.preventDefault();

  siteSettings = {
    ...siteSettings,
    site_title: $('#settingTitle').value.trim(),
    tagline: $('#settingTagline').value.trim(),
    about_text: $('#settingAbout').value,
    contact_text: $('#settingContact').value
  };

  siteConfig = {
    ...siteConfig,
    heroTitle: $('#settingHeroTitle').value,
    heroSubtitle: $('#settingHeroSubtitle').value,
    heroDescription: $('#settingHeroDescription').value,
    columns: Number($('#settingColumns').value),
    pageSize: Number($('#settingPageSize').value),
    showHero: $('#setting-showHero').checked,
    showCategories: $('#setting-showCategories').checked,
    showFeatures: $('#setting-showFeatures').checked,
    showAbout: $('#setting-showAbout').checked,
    showContact: $('#setting-showContact').checked,
    red: $('#settingRed').value,
    pink: $('#settingPink').value,
    purple: $('#settingPurple').value,
    blue: $('#settingBlue').value
  };

  const { error: settingsError } = await supabase
    .from('site_settings')
    .upsert({ id: 1, ...siteSettings }, { onConflict: 'id' });

  if (settingsError) {
    notify('خطا در ذخیره تنظیمات عمومی: ' + settingsError.message);
    return;
  }

  const configRecord = {
    slug: '__neonova_config__',
    title: 'NEONOVA Configuration',
    content: JSON.stringify(siteConfig),
    is_published: false,
    show_in_nav: false,
    sort_order: 999999
  };

  const { error: configError } = await supabase
    .from('site_pages')
    .upsert(configRecord, { onConflict: 'slug' });

  if (configError) {
    notify('تنظیمات عمومی ذخیره شد، اما تنظیمات ظاهری ذخیره نشد: ' + configError.message);
    return;
  }

  applySiteConfig();
  notify('تمام تنظیمات ذخیره شدند! ✨');

  await loadAdminData();
  shell();
}

async function loadItems() {
  if (!supabase) {
    renderGallery();
    return;
  }

  const { data, error } = await supabase
    .from('media_items')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('خطا در دریافت محتوا:', error);
    renderGallery();
    return;
  }

  const published = data || [];
  items = [...published];

  if (siteConfig.showSamples !== false) {
    items.push(...samples);
  }

  renderGallery();
}

async function loadPublicPages() {
  if (!supabase) return;

  const { data, error } = await supabase
    .from('site_pages')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (!error) {
    pages = (data || []).filter(page => page.slug !== '__neonova_config__');
    renderCustomNav();
  }
}

async function loadPublicSettings() {
  if (!supabase) return;

  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  if (!error && data) {
    siteSettings = { ...siteSettings, ...data };
  }

  const { data: configData } = await supabase
    .from('site_pages')
    .select('content')
    .eq('slug', '__neonova_config__')
    .maybeSingle();

  if (configData?.content) {
    try {
      siteConfig = { ...siteConfig, ...JSON.parse(configData.content) };
    } catch {
      console.warn('تنظیمات سایت قابل خواندن نیست.');
    }
  }

  applySiteConfig();
}

async function initialize() {
  await loadPublicSettings();
  await loadPublicPages();

  shell();
  await loadItems();
}

initialize();