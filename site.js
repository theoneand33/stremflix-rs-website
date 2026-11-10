// Stremflix-rs landing page: reveals, the hero card, and the player section.
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('reveals');

// Reveal once on entry; the timeout is the safety net if the observer never fires.
const reveals = document.querySelectorAll('[data-reveal]');
const revealIO = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target); }
}, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
reveals.forEach((el) => revealIO.observe(el));
addEventListener('load', () => setTimeout(() => reveals.forEach((el) => {
  const r = el.getBoundingClientRect();
  if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in');
}), 2500));

// Hero: the card shrinks to a stub while the Home screen opens up behind it.
const hero = document.querySelector('.hero');
const moving = [hero.querySelector('.hero__card'), hero.querySelector('.hero__scrim')];
if (!still && !CSS.supports('animation-timeline: view()')) {
  let queued = false;
  const update = () => {
    queued = false;
    const r = hero.getBoundingClientRect();
    const span = r.height - innerHeight;
    // the card finishes shrinking at 70% of the hold; the rest shows the open picture
    const p = span > 0 ? Math.min(1, Math.max(0, -r.top / (span * 0.7))) : 0;
    // set on the two users of --p, not the stage, so the card's text isn't restyled each frame
    for (const el of moving) el.style.setProperty('--p', p.toFixed(3));
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  update();
}

// The player section: I (or the button) shows the stats overlay, as in the app.
const section = document.querySelector('.play');
const [plain, stats] = section.querySelectorAll('.play__shot img');
const statsBtn = section.querySelector('[data-stats]');
const toggleStats = () => {
  const on = stats.hidden;
  stats.hidden = !on;
  plain.hidden = on;
  statsBtn.setAttribute('aria-pressed', String(on));
};
statsBtn.addEventListener('click', toggleStats);
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() !== 'i' || e.metaKey || e.ctrlKey || e.altKey) return;
  // only while the visitor is at the player
  if (section.matches(':hover') || section.contains(document.activeElement)) toggleStats();
});

// Source tabs: the same player, reached three ways.
section.querySelectorAll('[data-src]').forEach((tab) => tab.addEventListener('click', () => {
  section.querySelectorAll('[data-src]').forEach((t) => t.setAttribute('aria-pressed', String(t === tab)));
  section.querySelectorAll('[data-panel]').forEach((p) => { p.hidden = p.dataset.panel !== tab.dataset.src; });
}));
