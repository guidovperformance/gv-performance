// Losstaand van site-shared.js (dat 'use client' is) zodat server components
// (zoals app/blog/page.js en app/blog/[slug]/page.js, die fs gebruiken om
// markdown te lezen) deze CSS-string direct kunnen gebruiken. Een 'use
// client'-bestand kan vanuit een server component alleen als <Component/>
// gerenderd worden — een plain export zoals SITE_CSS lukt dan niet (geeft
// een kapotte placeholder i.p.v. de echte tekst). site-shared.js re-exporteert
// dit gewoon, dus bestaande imports daar blijven werken.
export const SITE_CSS = `
  :root {
    --orange: #D4A857;
    --orange-dim: rgba(212,168,87,0.15);
    --dark:  #0E0E10;
    --dark2: #161412;
    --dark3: #1E1B18;
    --dark4: #282420;
    --warm-border: #3A352F;
    --text:  #F0EEE8;
    --muted: #888;
    --muted2: #555;
    --display: var(--font-oswald), Impact, sans-serif;
    --body:    var(--font-barlow), sans-serif;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: var(--dark);
    color: var(--text);
    font-family: var(--body);
    font-size: 17px;
    line-height: 1.65;
    overflow-x: hidden;
    overflow-y: visible;
    padding-top: 78px; /* compenseert de nu altijd-vaste (position:fixed) nav */
  }

  /* position:fixed i.p.v. sticky — sticky bleek onbetrouwbaar in sommige browsers */
  nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 22px 60px; border-bottom: 1px solid rgba(212,168,87,0.12);
    background: var(--dark); position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  }
  .nav-logo { display:flex; align-items:center; gap:14px; text-decoration:none; flex-shrink:0; }
  .nav-logo-text { font-family:var(--display); font-size:22px; letter-spacing:3px; color:var(--text); line-height:1; }
  .nav-logo-sub  { font-family:var(--body); font-size:10px; letter-spacing:3px; color:var(--orange); margin-top:2px; }
  .nav-cta {
    background:var(--orange); color:#000 !important;
    padding:10px 22px; font-weight:700; letter-spacing:1px !important;
    font-family:var(--body); font-size:13px; text-transform:uppercase;
    text-decoration:none; border-radius:4px; transition: background .2s;
  }
  .nav-cta:hover { background:var(--gold-bright, #E8C77E); }
  @media (max-width: 480px) { .nav-cta-desktop { display: none; } }

  /* GRADIENT CIRCLE ICON NAV — rechtstreeks in de balk, geen hamburger meer */
  .nav-icons {
    display: flex; align-items: center; gap: 10px;
    overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none;
    -webkit-overflow-scrolling: touch;
  }
  .nav-icons::-webkit-scrollbar { display: none; }
  .nav-icon-item {
    position: relative; width: 44px; height: 44px; border-radius: 50%;
    background: var(--dark2); border: 1px solid rgba(212,168,87,0.2);
    display: flex; align-items: center; justify-content: center;
    text-decoration: none; overflow: hidden; flex-shrink: 0;
    transition: width .4s cubic-bezier(0.16,1,0.3,1);
  }
  .nav-icon-item:hover, .nav-icon-item:focus-visible {
    width: 148px;
  }
  .nav-icon-item-bg {
    position: absolute; inset: 0; border-radius: 50%;
    background: linear-gradient(135deg, var(--gold-bright, #E8C77E), var(--orange));
    opacity: 0; transition: opacity .3s ease, border-radius .4s ease;
  }
  .nav-icon-item:hover .nav-icon-item-bg,
  .nav-icon-item:focus-visible .nav-icon-item-bg { opacity: 1; border-radius: 22px; }
  .nav-icon-item-icon {
    position: relative; z-index: 1; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    color: var(--orange); transition: transform .3s ease, opacity .3s ease;
  }
  .nav-icon-item-icon svg { width: 17px; height: 17px; }
  .nav-icon-item:hover .nav-icon-item-icon,
  .nav-icon-item:focus-visible .nav-icon-item-icon { transform: scale(0); opacity: 0; }
  .nav-icon-item-label {
    position: absolute; color: #000; font-family: var(--body); font-weight: 700;
    font-size: 11px; letter-spacing: 1px; text-transform: uppercase;
    opacity: 0; transform: scale(0.6); white-space: nowrap; z-index: 2;
    transition: opacity .3s ease .08s, transform .3s ease .08s;
  }
  .nav-icon-item:hover .nav-icon-item-label,
  .nav-icon-item:focus-visible .nav-icon-item-label { opacity: 1; transform: scale(1); }
  @media (prefers-reduced-motion: reduce) {
    .nav-icon-item, .nav-icon-item-bg, .nav-icon-item-icon, .nav-icon-item-label { transition: none; }
  }

  .nav-mobile-cta {
    margin-top: 8px; background: var(--orange); color: #000 !important;
    text-align: center; border-radius: 10px; font-family: var(--body) !important;
    font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
    text-decoration: none; padding: 16px !important; font-size: 14px !important;
    display: block; flex-shrink: 0;
  }
  section { padding:100px 60px; }
  .section-label {
    font-size:10px; letter-spacing:4px; color:var(--orange); text-transform:uppercase;
    margin-bottom:14px; display:flex; align-items:center; gap:10px;
  }
  .section-label::before { content:''; display:block; width:24px; height:2px; background:var(--orange); }
  .section-title {
    font-family:var(--display); font-size:clamp(42px,5vw,68px);
    letter-spacing:0px; line-height:0.95; margin-bottom:24px;
    overflow-wrap:break-word; word-break:break-word;
  }
  .section-intro { font-size:16px; color:#aaa; line-height:1.8; max-width:620px; margin-bottom:24px; }

  .page-hero {
    padding: 140px 60px 80px; text-align:center; position:relative; overflow:hidden;
  }
  .page-hero::before {
    content:''; position:absolute; inset:0;
    background:radial-gradient(ellipse at 50% 0%, rgba(212,168,87,0.08) 0%, transparent 60%);
    pointer-events:none;
  }
  .page-hero-eyebrow {
    font-size:11px; letter-spacing:4px; color:var(--orange);
    text-transform:uppercase; margin-bottom:20px;
    display:flex; align-items:center; justify-content:center; gap:12px;
  }
  .page-hero-eyebrow::before, .page-hero-eyebrow::after { content:''; display:block; width:32px; height:2px; background:var(--orange); }
  .page-hero-title {
    font-family:var(--display); font-size:clamp(48px,6vw,84px);
    line-height:0.95; letter-spacing:0px; color:var(--text); margin-bottom:20px;
    overflow-wrap:break-word; word-break:break-word;
  }
  .page-hero-title span { color:var(--orange); }
  .page-hero-desc { font-size:16px; color:#aaa; max-width:560px; margin:0 auto; line-height:1.8; }

  /* ── FOTOGRAFIE-GRADE: donker, contrastrijk, consistent over alle bronnen ── */
  .photo-grade { filter: contrast(1.12) brightness(0.93) saturate(0.9); }

  .btn-primary {
    background:var(--orange); color:#000; font-family:var(--body);
    font-weight:700; font-size:13px; letter-spacing:2px; text-transform:uppercase;
    padding:16px 36px; text-decoration:none; display:inline-block;
    transition: background .2s, transform .15s;
    border: none; cursor: pointer;
  }
  .btn-primary:hover { background:#C99540; transform:translateY(-1px); }

  .btn-secondary {
    border:1px solid var(--muted2); color:var(--text); font-family:var(--body);
    font-size:13px; letter-spacing:2px; text-transform:uppercase;
    padding:16px 36px; text-decoration:none; display:inline-block;
    transition:border-color .2s, color .2s; cursor: pointer;
  }
  .btn-secondary:hover { border-color:var(--text); }

  footer {
    background:var(--dark); border-top:1px solid rgba(212,168,87,0.1);
    padding:40px 60px; display:flex; align-items:center;
    justify-content:space-between; flex-wrap:wrap; gap:16px;
  }
  .footer-copy  { font-size:12px; color:var(--muted2); letter-spacing:1px; }
  .footer-links { display:flex; gap:24px; }
  .footer-links a { font-size:11px; letter-spacing:2px; text-transform:uppercase; color:var(--muted2); text-decoration:none; transition:color .2s; }
  .footer-links a:hover { color:var(--orange); }

  .fade-in {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: opacity, transform;
  }
  .fade-in.visible { opacity: 1; transform: translateY(0); }
  .fade-in.delay-1 { transition-delay: 0.1s; }
  .fade-in.delay-2 { transition-delay: 0.2s; }
  .fade-in.delay-3 { transition-delay: 0.3s; }

  .page-hero-eyebrow, .page-hero-title, .page-hero-desc {
    opacity: 0; transform: translateY(20px);
    animation: heroIn 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .page-hero-eyebrow { animation-delay: 0.05s; }
  .page-hero-title   { animation-delay: 0.15s; }
  .page-hero-desc    { animation-delay: 0.25s; }
  @keyframes heroIn { to { opacity: 1; transform: translateY(0); } }

  @media (prefers-reduced-motion: reduce) {
    .fade-in, .page-hero-eyebrow, .page-hero-title, .page-hero-desc {
      animation: none !important; transition: none !important;
      opacity: 1 !important; transform: none !important;
    }
  }

  .float-btn {
    position: fixed; bottom: 32px; right: 32px;
    background: var(--orange); color: #000; font-family: var(--body);
    font-weight: 700; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;
    padding: 14px 24px; text-decoration: none; z-index: 999;
    box-shadow: 0 4px 24px rgba(212,168,87,0.4);
    transition: transform .2s, box-shadow .2s, background .2s, opacity .3s ease;
    display: flex; align-items: center; gap: 8px;
  }
  .float-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(212,168,87,0.55); background: #C99540; }
  .float-btn-pulse {
    width: 8px; height: 8px; background: #000; border-radius: 50%; flex-shrink: 0;
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.7); } }

  @media (max-width: 768px) {
    body { padding-top: 112px; } /* mobiele nav is 2 regels hoog */
    nav { padding: 14px 16px; flex-wrap: wrap; row-gap: 10px; }
    .nav-logo { gap: 10px; }
    .nav-logo svg { width: 28px; height: 26px; }
    .nav-logo-text { font-size: 17px; letter-spacing: 1.5px; }
    .nav-logo-sub { display: none; }
    .nav-actions { width: 100%; justify-content: flex-start !important; }
    .nav-icon-item { width: 40px; height: 40px; }
    .nav-icon-item:hover, .nav-icon-item:focus-visible { width: 40px; }
    section { padding:60px 24px; }
    .page-hero { padding:110px 24px 60px; }
    footer { padding:30px 24px; flex-direction:column; align-items:flex-start; }
    .footer-links { flex-wrap:wrap; gap:14px 20px; }
    .float-btn { bottom:20px; right:16px; left:16px; justify-content:center; }
  }

  @media (max-width: 400px) {
    .section-title { font-size:clamp(28px,7.5vw,68px); }
    .page-hero-title { font-size:clamp(28px,7.5vw,84px); }
  }

  /* ── TESTIMONIAL CARD (data-gedreven) ── */
  .testi-card {
    background:var(--dark2); padding:36px 32px;
    border-left:3px solid var(--orange-dim);
    transition: border-color .25s, transform .25s;
    display:flex; flex-direction:column; justify-content:space-between; gap:24px;
  }
  .testi-card:hover { border-color:var(--warm-border); transform:translateY(-4px); }
  .testi-quote { font-size:15px; color:#ccc; line-height:1.7; }
  .testi-footer { display:flex; align-items:center; gap:14px; }
  .testi-avatar { width:48px; height:48px; border-radius:50%; overflow:hidden; flex-shrink:0; background:var(--dark3); }
  .testi-avatar img { width:100%; height:100%; object-fit:cover; display:block; }
  .testi-name { font-family:var(--display); font-size:15px; letter-spacing:1px; color:var(--text); }
  .testi-role { font-size:12px; color:var(--muted); margin-top:2px; }
  .testi-metric { font-size:11px; color:var(--orange); letter-spacing:1px; margin-top:4px; }
  .testi-readmore { display:inline-block; font-size:12px; color:var(--orange); text-decoration:none; border-bottom:1px solid var(--orange); padding-bottom:2px; }
  .testi-readmore:hover { color:var(--text); border-color:var(--text); }

  /* ── EMPTY STATE ── */
  .empty-state {
    display:flex; align-items:center; justify-content:center; flex-direction:column; gap:10px;
    padding:48px 24px; grid-column:1/-1;
  }
  .empty-state-icon { font-size:28px; opacity:0.3; }
  .empty-state-text { font-size:13px; color:var(--muted2); letter-spacing:1px; font-style:italic; text-align:center; }

  /* ── COOKIE CONSENT ── */
  .cookie-banner {
    position:fixed; left:0; right:0; bottom:0; z-index:1001;
    background:var(--dark2); border-top:1px solid rgba(212,168,87,0.25);
    padding:18px 24px; display:flex; align-items:center; justify-content:space-between;
    gap:20px; flex-wrap:wrap;
  }
  .cookie-banner-text { font-size:13px; color:var(--muted); line-height:1.6; max-width:640px; }
  .cookie-banner-text a { color:var(--orange); text-decoration:underline; }
  .cookie-banner-actions { display:flex; gap:10px; flex-shrink:0; }
  .cookie-banner-decline {
    background:none; border:1px solid var(--muted2); color:var(--text);
    font-family:var(--body); font-size:12px; letter-spacing:1px; text-transform:uppercase;
    padding:10px 18px; cursor:pointer;
  }
  .cookie-banner-accept {
    background:var(--orange); border:none; color:#000;
    font-family:var(--body); font-weight:700; font-size:12px; letter-spacing:1px; text-transform:uppercase;
    padding:10px 18px; cursor:pointer;
  }
  @media (max-width: 600px) {
    .cookie-banner { padding:16px; flex-direction:column; align-items:stretch; text-align:center; }
    .cookie-banner-actions { justify-content:center; }
  }

  /* ── LEAD CAPTURE (gratis krachttest) ── */
  .lead-form { display:flex; flex-direction:column; gap:14px; }
  .lead-form-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .lead-form-row > input, .lead-form-row-compact > input { min-width:0; }
  .lead-form-row-compact { display:flex; flex-direction:column; gap:10px; }
  .lead-error { color:#f87171; font-size:13px; padding:10px 14px; background:rgba(248,113,113,0.1); border:1px solid rgba(248,113,113,0.3); }
  .lead-success { text-align:center; padding:24px 0; }
  .lead-success-title { font-family:var(--display); font-size:22px; letter-spacing:1px; color:var(--text); margin-bottom:8px; }
  .lead-success-text { font-size:14px; color:var(--muted); margin-bottom:20px; }

  .lead-modal-backdrop {
    position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:1000;
    display:flex; align-items:center; justify-content:center; padding:24px;
  }
  .lead-modal {
    background:var(--dark2); border:1px solid rgba(212,168,87,0.25); max-width:420px; width:100%;
    padding:36px 32px; position:relative;
  }
  .lead-modal-close {
    position:absolute; top:14px; right:14px; background:none; border:none; color:var(--muted);
    font-size:16px; cursor:pointer; padding:6px;
  }
  .lead-modal-close:hover { color:var(--text); }
  .lead-modal-eyebrow { font-size:10px; letter-spacing:3px; color:var(--orange); text-transform:uppercase; margin-bottom:10px; }
  .lead-modal-title { font-family:var(--display); font-size:24px; letter-spacing:1px; color:var(--text); margin-bottom:12px; line-height:1.1; }
  .lead-modal-text { font-size:14px; color:var(--muted); line-height:1.6; margin-bottom:24px; }

  @media (max-width: 480px) {
    .lead-modal { padding:28px 22px; }
  }
`
