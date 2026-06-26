import { Analytics } from '../site-shared'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

const cookieBannerCSS = `
  .cookie-banner {
    position:fixed; left:0; right:0; bottom:0; z-index:1001;
    background:var(--dark2); border-top:1px solid rgba(212,168,87,0.25);
    padding:18px 24px; display:flex; align-items:center; justify-content:space-between;
    gap:20px; flex-wrap:wrap;
  }
  .cookie-banner-text { font-size:13px; color:var(--muted2); line-height:1.6; max-width:640px; font-family:var(--font-barlow), sans-serif; }
  .cookie-banner-text a { color:var(--orange); text-decoration:underline; }
  .cookie-banner-actions { display:flex; gap:10px; flex-shrink:0; }
  .cookie-banner-decline {
    background:none; border:1px solid var(--muted2); color:var(--text);
    font-family:var(--font-barlow), sans-serif; font-size:12px; letter-spacing:1px; text-transform:uppercase;
    padding:10px 18px; cursor:pointer;
  }
  .cookie-banner-accept {
    background:var(--orange); border:none; color:#000;
    font-family:var(--font-barlow), sans-serif; font-weight:700; font-size:12px; letter-spacing:1px; text-transform:uppercase;
    padding:10px 18px; cursor:pointer;
  }
  @media (max-width: 600px) {
    .cookie-banner { padding:16px; flex-direction:column; align-items:stretch; text-align:center; }
    .cookie-banner-actions { justify-content:center; }
  }
`

export const metadata = {
  title: 'Privacybeleid — GV Performance',
}

export default function Privacy() {
  return (
    <div style={{ background: 'var(--dark)', color: 'var(--text)', ...B, minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 60px', borderBottom: '1px solid rgba(212,168,87,0.12)', background: 'rgba(10,10,10,0.97)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}>
          <svg width="36" height="34" viewBox="0 0 36 34">
            <polygon points="18,2 13,28 23,28" fill="#D4A857" />
            <polygon points="5,7 0,28 14,28" fill="#D4A857" opacity="0.5" />
            <polygon points="31,7 23,28 36,28" fill="#D4A857" opacity="0.5" />
          </svg>
          <div>
            <div style={{ ...D, fontSize: 22, letterSpacing: 3, color: 'var(--text)', lineHeight: 1, fontWeight: 700 }}>GV PERFORMANCE</div>
            <div style={{ ...B, fontSize: 10, letterSpacing: 3, color: 'var(--orange)', marginTop: 2 }}>GUIDO VOLS</div>
          </div>
        </a>
        <a href="/" style={{ ...B, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>← Terug naar home</a>
      </nav>

      {/* CONTENT */}
      <section style={{ padding: '80px 60px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 14 }}>Juridisch</div>
        <h1 style={{ ...D, fontSize: 'clamp(40px, 5vw, 64px)', letterSpacing: 1, lineHeight: 1, marginBottom: 48, fontWeight: 700 }}>PRIVACYBELEID</h1>

        {[
          {
            title: 'Wie zijn wij?',
            content: 'GV Performance is een eenmanszaak gedreven door Guido Vols, gevestigd in Den Haag. Wij bieden personal coaching, training en begeleiding aan. Voor vragen over dit privacybeleid kun je contact opnemen via guidovperformance@gmail.com.',
          },
          {
            title: 'Welke gegevens verzamelen wij?',
            content: 'Via het contactformulier op deze website verzamelen wij de volgende persoonsgegevens: naam, e-mailadres en de inhoud van je bericht. Wij verzamelen geen bijzondere persoonsgegevens zonder jouw expliciete toestemming.',
          },
          {
            title: 'Waarvoor gebruiken wij jouw gegevens?',
            content: 'Wij gebruiken jouw gegevens uitsluitend om te reageren op jouw aanvraag of vraag via het contactformulier. Jouw gegevens worden niet gebruikt voor marketingdoeleinden zonder jouw toestemming, niet verkocht aan derden en niet gedeeld met andere partijen.',
          },
          {
            title: 'Hoe lang bewaren wij jouw gegevens?',
            content: 'Wij bewaren jouw persoonsgegevens niet langer dan noodzakelijk voor het doel waarvoor ze zijn verzameld. Contactaanvragen worden bewaard zolang de communicatie actief is en daarna niet langer dan 12 maanden.',
          },
          {
            title: 'Beveiliging',
            content: 'Wij nemen passende technische en organisatorische maatregelen om jouw persoonsgegevens te beschermen tegen onbevoegde toegang, verlies of misbruik.',
          },
          {
            title: 'Jouw rechten',
            content: 'Je hebt het recht op inzage in jouw persoonsgegevens, correctie van onjuiste gegevens, verwijdering van jouw gegevens en bezwaar tegen de verwerking. Om gebruik te maken van deze rechten kun je contact opnemen via guidovperformance@gmail.com. Wij reageren binnen 30 dagen.',
          },
          {
            title: 'Cookies',
            content: 'Deze website maakt gebruik van functionele cookies die noodzakelijk zijn voor het correct functioneren van de site. Daarnaast gebruiken wij Google Analytics om te zien hoe de site gebruikt wordt — deze analytische cookies worden alleen geplaatst nadat je hier toestemming voor geeft via de cookiebanner. Je kunt je keuze altijd wijzigen door je browsergegevens voor deze site te wissen. Er worden geen marketingcookies geplaatst.',
          },
          {
            title: 'Klachten',
            content: 'Als je een klacht hebt over de verwerking van jouw persoonsgegevens, kun je contact opnemen via guidovperformance@gmail.com. Je hebt ook het recht om een klacht in te dienen bij de Autoriteit Persoonsgegevens via www.autoriteitpersoonsgegevens.nl.',
          },
          {
            title: 'Wijzigingen',
            content: 'Dit privacybeleid kan van tijd tot tijd worden bijgewerkt. De meest recente versie is altijd beschikbaar op deze pagina. Laatste update: mei 2025.',
          },
        ].map(({ title, content }) => (
          <div key={title} style={{ marginBottom: 40, paddingBottom: 40, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 style={{ ...D, fontSize: 22, letterSpacing: 1, fontWeight: 700, marginBottom: 14, color: 'var(--text)' }}>{title}</h2>
            <p style={{ ...B, fontSize: 15, color: '#aaa', lineHeight: 1.8 }}>{content}</p>
          </div>
        ))}

        <div style={{ marginTop: 16, padding: '24px 28px', background: 'var(--dark2)', borderLeft: '3px solid var(--orange)' }}>
          <div style={{ ...D, fontSize: 16, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>Contact</div>
          <div style={{ ...B, fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>
            GV Performance — Guido Vols<br />
            Den Haag, Nederland<br />
            guidovperformance@gmail.com
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--dark)', borderTop: '1px solid rgba(212,168,87,0.1)', padding: '30px 60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ ...B, fontSize: 12, color: 'var(--muted2)', letterSpacing: 1 }}>© 2025 GV Performance — Guido Vols</div>
        <a href="/" style={{ ...B, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--orange)', textDecoration: 'none' }}>← Terug naar home</a>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: cookieBannerCSS }} />
      <Analytics />
    </div>
  )
}
