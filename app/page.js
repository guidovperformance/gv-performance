'use client'

export default function Home() {
  return (
    <div style={{ background: 'var(--dark)', color: 'var(--text)', fontFamily: 'var(--font-body)' }}>

      {/* NAV */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '22px 60px', borderBottom: '1px solid rgba(255,77,0,0.12)',
        background: 'rgba(10,10,10,0.97)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <svg width="36" height="34" viewBox="0 0 36 34">
            <polygon points="18,2 13,28 23,28" fill="#FF4D00" />
            <polygon points="5,7 0,28 14,28" fill="#FF4D00" opacity="0.5" />
            <polygon points="31,7 23,28 36,28" fill="#FF4D00" opacity="0.5" />
            <rect x="0" y="31" width="36" height="2" fill="#FF4D00" opacity="0.2" />
          </svg>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 3, color: 'var(--text)', lineHeight: 1 }}>GV PERFORMANCE</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: 3, color: 'var(--orange)', marginTop: 2 }}>GUIDO VOLS</div>
          </div>
        </div>
        <ul style={{ display: 'flex', gap: 36, listStyle: 'none' }}>
          {[['#over', 'Over Guido'], ['#diensten', 'Diensten'], ['#werkwijze', 'Werkwijze']].map(([href, label]) => (
            <li key={href}>
              <a href={href} style={{ fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>
                {label}
              </a>
            </li>
          ))}
          <li>
            <a href="#contact" style={{ fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: '#000', background: 'var(--orange)', padding: '10px 22px', textDecoration: 'none', fontWeight: 700 }}>
              Kennismaking
            </a>
          </li>
        </ul>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '92vh', display: 'grid', gridTemplateColumns: '1fr 1fr', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 60px', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ display: 'block', width: 32, height: 2, background: 'var(--orange)' }} />
            Coaching · Training · Tactical
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(64px, 7vw, 96px)', lineHeight: 0.92, letterSpacing: 2, marginBottom: 8 }}>
            JOUW<br />DOEL,<br /><span style={{ color: 'var(--orange)' }}>ONS PLAN</span>
          </h1>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3vw, 42px)', letterSpacing: 4, color: 'var(--muted)', marginBottom: 32 }}>
            GV PERFORMANCE
          </div>
          <p style={{ fontSize: 16, color: '#aaa', maxWidth: 420, lineHeight: 1.7, marginBottom: 44 }}>
            Van topsporters tot tactische professionals — elk traject begint met een grondige analyse en eindigt met meetbaar resultaat. Geen generieke schema&apos;s. Alleen wat werkt voor jou.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <a href="#contact" style={{ background: 'var(--orange)', color: '#000', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', padding: '16px 36px', textDecoration: 'none' }}>
              Plan je kennismaking
            </a>
            <a href="#diensten" style={{ border: '1px solid var(--muted2)', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', padding: '16px 36px', textDecoration: 'none' }}>
              Bekijk diensten
            </a>
          </div>
        </div>
        <div style={{ background: 'var(--dark3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, borderLeft: '1px solid rgba(255,77,0,0.1)' }}>
          {/* VERVANG DIT DOOR JE EIGEN FOTO */}
          <div style={{ width: 56, height: 56, border: '1px solid var(--muted2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📷</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: 2, color: 'var(--muted)' }}>MILITAIRE INSTRUCTEUR FOTO</div>
          <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--muted2)', textTransform: 'uppercase' }}>Foto van jou met soldaten op het veld</div>
        </div>
      </section>

      {/* RIBBON */}
      <div style={{ background: 'var(--dark2)', borderTop: '1px solid rgba(255,77,0,0.1)', borderBottom: '1px solid rgba(255,77,0,0.1)', padding: '18px 60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        {['Korps Mariniers', '🥇 Gouden Medaille NL Elftal', 'Defensie Sport Instructeur', 'NBB Boxing Trainer KSS 3', 'KNAU Looptrainer', '13+ Certificaten'].map((item) => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 6, height: 6, background: 'var(--orange)', flexShrink: 0 }} />
            <span style={{ fontSize: 12, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>{item}</span>
          </div>
        ))}
      </div>

      {/* OVER GUIDO */}
      <section id="over" style={{ padding: '100px 60px', background: 'var(--dark2)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        <div style={{ background: 'var(--dark3)', aspectRatio: '3/4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10, border: '1px dashed var(--muted2)' }}>
          <div style={{ fontSize: 24 }}>📷</div>
          <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--muted2)', textTransform: 'uppercase' }}>Portret of trainingsfoto</div>
        </div>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'block', width: 24, height: 2, background: 'var(--orange)' }} />
            Over Guido
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(42px, 5vw, 68px)', letterSpacing: 2, lineHeight: 0.95, marginBottom: 24 }}>
            VAN GOUDEN PLAK TOT SPORTINSTRUCTEUR
          </h2>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 2, color: 'var(--orange)', lineHeight: 1.2, marginBottom: 28, borderLeft: '3px solid var(--orange)', paddingLeft: 20 }}>
            &ldquo;Ik heb mijn eigen methode bewezen — aan mijzelf.&rdquo;
          </div>
          <p style={{ fontSize: 16, color: '#aaa', lineHeight: 1.8, marginBottom: 16 }}>
            Vanaf mijn <strong style={{ color: 'var(--text)' }}>17e speelde ik ijshockey op het hoogste niveau van Nederland</strong>. In mijn laatste seizoen voor de Korps Mariniers opleiding vertegenwoordigde ik <strong style={{ color: 'var(--text)' }}>het Nederlands mannen team</strong> en behaalden we een <strong style={{ color: 'var(--text)' }}>gouden medaille</strong>.
          </p>
          <p style={{ fontSize: 16, color: '#aaa', lineHeight: 1.8, marginBottom: 16 }}>
            Tien jaar geen hockey. Maar door mijn eigen methodiek voor off-ice ontwikkeling wist ik <strong style={{ color: 'var(--text)' }}>opnieuw door te stromen naar het hoogste niveau van Nederland</strong>. Dat is geen geluk — dat is een systeem.
          </p>
          <p style={{ fontSize: 16, color: '#aaa', lineHeight: 1.8, marginBottom: 36 }}>
            Datzelfde systeem — gebaseerd op <strong style={{ color: 'var(--text)' }}>periodisering, data en mentale coaching</strong> — zet ik nu in voor jou.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              ['17 JAAR', 'Hoogste IJshockeycompetitie Nederland'],
              ['GOUD 🥇', 'Nederlands Mannen IJshockeyteam'],
              ['MARINIERS', 'Korps Mariniers opleiding & dienst'],
              ['COMEBACK', 'Terug op topniveau na 10 jaar'],
            ].map(([year, text]) => (
              <div key={year} style={{ background: 'var(--dark3)', padding: '18px 20px', borderLeft: '3px solid rgba(255,77,0,0.2)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, letterSpacing: 2, color: 'var(--orange)', marginBottom: 4 }}>{year}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIENSTEN */}
      <section id="diensten" style={{ padding: '100px 60px', background: 'var(--dark)' }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'block', width: 24, height: 2, background: 'var(--orange)' }} />
          Wat ik aanbied
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(42px, 5vw, 68px)', letterSpacing: 2, lineHeight: 0.95, marginBottom: 60 }}>DIENSTEN</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {[
            { icon: '🎯', title: '1-OP-1 COACHING', desc: 'Persoonlijk traject op maat — van intake en doelstelling tot periodisering en uitvoering. Online, in-person of hybrid.', tag: 'Hybrid' },
            { icon: '🪖', title: 'TACTICAL ATHLETE', desc: 'Voorbereiding op Defensie, politie, brandweer of speciale eenheden. Fysiek én mentaal klaar voor selectie en opleiding.', tag: 'Defensie · Politie · Brandweer' },
            { icon: '🏅', title: 'TOPSPORT BEGELEIDING', desc: 'Voor sporters met een specifiek doel. Periodisering, kracht, conditie en mentale weerbaarheid.', tag: 'Seizoensvoorbereiding' },
            { icon: '⚡', title: 'HYROX VOORBEREIDING', desc: 'Van nulmeting tot race day. Opbouw, tijdverbetering en volledige race-specifieke conditionering.', tag: 'Beginners · Tijdverbetering' },
            { icon: '🏢', title: 'TEAM & BEDRIJF', desc: 'Teamtrainingen, bootcamps en groepslessen voor bedrijven en sportclubs. Ook beschikbaar als externe instructeur.', tag: 'B2B · Sportscholen · Events' },
            { icon: '🏃', title: 'LOOPCOACHING', desc: 'Techniek, opbouw en race-voorbereiding. Van beginners tot hardlopers met een tijdsdoel. KNAU gecertificeerd niveau 3.', tag: 'KNAU Gecertificeerd' },
          ].map((d) => (
            <div key={d.title} style={{ background: 'var(--dark2)', padding: '36px 32px', borderTop: '1px solid var(--dark3)', borderLeft: '1px solid var(--dark3)' }}>
              <div style={{ fontSize: 28, marginBottom: 16 }}>{d.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: 2, marginBottom: 10 }}>{d.title}</div>
              <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 14 }}>{d.desc}</div>
              <span style={{ display: 'inline-block', fontSize: 10, letterSpacing: 2, color: 'var(--orange)', textTransform: 'uppercase', border: '1px solid rgba(255,77,0,0.3)', padding: '4px 10px' }}>{d.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* HOE HET WERKT */}
      <section id="werkwijze" style={{ padding: '100px 60px', background: 'var(--dark2)', textAlign: 'center' }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <span style={{ display: 'block', width: 24, height: 2, background: 'var(--orange)' }} />
          Werkwijze
          <span style={{ display: 'block', width: 24, height: 2, background: 'var(--orange)' }} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(42px, 5vw, 68px)', letterSpacing: 2, lineHeight: 0.95, marginBottom: 60 }}>HOE HET WERKT</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {[
            ['01', 'INTAKE & ANALYSE', 'Een grondige kennismaking. We brengen jouw uitgangssituatie, doelen en leefstijl in kaart. Nulmeting waar relevant.'],
            ['02', 'JOUW PLAN', 'Op basis van de intake maak ik een volledig uitgestippeld traject. Geperiodiseerd, meetbaar, realistisch.'],
            ['03', 'UITVOERING & GROEI', 'We gaan aan de slag. Continue monitoring, bijsturing waar nodig, en vaste check-ins om op koers te blijven.'],
          ].map(([num, title, desc]) => (
            <div key={num} style={{ padding: '48px 32px', background: 'var(--dark3)', position: 'relative' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 80, color: 'rgba(255,77,0,0.1)', lineHeight: 1, marginBottom: 16 }}>{num}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: 2, marginBottom: 12 }}>{title}</div>
              <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 260, margin: '0 auto' }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CERTIFICATEN */}
      <section style={{ padding: '100px 60px', background: 'var(--dark)' }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'block', width: 24, height: 2, background: 'var(--orange)' }} />
          Achtergrond & Kwalificaties
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(42px, 5vw, 68px)', letterSpacing: 2, lineHeight: 0.95, marginBottom: 44 }}>GECERTIFICEERD OP ALLE VLAKKEN</h2>
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
            <div key={label} style={{
              background: featured ? 'var(--orange-dim)' : 'var(--dark3)',
              border: `1px solid ${featured ? 'rgba(255,77,0,0.4)' : 'var(--dark4)'}`,
              padding: '10px 18px',
              fontSize: 12,
              letterSpacing: 1,
              color: featured ? 'var(--text)' : 'var(--muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <div style={{ width: 5, height: 5, background: 'var(--orange)', flexShrink: 0 }} />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ padding: '100px 60px', background: 'var(--dark2)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'block', width: 24, height: 2, background: 'var(--orange)' }} />
            Kennismaking
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(42px, 5vw, 68px)', letterSpacing: 2, lineHeight: 0.95, marginBottom: 24 }}>KLAAR OM TE STARTEN?</h2>
          <p style={{ fontSize: 16, color: '#aaa', lineHeight: 1.8, marginBottom: 36 }}>
            Stuur een bericht en ik neem binnen 24 uur contact op voor een vrijblijvend kennismakingsgesprek.
          </p>
          {[
            ['📍', 'Locatie', 'Den Haag & omgeving · Online beschikbaar'],
            ['⚡', 'Reactietijd', 'Binnen 24 uur op werkdagen'],
            ['🎯', 'Eerste stap', 'Gratis kennismakingsgesprek van 30 min'],
          ].map(([icon, label, text]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 }}>
              <div style={{ width: 36, height: 36, background: 'var(--orange-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{icon}</div>
              <div>
                <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>{text}</div>
              </div>
            </div>
          ))}
        </div>
        <form style={{ display: 'flex', flexDirection: 'column', gap: 14 }} onSubmit={(e) => e.preventDefault()}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {['Voornaam', 'Achternaam'].map((p) => (
              <div key={p} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>{p}</label>
                <input type="text" placeholder={p} style={{ background: 'var(--dark3)', border: '1px solid var(--dark4)', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 15, padding: '14px 16px', outline: 'none', width: '100%' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>E-mailadres</label>
            <input type="email" placeholder="jouw@email.nl" style={{ background: 'var(--dark3)', border: '1px solid var(--dark4)', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 15, padding: '14px 16px', outline: 'none', width: '100%' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>Interesse in</label>
            <select style={{ background: 'var(--dark3)', border: '1px solid var(--dark4)', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 15, padding: '14px 16px', outline: 'none', width: '100%' }}>
              <option value="">Selecteer een dienst...</option>
              {['1-op-1 Personal Coaching', 'Tactical Athlete Voorbereiding', 'Topsport Begeleiding', 'Hyrox Voorbereiding', 'Team / Bedrijfstraining', 'Loopcoaching', 'Anders'].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>Jouw bericht</label>
            <textarea placeholder="Vertel kort over je doel of situatie..." rows={5} style={{ background: 'var(--dark3)', border: '1px solid var(--dark4)', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 15, padding: '14px 16px', outline: 'none', width: '100%', resize: 'vertical' }} />
          </div>
          <button type="submit" style={{ background: 'var(--orange)', color: '#000', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', padding: '16px', border: 'none', cursor: 'pointer', width: '100%' }}>
            VERSTUUR BERICHT
          </button>
        </form>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--dark)', borderTop: '1px solid rgba(255,77,0,0.1)', padding: '40px 60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="24" height="22" viewBox="0 0 36 34">
            <polygon points="18,2 13,28 23,28" fill="#FF4D00" />
            <polygon points="5,7 0,28 14,28" fill="#FF4D00" opacity="0.5" />
            <polygon points="31,7 23,28 36,28" fill="#FF4D00" opacity="0.5" />
          </svg>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: 3, color: 'var(--muted)' }}>GV PERFORMANCE</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted2)', letterSpacing: 1 }}>© 2025 GV Performance — Guido Vols</div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Instagram', 'LinkedIn', 'Contact', 'Privacybeleid'].map((l) => (
            <a key={l} href="#" style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted2)', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </footer>

    </div>
  )
}
