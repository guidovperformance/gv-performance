'use client'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

const check = '✓'

const packages = [
  {
    name: 'STARTER',
    sub: 'Online',
    price: '119',
    popular: false,
    desc: 'Volledig online begeleiding. Jij traint waar en wanneer het jou uitkomt.',
    features: [
      'Gepersonaliseerd trainingsplan',
      'Dashboard toegang & voortgang',
      'Maandelijkse video check-in',
      'WhatsApp support',
      'Periodisering op maat',
    ],
    notIncluded: [
      'In-person sessies',
      'Wekelijkse check-ins',
      'Mentale coaching',
    ],
    cta: 'Start met Starter',
    color: 'var(--dark3)',
    border: 'var(--dark4)',
  },
  {
    name: 'PERFORMANCE',
    sub: 'Hybrid',
    price: '229',
    popular: true,
    desc: 'De meest gekozen optie. Online structuur met persoonlijk contact op de mat.',
    features: [
      'Gepersonaliseerd trainingsplan',
      'Dashboard toegang & voortgang',
      'Wekelijkse check-in',
      '2x in-person sessie per maand',
      'Voortgangsrapportage',
      'WhatsApp support',
      'Periodisering op maat',
    ],
    notIncluded: [
      'Mentale coaching',
      'Dagelijkse dashboard feedback',
    ],
    cta: 'Kies Performance',
    color: '#0D0D0D',
    border: '#FF4D00',
  },
  {
    name: 'ELITE',
    sub: 'Full Service',
    price: '399',
    popular: false,
    desc: 'Voor de sporter die het maximale wil. Volledige begeleiding op alle vlakken.',
    features: [
      'Gepersonaliseerd trainingsplan',
      'Dashboard toegang & voortgang',
      'Wekelijkse check-in',
      '4x in-person sessie per maand',
      'Onbeperkt contact',
      'Mentale coaching inbegrepen',
      'Volledig periodiseringsplan',
      'Dagelijkse dashboard feedback',
      'Voedingsadvies',
    ],
    notIncluded: [],
    cta: 'Kies Elite',
    color: 'var(--dark3)',
    border: 'var(--dark4)',
  },
]

export default function Pakketten() {
  return (
    <div style={{ background: 'var(--dark)', color: 'var(--text)', ...B, minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 60px', borderBottom: '1px solid rgba(255,77,0,0.12)', background: 'rgba(10,10,10,0.97)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}>
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
        </a>
        <ul style={{ display: 'flex', gap: 36, listStyle: 'none' }}>
          {[['/#over', 'Over Guido'], ['/#diensten', 'Diensten'], ['/#werkwijze', 'Werkwijze']].map(([href, label]) => (
            <li key={href}>
              <a href={href} style={{ ...B, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>{label}</a>
            </li>
          ))}
          <li>
            <a href="/#contact" style={{ ...B, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: '#000', background: 'var(--orange)', padding: '10px 22px', textDecoration: 'none', fontWeight: 700 }}>Kennismaking</a>
          </li>
        </ul>
      </nav>

      {/* HERO */}
      <section style={{ padding: '80px 60px 60px', textAlign: 'center', borderBottom: '1px solid rgba(255,77,0,0.1)' }}>
        <div style={{ ...B, fontSize: 11, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <span style={{ display: 'block', width: 32, height: 2, background: 'var(--orange)' }} />
          Transparante prijzen
          <span style={{ display: 'block', width: 32, height: 2, background: 'var(--orange)' }} />
        </div>
        <h1 style={{ ...D, fontSize: 'clamp(48px, 6vw, 80px)', letterSpacing: 1, lineHeight: 1, marginBottom: 20, fontWeight: 700 }}>KIES JOUW PAKKET</h1>
        <p style={{ ...B, fontSize: 17, color: '#aaa', maxWidth: 560, margin: '0 auto 16px', lineHeight: 1.7 }}>
          Elk traject begint met een gratis kennismakingsgesprek van 30 minuten. Samen bepalen we welk pakket het beste bij jouw doel past.
        </p>
        <div style={{ ...B, fontSize: 13, color: 'var(--muted)', letterSpacing: 1 }}>
          Minimale afname 2 maanden · Daarna maandelijks opzegbaar
        </div>
      </section>

      {/* PACKAGES */}
      <section style={{ padding: '80px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, maxWidth: 1100, margin: '0 auto' }}>
          {packages.map((pkg) => (
            <div key={pkg.name} style={{
              background: pkg.popular ? '#0D0D0D' : 'var(--dark2)',
              border: `2px solid ${pkg.popular ? 'var(--orange)' : 'transparent'}`,
              padding: '40px 36px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {pkg.popular && (
                <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: 'var(--orange)', color: '#000', ...B, fontSize: 10, fontWeight: 700, letterSpacing: 2, padding: '5px 16px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  POPULAIRSTE KEUZE
                </div>
              )}

              <div style={{ ...B, fontSize: 11, letterSpacing: 3, color: pkg.popular ? 'var(--orange)' : 'var(--muted)', textTransform: 'uppercase', marginBottom: 8, marginTop: pkg.popular ? 12 : 0 }}>{pkg.sub}</div>
              <div style={{ ...D, fontSize: 32, letterSpacing: 2, color: 'var(--text)', fontWeight: 700, marginBottom: 4 }}>{pkg.name}</div>

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, margin: '24px 0 8px' }}>
                <span style={{ ...D, fontSize: 56, fontWeight: 700, color: pkg.popular ? 'var(--orange)' : 'var(--text)', lineHeight: 1 }}>€{pkg.price}</span>
                <span style={{ ...B, fontSize: 14, color: 'var(--muted)', marginBottom: 8 }}>/maand</span>
              </div>

              <div style={{ ...B, fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {pkg.desc}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 'auto', paddingBottom: 32 }}>
                {pkg.features.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ color: 'var(--orange)', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{check}</span>
                    <span style={{ ...B, fontSize: 14, color: 'var(--text)', lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
                {pkg.notIncluded.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, opacity: 0.3 }}>
                    <span style={{ color: 'var(--muted)', flexShrink: 0, marginTop: 1 }}>–</span>
                    <span style={{ ...B, fontSize: 14, color: 'var(--muted)', lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>

              <a href="/#contact" style={{
                display: 'block', textAlign: 'center', marginTop: 32,
                background: pkg.popular ? 'var(--orange)' : 'transparent',
                color: pkg.popular ? '#000' : 'var(--text)',
                border: pkg.popular ? 'none' : '1px solid var(--muted2)',
                ...B, fontWeight: 700, fontSize: 13, letterSpacing: 2,
                textTransform: 'uppercase', padding: '16px',
                textDecoration: 'none',
              }}>
                {pkg.cta}
              </a>
            </div>
          ))}
        </div>

        {/* In-person note */}
        <div style={{ maxWidth: 1100, margin: '20px auto 0', ...B, fontSize: 13, color: 'var(--muted)', textAlign: 'center', letterSpacing: 1 }}>
          In-person sessie = 15 min voorbereiding · 60 min training · 15 min nabespreking · Reiskosten bij &gt;15 min reistijd in overleg
        </div>
      </section>

      {/* ADD-ONS */}
      <section style={{ padding: '60px 60px', background: 'var(--dark2)', borderTop: '1px solid rgba(255,77,0,0.1)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'block', width: 24, height: 2, background: 'var(--orange)' }} />
            Uitbreidingen
          </div>
          <h2 style={{ ...D, fontSize: 'clamp(32px, 4vw, 52px)', letterSpacing: 1, lineHeight: 1, marginBottom: 40, fontWeight: 700 }}>ADD-ONS</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            {[
              { label: 'Extra in-person sessie', price: '€65 per sessie', desc: 'Voeg een losse sessie toe bovenop je pakket.' },
              { label: 'Reiskosten', price: 'In overleg', desc: 'Bij reistijd van meer dan 15 minuten. Guido komt naar jou.' },
            ].map((a) => (
              <div key={a.label} style={{ background: 'var(--dark3)', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
                <div>
                  <div style={{ ...D, fontSize: 18, letterSpacing: 1, fontWeight: 700, marginBottom: 6 }}>{a.label}</div>
                  <div style={{ ...B, fontSize: 13, color: 'var(--muted)' }}>{a.desc}</div>
                </div>
                <div style={{ ...D, fontSize: 22, fontWeight: 700, color: 'var(--orange)', flexShrink: 0 }}>{a.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GROEPEN & BEDRIJVEN */}
      <section style={{ padding: '60px 60px', background: 'var(--dark)', borderTop: '1px solid rgba(255,77,0,0.1)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>

          <div style={{ background: 'var(--dark2)', padding: '40px 36px' }}>
            <div style={{ ...B, fontSize: 10, letterSpacing: 3, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 10 }}>Bedrijven & Teams</div>
            <div style={{ ...D, fontSize: 26, fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>GROEPEN & BEDRIJVEN</div>
            <div style={{ ...B, fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 24 }}>
              Bootcamps, teamtrainingen en groepsvorming op maat. Ook beschikbaar als &ldquo;fit op het werk&rdquo; programma voor bedrijven.
            </div>
            {['Bootcamps', 'Teamtrainingen', 'Groepsvorming', 'Fit op het werk programma'].map((i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ color: 'var(--orange)', fontWeight: 700 }}>{check}</span>
                <span style={{ ...B, fontSize: 14 }}>{i}</span>
              </div>
            ))}
            <a href="/#contact" style={{ display: 'inline-block', marginTop: 24, ...B, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--orange)', textDecoration: 'none', borderBottom: '1px solid var(--orange)', paddingBottom: 2 }}>
              Offerte aanvragen →
            </a>
          </div>

          <div style={{ background: 'var(--dark2)', padding: '40px 36px' }}>
            <div style={{ ...B, fontSize: 10, letterSpacing: 3, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 10 }}>Sportscholen & Clubs</div>
            <div style={{ ...D, fontSize: 26, fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>SPORTSCHOOL INHUUR</div>
            <div style={{ ...B, fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 24 }}>
              Certified instructeur beschikbaar voor sportscholen, clubs en events. Vast rooster of incidenteel — beide mogelijk.
            </div>
            {['Spinning (certified)', 'Boxing lessen', 'Strength & Conditioning', 'Small Group Training'].map((i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ color: 'var(--orange)', fontWeight: 700 }}>{check}</span>
                <span style={{ ...B, fontSize: 14 }}>{i}</span>
              </div>
            ))}
            <a href="/#contact" style={{ display: 'inline-block', marginTop: 24, ...B, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--orange)', textDecoration: 'none', borderBottom: '1px solid var(--orange)', paddingBottom: 2 }}>
              Tarief opvragen →
            </a>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 60px', background: 'var(--dark2)', textAlign: 'center', borderTop: '1px solid rgba(255,77,0,0.1)' }}>
        <h2 style={{ ...D, fontSize: 'clamp(36px, 4vw, 56px)', letterSpacing: 1, lineHeight: 1, marginBottom: 20, fontWeight: 700 }}>NIET ZEKER WELK PAKKET?</h2>
        <p style={{ ...B, fontSize: 16, color: '#aaa', maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.7 }}>
          Plan een gratis kennismakingsgesprek van 30 minuten. We kijken samen naar jouw situatie en doel, en kiezen het pakket dat het beste past.
        </p>
        <a href="/#contact" style={{ background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', padding: '18px 48px', textDecoration: 'none', display: 'inline-block' }}>
          PLAN GRATIS KENNISMAKING
        </a>
        <div style={{ ...B, fontSize: 12, color: 'var(--muted)', marginTop: 16, letterSpacing: 1 }}>
          Geen verplichtingen · Binnen 24 uur reactie
        </div>
      </section>

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
          {[['/', 'Home'], ['/#diensten', 'Diensten'], ['/#contact', 'Contact']].map(([href, l]) => (
            <a key={l} href={href} style={{ ...B, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted2)', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </footer>

    </div>
  )
}
