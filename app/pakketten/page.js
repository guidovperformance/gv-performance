'use client'
import React from 'react'
import { SiteNav, SiteFooter, CalendlyButton, Analytics } from '../site-shared'
import { trackEvent } from '@/lib/analytics'

const CSS = `
  :root {
    --orange:#D4A857; --orange-dim:rgba(212,168,87,0.15); --gold-bright:#E8C77E;
    --dark:#0A0A0A; --dark2:#111; --dark3:#181818; --dark4:#222;
    --text:#F0EEE8; --muted:#888; --muted2:#555;
    --display:var(--font-oswald),Impact,sans-serif; --body:var(--font-barlow),sans-serif;
  }
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html{scroll-behavior:smooth;}
  body{background:var(--dark);color:var(--text);font-family:var(--body);font-size:17px;line-height:1.65;overflow-x:hidden;overflow-y:visible;padding-top:78px;}
  /* position:fixed i.p.v. sticky — sticky bleek onbetrouwbaar in sommige browsers */
  nav{display:flex;align-items:center;justify-content:space-between;padding:22px 60px;border-bottom:1px solid rgba(212,168,87,0.12);background:#0A0A0A;position:fixed;top:0;left:0;right:0;z-index:100;}
  .nav-logo{display:flex;align-items:center;gap:14px;text-decoration:none;flex-shrink:0;}
  .nav-logo-text{font-family:var(--display);font-size:22px;letter-spacing:3px;color:var(--text);line-height:1;}
  .nav-logo-sub{font-family:var(--body);font-size:10px;letter-spacing:3px;color:var(--orange);margin-top:2px;}
  .nav-cta{background:var(--orange);color:#000!important;padding:10px 22px;font-weight:700;letter-spacing:1px!important;font-family:var(--body);font-size:13px;text-transform:uppercase;text-decoration:none;border-radius:4px;transition:background .2s;}
  .nav-cta:hover{background:#C99540;}
  @media(max-width:480px){.nav-cta-desktop{display:none;}}
  .nav-icons{display:flex;align-items:center;gap:10px;overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}
  .nav-icons::-webkit-scrollbar{display:none;}
  .nav-icon-item{position:relative;width:44px;height:44px;border-radius:50%;background:var(--dark2);border:1px solid rgba(212,168,87,0.2);display:flex;align-items:center;justify-content:center;text-decoration:none;overflow:hidden;flex-shrink:0;transition:width .4s cubic-bezier(0.16,1,0.3,1);}
  .nav-icon-item:hover,.nav-icon-item:focus-visible{width:148px;}
  .nav-icon-item-bg{position:absolute;inset:0;border-radius:50%;background:linear-gradient(135deg,var(--gold-bright,#E8C77E),var(--orange));opacity:0;transition:opacity .3s ease,border-radius .4s ease;}
  .nav-icon-item:hover .nav-icon-item-bg,.nav-icon-item:focus-visible .nav-icon-item-bg{opacity:1;border-radius:22px;}
  .nav-icon-item-icon{position:relative;z-index:1;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--orange);transition:transform .3s ease,opacity .3s ease;}
  .nav-icon-item-icon svg{width:17px;height:17px;}
  .nav-icon-item:hover .nav-icon-item-icon,.nav-icon-item:focus-visible .nav-icon-item-icon{transform:scale(0);opacity:0;}
  .nav-icon-item-label{position:absolute;color:#000;font-family:var(--body);font-weight:700;font-size:11px;letter-spacing:1px;text-transform:uppercase;opacity:0;transform:scale(0.6);white-space:nowrap;z-index:2;transition:opacity .3s ease .08s,transform .3s ease .08s;}
  .nav-icon-item:hover .nav-icon-item-label,.nav-icon-item:focus-visible .nav-icon-item-label{opacity:1;transform:scale(1);}
  @media(prefers-reduced-motion:reduce){.nav-icon-item,.nav-icon-item-bg,.nav-icon-item-icon,.nav-icon-item-label{transition:none;}}
  .nav-mobile-cta{margin-top:8px;background:var(--orange);color:#000!important;text-align:center;border-radius:10px;font-family:var(--body)!important;font-weight:700;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:16px!important;font-size:14px!important;display:block;flex-shrink:0;}
  section{padding:80px 60px;}
  .section-label{font-size:10px;letter-spacing:4px;color:var(--orange);text-transform:uppercase;margin-bottom:14px;display:flex;align-items:center;gap:10px;}
  .section-label::before{content:'';display:block;width:24px;height:2px;background:var(--orange);}
  .section-title{font-family:var(--display);font-size:clamp(42px,5vw,68px);letter-spacing:0px;line-height:0.95;margin-bottom:24px;overflow-wrap:break-word;word-break:break-word;}
  .btn-primary{background:var(--orange);color:#000;font-family:var(--body);font-weight:700;font-size:13px;letter-spacing:2px;text-transform:uppercase;padding:16px 36px;text-decoration:none;display:inline-block;border:none;cursor:pointer;transition:background .2s,transform .15s;}
  .btn-primary:hover{background:#C99540;transform:translateY(-1px);}
  .btn-secondary{border:1px solid var(--muted2);color:var(--text);font-family:var(--body);font-size:13px;letter-spacing:2px;text-transform:uppercase;padding:16px 36px;text-decoration:none;display:inline-block;transition:border-color .2s,color .2s;}
  .btn-secondary:hover{border-color:var(--text);}

  /* PAKKET CARDS — hover lift + oranje rand */
  .pakket-card{
    background:var(--dark2);
    border:2px solid transparent;
    padding:40px 32px;
    position:relative;
    display:flex;
    flex-direction:column;
    transition:border-color .25s, transform .25s, box-shadow .25s, background .25s;
  }
  .pakket-card:hover{
    border-color:var(--orange);
    transform:translateY(-6px);
    box-shadow:0 12px 32px rgba(212,168,87,0.12);
    background:#0D0D0D;
    z-index:2;
  }
  .pakket-card.featured{border-color:var(--orange);background:#0D0D0D;}
  .pakket-card.featured:hover{transform:translateY(-8px);box-shadow:0 16px 40px rgba(212,168,87,0.2);}

  /* ADD-ON cards */
  .addon-card{
    background:var(--dark3);
    padding:28px 32px;
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:20px;
    transition:border-color .25s, transform .2s;
    border:1px solid transparent;
  }
  .addon-card:hover{border-color:rgba(212,168,87,0.3);transform:translateY(-3px);}

  /* Bedrijven cards */
  .bedrijf-card{
    background:var(--dark2);
    padding:40px 36px;
    transition:border-color .25s, transform .2s;
    border:1px solid transparent;
  }
  .bedrijf-card:hover{border-color:var(--orange);transform:translateY(-4px);}

  /* FLOAT BUTTON */
  .float-btn{position:fixed;bottom:32px;right:32px;background:var(--orange);color:#000;font-family:var(--body);font-weight:700;font-size:13px;letter-spacing:2px;text-transform:uppercase;padding:14px 24px;text-decoration:none;z-index:999;box-shadow:0 4px 24px rgba(212,168,87,0.4);transition:transform .2s,box-shadow .2s,background .2s,opacity .3s ease;display:flex;align-items:center;gap:8px;}
  .float-btn:hover{transform:translateY(-3px);box-shadow:0 8px 32px rgba(212,168,87,0.55);background:#C99540;}
  .float-btn-pulse{width:8px;height:8px;background:#000;border-radius:50%;flex-shrink:0;animation:pulse 2s ease-in-out infinite;}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.5;transform:scale(.7);}}

  /* FADE IN */
  .fade-in{opacity:0;transform:translateY(24px);transition:opacity .6s ease,transform .6s ease;}
  .fade-in.visible{opacity:1;transform:translateY(0);}
  .fade-in.delay-1{transition-delay:.1s;}
  .fade-in.delay-2{transition-delay:.2s;}
  .fade-in.delay-3{transition-delay:.3s;}

  footer{background:var(--dark);border-top:1px solid rgba(212,168,87,0.1);padding:40px 60px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;}
  .footer-copy{font-size:12px;color:var(--muted2);letter-spacing:1px;}
  .footer-links{display:flex;gap:24px;}
  .footer-links a{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--muted2);text-decoration:none;transition:color .2s;}
  .footer-links a:hover{color:var(--orange);}

  /* PRICING TOGGLE */
  .pricing-toggle{
    position:relative; display:inline-flex; align-items:center;
    background:var(--dark3); border:1px solid rgba(212,168,87,0.2);
    border-radius:999px; padding:4px; gap:2px;
  }
  .pricing-toggle button{
    position:relative; z-index:2; border:none; background:none; cursor:pointer;
    font-family:var(--body); font-weight:700; font-size:13px; letter-spacing:1.5px;
    text-transform:uppercase; padding:10px 24px; border-radius:999px;
    color:var(--muted); transition:color .25s; display:flex; align-items:center; gap:8px;
  }
  .pricing-toggle button.active{color:#000;}
  .pricing-toggle-pill{
    position:absolute; top:4px; left:4px; height:calc(100% - 8px);
    background:linear-gradient(180deg,var(--gold-bright),var(--orange));
    border-radius:999px; z-index:1;
    transition:transform .35s cubic-bezier(0.16,1,0.3,1), width .35s cubic-bezier(0.16,1,0.3,1);
    box-shadow:0 4px 16px rgba(212,168,87,0.35);
  }
  .pricing-save-badge{
    background:rgba(212,168,87,0.15); color:var(--orange); font-size:10px;
    font-weight:700; letter-spacing:1px; padding:2px 8px; border-radius:999px;
  }

  /* ANIMATED PRICE */
  .price-value{ display:inline-block; }
  .price-value.price-flip{ animation:priceFlip .4s cubic-bezier(0.16,1,0.3,1); }
  @keyframes priceFlip{
    0%{ opacity:0; transform:translateY(8px) scale(0.96); filter:blur(4px); }
    100%{ opacity:1; transform:translateY(0) scale(1); filter:blur(0); }
  }
  @media (prefers-reduced-motion: reduce){
    .price-value.price-flip{ animation:none; }
    .pricing-toggle-pill{ transition:none; }
  }

  @media(max-width:768px){
    body{padding-top:112px;} /* mobiele nav is 2 regels hoog */
    nav{padding:14px 16px;flex-wrap:wrap;row-gap:10px;}
    .nav-logo{gap:10px;}
    .nav-logo svg{width:28px;height:26px;}
    .nav-logo-text{font-size:17px;letter-spacing:1.5px;}
    .nav-logo-sub{display:none;}
    .nav-actions{width:100%;justify-content:flex-start!important;}
    .nav-icon-item{width:40px;height:40px;}
    .nav-icon-item:hover,.nav-icon-item:focus-visible{width:40px;}
    section{padding:60px 24px;}
    .pakketten-grid{grid-template-columns:1fr!important;}
    .addons-grid{grid-template-columns:1fr!important;}
    .bedrijven-grid{grid-template-columns:1fr!important;}
    footer{padding:30px 24px;flex-direction:column;align-items:flex-start;}
    .footer-links{flex-wrap:wrap;gap:14px 20px;}
    .float-btn{bottom:20px;right:16px;left:16px;justify-content:center;}
  }

  @media(max-width:400px){
    .section-title{font-size:clamp(32px,9vw,68px);}
  }
`

const allFeatures = [
  { key:'plan',      label:'Gepersonaliseerd trainingsplan' },
  { key:'period',    label:'Periodisering op maat' },
  { key:'dashboard', label:'Dashboard toegang & voortgang' },
  { key:'whatsapp',  label:'WhatsApp support' },
  { key:'monthly',   label:'Maandelijkse check-in (video)' },
  { key:'weekly',    label:'Wekelijkse check-in' },
  { key:'inperson2', label:'2x in-person sessie per maand' },
  { key:'voortgang', label:'Voortgangsrapportage' },
  { key:'inperson4', label:'4x in-person sessie per maand' },
  { key:'onbeperkt', label:'Onbeperkt contact' },
  { key:'mentaal',   label:'Mentale coaching inbegrepen' },
  { key:'volledig',  label:'Volledig periodiseringsplan' },
  { key:'dagelijks', label:'Dagelijkse dashboard feedback' },
  { key:'voeding',   label:'Voedingsadvies' },
]
const starterIncludes = new Set(['plan','period','dashboard','whatsapp','monthly'])
const perfIncludes    = new Set(['plan','period','dashboard','whatsapp','weekly','inperson2','voortgang'])
const eliteIncludes   = new Set(['plan','period','dashboard','whatsapp','weekly','inperson4','voortgang','onbeperkt','mentaal','volledig','dagelijks','voeding'])
const packages = [
  { name:'STARTER',     sub:'Online',       price:119, yearlyPrice:1190, popular:false, includes:starterIncludes, desc:'Volledig online begeleiding. Jij traint waar en wanneer het jou uitkomt.',                        cta:'Start met Starter' },
  { name:'PERFORMANCE', sub:'Hybrid',       price:229, yearlyPrice:2290, popular:true,  includes:perfIncludes,    desc:'De meest gekozen optie. Online structuur met persoonlijk contact op de mat.',                    cta:'Kies Performance' },
  { name:'ELITE',       sub:'Full Service', price:399, yearlyPrice:3990, popular:false, includes:eliteIncludes,   desc:'Voor de sporter die het maximale wil. Volledige begeleiding op alle vlakken.',                   cta:'Kies Elite' },
]

const PricingToggle = ({ isYearly, onSwitch }) => (
  <div className="pricing-toggle">
    <div
      className="pricing-toggle-pill"
      style={{ width: 'calc(50% - 4px)', transform: isYearly ? 'translateX(100%)' : 'translateX(0)' }}
    />
    <button type="button" className={isYearly ? '' : 'active'} onClick={() => onSwitch(false)}>
      Maandelijks
    </button>
    <button type="button" className={isYearly ? 'active' : ''} onClick={() => onSwitch(true)}>
      Jaarlijks <span className="pricing-save-badge">2 mnd gratis</span>
    </button>
  </div>
)

export default function Pakketten() {
  const [isYearly, setIsYearly] = React.useState(false)
  const floatBtnRef = React.useRef(null)

  React.useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.fade-in').forEach(el => obs.observe(el))
    return () => obs.disconnect()
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

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Zwevende knop */}
      <a href="/#contact" className="float-btn" ref={floatBtnRef} onClick={() => trackEvent('cta_click', { location: 'float-btn' })}>
        <span className="float-btn-pulse" />
        Gratis intake
      </a>

      {/* NAV */}
      <SiteNav />

      {/* HERO */}
      <section style={{textAlign:'center', borderBottom:'1px solid rgba(212,168,87,0.1)', paddingBottom:60}}>
        <div className="section-label fade-in" style={{justifyContent:'center'}}>Transparante prijzen</div>
        <h1 className="section-title fade-in delay-1">KIES JOUW PAKKET</h1>
        <p className="fade-in delay-2" style={{fontFamily:'var(--body)', fontSize:17, color:'#aaa', maxWidth:560, margin:'0 auto 16px', lineHeight:1.7}}>
          Elk traject begint met een gratis kennismakingsgesprek van 30 minuten. Samen bepalen we welk pakket het beste bij jouw doel past.
        </p>
        <div className="fade-in delay-3" style={{fontFamily:'var(--body)', fontSize:13, color:'var(--muted)', letterSpacing:1, marginBottom:32}}>
          Minimale afname 2 maanden · Daarna maandelijks opzegbaar
        </div>
        <div className="fade-in delay-3" style={{display:'flex', justifyContent:'center'}}>
          <PricingToggle isYearly={isYearly} onSwitch={setIsYearly} />
        </div>
      </section>

      {/* PACKAGES */}
      <section style={{padding:'80px 60px'}}>
        <div className="pakketten-grid" style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:2, maxWidth:1100, margin:'0 auto'}}>
          {packages.map((pkg, i) => (
            <div key={pkg.name} className={`pakket-card fade-in delay-${i+1} ${pkg.popular ? 'featured' : ''}`}>
              {pkg.popular && (
                <div style={{position:'absolute', top:-1, left:'50%', transform:'translateX(-50%)', background:'var(--orange)', color:'#000', fontFamily:'var(--body)', fontSize:10, fontWeight:700, letterSpacing:2, padding:'5px 16px', textTransform:'uppercase', whiteSpace:'nowrap'}}>
                  POPULAIRSTE KEUZE
                </div>
              )}
              <div style={{fontFamily:'var(--body)', fontSize:11, letterSpacing:3, color: pkg.popular ? 'var(--orange)' : 'var(--muted)', textTransform:'uppercase', marginBottom:6, marginTop: pkg.popular ? 12 : 0}}>{pkg.sub}</div>
              <div style={{fontFamily:'var(--display)', fontSize:32, letterSpacing:2, color:'var(--text)', fontWeight:700, marginBottom:4}}>{pkg.name}</div>
              <div style={{display:'flex', alignItems:'flex-end', gap:6, margin:'20px 0 8px'}}>
                <span
                  key={isYearly ? 'y' : 'm'}
                  className="price-value price-flip"
                  style={{fontFamily:'var(--display)', fontSize:52, fontWeight:700, color: pkg.popular ? 'var(--orange)' : 'var(--text)', lineHeight:1}}
                >
                  €{isYearly ? pkg.yearlyPrice : pkg.price}
                </span>
                <span style={{fontFamily:'var(--body)', fontSize:14, color:'var(--muted)', marginBottom:6}}>/{isYearly ? 'jaar' : 'maand'}</span>
              </div>
              {isYearly && (
                <div style={{fontFamily:'var(--body)', fontSize:12, color:'var(--orange)', marginTop:-4, marginBottom:8}}>
                  Komt neer op €{Math.round(pkg.yearlyPrice / 12)}/maand
                </div>
              )}
              <div style={{fontFamily:'var(--body)', fontSize:13, color:'var(--muted)', lineHeight:1.6, marginBottom:24, paddingBottom:24, borderBottom:'1px solid rgba(255,255,255,0.06)'}}>{pkg.desc}</div>
              <div style={{display:'flex', flexDirection:'column', gap:9, marginBottom:'auto', paddingBottom:28}}>
                {allFeatures.map(({ key, label }) => {
                  const inc = pkg.includes.has(key)
                  return (
                    <div key={key} style={{display:'flex', alignItems:'flex-start', gap:10, opacity: inc ? 1 : 0.3}}>
                      <span style={{color: inc ? 'var(--orange)' : 'var(--muted)', fontWeight:700, flexShrink:0, marginTop:1, fontSize:13}}>{inc ? '✓' : '–'}</span>
                      <span style={{fontFamily:'var(--body)', fontSize:13, color: inc ? 'var(--text)' : 'var(--muted)', lineHeight:1.4}}>{label}</span>
                    </div>
                  )
                })}
              </div>
              <a href="/#contact" onClick={() => trackEvent('cta_click', { location: `pakket-${pkg.name.toLowerCase()}` })} style={{display:'block', textAlign:'center', marginTop:28, background: pkg.popular ? 'var(--orange)' : 'transparent', color: pkg.popular ? '#000' : 'var(--text)', border: pkg.popular ? 'none' : '1px solid var(--muted2)', fontFamily:'var(--body)', fontWeight:700, fontSize:13, letterSpacing:2, textTransform:'uppercase', padding:'16px', textDecoration:'none', transition:'background .2s, transform .15s'}}>
                {pkg.cta}
              </a>
            </div>
          ))}
        </div>
        <div style={{maxWidth:1100, margin:'20px auto 0', fontFamily:'var(--body)', fontSize:13, color:'var(--muted)', textAlign:'center', letterSpacing:1}}>
          In-person sessie = 15 min voorbereiding · 60 min training · 15 min nabespreking · Reiskosten bij &gt;15 min reistijd in overleg
        </div>
      </section>

      {/* ADD-ONS */}
      <section style={{padding:'60px 60px', background:'var(--dark2)', borderTop:'1px solid rgba(212,168,87,0.1)'}}>
        <div style={{maxWidth:1100, margin:'0 auto'}}>
          <div className="section-label fade-in">Uitbreidingen</div>
          <h2 className="section-title fade-in delay-1">ADD-ONS</h2>
          <div className="addons-grid" style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:2}}>
            {[
              { label:'Extra in-person sessie', price:'€65 per sessie', desc:'Voeg een losse sessie toe bovenop je pakket.' },
              { label:'Reiskosten',              price:'In overleg',    desc:'Bij reistijd van meer dan 15 minuten. Guido komt naar jou.' },
            ].map(a => (
              <div key={a.label} className="addon-card fade-in">
                <div>
                  <div style={{fontFamily:'var(--display)', fontSize:18, letterSpacing:1, fontWeight:700, marginBottom:6}}>{a.label}</div>
                  <div style={{fontFamily:'var(--body)', fontSize:13, color:'var(--muted)'}}>{a.desc}</div>
                </div>
                <div style={{fontFamily:'var(--display)', fontSize:22, fontWeight:700, color:'var(--orange)', flexShrink:0}}>{a.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GROEPEN & BEDRIJVEN */}
      <section style={{padding:'60px 60px', borderTop:'1px solid rgba(212,168,87,0.1)'}}>
        <div style={{maxWidth:1100, margin:'0 auto'}}>
          <div className="section-label fade-in">Zakelijk</div>
          <h2 className="section-title fade-in delay-1">TEAMS & BEDRIJVEN</h2>
          <div className="bedrijven-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:2}}>
            {[
              { sub:'Bedrijven & Teams', title:'GROEPEN & BEDRIJVEN', desc:'Bootcamps, teamtrainingen en groepsvorming op maat. Ook beschikbaar als "fit op het werk" programma voor bedrijven.', items:['Bootcamps','Teamtrainingen','Groepsvorming','Fit op het werk programma'], cta:'Offerte aanvragen →' },
              { sub:'Sportscholen & Clubs', title:'SPORTSCHOOL INHUUR', desc:'Certified instructeur beschikbaar voor sportscholen, clubs en events. Vast rooster of incidenteel — beide mogelijk.', items:['Spinning (certified)','Boxing lessen','Strength & Conditioning','Small Group Training'], cta:'Tarief opvragen →' },
            ].map(b => (
              <div key={b.title} className="bedrijf-card fade-in">
                <div style={{fontFamily:'var(--body)', fontSize:10, letterSpacing:3, color:'var(--orange)', textTransform:'uppercase', marginBottom:10}}>{b.sub}</div>
                <div style={{fontFamily:'var(--display)', fontSize:26, fontWeight:700, letterSpacing:1, marginBottom:16}}>{b.title}</div>
                <div style={{fontFamily:'var(--body)', fontSize:14, color:'var(--muted)', lineHeight:1.7, marginBottom:24}}>{b.desc}</div>
                {b.items.map(item => (
                  <div key={item} style={{display:'flex', alignItems:'center', gap:10, marginBottom:8}}>
                    <span style={{color:'var(--orange)', fontWeight:700}}>✓</span>
                    <span style={{fontFamily:'var(--body)', fontSize:14}}>{item}</span>
                  </div>
                ))}
                <a href="/#contact" style={{display:'inline-block', marginTop:24, fontFamily:'var(--body)', fontSize:12, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--orange)', textDecoration:'none', borderBottom:'1px solid var(--orange)', paddingBottom:2}}>{b.cta}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="fade-in" style={{padding:'80px 60px', background:'var(--dark2)', textAlign:'center', borderTop:'1px solid rgba(212,168,87,0.1)'}}>
        <h2 className="section-title">NIET ZEKER WELK PAKKET?</h2>
        <p style={{fontFamily:'var(--body)', fontSize:16, color:'#aaa', maxWidth:480, margin:'0 auto 36px', lineHeight:1.7}}>
          Plan een gratis kennismakingsgesprek van 30 minuten. We kijken samen naar jouw situatie en doel, en kiezen het pakket dat het beste past.
        </p>
        <CalendlyButton style={{padding:'18px 48px', fontSize:14}} location="pakketten-cta">PLAN GRATIS KENNISMAKING</CalendlyButton>
        <div style={{fontFamily:'var(--body)', fontSize:12, color:'var(--muted)', marginTop:16, letterSpacing:1}}>Geen verplichtingen · Direct een moment kiezen</div>
        <div style={{marginTop:14}}>
          <a href="/#contact" style={{fontFamily:'var(--body)', fontSize:12, color:'var(--muted)', textDecoration:'underline'}}>Of stuur eerst een bericht</a>
        </div>
      </section>

      {/* FOOTER */}
      <SiteFooter />
      <Analytics />
    </>
  )
}
