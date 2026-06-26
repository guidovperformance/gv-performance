// Minimale GA4-laag. Tracking gebeurt alleen na cookie-consent (AVG) — zie
// de Analytics/CookieConsent-componenten in app/site-shared.js.

export const GA_MEASUREMENT_ID = 'G-1T977Y8Q88'
const CONSENT_KEY = 'gv_cookie_consent'

export function getConsent() {
  if (typeof window === 'undefined') return null
  try { return localStorage.getItem(CONSENT_KEY) } catch { return null }
}

export function setConsent(value) {
  try { localStorage.setItem(CONSENT_KEY, value) } catch {}
}

export function hasConsent() {
  return getConsent() === 'granted'
}

export function trackEvent(name, params = {}) {
  if (typeof window === 'undefined') return
  if (!hasConsent()) return
  if (typeof window.gtag !== 'function') return
  window.gtag('event', name, params)
}
