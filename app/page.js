'use client'
import React from 'react'
import Image from 'next/image'
import { CascadeText } from './site-shared'

const ICON = {
  over:      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  diensten:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5l11 11M5 5l2 2M19 19l-2-2M3 14l3-3M18 9l3-3M14 3l-3 3M9 18l-3 3M9.5 9.5l5 5"/></svg>,
  expertise: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M9 13.5 7 22l5-3 5 3-2-8.5"/></svg>,
  resultaten:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="20" x2="6" y2="12"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="18" y1="20" x2="18" y2="14"/></svg>,
  reviews:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9"/></svg>,
  blog:      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>,
  faq:       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 1 1 5.83 1c0 2-2.93 2-2.93 4"/><line x1="12" y1="17" x2="12" y2="17"/></svg>,
  pakketten: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.6 12.6 12.6 20.6a2 2 0 0 1-2.8 0l-7.4-7.4a2 2 0 0 1 0-2.8L10.4 2.4a2 2 0 0 1 2.8 0l7.4 7.4a2 2 0 0 1 0 2.8z"/><circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none"/></svg>,
}

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
    overflow-y: visible; /* voorkomt dat overflow-y stiekem op 'auto' komt te staan, wat de sticky nav breekt */
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
  }
  .hero-headline span { color:var(--orange); }
  .hero-tagline {
    font-family:var(--display); font-size:clamp(28px,3vw,42px);
    letter-spacing:0px; color:var(--muted); margin-bottom:32px;
  }
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

  /* ── HOE HET WERKT ── */
  .process { background:var(--dark2); text-align:center; }
  .process-steps { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; margin-top:60px; position:relative; }
  .process-step { padding:48px 32px; background:var(--dark3); position:relative; }
  .step-number { font-family:var(--display); font-size:80px; color:rgba(212,168,87,0.12); line-height:1; margin-bottom:16px; }
  .step-title  { font-family:var(--display); font-size:28px; letter-spacing:2px; color:var(--text); margin-bottom:12px; }
  .step-desc   { font-size:14px; color:var(--muted); line-height:1.7; max-width:260px; margin:0 auto; }
  .step-arrow  { position:absolute; right:-18px; top:50%; transform:translateY(-50%); font-size:28px; color:var(--orange); z-index:2; }

  /* ── TESTIMONIALS ── I: lege sectie klaar voor klant-quotes ── */
  .testimonials { background:var(--dark); }
  .testimonials-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:2px; margin-top:60px; }
  .testimonial-card {
    background:var(--dark2); padding:40px 36px;
    border-left:3px solid var(--orange-dim);
    transition: border-color .25s, transform .25s;
    min-height:200px; display:flex; flex-direction:column; justify-content:space-between;
  }
  .testimonial-card:hover { border-color:var(--orange); transform:translateY(-4px); }
  .testimonial-placeholder {
    display:flex; align-items:center; justify-content:center;
    flex:1; flex-direction:column; gap:10px;
  }
  .testimonial-placeholder-text {
    font-size:13px; color:var(--muted2); letter-spacing:1px; font-style:italic; text-align:center;
  }
  .testimonial-placeholder-icon { font-size:28px; opacity:0.3; }

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
  .hero-eyebrow, .hero-headline, .hero-tagline, .hero-desc, .hero-buttons {
    opacity: 0;
    transform: translateY(20px);
    animation: heroIn 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .hero-eyebrow  { animation-delay: 0.05s; }
  .hero-headline { animation-delay: 0.15s; }
  .hero-tagline  { animation-delay: 0.25s; }
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
    .fade-in, .hero-eyebrow, .hero-headline, .hero-tagline, .hero-desc, .hero-buttons, .hero-right img {
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
      position: relative; inset: auto; height: 46vh; min-height: 280px; z-index: 0;
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
    .form-row { grid-template-columns:1fr; }
    .ribbon { padding:16px 24px; }
    footer { padding:30px 24px; flex-direction:column; align-items:flex-start; }
    .float-btn { bottom:20px; right:16px; left:16px; justify-content:center; }
  }
`

export default function Homepage() {
  const [form, setForm] = React.useState({ voornaam:'', achternaam:'', email:'', dienst:'', bericht:'' })
  const [status, setStatus] = React.useState('idle')
  const floatBtnRef = React.useRef(null)

  // D: Fade-in observer
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

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
      <nav>
        <a href="/" className="nav-logo">
          <svg width="36" height="34" viewBox="0 0 36 34">
            <polygon points="18,2 13,28 23,28" fill="#D4A857"/>
            <polygon points="5,7 0,28 14,28" fill="#D4A857" opacity="0.5"/>
            <polygon points="31,7 23,28 36,28" fill="#D4A857" opacity="0.5"/>
            <rect x="0" y="31" width="36" height="2" fill="#D4A857" opacity="0.2"/>
          </svg>
          <div>
            <div className="nav-logo-text">GV PERFORMANCE</div>
            <div className="nav-logo-sub">GUIDO VOLS</div>
          </div>
        </a>
        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0, flex: '1 1 auto', justifyContent: 'flex-end' }}>
          <div className="nav-icons" style={{ minWidth: 0 }}>
            {[
              { href: '#over', label: 'Over Guido', icon: ICON.over },
              { href: '#diensten', label: 'Diensten', icon: ICON.diensten },
              { href: '/expertise', label: 'Expertise', icon: ICON.expertise },
              { href: '/resultaten', label: 'Resultaten', icon: ICON.resultaten },
              { href: '/testimonials', label: 'Reviews', icon: ICON.reviews },
              { href: '/blog', label: 'Blog', icon: ICON.blog },
              { href: '/faq', label: 'FAQ', icon: ICON.faq },
              { href: '/pakketten', label: 'Pakketten', icon: ICON.pakketten },
            ].map(l => (
              <a key={l.href} href={l.href} className="nav-icon-item">
                <span className="nav-icon-item-bg" aria-hidden="true" />
                <span className="nav-icon-item-icon">{l.icon}</span>
                <span className="nav-icon-item-label">{l.label}</span>
              </a>
            ))}
          </div>
          <a href="#contact" className="nav-cta nav-cta-desktop">Kennismaking</a>
        </div>
      </nav>

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
          {/* F: "Den Haag en online" verwerkt in bestaande tekst */}
          <p className="hero-desc">
            Van topsporters tot tactische professionals in Den Haag en online — elk traject begint met een grondige analyse en eindigt met meetbaar resultaat. Geen generieke schema's. Alleen wat werkt voor jou.
          </p>
          <div className="hero-buttons">
            <a href="#contact" className="btn-primary">Plan je kennismaking</a>
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

      {/* DIENSTEN */}
      <section className="diensten" id="diensten">
        <div className="section-label fade-in">Wat ik aanbied</div>
        <h2 className="section-title fade-in delay-1">DIENSTEN</h2>
        <div className="diensten-grid">
          {[
            { icon:'🎯', title:'1-OP-1 COACHING',      desc:'Persoonlijk traject op maat — van intake en doelstelling tot periodisering en uitvoering. Online, in-person of hybrid.',                                         tag:'Hybrid', photo:'/diensten-coaching.jpg' },
            { icon:'🪖', title:'TACTICAL ATHLETE',     desc:'Voorbereiding op Defensie, politie, brandweer of speciale eenheden. Fysiek én mentaal klaar voor selectie en opleiding.',                                       tag:'Defensie · Politie · Brandweer', photo:'/diensten-tactical.jpg' },
            { icon:'🏅', title:'TOPSPORT BEGELEIDING', desc:'Voor sporters met een specifiek doel en de gedrevenheid om het te halen. Periodisering, kracht, conditie en mentale weerbaarheid.',                              tag:'Seizoensvoorbereiding', photo:'/diensten-topsport.jpg' },
            { icon:'⚡', title:'HYROX VOORBEREIDING',  desc:'Van nulmeting tot race day. Opbouw, tijdverbetering en volledige race-specifieke conditionering. Gebaseerd op eigen Hyrox prestaties.',                          tag:'Beginners · Tijdverbetering', photo:'/diensten-hyrox.jpg' },
            { icon:'🏢', title:'TEAM & BEDRIJF',       desc:'Teamtrainingen, bootcamps en groepslessen voor bedrijven en sportclubs. Spinning, boxing en functionele training. Ook beschikbaar als externe instructeur.',  tag:'B2B · Sportscholen · Events', photo:'/diensten-team.jpg' },
            { icon:'🏃', title:'LOOPCOACHING',         desc:'Techniek, opbouw en race-voorbereiding. Van beginners tot hardlopers met een tijdsdoel. KNAU gecertificeerd looptrainer niveau 3.',                              tag:'KNAU Gecertificeerd', photo:null },
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
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOE HET WERKT */}
      <section className="process" id="werkwijze">
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

      {/* I: TESTIMONIALS — lege sectie, tekst volgt van klant */}
      <section className="testimonials" id="resultaten">
        <div className="section-label fade-in">Resultaten</div>
        <h2 className="section-title fade-in delay-1">WAT KLANTEN ZEGGEN</h2>
        <div className="testimonials-grid">
          {[1, 2].map(n => (
            <div key={n} className="testimonial-card fade-in">
              <div className="testimonial-placeholder">
                <div className="testimonial-placeholder-icon">💬</div>
                <div className="testimonial-placeholder-text">Testimonial volgt binnenkort</div>
              </div>
            </div>
          ))}
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

      {/* CONTACT */}
      <section className="contact" id="contact">
        <div className="contact-info fade-in">
          <div className="section-label">Kennismaking</div>
          <h2 className="section-title">KLAAR OM TE STARTEN?</h2>
          <p style={{fontSize:16, color:'#aaa', lineHeight:1.8, marginBottom:36}}>
            Stuur een bericht en ik neem binnen 24 uur contact op voor een vrijblijvend kennismakingsgesprek. We kijken samen wat het beste bij jou past.
          </p>
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
      <footer>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <svg width="24" height="22" viewBox="0 0 36 34">
            <polygon points="18,2 13,28 23,28" fill="#D4A857"/>
            <polygon points="5,7 0,28 14,28" fill="#D4A857" opacity="0.5"/>
            <polygon points="31,7 23,28 36,28" fill="#D4A857" opacity="0.5"/>
          </svg>
          <span style={{fontFamily:'Oswald, sans-serif', fontSize:16, letterSpacing:3, color:'#888'}}>GV PERFORMANCE</span>
        </div>
        <div className="footer-copy">© 2025 GV Performance — Guido Vols · Den Haag</div>
        <div className="footer-links">
          <a href="#">Instagram</a>
          <a href="#">LinkedIn</a>
          <a href="#contact">Contact</a>
          <a href="#">Privacybeleid</a>
          <a href="/login">Inloggen</a>
        </div>
      </footer>
    </>
  )
}
