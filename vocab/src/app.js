/* ============================================================
   考研英语二单词背诵 App · 核心逻辑
   localStorage 持久化 + 原生 JS + 单页路由
   ============================================================ */

// ---------- 工具 ----------
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const uid = () => 'w_' + Math.random().toString(36).slice(2, 10);
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
};

// ---------- 种子单词 ----------
const SEED_WORDS = [
  { word: 'ubiquitous',  phonetic: '/juːˈbɪkwɪtəs/', pos: 'adj.', meaning: '无处不在的；普遍存在的',
    example: 'Smartphones have become ubiquitous in modern society.', etymology: 'ubi- 到处',
    tags: ['高频词','真题词'], familiarity: 1, status: 'new', reviewReminder: true },
  { word: 'deteriorate', phonetic: '/dɪˈtɪriəreɪt/', pos: 'v.', meaning: '恶化；变坏；质量下降',
    example: 'Air quality has deteriorated significantly.', etymology: 'de- 下 + terior 更坏',
    tags: ['高频词','易错词'], familiarity: 2, status: 'review', reviewReminder: true },
  { word: 'proliferate', phonetic: '/prəˈlɪfəreɪt/', pos: 'v.', meaning: '激增；扩散；使增生',
    example: 'Online scams have proliferated in recent years.', etymology: 'prol- 后代 + -ifer + -ate',
    tags: ['真题词','高频词'], familiarity: 2, status: 'review', reviewReminder: true },
  { word: 'mitigate',    phonetic: '/ˈmɪtɪɡeɪt/', pos: 'v.', meaning: '减轻；缓和；缓解',
    example: 'New policies aim to mitigate climate change.', etymology: 'mitis 温和 + -ate',
    tags: ['高频词'], familiarity: 1, status: 'new', reviewReminder: true },
  { word: 'pragmatic',  phonetic: '/præɡˈmætɪk/', pos: 'adj.', meaning: '务实的；实用主义的',
    example: 'We need a pragmatic approach to this problem.', etymology: 'pragma 行动 + -atic',
    tags: ['真题词','高频词'], familiarity: 1, status: 'new', reviewReminder: true },
  { word: 'compelling', phonetic: '/kəmˈpelɪŋ/', pos: 'adj.', meaning: '引人注目的；令人信服的',
    example: 'The documentary makes a compelling case.', etymology: 'com- + pel 驱使',
    tags: ['真题词'], familiarity: 3, status: 'review', reviewReminder: true },
  { word: 'scrutinize', phonetic: '/ˈskruːtənaɪz/', pos: 'v.', meaning: '仔细检查；细看',
    example: 'Auditors scrutinized every expense.', etymology: 'scruter 细看 + -ize',
    tags: ['高频词'], familiarity: 1, status: 'new', reviewReminder: true },
  { word: 'paradigm',   phonetic: '/ˈpærədaɪm/', pos: 'n.', meaning: '典范；范例；范式',
    example: 'This represents a paradigm shift.', etymology: 'para- + 展示',
    tags: ['真题词','高频词'], familiarity: 1, status: 'new', reviewReminder: false },
  { word: 'benevolent', phonetic: '/bəˈnevələnt/', pos: 'adj.', meaning: '仁慈的；善意的',
    example: 'A benevolent donor funded the project.', etymology: 'bene- 好 + vol 意愿',
    tags: ['高频词'], familiarity: 5, status: 'known', reviewReminder: false },
  { word: 'resilient',  phonetic: '/rɪˈzɪliənt/', pos: 'adj.', meaning: '有韧性的；能迅速恢复的',
    example: 'Children are remarkably resilient.', etymology: 're- + salire 跳',
    tags: ['高频词'], familiarity: 1, status: 'new', reviewReminder: true },
  { word: 'volatile',   phonetic: '/ˈvɒlətaɪl/', pos: 'adj.', meaning: '易变的；不稳定的',
    example: 'Stock markets can be extremely volatile.', etymology: 'volare 飞',
    tags: ['高频词','易错词'], familiarity: 2, status: 'review', reviewReminder: true },
  { word: 'exacerbate', phonetic: '/ɪɡˈzæsəbeɪt/', pos: 'v.', meaning: '使恶化；使加剧',
    example: 'Stress can exacerbate health issues.', etymology: 'ex- + acerb 苦',
    tags: ['高频词','易错词'], familiarity: 1, status: 'new', reviewReminder: true },
  { word: 'tangible',   phonetic: '/ˈtændʒəbl/', pos: 'adj.', meaning: '有形的；切实的',
    example: 'She made tangible progress.', etymology: 'tangere 触摸 + -ible',
    tags: ['真题词'], familiarity: 3, status: 'review', reviewReminder: true },
  { word: 'empirical',  phonetic: '/ɪmˈpɪrɪkl/', pos: 'adj.', meaning: '经验主义的；实证的',
    example: 'The study lacked empirical evidence.', etymology: 'empeiria 经验',
    tags: ['高频词'], familiarity: 4, status: 'known', reviewReminder: false },
  { word: 'nuance',     phonetic: '/ˈnjuːɑːns/', pos: 'n.', meaning: '细微差别；微妙之处',
    example: 'He missed the nuance of her tone.', etymology: 'nubes 云',
    tags: ['真题词'], familiarity: 1, status: 'new', reviewReminder: true },
];

const SEED_ARCHIVED = [
  { word: 'superfluous', phonetic: '/suːˈpɜːfluəs/', pos: 'adj.', meaning: '多余的；过剩的',
    familiarity: 5, status: 'archived' },
  { word: 'vicissitude', phonetic: '/vɪˈsɪsɪtjuːd/', pos: 'n.', meaning: '变迁；盛衰',
    familiarity: 5, status: 'archived' },
  { word: 'propitious',  phonetic: '/prəˈpɪʃəs/', pos: 'adj.', meaning: '有利的；吉利的',
    familiarity: 5, status: 'archived' },
];

// ---------- 数据存储 ----------
const DB_KEY = 'vocab_app_db_v1';
function loadDB() {
  let raw = null;
  try { raw = localStorage.getItem(DB_KEY); } catch(e) {}
  if (raw) {
    try { return JSON.parse(raw); } catch(e) {}
  }
  // 首次使用，注入种子
  const seed = (list, status) => list.map(w => ({
    id: uid(), ...w, status: w.status || status,
    reviewHistory: [], createdAt: Date.now()
  }));
  return {
    words: [...seed(SEED_WORDS, 'new'), ...seed(SEED_ARCHIVED, 'archived')],
    settings: { dailyGoal: 30, reminderTime: '20:00', streakDays: 47, lastStudyDate: todayStr() },
    dailyProgress: {},
  };
}
function saveDB(db) {
  try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch(e) {}
}
let DB = loadDB();

// ---------- 应用状态 ----------
let state = {
  currentPage: 'home',       // home | study | complete | stats | import | edit
  editingWordId: null,        // 编辑的单词 id
  studyQueue: [],             // 本轮学习队列
  studyIndex: 0,              // 当前索引
  flipped: false,             // 卡片是否翻面
  viewMode: 'week',           // week | month
  importList: [],             // 解析后待导入列表
  dailyCounter: 30,           // 每日目标临时值
  // 每日统计
  todayStats: { known: 0, fuzzy: 0, unknown: 0 },
};

// ---------- Toast ----------
let toastTimer = null;
function toast(msg, type = 'success') {
  let el = $('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.className = `toast show ${type}`;
  el.textContent = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2000);
}

// ---------- 数据辅助 ----------
function getWordsByStatus(status) {
  return DB.words.filter(w => w.status === status);
}
function getDailyGoal() { return DB.settings.dailyGoal || 30; }

// ---------- 渲染入口 ----------
function render() {
  const app = $('#app');
  const p = state.currentPage;
  app.innerHTML = ''; // 清空

  // 页面渲染
  if (p === 'home' || p === 'stats') {
    app.innerHTML =
      renderStatusBar() +
      '<div class="scroll-area">' +
        (p === 'home' ? renderHome() : renderStats()) +
      '</div>' +
      (p === 'home' ? renderHomeCTA() : '') +
      renderTabBar(p === 'home' ? 'home' : 'stats');
  } else if (p === 'study') {
    app.innerHTML = renderStudy();
  } else if (p === 'complete') {
    app.innerHTML = renderComplete();
  } else if (p === 'edit') {
    app.innerHTML = renderEdit();
  } else if (p === 'import') {
    app.innerHTML = renderImport();
  }

  // 绑定
  if (p === 'home') bindHome();
  else if (p === 'stats') bindStats();
  else if (p === 'study') bindStudy();
  else if (p === 'complete') bindComplete();
  else if (p === 'edit') bindEdit();
  else if (p === 'import') bindImport();
}

function renderStatusBar() {
  return `
    <div class="status-bar">
      <span>${formatTime()}</span>
      <div class="icons">
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
          <rect x="0" y="6" width="3" height="4" rx="0.5" fill="currentColor"/>
          <rect x="4" y="4" width="3" height="6" rx="0.5" fill="currentColor"/>
          <rect x="8" y="2" width="3" height="8" rx="0.5" fill="currentColor"/>
          <rect x="12" y="0" width="3" height="10" rx="0.5" fill="currentColor"/>
        </svg>
        <svg width="22" height="10" viewBox="0 0 22 10" fill="none">
          <rect x="0.5" y="0.5" width="18" height="9" rx="2" stroke="currentColor"/>
          <rect x="2" y="2" width="15" height="6" rx="1" fill="currentColor"/>
          <rect x="19.5" y="3.5" width="1.5" height="3" rx="0.5" fill="currentColor"/>
        </svg>
      </div>
    </div>
  `;
}
function formatTime() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
}
function starsSvg(n, filled = true) {
  const out = [];
  for (let i = 0; i < 5; i++) {
    out.push(`<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" class="${i < n ? 'filled' : ''}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`);
  }
  return `<div class="stars">${out.join('')}</div>`;
}
function tagChips(tags = []) {
  return tags.map(t => {
    const cls = t === '高频词' ? 'high' : t === '易错词' ? 'error' : t === '真题词' ? 'real' : 'high';
    return `<span class="tag-chip ${cls}">${t}</span>`;
  }).join('');
}

// ---------- 首页 ----------
function renderHome() {
  const review = getWordsByStatus('review');
  const neww = getWordsByStatus('new');
  const known = getWordsByStatus('known');
  const today = review.slice(0, 12).concat(neww.slice(0, Math.max(0, getDailyGoal() - review.length)));
  const needStudy = getWordsByStatus('review').concat(getWordsByStatus('new'));

  return `
    <div class="page-header">
      <div class="page-title-row">
        <div>
          <div class="subtitle">Good morning, 研途加油</div>
          <h2>今日背诵</h2>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="icon-btn import-entry" title="导入词库">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 21h14"/>
            </svg>
          </button>
          <button class="icon-btn add-entry" title="新增词条">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="study-summary">
      <div class="streak-dot"><span class="number">${DB.settings.streakDays || 1}</span></div>
      <div class="study-summary-info">
        <h3>连续打卡 ${DB.settings.streakDays || 1} 天</h3>
        <p>已掌握 ${known.length} 词 · 每日目标 ${getDailyGoal()} 词</p>
        <div class="progress-mini"><span style="width:${Math.min(100, (known.length/7500*100)).toFixed(1)}%"></span></div>
      </div>
    </div>

    <div class="view-switch">
      <button data-view="week" class="${state.viewMode==='week'?'active':''}">本周</button>
      <button data-view="month" class="${state.viewMode==='month'?'active':''}">本月</button>
    </div>

    ${renderWeekCalendar()}

    ${review.length > 0 ? `
      <div class="section-title">
        <div class="label"><span class="dot-indicator amber"></span>待复习</div>
        <span class="count">${review.length}</span>
      </div>
      ${review.slice(0, 6).map(w => renderWordCard(w)).join('')}
    ` : ''}

    ${neww.length > 0 ? `
      <div class="section-title">
        <div class="label"><span class="dot-indicator blue"></span>待背诵</div>
        <span class="count">${neww.length}</span>
      </div>
      ${neww.slice(0, 6).map(w => renderWordCard(w)).join('')}
    ` : ''}

    <div class="section-title">
      <div class="label"><span class="dot-indicator green"></span>已掌握</div>
      <button class="btn-text known-jump">查看全部 ${known.length} →</button>
    </div>

    ${needStudy.length === 0 ? `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/>
        </svg>
        <div>今日任务已完成 🎉<br>点击"导入词库"添加新词条</div>
      </div>
    ` : ''}

    <div style="height: 40px"></div>
  `;
}

function renderWordCard(w) {
  return `
    <div class="word-card" data-id="${w.id}">
      <div class="word-main">
        <div class="word-en">${w.word}</div>
        <div class="word-phonetic">${w.phonetic || ''} ${w.pos || ''}</div>
        <div class="word-cn">${w.meaning}</div>
      </div>
      <div class="word-right">
        ${starsSvg(w.familiarity || 0)}
        <div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end">${tagChips(w.tags)}</div>
      </div>
    </div>
  `;
}

function renderWeekCalendar() {
  const today = new Date();
  const dayNames = ['日','一','二','三','四','五','六'];
  // 取本周一
  const monday = new Date(today);
  const dow = (today.getDay() + 6) % 7; // 周一=0
  monday.setDate(today.getDate() - dow);

  // 简易周统计：周内每天是否完成过
  const progress = DB.dailyProgress || {};

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dkey = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
    const isToday = d.toDateString() === today.toDateString();
    const done = progress[dkey] && (progress[dkey].known + progress[dkey].fuzzy >= 5);
    days.push({
      name: dayNames[d.getDay()],
      num: d.getDate(),
      isToday,
      done,
      dkey,
    });
  }
  return `
    <div class="week-calendar">
      ${days.map(d => `
        <div class="week-day ${d.isToday?'today':''} ${d.done?'done':''}">
          <span class="wkd-name">${d.name}</span>
          <span class="wkd-num">${d.num}</span>
          <span class="wkd-dot"></span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderHomeCTA() {
  const needStudy = getWordsByStatus('review').concat(getWordsByStatus('new'));
  const label = needStudy.length > 0
    ? `开始今日背诵 · ${needStudy.length} 词`
    : '添加新词';
  return `
    <div class="cta-area">
      <button class="btn-primary start-study" ${needStudy.length === 0 ? '' : ''}>
        ${label}
      </button>
    </div>
  `;
}

function bindHome() {
  $('.start-study')?.addEventListener('click', () => {
    const queue = getWordsByStatus('review').concat(getWordsByStatus('new'));
    if (queue.length === 0) {
      toast('暂无待背单词，先导入一些吧', 'error');
      return;
    }
    state.studyQueue = queue;
    state.studyIndex = 0;
    state.flipped = false;
    state.todayStats = { known: 0, fuzzy: 0, unknown: 0 };
    state.currentPage = 'study';
    render();
  });

  $('.import-entry')?.addEventListener('click', () => {
    state.currentPage = 'import'; render();
  });
  $('.add-entry')?.addEventListener('click', () => {
    state.editingWordId = null;
    state.currentPage = 'edit'; render();
  });
  $('.known-jump')?.addEventListener('click', () => {
    state.currentPage = 'stats'; render();
  });

  $$('.view-switch button').forEach(b => b.addEventListener('click', () => {
    state.viewMode = b.dataset.view;
    b.parentElement.querySelectorAll('button').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    render();
  }));

  $$('.word-card').forEach(card => card.addEventListener('click', () => {
    const id = card.dataset.id;
    state.editingWordId = id;
    state.currentPage = 'edit';
    render();
  }));
}

// ---------- 背诵页 ----------
function renderStudy() {
  if (!state.studyQueue || state.studyIndex >= state.studyQueue.length) {
    // 完成
    state.currentPage = 'complete';
    render();
    return;
  }
  const w = state.studyQueue[state.studyIndex];
  const total = state.studyQueue.length;
  const progress = ((state.studyIndex) / total * 100).toFixed(1);

  return `
    ${renderStatusBar()}
    <div class="study-screen">
      <div class="study-progress">
        <button class="icon-btn" id="study-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div class="bar"><span style="width:${progress}%"></span></div>
        <div class="info">${state.studyIndex} / ${total}</div>
      </div>

      <div class="flip-card-wrap">
        <div class="flip-card ${state.flipped ? 'show-answer' : ''}" id="flipCard">
          <div class="word-face">
            <h2>${w.word}</h2>
            <div class="phonetic">${w.phonetic || ''} ${w.pos || ''}</div>
            <div class="hint">点击卡片查看释义</div>
          </div>
          <div class="answer-face">
            <span class="pos">${w.pos || 'n.'}</span>
            <div class="meaning">${w.meaning}</div>
            ${w.example ? `<div class="example">${w.example}</div>` : ''}
            <div class="tags">${tagChips(w.tags)}</div>
          </div>
        </div>
      </div>

      <div class="mark-row">
        <button class="mark-btn unknown" data-mark="unknown">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          不认识
        </button>
        <button class="mark-btn fuzzy" data-mark="fuzzy">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          模糊
        </button>
        <button class="mark-btn known" data-mark="known">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          认识
        </button>
      </div>
    </div>
  `;
}

function bindStudy() {
  const card = $('#flipCard');
  card?.addEventListener('click', () => { state.flipped = !state.flipped; render(); });

  $('#study-back')?.addEventListener('click', () => {
    if (state.studyIndex > 0) state.studyIndex--;
    else state.currentPage = 'home';
    state.flipped = false;
    render();
  });

  $$('.mark-btn').forEach(btn => btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const mark = btn.dataset.mark;
    const w = state.studyQueue[state.studyIndex];
    const realWord = DB.words.find(x => x.id === w.id);
    if (!realWord) return;

    // 更新熟练度
    if (mark === 'known') {
      realWord.familiarity = Math.min(5, (realWord.familiarity || 0) + 1);
      realWord.status = realWord.familiarity >= 4 ? 'known' : 'review';
      state.todayStats.known++;
    } else if (mark === 'fuzzy') {
      realWord.familiarity = Math.max(1, (realWord.familiarity || 0));
      realWord.status = 'review';
      state.todayStats.fuzzy++;
    } else {
      realWord.familiarity = 1;
      realWord.status = 'review';
      state.todayStats.unknown++;
    }
    realWord.lastReviewedAt = Date.now();
    realWord.reviewHistory = realWord.reviewHistory || [];
    realWord.reviewHistory.push(Date.now());
    saveDB(DB);

    // 下一个
    state.studyIndex++;
    state.flipped = false;
    render();
  }));
}

// ---------- 完成页 ----------
function renderComplete() {
  const { known, fuzzy, unknown } = state.todayStats;
  const total = known + fuzzy + unknown;
  return `
    ${renderStatusBar()}
    <div class="complete-screen">
      <div class="big-check">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--known)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h2>本轮完成！</h2>
      <p>共复习 ${total} 个单词</p>
      <div class="stats-row">
        <div style="text-align:center; color:var(--known)">
          <div class="stat-num">${known}</div>
          <div class="stat-label">认识 ✓</div>
        </div>
        <div style="text-align:center; color:var(--review)">
          <div class="stat-num">${fuzzy}</div>
          <div class="stat-label">模糊</div>
        </div>
        <div style="text-align:center; color:var(--unknown)">
          <div class="stat-num">${unknown}</div>
          <div class="stat-label">不认识</div>
        </div>
      </div>
      <div class="actions">
        <button class="btn-primary" id="backHome">返回首页</button>
        <button class="btn-text brand" id="goStats">查看统计数据 →</button>
      </div>
    </div>
  `;
}

function bindComplete() {
  $('#backHome')?.addEventListener('click', () => { state.currentPage = 'home'; render(); });
  $('#goStats')?.addEventListener('click', () => { state.currentPage = 'stats'; render(); });
}

// ---------- 编辑页 ----------
function renderEdit() {
  const isNew = !state.editingWordId;
  const w = isNew ? {
    word:'', phonetic:'', pos:'adj.', meaning:'', example:'', etymology:'',
    tags:['高频词','真题词'], familiarity:0, reviewReminder:true
  } : DB.words.find(x => x.id === state.editingWordId) || {};

  return `
    ${renderStatusBar()}
    <div class="page-header">
      <div class="page-title-row">
        <div style="display:flex;align-items:center;gap:10px">
          <button class="icon-btn" id="edit-back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div>
            <div class="subtitle">${isNew ? '新增词条' : '编辑词条'}</div>
            <h2 style="font-size:22px">${w.word || 'New Word'}</h2>
          </div>
        </div>
        ${isNew ? '' : `<button class="btn-text danger" id="deleteWord">删除</button>`}
      </div>
    </div>

    <div class="scroll-area">
      <div class="form-group">
        <label class="form-label">单词拼写 *</label>
        <input class="form-input" id="f-word" value="${w.word || ''}" placeholder="如 ubiquitous">
      </div>

      <div class="form-row" style="margin-top:16px">
        <div>
          <label class="form-label">音标</label>
          <input class="form-input" id="f-phonetic" value="${w.phonetic || ''}" placeholder="/juːˈbɪkwɪtəs/">
        </div>
        <div>
          <label class="form-label">词性</label>
          <select class="form-select" id="f-pos">
            ${['n.','v.','adj.','adv.','prep.','conj.'].map(p => `<option value="${p}" ${p===w.pos?'selected':''}>${p}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">中文释义 *</label>
        <textarea class="form-textarea" id="f-meaning" placeholder="如：无处不在的；普遍存在的">${w.meaning || ''}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label">例句</label>
        <textarea class="form-textarea" id="f-example" placeholder="真题例句或写作佳句">${w.example || ''}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label">词根词缀 / 记忆法</label>
        <textarea class="form-textarea" id="f-etymology" placeholder="如：ubi-(everywhere) + quitous → 到处都有的">${w.etymology || ''}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label">词书标签（可多选）</label>
        <div class="chips-group" id="f-tags">
          ${['高频词','易错词','真题词','核心词','基础词'].map(t =>
            `<button class="chip-select ${(w.tags||[]).includes(t)?'selected':''}" data-tag="${t}">${t}</button>`
          ).join('')}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">熟练度</label>
        <div class="toggle-row" style="flex-direction:column;align-items:flex-start;gap:12px;">
          <div class="star-interactive" id="f-stars">
            ${[0,1,2,3,4].map(i => `
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" class="${i < (w.familiarity||0)?'filled':''}" data-star="${i+1}">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="divider-thin"></div>

      <div class="form-group">
        <div class="toggle-row">
          <div class="info">
            <div class="title">定时复习提醒</div>
            <div class="desc">今日 20:00 推送复习</div>
          </div>
          <button class="toggle-switch ${w.reviewReminder?'on':''}" id="f-reminder"></button>
        </div>
      </div>
      <div style="height:40px"></div>
    </div>

    <div class="cta-area">
      <button class="btn-primary" id="saveWord">保存词条</button>
    </div>
  `;
}

function bindEdit() {
  $('#edit-back')?.addEventListener('click', () => { state.currentPage = 'home'; render(); });
  $('#deleteWord')?.addEventListener('click', () => {
    if (!confirm('确定删除该词条？')) return;
    DB.words = DB.words.filter(x => x.id !== state.editingWordId);
    saveDB(DB);
    toast('已删除', 'success');
    state.currentPage = 'home';
    render();
  });

  // 星星
  let starsVal = ($$('#f-stars .filled') || []).length || 0;
  $$('#f-stars svg').forEach(s => s.addEventListener('click', () => {
    starsVal = +s.dataset.star;
    $$('#f-stars svg').forEach(x => {
      x.classList.toggle('filled', +x.dataset.star <= starsVal);
    });
  }));

  // chips
  const selectedTags = new Set((($$('#f-tags .chip-select.selected') || []).map(b => b.dataset.tag)));
  $$('#f-tags .chip-select').forEach(b => b.addEventListener('click', () => {
    const t = b.dataset.tag;
    if (selectedTags.has(t)) { selectedTags.delete(t); b.classList.remove('selected'); }
    else { selectedTags.add(t); b.classList.add('selected'); }
  }));

  // reminder toggle
  let reminder = !!$('.toggle-switch.on');
  $('#f-reminder')?.addEventListener('click', () => {
    reminder = !reminder;
    $('#f-reminder').classList.toggle('on', reminder);
  });

  // save
  $('#saveWord')?.addEventListener('click', () => {
    const word = $('#f-word').value.trim();
    const meaning = $('#f-meaning').value.trim();
    if (!word) { toast('请输入单词拼写', 'error'); return; }
    if (!meaning) { toast('请输入中文释义', 'error'); return; }

    const data = {
      word,
      phonetic: $('#f-phonetic').value.trim(),
      pos: $('#f-pos').value,
      meaning,
      example: $('#f-example').value.trim(),
      etymology: $('#f-etymology').value.trim(),
      tags: [...selectedTags],
      familiarity: starsVal,
      reviewReminder: reminder,
    };

    if (state.editingWordId) {
      const w = DB.words.find(x => x.id === state.editingWordId);
      Object.assign(w, data);
    } else {
      DB.words.push({
        id: uid(), ...data, status: data.familiarity >= 4 ? 'known' : 'new',
        reviewHistory: [], createdAt: Date.now()
      });
    }
    saveDB(DB);
    toast(state.editingWordId ? '已保存' : '新增成功', 'success');
    state.currentPage = 'home';
    render();
  });
}

// ---------- 统计页 ----------
function renderStats() {
  const all = DB.words;
  const known = all.filter(w => w.status === 'known');
  const review = all.filter(w => w.status === 'review');
  const neww = all.filter(w => w.status === 'new');
  const archived = all.filter(w => w.status === 'archived');
  const totalActive = known.length + review.length + neww.length;
  const knownRate = totalActive > 0 ? Math.round(known.length / totalActive * 100) : 0;

  const weekData = getWeekStats();

  return `
    <div class="page-header">
      <div class="page-title-row">
        <div>
          <div class="subtitle">Progress</div>
          <h2>学习数据</h2>
        </div>
      </div>
    </div>

    <div class="stat-header">
      <div class="ring-chart">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle class="ring-bg" cx="50" cy="50" r="45"/>
          <circle class="ring-fg" cx="50" cy="50" r="45"
                  stroke-dasharray="283"
                  stroke-dashoffset="${283 - (283 * knownRate / 100)}"/>
        </svg>
        <div class="ring-center">
          <span class="pct">${knownRate}%</span>
          <span class="label">掌握率</span>
        </div>
      </div>
      <div class="stat-header-text">
        <h3>总体掌握度良好</h3>
        <p>已掌握 ${known.length} 词 · 目标 7500 词</p>
        <div class="stat-kpi-row">
          <div class="stat-kpi"><div class="num">${DB.settings.streakDays||0}</div><div class="lbl">连续天数</div></div>
          <div class="stat-kpi"><div class="num">${getDailyGoal()}</div><div class="lbl">每日目标</div></div>
          <div class="stat-kpi"><div class="num">${known.length+review.length+neww.length}</div><div class="lbl">总词数</div></div>
        </div>
      </div>
    </div>

    <div class="bar-chart-card">
      <div class="bar-chart-header">
        <h4>近 7 天背诵量</h4>
      </div>
      <div class="bar-chart">
        ${weekData.map((d, i) => `
          <div class="bar-item">
            <div class="bar-wrap">
              <div class="bar ${i === weekData.length-1 ? 'highlight' : ''}"
                   style="height:${Math.max(8, (d.count / Math.max(...weekData.map(x=>x.count), 1)) * 90)}%">
                ${d.count > 0 ? `<span class="val">${d.count}</span>` : ''}
              </div>
            </div>
            <span class="label">${d.label}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="section-title">
      <div class="label">按词性分类</div>
    </div>

    ${renderCategoryItem('n.', '名词类', all.filter(w => w.pos === 'n.'))}
    ${renderCategoryItem('v.', '动词类', all.filter(w => w.pos === 'v.'))}
    ${renderCategoryItem('adj.', '形容词类', all.filter(w => w.pos === 'adj.'))}
    ${renderCategoryItem('adv.', '副词类', all.filter(w => w.pos === 'adv.'))}

    <div class="section-title">
      <div class="label">词库管理</div>
    </div>

    <div class="archive-entries">
      <div class="archive-card" id="showKnown">
        <div class="a-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          已掌握
        </div>
        <div class="a-num">${known.length}</div>
        <div class="a-sub">标记"认识"自动归档</div>
      </div>
      <div class="archive-card" id="showArchived">
        <div class="a-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A3A8B0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="21 8 21 21 3 21 3 8"/>
            <rect x="1" y="3" width="22" height="5"/>
          </svg>
          已归档
        </div>
        <div class="a-num">${archived.length}</div>
        <div class="a-sub">暂时搁置的低频词</div>
      </div>
    </div>
  `;
}

function getWeekStats() {
  const labels = [];
  const counts = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
    const p = DB.dailyProgress && DB.dailyProgress[key] ? DB.dailyProgress[key] : null;
    labels.push(['日','一','二','三','四','五','六'][d.getDay()]);
    counts.push({ label: labels[labels.length-1], count: p ? (p.known + p.fuzzy) : (i === 0 ? getDailyGoal() * 0.6 : 0) });
  }
  return counts;
}

function renderCategoryItem(pos, label, list) {
  const known = list.filter(w => w.status === 'known').length;
  const pct = list.length > 0 ? Math.round(known / list.length * 100) : 0;
  if (list.length === 0) return '';
  return `
    <div class="category-item">
      <div class="category-icon ${pos==='n.'?'book':pos==='v.'?'verb':pos==='adj.'?'adj':''}">${pos}</div>
      <div class="category-info">
        <div class="name">${label}</div>
        <div class="count">${list.length} 词 · 掌握 ${known}（${pct}%）</div>
      </div>
      <div class="category-bar"><span style="width:${pct}%"></span></div>
    </div>
  `;
}

function bindStats() {
  $('#showKnown')?.addEventListener('click', () => toast(`已掌握 ${DB.words.filter(w=>w.status==='known').length} 个单词`, 'success'));
  $('#showArchived')?.addEventListener('click', () => toast(`已归档 ${DB.words.filter(w=>w.status==='archived').length} 个单词`, 'success'));
}

// ---------- 导入页 ----------
const MOCK_IMPORTED = [
  { word: 'deteriorate', phonetic: '/dɪˈtɪriəreɪt/', meaning: 'v. 恶化；变坏' },
  { word: 'compelling', phonetic: '/kəmˈpelɪŋ/', meaning: 'adj. 引人注目的；令人信服的' },
  { word: 'scrutinize', phonetic: '/ˈskruːtənaɪz/', meaning: 'v. 仔细检查；细看' },
  { word: '— (无释义)', phonetic: '', meaning: '建议手动补充或取消勾选', noCheckbox: true },
  { word: 'proliferate', phonetic: '/prəˈlɪfəreɪt/', meaning: 'v. 激增；扩散' },
  { word: 'paradigm', phonetic: '/ˈpærədaɪm/', meaning: 'n. 典范；范例；范式' },
  { word: 'exacerbate', phonetic: '/ɪɡˈzæsəbeɪt/', meaning: 'v. 使恶化；使加剧' },
  { word: 'nuance', phonetic: '/ˈnjuːɑːns/', meaning: 'n. 细微差别；微妙之处' },
];

function renderImport() {
  const list = state.importList.length ? state.importList : MOCK_IMPORTED;
  const defaultSelected = state.importList.length ? new Set() : new Set([0,1,2,4,5,6,7]);
  if (!state._importSel) state._importSel = defaultSelected;

  return `
    ${renderStatusBar()}
    <div class="page-header">
      <div class="page-title-row">
        <div style="display:flex;align-items:center;gap:10px">
          <div>
            <div class="subtitle">Import Vocabulary</div>
            <h2 style="font-size:22px">导入词库</h2>
          </div>
        </div>
      </div>
    </div>

    <div class="scroll-area">
      <div class="upload-zone" id="uploadZone">
        <div class="icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6E8EF7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <h4>点击上传或拖拽文件</h4>
        <p>支持真题卷、词表、笔记等资料</p>
        <div class="file-types">
          <span class="file-type-badge">.txt</span>
          <span class="file-type-badge">.csv</span>
          <span class="file-type-badge">.xlsx</span>
          <span class="file-type-badge">.docx</span>
          <span class="file-type-badge">.pdf</span>
        </div>
      </div>

      <input type="file" id="fileInput" accept=".txt,.csv,.xlsx,.docx,.pdf,.json" style="display:none">

      <div class="selected-file">
        <div class="file-icon" id="fExt">PDF</div>
        <div class="file-info">
          <div class="name" id="fName">2025年考研英语二真题阅读.pdf</div>
          <div class="meta">2.4 MB · AI 解析完成</div>
          <div class="progress-bar"><span></span></div>
          <div class="progress-text">✓ 已识别 ${list.length} 个单词</div>
        </div>
      </div>

      <div class="preview-stats">
        <h5>识别结果预览</h5>
        <span class="badge">已识别 ${list.length} 个单词</span>
      </div>

      <div class="preview-word-list">
        ${list.map((w, i) => `
          <div class="preview-row ${state._importSel.has(i) && !w.noCheckbox ? 'selected' : ''}" data-idx="${i}">
            <div class="checkbox"></div>
            <div class="pw-main">
              <div class="pw-en">${w.word}</div>
              <div class="pw-cn">${w.meaning}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="config-card">
        <div class="config-row">
          <span class="c-label">每日背诵目标</span>
          <div class="daily-counter">
            <button class="counter-btn" id="cntMinus">−</button>
            <span class="counter-num" id="cntNum">${state.dailyCounter}</span>
            <button class="counter-btn" id="cntPlus">+</button>
            <span style="font-size:11px;color:var(--text-tertiary)">词/天</span>
          </div>
        </div>
        <div class="config-row">
          <span class="c-label">关联词书标签</span>
          <div style="display:flex;gap:4px">
            <span class="tag-chip real" style="font-size:11px">真题词</span>
            <span class="tag-chip high" style="font-size:11px">高频词</span>
          </div>
        </div>
        <div class="config-row">
          <span class="c-label">开启复习提醒</span>
          <button class="toggle-switch on" id="importReminder"></button>
        </div>
      </div>

      <div style="height:16px"></div>
    </div>

    <div class="cta-area">
      <button class="btn-primary" id="generateTask">
        生成背诵任务 · ${[...state._importSel].filter(i => !MOCK_IMPORTED[i].noCheckbox).length || list.length} 词
      </button>
    </div>
  `;
}

function bindImport() {
  $('#uploadZone')?.addEventListener('click', () => $('#fileInput').click());
  $('#fileInput')?.addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const ext = f.name.split('.').pop().toUpperCase();
    $('#fExt').textContent = ext;
    $('#fName').textContent = f.name;
    toast('文件已上传，开始 AI 解析…', 'success');
    // mock 解析
    setTimeout(() => {
      state.importList = MOCK_IMPORTED.map(x => ({ ...x }));
      state._importSel = new Set([0,1,2,4,5,6,7]);
      render();
      toast(`解析完成，识别到 ${MOCK_IMPORTED.length} 个单词`, 'success');
    }, 600);
  });

  // 勾选
  $$('.preview-row').forEach(row => row.addEventListener('click', () => {
    const i = +row.dataset.idx;
    if (MOCK_IMPORTED[i]?.noCheckbox) return;
    if (state._importSel.has(i)) state._importSel.delete(i);
    else state._importSel.add(i);
    row.classList.toggle('selected');
    $('#generateTask').textContent = `生成背诵任务 · ${[...state._importSel].filter(j => !MOCK_IMPORTED[j].noCheckbox).length} 词`;
  }));

  // 计数器
  $('#cntMinus')?.addEventListener('click', () => {
    state.dailyCounter = Math.max(5, state.dailyCounter - 5);
    $('#cntNum').textContent = state.dailyCounter;
  });
  $('#cntPlus')?.addEventListener('click', () => {
    state.dailyCounter = Math.min(200, state.dailyCounter + 5);
    $('#cntNum').textContent = state.dailyCounter;
  });

  // 生成任务
  $('#generateTask')?.addEventListener('click', () => {
    const selected = [...state._importSel].filter(i => !MOCK_IMPORTED[i].noCheckbox);
    if (selected.length === 0) { toast('请至少勾选一个单词', 'error'); return; }

    const existing = new Set(DB.words.map(w => w.word.toLowerCase()));
    let added = 0;
    selected.forEach(i => {
      const m = MOCK_IMPORTED[i];
      if (!existing.has(m.word.toLowerCase())) {
        DB.words.push({
          id: uid(),
          word: m.word,
          phonetic: m.phonetic || '',
          pos: 'v.',
          meaning: m.meaning.replace(/^[a-z]\.\s*/i, ''),
          example: '', etymology: '',
          tags: ['真题词', '高频词'],
          familiarity: 0, status: 'new',
          reviewReminder: true,
          createdAt: Date.now(),
          reviewHistory: [],
        });
        added++;
      }
    });
    DB.settings.dailyGoal = state.dailyCounter;
    saveDB(DB);

    toast(`成功导入 ${added} 个新单词${selected.length - added ? `（${selected.length - added} 个已存在）` : ''}`, 'success');
    state.importList = [];
    state._importSel = new Set();
    state.currentPage = 'home';
    render();
  });
}

// ---------- Tab Bar ----------
function renderTabBar(active) {
  const items = [
    { key: 'home', label: '首页', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` },
    { key: 'stats', label: '统计', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>` },
    { key: 'import', label: '导入', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>` },
  ];
  return `
    <div class="tab-bar">
      ${items.map(it => `
        <div class="tab-item ${active === it.key ? 'active' : ''}" data-tab="${it.key}">
          ${it.icon}
          <span>${it.label}</span>
        </div>
      `).join('')}
    </div>
  `;
}

// ---------- 公共绑定 ----------
function bindCommon() {
  // 所有 tab bar、按钮的通用绑定由各页面各自 bind
}

// ---------- 事件委托（覆盖所有页面） ----------
document.addEventListener('click', (e) => {
  // Tab Bar — 所有页面都有
  const tab = e.target.closest('[data-tab]');
  if (tab) {
    state.currentPage = tab.dataset.tab;
    render();
    return;
  }
  // toggle switch
  const sw = e.target.closest('.toggle-switch');
  if (sw && sw.id !== 'f-reminder' && sw.id !== 'importReminder') {
    sw.classList.toggle('on');
    return;
  }
  // counter
  if (e.target.closest('#cntMinus') || e.target.closest('#cntPlus')) {
    // 在 bindImport 中已处理
  }
});

// ---------- 启动 ----------
document.addEventListener('DOMContentLoaded', () => {
  state.currentPage = 'home';
  // 恢复今日统计
  const tk = todayStr();
  if (DB.dailyProgress && DB.dailyProgress[tk]) {
    state.todayStats = DB.dailyProgress[tk];
  } else {
    state.todayStats = { known: 0, fuzzy: 0, unknown: 0 };
  }
  render();
});
