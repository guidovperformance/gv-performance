'use client'
import React from 'react'
import { SITE_CSS, SiteNav, SiteFooter, FloatButton } from '../site-shared'

const CSS = `
  ${SITE_CSS}

  .faq-list { max-width: 760px; margin-top: 50px; }
  .faq-item { border-bottom: 1px solid var(--dark4); }
  .faq-question {
    width:100%; text-align:left; background:none; border:none; cursor:pointer;
    padding: 24px 0; display:flex; align-items:center; justify-content:space-between; gap:20px;
    font-family:var(--display); font-size:18px; letter-spacing:1px; color:var(--text);
  }
  .faq-icon { font-size:20px; color:var(--orange); flex-shrink:0; transition: transform .3s cubic-bezier(0.16,1,0.3,1); line-height:1; }
  .faq-item.open .faq-icon { transform: rotate(45deg); }
  .faq-answer {
    max-height:0; overflow:hidden; transition: max-height .4s cubic-bezier(0.16,1,0.3,1);
  }
  .faq-answer-inner { padding: 0 0 24px; font-size:14px; color:var(--muted); line-height:1.7; max-width:640px; }
  .faq-item.open .faq-answer { max-height: 400px; }
`

const faqs = [
  { q: 'Voor wie is GV Performance geschikt?', a: 'Voor topsporters, tactical athletes (Defensie, politie, brandweer), gedreven amateurs en bedrijven die op zoek zijn naar gestructureerde, op maat gemaakte begeleiding in Den Haag of online.' },
  { q: 'Werk je ook online met cliënten buiten Den Haag?', a: 'Ja, een groot deel van de trajecten wordt volledig online begeleid. In-person sessies zijn mogelijk in en rondom Den Haag.' },
  { q: 'Hoe ziet het eerste contact eruit?', a: 'We starten met een vrijblijvend kennismakingsgesprek van 30 minuten. Hierin bespreken we je doel, situatie en wat een passend traject eruit zou kunnen zien.' },
  { q: 'Hoe lang duurt een traject?', a: 'Dat verschilt per doel. Sommige trajecten (zoals een Hyrox-voorbereiding) duren 8-16 weken, andere (zoals topsportbegeleiding) lopen seizoensgebonden door.' },
  { q: 'Wat kost een traject?', a: 'De investering hangt af van het type traject en de intensiteit van begeleiding. Bekijk de pakketten-pagina voor een overzicht, of vraag een persoonlijke offerte aan.' },
  { q: 'Bied je ook teamtrainingen voor bedrijven aan?', a: 'Ja, teamtrainingen, bootcamps en groepslessen zijn mogelijk voor bedrijven en sportclubs in en om Den Haag.' },
]

export default function FaqPage() {
  const [open, setOpen] = React.useState(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <FloatButton />
      <SiteNav active="FAQ" />

      <section className="page-hero">
        <div className="page-hero-eyebrow">Veelgestelde vragen</div>
        <h1 className="page-hero-title">VRAGEN &amp; <span>ANTWOORDEN</span></h1>
        <p className="page-hero-desc">
          Staat je vraag er niet bij? Stuur gerust een bericht via het contactformulier op de homepage.
        </p>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="faq-list fade-in">
          {faqs.map((f, i) => {
            const isOpen = open === i
            return (
              <div key={f.q} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <button
                  type="button"
                  className="faq-question"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span>{f.q}</span>
                  <span className="faq-icon" aria-hidden="true">+</span>
                </button>
                <div className="faq-answer">
                  <div className="faq-answer-inner">{f.a}</div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
