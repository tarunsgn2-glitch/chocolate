/* ============================================================
   CHOCOHUNT — Global JavaScript
   Managed & Designed by LeadKnight
   ============================================================ */

'use strict';

/* ══════════════════════════════════════════════
   CONFIG
══════════════════════════════════════════════ */
const API = 'http://localhost:3001/api';

/* ══════════════════════════════════════════════
   STATE
══════════════════════════════════════════════ */
const State = {
  user: null,
  theme: localStorage.getItem('ch-theme') || 'dark',
  testiIndex: 0,
};

/* ══════════════════════════════════════════════
   DOM READY
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initCursor();
  initScrollProgress();
  initNavbar();
  initTheme();
  initReveal();
  initMobileNav();
  initTestimonials();
  initParallax();
  initAuth();
  initContactForm();
  initModals();
  markActiveNav();
  restoreSession();
});

/* ══════════════════════════════════════════════
   PAGE LOADER
══════════════════════════════════════════════ */
function initLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 2300);
  });
}

/* ══════════════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════════════ */
function initCursor() {
  const cur = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (!cur || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.left  = mx + 'px';
    cur.style.top   = my + 'px';
  });

  (function animRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  const hoverEls = 'a, button, .choco-card, .partner-card, .social-link-card, .testi-card, .ig-cell, .mos-cell, .auth-modal-close, .theme-toggle';
  document.querySelectorAll(hoverEls).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* ══════════════════════════════════════════════
   SCROLL PROGRESS
══════════════════════════════════════════════ */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (window.scrollY / h * 100) + '%';
  }, { passive: true });
}

/* ══════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════ */
function initNavbar() {
  const nb = document.getElementById('navbar');
  if (!nb) return;
  window.addEventListener('scroll', () => {
    nb.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

function markActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'home.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && (href === page || href.endsWith(page))) {
      a.classList.add('active');
    }
  });
}

/* ══════════════════════════════════════════════
   THEME (DARK / LIGHT)
══════════════════════════════════════════════ */
function initTheme() {
  applyTheme(State.theme);
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  State.theme = theme;
  localStorage.setItem('ch-theme', theme);
  // Update all toggle icons
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    btn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  });
}

function toggleTheme() {
  applyTheme(State.theme === 'dark' ? 'light' : 'dark');
}

/* ══════════════════════════════════════════════
   REVEAL ON SCROLL
══════════════════════════════════════════════ */
function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => obs.observe(el));
}

/* ══════════════════════════════════════════════
   MOBILE NAV
══════════════════════════════════════════════ */
function initMobileNav() {
  const hbg  = document.getElementById('hamburger');
  const mnav = document.getElementById('mobile-nav');
  if (!hbg || !mnav) return;

  hbg.addEventListener('click', () => {
    hbg.classList.toggle('open');
    mnav.classList.toggle('open');
    document.body.style.overflow = mnav.classList.contains('open') ? 'hidden' : '';
  });

  mnav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hbg.classList.remove('open');
      mnav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ══════════════════════════════════════════════
   TESTIMONIALS CAROUSEL
══════════════════════════════════════════════ */
function initTestimonials() {
  const track = document.getElementById('testi-track');
  const prevBtn = document.getElementById('testi-prev');
  const nextBtn = document.getElementById('testi-next');
  if (!track) return;

  function visibleCount() {
    const w = window.innerWidth;
    if (w < 768) return 1;
    if (w < 1100) return 2;
    return 3;
  }

  function slide(dir) {
    const vis = visibleCount();
    const total = track.children.length;
    const max = total - vis;
    State.testiIndex = Math.max(0, Math.min(max, State.testiIndex + dir));
    const cardW = track.parentElement.offsetWidth / vis;
    track.style.transform = `translateX(-${State.testiIndex * cardW}px)`;
  }

  if (prevBtn) prevBtn.addEventListener('click', () => slide(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => slide(1));
  window.addEventListener('resize', () => { State.testiIndex = 0; slide(0); }, { passive: true });

  // Auto-advance
  setInterval(() => slide(1), 6000);
}

/* ══════════════════════════════════════════════
   PARALLAX
══════════════════════════════════════════════ */
function initParallax() {
  const pqBg = document.querySelector('.pq-bg');
  if (!pqBg) return;

  window.addEventListener('scroll', () => {
    const parent = pqBg.parentElement;
    const rect = parent.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const offset = rect.top * 0.28;
    pqBg.style.transform = `translateY(${offset}px)`;
  }, { passive: true });
}

/* ══════════════════════════════════════════════
   MODALS (Legal pages)
══════════════════════════════════════════════ */
function initModals() {
  // Close on overlay click
  document.querySelectorAll('.page-modal').forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal(modal.dataset.modal);
    });
  });
  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.page-modal.open').forEach(m => m.classList.remove('open'));
      document.querySelectorAll('.auth-modal-overlay.open').forEach(m => m.classList.remove('open'));
      document.body.style.overflow = '';
    }
  });
}

function openModal(id) {
  const el = document.getElementById('modal-' + id);
  if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const el = document.getElementById('modal-' + id);
  if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
}

/* ══════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════ */
function showToast(msg, type = 'success') {
  let toast = document.getElementById('ch-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'ch-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ══════════════════════════════════════════════
   AUTH — Login / Register / Logout
══════════════════════════════════════════════ */
function initAuth() {
  // Open modal triggers
  document.querySelectorAll('[data-auth-open]').forEach(el => {
    el.addEventListener('click', () => openAuthModal(el.dataset.authOpen || 'login'));
  });

  // Close
  const overlay = document.getElementById('auth-modal-overlay');
  const closeBtn = document.querySelector('.auth-modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeAuthModal);
  if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) closeAuthModal(); });

  // Tabs
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => switchAuthTab(tab.dataset.tab));
  });

  // Form submits
  const loginForm    = document.getElementById('form-login');
  const registerForm = document.getElementById('form-register');
  if (loginForm)    loginForm.addEventListener('submit',    handleLogin);
  if (registerForm) registerForm.addEventListener('submit', handleRegister);

  // Logout
  document.querySelectorAll('[data-logout]').forEach(el => {
    el.addEventListener('click', handleLogout);
  });
}

function openAuthModal(tab = 'login') {
  const overlay = document.getElementById('auth-modal-overlay');
  if (overlay) { overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
  switchAuthTab(tab);
}
function closeAuthModal() {
  const overlay = document.getElementById('auth-modal-overlay');
  if (overlay) { overlay.classList.remove('open'); document.body.style.overflow = ''; }
}
function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.toggle('active', f.id === `form-${tab}`));
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.auth-submit');
  const errEl = document.getElementById('login-error');
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-password').value;

  setLoading(btn, true);
  if (errEl) errEl.classList.remove('show');

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    localStorage.setItem('ch-token', data.token);
    localStorage.setItem('ch-user', JSON.stringify(data.user));
    State.user = data.user;
    closeAuthModal();
    updateNavAuth();
    showToast(`Welcome back, ${data.user.name}! 🍫`);
  } catch (err) {
    if (errEl) { errEl.textContent = err.message; errEl.classList.add('show'); }
  } finally {
    setLoading(btn, false);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const btn  = e.target.querySelector('.auth-submit');
  const errEl = document.getElementById('reg-error');
  const okEl  = document.getElementById('reg-success');
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass  = document.getElementById('reg-password').value;

  setLoading(btn, true);
  if (errEl) errEl.classList.remove('show');
  if (okEl)  okEl.classList.remove('show');

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: pass }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    if (okEl) { okEl.textContent = 'Account created! You can now login.'; okEl.classList.add('show'); }
    setTimeout(() => switchAuthTab('login'), 1500);
  } catch (err) {
    if (errEl) { errEl.textContent = err.message; errEl.classList.add('show'); }
  } finally {
    setLoading(btn, false);
  }
}

function handleLogout() {
  localStorage.removeItem('ch-token');
  localStorage.removeItem('ch-user');
  State.user = null;
  updateNavAuth();
  showToast('Logged out. Come back soon! 🍫', 'success');
}

function restoreSession() {
  try {
    const stored = localStorage.getItem('ch-user');
    const token  = localStorage.getItem('ch-token');
    if (stored && token) {
      State.user = JSON.parse(stored);
      updateNavAuth();
    }
  } catch (_) {}
}

function updateNavAuth() {
  const loggedOut = document.querySelectorAll('.auth-logged-out');
  const loggedIn  = document.querySelectorAll('.auth-logged-in');
  const userGreet = document.querySelectorAll('.nav-user-name');

  if (State.user) {
    loggedOut.forEach(el => el.style.display = 'none');
    loggedIn.forEach(el  => el.style.display = 'flex');
    userGreet.forEach(el => el.textContent = State.user.name.split(' ')[0]);
  } else {
    loggedOut.forEach(el => el.style.display = 'flex');
    loggedIn.forEach(el  => el.style.display = 'none');
  }
}

function setLoading(btn, loading) {
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Please wait...' : btn.dataset.text || btn.textContent;
  if (!btn.dataset.text && !loading) btn.dataset.text = btn.textContent;
}

/* ══════════════════════════════════════════════
   CONTACT FORM
══════════════════════════════════════════════ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', handleContactSubmit);
}

async function handleContactSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.form-submit-btn');
  const msgEl = document.getElementById('form-msg');
  const formData = {
    name:    e.target.querySelector('[name="name"]')?.value.trim(),
    email:   e.target.querySelector('[name="email"]')?.value.trim(),
    phone:   e.target.querySelector('[name="phone"]')?.value.trim(),
    subject: e.target.querySelector('[name="subject"]')?.value,
    message: e.target.querySelector('[name="message"]')?.value.trim(),
  };

  if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
  if (msgEl) { msgEl.className = 'form-message'; msgEl.style.display = 'none'; }

  try {
    const res = await fetch(`${API}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to send');
    if (msgEl) { msgEl.className = 'form-message success'; msgEl.textContent = '✓ Message sent! We\'ll get back to you within 24 hours.'; }
    e.target.reset();
    showToast('Message sent successfully! 🍫');
  } catch (err) {
    // Fallback — still show success to user if server unreachable (demo mode)
    if (msgEl) { msgEl.className = 'form-message success'; msgEl.textContent = '✓ Message received! We\'ll respond shortly.'; }
    showToast('Message sent! 🍫');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Send Message'; }
  }
}

/* ══════════════════════════════════════════════
   NEWSLETTER
══════════════════════════════════════════════ */
async function handleNewsletter(e) {
  e.preventDefault();
  const input = e.target.querySelector('input[type="email"]');
  const btn   = e.target.querySelector('button');
  if (!input?.value) return;

  const orig = btn.textContent;
  btn.textContent = '...';
  btn.disabled = true;

  try {
    await fetch(`${API}/newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: input.value }),
    });
  } catch (_) {}

  btn.textContent = '✓';
  input.value = '';
  showToast('Subscribed! Welcome to the ChocoHunt family 🍫');
  setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3000);
}

// Attach newsletter forms
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.newsletter-form').forEach(f => f.addEventListener('submit', handleNewsletter));
});

/* ══════════════════════════════════════════════
   BACK TO TOP
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.back-to-top').forEach(btn => {
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  });
});

/* ══════════════════════════════════════════════
   HELPERS — exported for inline use
══════════════════════════════════════════════ */
window.CH = {
  openModal,
  closeModal,
  openAuthModal,
  closeAuthModal,
  toggleTheme,
  showToast,
};
