'use client'
import React from 'react'

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "GV Performance",
  "description": "1-op-1 personal coaching voor tactical athletes, topsporters en gedreven amateurs in Den Haag en online. Periodisering, kracht, conditie en mentale coaching.",
  "url": "https://www.gvperformance.nl",
  "logo": "https://www.gvperformance.nl/logo.png",
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
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Barlow+Condensed:wght@400;500;700&display=swap');

  :root {
    --orange: #FF4D00;
    --orange-dim: rgba(255,77,0,0.15);
    --dark:  #0A0A0A;
    --dark2: #111;
    --dark3: #181818;
    --dark4: #222;
    --text:  #F0EEE8;
    --muted: #888;
    --muted2: #555;
    --display: 'Oswald', Impact, sans-serif;
    --body:    'Barlow Condensed', sans-serif;
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
  }

  /* ── NAV ── */
  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22px 60px;
    border-bottom: 1px solid rgba(255,77,0,0.12);
    background: rgba(10,10,10,0.97);
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(8px);
  }
  .nav-logo { display:flex; align-items:center; gap:14px; text-decoration:none; }
  .nav-logo-text { font-family:var(--display); font-size:22px; letter-spacing:3px; color:var(--text); line-height:1; }
  .nav-logo-sub  { font-family:var(--body); font-size:10px; letter-spacing:3px; color:var(--orange); margin-top:2px; }
  .nav-links { display:flex; gap:36px; list-style:none; }
  .nav-links a {
    font-family:var(--body); font-size:13px; letter-spacing:2px;
    text-transform:uppercase; color:var(--muted); text-decoration:none;
    transition: color .2s;
    position: relative;
  }
  .nav-links a::after {
    content:''; position:absolute; bottom:-3px; left:0;
    width:0; height:2px; background:var(--orange); transition:width .25s;
  }
  .nav-links a:hover { color:var(--text); }
  .nav-links a:hover::after { width:100%; }
  .nav-cta {
    background:var(--orange); color:#000 !important;
    padding:10px 22px; font-weight:700; letter-spacing:1px !important;
  }
  .nav-cta::after { display:none !important; }

  /* ── HERO ── */
  .hero {
    min-height:92vh; display:grid; grid-template-columns:1fr 1fr;
    position:relative; overflow:hidden;
  }
  .hero::before {
    content:''; position:absolute; inset:0;
    background:radial-gradient(ellipse at 20% 50%, rgba(255,77,0,0.07) 0%, transparent 60%);
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
    line-height:0.92; letter-spacing:2px; color:var(--text); margin-bottom:8px;
  }
  .hero-headline span { color:var(--orange); }
  .hero-tagline {
    font-family:var(--display); font-size:clamp(28px,3vw,42px);
    letter-spacing:4px; color:var(--muted); margin-bottom:32px;
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
  .btn-primary:hover { background:#e64400; transform:translateY(-1px); }

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
    flex-direction:column; gap:12px; border-left:1px solid rgba(255,77,0,0.1);
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
    border-top:1px solid rgba(255,77,0,0.1);
    border-bottom:1px solid rgba(255,77,0,0.1);
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
    letter-spacing:2px; line-height:0.95; margin-bottom:24px;
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
    background:var(--dark2); padding:36px 32px;
    border:1px solid transparent;
    transition: border-color .25s, background .25s, transform .25s, box-shadow .25s;
    cursor:default;
  }
  .dienst-card:hover {
    background:var(--dark3);
    border-color: var(--orange);
    transform: translateY(-6px);
    box-shadow: 0 12px 32px rgba(255,77,0,0.12);
    position: relative;
    z-index: 2;
  }
  .dienst-icon  { font-size:28px; margin-bottom:16px; }
  .dienst-title { font-family:var(--display); font-size:24px; letter-spacing:2px; color:var(--text); margin-bottom:10px; line-height:1; }
  .dienst-desc  { font-size:14px; color:var(--muted); line-height:1.6; }
  .dienst-tag   {
    display:inline-block; margin-top:14px; font-size:10px; letter-spacing:2px;
    color:var(--orange); text-transform:uppercase; border:1px solid rgba(255,77,0,0.3); padding:4px 10px;
  }

  /* ── HOE HET WERKT ── */
  .process { background:var(--dark2); text-align:center; }
  .process-steps { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; margin-top:60px; position:relative; }
  .process-step { padding:48px 32px; background:var(--dark3); position:relative; }
  .step-number { font-family:var(--display); font-size:80px; color:rgba(255,77,0,0.12); line-height:1; margin-bottom:16px; }
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
  .cert-badge.featured { border-color:rgba(255,77,0,0.4); color:var(--text); background:var(--orange-dim); }
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
    background:var(--dark); border-top:1px solid rgba(255,77,0,0.1);
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
    box-shadow: 0 4px 24px rgba(255,77,0,0.4);
    transition: transform .2s, box-shadow .2s, background .2s;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .float-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 32px rgba(255,77,0,0.55);
    background: #e64400;
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
    nav { padding:18px 24px; }
    .nav-links { display:none; }
    section { padding:60px 24px; }
    .hero { grid-template-columns:1fr; min-height:auto; }
    .hero-right { min-height:280px; }
    .hero-left { padding:60px 24px; }
    .about, .contact { grid-template-columns:1fr; gap:40px; }
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

  // D: Fade-in observer
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el))
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
      <a href="#contact" className="float-btn">
        <span className="float-btn-pulse" />
        Gratis intake
      </a>

      {/* NAV */}
      <nav>
        <a href="/" className="nav-logo">
          <svg width="36" height="34" viewBox="0 0 36 34">
            <polygon points="18,2 13,28 23,28" fill="#FF4D00"/>
            <polygon points="5,7 0,28 14,28" fill="#FF4D00" opacity="0.5"/>
            <polygon points="31,7 23,28 36,28" fill="#FF4D00" opacity="0.5"/>
            <rect x="0" y="31" width="36" height="2" fill="#FF4D00" opacity="0.2"/>
          </svg>
          <div>
            <div className="nav-logo-text">GV PERFORMANCE</div>
            <div className="nav-logo-sub">GUIDO VOLS</div>
          </div>
        </a>
        <ul className="nav-links">
          <li><a href="#over">Over Guido</a></li>
          <li><a href="#diensten">Diensten</a></li>
          <li><a href="#werkwijze">Werkwijze</a></li>
          <li><a href="#contact" className="nav-cta">Kennismaking</a></li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="hero" style={{padding:0}}>
        <div className="hero-left">
          {/* F: Locatie keywords subtiel toegevoegd aan eyebrow */}
          <div className="hero-eyebrow">Coaching · Training · Tactical · Den Haag & Online</div>
          <h1 className="hero-headline">JOUW<br/>DOEL,<br/><span>ONS PLAN</span></h1>
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
          <img
            src="/hero.jpg"
            alt="Guido Vols — GV Performance coach"
            style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top', display:'block' }}
            onError={e => { e.target.style.display='none' }}
          />
        </div>
      </section>

      {/* RIBBON */}
      <div className="ribbon">
        {[
          'Korps Mariniers',
          '🥇 Gouden Medaille NL Elftal',
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
        <div className="about-photo fade-in" style={{overflow:'hidden', border:'none'}}>
          <img
            src="/about.jpg"
            alt="Guido Vols — personal coach Den Haag"
            style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top', display:'block' }}
            onError={e => { e.target.style.display='none' }}
          />
        </div>
        <div className="fade-in delay-1">
          <div className="section-label">Over Guido</div>
          <h2 className="section-title">VAN GOUDEN PLAK TOT SPORTINSTRUCTEUR</h2>
          <div className="about-quote">&ldquo;Ik heb mijn eigen methode bewezen — aan mijzelf.&rdquo;</div>
          <p className="about-text">
            Vanaf mijn <strong>17e speelde ik ijshockey op het hoogste niveau van Nederland</strong>. In mijn laatste seizoen voor de Korps Mariniers opleiding vertegenwoordigde ik <strong>het Nederlands mannen team</strong> en behaalden we een <strong>gouden medaille</strong>. Daarna: de Mariniers.
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
              ['GOUD 🥇','Nederlands Mannen IJshockeyteam'],
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
            { icon:'🎯', title:'1-OP-1 COACHING',      desc:'Persoonlijk traject op maat — van intake en doelstelling tot periodisering en uitvoering. Online, in-person of hybrid.',                                         tag:'Hybrid' },
            { icon:'🪖', title:'TACTICAL ATHLETE',     desc:'Voorbereiding op Defensie, politie, brandweer of speciale eenheden. Fysiek én mentaal klaar voor selectie en opleiding.',                                       tag:'Defensie · Politie · Brandweer' },
            { icon:'🏅', title:'TOPSPORT BEGELEIDING', desc:'Voor sporters met een specifiek doel en de gedrevenheid om het te halen. Periodisering, kracht, conditie en mentale weerbaarheid.',                              tag:'Seizoensvoorbereiding' },
            { icon:'⚡', title:'HYROX VOORBEREIDING',  desc:'Van nulmeting tot race day. Opbouw, tijdverbetering en volledige race-specifieke conditionering. Gebaseerd op eigen Hyrox prestaties.',                          tag:'Beginners · Tijdverbetering' },
            { icon:'🏢', title:'TEAM & BEDRIJF',       desc:'Teamtrainingen, bootcamps en groepslessen voor bedrijven en sportclubs. Spinning, boxing en functionele training. Ook beschikbaar als externe instructeur.',  tag:'B2B · Sportscholen · Events' },
            { icon:'🏃', title:'LOOPCOACHING',         desc:'Techniek, opbouw en race-voorbereiding. Van beginners tot hardlopers met een tijdsdoel. KNAU gecertificeerd looptrainer niveau 3.',                              tag:'KNAU Gecertificeerd' },
          ].map((d, i) => (
            <div key={d.title} className={`dienst-card fade-in delay-${(i % 3) + 1}`}>
              <div className="dienst-icon">{d.icon}</div>
              <div className="dienst-title">{d.title}</div>
              <div className="dienst-desc">{d.desc}</div>
              <div className="dienst-tag">{d.tag}</div>
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
            <polygon points="18,2 13,28 23,28" fill="#FF4D00"/>
            <polygon points="5,7 0,28 14,28" fill="#FF4D00" opacity="0.5"/>
            <polygon points="31,7 23,28 36,28" fill="#FF4D00" opacity="0.5"/>
          </svg>
          <span style={{fontFamily:'Oswald, sans-serif', fontSize:16, letterSpacing:3, color:'#888'}}>GV PERFORMANCE</span>
        </div>
        <div className="footer-copy">© 2025 GV Performance — Guido Vols · Den Haag</div>
        <div className="footer-links">
          <a href="#">Instagram</a>
          <a href="#">LinkedIn</a>
          <a href="#contact">Contact</a>
          <a href="#">Privacybeleid</a>
        </div>
      </footer>
    </>
  )
}
