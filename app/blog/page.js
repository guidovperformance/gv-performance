'use client'
import React from 'react'
import { SITE_CSS, SiteNav, SiteFooter, FloatButton , Analytics } from '../site-shared'

const CSS = `
  ${SITE_CSS}

  .blog-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; margin-top:60px; border:2px solid var(--dark3); }
  .blog-card { background:var(--dark2); padding:0; border:1px solid transparent; transition: border-color .25s, transform .25s; display:flex; flex-direction:column; }
  .blog-card:hover { border-color: var(--orange); transform: translateY(-6px); }
  .blog-img { aspect-ratio:16/10; background:var(--dark3); display:flex; align-items:center; justify-content:center; border-bottom:1px solid var(--dark4); }
  .blog-img-label { font-size:11px; letter-spacing:2px; color:var(--muted2); text-transform:uppercase; }
  .blog-body { padding:26px 28px; flex:1; display:flex; flex-direction:column; }
  .blog-cat { font-size:10px; letter-spacing:2px; color:var(--orange); text-transform:uppercase; margin-bottom:10px; }
  .blog-title { font-family:var(--display); font-size:22px; letter-spacing:1px; color:var(--text); margin-bottom:10px; line-height:1.1; }
  .blog-excerpt { font-size:14px; color:var(--muted); line-height:1.6; flex:1; }
  .blog-read { font-size:11px; letter-spacing:2px; color:var(--orange); text-transform:uppercase; margin-top:18px; display:inline-flex; align-items:center; gap:6px; }

  @media (max-width: 768px) { .blog-grid { grid-template-columns:1fr; } }
`

const posts = [
  { cat: 'Kracht', titel: 'Periodisering: waarom een seizoensplan werkt', excerpt: 'Hoe je trainingsbelasting opbouwt richting een piekmoment zonder over te trainen.' },
  { cat: 'Hyrox', titel: '5 fouten bij Hyrox-voorbereiding', excerpt: 'De meest gemaakte fouten in race-specifieke conditionering — en hoe je ze voorkomt.' },
  { cat: 'Mentaal', titel: 'Mentale weerbaarheid onder druk', excerpt: 'Praktische technieken uit de tactical athlete-wereld die ook voor jou werken.' },
  { cat: 'Voeding', titel: 'Voeding rondom intensieve trainingsblokken', excerpt: 'Wat je wel en niet moet doen qua voeding tijdens een zwaar trainingsblok.' },
  { cat: 'Loopcoaching', titel: 'Van 0 naar 10km: een realistisch opbouwschema', excerpt: 'Een stap-voor-stap aanpak voor beginnende lopers met een tijdsdoel.' },
  { cat: 'Coaching', titel: 'Waarom een intake-gesprek zoveel verschil maakt', excerpt: 'Een goed begin is het halve werk — dit gebeurt er tijdens de eerste kennismaking.' },
]

export default function BlogPage() {
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
      <SiteNav active="Blog" />

      <section className="page-hero">
        <div className="page-hero-eyebrow">Blog &amp; Tips</div>
        <h1 className="page-hero-title">KENNIS DIE <span>WERKT</span></h1>
        <p className="page-hero-desc">
          Praktische inzichten over training, periodisering, mentale weerbaarheid en voeding — gebaseerd op tien jaar ervaring als topsporter, Marinier en coach.
        </p>
      </section>

      <section>
        <div className="blog-grid">
          {posts.map((p, i) => (
            <article key={p.titel} className={`blog-card fade-in delay-${(i % 3) + 1}`}>
              <div className="blog-img"><span className="blog-img-label">Afbeelding volgt</span></div>
              <div className="blog-body">
                <div className="blog-cat">{p.cat}</div>
                <h2 className="blog-title">{p.titel}</h2>
                <p className="blog-excerpt">{p.excerpt}</p>
                <span className="blog-read">Lees meer ›</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
      <Analytics />
    </>
  )
}
