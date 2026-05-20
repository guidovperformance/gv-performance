'use client'

import React from 'react'
import Image from 'next/image'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

function ContactSection() {
  const [form, setForm] = React.useState({ voornaam: '', achternaam: '', email: '', dienst: '', bericht: '' })
  const [status, setStatus] = React.useState('idle')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setStatus('success')
        setForm({ voornaam: '', achternaam: '', email: '', dienst: '', bericht: '' })
      } else { setStatus('error') }
    } catch { setStatus('error') }
  }

  const inputStyle = { background: 'var(--dark3)', border: '1px solid var(--dark4)', color: 'var(--text)', fontFamily: 'var(--font-barlow), sans-serif', fontSize: 15, padding: '14px 16px', outline: 'none', width: '100%' }

  return (
    <section id="contact" style={{ padding: '100px 60px', background: 'var(--dark2)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
      <div>
        <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'block', width: 24, height: 2, background: 'var(--orange)' }} />Kennismaking
        </div>
        <h2 style={{ ...D, fontSize: 'clamp(42px, 5vw, 68px)', letterSpacing: 1, lineHeight: 1, marginBottom: 24, fontWeight: 700 }}>KLAAR OM TE STARTEN?</h2>
        <p style={{ ...B, fontSize: 16, color: '#aaa', lineHeight: 1.8, marginBottom: 36 }}>Stuur een bericht en ik neem binnen 24 uur contact op voor een vrijblijvend kennismakingsgesprek.</p>
        {[['📍', 'Locatie', 'Den Haag & omgeving · Online beschikbaar'], ['⚡', 'Reactietijd', 'Binnen 24 uur op werkdagen'], ['🎯', 'Eerste stap', 'Gratis kennismakingsgesprek van 30 min']].map(([icon, label, text]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, background: 'var(--orange-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{icon}</div>
            <div>
              <div style={{ ...B, fontSize: 10, letterSpacing: 2, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
              <div style={{ ...B, fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>{text}</div>
            </div>
          </div>
        ))}
      </div>
      {status === 'success' ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16, background: 'var(--dark3)', padding: 40 }}>
          <div style={{ fontSize: 48 }}>✅</div>
          <div style={{ ...D, fontSize: 28, fontWeight: 700, letterSpacing: 2 }}>BERICHT VERSTUURD!</div>
          <div style={{ ...B, fontSize: 15, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6 }}>Bedankt voor je bericht. Ik neem binnen 24 uur contact met je op.</div>
          <button onClick={() => setStatus('idle')} style={{ marginTop: 16, background: 'transparent', border: '1px solid var(--orange)', color: 'var(--orange)', ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', padding: '10px 24px', cursor: 'pointer' }}>Nieuw bericht sturen</button>
        </div>
      ) : (
        <form style={{ display: 'flex', flexDirection: 'column', gap: 14 }} onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ ...B, fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>Voornaam *</label>
              <input required type="text" placeholder="Voornaam" value={form.voornaam} onChange={e => setForm({...form, voornaam: e.target.value})} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ ...B, fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>Achternaam</label>
              <input type="text" placeholder="Achternaam" value={form.achternaam} onChange={e => setForm({...form, achternaam: e.target.value})} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ ...B, fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>E-mailadres *</label>
            <input required type="email" placeholder="jouw@email.nl" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ ...B, fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>Interesse in</label>
            <select value={form.dienst} onChange={e => setForm({...form, dienst: e.target.value})} style={inputStyle}>
              <option value="">Selecteer een dienst...</option>
              {['— Pakketten —', 'Pakket: Starter (Online · €119/mnd)', 'Pakket: Performance (Hybrid · €229/mnd)', 'Pakket: Elite (Full Service · €399/mnd)', '— Individueel —', '1-op-1 Coaching', 'Tactical Athlete Voorbereiding', 'Topsport Begeleiding', 'Hyrox Voorbereiding', 'Loopcoaching', '— Groepen & Bedrijven —', 'Team & Groepsvorming', 'Bootcamp', 'Bedrijfstraining / Fit op het werk', 'Sportschool Inhuur (Spinning, Boxing, S&C)', '— Overig —', 'Anders / Vraag'].map(o => <option key={o} disabled={o.startsWith('—')} style={o.startsWith('—') ? {color: 'var(--muted)', fontWeight: 700} : {}}>{o}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ ...B, fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>Jouw bericht *</label>
            <textarea required placeholder="Vertel kort over je doel of situatie..." rows={5} value={form.bericht} onChange={e => setForm({...form, bericht: e.target.value})} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          {status === 'error' && (
            <div style={{ ...B, fontSize: 13, color: '#ff6b6b', padding: '12px 16px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)' }}>
              Er ging iets mis. Probeer het opnieuw of mail direct naar guidovperformance@gmail.com
            </div>
          )}
          <button type="submit" disabled={status === 'loading'} style={{ background: status === 'loading' ? 'var(--muted2)' : 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', padding: 16, border: 'none', cursor: status === 'loading' ? 'not-allowed' : 'pointer', width: '100%' }}>
            {status === 'loading' ? 'VERSTUREN...' : 'VERSTUUR BERICHT'}
          </button>
        </form>
      )}
    </section>
  )
}

export default function Home() {
  return (
    <div style={{ background: 'var(--dark)', color: 'var(--text)', ...B }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 60px', borderBottom: '1px solid rgba(255,77,0,0.12)', background: 'rgba(10,10,10,0.97)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <svg width="36" height="34" viewBox="0 0 36 34">
            <polygon points="18,2 13,28 23,28" fill="#FF4D00" />
            <polygon points="5,7 0,28 14,28" fill="#FF4D00" opacity="0.5" />
            <polygon points="31,7 23,28 36,28" fill="#FF4D00" opacity="0.5" />
            <rect x="0" y="31" width="36" height="2" fill="#FF4D00" opacity="0.2" />
          </svg>
          <div>
            <div style={{ ...D, fontSize: 22, letterSpacing: 3, color: 'var(--text)', lineHeight: 1, fontWeight: 700 }}>GV PERFORMANCE</div>
            <div style={{ ...B, fontSize: 10, letterSpacing: 3, color: 'var(--orange)', marginTop: 2 }}>GUIDO VOLS</div>
          </div>
        </div>
        <ul style={{ display: 'flex', gap: 36, listStyle: 'none' }}>
          {[['#over', 'Over Guido'], ['#diensten', 'Diensten'], ['/pakketten', 'Pakketten'], ['#werkwijze', 'Werkwijze']].map(([href, label]) => (
            <li key={href}>
              <a href={href} style={{ ...B, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>{label}</a>
            </li>
          ))}
          <li>
            <a href="#contact" style={{ ...B, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: '#000', background: 'var(--orange)', padding: '10px 22px', textDecoration: 'none', fontWeight: 700 }}>Kennismaking</a>
          </li>
        </ul>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '92vh', position: 'relative', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <Image
          src="/hero.jpg"
          alt="Guido Vols instrueert militairen op het veld"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center center' }}
          priority
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.75) 55%, rgba(10,10,10,0.2) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '80px 60px', maxWidth: '600px' }}>
          <div style={{ ...B, fontSize: 11, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ display: 'block', width: 32, height: 2, background: 'var(--orange)' }} />
            Coaching · Training · Tactical
          </div>
          <h1 style={{ ...D, fontSize: 'clamp(64px, 7vw, 96px)', lineHeight: 0.95, letterSpacing: 1, marginBottom: 10, fontWeight: 700 }}>
            JOUW<br />DOEL,<br /><span style={{ color: 'var(--orange)' }}>ONS PLAN</span>
          </h1>
          <div style={{ ...D, fontSize: 'clamp(22px, 2.5vw, 34px)', letterSpacing: 4, color: 'var(--muted)', marginBottom: 32, fontWeight: 400 }}>
            GV PERFORMANCE
          </div>
          <p style={{ ...B, fontSize: 16, color: '#ccc', maxWidth: 420, lineHeight: 1.7, marginBottom: 44 }}>
            Van topsporters tot tactische professionals — elk traject begint met een grondige analyse en eindigt met meetbaar resultaat. Geen generieke schema&apos;s. Alleen wat werkt voor jou.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <a href="#contact" style={{ background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', padding: '16px 36px', textDecoration: 'none' }}>Plan je kennismaking</a>
            <a href="#diensten" style={{ border: '1px solid rgba(255,255,255,0.3)', color: 'var(--text)', ...B, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', padding: '16px 36px', textDecoration: 'none' }}>Bekijk diensten</a>
          </div>
        </div>
      </section>

      {/* RIBBON */}
      <div style={{ background: 'var(--dark2)', borderTop: '1px solid rgba(255,77,0,0.1)', borderBottom: '1px solid rgba(255,77,0,0.1)', padding: '18px 60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        {['Korps Mariniers', '🥇 Gouden Medaille NL Mannen Team', 'Defensie Sport Instructeur', 'NBB Boxing Trainer KSS 3', 'Looptrainer Atletiek Unie', '13+ Certificaten'].map((item) => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 6, height: 6, background: 'var(--orange)', flexShrink: 0 }} />
            <span style={{ ...B, fontSize: 12, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>{item}</span>
          </div>
        ))}
      </div>

      {/* OVER GUIDO */}
      <section id="over" style={{ padding: '100px 60px', background: 'var(--dark2)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden' }}>
          <Image
            src="/about.jpg"
            alt="Guido Vols training"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
        </div>
        <div>
          <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'block', width: 24, height: 2, background: 'var(--orange)' }} />
            Over Guido
          </div>
          <h2 style={{ ...D, fontSize: 'clamp(36px, 4.5vw, 60px)', letterSpacing: 1, lineHeight: 1, marginBottom: 24, fontWeight: 700 }}>
            VAN GOUDEN PLAK TOT SPORTINSTRUCTEUR
          </h2>
          <div style={{ ...D, fontSize: 20, letterSpacing: 1, color: 'var(--orange)', lineHeight: 1.3, marginBottom: 28, borderLeft: '3px solid var(--orange)', paddingLeft: 20, fontWeight: 600 }}>
            &ldquo;Ik heb mijn eigen methode bewezen — aan mijzelf.&rdquo;
          </div>
          <p style={{ ...B, fontSize: 16, color: '#aaa', lineHeight: 1.8, marginBottom: 16 }}>
            Vanaf mijn <strong style={{ color: 'var(--text)' }}>17e speelde ik ijshockey op het hoogste niveau van Nederland</strong>. In mijn laatste seizoen voor de Korps Mariniers opleiding vertegenwoordigde ik <strong style={{ color: 'var(--text)' }}>het Nederlands mannen team</strong> en behaalden we een <strong style={{ color: 'var(--text)' }}>gouden medaille</strong>.
          </p>
          <p style={{ ...B, fontSize: 16, color: '#aaa', lineHeight: 1.8, marginBottom: 16 }}>
            Na de Mariniers groeide ik door als <strong style={{ color: 'var(--text)' }}>Defensie sport instructeur</strong>. Mijn kennis van periodisering, kracht en mentale coaching gebruik ik dagelijks — zowel binnen Defensie als daarbuiten.
          </p>
          <p style={{ ...B, fontSize: 16, color: '#aaa', lineHeight: 1.8, marginBottom: 36 }}>
            Datzelfde systeem zet ik in voor jou. Of je nu een topsporter, tactical athlete of gedreven amateur bent — <strong style={{ color: 'var(--text)' }}>jouw doel wordt ons plan</strong>.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              ['17 JAAR', 'Hoogste ijshockeycompetitie Nederland'],
              ['GOUD 🥇', 'Nederlands Mannen IJshockeyteam'],
              ['MARINIERS', 'Korps Mariniers opleiding & dienst'],
              ['INSTRUCTOR', 'Defensie sport instructeur'],
            ].map(([year, text]) => (
              <div key={year} style={{ background: 'var(--dark3)', padding: '18px 20px', borderLeft: '3px solid rgba(255,77,0,0.2)' }}>
                <div style={{ ...D, fontSize: 13, letterSpacing: 2, color: 'var(--orange)', marginBottom: 4, fontWeight: 600 }}>{year}</div>
                <div style={{ ...B, fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIENSTEN */}
      <section id="diensten" style={{ padding: '100px 60px', background: 'var(--dark)' }}>
        <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'block', width: 24, height: 2, background: 'var(--orange)' }} />
          Wat ik aanbied
        </div>
        <h2 style={{ ...D, fontSize: 'clamp(42px, 5vw, 68px)', letterSpacing: 1, lineHeight: 1, marginBottom: 60, fontWeight: 700 }}>DIENSTEN</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {[
            { icon: '🎯', title: '1-OP-1 COACHING', desc: 'Persoonlijk traject op maat — van intake en doelstelling tot periodisering en uitvoering. Online, in-person of hybrid.', tag: 'Hybrid · Online · In-person' },
            { icon: '🪖', title: 'TACTICAL ATHLETE', desc: 'Voorbereiding op Defensie, politie, brandweer of speciale eenheden. Fysiek én mentaal klaar voor selectie en opleiding.', tag: 'Defensie · Politie · Brandweer' },
            { icon: '🏅', title: 'TOPSPORT BEGELEIDING', desc: 'Voor sporters met een specifiek competitiedoel. Periodisering, kracht, conditie en mentale weerbaarheid door het hele seizoen.', tag: 'Seizoensvoorbereiding' },
            { icon: '⚡', title: 'HYROX VOORBEREIDING', desc: 'Van nulmeting tot race day. Volledige opbouw of tijdverbetering — gebaseerd op eigen Hyrox wedstrijdervaring.', tag: 'Beginners · Tijdverbetering' },
            { icon: '🏢', title: 'TEAM & GROEPSVORMING', desc: 'Bootcamps, teamtrainingen en groepsvorming voor bedrijven en sportteams. Ook inzetbaar voor "fit op het werk" programma\'s.', tag: 'Bedrijven · Teams · Bootcamps' },
            { icon: '🥊', title: 'GROEPSLESSEN & INHUUR', desc: 'Certified instructeur voor spinning, boxing en intervaltraining. Beschikbaar voor sportscholen, clubs en events als externe instructeur.', tag: 'Spinning · Boxing · Interval' },
          ].map((d) => (
            <div key={d.title} style={{ background: 'var(--dark2)', padding: '36px 32px', borderTop: '1px solid var(--dark3)', borderLeft: '1px solid var(--dark3)' }}>
              <div style={{ fontSize: 28, marginBottom: 16 }}>{d.icon}</div>
              <div style={{ ...D, fontSize: 22, letterSpacing: 1, marginBottom: 10, fontWeight: 700 }}>{d.title}</div>
              <div style={{ ...B, fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 14 }}>{d.desc}</div>
              <span style={{ ...B, display: 'inline-block', fontSize: 10, letterSpacing: 2, color: 'var(--orange)', textTransform: 'uppercase', border: '1px solid rgba(255,77,0,0.3)', padding: '4px 10px' }}>{d.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* HOE HET WERKT */}
      <section id="werkwijze" style={{ padding: '100px 60px', background: 'var(--dark2)', textAlign: 'center' }}>
        <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <span style={{ display: 'block', width: 24, height: 2, background: 'var(--orange)' }} />Werkwijze<span style={{ display: 'block', width: 24, height: 2, background: 'var(--orange)' }} />
        </div>
        <h2 style={{ ...D, fontSize: 'clamp(42px, 5vw, 68px)', letterSpacing: 1, lineHeight: 1, marginBottom: 60, fontWeight: 700 }}>HOE HET WERKT</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {[
            ['01', 'INTAKE & ANALYSE', 'Een grondige kennismaking. We brengen jouw uitgangssituatie, doelen en leefstijl in kaart. Nulmeting waar relevant.'],
            ['02', 'JOUW PLAN', 'Op basis van de intake maak ik een volledig uitgestippeld traject. Geperiodiseerd, meetbaar en op jou afgestemd.'],
            ['03', 'UITVOERING & GROEI', 'We gaan aan de slag. Continue monitoring, bijsturing waar nodig en vaste check-ins om op koers te blijven.'],
          ].map(([num, title, desc]) => (
            <div key={num} style={{ padding: '48px 32px', background: 'var(--dark3)' }}>
              <div style={{ ...D, fontSize: 80, color: 'rgba(255,77,0,0.1)', lineHeight: 1, marginBottom: 16, fontWeight: 700 }}>{num}</div>
              <div style={{ ...D, fontSize: 26, letterSpacing: 1, marginBottom: 12, fontWeight: 700 }}>{title}</div>
              <div style={{ ...B, fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 260, margin: '0 auto' }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CERTIFICATEN */}
      <section style={{ padding: '100px 60px', background: 'var(--dark)' }}>
        <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'block', width: 24, height: 2, background: 'var(--orange)' }} />
          Achtergrond & Kwalificaties
        </div>
        <h2 style={{ ...D, fontSize: 'clamp(42px, 5vw, 68px)', letterSpacing: 1, lineHeight: 1, marginBottom: 44, fontWeight: 700 }}>GECERTIFICEERD OP ALLE VLAKKEN</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {[
            { label: 'Korps Mariniers', featured: true },
            { label: 'Instructeur Fysieke Training & Sport', featured: true },
            { label: 'KSS 3 — Nederlandse Boks Bond', featured: true },
            { label: 'Basis Looptrainer 3 — Atletiek Unie', featured: true },
            { label: 'MBO 4 Trainer / Coach', featured: false },
            { label: 'Totaal Coach XXL (incl. mentaal)', featured: false },
            { label: 'Overload A & B (TOP methode)', featured: false },
            { label: 'Athletic Skills Model (ASM)', featured: false },
            { label: 'Power Cycling A + B — Always Fit', featured: false },
            { label: 'Xavier FIT A', featured: false },
            { label: 'Atletiek Baan Assistent 2 — Atletiek Unie', featured: false },
            { label: 'EHBO (actueel)', featured: false },
            { label: 'Lifeguard (actueel)', featured: false },
            { label: 'Voedingscursus', featured: false },
          ].map(({ label, featured }) => (
            <div key={label} style={{ background: featured ? 'var(--orange-dim)' : 'var(--dark3)', border: `1px solid ${featured ? 'rgba(255,77,0,0.4)' : 'var(--dark4)'}`, padding: '10px 18px', fontSize: 12, letterSpacing: 1, color: featured ? 'var(--text)' : 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8, ...B }}>
              <div style={{ width: 5, height: 5, background: 'var(--orange)', flexShrink: 0 }} />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <ContactSection />

      {/* FOOTER */}
      <footer style={{ background: 'var(--dark)', borderTop: '1px solid rgba(255,77,0,0.1)', padding: '40px 60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="24" height="22" viewBox="0 0 36 34">
            <polygon points="18,2 13,28 23,28" fill="#FF4D00" />
            <polygon points="5,7 0,28 14,28" fill="#FF4D00" opacity="0.5" />
            <polygon points="31,7 23,28 36,28" fill="#FF4D00" opacity="0.5" />
          </svg>
          <span style={{ ...D, fontSize: 16, letterSpacing: 3, color: 'var(--muted)', fontWeight: 600 }}>GV PERFORMANCE</span>
        </div>
        <div style={{ ...B, fontSize: 12, color: 'var(--muted2)', letterSpacing: 1 }}>© 2025 GV Performance — Guido Vols</div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Instagram', 'LinkedIn', 'Contact', 'Privacybeleid'].map((l) => (
            <a key={l} href="#" style={{ ...B, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted2)', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </footer>

    </div>
  )
}
