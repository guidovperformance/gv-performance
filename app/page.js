'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

// ─── FONTS LADEN ──────────────────────────────────────────────────────────────
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Barlow+Condensed:wght@400;500;600;700&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0f0f0f; color: #f0ede8; font-family: 'Barlow Condensed', sans-serif; }

    /* ── Hover animaties ── */
    .service-card {
      background: #1a1a1a;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.06);
      padding: 28px 24px;
      transition: border-color 0.25s, transform 0.25s, background 0.25s;
      cursor: default;
    }
    .service-card:hover {
      border-color: rgba(255,77,0,0.4);
      background: #1e1e1e;
      transform: translateY(-4px);
    }

    .pakket-card {
      background: #1a1a1a;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.06);
      padding: 28px 24px;
      transition: border-color 0.25s, transform 0.2s;
      position: relative;
    }
    .pakket-card:hover {
      border-color: rgba(255,77,0,0.35);
      transform: translateY(-3px);
    }
    .pakket-card.featured {
      border-color: rgba(255,77,0,0.4);
    }
    .pakket-card.featured:hover {
      border-color: #FF4D00;
      transform: translateY(-5px);
    }

    .nav-link {
      color: #888;
      text-decoration: none;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      transition: color 0.2s;
      position: relative;
    }
    .nav-link::after {
      content: '';
      position: absolute;
      bottom: -3px;
      left: 0;
      width: 0;
      height: 2px;
      background: #FF4D00;
      transition: width 0.25s;
    }
    .nav-link:hover { color: #f0ede8; }
    .nav-link:hover::after { width: 100%; }

    .cert-pill {
      display: inline-block;
      padding: 5px 14px;
      border-radius: 20px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #888;
      transition: background 0.2s, border-color 0.2s, color 0.2s;
    }
    .cert-pill:hover {
      background: rgba(255,77,0,0.1);
      border-color: rgba(255,77,0,0.3);
      color: #FF4D00;
    }

    .btn-primary {
      display: inline-block;
      background: #FF4D00;
      color: #000;
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 700;
      font-size: 13px;
      letter-spacing: 2px;
      text-transform: uppercase;
      padding: 14px 28px;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.2s, transform 0.15s;
    }
    .btn-primary:hover {
      background: #e64400;
      transform: translateY(-1px);
    }

    .btn-ghost {
      display: inline-block;
      background: transparent;
      color: #f0ede8;
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 600;
      font-size: 13px;
      letter-spacing: 2px;
      text-transform: uppercase;
      padding: 14px 28px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.15);
      cursor: pointer;
      text-decoration: none;
      transition: border-color 0.2s, background 0.2s;
    }
    .btn-ghost:hover {
      border-color: rgba(255,255,255,0.35);
      background: rgba(255,255,255,0.05);
    }

    .werkwijze-step {
      display: flex;
      gap: 20px;
      padding: 20px 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      transition: background 0.2s;
    }
    .werkwijze-step:last-child { border-bottom: none; }

    .contact-form input,
    .contact-form textarea,
    .contact-form select {
      background: #1a1a1a;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      color: #f0ede8;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 14px;
      padding: 14px 16px;
      width: 100%;
      outline: none;
      transition: border-color 0.2s;
      color-scheme: dark;
    }
    .contact-form input:focus,
    .contact-form textarea:focus,
    .contact-form select:focus {
      border-color: rgba(255,77,0,0.5);
    }

    /* Hamburger menu mobiel */
    .hamburger { display: none; background: none; border: none; cursor: pointer; padding: 4px; }
    .mobile-menu { display: none; }

    @media (max-width: 768px) {
      .desktop-nav { display: none !important; }
      .hamburger { display: block; }
      .mobile-menu.open {
        display: flex;
        flex-direction: column;
        position: fixed;
        inset: 0;
        background: #141414;
        z-index: 200;
        padding: 80px 32px 40px;
        gap: 20px;
      }
      .hero-grid { grid-template-columns: 1fr !important; }
      .services-grid { grid-template-columns: 1fr !important; }
      .pakketten-grid { grid-template-columns: 1fr !important; }
      .werkwijze-grid { grid-template-columns: 1fr !important; }
    }
  `}</style>
)

export default function Homepage() {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [formData, setFormData] = React.useState({ naam: '', email: '', pakket: '', bericht: '' })
  const [formStatus, setFormStatus] = React.useState('idle')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormStatus('loading')
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      setFormStatus('success')
    } catch {
      setFormStatus('error')
    }
  }

  const D = { fontFamily: "'Oswald', Impact, sans-serif" }
  const B = { fontFamily: "'Barlow Condensed', sans-serif" }

  return (
    <>
      <FontStyle />
      <div style={{ background: '#0f0f0f', minHeight: '100vh', color: '#f0ede8', fontFamily: "'Barlow Condensed', sans-serif" }}>

        {/* ── NAVIGATIE ── */}
        <nav style={{ background: 'rgba(15,15,15,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 clamp(16px,5vw,60px)', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <svg width="20" height="18" viewBox="0 0 36 34">
                <polygon points="18,2 13,28 23,28" fill="#FF4D00"/>
                <polygon points="5,7 0,28 14,28" fill="#FF4D00" opacity="0.5"/>
                <polygon points="31,7 23,28 36,28" fill="#FF4D00" opacity="0.5"/>
              </svg>
              <span style={{ ...D, fontSize: 15, letterSpacing: '3px', fontWeight: 700, color: '#f0ede8' }}>GV PERFORMANCE</span>
            </a>

            <div className="desktop-nav" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
              {['#diensten','#over','#werkwijze','#pakketten'].map((href, i) => (
                <a key={href} className="nav-link" href={href}>{['Diensten','Over Guido','Werkwijze','Pakketten'][i]}</a>
              ))}
            </div>

            <div className="desktop-nav" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <a href="/login" style={{ ...B, fontSize: 12, letterSpacing: '2px', color: '#888', textTransform: 'uppercase', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e=>e.target.style.color='#f0ede8'} onMouseLeave={e=>e.target.style.color='#888'}>
                Inloggen
              </a>
              <a href="#contact" className="btn-primary" style={{ padding: '9px 20px', fontSize: 11 }}>Gratis intake</a>
            </div>

            {/* Hamburger */}
            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
                <rect width="22" height="2" rx="1" fill={menuOpen ? '#FF4D00' : '#888'}/>
                <rect y="7" width="22" height="2" rx="1" fill={menuOpen ? '#FF4D00' : '#888'}/>
                <rect y="14" width="22" height="2" rx="1" fill={menuOpen ? '#FF4D00' : '#888'}/>
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
            <button onClick={() => setMenuOpen(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: '#888', fontSize: 24, cursor: 'pointer' }}>✕</button>
            {['#diensten','#over','#werkwijze','#pakketten','#contact'].map((href, i) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}
                style={{ ...D, fontSize: 28, fontWeight: 700, color: '#f0ede8', textDecoration: 'none', letterSpacing: '1px' }}>
                {['Diensten','Over Guido','Werkwijze','Pakketten','Contact'][i]}
              </a>
            ))}
            <a href="/login" className="btn-primary" style={{ textAlign: 'center', marginTop: 16 }}>Inloggen</a>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={{ padding: 'clamp(60px,10vw,100px) clamp(16px,5vw,60px)', maxWidth: 1100, margin: '0 auto' }}>
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,77,0,0.1)', border: '1px solid rgba(255,77,0,0.3)', borderRadius: 20, padding: '5px 14px', marginBottom: 20 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF4D00' }} />
                <span style={{ ...B, fontSize: 11, color: '#FF4D00', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Tactical Athlete Coaching</span>
              </div>
              <h1 style={{ ...D, fontSize: 'clamp(40px, 6vw, 68px)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.5px', marginBottom: 20 }}>
                Presteer op je<br />
                <span style={{ color: '#FF4D00' }}>hoogste niveau.</span><br />
                In sport én leven.
              </h1>
              <p style={{ ...B, fontSize: 16, color: '#888', lineHeight: 1.7, maxWidth: 480, marginBottom: 32 }}>
                1-op-1 coaching voor tactische atleten, militairen en serieuze sporters. Gebaseerd op AMF, NSCA en bewezen methoden — voor jouw doelen.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href="#contact" className="btn-primary">Gratis intake gesprek</a>
                <a href="#pakketten" className="btn-ghost">Bekijk pakketten</a>
              </div>
              <div style={{ display: 'flex', gap: 24, marginTop: 40, flexWrap: 'wrap' }}>
                {['12+ klanten begeleid', 'BJJ & tactical athlete', 'NSCA gecertificeerd'].map(s => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF4D00' }} />
                    <span style={{ ...B, fontSize: 12, color: '#666', letterSpacing: '0.5px' }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div style={{ background: '#1a1a1a', borderRadius: 20, border: '1px solid rgba(255,77,0,0.2)', padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ ...B, fontSize: 10, color: '#FF4D00', letterSpacing: '3px', textTransform: 'uppercase' }}>AMF Testresultaten</div>
              {[['Hexbar Deadlift 1RM','200 kg','PRO'],['Bench Press 1RM','130 kg','ELITE'],['Max Pull-ups','20 reps','PRO'],['1500m Run','4:45 min','ELITE']].map(([test, value, level]) => {
                const lvlColors = { PRO: '#a78bfa', ELITE: '#fb923c', GOOD: '#4ade80' }
                return (
                  <div key={test} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ ...B, fontSize: 13, color: '#888' }}>{test}</span>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ ...D, fontSize: 15, fontWeight: 700, color: '#f0ede8' }}>{value}</span>
                      <span style={{ ...B, fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', color: lvlColors[level] || '#888', background: (lvlColors[level] || '#888') + '18', padding: '2px 8px', borderRadius: 10 }}>{level}</span>
                    </div>
                  </div>
                )
              })}
              <div style={{ marginTop: 4 }}>
                <div style={{ ...B, fontSize: 10, color: '#555', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 10 }}>MAS Kalibratie (1500m)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[['MAS','4.76 m/s'],['LSD Tempo','3.33 m/s'],['Interval /4min','1028m'],['Niveau','Gevorderd']].map(([l,v]) => (
                    <div key={l} style={{ background: '#222', borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ ...B, fontSize: 9, color: '#555', letterSpacing: '1px', marginBottom: 3 }}>{l}</div>
                      <div style={{ ...D, fontSize: 14, fontWeight: 700, color: '#FF4D00' }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Scheidingslijn */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(16px,5vw,60px)' }}>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
        </div>

        {/* ── DIENSTEN ── */}
        <section id="diensten" style={{ padding: 'clamp(48px,8vw,80px) clamp(16px,5vw,60px)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ display: 'block', width: 20, height: 2, background: '#FF4D00', borderRadius: 1 }} />
              <span style={{ ...B, fontSize: 10, color: '#FF4D00', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase' }}>Diensten</span>
            </div>
            <h2 style={{ ...D, fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, marginBottom: 40, letterSpacing: '0.5px' }}>Wat ik voor jou doe</h2>
            <div className="services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { icon: '🎯', title: '1-op-1 Coaching', desc: 'Persoonlijk trainingsplan afgestemd op jouw doelen, rooster en sportachtergrond. Wekelijkse check-ins en aanpassingen.' },
                { icon: '📊', title: 'Performance Testing', desc: 'Volledige AMF testbatterij — kracht (DL/BP), conditie (1500m/MAS), agility, mobiliteit en militaire normen.' },
                { icon: '🏋️', title: 'Periodisering', desc: 'Macro/meso/micro periodisering gebaseerd op NSCA en AMF methodologie. Van hypertrofie tot piek.' },
                { icon: '🥋', title: 'BJJ Integratie', desc: 'Training specifiek aangepast voor grapplers. Grip, explosiviteit en aerobe capaciteit gecombineerd.' },
                { icon: '🪖', title: 'Militaire Fitness', desc: 'Voorbereiding op AMF toets, functiecluster 1-3/4-6 normen en operationele inzetbaarheid.' },
                { icon: '📱', title: 'Online Dashboard', desc: 'Eigen platform met trainingsschema, check-ins, testresultaten en direct contact met je coach.' },
              ].map(s => (
                <div key={s.title} className="service-card">
                  <div style={{ fontSize: 28, marginBottom: 14 }}>{s.icon}</div>
                  <div style={{ ...D, fontSize: 18, fontWeight: 700, letterSpacing: '0.5px', marginBottom: 8, color: '#f0ede8' }}>{s.title}</div>
                  <div style={{ ...B, fontSize: 13, color: '#666', lineHeight: 1.65 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── OVER GUIDO ── */}
        <section id="over" style={{ padding: 'clamp(48px,8vw,80px) clamp(16px,5vw,60px)', background: '#141414' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 60, alignItems: 'center' }} className="hero-grid">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span style={{ display: 'block', width: 20, height: 2, background: '#FF4D00', borderRadius: 1 }} />
                  <span style={{ ...B, fontSize: 10, color: '#FF4D00', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase' }}>Over Guido</span>
                </div>
                <h2 style={{ ...D, fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 20 }}>
                  Coach. Atleet.<br /><span style={{ color: '#FF4D00' }}>Practitioner.</span>
                </h2>
                <p style={{ ...B, fontSize: 15, color: '#888', lineHeight: 1.7, marginBottom: 20 }}>
                  Als BJJ-atleet en tactical athlete weet ik wat het vraagt om meerdere disciplines tegelijk te trainen. Ik begeleid klanten met een systeem dat werkt voor jouw sport en leven — op basis van wetenschap, niet van gevoel.
                </p>
                <p style={{ ...B, fontSize: 15, color: '#888', lineHeight: 1.7, marginBottom: 28 }}>
                  Mijn aanpak combineert de AMF testmethodologie van Defensie met NSCA Tactical S&C principes en Helgeruds Noorse intervalmethode voor maximale resultaten in minimale tijd.
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['NSCA Tactical S&C','BJJ Competitor','AMF Protocol','Garmin Athlete','McGill Protocol','Helgerud Method'].map(c => (
                    <span key={c} className="cert-pill">{c}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { n:'VO2max', v:'52', u:'ml/kg/min' },
                  { n:'HRV 7d gem.', v:'92', u:'ms' },
                  { n:'Rustpols', v:'43', u:'bpm' },
                  { n:'Gewicht', v:'80.5', u:'kg' },
                ].map(s => (
                  <div key={s.n} style={{ background: '#1e1e1e', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: '20px 16px' }}>
                    <div style={{ ...B, fontSize: 10, color: '#555', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 6 }}>{s.n}</div>
                    <div style={{ ...D, fontSize: 28, fontWeight: 700, color: '#FF4D00', lineHeight: 1 }}>{s.v}</div>
                    <div style={{ ...B, fontSize: 11, color: '#555', marginTop: 2 }}>{s.u}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── WERKWIJZE ── */}
        <section id="werkwijze" style={{ padding: 'clamp(48px,8vw,80px) clamp(16px,5vw,60px)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ display: 'block', width: 20, height: 2, background: '#FF4D00', borderRadius: 1 }} />
              <span style={{ ...B, fontSize: 10, color: '#FF4D00', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase' }}>Werkwijze</span>
            </div>
            <h2 style={{ ...D, fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, marginBottom: 40 }}>Zo gaan we te werk</h2>
            <div style={{ maxWidth: 680 }}>
              {[
                { n:'01', t:'Intake gesprek', d:'Gratis kennismaking. We bespreken je doelen, achtergrond, beschikbare tijd en eventuele blessures.' },
                { n:'02', t:'Nulmeting (AMF)', d:'Volledige testbatterij: kracht, conditie, agility en mobiliteit. Baseline voor alle trainingsintensiteiten.' },
                { n:'03', t:'Persoonlijk plan', d:'Op basis van de nulmeting bouw ik een volledig periodiseringsplan — macro, meso en micro gecombineerd.' },
                { n:'04', t:'Uitvoering & monitoring', d:'Jij traint, ik monitor via dagelijkse check-ins, HRV-data en wekelijkse evaluaties. Plan past zich aan.' },
                { n:'05', t:'Progressiemeting', d:'Na elke fase een nieuwe meting. Zo zien we concreet wat je vooruitgang is en stellen we bij waar nodig.' },
              ].map((step, i) => (
                <div key={step.n} className="werkwijze-step">
                  <div style={{ ...D, fontSize: 24, fontWeight: 700, color: i === 0 ? '#FF4D00' : '#2a2a2a', minWidth: 40 }}>{step.n}</div>
                  <div>
                    <div style={{ ...D, fontSize: 18, fontWeight: 700, color: '#f0ede8', letterSpacing: '0.5px', marginBottom: 4 }}>{step.t}</div>
                    <div style={{ ...B, fontSize: 13, color: '#666', lineHeight: 1.65 }}>{step.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PAKKETTEN ── */}
        <section id="pakketten" style={{ padding: 'clamp(48px,8vw,80px) clamp(16px,5vw,60px)', background: '#141414' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ display: 'block', width: 20, height: 2, background: '#FF4D00', borderRadius: 1 }} />
              <span style={{ ...B, fontSize: 10, color: '#FF4D00', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase' }}>Pakketten</span>
            </div>
            <h2 style={{ ...D, fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, marginBottom: 40 }}>Kies jouw traject</h2>
            <div className="pakketten-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { name: 'Starter', price: '€119', per: '/maand', featured: false,
                  features: ['Weekschema online', 'Dagelijkse check-ins', 'Maandelijkse evaluatie', 'Persoonlijk dashboard'] },
                { name: 'Performance', price: '€229', per: '/maand', featured: true,
                  features: ['Volledig trainingsplan', 'AMF testbatterij', 'Wekelijkse evaluaties', 'WhatsApp support', 'HRV-gebaseerde aanpassingen', 'Video feedback'] },
                { name: 'Elite', price: '€399', per: '/maand', featured: false,
                  features: ['Alles van Performance', 'Dagelijkse begeleiding', 'Voedingsadvies', 'Video analyse', 'Direct bellen', 'Onbeperkte aanpassingen'] },
              ].map((p) => (
                <div key={p.name} className={`pakket-card ${p.featured ? 'featured' : ''}`}>
                  {p.featured && (
                    <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: '#FF4D00', color: '#000', ...B, fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', padding: '3px 14px', borderRadius: '0 0 8px 8px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Meest gekozen</div>
                  )}
                  <div style={{ marginTop: p.featured ? 16 : 0 }}>
                    <div style={{ ...B, fontSize: 11, color: '#888', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8 }}>{p.name}</div>
                    <div style={{ ...D, fontSize: 36, fontWeight: 700, color: '#f0ede8', lineHeight: 1 }}>
                      {p.price}<span style={{ ...B, fontSize: 13, color: '#555', fontWeight: 400 }}>{p.per}</span>
                    </div>
                    <div style={{ margin: '20px 0', height: 1, background: 'rgba(255,255,255,0.06)' }} />
                    {p.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 9 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF4D00', flexShrink: 0, marginTop: 5 }} />
                        <span style={{ ...B, fontSize: 13, color: '#888', lineHeight: 1.5 }}>{f}</span>
                      </div>
                    ))}
                    <a href="#contact" className={p.featured ? 'btn-primary' : 'btn-ghost'} style={{ display: 'block', textAlign: 'center', marginTop: 20 }}>
                      Kies {p.name}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section id="contact" style={{ padding: 'clamp(48px,8vw,80px) clamp(16px,5vw,60px)' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ display: 'block', width: 20, height: 2, background: '#FF4D00', borderRadius: 1 }} />
              <span style={{ ...B, fontSize: 10, color: '#FF4D00', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase' }}>Contact</span>
            </div>
            <h2 style={{ ...D, fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, marginBottom: 8 }}>Klaar om te beginnen?</h2>
            <p style={{ ...B, fontSize: 15, color: '#888', lineHeight: 1.7, marginBottom: 36 }}>
              Stuur een bericht. Het eerste gesprek is altijd gratis en vrijblijvend.
            </p>

            {formStatus === 'success' ? (
              <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 16, padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <div style={{ ...D, fontSize: 22, fontWeight: 700, color: '#4ade80', marginBottom: 8 }}>Bericht verstuurd!</div>
                <div style={{ ...B, fontSize: 14, color: '#888' }}>Ik neem zo snel mogelijk contact met je op.</div>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ ...B, fontSize: 10, color: '#666', letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Naam *</label>
                    <input type="text" required placeholder="Jan Jansen" value={formData.naam} onChange={e => setFormData(p => ({...p, naam: e.target.value}))} />
                  </div>
                  <div>
                    <label style={{ ...B, fontSize: 10, color: '#666', letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>E-mail *</label>
                    <input type="email" required placeholder="jan@email.nl" value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} />
                  </div>
                </div>
                <div>
                  <label style={{ ...B, fontSize: 10, color: '#666', letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Pakket interesse</label>
                  <select value={formData.pakket} onChange={e => setFormData(p => ({...p, pakket: e.target.value}))}>
                    <option value="">— Kies een pakket —</option>
                    <option>Starter (€119/maand)</option>
                    <option>Performance (€229/maand)</option>
                    <option>Elite (€399/maand)</option>
                    <option>Weet ik nog niet</option>
                  </select>
                </div>
                <div>
                  <label style={{ ...B, fontSize: 10, color: '#666', letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Bericht *</label>
                  <textarea required rows={5} placeholder="Vertel kort over je doelen, sport en beschikbare trainingstijd..." value={formData.bericht} onChange={e => setFormData(p => ({...p, bericht: e.target.value}))} style={{ resize: 'vertical' }} />
                </div>

                {formStatus === 'error' && (
                  <div style={{ ...B, fontSize: 13, color: '#f87171', padding: '12px 16px', background: 'rgba(248,113,113,0.1)', borderRadius: 10 }}>
                    Er ging iets mis. Probeer opnieuw of mail naar guidovperformance@gmail.com
                  </div>
                )}

                <button type="submit" className="btn-primary" disabled={formStatus === 'loading'} style={{ padding: '15px', fontSize: 13, cursor: 'pointer', opacity: formStatus === 'loading' ? 0.7 : 1 }}>
                  {formStatus === 'loading' ? 'Versturen...' : 'Verstuur bericht'}
                </button>
                <p style={{ ...B, fontSize: 11, color: '#555', textAlign: 'center' }}>Eerste gesprek is gratis en vrijblijvend.</p>
              </form>
            )}
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ background: '#141414', borderTop: '1px solid rgba(255,255,255,0.06)', padding: 'clamp(24px,4vw,40px) clamp(16px,5vw,60px)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="14" viewBox="0 0 36 34">
                <polygon points="18,2 13,28 23,28" fill="#FF4D00"/>
                <polygon points="5,7 0,28 14,28" fill="#FF4D00" opacity="0.5"/>
                <polygon points="31,7 23,28 36,28" fill="#FF4D00" opacity="0.5"/>
              </svg>
              <span style={{ ...D, fontSize: 13, letterSpacing: '2px', color: '#f0ede8' }}>GV PERFORMANCE</span>
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <a href="/privacy" style={{ ...B, fontSize: 11, color: '#555', letterSpacing: '1px', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e=>e.target.style.color='#888'} onMouseLeave={e=>e.target.style.color='#555'}>
                Privacybeleid
              </a>
              <a href="/login" style={{ ...B, fontSize: 11, color: '#555', letterSpacing: '1px', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e=>e.target.style.color='#888'} onMouseLeave={e=>e.target.style.color='#555'}>
                Inloggen
              </a>
            </div>
            <div style={{ ...B, fontSize: 11, color: '#444' }}>© 2026 GV Performance · Guido Vols</div>
          </div>
        </footer>

      </div>
    </>
  )
}
