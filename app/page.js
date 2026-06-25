'use client'
import React from 'react'
import Image from 'next/image'
import { CascadeText, SiteNav, SiteFooter, TestimonialCard, EmptyState, usePublishedRows, CalendlyButton } from './site-shared'

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "GV Performance",
  "description": "1-op-1 personal coaching voor tactical athletes, topsporters en gedreven amateurs in Den Haag en online. Periodisering, kracht, conditie en mentale coaching.",
  "url": "https://www.gvperformance.nl",
  "logo": "https://www.gvperformance.nl/icon-512.png",
  "image": "https://www.gvperformance.nl/hero.jpg",
  "founder": {
    "@type": "Person",
    "name": "Guido Vols",
    "jobTitle": "Personal Coach & Tactical Athlete Specialist"
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Den Haag",
    "addressRegion": "Zuid-Holland",
    "addressCountry": "NL"
  },
  "areaServed": [
    { "@type": "City", "name": "Den Haag" },
    { "@type": "Country", "name": "Nederland" }
  ],
  "serviceType": [
    "Personal Coaching",
    "Tactical Athlete Training",
    "Topsport Begeleiding",
    "Loopcoaching",
    "Hyrox Voorbereiding"
  ],
  "sameAs": [
    "https://www.instagram.com/gvperformance",
    "https://www.linkedin.com/in/guidovols"
  ]
}

const CSS = `
  :root {
    --orange: #D4A857;
    --orange-dim: rgba(212,168,87,0.15);
    --dark:  #0A0A0A;
    --dark2: #111;
    --dark3: #181818;
    --dark4: #222;
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
    padding-top: 78px; /* compenseert de nu altijd-vaste (position:fixed) nav */
  }

  /* ── NAV ── */
  /* position:fixed i.p.v. sticky — sticky bleek onbetrouwbaar in sommige browsers */
  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22px 60px;
    border-bottom: 1px solid rgba(212,168,87,0.12);
    background: #0A0A0A;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
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
  .nav-cta:hover { background:#C99540; }
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
  .nav-icon-item:hover, .nav-icon-item:focus-visible { width: 148px; }
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
  /* ── HERO ── */
  .hero {
    min-height:92vh; display:grid; grid-template-columns:1fr 1fr;
    position:relative; overflow:hidden;
  }
  .hero::before {
    content:''; position:absolute; inset:0;
    background:radial-gradient(ellipse at 20% 50%, rgba(212,168,87,0.07) 0%, transparent 60%);
    pointer-events:none;
  }
  .hero-left {
    display:flex; flex-direction:column; justify-content:center;
    padding:80px 60px; position:relative; z-index:1;
  }
  .hero-eyebrow {
    font-size:11px; letter-spacing:4px; color:var(--orange);
    text-transform:uppercase; margin-bottom:20px;
    display:flex; align-items:center; gap:12px;
  }
  .hero-eyebrow::before { content:''; display:block; width:32px; height:2px; background:var(--orange); }
  .hero-headline {
    font-family:var(--display); font-size:clamp(64px,7vw,96px);
    line-height:0.92; letter-spacing:0px; color:var(--text); margin-bottom:8px;
    overflow-wrap:break-word; word-break:break-word;
  }
  .hero-headline span { color:var(--orange); }
  .hero-tagline {
    font-family:var(--display); font-size:clamp(28px,3vw,42px);
    letter-spacing:0px; color:var(--muted); margin-bottom:32px;
    overflow-wrap:break-word; word-break:break-word;
  }
  .hero-proof { font-size:14px; color:var(--text); font-weight:700; margin-bottom:18px; }
  .hero-desc { font-size:16px; color:#aaa; max-width:420px; line-height:1.7; margin-bottom:44px; }
  .hero-buttons { display:flex; gap:16px; flex-wrap:wrap; }

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
    transition:border-color .2s, color .2s;
  }
  .btn-secondary:hover { border-color:var(--text); }

  .hero-right { position:relative; overflow:hidden; }
  .hero-photo {
    width:100%; height:100%; background:var(--dark3);
    display:flex; align-items:center; justify-content:center;
    flex-direction:column; gap:12px; border-left:1px solid rgba(212,168,87,0.1);
  }
  .hero-photo-label { font-size:11px; letter-spacing:2px; color:var(--muted2); text-transform:uppercase; }
  .hero-photo-hint  { font-family:var(--display); font-size:18px; letter-spacing:2px; color:var(--muted); }
  .hero-photo-icon  {
    width:56px; height:56px; border:1px solid var(--muted2);
    display:flex; align-items:center; justify-content:center;
    font-size:24px; margin-bottom:8px;
  }

  /* ── RIBBON ── */
  .ribbon {
    background:var(--dark2);
    border-top:1px solid rgba(212,168,87,0.1);
    border-bottom:1px solid rgba(212,168,87,0.1);
    padding:18px 60px;
    display:flex; align-items:center; justify-content:space-between;
    flex-wrap:wrap; gap:16px;
  }
  .ribbon-item { display:flex; align-items:center; gap:10px; }
  .ribbon-dot  { width:6px; height:6px; background:var(--orange); flex-shrink:0; }
  .ribbon-text { font-size:12px; letter-spacing:2px; color:var(--muted); text-transform:uppercase; }

  /* ── SECTIONS ── */
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

  /* ── OVER GUIDO ── */
  .about { background:var(--dark2); display:grid; grid-template-columns:1fr 1fr; gap:80px; align-items:center; }
  .about-photo {
    background:var(--dark3); aspect-ratio:3/4;
    display:flex; align-items:center; justify-content:center;
    flex-direction:column; gap:10px; border:1px dashed var(--muted2);
  }
  .about-photo-label { font-size:11px; letter-spacing:2px; color:var(--muted2); text-transform:uppercase; }
  .about-quote {
    font-family:var(--display); font-size:22px; letter-spacing:2px;
    color:var(--orange); line-height:1.2; margin-bottom:28px;
    border-left:3px solid var(--orange); padding-left:20px;
  }
  .about-text { font-size:16px; color:#aaa; line-height:1.8; margin-bottom:36px; }
  .about-text strong { color:var(--text); font-weight:700; }
  .milestones { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:36px; }
  .milestone {
    background:var(--dark3); padding:18px 20px;
    border-left:3px solid var(--orange-dim); transition:border-color .2s;
  }
  .milestone:hover { border-color:var(--orange); }
  .milestone-year { font-family:var(--display); font-size:13px; letter-spacing:2px; color:var(--orange); margin-bottom:4px; }
  .milestone-text { font-size:13px; color:var(--muted); line-height:1.5; }

  /* ── DIENSTEN ── A: verbeterde hover met lift + oranje rand ── */
  .diensten { background:var(--dark); }
  .diensten-grid {
    display:grid; grid-template-columns:repeat(3,1fr);
    gap:2px; margin-top:60px; border:2px solid var(--dark3);
  }
  .dienst-card {
    background:var(--dark2);
    border:1px solid transparent;
    transition: border-color .25s, background .25s, transform .25s, box-shadow .25s;
    cursor:default;
    display:flex; flex-direction:column;
  }
  .dienst-card:hover {
    background:var(--dark3);
    border-color: var(--orange);
    transform: translateY(-6px);
    box-shadow: 0 12px 32px rgba(212,168,87,0.12);
    position: relative;
    z-index: 2;
  }
  .dienst-photo {
    aspect-ratio: 4/3; overflow:hidden; background:var(--dark3); position:relative;
    border-bottom: 1px solid var(--dark4);
  }
  .dienst-photo img {
    width:100%; height:100%; object-fit:cover; display:block;
    transition: transform .5s cubic-bezier(0.16,1,0.3,1);
  }
  .dienst-card:hover .dienst-photo img { transform: scale(1.06); }
  .dienst-body  { padding:32px 32px 36px; }
  .dienst-icon  { font-size:28px; margin-bottom:16px; }
  .dienst-title { font-family:var(--display); font-size:24px; letter-spacing:2px; color:var(--text); margin-bottom:10px; line-height:1; }
  .dienst-desc  { font-size:14px; color:var(--muted); line-height:1.6; }
  .dienst-tag   {
    display:inline-block; margin-top:14px; font-size:10px; letter-spacing:2px;
    color:var(--orange); text-transform:uppercase; border:1px solid rgba(212,168,87,0.3); padding:4px 10px;
  }
  .ook-voor {
    display:flex; align-items:center; gap:14px; flex-wrap:wrap;
    margin-top:28px; padding-top:24px; border-top:1px solid var(--dark3);
  }
  .ook-voor-label {
    font-size:11px; letter-spacing:2px; color:var(--muted); text-transform:uppercase; flex-shrink:0;
  }
  .ook-voor-pill {
    font-size:12px; letter-spacing:1px; color:var(--text); text-decoration:none;
    border:1px solid rgba(255,255,255,0.15); padding:6px 14px; border-radius:20px;
    transition: border-color .2s, color .2s;
  }
  .ook-voor-pill:hover { border-color:var(--orange); color:var(--orange); }

  /* ── HOE HET WERKT ── */
  .process { background:var(--dark2); text-align:center; }
  .process-steps { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; margin-top:60px; position:relative; }
  .process-step { padding:48px 32px; background:var(--dark3); position:relative; }
  .step-number { font-family:var(--display); font-size:80px; color:rgba(212,168,87,0.12); line-height:1; margin-bottom:16px; }
  .step-title  { font-family:var(--display); font-size:28px; letter-spacing:2px; color:var(--text); margin-bottom:12px; }
  .step-desc   { font-size:14px; color:var(--muted); line-height:1.7; max-width:260px; margin:0 auto; }
  .step-arrow  { position:absolute; right:-18px; top:50%; transform:translateY(-50%); font-size:28px; color:var(--orange); z-index:2; }

  /* ── PROBLEEM/BELOFTE ── */
  .probleem { background:var(--dark); text-align:center; }
  .probleem-text { font-size:17px; color:#aaa; line-height:1.8; max-width:680px; margin:0 auto 20px; }
  .probleem-text strong { color:var(--text); font-weight:700; }

  /* ── METHODE ── */
  .methode { background:var(--dark2); }
  .methode-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; margin-top:60px; border:2px solid var(--dark3); }
  .methode-card {
    background:var(--dark3); padding:44px 32px; transition: border-color .25s, transform .25s;
    border:1px solid transparent; display:block; text-decoration:none; cursor:pointer;
  }
  .methode-card:hover { border-color:var(--orange); transform:translateY(-4px); }
  .methode-num { font-family:var(--display); font-size:13px; letter-spacing:3px; color:var(--orange); margin-bottom:16px; }
  .methode-title { font-family:var(--display); font-size:26px; letter-spacing:1px; color:var(--text); margin-bottom:12px; }
  .methode-desc { font-size:14px; color:var(--muted); line-height:1.7; }
  .methode-link { display:inline-block; margin-top:32px; }

  /* ── STATS / DASHBOARD SHOWCASE ── */
  .stats-strip { background:var(--dark2); border-top:1px solid rgba(212,168,87,0.1); border-bottom:1px solid rgba(212,168,87,0.1); padding:48px 60px; display:grid; grid-template-columns:repeat(4,1fr); gap:24px; text-align:center; }
  .stat-num { font-family:var(--display); font-size:clamp(32px,4vw,48px); color:var(--orange); letter-spacing:1px; line-height:1; margin-bottom:8px; }
  .stat-label { font-size:11px; letter-spacing:2px; color:var(--muted); text-transform:uppercase; }
  .dashboard-showcase { background:var(--dark); }
  .showcase-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; margin-top:60px; border:2px solid var(--dark3); }
  .showcase-placeholder {
    aspect-ratio:9/16; background:var(--dark2); display:flex; align-items:center; justify-content:center;
    flex-direction:column; gap:10px;
  }
  .showcase-placeholder-icon { font-size:28px; opacity:0.3; }
  .showcase-placeholder-text { font-size:13px; color:var(--muted2); letter-spacing:1px; font-style:italic; text-align:center; }

  /* ── PAKKETTEN TEASER ── */
  .pakketten-teaser { background:var(--dark2); text-align:center; }
  .pakket-teaser-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; margin-top:60px; border:2px solid var(--dark3); }
  .pakket-teaser-card { background:var(--dark3); padding:36px 28px; transition: border-color .25s, transform .25s; border:1px solid transparent; }
  .pakket-teaser-card:hover { border-color:var(--orange); transform:translateY(-4px); }
  .pakket-teaser-card.popular { border-color:rgba(212,168,87,0.4); background:var(--orange-dim); }
  .pakket-teaser-name { font-family:var(--display); font-size:22px; letter-spacing:2px; color:var(--text); margin-bottom:8px; }
  .pakket-teaser-price { font-family:var(--display); font-size:32px; color:var(--orange); margin-bottom:4px; }
  .pakket-teaser-price span { font-size:13px; color:var(--muted); font-family:var(--body); }
  .pakket-teaser-sub { font-size:11px; letter-spacing:1px; color:var(--muted); text-transform:uppercase; }

  .dienst-cta { display:inline-block; margin-top:16px; font-size:11px; letter-spacing:1px; color:var(--orange); text-decoration:none; border-bottom:1px solid var(--orange); padding-bottom:2px; }
  .dienst-cta:hover { color:var(--text); border-color:var(--text); }

  /* ── TESTIMONIALS ── I: lege sectie klaar voor klant-quotes ── */
  .testimonials { background:var(--dark); }
  .testimonials-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:2px; margin-top:60px; }

  /* ── TESTIMONIAL CARD (data-gedreven) ── */
  .testi-card {
    background:var(--dark2); padding:36px 32px;
    border-left:3px solid var(--orange-dim);
    transition: border-color .25s, transform .25s;
    display:flex; flex-direction:column; justify-content:space-between; gap:24px;
  }
  .testi-card:hover { border-color:var(--orange); transform:translateY(-4px); }
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

  /* ── CERTIFICATEN ── */
  .certs { background:var(--dark2); }
  .cert-grid { display:flex; flex-wrap:wrap; gap:10px; margin-top:44px; }
  .cert-badge {
    background:var(--dark3); border:1px solid var(--dark4); padding:10px 18px;
    font-size:12px; letter-spacing:1px; color:var(--muted);
    display:flex; align-items:center; gap:8px;
    transition:border-color .2s, color .2s;
  }
  .cert-badge:hover { border-color:var(--orange); color:var(--text); }
  .cert-badge.featured { border-color:rgba(212,168,87,0.4); color:var(--text); background:var(--orange-dim); }
  .cert-dot { width:5px; height:5px; background:var(--orange); flex-shrink:0; }

  /* ── CONTACT ── */
  .contact { background:var(--dark3); display:grid; grid-template-columns:1fr 1fr; gap:80px; align-items:start; }
  .contact-detail { display:flex; align-items:flex-start; gap:14px; margin-bottom:24px; }
  .contact-detail-icon { width:36px; height:36px; background:var(--orange-dim); display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
  .contact-detail-text  { font-size:14px; color:var(--muted); line-height:1.6; }
  .contact-detail-label { font-size:10px; letter-spacing:2px; color:var(--orange); text-transform:uppercase; margin-bottom:2px; }
  .form  { display:flex; flex-direction:column; gap:14px; }
  .form-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .form-group { display:flex; flex-direction:column; gap:6px; }
  .form-label { font-size:10px; letter-spacing:2px; color:var(--muted); text-transform:uppercase; }
  .form-input, .form-select, .form-textarea {
    background:var(--dark4); border:1px solid var(--dark4); color:var(--text);
    font-family:var(--body); font-size:15px; padding:14px 16px;
    outline:none; transition:border-color .2s; width:100%; color-scheme:dark;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus { border-color:var(--orange); }
  .form-textarea { resize:vertical; min-height:120px; }

  /* ── FOOTER ── */
  footer {
    background:var(--dark); border-top:1px solid rgba(212,168,87,0.1);
    padding:40px 60px; display:flex; align-items:center;
    justify-content:space-between; flex-wrap:wrap; gap:16px;
  }
  .footer-copy  { font-size:12px; color:var(--muted2); letter-spacing:1px; }
  .footer-links { display:flex; gap:24px; }
  .footer-links a { font-size:11px; letter-spacing:2px; text-transform:uppercase; color:var(--muted2); text-decoration:none; transition:color .2s; }
  .footer-links a:hover { color:var(--orange); }

  /* ── D: FADE-IN ANIMATIE ── */
  .fade-in {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.65s ease, transform 0.65s ease;
  }
  .fade-in.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .fade-in.delay-1 { transition-delay: 0.1s; }
  .fade-in.delay-2 { transition-delay: 0.2s; }
  .fade-in.delay-3 { transition-delay: 0.3s; }
  @media (prefers-reduced-motion: reduce) { .fade-in { transition: none !important; opacity: 1 !important; transform: none !important; } }

  /* ── HERO ENTRANCE ── */
  .hero-eyebrow, .hero-headline, .hero-tagline, .hero-proof, .hero-desc, .hero-buttons {
    opacity: 0;
    transform: translateY(20px);
    animation: heroIn 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .hero-eyebrow  { animation-delay: 0.05s; }
  .hero-headline { animation-delay: 0.15s; }
  .hero-tagline  { animation-delay: 0.25s; }
  .hero-proof    { animation-delay: 0.32s; }
  .hero-desc     { animation-delay: 0.35s; }
  .hero-buttons  { animation-delay: 0.45s; }
  @keyframes heroIn {
    to { opacity: 1; transform: translateY(0); }
  }
  .hero-right img {
    animation: heroPhotoIn 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    transform: scale(1.06);
    opacity: 0;
  }
  @keyframes heroPhotoIn {
    to { opacity: 1; transform: scale(1); }
  }

  /* ── REDUCED MOTION ── */
  @media (prefers-reduced-motion: reduce) {
    .fade-in, .hero-eyebrow, .hero-headline, .hero-tagline, .hero-proof, .hero-desc, .hero-buttons, .hero-right img {
      animation: none !important;
      transition: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
  }

  /* ── B: ZWEVENDE GRATIS INTAKE KNOP ── */
  .float-btn {
    position: fixed;
    bottom: 32px;
    right: 32px;
    background: var(--orange);
    color: #000;
    font-family: var(--body);
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 14px 24px;
    text-decoration: none;
    z-index: 999;
    box-shadow: 0 4px 24px rgba(212,168,87,0.4);
    transition: transform .2s, box-shadow .2s, background .2s, opacity .3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .float-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 32px rgba(212,168,87,0.55);
    background: #C99540;
  }
  .float-btn-pulse {
    width: 8px; height: 8px; background: #000;
    border-radius: 50%; flex-shrink: 0;
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.7); }
  }

  /* ── MOBIEL ── */
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
    .hero-headline { font-size: clamp(40px, 12vw, 64px); }
    .hero-tagline { font-size: clamp(20px, 6vw, 32px); }
    section { padding:60px 24px; }

    /* Hero: geen ingekrompen desktop-grid, maar een eigen full-bleed
       app-achtige compositie — foto vult het scherm, tekst zweeft eroverheen. */
    .hero {
      grid-template-columns: 1fr;
      min-height: auto;
      position: relative;
      padding: 0;
    }
    .hero-right {
      position: relative; inset: auto; height: 34vh; min-height: 220px; z-index: 0;
      order: -1;
    }
    .hero-right::after {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(to bottom, rgba(10,10,10,0.35) 0%, rgba(10,10,10,0.5) 50%, rgba(10,10,10,0.92) 90%, #0A0A0A 100%);
    }
    .hero-left {
      position: relative; z-index: 2;
      min-height: auto;
      justify-content: flex-start;
      padding: 28px 24px calc(env(safe-area-inset-bottom, 0px) + 32px);
    }
    .hero-buttons { flex-direction: column; }
    .hero-buttons a { text-align: center; width: 100%; }

    .about, .contact { grid-template-columns:1fr; gap:40px; }
    .about-photo { aspect-ratio: 4/3; max-height: 320px; }
    .diensten-grid { grid-template-columns:1fr; }
    .process-steps { grid-template-columns:1fr; }
    .step-arrow { display:none; }
    .testimonials-grid { grid-template-columns:1fr; }
    .methode-grid { grid-template-columns:1fr; }
    .stats-strip { grid-template-columns:1fr 1fr; padding:32px 24px; }
    .showcase-grid { grid-template-columns:1fr; }
    .pakket-teaser-grid { grid-template-columns:1fr; }
    .form-row { grid-template-columns:1fr; }
    .ribbon { padding:16px 24px; }
    footer { padding:30px 24px; flex-direction:column; align-items:flex-start; }
    .footer-links { flex-wrap:wrap; gap:14px 20px; }
    .float-btn { bottom:20px; right:16px; left:16px; justify-content:center; }
  }

  @media (max-width: 400px) {
    .section-title { font-size: clamp(32px, 9vw, 68px); }
  }

  @media (max-width: 768px) and (max-height: 700px) {
    .hero-desc { display: none; }
    .hero-right { height: 28vh; min-height: 180px; }
  }
`

export default function Homepage() {
  const [form, setForm] = React.useState({ voornaam:'', achternaam:'', email:'', dienst:'', bericht:'' })
  const [status, setStatus] = React.useState('idle')
  const floatBtnRef = React.useRef(null)
  const { rows: testimonials, loading: testimonialsLoading } = usePublishedRows('testimonials')

  // D: Fade-in observer
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [testimonials])

  // Verberg de zwevende knop zodra de footer in beeld komt
  React.useEffect(() => {
    const footer = document.querySelector('footer')
    const btn = floatBtnRef.current
    if (!footer || !btn) return
    const observer = new IntersectionObserver(
      ([entry]) => btn.classList.toggle('is-hidden', entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(footer)
    return () => observer.disconnect()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch { setStatus('error') }
  }

  return (
    <>
      {/* H: JSON-LD Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* B: Zwevende intake knop */}
      <a href="#contact" className="float-btn" ref={floatBtnRef}>
        <span className="float-btn-pulse" />
        Gratis intake
      </a>

      {/* NAV */}
      <SiteNav />

      {/* HERO */}
      <section className="hero" style={{padding:0}}>
        <div className="hero-left">
          {/* F: Locatie keywords subtiel toegevoegd aan eyebrow */}
          <div className="hero-eyebrow">Coaching · Training · Tactical · Den Haag & Online</div>
          <h1 className="hero-headline">
            <CascadeText text="JOUW" fontSize="inherit" color="inherit" hoverColor="var(--orange)" /><br/>
            <CascadeText text="DOEL," fontSize="inherit" color="inherit" hoverColor="var(--orange)" /><br/>
            <span><CascadeText text="ONS PLAN" fontSize="inherit" color="var(--orange)" hoverColor="var(--text)" /></span>
          </h1>
          <div className="hero-tagline">GV PERFORMANCE</div>
          <div className="hero-proof">Sporters begeleid van blessureherstel tot het podium.</div>
          {/* F: "Den Haag en online" verwerkt in bestaande tekst */}
          <p className="hero-desc">
            Van topsporters tot tactische professionals in Den Haag en online — elk traject begint met een grondige analyse en eindigt met meetbaar resultaat. Geen generieke schema's. Alleen wat werkt voor jou.
          </p>
          <div className="hero-buttons">
            <a href="#contact" className="btn-primary">Vraag je traject aan</a>
            <a href="#diensten" className="btn-secondary">Bekijk diensten</a>
          </div>
        </div>
        <div className="hero-right">
          <Image
            src="/hero.jpg"
            alt="Guido Vols — GV Performance coach"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit:'cover', objectPosition:'left bottom' }}
          />
        </div>
      </section>

      {/* RIBBON */}
      <div className="ribbon">
        {[
          'Korps Mariniers',
          '🥇 Gouden Medaille Nederlands Team',
          'Defensie Sport Instructeur',
          'NBB Boxing Trainer KSS 3',
          'KNAU Looptrainer',
          '13+ Certificaten',
        ].map(t => (
          <div key={t} className="ribbon-item">
            <div className="ribbon-dot"/>
            <span className="ribbon-text">{t}</span>
          </div>
        ))}
      </div>

      {/* PROBLEEM/BELOFTE */}
      <section className="probleem">
        <div className="section-label fade-in" style={{justifyContent:'center'}}>De uitdaging</div>
        <h2 className="section-title fade-in delay-1">GENERIEKE SCHEMA&apos;S FALEN</h2>
        <p className="probleem-text fade-in delay-1">
          Generieke schema&apos;s falen omdat ze geen rekening houden met jouw startpunt, herstel of doel — ze werken voor een gemiddelde dat niet bestaat.
        </p>
        <p className="probleem-text fade-in delay-2">
          Daarom begin ik met een grondige nulmeting en bouw ik een traject dat <strong>meegroeit met jouw voortgang</strong> — geperiodiseerd, meetbaar, en bijgestuurd waar nodig.
        </p>
      </section>

      {/* METHODE */}
      <section className="methode" id="werkwijze">
        <div className="section-label fade-in" style={{justifyContent:'center'}}>Het GV Performance Systeem</div>
        <h2 className="section-title fade-in delay-1" style={{textAlign:'center'}}>PERIODISERING · DATA · MENTAAL</h2>
        <div className="methode-grid">
          {[
            ['01','PERIODISERING','Elk traject is opgebouwd in fases, afgestemd op jouw doel en kalender. Geen losse trainingen, maar een opbouw die naar een piekmoment toewerkt.','periodisering'],
            ['02','DATA','Nulmeting, voortgangsmetingen en herstelmonitoring. Beslissingen op basis van wat jouw lichaam laat zien — niet op aannames.','data'],
            ['03','MENTAAL','Prestatie is net zo goed mentaal als fysiek. Vaste check-ins en mentale coaching houden je scherp als het zwaar wordt.','mentaal'],
          ].map(([n, t, d, anchor], i) => (
            <a key={n} href={`/methode#${anchor}`} className={`methode-card fade-in delay-${i + 1}`}>
              <div className="methode-num">{n}</div>
              <div className="methode-title">{t}</div>
              <div className="methode-desc">{d}</div>
            </a>
          ))}
        </div>
        <div style={{textAlign:'center'}}>
          <a href="/methode" className="dienst-cta methode-link fade-in delay-3">Meer over de methode →</a>
        </div>
      </section>

      {/* HOE HET WERKT */}
      <section className="process">
        <div className="section-label fade-in" style={{justifyContent:'center'}}>Werkwijze</div>
        <h2 className="section-title fade-in delay-1">HOE HET WERKT</h2>
        <div className="process-steps">
          {[
            ['01','INTAKE & ANALYSE','Een grondige kennismaking. We brengen jouw uitgangssituatie, doelen en leefstijl in kaart. Nulmeting waar relevant.', true],
            ['02','JOUW PLAN','Op basis van de intake maak ik een volledig uitgestippeld traject. Geperiodiseerd, meetbaar, realistisch.', true],
            ['03','UITVOERING & GROEI','We gaan aan de slag. Continue monitoring, bijsturing waar nodig, en vaste check-ins om op koers te blijven.', false],
          ].map(([n, t, d, arrow], i) => (
            <div key={n} className={`process-step fade-in delay-${i + 1}`}>
              <div className="step-number">{n}</div>
              <div className="step-title">{t}</div>
              <div className="step-desc">{d}</div>
              {arrow && <div className="step-arrow">›</div>}
            </div>
          ))}
        </div>
      </section>

      {/* BEWIJS — testimonials + resultaat-cijfers */}
      <section className="testimonials" id="resultaten">
        <div className="section-label fade-in">Bewijs</div>
        <h2 className="section-title fade-in delay-1">WAT KLANTEN ZEGGEN</h2>
        <div className="testimonials-grid">
          {!testimonialsLoading && testimonials.length === 0 && (
            <EmptyState text="Binnenkort delen we resultaten." />
          )}
          {testimonials.map(t => (
            <div key={t.id} className="fade-in">
              <TestimonialCard t={t} compact />
            </div>
          ))}
        </div>
      </section>
      <div className="stats-strip">
        {[
          ['50+', 'Begeleide trajecten'],
          ['13+', 'Certificeringen'],
          ['24u', 'Reactietijd'],
          ['100%', 'Op maat gemaakt'],
        ].map(([num, label]) => (
          <div key={label} className="fade-in">
            <div className="stat-num">{num}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* DIENSTEN / VOOR WIE */}
      <section className="diensten" id="diensten">
        <div className="section-label fade-in">Voor wie</div>
        <h2 className="section-title fade-in delay-1">VOOR WIE</h2>
        <div className="diensten-grid">
          {[
            { icon:'🪖', title:'TACTICAL ATHLETE',     desc:'Voorbereiding op Defensie, politie, brandweer of speciale eenheden. Fysiek én mentaal klaar voor selectie en opleiding.',                                       tag:'Defensie · Politie · Brandweer', photo:'/diensten-tactical.jpg' },
            { icon:'🏅', title:'TOPSPORT BEGELEIDING', desc:'Voor sporters met een specifiek doel en de gedrevenheid om het te halen. Periodisering, kracht, conditie en mentale weerbaarheid.',                              tag:'Seizoensvoorbereiding', photo:'/diensten-topsport.jpg' },
            { icon:'🎯', title:'SERIEUZE AMATEUR',      desc:'Persoonlijk 1-op-1 traject op maat — van intake en doelstelling tot periodisering en uitvoering. Online, in-person of hybrid.',                                 tag:'1-op-1 · Hybrid', photo:'/diensten-coaching.jpg' },
          ].map((d, i) => (
            <div key={d.title} className={`dienst-card fade-in delay-${(i % 3) + 1}`}>
              {d.photo && (
                <div className="dienst-photo">
                  <Image src={d.photo} alt={d.title} fill loading="lazy" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
              )}
              <div className="dienst-body">
                <div className="dienst-icon">{d.icon}</div>
                <div className="dienst-title">{d.title}</div>
                <div className="dienst-desc">{d.desc}</div>
                <div className="dienst-tag">{d.tag}</div>
                <div><a href="/pakketten" className="dienst-cta">Meer weten →</a></div>
              </div>
            </div>
          ))}
        </div>
        <div className="ook-voor fade-in delay-3">
          <span className="ook-voor-label">Ook voor:</span>
          <a href="/pakketten" className="ook-voor-pill">⚡ Hyrox voorbereiding</a>
          <a href="/pakketten" className="ook-voor-pill">🏃 Loopcoaching</a>
          <a href="/pakketten" className="ook-voor-pill">🏢 Team &amp; bedrijf</a>
        </div>
      </section>

      {/* DASHBOARD SHOWCASE */}
      <section className="dashboard-showcase">
        <div className="section-label fade-in" style={{justifyContent:'center'}}>Het platform</div>
        <h2 className="section-title fade-in delay-1" style={{textAlign:'center'}}>ZO ZIET JOUW TRAJECT ERUIT</h2>
        <div className="showcase-grid">
          {['Trainingsplan', 'Voortgang & data', 'Dagelijkse check-in'].map((label, i) => (
            <div key={label} className={`showcase-placeholder fade-in delay-${i + 1}`}>
              <div className="showcase-placeholder-icon">📱</div>
              <div className="showcase-placeholder-text">Screenshot volgt — {label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* OVER GUIDO */}
      <section className="about" id="over">
        <div className="about-photo fade-in" style={{overflow:'hidden', border:'none', position:'relative'}}>
          <Image
            src="/about.jpg"
            alt="Guido Vols — personal coach Den Haag"
            fill
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit:'cover', objectPosition:'center top' }}
          />
        </div>
        <div className="fade-in delay-1">
          <div className="section-label">Over Guido</div>
          <h2 className="section-title">VAN GOUDEN PLAK TOT SPORTINSTRUCTEUR</h2>
          <div className="about-quote">&ldquo;Ik heb mijn eigen methode bewezen — aan mijzelf.&rdquo;</div>
          <p className="about-text">
            Vanaf mijn <strong>17e speelde ik ijshockey op het hoogste niveau van Nederland</strong>. In mijn laatste seizoen voor de Korps Mariniers opleiding vertegenwoordigde ik <strong>het Nederlands Team</strong> en behaalden we een <strong>gouden medaille</strong>. Daarna: de Mariniers.
          </p>
          <p className="about-text" style={{marginTop:0}}>
            Tien jaar lang geen hockey. Maar twee jaar geleden besloot ik terug te gaan — en door mijn eigen methodiek voor off-ice ontwikkeling wist ik <strong>opnieuw door te stromen naar het hoogste niveau van Nederland</strong>. Dat is niet geluk. Dat is een systeem.
          </p>
          <p className="about-text" style={{marginTop:0}}>
            Datzelfde systeem — gebaseerd op <strong>periodisering, data en mentale coaching</strong> — zet ik nu in voor jou. Of je nu een topsporter, tactical athlete of gedreven amateur bent in Den Haag of online.
          </p>
          <div className="milestones">
            {[
              ['17 JAAR','Hoogste IJshockeycompetitie Nederland'],
              ['GOUD 🥇','Nederlands IJshockeyteam'],
              ['MARINIERS','Korps Mariniers opleiding & dienst'],
              ['COMEBACK','Terug op topniveau na 10 jaar, eigen methode'],
            ].map(([jaar, tekst]) => (
              <div key={jaar} className="milestone">
                <div className="milestone-year">{jaar}</div>
                <div className="milestone-text">{tekst}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CERTIFICATEN */}
      <section className="certs">
        <div className="section-label fade-in">Achtergrond & Kwalificaties</div>
        <h2 className="section-title fade-in delay-1">GECERTIFICEERD OP ALLE VLAKKEN</h2>
        <div className="cert-grid">
          {[
            { t:'Korps Mariniers', f:true },
            { t:'Instructeur Fysieke Training & Sport (Defensie)', f:true },
            { t:'KSS 3 — Nederlandse Boks Bond', f:true },
            { t:'Basis Looptrainer 3 — Atletiek Unie', f:true },
            { t:'MBO 4 Trainer / Coach' },
            { t:'Totaal Coach XXL (incl. mentaal)' },
            { t:'Overload A & B (TOP methode)' },
            { t:'Athletic Skills Model (ASM)' },
            { t:'Power Cycling A + B — Always Fit' },
            { t:'Xavier FIT A' },
            { t:'Atletiek Baan Assistent 2 — Atletiek Unie' },
            { t:'EHBO (actueel)' },
            { t:'Lifeguard (actueel)' },
            { t:'Interne Voedingscursus' },
          ].map(c => (
            <div key={c.t} className={`cert-badge ${c.f ? 'featured' : ''}`}>
              <div className="cert-dot"/>
              {c.t}
            </div>
          ))}
        </div>
      </section>

      {/* PAKKETTEN TEASER */}
      <section className="pakketten-teaser">
        <div className="section-label fade-in" style={{justifyContent:'center'}}>Investering</div>
        <h2 className="section-title fade-in delay-1" style={{textAlign:'center'}}>KIES JOUW PAKKET</h2>
        <div className="pakket-teaser-grid">
          {[
            ['STARTER', 'Online', 119, false],
            ['PERFORMANCE', 'Hybrid · Meest gekozen', 229, true],
            ['ELITE', 'Full Service', 399, false],
          ].map(([name, sub, price, popular], i) => (
            <div key={name} className={`pakket-teaser-card fade-in delay-${i + 1} ${popular ? 'popular' : ''}`}>
              <div className="pakket-teaser-name">{name}</div>
              <div className="pakket-teaser-price">€{price}<span>/maand</span></div>
              <div className="pakket-teaser-sub">{sub}</div>
            </div>
          ))}
        </div>
        <div style={{textAlign:'center', marginTop:36}}>
          <a href="/pakketten" className="btn-primary fade-in delay-3">Bekijk alle pakketten</a>
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact" id="contact">
        <div className="contact-info fade-in">
          <div className="section-label">Kennismaking</div>
          <h2 className="section-title">KLAAR OM TE STARTEN?</h2>
          <p style={{fontSize:16, color:'#aaa', lineHeight:1.8, marginBottom:28}}>
            Plan direct een gratis kennismakingsgesprek van 30 minuten — geen wachttijd, kies zelf een moment dat past.
          </p>
          <CalendlyButton style={{marginBottom:36}} />
          {[
            { icon:'📍', label:'Locatie',     text:'Den Haag & omgeving · Online beschikbaar' },
            { icon:'⚡', label:'Reactietijd', text:'Binnen 24 uur op werkdagen' },
            { icon:'🎯', label:'Eerste stap', text:'Gratis kennismakingsgesprek van 30 min' },
          ].map(d => (
            <div key={d.label} className="contact-detail">
              <div className="contact-detail-icon">{d.icon}</div>
              <div>
                <div className="contact-detail-label">{d.label}</div>
                <div className="contact-detail-text">{d.text}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="fade-in delay-1">
          {status === 'success' ? (
            <div style={{textAlign:'center', padding:'60px 0'}}>
              <div style={{fontSize:48, marginBottom:16}}>✅</div>
              <div style={{fontFamily:'Oswald, sans-serif', fontSize:28, letterSpacing:2, marginBottom:8}}>BERICHT ONTVANGEN!</div>
              <div style={{fontSize:14, color:'#888'}}>Ik neem binnen 24 uur contact op.</div>
            </div>
          ) : (
            <form className="form" onSubmit={handleSubmit}>
              <div style={{ fontFamily:'var(--font-oswald), Impact, sans-serif', fontSize:14, letterSpacing:2, color:'var(--muted)', textTransform:'uppercase', marginBottom:4 }}>
                Of stuur eerst een bericht
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Voornaam</label>
                  <input type="text" className="form-input" placeholder="Jouw naam" value={form.voornaam} onChange={e => setForm(p => ({...p, voornaam: e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Achternaam</label>
                  <input type="text" className="form-input" placeholder="Achternaam" value={form.achternaam} onChange={e => setForm(p => ({...p, achternaam: e.target.value}))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">E-mailadres</label>
                <input type="email" className="form-input" placeholder="jouw@email.nl" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Interesse in</label>
                <select className="form-select" value={form.dienst} onChange={e => setForm(p => ({...p, dienst: e.target.value}))}>
                  <option value="">Selecteer een dienst...</option>
                  <option>1-op-1 Personal Coaching</option>
                  <option>Tactical Athlete Voorbereiding</option>
                  <option>Topsport Begeleiding</option>
                  <option>Hyrox Voorbereiding</option>
                  <option>Team / Bedrijfstraining</option>
                  <option>Loopcoaching</option>
                  <option>Anders</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Jouw bericht</label>
                <textarea className="form-textarea" placeholder="Vertel kort over je doel of situatie..." value={form.bericht} onChange={e => setForm(p => ({...p, bericht: e.target.value}))} required />
              </div>
              {status === 'error' && (
                <div style={{color:'#f87171', fontSize:13, padding:'10px 14px', background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)'}}>
                  Er ging iets mis. Probeer opnieuw of mail direct naar guidovperformance@gmail.com
                </div>
              )}
              <button type="submit" className="btn-primary" style={{width:'100%', textAlign:'center', fontSize:14}} disabled={status === 'loading'}>
                {status === 'loading' ? 'VERSTUREN...' : 'VERSTUUR BERICHT'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <SiteFooter />
    </>
  )
}
