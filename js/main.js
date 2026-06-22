/* ============================================================
   main.js  —  loads content from data/content.json (server)
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {

  /* ---------- 1. Load data from local edits or server ------- */
  let data = {};
  const localData = loadLocalContent();
  if (localData) data = localData;

  try {
    if (!localData) {
      const res = await fetch('data/content.json');
      if (res.ok) data = await res.json();
      else console.warn('content.json returned status', res.status);
    }
  } catch(e) {
    console.warn('Could not load content.json:', e);
  }

  /* ---------- 2. Populate sections ------------------------- */
  renderProfile(data.profile    || {});
  renderBio    (data.biography  || {});
  renderResearch(data.research  || []);
  renderTimeline('#experienceList', data.experience || [], renderExpItem);
  renderTimeline('#educationList',  data.education  || [], renderEduItem);
  renderSkills  (data.skills    || []);
  renderPubs    (data.publications || {});
  renderTeaching(data.teaching  || {});
  renderStudents(data.students  || {});
  renderProjects(data.projects  || []);
  renderAwards  (data.awards    || []);
  renderService (data.service   || []);
  renderTalks   (data.talks     || []);
  renderContact (data.profile   || {});

  document.getElementById('footerYear').textContent = new Date().getFullYear();

  /* ---------- 3. Active nav on scroll ---------------------- */
  initNavScroll();

  /* ---------- 4. Mobile hamburger -------------------------- */
  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
});

/* ============================================================
   RENDER HELPERS
   ============================================================ */

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val || '—';
}

function renderProfile(p) {
  setText('profileName',  p.name);
  setText('profileTitle', p.title);
  setText('profileDept',  p.department);
  setText('profileInst',  p.institution);
  setText('profileEmail', p.email);
  setText('profilePhone', p.phone);
  setText('profileOffice',p.office);

  const img = document.getElementById('profilePhoto');
  if (img && p.photo) img.src = p.photo;

  const social = document.getElementById('heroSocial');
  if (!social) return;
  const links = [
    { key: 'googleScholar', icon: 'fas fa-graduation-cap', label: 'Google Scholar' },
    { key: 'researchGate',  icon: 'fas fa-flask',          label: 'ResearchGate'   },
    { key: 'linkedin',      icon: 'fab fa-linkedin',        label: 'LinkedIn'       },
    { key: 'orcid',         icon: 'fas fa-id-badge',        label: 'ORCID'          },
  ];
  social.innerHTML = links
    .filter(l => p[l.key] && p[l.key] !== '#')
    .map(l => `<a href="${externalUrl(p[l.key])}" target="_blank" rel="noopener"><i class="${l.icon}"></i> ${l.label}</a>`)
    .join('');
}

function renderBio(b) {
  setText('bioSummary', b.summary);
  setText('bioDetails',  b.details);
}

function renderResearch(items) {
  const grid = document.getElementById('researchGrid');
  if (!grid) return;
  if (!items.length) { grid.innerHTML = empty(); return; }
  grid.innerHTML = items.map(item => `
    <div class="research-card">
      <img src="${item.image || 'https://via.placeholder.com/400x160/2980b9/ffffff?text=Research'}"
           alt="${esc(item.title)}"
           onerror="this.src='https://via.placeholder.com/400x160/2980b9/ffffff?text=Research'" />
      <div class="research-card-body">
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.description)}</p>
      </div>
    </div>`).join('');
}

function renderTimeline(selector, items, itemFn) {
  const el = document.querySelector(selector);
  if (!el) return;
  if (!items.length) { el.innerHTML = empty(); return; }
  el.innerHTML = items.map(i => `<div class="timeline-item">${itemFn(i)}</div>`).join('');
}

function renderExpItem(i) {
  return `<h3>${esc(i.position)}</h3>
          <div class="meta">${esc(i.organization)} &nbsp;|&nbsp; ${esc(i.duration)}</div>
          <p>${esc(i.description || '')}</p>`;
}

function renderEduItem(i) {
  return `<h3>${esc(i.degree)}</h3>
          <div class="meta">${esc(i.institution)} &nbsp;|&nbsp; ${esc(i.year)}</div>
          <p>${esc(i.description || '')}</p>`;
}

function renderSkills(items) {
  const el = document.getElementById('skillsList');
  if (!el) return;
  if (!items.length) { el.innerHTML = empty(); return; }
  el.innerHTML = items.map(s => `<span class="skill-tag">${esc(s)}</span>`).join('');
}

function renderPubs(pubs) {
  renderPubList('#journalList',    (pubs.journals    || []), 'J');
  renderPubList('#conferenceList', (pubs.conferences || []), 'C');
}

function renderPubList(sel, items, type) {
  const el = document.querySelector(sel);
  if (!el) return;
  if (!items.length) { el.innerHTML = empty(); return; }
  el.innerHTML = items.map((p, i) => `
    <div class="pub-item">
      <h4>[${type}${i + 1}] ${esc(p.title)}</h4>
      <div class="pub-meta">${esc(p.authors)} — <em>${esc(p.journal || p.conference)}</em>, ${esc(p.year)}</div>
      ${p.doi && p.doi !== '#' ? `<a href="${externalUrl(p.doi)}" target="_blank" rel="noopener">DOI / Link ↗</a>` : ''}
    </div>`).join('');
}

function renderTeaching(t) {
  renderCourses('#currentCourses', t.current || []);
  renderCourses('#pastCourses',    t.past    || []);
}

function renderCourses(sel, items) {
  const el = document.querySelector(sel);
  if (!el) return;
  if (!items.length) { el.innerHTML = empty(); return; }
  el.innerHTML = items.map(c => `
    <div class="course-card">
      <div class="code">${esc(c.code)}</div>
      <h4>${esc(c.name)}</h4>
      <div class="sem">${esc(c.semester)}</div>
    </div>`).join('');
}

function renderStudents(s) {
  renderStudentList('#phdStudents',   s.phd   || []);
  renderStudentList('#mtechStudents', s.mtech || []);
}

function renderStudentList(sel, items) {
  const el = document.querySelector(sel);
  if (!el) return;
  if (!items.length) { el.innerHTML = empty(); return; }
  el.innerHTML = items.map(s => {
    const cls = (s.status || '').toLowerCase() === 'ongoing' ? 'badge-ongoing' : 'badge-completed';
    return `<div class="student-item">
      <div class="s-icon"><i class="fas fa-user-graduate"></i></div>
      <div>
        <h4>${esc(s.name)}</h4>
        <p>${esc(s.topic)}</p>
        <span class="badge ${cls}">${esc(s.status)} &nbsp; ${esc(s.year)}</span>
      </div>
    </div>`;
  }).join('');
}

function renderProjects(items) {
  const el = document.getElementById('projectList');
  if (!el) return;
  if (!items.length) { el.innerHTML = empty(); return; }
  el.innerHTML = items.map(p => `
    <div class="project-item">
      <h3>${esc(p.title)}</h3>
      <div class="project-meta">
        <span><i class="fas fa-building"></i> ${esc(p.agency)}</span>
        <span><i class="fas fa-rupee-sign"></i> ${esc(p.amount)}</span>
        <span><i class="fas fa-calendar"></i> ${esc(p.duration)}</span>
      </div>
      <p>${esc(p.description)}</p>
    </div>`).join('');
}

function renderAwards(items) {
  const el = document.getElementById('awardList');
  if (!el) return;
  if (!items.length) { el.innerHTML = empty(); return; }
  el.innerHTML = items.map(a => `
    <div class="award-item">
      <h4>${esc(a.title)}</h4>
      <div class="meta">${esc(a.organization)} &nbsp;|&nbsp; ${esc(a.year)}</div>
      ${a.description ? `<p>${esc(a.description)}</p>` : ''}
    </div>`).join('');
}

function renderService(items) {
  const el = document.getElementById('serviceList');
  if (!el) return;
  if (!items.length) { el.innerHTML = empty(); return; }
  el.innerHTML = items.map(s => `
    <div class="service-item">
      <h4>${esc(s.role)}</h4>
      <div class="meta">${esc(s.organization)} &nbsp;|&nbsp; ${esc(s.duration)}</div>
    </div>`).join('');
}

function renderTalks(items) {
  const el = document.getElementById('talkList');
  if (!el) return;
  if (!items.length) { el.innerHTML = empty(); return; }
  el.innerHTML = items.map(t => `
    <div class="talk-item">
      <h4>${esc(t.title)}</h4>
      <div class="meta">${esc(t.event)} &nbsp;|&nbsp; ${esc(t.location)} &nbsp;|&nbsp; ${esc(t.date)}</div>
    </div>`).join('');
}

function renderContact(p) {
  setText('contactEmail',  p.email);
  setText('contactPhone',  p.phone);
  setText('contactOffice', p.office);
  setText('contactInst',   p.institution);
}

/* ============================================================
   ACTIVE NAV  (IntersectionObserver)
   ============================================================ */
function initNavScroll() {
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navItems.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'))}px 0px -60% 0px` });

  sections.forEach(s => observer.observe(s));
}

/* ============================================================
   UTILS
   ============================================================ */
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function loadLocalContent() {
  try {
    const saved = localStorage.getItem('mindlabContent');
    return saved ? JSON.parse(saved) : null;
  } catch(e) {
    console.warn('Could not load locally saved content:', e);
    return null;
  }
}

function externalUrl(url) {
  const value = String(url || '').trim();
  if (!value || value === '#') return '#';
  if (/^https?:\/\//i.test(value)) return esc(value);
  if (/^https?\/{1,2}:?/i.test(value)) {
    return esc(value.replace(/^https?\/{1,2}:?/i, 'https://'));
  }
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(value)) return esc('https://' + value);
  return esc(value);
}

function empty() {
  return '<p class="empty-state">No items added yet.</p>';
}
