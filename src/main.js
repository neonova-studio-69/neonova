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

const categories = [
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

let activeCategory = 'همه';
let activeTab = 'image';
let items = [...samples];
let user = null;

const app = document.querySelector('#app');

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;',
  '<':'&lt;',
  '>':'&gt;',
  '"':'&quot;',
  "'":'&#39;'
}[c]));

function shell() {
  app.innerHTML = `
  <header class="topbar">
    <a class="brand" href="#">
      <span class="brand-mark">✦</span>
      <span><b>AI Wallpapers</b><small>Dream in pixels</small></span>
    </a>
    <nav>
      <a class="active" href="#home">خانه</a>
      <a href="#gallery">دسته‌بندی‌ها</a>
      <a href="#about">درباره ما</a>
      <a href="#contact">تماس با ما</a>
    </nav>
    <div class="tools">
      <button id="searchToggle" aria-label="جستجو">⌕</button>
      <button id="accountBtn" aria-label="پنل مدیریت">♙</button>
      <button id="themeBtn" aria-label="تغییر تم">☾</button>
    </div>
  </header>

  <main id="home">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">YOUR DIGITAL DREAMSPACE</p>
        <h1>تصاویر رویایی،<br><span>برای صفحه‌نمایش تو</span></h1>
        <p>در اینجا مجموعه‌ای از تصاویر ساخته‌شده با هوش مصنوعی و موسیقی‌های خاص پیدا می‌کنی.</p>
        <label class="search">
          <span>⌕</span>
          <input id="searchInput" placeholder="جستجو در تصاویر و موسیقی..." />
        </label>
      </div>
    </section>

    <section class="categories" id="categories">
      ${categories.map(([name,icon])=>`
        <button class="cat ${name==='همه'?'selected':''}" data-cat="${name}">
          <i>${icon}</i><span>${name}</span>
        </button>
      `).join('')}
    </section>

    <section class="gallery-section" id="gallery">
      <div class="section-head">
        <div>
          <span class="eyebrow">FRESH DROPS</span>
          <h2 id="sectionTitle">جدیدترین تصاویر <b>✦</b></h2>
        </div>
        <div class="tabs">
          <button class="tab active" data-tab="image">تصاویر</button>
          <button class="tab" data-tab="audio">موسیقی AI</button>
        </div>
      </div>
      <div class="gallery" id="galleryGrid"></div>
      <p class="empty hidden" id="empty">هنوز چیزی اینجا نیست. بعداً دوباره سر بزن ✨</p>
    </section>

    <section class="features" id="about">
      <article><span>♡</span><div><b>به‌روزرسانی مداوم</b><p>هر بار تصاویر و آهنگ‌های تازه اضافه می‌شوند.</p></div></article>
      <article><span>ϟ</span><div><b>کیفیت بالا</b><p>محتوای باکیفیت برای تجربه‌ای بهتر.</p></div></article>
      <article><span>▣</span><div><b>مناسب همه دستگاه‌ها</b><p>برای موبایل، تبلت و کامپیوتر.</p></div></article>
    </section>
  </main>

  <footer id="contact">
    <a class="brand" href="#">
      <span class="brand-mark">✦</span>
      <span><b>AI Wallpapers</b><small>Dream in pixels</small></span>
    </a>
    <small>© 2026 AI Wallpapers. All rights reserved.</small>
    <div class="social">✈　◎　▶</div>
  </footer>

  <div id="modal" class="modal hidden"></div>
  `;

  bindShell();
  renderGallery();
}

function bindShell() {
  document.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{
    activeCategory=b.dataset.cat;
    document.querySelectorAll('[data-cat]').forEach(x=>
      x.classList.toggle('selected',x===b)
    );
    renderGallery();
  });

  document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{
    activeTab=b.dataset.tab;
    document.querySelectorAll('[data-tab]').forEach(x=>
      x.classList.toggle('active',x===b)
    );

    document.querySelector('#sectionTitle').innerHTML=
      activeTab==='image'
      ? 'جدیدترین تصاویر <b>✦</b>'
      : 'موسیقی‌های هوش مصنوعی <b>♫</b>';

    renderGallery();
  });

  document.querySelector('#searchInput').oninput=renderGallery;

  document.querySelector('#searchToggle').onclick=()=>
    document.querySelector('#searchInput').focus();

  document.querySelector('#themeBtn').onclick=()=>
    document.body.classList.toggle('light');

  document.querySelector('#accountBtn').onclick=showAdmin;
}

function renderGallery() {
  const q=(document.querySelector('#searchInput')?.value||'')
    .trim().toLowerCase();

  const filtered=items.filter(x=>
    x.kind===activeTab &&
    (activeCategory==='همه'||x.category===activeCategory) &&
    `${x.title} ${x.description||''} ${x.category}`.toLowerCase().includes(q)
  );

  const grid=document.querySelector('#galleryGrid');

  grid.innerHTML=filtered.map(x=>x.kind==='image'?`
    <article class="tile">
      <img src="${esc(x.url)}" alt="${esc(x.title)}" loading="lazy">
      <div class="tile-overlay">
        <span>${esc(x.category)}</span>
        <b>${esc(x.title)}</b>
        <div>
          <button data-view="${esc(x.id)}">مشاهده</button>
          <a href="${esc(x.url)}" download target="_blank" rel="noopener">دانلود ↓</a>
        </div>
      </div>
    </article>
  `:`
    <article class="audio-card">
      <div class="audio-art">♫</div>
      <span class="eyebrow">AI ORIGINAL</span>
      <h3>${esc(x.title)}</h3>
      <p>${esc(x.description)}</p>
      ${x.url
        ? `<audio controls src="${esc(x.url)}"></audio>`
        : '<small class="pending">فایل صوتی هنوز منتشر نشده است.</small>'}
    </article>
  `).join('');

  document.querySelector('#empty').classList.toggle('hidden',filtered.length>0);

  grid.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{
    const x=items.find(i=>String(i.id)===b.dataset.view);
    if(!x)return;

    const m=document.querySelector('#modal');

    m.innerHTML=`
      <div class="modal-box">
        <button class="close">×</button>
        <img src="${esc(x.url)}" alt="${esc(x.title)}">
        <h3>${esc(x.title)}</h3>
        <a class="primary" href="${esc(x.url)}" download target="_blank" rel="noopener">دانلود تصویر</a>
      </div>
    `;

    m.classList.remove('hidden');
    m.querySelector('.close').onclick=()=>m.classList.add('hidden');
  });
}

// بررسی نشست قبلی ادمین
async function showAdmin() {
  const modal=document.querySelector('#modal');

  if(!supabase) {
    alert('ابتدا تنظیمات Supabase را در فایل .env بررسی کن.');
    return;
  }

  const {data,error}=await supabase.auth.getSession();

  if(error) {
    alert(error.message);
    return;
  }

  if(data.session) {
    user=data.session.user;
    showUploader();
    return;
  }

  modal.innerHTML=`
    <div class="modal-box admin-box">
      <button class="close">×</button>
      <span class="eyebrow">PRIVATE AREA</span>
      <h2>پنل مدیریت</h2>
      <p>برای مدیریت سایت وارد حساب مدیر شو.</p>

      <form id="loginForm">
        <input id="email" type="email" placeholder="ایمیل مدیر" required>
        <input id="password" type="password" placeholder="رمز عبور" required>
        <button class="primary" type="submit">ورود</button>
      </form>

      <div class="admin-note">
        ${envReady?'اتصال پایگاه داده آماده است.':'ابتدا Supabase را در فایل .env تنظیم کن.'}
      </div>
    </div>
  `;

  modal.classList.remove('hidden');

  modal.querySelector('.close').onclick=()=>
    modal.classList.add('hidden');

  modal.querySelector('#loginForm').onsubmit=async e=>{
    e.preventDefault();

    const email=modal.querySelector('#email').value.trim();
    const password=modal.querySelector('#password').value;
    const btn=e.currentTarget.querySelector('button[type="submit"]');

    btn.disabled=true;
    btn.textContent='در حال ورود...';

    const {data,error}=await supabase.auth.signInWithPassword({
      email,
      password
    });

    if(error) {
      alert(error.message);
      btn.disabled=false;
      btn.textContent='ورود';
      return;
    }

    user=data.user;
    showUploader();
  };
}

// نمایش محتوای منتشرشده در پنل
function renderAdminItems() {
  const list=document.querySelector('#adminMediaList');
  if(!list)return;

  const uploaded=items.filter(x=>x.storage_path&&x.id);

  if(!uploaded.length) {
    list.innerHTML='<p class="admin-note">هنوز محتوایی آپلود نکرده‌ای.</p>';
    return;
  }

  list.innerHTML=uploaded.map(x=>`
    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid #555;gap:10px">
      <div>
        <b>${esc(x.title)}</b>
        <small style="display:block">${x.kind==='image'?'تصویر':'موسیقی'} · ${esc(x.category)}</small>
      </div>
      <div style="display:flex;gap:6px">
        <button type="button" data-edit="${esc(x.id)}">ویرایش</button>
        <button type="button" data-delete="${esc(x.id)}">حذف</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('[data-edit]').forEach(b=>b.onclick=async()=>{
    const item=items.find(x=>String(x.id)===b.dataset.edit);
    if(!item)return;

    const title=prompt('عنوان جدید:',item.title);
    if(title===null)return;

    const cleanTitle=title.trim();
    if(!cleanTitle) {
      alert('عنوان نمی‌تواند خالی باشد.');
      return;
    }

    const category=prompt(
      'دسته‌بندی جدید را وارد کن:\n'+
      categories.filter(x=>x[0]!=='همه').map(x=>x[0]).join('، '),
      item.category
    );

    if(category===null)return;

    const valid=categories.some(x=>x[0]===category.trim()&&x[0]!=='همه');

    if(!valid) {
      alert('دسته‌بندی معتبر نیست.');
      return;
    }

    const {error}=await supabase
      .from('media_items')
      .update({
        title:cleanTitle,
        category:category.trim()
      })
      .eq('id',item.id);

    if(error) {
      alert(error.message);
      return;
    }

    await loadItems();
    showUploader();
    alert('تغییرات ذخیره شد ✨');
  });

  list.querySelectorAll('[data-delete]').forEach(b=>b.onclick=async()=>{
    const item=items.find(x=>String(x.id)===b.dataset.delete);
    if(!item||!item.storage_path)return;

    if(!confirm(`محتوای «${item.title}» برای همیشه حذف شود؟`))return;

    b.disabled=true;

    const {error:storageError}=await supabase.storage
      .from('media')
      .remove([item.storage_path]);

    if(storageError) {
      alert('خطا در حذف فایل: '+storageError.message);
      b.disabled=false;
      return;
    }

    const {error:dbError}=await supabase
      .from('media_items')
      .delete()
      .eq('id',item.id);

    if(dbError) {
      alert('فایل حذف شد اما رکورد پایگاه داده حذف نشد: '+dbError.message);
      await loadItems();
      showUploader();
      return;
    }

    await loadItems();
    showUploader();
    alert('محتوا با موفقیت حذف شد.');
  });
}

function showUploader() {
  const modal=document.querySelector('#modal');

  modal.innerHTML=`
    <div class="modal-box admin-box">
      <button class="close">×</button>
      <span class="eyebrow">ADMIN DASHBOARD</span>
      <h2>مدیریت سایت</h2>
      <p>محتوای جدید منتشر کن یا محتوای قبلی را ویرایش و حذف کن.</p>

      <form id="uploadForm">
        <input id="title" placeholder="عنوان اثر" required>

        <select id="kind">
          <option value="image">تصویر پس‌زمینه</option>
          <option value="audio">آهنگ هوش مصنوعی</option>
        </select>

        <select id="category">
          ${categories.filter(x=>x[0]!=='همه')
            .map(x=>`<option value="${esc(x[0])}">${esc(x[0])}</option>`).join('')}
        </select>

        <input id="file" type="file" accept="image/*" required>

        <button class="primary" type="submit">آپلود و انتشار</button>
      </form>

      <hr>

      <h3>محتوای منتشرشده</h3>
      <div id="adminMediaList"></div>

      <button id="logout" class="text-btn" type="button">خروج از حساب</button>

      <p class="admin-note">فایل‌ها در فضای ذخیره‌سازی آنلاین قرار می‌گیرند.</p>
    </div>
  `;

  modal.classList.remove('hidden');

  modal.querySelector('.close').onclick=()=>
    modal.classList.add('hidden');

  renderAdminItems();

  modal.querySelector('#logout').onclick=async()=>{
    const {error}=await supabase.auth.signOut();

    if(error) {
      alert(error.message);
      return;
    }

    user=null;
    modal.classList.add('hidden');
  };

  modal.querySelector('#kind').onchange=e=>{
    modal.querySelector('#file').accept=
      e.target.value==='image'?'image/*':'audio/*';
  };

  modal.querySelector('#uploadForm').onsubmit=async e=>{
    e.preventDefault();

    if(!user) {
      alert('نشست ورود پیدا نشد. دوباره وارد شو.');
      showAdmin();
      return;
    }

    const file=modal.querySelector('#file').files[0];
    const kind=modal.querySelector('#kind').value;
    const title=modal.querySelector('#title').value.trim();
    const category=modal.querySelector('#category').value;

    if(!file||!title) {
      alert('عنوان و فایل را وارد کن.');
      return;
    }

    if(kind==='image'&&!file.type.startsWith('image/')) {
      alert('لطفاً یک فایل تصویری انتخاب کن.');
      return;
    }

    if(kind==='audio'&&!file.type.startsWith('audio/')) {
      alert('لطفاً یک فایل صوتی انتخاب کن.');
      return;
    }

    const btn=e.currentTarget.querySelector('button[type="submit"]');
    btn.disabled=true;
    btn.textContent='در حال آپلود...';

    const safeName=`${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
    const path=`${kind}/${safeName}`;

    const {error:upErr}=await supabase.storage
      .from('media')
      .upload(path,file,{upsert:false});

    if(upErr) {
      alert('خطا در آپلود: '+upErr.message);
      btn.disabled=false;
      btn.textContent='آپلود و انتشار';
      return;
    }

    const {data:pub}=supabase.storage
      .from('media')
      .getPublicUrl(path);

    const {error:dbErr}=await supabase
      .from('media_items')
      .insert({
        title,
        category,
        kind,
        url:pub.publicUrl,
        storage_path:path
      });

    if(dbErr) {
      await supabase.storage.from('media').remove([path]);
      alert('خطا در انتشار: '+dbErr.message);
      btn.disabled=false;
      btn.textContent='آپلود و انتشار';
      return;
    }

    await loadItems();

    // پنل باز می‌ماند و می‌توانی فایل بعدی را آپلود کنی.
    showUploader();
    alert('با موفقیت منتشر شد! ✨');
  };
}

async function loadItems() {
  if(!supabase) {
    renderGallery();
    return;
  }

  const {data,error}=await supabase
    .from('media_items')
    .select('*')
    .order('created_at',{ascending:false});

  if(error) {
    console.error('خطا در دریافت محتوا:',error);
    renderGallery();
    return;
  }

  items=[...(data||[]),...samples];
  renderGallery();
}

shell();
loadItems();سس