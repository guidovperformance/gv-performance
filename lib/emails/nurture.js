// Concept-teksten voor de gratis-krachttest e-mailreeks. Pas de copy hier
// gerust aan — dit is bewust simpel HTML gehouden, zelfde stijl als de
// bestaande contactformulier-mail in app/api/contact/route.js.

const PDF_URL = (siteUrl) => `${siteUrl}/GV-Performance-Pre-Selectie-Krachttest.pdf`
// Zelfde booking-link als de CalendlyButton in app/site-shared.js — hier los
// gehouden omdat site-shared.js een 'use client'-bestand is (React/Script-
// imports horen niet in een serverless mailtemplate).
const CALENDLY_URL = 'https://calendly.com/guidovperformance/30min'

function wrapper(preheader, bodyHtml) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0A0A0A; padding: 24px; text-align: center;">
        <h1 style="color: #D4A857; margin: 0; font-size: 22px; letter-spacing: 3px;">GV PERFORMANCE</h1>
        <p style="color: #888; margin: 8px 0 0; font-size: 12px; letter-spacing: 2px;">${preheader}</p>
      </div>
      <div style="background: #f9f9f9; padding: 32px; color: #222; line-height: 1.7; font-size: 15px;">
        ${bodyHtml}
      </div>
      <div style="background: #0A0A0A; padding: 16px; text-align: center;">
        <p style="color: #555; margin: 0; font-size: 11px;">GV Performance — Guido Vols · Den Haag</p>
      </div>
    </div>
  `
}

// Mail 1 — direct bij aanmelden: PDF + welkom
export function welcomeEmail({ name, siteUrl }) {
  const pdfUrl = PDF_URL(siteUrl)
  return {
    subject: 'Je Pre-Selectie Krachttest + Normen',
    html: wrapper('JE GRATIS KRACHTTEST', `
      <p>Hoi ${name},</p>
      <p>Bedankt voor je interesse. Hierbij de <strong>Pre-Selectie Krachttest + Normen</strong> —
      de test die ik gebruik om te bepalen waar iemand fysiek staat ten opzichte van
      selectie-eisen bij Defensie, politie en brandweer.</p>
      <p style="text-align:center; margin: 28px 0;">
        <a href="${pdfUrl}" style="background:#D4A857; color:#000; text-decoration:none; padding:14px 28px; font-weight:bold; letter-spacing:1px; border-radius:4px; display:inline-block;">
          Download de PDF
        </a>
      </p>
      <p>Doe de test rustig op een moment dat je fit bent — niet na een zware training.
      Vergelijk je score met de normen in de PDF om te zien waar je staat.</p>
      <p>Over een paar dagen stuur ik je nog een mail met een uitnodiging voor een
      gratis kennismakingsgesprek, voor het geval je naar aanleiding van je score
      verder wilt met een persoonlijk traject.</p>
      <p>Succes met de test!<br/>Guido</p>
    `),
  }
}

// Mail 2 — 2 dagen later: uitnodiging gratis kennismaking
export function inviteEmail({ name }) {
  return {
    subject: 'Hoe ging de krachttest?',
    html: wrapper('GRATIS KENNISMAKING', `
      <p>Hoi ${name},</p>
      <p>Een paar dagen geleden ontving je de Pre-Selectie Krachttest. Benieuwd hoe
      het ging en hoe je scoorde ten opzichte van de normen.</p>
      <p>Wat je score ook was — als je serieus met je voorbereiding aan de slag wilt,
      praat ik graag vrijblijvend met je over wat daarvoor nodig is. Geen verplichtingen,
      gewoon 30 minuten om te kijken waar je staat en wat een logische volgende stap is.</p>
      <p style="text-align:center; margin: 28px 0;">
        <a href="${CALENDLY_URL}" style="background:#D4A857; color:#000; text-decoration:none; padding:14px 28px; font-weight:bold; letter-spacing:1px; border-radius:4px; display:inline-block;">
          Plan een gratis kennismaking
        </a>
      </p>
      <p>Tot snel,<br/>Guido</p>
    `),
  }
}
