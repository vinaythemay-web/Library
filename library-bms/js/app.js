// ─── Auth helpers ─────────────────────────────────────────────────

async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { window.location.href = 'index.html'; return null; }
  return session;
}

async function getProfile(userId) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  return data;
}

async function logout() {
  await supabase.auth.signOut();
  window.location.href = 'index.html';
}

// ─── Sidebar ──────────────────────────────────────────────────────

async function initSidebar(activePage) {
  const session = await requireAuth();
  if (!session) return null;
  const profile = await getProfile(session.user.id);
  const initials = (profile?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard',     href: 'dashboard.html',  icon: iconDashboard() },
    { id: 'search',    label: 'Browse Books',  href: 'search.html',     icon: iconSearch() },
    { id: 'profile',   label: 'My Profile',    href: 'profile.html',    icon: iconProfile() }
  ];

  if (profile?.role === 'admin') {
    navItems.push({ id: 'lending',   label: 'Lend a Book',   href: 'lending.html',    icon: iconLend() });
    navItems.push({ id: 'returning', label: 'Return a Book', href: 'returning.html',  icon: iconReturn() });
    navItems.push({ id: 'addbook',   label: 'Add New Book',  href: 'add-book.html',   icon: iconAddBook() });
  }

  const navHtml = navItems.map(item => `
    <a href="${item.href}" class="nav-link ${activePage === item.id ? 'active' : ''}">
      ${item.icon} ${item.label}
    </a>`).join('');

  document.getElementById('sidebar').innerHTML = `
    <div class="sidebar-brand">
      <div class="brand-icon">
        <svg width="18" height="18" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      </div>
      <div>
        <div class="brand-name">LibraryMS</div>
        <div class="brand-sub">Management System</div>
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section-label">Menu</div>
      ${navHtml}
    </nav>
    <div class="sidebar-footer">
      <div class="user-chip">
        <div class="user-avatar">${initials}</div>
        <div>
          <div class="user-name">${profile?.name || 'User'}</div>
          <div class="user-role">${profile?.role || 'member'}</div>
        </div>
      </div>
      <button class="btn-logout" onclick="logout()">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Sign out
      </button>
    </div>`;

  // Mobile hamburger & backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'sidebar-backdrop';
  backdrop.onclick = closeMobileSidebar;
  document.body.appendChild(backdrop);

  const hamburger = document.createElement('button');
  hamburger.className = 'hamburger';
  hamburger.title = 'Open menu';
  hamburger.innerHTML = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
  hamburger.onclick = openMobileSidebar;
  document.body.appendChild(hamburger);

  // Close sidebar when any nav link is clicked on mobile
  document.getElementById('sidebar').querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 900) closeMobileSidebar();
    });
  });

  return profile;
}

// ─── Mobile sidebar helpers ───────────────────────────────────────

function openMobileSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.querySelector('.sidebar-backdrop')?.classList.add('open');
}

function closeMobileSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.querySelector('.sidebar-backdrop')?.classList.remove('open');
}

// ─── Icons ────────────────────────────────────────────────────────

function iconDashboard() {
  return `<svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`;
}
function iconSearch() {
  return `<svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
}
function iconLend() {
  return `<svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
}
function iconReturn() {
  return `<svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-5"/></svg>`;
}
function iconAddBook() {
  return `<svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
}
function iconProfile() {
  return `<svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
}

// ─── Utilities ────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysOverdue(dueDateStr) {
  const due = new Date(dueDateStr);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((today - due) / 86400000));
}

function calcFine(dueDateStr) {
  return daysOverdue(dueDateStr) * 5; // ₹5 per day
}

function defaultDueDate(days = 14) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function showToast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3200);
}

function setLoading(btn, loading, text = 'Loading...') {
  btn.disabled = loading;
  btn.textContent = loading ? text : btn.dataset.label;
}

function emptyState(message = 'No records found.') {
  return `<div class="empty-state">
    <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
    <p>${message}</p>
  </div>`;
}

// Genre emoji map
function genreEmoji(genre) {
  const map = { Fiction:'📖', Science:'🔬', History:'🏛️', Technology:'💻', Mathematics:'📐', Literature:'✍️', Arts:'🎨', Sports:'⚽', Health:'🏥', Business:'💼', General:'📚' };
  return map[genre] || '📚';
}

// ─── Custom Modal ──────────────────────────────────────────────────

function customConfirm(title, message, confirmText = 'Confirm', confirmColor = 'danger') {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.style.zIndex = '99999';
    overlay.innerHTML = `
      <div class="modal" style="width:400px;padding:24px;text-align:left">
        <div class="modal-header" style="margin-bottom:12px">
          <div class="modal-title">${title}</div>
          <button class="modal-close" style="font-size:18px;background:none;border:none;cursor:pointer;color:var(--text-muted)">✕</button>
        </div>
        <p style="color:var(--text-muted);font-size:14px;margin-bottom:24px;line-height:1.5">${message}</p>
        <div style="display:flex;gap:12px;justify-content:flex-end">
          <button class="btn btn-secondary cancel-btn">Cancel</button>
          <button class="btn btn-${confirmColor} confirm-btn">${confirmText}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    requestAnimationFrame(() => overlay.classList.add('open'));

    const close = (result) => {
      overlay.classList.remove('open');
      setTimeout(() => {
        overlay.remove();
        resolve(result);
      }, 200);
    };

    overlay.querySelector('.modal-close').onclick = () => close(false);
    overlay.querySelector('.cancel-btn').onclick = () => close(false);
    overlay.querySelector('.confirm-btn').onclick = () => close(true);
  });
}
